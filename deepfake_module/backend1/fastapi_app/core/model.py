import asyncio
import logging
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.layers import Layer

logger = logging.getLogger(__name__)

MODEL_PATH = Path(__file__).parent.parent / "models" / "mobilenetv2_best.h5"

_model = None

# Custom layer to handle 'Cast' during deserialization
class Cast(Layer):
    def call(self, inputs):
        return tf.cast(inputs, tf.float32)

async def load_model():
    global _model
    if _model is None:
        logger.info("Loading Deepfake detection model...")
        loop = asyncio.get_event_loop()
        _model = await loop.run_in_executor(
            None,
            lambda: keras.models.load_model(MODEL_PATH, custom_objects={"Cast": Cast})
        )
        logger.info("Model loaded successfully.")

def get_model():
    if _model is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")
    return _model
