import { useState, useEffect, useCallback, useRef } from "react";
import { API } from "./api";

/** How long the "scan this new code" badge stays visible after a reconnect. */
const RECONNECTED_BADGE_MS = 6_000;

/**
 * After the socket drops, if the user hasn't acted within this many ms,
 * switch to the "idle" state — stop showing the expired overlay with a
 * Regenerate button and instead show a single large call-to-action.
 * This avoids burning server resources on repeated reconnects while the
 * user is away from their desk.
 */
const IDLE_TIMEOUT_MS = 60_000;

export function usePhoneUploadSocket(onImageReceived) {
  const [isQrActive, setIsQrActive] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [connected, setConnected] = useState(false);
  const [statusText, setStatusText] = useState("Generating QR code...");
  const [receivedSuccess, setReceivedSuccess] = useState(false);

  // ── Expiry / reconnect states ─────────────────────────────────────────────
  /** True once the socket closes before an image was received. */
  const [isExpired, setIsExpired] = useState(false);
  /** True during the window between clicking "Regenerate" and the new socket opening. */
  const [isReconnecting, setIsReconnecting] = useState(false);
  /** Briefly true after a successful reconnect — drives the "scan new code" badge. */
  const [justReconnected, setJustReconnected] = useState(false);
  /**
   * True after IDLE_TIMEOUT_MS of being expired with no user action.
   * Switches the overlay from the quick-regenerate state to the
   * "manual click required" state to avoid wasting server connections.
   */
  const [isIdleTimeout, setIsIdleTimeout] = useState(false);

  const socketRef = useRef(null);
  const heartbeatRef = useRef(null);
  const idleTimerRef = useRef(null);
  const reconnectedTimerRef = useRef(null);

  // ── Low-level socket teardown (no state reset) ────────────────────────────
  const _closeSocket = useCallback(() => {
    if (heartbeatRef.current) { clearInterval(heartbeatRef.current); heartbeatRef.current = null; }
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
    if (reconnectedTimerRef.current) { clearTimeout(reconnectedTimerRef.current); reconnectedTimerRef.current = null; }
    if (socketRef.current) {
      if (
        socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING
      ) {
        try { socketRef.current.close(1000, "Session reset"); } catch {}
      }
      socketRef.current = null;
    }
  }, []);

  // ── Full cancel (user clicks Cancel) ─────────────────────────────────────
  const stopQrSession = useCallback(() => {
    _closeSocket();
    setIsQrActive(false);
    setConnected(false);
    setSessionId("");
    setReceivedSuccess(false);
    setIsExpired(false);
    setIsReconnecting(false);
    setJustReconnected(false);
    setIsIdleTimeout(false);
    setStatusText("Waiting for phone scan...");
  }, [_closeSocket]);

  // ── Start / regenerate a QR session ──────────────────────────────────────
  /**
   * Works for both first-time generation and regeneration after expiry.
   * When called from an expired state, activates the "reconnecting" overlay
   * and shows the "scan new code" badge once the socket opens.
   *
   * NOTE: isExpired is in the dep array so the closure always captures the
   * current value; React recreates this callback only when isExpired toggles,
   * which is at most twice per session lifecycle.
   */
  const startQrSession = useCallback(() => {
    // Capture BEFORE any state resets so the new socket's onopen knows.
    const isRegenerate = isExpired;

    _closeSocket();

    const newSessionId = `session_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    setSessionId(newSessionId);
    setIsQrActive(true);
    setConnected(false);
    setReceivedSuccess(false);
    setIsExpired(false);
    setIsIdleTimeout(false);
    setJustReconnected(false);
    // Show "reconnecting" overlay while the new socket is opening
    setIsReconnecting(isRegenerate);
    setStatusText("Generating QR code...");

    const isSecureApi = API.startsWith("https:");
    const wsProtocol = isSecureApi ? "wss:" : "ws:";
    const backendHost = API.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const socketUrl = `${wsProtocol}//${backendHost}/ws/upload/${newSessionId}`;

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setStatusText("Waiting for phone scan...");

      if (isRegenerate) {
        // Reveal the fresh QR and show the contextual "scan new code" badge
        setIsReconnecting(false);
        setJustReconnected(true);
        reconnectedTimerRef.current = setTimeout(
          () => setJustReconnected(false),
          RECONNECTED_BADGE_MS
        );
      }

      // 30-second heartbeat to keep Render proxy awake
      heartbeatRef.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) socket.send("ping");
      }, 30000);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === "pong") return;
        if (data.status === "success" && data.image_url) {
          setReceivedSuccess(true);
          setStatusText("Photo received! Loading into editor...");
          if (heartbeatRef.current) clearInterval(heartbeatRef.current);
          onImageReceived(data.image_url);
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

      // Only mark expired if the image wasn't already received
      setReceivedSuccess((prev) => {
        if (!prev) {
          setIsReconnecting(false);
          setIsExpired(true);
          // Start idle countdown — if user doesn't act, switch to manual-click mode
          idleTimerRef.current = setTimeout(
            () => setIsIdleTimeout(true),
            IDLE_TIMEOUT_MS
          );
        }
        return prev;
      });
    };
  }, [_closeSocket, onImageReceived, isExpired]);

  // ── Page-unload failsafe ──────────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
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
    isExpired,
    isReconnecting,
    justReconnected,
    isIdleTimeout,
    mobileUploadUrl,
    startQrSession,
    stopQrSession,
  };
}
