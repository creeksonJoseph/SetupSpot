/**
 * useCreateSetup — orchestrates the entire Create Setup flow.
 *
 * ### Image Upload Architecture (Early Upload Pattern)
 *
 * Instead of waiting for the user to click "Post" before touching the server,
 * we upload the image the moment they select it:
 *
 *   1. User picks a file → immediately POST to /api/early-upload (auth'd)
 *   2. Backend uploads to Cloudinary 'setupspot/' folder → returns { image_url }
 *   3. We store that URL string (not the File object) in localStorage via useSetupDraft
 *   4. As the user annotates, every state change auto-saves the draft to localStorage
 *   5. On refresh → mount effect reads localStorage, hydrates state, shows the image
 *      from the CDN URL (no File needed)
 *   6. On final "Post" → send image_url + JSON data to POST /setups (no re-upload)
 *   7. On success → clearDraft() removes the localStorage entry
 *
 * ### Orphan Cleanup
 *
 * Images uploaded via /api/early-upload land in Cloudinary's 'setupspot/' folder,
 * the same folder the weekly cleanup cron (`scripts/cleanup_orphaned_images.py`)
 * scans. If the user never finishes posting, the image is automatically deleted
 * within ~7 days (cron runs weekly). No extra configuration needed.
 *
 * ### Phone QR Upload
 *
 * The URL received via WebSocket (handleRemoteImageUrl) is already a live Cloudinary
 * URL from the mobile-upload service — also in 'setupspot/'. We save it directly to
 * the draft state without any re-upload.
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthFetch } from './useAuthFetch';
import { useSetupDraft } from './useSetupDraft';

export function useCreateSetup() {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const { saveDraft, loadDraft, clearDraft } = useSetupDraft();

  const [darkMode] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState({ text: '', type: '' });

  // Early upload progress states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Phone QR upload progress states
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [phoneProgress, setPhoneProgress] = useState(0);

  /**
   * The hosted Cloudinary URL of the uploaded image.
   * This replaces the old `uploadedFile` (raw File object) — we never store
   * File objects in state anymore because they're destroyed on page refresh.
   */
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  /** For the annotation canvas preview — set to the same Cloudinary URL. */
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);

  const [setupName, setSetupName] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);

  const textPrimary = 'text-[#0F172A]';
  const textSecondary = 'text-[#727687]';
  const bgColor = 'bg-[#f7f9fb]';
  const cardBg = 'bg-white border border-[#E2E8F0]';

  const selectedAnnotation = useMemo(
    () => annotations.find((a) => a.id === selectedAnnotationId),
    [annotations, selectedAnnotationId]
  );

  // ─── Draft Hydration on Mount ──────────────────────────────────────────────
  // Runs once when the component mounts. If a draft exists in localStorage,
  // restores all state so the user can continue exactly where they left off.
  useEffect(() => {
    const draft = loadDraft();
    if (!draft?.draft_image_url) return;

    setUploadedImageUrl(draft.draft_image_url);
    setUploadedImageSrc(draft.draft_image_url);
    setSetupName(draft.setup_name ?? '');
    setAnnotations(draft.annotations ?? []);
    setIsAnnotating(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount only

  // ─── Auto-Save Draft ───────────────────────────────────────────────────────
  // Whenever the user is in annotation mode and changes their setup name or
  // annotations, we save the whole draft to localStorage.
  useEffect(() => {
    if (!isAnnotating || !uploadedImageUrl) return;
    saveDraft({
      draft_image_url: uploadedImageUrl,
      setup_name: setupName,
      annotations,
    });
  }, [isAnnotating, uploadedImageUrl, setupName, annotations, saveDraft]);

  // ─── Reset ────────────────────────────────────────────────────────────────
  const resetState = useCallback(() => {
    clearDraft();
    setIsAnnotating(false);
    setAnnotations([]);
    setSelectedAnnotationId(null);
    setUploadedImageSrc(null);
    setUploadedImageUrl(null);
    setSetupName('');
    setApiMessage({ text: '', type: '' });
    setIsUploading(false);
    setUploadProgress(0);
    setIsPhoneLoading(false);
    setPhoneProgress(0);
  }, [clearDraft]);

  // ─── Early Upload (PC file picker) ────────────────────────────────────────
  /**
   * Called the instant the user selects a file.
   * Uploads immediately to /api/early-upload → stores the returned Cloudinary
   * URL (not the File object) so the draft survives a page refresh.
   */
  const handleFileUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      setUploadProgress(20);
      setApiMessage({ text: '', type: '' });

      const formData = new FormData();
      formData.append('file', file, file.name);

      try {
        setUploadProgress(50);
        const response = await authFetch('/api/early-upload', {
          method: 'POST',
          body: formData,
        });

        setUploadProgress(85);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || 'Early upload failed.');
        }

        const imageUrl = result.image_url;
        setUploadedImageUrl(imageUrl);
        setUploadedImageSrc(imageUrl);
        setUploadProgress(100);

        setTimeout(() => {
          setIsUploading(false);
          setIsAnnotating(true);
        }, 300);
      } catch (err) {
        setIsUploading(false);
        setUploadProgress(0);
        setApiMessage({
          text: `Failed to upload image: ${err.message}`,
          type: 'error',
        });
      }
    },
    [authFetch]
  );

  // ─── Remote Image URL (Phone QR path) ─────────────────────────────────────
  /**
   * Called when the desktop WebSocket receives an image URL from the mobile upload.
   * The image is already on Cloudinary (uploaded by the mobile-upload service,
   * also under 'setupspot/'). We save it directly — no re-upload needed.
   */
  const handleRemoteImageUrl = useCallback((imageUrl) => {
    setIsPhoneLoading(true);
    setPhoneProgress(40);

    setUploadedImageUrl(imageUrl);
    setUploadedImageSrc(imageUrl);

    setPhoneProgress(100);
    setIsAnnotating(true);
    setIsPhoneLoading(false);
  }, []);

  // ─── Annotation Interactions ───────────────────────────────────────────────
  const handleImageClick = useCallback(
    (e) => {
      if (!isAnnotating) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newAnnotation = {
        id: crypto.randomUUID(),
        x,
        y,
        name: `New Item ${annotations.length + 1}`,
        price: '',
        link: '',
        description: '',
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
      setSelectedAnnotationId(newAnnotation.id);
    },
    [isAnnotating, annotations.length]
  );

  const handleInputChange = useCallback((id, e) => {
    const { name, value } = e.target;
    setAnnotations((prev) =>
      prev.map((ann) => (ann.id === id ? { ...ann, [name]: value } : ann))
    );
  }, []);

  const handleRemoveAnnotation = useCallback(
    (id) => {
      setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
      if (selectedAnnotationId === id) {
        setSelectedAnnotationId(null);
      }
    },
    [selectedAnnotationId]
  );

  // ─── Final Submission ──────────────────────────────────────────────────────
  /**
   * Sends the pre-uploaded image URL + annotation data to POST /setups.
   * No file upload happens here — the image is already on Cloudinary.
   * On success, clears the localStorage draft.
   */
  const handleSaveData = useCallback(async () => {
    if (!uploadedImageUrl || !setupName || annotations.length === 0) {
      setApiMessage({
        text: 'Please provide a Setup Name, upload an image, and add at least one item.',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    setApiMessage({ text: '', type: '' });

    const itemsPayload = annotations.map((ann) => ({
      name: ann.name,
      price: ann.price,
      link: ann.link,
      description: ann.description || '',
      x: ann.x,
      y: ann.y,
    }));

    const jsonPayload = {
      setup_name: setupName,
      items: itemsPayload,
    };

    // Send the pre-uploaded image URL — no file re-upload
    const formData = new FormData();
    formData.append('image_url', uploadedImageUrl);
    formData.append('data', JSON.stringify(jsonPayload));

    try {
      const response = await authFetch('/setups', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // Clear the draft now that the post is submitted successfully
        clearDraft();
        setApiMessage({
          text: `Setup saved successfully! ID: ${result.id}`,
          type: 'success',
        });
        navigate('/explore');
      } else {
        setApiMessage({
          text: `Error saving setup: ${result.error || result.detail || result.message || 'Unknown error'}`,
          type: 'error',
        });
        console.error('API ERROR RESPONSE:', result);
      }
    } catch (error) {
      setApiMessage({
        text: `Network or server error: ${error.message}. Make sure your backend server is running.`,
        type: 'error',
      });
      console.error('FETCH ERROR:', error);
    } finally {
      setLoading(false);
    }
  }, [uploadedImageUrl, setupName, annotations, authFetch, navigate, clearDraft]);

  // ─── Derived values ───────────────────────────────────────────────────────
  const totalCost = useMemo(() => {
    return annotations
      .reduce((sum, item) => {
        const priceMatch = item.price.replace(/[$,]/g, '').match(/[\d.]+/);
        const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
        return sum + price;
      }, 0)
      .toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }, [annotations]);

  return {
    darkMode,
    isAnnotating,
    loading,
    apiMessage,
    isUploading,
    uploadProgress,
    isPhoneLoading,
    phoneProgress,
    uploadedImageSrc,
    setupName,
    setSetupName,
    annotations,
    selectedAnnotationId,
    setSelectedAnnotationId,
    selectedAnnotation,
    totalCost,
    textPrimary,
    textSecondary,
    bgColor,
    cardBg,
    handleFileUpload,
    handleRemoteImageUrl,
    handleImageClick,
    handleInputChange,
    handleRemoveAnnotation,
    handleSaveData,
    resetState,
  };
}
