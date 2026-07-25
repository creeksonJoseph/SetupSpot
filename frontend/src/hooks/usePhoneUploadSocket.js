import { useState, useEffect } from "react";
import { API } from "./api";

export function usePhoneUploadSocket(isOpen, onImageReceived, onClose) {
  const [sessionId, setSessionId] = useState("");
  const [connected, setConnected] = useState(false);
  const [statusText, setStatusText] = useState("Waiting for phone scan...");
  const [receivedSuccess, setReceivedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const newSessionId = `session_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    setSessionId(newSessionId);
    setReceivedSuccess(false);
    setStatusText("Waiting for phone scan...");

    // Build WebSocket URL
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const backendHost = API.replace(/^https?:\/\//, "");
    const socketUrl = `${wsProtocol}//${backendHost}/ws/upload/${newSessionId}`;

    const socket = new WebSocket(socketUrl);
    let heartbeat = null;

    socket.onopen = () => {
      setConnected(true);
      // Send 30-second heartbeat to keep Render proxy awake
      heartbeat = setInterval(() => {
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
          if (heartbeat) clearInterval(heartbeat);
          socket.close();

          setTimeout(() => {
            onImageReceived(data.image_url);
            onClose();
          }, 800);
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      if (heartbeat) clearInterval(heartbeat);
    };

    return () => {
      if (heartbeat) clearInterval(heartbeat);
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [isOpen, onImageReceived, onClose]);

  const mobileUploadUrl = sessionId
    ? `${window.location.origin}/mobile-upload?session=${sessionId}`
    : "";

  return {
    sessionId,
    connected,
    statusText,
    receivedSuccess,
    mobileUploadUrl,
  };
}
