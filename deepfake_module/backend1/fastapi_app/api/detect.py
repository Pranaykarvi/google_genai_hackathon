# fastapi_app/api/detect.py
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi_app.core.model import get_model
from fastapi_app.core.utils import preprocess_image
import numpy as np
import asyncio
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

LABELS = ["original", "deepfake"]

@router.post("/")
async def detect_deepfakes(files: list[UploadFile] = File(...)):
    """
    Accept multiple image files and return deepfake detection results.
    """
    results = []
    model = get_model()  # ✅ safe now, model loaded at startup

    for file in files:
        if not file.content_type.startswith("image/"):
            results.append({
                "filename": file.filename,
                "error": "Invalid file type. Only images are supported."
            })
            continue

        try:
            # Preprocess image
            image_array = preprocess_image(file.file)  # shape: (1, 224, 224, 3)

            # Run prediction
            loop = asyncio.get_event_loop()
            preds = await loop.run_in_executor(None, model.predict, image_array)

            preds = np.squeeze(preds)

            if preds.shape == ():  # sigmoid
                pred_prob = float(preds)
                label = "deepfake" if pred_prob >= 0.5 else "original"
                confidence = pred_prob if label == "deepfake" else 1 - pred_prob
            elif preds.shape == (2,):  # softmax
                label_idx = int(np.argmax(preds))
                label = LABELS[label_idx]
                confidence = float(preds[label_idx])
            else:
                raise ValueError(f"Unexpected prediction shape: {preds.shape}")

            results.append({
                "filename": file.filename,
                "label": label,
                "confidence": confidence,
                "shape": image_array.shape
            })

        except Exception as e:
            logger.error(f"Detection failed for {file.filename}: {e}")
            results.append({
                "filename": file.filename,
                "error": "Internal server error during prediction."
            })

    return JSONResponse(content={"results": results})
