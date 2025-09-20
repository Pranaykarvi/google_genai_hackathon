import numpy as np
from PIL import Image

IMG_SIZE = (224, 224)

def preprocess_image(file_obj):
    """
    Convert uploaded image file to a NumPy array ready for model prediction.
    """
    img = Image.open(file_obj).convert("RGB")
    img = img.resize(IMG_SIZE)
    img_array = np.array(img) / 255.0  # normalize
    return np.expand_dims(img_array, axis=0)
