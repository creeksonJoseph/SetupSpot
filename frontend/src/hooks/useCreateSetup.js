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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthFetch } from './useAuthFetch';
import { useSetupDraft } from './useSetupDraft';
import { API } from './api';

export function useCreateSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = Boolean(editId);

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

  // ─── Hydration (Create Draft or Edit Mode) ──────────────────────────────────
  useEffect(() => {
    if (!editId) {
      // Create mode: load draft if present
      const draft = loadDraft();
      if (!draft?.draft_image_url) return;

      setUploadedImageUrl(draft.draft_image_url);
      setUploadedImageSrc(draft.draft_image_url);
      setSetupName(draft.setup_name ?? '');
      setAnnotations(draft.annotations ?? []);
      setIsAnnotating(true);
      return;
    }

    // Edit mode: fetch existing setup details from backend
    let isMounted = true;
    setLoading(true);
    authFetch(`/setups/${editId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load setup for editing');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setUploadedImageUrl(data.image_url);
        setUploadedImageSrc(data.image_url);
        setSetupName(data.name || '');
        const items = (data.items || []).map((item) => ({
          id: item.id || crypto.randomUUID(),
          name: item.name || '',
          price: item.price != null ? String(item.price) : '',
          link: item.link || '',
          description: item.description || '',
          x: item.x ?? 50,
          y: item.y ?? 50,
        }));
        setAnnotations(items);
        setIsAnnotating(true);
      })
      .catch((err) => {
        if (!isMounted) return;
        setApiMessage({ text: err.message, type: 'error' });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  // ─── Auto-Save Draft (Create mode only) ────────────────────────────────────
  useEffect(() => {
    if (isEditMode || !isAnnotating || !uploadedImageUrl) return;
    saveDraft({
      draft_image_url: uploadedImageUrl,
      setup_name: setupName,
      annotations,
    });
  }, [isEditMode, isAnnotating, uploadedImageUrl, setupName, annotations, saveDraft]);

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
   * Uses XMLHttpRequest instead of fetch() so we can track real upload progress
   * via xhr.upload.onprogress — fetch() has no upload progress API.
   * withCredentials mirrors fetch's credentials:'include' for the HTTP-only auth cookie.
   */
  const handleFileUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      setUploadProgress(0);
      setApiMessage({ text: '', type: '' });

      const formData = new FormData();
      formData.append('file', file, file.name);

      const uploadUrl = `${API}/api/early-upload`;

      await new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        xhr.withCredentials = true; // send HTTP-only auth cookie

        // ── Real upload progress ─────────────────────────────
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            // Reserve the last 5% for server processing / response parsing
            const pct = Math.round((e.loaded / e.total) * 95);
            setUploadProgress(pct);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              const imageUrl = result.image_url;
              setUploadedImageUrl(imageUrl);
              setUploadedImageSrc(imageUrl);
              setUploadProgress(100);
              setTimeout(() => {
                setIsUploading(false);
                setIsAnnotating(true);
              }, 300);
            } catch {
              setIsUploading(false);
              setUploadProgress(0);
              setApiMessage({ text: 'Failed to parse server response.', type: 'error' });
            }
          } else {
            let detail = 'Early upload failed.';
            try {
              detail = JSON.parse(xhr.responseText)?.detail || detail;
            } catch { /* ignore */ }
            setIsUploading(false);
            setUploadProgress(0);
            setApiMessage({ text: `Failed to upload image: ${detail}`, type: 'error' });
          }
          resolve();
        });

        xhr.addEventListener('error', () => {
          setIsUploading(false);
          setUploadProgress(0);
          setApiMessage({ text: 'Network error — could not upload image.', type: 'error' });
          resolve();
        });

        xhr.addEventListener('abort', () => {
          setIsUploading(false);
          setUploadProgress(0);
          resolve();
        });

        xhr.send(formData);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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
  const handleSaveData = useCallback(async () => {
    if (!uploadedImageUrl || !setupName || annotations.length === 0) {
      setApiMessage({
        text: 'Please provide a Setup Name and add at least one item.',
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

    try {
      let response;
      if (isEditMode) {
        response = await authFetch(`/setups/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonPayload),
        });
      } else {
        const formData = new FormData();
        formData.append('image_url', uploadedImageUrl);
        formData.append('data', JSON.stringify(jsonPayload));
        response = await authFetch('/setups', {
          method: 'POST',
          body: formData,
        });
      }

      const result = await response.json();

      if (response.ok) {
        if (!isEditMode) clearDraft();
        setApiMessage({
          text: isEditMode ? 'Setup updated successfully!' : `Setup saved successfully! ID: ${result.id}`,
          type: 'success',
        });
        navigate(isEditMode ? `/setup/${editId}` : `/setup/${result.id}`);
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
  }, [uploadedImageUrl, setupName, annotations, authFetch, navigate, clearDraft, isEditMode, editId]);

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
    isEditMode,
    editId,
  };
}
