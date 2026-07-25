"""
Mobile Upload Router — thin presentation layer for WebSockets and mobile upload HTTP endpoints.
"""
from fastapi import APIRouter, File, Form, UploadFile, WebSocket, WebSocketDisconnect

from core.ws_manager import ws_manager
from services import mobile_upload_service

router = APIRouter(tags=["mobile-upload"])


@router.websocket("/ws/upload/{session_id}")
async def websocket_upload_endpoint(websocket: WebSocket, session_id: str):
    """
    Desktop WebSocket endpoint. Listens for mobile upload completions
    and handles keep-alive 'ping' frames to prevent Render proxy timeouts.
    """
    await ws_manager.connect(websocket, session_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                # Render proxy heartbeat acknowledge
                continue
    except WebSocketDisconnect:
        ws_manager.disconnect(session_id)
    except Exception as exc:
        print(f"WebSocket error in session '{session_id}': {exc}")
        ws_manager.disconnect(session_id)


@router.post("/api/mobile-upload", status_code=200)
async def handle_mobile_upload(
    session_id: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Mobile upload endpoint. Delegates file upload & real-time WebSocket push to service layer.
    """
    return await mobile_upload_service.process_mobile_upload(file=file, session_id=session_id)
