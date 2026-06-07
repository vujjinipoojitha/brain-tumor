"""
Lightweight SQLite persistence.
"""

import sqlite3
import uuid
from datetime import datetime
from config import DB_PATH


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_conn() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS hospitals (
            id          TEXT PRIMARY KEY,
            username    TEXT UNIQUE NOT NULL,
            password    TEXT NOT NULL,
            name        TEXT NOT NULL,
            created_at  TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS patients (
            id          TEXT PRIMARY KEY,
            name        TEXT NOT NULL,
            age         INTEGER,
            gender      TEXT,
            contact     TEXT,
            hospital_id TEXT REFERENCES hospitals(id),
            created_at  TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS patient_accounts (
            id          TEXT PRIMARY KEY,
            patient_id  TEXT REFERENCES patients(id),
            username    TEXT UNIQUE NOT NULL,
            password    TEXT NOT NULL,
            created_at  TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS scans (
            id            TEXT PRIMARY KEY,
            case_id       TEXT UNIQUE NOT NULL,
            patient_id    TEXT REFERENCES patients(id),
            hospital_id   TEXT REFERENCES hospitals(id),
            mri_filename  TEXT NOT NULL,
            prediction    TEXT NOT NULL,
            confidence    REAL NOT NULL,
            risk_level    TEXT NOT NULL,
            gradcam_path  TEXT,
            model_used    TEXT NOT NULL,
            explanation   TEXT,
            notes         TEXT DEFAULT '[]',
            treatment_plan TEXT,
            is_emergency  INTEGER DEFAULT 0,
            date          TEXT DEFAULT (datetime('now'))
        );
        """)
        conn.commit()
    print("[DB] Tables ready.")


def new_id() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.utcnow().isoformat()