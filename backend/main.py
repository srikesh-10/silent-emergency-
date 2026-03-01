from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Query, Header
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json

from ai_engine import calculate_risk, get_model
import database

app = FastAPI()

# Dummy credentials
ADMIN_PASS = "admin123"
ADMIN_TOKEN = "secret-admin-token"

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_admin_connections: list[WebSocket] = []
        self.active_user_connections: dict[str, WebSocket] = {}

    async def connect_admin(self, websocket: WebSocket):
        await websocket.accept()
        self.active_admin_connections.append(websocket)

    def disconnect_admin(self, websocket: WebSocket):
        if websocket in self.active_admin_connections:
            self.active_admin_connections.remove(websocket)

    async def broadcast_admin(self, message: dict):
        for connection in self.active_admin_connections:
            await connection.send_json(message)
            
    async def connect_user(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_user_connections[session_id] = websocket

    def disconnect_user(self, session_id: str):
        if session_id in self.active_user_connections:
            del self.active_user_connections[session_id]

    async def send_to_user(self, session_id: str, message: dict):
        if session_id in self.active_user_connections:
            await self.active_user_connections[session_id].send_json(message)

manager = ConnectionManager()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow everything for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Preload model at startup
@app.on_event("startup")
def load_model():
    database.init_db()
    get_model()
    print("Model and Database loaded successfully.")


class ChatRequest(BaseModel):
    session_id: str
    message: str
    typing_speed: float
    backspaces: int
    pause_time: float
    baseline_speed: float = 0
    baseline_backspaces: float = 0
    baseline_pause: float = 0


class LoginRequest(BaseModel):
    password: str

class InterveneRequest(BaseModel):
    session_id: str
    message: str

class StatusUpdateRequest(BaseModel):
    status: str


@app.post("/admin/login")
def login(data: LoginRequest):
    if data.password == ADMIN_PASS:
        return {"token": ADMIN_TOKEN}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect password"
    )


def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")
    return token


@app.get("/")
def home():
    return {"status": "Silent Emergency Backend Running"}


@app.post("/analyze")
async def analyze(data: ChatRequest):
    result = calculate_risk(
        data.message,
        data.typing_speed,
        data.backspaces,
        data.pause_time,
        data.baseline_speed,
        data.baseline_backspaces,
        data.baseline_pause
    )

    # Database updates
    database.create_or_update_session(data.session_id, "ACTIVE")
    
    # Log user message
    database.log_message(
        session_id=data.session_id,
        text=data.message,
        sender="user",
        risk_score=result["risk_score"],
        emotion=result.get("emotion_label", "")
    )
    
    # Log system reply
    database.log_message(
        session_id=data.session_id,
        text=result["reply"],
        sender="system"
    )

    # Broadcast to admin websockets
    # The admin dashboard expects a specific format to update its table
    log_entry = {
        "session_id": data.session_id,
        "timestamp": str(datetime.now()),
        "message": data.message,
        "risk_score": result["risk_score"],
        "level": result["level"],
        "session_status": "ACTIVE"
    }
    await manager.broadcast_admin(log_entry)

    return result


@app.get("/admin/logs")
def get_logs(token: str = Depends(verify_token)):
    # Now fetches aggregated sessions from the database
    return database.get_all_sessions_with_latest_risk()

@app.post("/admin/intervene")
async def admin_intervene(data: InterveneRequest, token: str = Depends(verify_token)):
    # Log admin message
    database.log_message(data.session_id, data.message, "admin")
    # Send to specific user via WS
    await manager.send_to_user(data.session_id, {"type": "admin_message", "text": data.message})
    return {"status": "sent"}

@app.put("/admin/sessions/{session_id}/status")
def update_session_status(session_id: str, data: StatusUpdateRequest, token: str = Depends(verify_token)):
    database.create_or_update_session(session_id, data.status)
    return {"status": "updated"}

@app.websocket("/ws/chat/{session_id}")
async def user_websocket(websocket: WebSocket, session_id: str):
    await manager.connect_user(websocket, session_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_user(session_id)

@app.websocket("/ws/admin/logs")
async def admin_websocket_endpoint(websocket: WebSocket, token: str = Query(None)):
    if token != ADMIN_TOKEN:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    await manager.connect_admin(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_admin(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)