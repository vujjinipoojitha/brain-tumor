"""
Model loader for TumORnot.
Supports ResNet50, DenseNet121, VGG16.
Each model outputs a single sigmoid neuron (binary: Tumor / No Tumor).
"""

import torch
import torch.nn as nn
from torchvision import models
from pathlib import Path
from typing import Dict

from config import MODEL_PATHS, DEFAULT_MODEL

# Cache: model_name → (model, last_conv_layer_name)
_model_cache: Dict[str, tuple] = {}

def _build_model(name: str) -> tuple:
    if name == "resnet50":
        model = models.resnet50(weights=None)
        model.fc = nn.Sequential(
            nn.Linear(model.fc.in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 2)
        )
        target_layer = "layer4"

    elif name == "densenet121":
        model = models.densenet121(weights=None)
        model.classifier = nn.Sequential(
            nn.Linear(model.classifier.in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 2)
        )
        target_layer = "features"

    elif name == "vgg16":
        model = models.vgg16(weights=None)
        model.classifier[6] = nn.Sequential(
            nn.Linear(4096, 512),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(512, 2)
        )
        target_layer = "features"

    else:
        raise ValueError(f"Unknown model: {name}")

    return model, target_layer


def load_model(name: str = DEFAULT_MODEL) -> tuple:
    """
    Load (or return cached) model.
    Returns (model, target_layer_name).
    """
    if name in _model_cache:
        return _model_cache[name]

    model, target_layer = _build_model(name)

    model_path: Path = MODEL_PATHS.get(name)
    if model_path and model_path.exists():
        state = torch.load(str(model_path), map_location="cpu")
        # Handle DataParallel-wrapped checkpoints
        if any(k.startswith("module.") for k in state.keys()):
            state = {k.replace("module.", ""): v for k, v in state.items()}
        model.load_state_dict(state, strict=False)
        print(f"[Model] Loaded weights: {model_path}")
    else:
        print(f"[Model] WARNING – No weights found at {model_path}. "
              f"Using random weights (for dev/testing only).")

    model.eval()
    _model_cache[name] = (model, target_layer)
    return model, target_layer