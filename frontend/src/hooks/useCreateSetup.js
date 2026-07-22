import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthFetch } from './useAuthFetch';

export function useCreateSetup() {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();

  const [darkMode] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState({ text: '', type: '' });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadedFile, setUploadedFile] = useState(null);
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

  const resetState = useCallback(() => {
    setIsAnnotating(false);
    setAnnotations([]);
    setSelectedAnnotationId(null);
    setUploadedImageSrc(null);
    setUploadedFile(null);
    setSetupName('');
    setApiMessage({ text: '', type: '' });
    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    reader.onloadend = () => {
      setUploadProgress(100);
      setTimeout(() => {
        setUploadedImageSrc(reader.result);
        setIsUploading(false);
        setIsAnnotating(true);
      }, 400);
    };

    reader.readAsDataURL(file);
  }, []);

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

  const handleSaveData = useCallback(async () => {
    if (!uploadedFile || !setupName || annotations.length === 0) {
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

    const formData = new FormData();
    formData.append('file', uploadedFile, uploadedFile.name);
    formData.append('data', JSON.stringify(jsonPayload));

    try {
      const response = await authFetch('/setups', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setApiMessage({
          text: `Setup saved successfully! ID: ${result.id}`,
          type: 'success',
        });
        navigate('/explore');
      } else {
        setApiMessage({
          text: `Error saving setup: ${result.error || result.message || 'Unknown error'}`,
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
  }, [uploadedFile, setupName, annotations, authFetch, navigate]);

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
    handleImageClick,
    handleInputChange,
    handleRemoveAnnotation,
    handleSaveData,
    resetState,
  };
}
