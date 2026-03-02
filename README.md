# 🚨 Silent Emergency

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Silent Emergency** is a mission-critical, AI-augmented communication platform designed for individuals in sensitive or high-risk environments. It prioritizes user safety through a dual-interface system: a front-facing stealth camouflage (Calculator) and a backend real-time risk assessment engine that alerts emergency responders via a professional Admin Dashboard.

---

## ✨ Key Features

### 🥷 Stealth Camouflage (Calculator Mode)
- **Zero Latency Toggle**: Instantly switch between the chat interface and a fully functional calculator.
- **Realistic UI**: The calculator provides actual arithmetic operations, making it indistinguishable from a native system utility.
- **Status Persistence**: The underlying chat session remains active and connected via WebSockets even while camouflaged.

### 🧠 AI-Powered Risk Engine
- **Multimodal Analysis**:
    - **Sentiment Analysis**: Leverages `transformers` pipelines to detect negative emotions (Fear, Sadness, Panic).
    - **Behavioral Fingerprinting**: Monitors typing cadence, backspace frequency, and unusual pauses compared to user baselines.
    - **Keyword Heuristics**: Scans for specific distress and critical emergency keywords.
- **Weighted Scoring**: Dynamic risk calculation using a 50/30/20 ratio (Emotion/Behavior/Keywords) with a **Critical Override** for immediate danger signals.

### 📊 Professional Admin Monitor
- **Real-time Oversight**: Live session monitoring via WebSockets.
- **Visual Alerting**: Color-coded risk levels (LOW, MEDIUM, HIGH) with red-highlighting for critical sessions.
- **Direct Intervention**: Admins can send specialized messages directly to the user's chat window to provide guidance or confirmation of help.
- **Session Lifecycle Management**: Track and update session states (ACTIVE, ACKNOWLEDGED, RESOLVED).

---

## 🏗️ AI Architecture & Risk Logic

The core risk assessment is handled by `calculate_risk()` in `ai_engine.py`.

| Component | Weight | Target Metric |
| :--- | :--- | :--- |
| **Emotion Score** | 50% | Sentiment polarity and confidence (Positive vs Negative). |
| **Behavioral Score** | 30% | Deviations from baseline typing speed and backspace counts. |
| **Keyword Score** | 20% | Detection of predefined distress words (e.g., "help", "scared"). |

> [!IMPORTANT]
> **Critical Override**: If "Critical Keywords" (e.g., "911", "immediate danger") are detected, the system immediately forces a Risk Score of **100** and triggers a high-level alert.

---

## 📡 API Documentation

### REST API (Backend)
- `POST /analyze`: Submit message data for real-time risk calculation.
- `GET /admin/logs`: Retrieve historical session logs (Requires Admin Authentication).
- `POST /admin/login`: Secure access to the admin dashboard.
- `POST /admin/intervene`: Send a direct admin message to a user session.
- `PUT /admin/sessions/{id}/status`: Update the state of an active emergency.

### WebSocket Protocols
- `/ws/chat/{session_id}`: Real-time user-to-system messaging.
- `/ws/admin/logs`: Live stream of session updates and risk score changes to the dashboard.

---

## 🛠️ Tech Stack & Dependencies

### Backend
- **FastAPI**: Asynchronous high-performance web framework.
- **HuggingFace Transformers**: Sentiment and emotion analysis models.
- **SQLite**: Local persistent storage for logs and sessions.
- **Uvicorn**: ASGI server for handling WebSockets.

### Frontend
- **React (Vite)**: Component-based UI for high interactivity.
- **React Router**: Seamless navigation between Chat and Admin views.
- **CSS3**: Modern styling with glassmorphism effects and custom animations.

---

## 🚀 Getting Started

### 📦 Prerequisites
- **Python 3.8 to 3.11**
- **Node.js v18+**
- **pip** and **npm**

### 1️⃣ Backend Installation
```bash
cd backend
# Recommended: Create a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install requirements
pip install fastapi uvicorn transformers torch pydantic
# Start the server
python main.py
```

### 2️⃣ Frontend Installation
```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Security & Privacy
- **Camouflage Protocol**: The app header controls allow for instant "panic" toggling.
- **Data Integrity**: Admins must authenticate via a secure token system (`Bearer` token).
- **Session Privacy**: Users are identified by unique session IDs rather than personally identifiable information (PII) where possible.

## Team Members
- P.Srikesh (srikesh-10)
- D.K.Janani (jananiidk)

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
