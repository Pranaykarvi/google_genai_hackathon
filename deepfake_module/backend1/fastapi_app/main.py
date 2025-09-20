# fastapi_app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_app.api import detect, health
from fastapi_app.core.model import load_model
import logging
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Deepfake Detection API",
    description="Detect whether an image is original or deepfake using MobileNetV2",
    version="1.0.0",
)

# CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # later restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["Health"])
app.include_router(detect.router, prefix="/detect", tags=["Detection"])

# Lifespan event: load model at startup
@app.on_event("startup")
async def startup_event():
    logger.info("Loading deepfake detection model at startup...")
    await load_model()   # ✅ await async load
    logger.info("Model loaded successfully.")
