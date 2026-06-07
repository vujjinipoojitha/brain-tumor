"""
TumORnot - predict.py
Complete router for MRI prediction + Grad-CAM++
"""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends
from typing import Optional
import uuid
import os
import io
import torch
import torch.nn as nn
import numpy as np
import cv2
from PIL import Image
from torchvision import models, transforms
from pathlib import Path

# ── Router ────────────────────────────────────────────────────────────────────
router = APIRouter()

# ── Config ────────────────────────────────────────────────────────────────────
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
IMAGE_SIZE = 224
DEFAULT_MODEL = "resnet50"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
STATIC_DIR = BASE_DIR / "static" / "gradcam"

# Make sure gradcam output folder exists
STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Model weight files (matching your trained filenames)
MODEL_WEIGHTS = {
    "resnet50":    "resnet50_weights_final2.pth",
    "densenet121": "densenet_weights_final.pth",
    "vgg16":       "vgg16_weights_final.pth",
}

# Risk level thresholds
def get_risk_level(confidence: float, prediction: str) -> str:
    if prediction == "No Tumor":
        return "NONE"
    if confidence >= 0.85:
        return "HIGH"
    elif confidence >= 0.65:
        return "MODERATE"
    elif confidence >= 0.50:
        return "LOW"
    return "UNCERTAIN"

# ── Model loader (cached) ─────────────────────────────────────────────────────
_model_cache = {}

def load_model(model_name: str):
    if model_name in _model_cache:
        return _model_cache[model_name]

    weights_file = MODEL_WEIGHTS.get(model_name)
    if not weights_file:
        raise HTTPException(400, f"Unknown model: {model_name}")

    weights_path = MODELS_DIR / weights_file
    if not weights_path.exists():
        alt_path = BASE_DIR / "backend" / "models" / weights_file
        if alt_path.exists():
            weights_path = alt_path
        else:
            raise HTTPException(500, f"Weights not found: {weights_file}")

    if model_name == "resnet50":
        model = models.resnet50(weights=None)
        model.fc = nn.Sequential(
            nn.Linear(model.fc.in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 2)
        )
        # ResNet50: last conv block — works well for Grad-CAM++
        target_layer_name = "layer4"

    elif model_name == "densenet121":
        model = models.densenet121(weights=None)
        model.classifier = nn.Sequential(
            nn.Linear(model.classifier.in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 2)
        )
        # DenseNet121: last conv layer inside the final dense block
        # "features" is too broad — must target the last conv layer specifically
        target_layer_name = "features.denseblock4.denselayer16.conv2"

    elif model_name == "vgg16":
        model = models.vgg16(weights=None)
        model.classifier[6] = nn.Sequential(
            nn.Linear(4096, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 2)
        )
        # VGG16: last conv layer before the classifier
        target_layer_name = "features.28"

    else:
        raise HTTPException(400, f"Unknown model: {model_name}")

    state_dict = torch.load(weights_path, map_location=DEVICE)
    model.load_state_dict(state_dict)
    model.to(DEVICE)
    model.eval()

    _model_cache[model_name] = (model, target_layer_name)
    print(f"[Model] Loaded {model_name} from {weights_path}")
    print(f"[Model] Grad-CAM++ target layer: {target_layer_name}")
    return model, target_layer_name


# ── Image preprocessing ───────────────────────────────────────────────────────
def preprocess_image(image_bytes: bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])
    tensor = transform(img).unsqueeze(0).to(DEVICE)
    return img, tensor


# ── OLD Grad-CAM (DISABLED — kept for reference) ──────────────────────────────
# def generate_gradcam_v1(model, target_layer_name, input_tensor, pred_class, original_img):
#     activations = {}
#     gradients = {}
#
#     def forward_hook(module, inp, out):
#         activations["value"] = out
#
#     def backward_hook(module, grad_in, grad_out):
#         gradients["value"] = grad_out[0]
#
#     target_layer = None
#     for name, module in model.named_modules():
#         if name == target_layer_name:
#             target_layer = module
#             break
#
#     if target_layer is None:
#         return None
#
#     h_f = target_layer.register_forward_hook(forward_hook)
#     h_b = target_layer.register_backward_hook(backward_hook)
#
#     output = model(input_tensor)
#     model.zero_grad()
#     one_hot = torch.zeros_like(output)
#     one_hot[0][pred_class] = 1
#     output.backward(gradient=one_hot, retain_graph=True)
#
#     h_f.remove()
#     h_b.remove()
#
#     grads = gradients["value"]
#     acts = activations["value"]
#     weights = grads.mean(dim=[2, 3], keepdim=True)
#     cam = (weights * acts).sum(dim=1, keepdim=True)
#     cam = torch.relu(cam)
#
#     if cam.max() > 0:
#         cam = cam / cam.max()
#
#     heatmap = cam.squeeze().cpu().detach().numpy()
#     orig_w, orig_h = original_img.size
#     heatmap = cv2.resize(heatmap, (orig_w, orig_h))
#     heatmap_uint8 = (heatmap * 255).astype(np.uint8)
#     heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
#     orig_np = np.array(original_img)
#     orig_bgr = cv2.cvtColor(orig_np, cv2.COLOR_RGB2BGR)
#     overlay = cv2.addWeighted(orig_bgr, 0.5, heatmap_colored, 0.5, 0)
#     filename = f"gradcam_{uuid.uuid4().hex[:8]}.jpg"
#     save_path = STATIC_DIR / filename
#     cv2.imwrite(str(save_path), overlay)
#     return f"http://localhost:8000/static/gradcam/{filename}"
# ── END OLD Grad-CAM ──────────────────────────────────────────────────────────


