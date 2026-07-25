import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { API } from "./api";

export function useMobileUpload() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file.");
        return;
      }
      setError("");
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSuccess(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !sessionId) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("session_id", sessionId);
      formData.append("file", selectedFile);

      const res = await fetch(`${API}/api/mobile-upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to upload photo.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to send photo to desktop.");
    } finally {
      setUploading(false);
    }
  };

  const resetSelection = () => {
    setSuccess(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
  };

  return {
    sessionId,
    selectedFile,
    previewUrl,
    uploading,
    success,
    error,
    handleFileChange,
    handleUpload,
    resetSelection,
  };
}
