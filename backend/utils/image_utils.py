"""
Image pre-processing for model inference.
"""

import io
import numpy as np
from PIL import Image
import torch
from torchvision import transforms

from config import IMAGE_SIZE

# ── Standard ImageNet normalization (used by ResNet / VGG / DenseNet) ─────────
_transform = transforms.Compose([
    transforms.Resize(IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def bytes_to_tensor(image_bytes: bytes) -> torch.Tensor:
    """
    Convert raw image bytes → (1, 3, H, W) float32 tensor ready for inference.
    Converts grayscale MRI images to RGB automatically.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = _transform(img)          # (3, H, W)
    return tensor.unsqueeze(0)        # (1, 3, H, W)


def bytes_to_pil(image_bytes: bytes) -> Image.Image:
    """Return a PIL Image (RGB) from raw bytes."""
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")