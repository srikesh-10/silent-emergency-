import sqlite3
import os
from datetime import datetime

DATABASE_URL = "silent_emergency.db"

def init_db():
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    # Create sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            status TEXT DEFAULT 'ACTIVE',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            timestamp TEXT,
            text TEXT,
            sender TEXT,
            risk_score INTEGER,
            emotion TEXT,
            FOREIGN KEY(session_id) REFERENCES sessions(id)
        )
    ''')

    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    return conn

def create_or_update_session(session_id: str, status: str = 'ACTIVE'):
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if session exists
    cursor.execute("SELECT id FROM sessions WHERE id = ?", (session_id,))
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute("UPDATE sessions SET updated_at = CURRENT_TIMESTAMP, status = ? WHERE id = ?", (status, session_id))
    else:
        cursor.execute("INSERT INTO sessions (id, status) VALUES (?, ?)", (session_id, status))
        
    conn.commit()
    conn.close()

def log_message(session_id: str, text: str, sender: str, risk_score: int = 0, emotion: str = ""):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO messages (session_id, timestamp, text, sender, risk_score, emotion)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (session_id, str(datetime.now()), text, sender, risk_score, emotion))
    conn.commit()
    conn.close()
    
def get_all_sessions_with_latest_risk():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            s.id as session_id,
            s.status as session_status,
            s.updated_at,
            (SELECT risk_score FROM messages m WHERE m.session_id = s.id AND m.sender = 'user' ORDER BY id DESC LIMIT 1) as risk_score,
            (SELECT text FROM messages m WHERE m.session_id = s.id AND m.sender = 'user' ORDER BY id DESC LIMIT 1) as last_message,
            (SELECT emotion FROM messages m WHERE m.session_id = s.id AND m.sender = 'user' ORDER BY id DESC LIMIT 1) as last_emotion
        FROM sessions s
        ORDER BY s.updated_at DESC
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]
