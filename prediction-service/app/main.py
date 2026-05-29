"""
Football Prediction Service - FastAPI Application
AI-powered prediction engine for football matches
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel
from loguru import logger

from app.core.config import settings
from app.api.predict import router as predict_router
from app.api.health import router as health_router
from app.api.accumulator import router as accumulator_router
from app.core.model_manager import ModelManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    logger.info("Starting Prediction Service...")

    # Initialize ML models
    app.state.model_manager = ModelManager()
    await app.state.model_manager.load_models()

    logger.info("Prediction Service ready")
    yield

    # Cleanup
    logger.info("Shutting down Prediction Service...")
    await app.state.model_manager.cleanup()


app = FastAPI(
    title="Football Prediction Engine",
    description="AI-powered football match prediction service",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

# API Key verification
async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != settings.PREDICTION_SERVICE_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return x_api_key

# Routers
app.include_router(health_router, prefix="/api", tags=["health"])
app.include_router(
    predict_router, 
    prefix="/api", 
    tags=["predictions"],
    dependencies=[Depends(verify_api_key)]
)
app.include_router(
    accumulator_router,
    prefix="/api",
    tags=["accumulator"],
    dependencies=[Depends(verify_api_key)]
)


@app.get("/")
async def root():
    return {
        "service": "Football Prediction Engine",
        "version": "1.0.0",
        "status": "operational"
    }
