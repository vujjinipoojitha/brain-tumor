"""
Configuration – edit these values to match your environment.
"""

import os
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR      = Path(__file__).parent
MODELS_DIR    = BASE_DIR / "models"
STATIC_DIR    = BASE_DIR / "static"
GRADCAM_DIR   = STATIC_DIR / "gradcam"
DB_PATH       = BASE_DIR / "tumornot.db"

# Create dirs if absent
GRADCAM_DIR.mkdir(parents=True, exist_ok=True)

# ── Model file names (place .pth files inside /models/) ──────────────────────
MODEL_PATHS = {
    "resnet50":    MODELS_DIR / "resnet50_weights_final.pth",
    "densenet121": MODELS_DIR / "densenet_weights_final.pth",
    "vgg16":       MODELS_DIR / "vgg16_weights_final.pth",
}
# Default model used for prediction
DEFAULT_MODEL = "resnet50"

# ── Image settings ────────────────────────────────────────────────────────────
IMAGE_SIZE   = (224, 224)
ALLOWED_EXTS = {".jpg", ".jpeg", ".png"}

# ── Classification thresholds ─────────────────────────────────────────────────
TUMOR_THRESHOLD = 0.5   # probability ≥ this → "Tumor"

# Risk levels derived from confidence
RISK_LEVELS = {
    "high":      (0.85, 1.01),   # confidence 85-100 %
    "moderate":  (0.65, 0.85),
    "low":       (0.50, 0.65),
    "uncertain": (0.00, 0.50),
}

# ── JWT / Auth ────────────────────────────────────────────────────────────────
SECRET_KEY        = os.getenv("SECRET_KEY", "CHANGE_ME_IN_PRODUCTION_32_CHARS!")
ALGORITHM         = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8   # 8-hour tokens