# ── Grad-CAM++ (ACTIVE) ───────────────────────────────────────────────────────
def generate_gradcam(model, target_layer_name: str, input_tensor, pred_class: int, original_img):
    """
    Grad-CAM++ implementation.
    Improvements over Grad-CAM:
    - More precise localization of tumor regions
    - Better at detecting multiple tumor instances in one scan
    - Uses second-order gradients (alpha weights) for more accurate heatmaps
    - Automatically falls back to basic Grad-CAM if something fails
    """
    activations = {}
    gradients   = {}

    def forward_hook(module, inp, out):
        activations["value"] = out.detach()

    def backward_hook(module, grad_in, grad_out):
        gradients["value"] = grad_out[0].detach()

    # Find the target convolutional layer by name
    target_layer = None
    for name, module in model.named_modules():
        if name == target_layer_name:
            target_layer = module
            break

    if target_layer is None:
        print(f"[Grad-CAM++] Target layer '{target_layer_name}' not found.")
        return None

    h_f = target_layer.register_forward_hook(forward_hook)
    h_b = target_layer.register_full_backward_hook(backward_hook)

    try:
        # ── Forward pass ──────────────────────────────────────────────────
        output = model(input_tensor)
        model.zero_grad()

        # Target the predicted class
        one_hot = torch.zeros_like(output)
        one_hot[0][pred_class] = 1

        # ── Backward pass ─────────────────────────────────────────────────
        output.backward(gradient=one_hot, retain_graph=True)

        h_f.remove()
        h_b.remove()

        grads = gradients["value"]    # [1, C, H, W]
        acts  = activations["value"]  # [1, C, H, W]

        # ── Grad-CAM++ alpha weight calculation ───────────────────────────
        grads_sq  = grads ** 2
        grads_cub = grads ** 3

        acts_sum = acts.sum(dim=[2, 3], keepdim=True)  # [1, C, 1, 1]

        denom = 2.0 * grads_sq + grads_cub * acts_sum

        denom = torch.where(
            denom != 0.0,
            denom,
            torch.ones_like(denom)
        )

        alpha      = grads_sq / denom
        relu_grads = torch.relu(grads)
        weights    = (alpha * relu_grads).sum(dim=[2, 3], keepdim=True)

        cam = (weights * acts).sum(dim=1, keepdim=True)
        cam = torch.relu(cam)

        if cam.max() > 0:
            cam = cam / cam.max()

        heatmap = cam.squeeze().cpu().numpy()

        # ── Build overlay image ───────────────────────────────────────────
        orig_w, orig_h  = original_img.size
        heatmap         = cv2.resize(heatmap, (orig_w, orig_h))
        heatmap_uint8   = (heatmap * 255).astype(np.uint8)
        heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        orig_np         = np.array(original_img)
        orig_bgr        = cv2.cvtColor(orig_np, cv2.COLOR_RGB2BGR)
        overlay         = cv2.addWeighted(orig_bgr, 0.5, heatmap_colored, 0.5, 0)

        filename  = f"gradcampp_{uuid.uuid4().hex[:8]}.jpg"
        save_path = STATIC_DIR / filename
        cv2.imwrite(str(save_path), overlay)

        print(f"[Grad-CAM++] Heatmap saved: {filename}")
        return f"http://localhost:8000/static/gradcam/{filename}"

    except Exception as e:
        # ── Fallback: basic Grad-CAM ──────────────────────────────────────
        print(f"[Grad-CAM++] Failed: {e} — falling back to basic Grad-CAM")
        try:
            h_f.remove()
            h_b.remove()
        except Exception:
            pass

        try:
            activations.clear()
            gradients.clear()

            def fwd_fb(module, inp, out):
                activations["value"] = out.detach()

            def bwd_fb(module, grad_in, grad_out):
                gradients["value"] = grad_out[0].detach()

            h_f2 = target_layer.register_forward_hook(fwd_fb)
            h_b2 = target_layer.register_full_backward_hook(bwd_fb)

            output = model(input_tensor)
            model.zero_grad()
            one_hot = torch.zeros_like(output)
            one_hot[0][pred_class] = 1
            output.backward(gradient=one_hot)

            h_f2.remove()
            h_b2.remove()

            grads   = gradients["value"]
            acts    = activations["value"]
            weights = grads.mean(dim=[2, 3], keepdim=True)
            cam     = torch.relu((weights * acts).sum(dim=1, keepdim=True))

            if cam.max() > 0:
                cam = cam / cam.max()

            heatmap         = cam.squeeze().cpu().numpy()
            orig_w, orig_h  = original_img.size
            heatmap         = cv2.resize(heatmap, (orig_w, orig_h))
            heatmap_uint8   = (heatmap * 255).astype(np.uint8)
            heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
            orig_np         = np.array(original_img)
            orig_bgr        = cv2.cvtColor(orig_np, cv2.COLOR_RGB2BGR)
            overlay         = cv2.addWeighted(orig_bgr, 0.5, heatmap_colored, 0.5, 0)

            filename  = f"gradcam_fallback_{uuid.uuid4().hex[:8]}.jpg"
            save_path = STATIC_DIR / filename
            cv2.imwrite(str(save_path), overlay)

            print(f"[Grad-CAM fallback] Heatmap saved: {filename}")
            return f"http://localhost:8000/static/gradcam/{filename}"

        except Exception as e2:
            print(f"[Grad-CAM fallback] Also failed: {e2}")
            return None
