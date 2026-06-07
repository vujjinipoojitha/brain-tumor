"""
TumORnot — routers/auth.py
Hospital and patient authentication endpoints.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
import sqlite3
from pathlib import Path
from utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter()

# ── DB path ───────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "tumornot.db"


def get_conn():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


# ── Schemas ───────────────────────────────────────────────────────────────────
class HospitalRegister(BaseModel):
    username: str
    password: str
    name: str


class HospitalLogin(BaseModel):
    username: str
    password: str


class PatientRegister(BaseModel):
    username: str
    password: str
    name: str


class PatientLogin(BaseModel):
    username: str
    password: str


# ══════════════════════════════════════════════════════════════════════════════
#  HOSPITAL AUTH
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/hospital/register", summary="Register a new hospital account")
def hospital_register(data: HospitalRegister):
    conn = get_conn()
    try:
        # Check if username already taken
        existing = conn.execute(
            "SELECT id FROM hospitals WHERE username = ?", (data.username,)
        ).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")

        hashed = hash_password(data.password)
        conn.execute(
            "INSERT INTO hospitals (username, password, name) VALUES (?, ?, ?)",
            (data.username, hashed, data.name),
        )
        conn.commit()
        return {"message": f"Hospital '{data.name}' registered successfully"}
    finally:
        conn.close()


@router.post("/hospital/login", summary="Hospital login — returns JWT token")
def hospital_login(data: HospitalLogin):
    conn = get_conn()
    try:
        row = conn.execute(
            "SELECT * FROM hospitals WHERE username = ?", (data.username,)
        ).fetchone()

        if not row or not verify_password(data.password, row["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        token = create_access_token(
            {"sub": str(row["id"]), "username": row["username"], "role": "hospital"}
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "hospital_name": row["name"],
            "hospital_id": row["id"],
        }
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════════════════
#  PATIENT AUTH
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/patient/register", summary="Register a new patient account")
def patient_register(data: PatientRegister):
    conn = get_conn()
    try:
        existing = conn.execute(
            "SELECT id FROM patient_users WHERE username = ?", (data.username,)
        ).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")

        hashed = hash_password(data.password)
        conn.execute(
            "INSERT INTO patient_users (username, password, name) VALUES (?, ?, ?)",
            (data.username, hashed, data.name),
        )
        conn.commit()
        return {"message": f"Patient '{data.name}' registered successfully"}
    finally:
        conn.close()


@router.post("/patient/login", summary="Patient login — returns JWT token")
def patient_login(data: PatientLogin):
    conn = get_conn()
    try:
        row = conn.execute(
            "SELECT * FROM patient_users WHERE username = ?", (data.username,)
        ).fetchone()

        if not row or not verify_password(data.password, row["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )

        token = create_access_token(
            {"sub": str(row["id"]), "username": row["username"], "role": "patient"}
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "patient_name": row["name"],
            "patient_id": row["id"],
        }
    finally:
        conn.close()


# ══════════════════════════════════════════════════════════════════════════════
#  /ME endpoint
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/me", summary="Get current logged-in user info")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user