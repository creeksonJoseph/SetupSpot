import React, { useEffect, useRef, useState } from "react";

export default function GoogleAuthButton({ onSuccess, disabled = false }) {
  const buttonRef = useRef(null);
  const [error, setError] = useState("");
  const [rendered, setRendered] = useState(false);

  const onSuccessRef = useRef(onSuccess);
  useEffect(() => { onSuccessRef.current = onSuccess; });

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to your frontend env.");
      return;
    }

    const initialize = () => {
      if (!window.google?.accounts?.id) {
        setError("Google sign-in script could not be loaded.");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response?.credential) {
            setError("Google sign-in was canceled.");
            return;
          }
          try {
            await onSuccessRef.current(response.credential);
          } catch (err) {
            setError(err?.message || "Google sign-in failed.");
          }
        },
        ux_mode: "popup",
      });

      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 360,
        });
        setTimeout(() => setRendered(true), 40);
      }
    };

    if (window.google?.accounts?.id) {
      initialize();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    script.onerror = () => setError("Unable to load Google sign-in.");
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []); // runs once — onSuccess changes are handled via ref

  return (
    <div className={`w-full flex justify-center ${disabled ? "opacity-60 pointer-events-none" : ""}`}>
      {error ? <p className="mb-2 text-sm text-red-400">{error}</p> : null}
      <div ref={buttonRef} className={rendered ? "" : "min-h-[44px]"} />
    </div>
  );
}
