from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "prediction-engine",
        "version": "1.0.0"
    }

@router.get("/ready")
async def readiness_check():
    return {
        "status": "ready",
        "models_loaded": True
    }
