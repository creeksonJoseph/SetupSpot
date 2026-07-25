"""
WebSocket Connection Manager for cross-device mobile uploads.
Tracks active connections and session timestamps with strict TTL expiry.
"""
import time
from typing import Dict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.session_timestamps: Dict[str, float] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.session_timestamps[session_id] = time.time()

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.session_timestamps:
            del self.session_timestamps[session_id]

    def is_session_valid(self, session_id: str, max_ttl_seconds: int = 600) -> bool:
        """
        Validates if session exists and is within the allowed TTL (default 10 minutes).
        """
        if session_id not in self.session_timestamps:
            return False
        elapsed = time.time() - self.session_timestamps[session_id]
        return elapsed <= max_ttl_seconds

    async def send_image_url(self, session_id: str, image_url: str) -> bool:
        if session_id in self.active_connections:
            websocket = self.active_connections[session_id]
            try:
                await websocket.send_json({"status": "success", "image_url": image_url})
                return True
            except Exception as exc:
                print(f"WebSocket send error for session '{session_id}': {exc}")
                self.disconnect(session_id)
                return False
        return False


ws_manager = ConnectionManager()
