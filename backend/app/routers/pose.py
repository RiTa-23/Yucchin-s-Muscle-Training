from fastapi import APIRouter, WebSocket

router = APIRouter()

@router.websocket("/pose")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # ここで画像データを受け取り、処理を行う予定
            # 今は単純にエコーバックする
            await websocket.send_text(f"Message received: {len(data)} bytes")
    except Exception as e:
        print(f"Connection error: {e}")
