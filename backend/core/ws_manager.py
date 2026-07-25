"""
WebSocket Connection Manager for cross-device mobile uploads.
"""
from typing import Dict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]

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
