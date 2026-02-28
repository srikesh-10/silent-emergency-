from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json

from ai_engine import calculate_risk, get_model

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Preload model at startup
@app.on_event("startup")
def load_model():
    get_model()
    print("Model loaded successfully.")


class ChatRequest(BaseModel):
    message: str
    typing_speed: float
    backspaces: int
    pause_time: float


@app.get("/")
def home():
    return {"status": "Silent Emergency Backend Running"}


@app.post("/analyze")
async def analyze(data: ChatRequest):
    result = calculate_risk(
        data.message,
        data.typing_speed,
        data.backspaces,
        data.pause_time
    )

    log_entry = {
        "timestamp": str(datetime.now()),
        "message": data.message,
        "typing_speed": data.typing_speed,
        "backspaces": data.backspaces,
        "pause_time": data.pause_time,
        "risk_score": result["risk_score"],
        "level": result["level"]
    }

    with open("logs.json", "a") as f:
        f.write(json.dumps(log_entry) + "\n")

    return result


@app.get("/admin/logs")
def get_logs():
    logs = []
    try:
        with open("logs.json", "r") as f:
            for line in f:
                logs.append(json.loads(line))
    except:
        pass

    return logs