"""
Grad-CAM implementation.
Works with ResNet50, DenseNet121, and VGG16.
"""

import uuid
import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from pathlib import Path
from typing import Optional

from config import GRADCAM_DIR, IMAGE_SIZE


class GradCAM:
    """
    Hooks onto a target convolutional layer, runs a forward+backward pass,
    and produces a heatmap highlighting tumour-relevant regions.
    """

    def __init__(self, model: torch.nn.Module, target_layer_name: str):
        self.model = model
        self.gradients: Optional[torch.Tensor] = None
        self.activations: Optional[torch.Tensor] = None

        # Locate the target layer by name
        target = dict(model.named_modules()).get(target_layer_name)
        if target is None:
            raise ValueError(f"Layer '{target_layer_name}' not found in model.")

        # Register hooks
        target.register_forward_hook(self._save_activation)
        target.register_backward_hook(self._save_gradient)

    def _save_activation(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, input_tensor: torch.Tensor) -> np.ndarray:
        """
        Run forward + backward pass and return a (H, W) heatmap in [0, 1].
        """
        self.model.zero_grad()
        output = self.model(input_tensor)          # (1, 1)

        # Backward on the single output neuron
        output.backward(torch.ones_like(output))

        # Global average pooling of gradients → channel weights
        weights = self.gradients.mean(dim=(2, 3), keepdim=True)  # (1, C, 1, 1)
        cam = (weights * self.activations).sum(dim=1, keepdim=True)  # (1, 1, h, w)
        cam = F.relu(cam)

        # Normalise to [0, 1]
        cam = cam.squeeze().cpu().numpy()
        cam = cam - cam.min()
        if cam.max() > 0:
            cam /= cam.max()
        return cam


def generate_and_save_gradcam(
    model: torch.nn.Module,
    target_layer_name: str,
    input_tensor: torch.Tensor,
    original_pil: Image.Image,
) -> str:
    """
    Generate Grad-CAM heatmap, overlay it on the original MRI image,
    save to disk, and return the relative URL path.
    """
    # ── 1. Generate heatmap ───────────────────────────────────────────────────
    gcam = GradCAM(model, target_layer_name)
    heatmap = gcam.generate(input_tensor)           # (h, w) in [0,1]

    # ── 2. Resize heatmap to original image size ──────────────────────────────
    orig_w, orig_h = original_pil.size
    heatmap_resized = cv2.resize(heatmap, (orig_w, orig_h))

    # ── 3. Convert to colour map ──────────────────────────────────────────────
    heatmap_uint8  = np.uint8(255 * heatmap_resized)
    heatmap_colour = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)  # BGR
    heatmap_rgb    = cv2.cvtColor(heatmap_colour, cv2.COLOR_BGR2RGB)

    # ── 4. Overlay on original ────────────────────────────────────────────────
    orig_np  = np.array(original_pil.resize((orig_w, orig_h)))
    overlay  = cv2.addWeighted(orig_np, 0.5, heatmap_rgb, 0.5, 0)

    # ── 5. Save ───────────────────────────────────────────────────────────────
    filename = f"gradcam_{uuid.uuid4().hex[:12]}.jpg"
    save_path = GRADCAM_DIR / filename
    Image.fromarray(overlay).save(str(save_path), quality=90)

    # Return URL path relative to /static
    return f"/static/gradcam/{filename}"