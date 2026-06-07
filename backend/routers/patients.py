"""
Patients router.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List

from utils.auth import require_hospital, require_any_role
from utils.db import get_conn, new_id, now_iso

router = APIRouter()


class PatientCreate(BaseModel):
    name:    str
    age:     Optional[int]   = None
    gender:  Optional[str]   = None
    contact: Optional[str]   = None


class PatientUpdate(BaseModel):
    name:    Optional[str]   = None
    age:     Optional[int]   = None
    gender:  Optional[str]   = None
    contact: Optional[str]   = None


@router.post("/", summary="Register a new patient")
def create_patient(data: PatientCreate, current_user: dict = Depends(require_hospital)):
    pid = new_id()
    hospital_id = current_user.get("sub")
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO patients (id, name, age, gender, contact, hospital_id) VALUES (?,?,?,?,?,?)",
            (pid, data.name, data.age, data.gender, data.contact, hospital_id)
        )
        conn.commit()
    return {"id": pid, "name": data.name, "hospital_id": hospital_id}


@router.get("/", summary="List all patients for the logged-in hospital")
def list_patients(current_user: dict = Depends(require_hospital)):
    hospital_id = current_user.get("sub")
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM patients WHERE hospital_id = ? ORDER BY created_at DESC",
            (hospital_id,)
        ).fetchall()
    return [dict(r) for r in rows]


@router.get("/{patient_id}", summary="Get a single patient record")
def get_patient(patient_id: str, current_user: dict = Depends(require_any_role)):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM patients WHERE id = ?", (patient_id,)
        ).fetchone()
    if not row:
        raise HTTPException(404, "Patient not found")
    if current_user.get("role") == "patient" and current_user.get("sub") != patient_id:
        raise HTTPException(403, "Access denied")
    return dict(row)


@router.put("/{patient_id}", summary="Update patient information")
def update_patient(patient_id: str, data: PatientUpdate,
                   current_user: dict = Depends(require_hospital)):
    fields, values = [], []
    if data.name:    fields.append("name = ?");    values.append(data.name)
    if data.age:     fields.append("age = ?");     values.append(data.age)
    if data.gender:  fields.append("gender = ?");  values.append(data.gender)
    if data.contact: fields.append("contact = ?"); values.append(data.contact)

    if not fields:
        raise HTTPException(400, "No fields to update")

    values.append(patient_id)
    with get_conn() as conn:
        conn.execute(f"UPDATE patients SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()
    return {"message": "Patient updated", "id": patient_id}


@router.delete("/{patient_id}", summary="Delete a patient record")
def delete_patient(patient_id: str, current_user: dict = Depends(require_hospital)):
    with get_conn() as conn:
        conn.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
        conn.commit()
    return {"message": "Patient deleted", "id": patient_id}