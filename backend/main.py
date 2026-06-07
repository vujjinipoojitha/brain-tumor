"""
TumORnot - Brain Tumour Detection Backend
FastAPI + PyTorch + Grad-CAM
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import auth, predict, patients, scans
from utils.db import init_db

app = FastAPI(
    title="TumORnot API",
    description="Brain Tumour Detection using Deep Learning & Grad-CAM",
    version="1.0.0"
)

# ── CORS (allow your React dev server) ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files for Grad-CAM images ────────────────────────────────────────
app.mount("/static", StaticFiles(directory="static"), name="static")

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api/auth",     tags=["Authentication"])
app.include_router(predict.router,  prefix="/api/predict",  tags=["Prediction"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(scans.router,    prefix="/api/scans",    tags=["Scans"])


@app.on_event("startup")
async def startup_event():
    init_db()  # Initialise SQLite tables


@app.get("/")
async def root():
    return {"message": "TumORnot API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}