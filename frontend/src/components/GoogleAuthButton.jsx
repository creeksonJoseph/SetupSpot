import React, { useEffect, useRef, useState } from "react";

export default function GoogleAuthButton({ onSuccess, disabled = false }) {
  const buttonRef = useRef(null);
  const [error, setError] = useState("");
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError(
        "Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to your frontend env.",
      );
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
            await onSuccess(response.credential);
          } catch (err) {
            setError(err?.message || "Google sign-in failed.");
          }
        },
        ux_mode: "popup",
      });

      if (buttonRef.current) {
        // clear any previous content and render the Google button
        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: "100%",
        });

        // small adjustment after render to ensure the injected button fills the container
        setTimeout(() => {
          try {
            const child = buttonRef.current.firstElementChild;
            if (child && child.style) {
              child.style.width = "100%";
              child.style.display = "block";
              child.style.boxSizing = "border-box";
              // remove any unexpected min-height from placeholder
              buttonRef.current.style.minHeight = "0";
              buttonRef.current.style.display = "block";
            }
          } catch (e) {
            // ignore styling errors
          }
          setRendered(true);
        }, 40);
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
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onSuccess]);

  return (
    <div className="w-full">
      {error ? <p className="mb-2 text-sm text-red-400">{error}</p> : null}
      <div
        ref={buttonRef}
        className={`w-full ${disabled ? "opacity-60" : ""} ${rendered ? "" : "min-h-[36px]"}`}
      />
    </div>
  );
}
