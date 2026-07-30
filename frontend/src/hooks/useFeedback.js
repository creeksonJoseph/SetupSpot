import { useState, useCallback } from "react";
import { useAuthFetch } from "./useAuthFetch";
import { useToast } from "../context/ToastContext";

export const useFeedback = () => {
  const authFetch = useAuthFetch();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const submitSuggestion = useCallback(
    async (message, category = "feature_suggestion") => {
      if (!message.trim()) return false;
      setSubmitting(true);
      try {
        const res = await authFetch("/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: message.trim(), category }),
        });
        if (!res.ok) throw new Error("Failed to submit suggestion");
        showToast("Thank you! Your suggestion has been sent to our admin team.", "success");
        return true;
      } catch (err) {
        showToast(err.message || "Failed to submit feedback", "error");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [authFetch, showToast]
  );

  return {
    submitting,
    submitSuggestion,
  };
};
