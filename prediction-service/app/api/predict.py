from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from loguru import logger

from app.engines.prediction_engine import PredictionEngine
from app.core.config import settings

router = APIRouter()

class PredictRequest(BaseModel):
    fixture_id: int
    weights: Optional[dict] = None

class PredictResponse(BaseModel):
    fixture_id: int
    over_1_5: float
    over_2_5: float
    btts: float
    home_win: float
    away_win: float
    draw: float
    double_chance_hd: float
    double_chance_ha: float
    double_chance_da: float
    dnb_home: float
    dnb_away: float
    scores: dict
    overall_confidence: float
    recommended_bet: str
    value_rating: float
    ml_probability: Optional[dict]
    feature_vector: Optional[List[float]]


@router.post("/predict", response_model=PredictResponse)
async def predict_match(request: PredictRequest):
    """
    Generate prediction for a specific fixture.

    - **fixture_id**: The API-Football fixture ID
    - **weights**: Optional custom weights for the prediction engine
    """
    try:
        engine = PredictionEngine(weights=request.weights)
        result = await engine.predict(request.fixture_id)

        return PredictResponse(
            fixture_id=result.fixture_id,
            over_1_5=result.over_1_5,
            over_2_5=result.over_2_5,
            btts=result.btts,
            home_win=result.home_win,
            away_win=result.away_win,
            draw=result.draw,
            double_chance_hd=result.double_chance_hd,
            double_chance_ha=result.double_chance_ha,
            double_chance_da=result.double_chance_da,
            dnb_home=result.dnb_home,
            dnb_away=result.dnb_away,
            scores=result.scores,
            overall_confidence=result.overall_confidence,
            recommended_bet=result.recommended_bet,
            value_rating=result.value_rating,
            ml_probability=result.ml_probability,
            feature_vector=result.feature_vector,
        )
    except ValueError as e:
        logger.error(f"Prediction error for fixture {request.fixture_id}: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal prediction error")


@router.post("/predict/batch")
async def predict_batch(fixture_ids: List[int]):
    """
    Generate predictions for multiple fixtures.
    """
    engine = PredictionEngine()
    results = []

    for fixture_id in fixture_ids:
        try:
            result = await engine.predict(fixture_id)
            results.append({
                "fixture_id": fixture_id,
                "success": True,
                "prediction": {
                    "overall_confidence": result.overall_confidence,
                    "recommended_bet": result.recommended_bet,
                    "value_rating": result.value_rating,
                }
            })
        except Exception as e:
            results.append({
                "fixture_id": fixture_id,
                "success": False,
                "error": str(e)
            })

    return {"results": results}
