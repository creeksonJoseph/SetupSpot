import { useState, useEffect, useCallback, useRef } from "react";
import { API } from "./api";

export function usePhoneUploadSocket(onImageReceived) {
  const [isQrActive, setIsQrActive] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [connected, setConnected] = useState(false);
  const [statusText, setStatusText] = useState("Generating QR code...");
  const [receivedSuccess, setReceivedSuccess] = useState(false);

  const socketRef = useRef(null);
  const heartbeatRef = useRef(null);

  // Close and terminate WebSocket connection explicitly
  const stopQrSession = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    if (socketRef.current) {
      if (
        socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING
      ) {
        try {
          socketRef.current.close(1000, "User cancelled QR upload");
        } catch (e) {
          console.error("Error closing socket:", e);
        }
      }
      socketRef.current = null;
    }

    setIsQrActive(false);
    setConnected(false);
    setSessionId("");
    setReceivedSuccess(false);
    setStatusText("Waiting for phone scan...");
  }, []);

  // Start QR session on demand when user clicks button
  const startQrSession = useCallback(() => {
    // Stop any existing socket first
    stopQrSession();

    const newSessionId = `session_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    setSessionId(newSessionId);
    setIsQrActive(true);
    setConnected(false);
    setReceivedSuccess(false);
    setStatusText("Generating QR code...");

    // Build WebSocket URL
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const backendHost = API.replace(/^https?:\/\//, "");
    const socketUrl = `${wsProtocol}//${backendHost}/ws/upload/${newSessionId}`;

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setStatusText("Waiting for phone scan...");

      // Send 30-second heartbeat ping to keep proxy awake
      heartbeatRef.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("ping");
        }
      }, 30000);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === "success" && data.image_url) {
          setReceivedSuccess(true);
          setStatusText("Photo received! Loading into editor...");
          if (heartbeatRef.current) clearInterval(heartbeatRef.current);

          setTimeout(() => {
            onImageReceived(data.image_url);
            stopQrSession();
          }, 800);
        }
      } catch (err) {
        console.error("WebSocket message parse error:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setStatusText("Connection error. Try clicking generate again.");
    };

    socket.onclose = () => {
      setConnected(false);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [stopQrSession, onImageReceived]);

  // Window tab close beforeunload listener failsafe
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close(1000, "Window unloading");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      stopQrSession();
    };
  }, [stopQrSession]);

  const mobileUploadUrl =
    isQrActive && connected && sessionId
      ? `${window.location.origin}/mobile-upload?session=${sessionId}`
      : "";

  return {
    isQrActive,
    sessionId,
    connected,
    statusText,
    receivedSuccess,
    mobileUploadUrl,
    startQrSession,
    stopQrSession,
  };
}
