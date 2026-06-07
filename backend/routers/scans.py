"""
TumORnot — routers/scans.py
Returns scan history from SQLite database.
Uses direct sqlite3 — no get_db dependency needed.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import sqlite3
from pathlib import Path

router = APIRouter(prefix="/api/scans", tags=["Scans"])

# ── DB path ───────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "tumornot.db"


def get_connection():
    """Open a sqlite3 connection with row_factory for dict-like access."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


# ── Schema ────────────────────────────────────────────────────────────────────
class ScanRecord(BaseModel):
    id: int
    case_id: str
    patient_id: Optional[str] = None
    prediction: str
    confidence: float
    risk_level: Optional[str] = None
    explanation: Optional[str] = None
    gradcam_url: Optional[str] = None
    is_emergency: Optional[bool] = False
    model_used: Optional[str] = None
    date: Optional[str] = None


# ── GET /api/scans/ ───────────────────────────────────────────────────────────
@router.get("/", response_model=List[ScanRecord], summary="Get all scans")
def get_all_scans(patient_id: Optional[str] = None):
    """
    Returns scan history. Optionally filter by patient_id query param.
    Returns empty list gracefully if scans table doesn't exist yet.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()

        if patient_id:
            cursor.execute(
                "SELECT * FROM scans WHERE patient_id = ? ORDER BY date DESC",
                (patient_id,)
            )
        else:
            cursor.execute("SELECT * FROM scans ORDER BY date DESC")

        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

    except sqlite3.OperationalError as e:
        if "no such table" in str(e):
            return []
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


# ── GET /api/scans/{patient_id} ───────────────────────────────────────────────
@router.get("/{patient_id}", response_model=List[ScanRecord], summary="Get scans for a patient")
def get_scans_for_patient(patient_id: str):
    """Returns all scans for a specific patient."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM scans WHERE patient_id = ? ORDER BY date DESC",
            (patient_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

    except sqlite3.OperationalError as e:
        if "no such table" in str(e):
            return []
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")