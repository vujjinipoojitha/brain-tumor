"""
Prediction service.
Runs model inference + Grad-CAM and returns a structured result dict.
"""

import torch
from PIL import Image

from config import TUMOR_THRESHOLD, RISK_LEVELS, DEFAULT_MODEL
from models.model_loader import load_model
from utils.image_utils import bytes_to_tensor, bytes_to_pil
from services.gradcam_service import generate_and_save_gradcam


def _get_risk_level(confidence: float, prediction: str) -> str:
    """Map confidence score → clinical risk level string."""
    if prediction == "No Tumor":
        return "none"
    for level, (lo, hi) in RISK_LEVELS.items():
        if lo <= confidence < hi:
            return level
    return "uncertain"


def _build_explanation(prediction: str, confidence: float, risk_level: str, model_name: str) -> str:
    pct = round(confidence * 100, 1)
    if prediction == "Tumor":
        return (
            f"The {model_name} model detected findings consistent with a brain tumour "
            f"with {pct}% confidence (risk level: {risk_level.upper()}). "
            f"The highlighted regions in the Grad-CAM heatmap indicate the areas most "
            f"influential in this classification. Please consult a qualified radiologist "
            f"for clinical validation."
        )
    else:
        return (
            f"The {model_name} model found no significant tumour indicators "
            f"with {pct}% confidence. "
            f"This is a preliminary AI screening result and does not replace "
            f"professional medical diagnosis."
        )


def run_prediction(image_bytes: bytes, model_name: str = DEFAULT_MODEL) -> dict:
    """
    Full pipeline:
      1. Load model
      2. Pre-process image
      3. Inference
      4. Grad-CAM
      5. Return result dict

    Returns:
        {
            prediction:   "Tumor" | "No Tumor",
            confidence:   float (0-1),
            risk_level:   str,
            gradcam_url:  str (relative URL),
            model_used:   str,
            explanation:  str,
        }
    """
    model, target_layer = load_model(model_name)

    # Pre-process
    tensor      = bytes_to_tensor(image_bytes)                  # (1,3,224,224)
    original_pil = bytes_to_pil(image_bytes)

    # ── Inference ──────────────────────────────────────────────────────────────
    # We need gradients for Grad-CAM, so keep the graph
    tensor.requires_grad_(True)
    output = model(tensor)                                        # (1,1) sigmoid
    

    prediction = "Tumor" if prob >= TUMOR_THRESHOLD else "No Tumor"
    confidence = prob if prediction == "Tumor" else (1.0 - prob)
    prob = torch.softmax(output, dim=1)[0][1].item()
    # ── Grad-CAM ───────────────────────────────────────────────────────────────
    gradcam_url = generate_and_save_gradcam(
        model=model,
        target_layer_name=target_layer,
        input_tensor=tensor,
        original_pil=original_pil,
    )

    risk_level  = _get_risk_level(confidence, prediction)
    explanation = _build_explanation(prediction, confidence, risk_level, model_name)

    return {
        "prediction":  prediction,
        "confidence":  round(confidence, 4),
        "risk_level":  risk_level,
        "gradcam_url": gradcam_url,
        "model_used":  model_name,
        "explanation": explanation,
    }