# ── END Grad-CAM++ ────────────────────────────────────────────────────────────


# ── Core prediction logic ─────────────────────────────────────────────────────
def run_prediction(image_bytes: bytes, model_name: str = DEFAULT_MODEL) -> dict:
    model, target_layer_name = load_model(model_name)
    original_img, input_tensor = preprocess_image(image_bytes)

    with torch.no_grad():
        output = model(input_tensor)
        probs = torch.softmax(output, dim=1)[0]
        pred_class = probs.argmax().item()
        confidence = probs[pred_class].item()

    # Class 0 = No Tumor, Class 1 = Tumor
    prediction = "Tumor" if pred_class == 1 else "No Tumor"
    risk_level = get_risk_level(confidence, prediction)

    # Run Grad-CAM++ with gradients enabled
    model.train()
    gradcam_url = generate_gradcam(
        model, target_layer_name, input_tensor, pred_class, original_img
    )
    model.eval()

    explanation = (
        f"Model {model_name.upper()} detected {prediction} with "
        f"{confidence * 100:.1f}% confidence. Risk level: {risk_level}."
    )

    return {
        "prediction":  prediction,
        "confidence":  round(confidence, 4),
        "risk_level":  risk_level,
        "gradcam_url": gradcam_url,
        "model_used":  model_name,
        "explanation": explanation,
    }


# ── Helper ────────────────────────────────────────────────────────────────────
def _validate_extension(filename: str):
    ext = os.path.splitext(filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Invalid file type. Allowed: {ALLOWED_EXTENSIONS}")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/upload", summary="Upload MRI and get prediction (requires auth)")
async def upload_predict(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    model_name: str = Form(DEFAULT_MODEL),
    is_emergency: bool = Form(False),
):
    _validate_extension(file.filename)
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(400, "Empty file uploaded")

    result = run_prediction(image_bytes, model_name)
    result["patient_id"]   = patient_id
    result["is_emergency"] = is_emergency
    result["case_id"]      = f"TMR-{uuid.uuid4().hex[:8].upper()}"
    return result


@router.post("/quick", summary="Quick predict without auth (testing only)")
async def quick_predict(
    file: UploadFile = File(...),
    model_name: str = Form(DEFAULT_MODEL),
):
    _validate_extension(file.filename)
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(400, "Empty file uploaded")

    result = run_prediction(image_bytes, model_name)
    return result


@router.get("/models", summary="List available models")
async def list_models():
    available = []
    for name, filename in MODEL_WEIGHTS.items():
        path = MODELS_DIR / filename
        available.append({
            "name":     name,
            "filename": filename,
            "loaded":   name in _model_cache,
            "exists":   path.exists(),
        })
    return {"models": available}