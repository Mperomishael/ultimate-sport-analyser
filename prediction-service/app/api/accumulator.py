from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from loguru import logger
import numpy as np

from app.engines.prediction_engine import PredictionEngine
from app.services.api_football import ApiFootballService

router = APIRouter()

class AccumulatorConfig(BaseModel):
    target_odds: float = 5.0
    allowed_markets: List[str] = ["over_1_5", "over_2_5", "btts", "home_win"]
    risk_level: str = "medium"  # low, medium, high
    min_confidence: float = 60.0
    max_selections: int = 5
    date_range: str = "today"
    leagues: Optional[List[int]] = None

class AccumulatorSelection(BaseModel):
    fixture_id: int
    home_team: str
    away_team: str
    market: str
    selection: str
    odds: float
    confidence: float
    reason: str

class AccumulatorResponse(BaseModel):
    total_odds: float
    combined_confidence: float
    selections: List[AccumulatorSelection]
    risk_level: str
    target_odds: float


@router.post("/accumulator", response_model=AccumulatorResponse)
async def generate_accumulator(config: AccumulatorConfig):
    """
    Generate a smart accumulator based on user preferences.

    Uses a greedy algorithm to select the safest matches
    that combine to reach the target odds.
    """
    try:
        api = ApiFootballService()
        engine = PredictionEngine()

        # Fetch fixtures based on date range
        fixtures = await api.get_fixtures_by_date_range(config.date_range, config.leagues)

        # Generate predictions for all fixtures
        predictions = []
        for fixture in fixtures:
            try:
                pred = await engine.predict(fixture["fixture"]["id"])
                predictions.append({
                    "fixture": fixture,
                    "prediction": pred,
                })
            except Exception as e:
                logger.warning(f"Failed to predict fixture {fixture['fixture']['id']}: {e}")
                continue

        # Filter by confidence threshold
        min_conf = {
            "low": 75.0,
            "medium": 55.0,
            "high": 40.0,
        }.get(config.risk_level, 55.0)

        eligible = [
            p for p in predictions 
            if p["prediction"].overall_confidence >= max(min_conf, config.min_confidence)
        ]

        # Sort by confidence descending
        eligible.sort(key=lambda x: x["prediction"].overall_confidence, reverse=True)

        # Greedy selection to reach target odds
        selections = []
        current_odds = 1.0
        used_fixtures = set()

        for item in eligible:
            if len(selections) >= config.max_selections:
                break

            fixture_id = item["fixture"]["fixture"]["id"]
            if fixture_id in used_fixtures:
                continue

            pred = item["prediction"]

            # Find best market from allowed markets
            best_market = None
            best_odds = 1.0
            best_confidence = 0.0
            best_selection = ""

            market_map = {
                "over_1_5": ("Over 1.5 Goals", pred.over_1_5, 1.25),
                "over_2_5": ("Over 2.5 Goals", pred.over_2_5, 1.85),
                "btts": ("BTTS Yes", pred.btts, 1.72),
                "home_win": ("Home Win", pred.home_win, 2.1),
                "away_win": ("Away Win", pred.away_win, 3.4),
                "draw": ("Draw", pred.draw, 3.6),
            }

            for market_key in config.allowed_markets:
                if market_key in market_map:
                    name, confidence, default_odds = market_map[market_key]
                    # Get actual odds from prediction
                    odds = default_odds  # Would fetch from odds service

                    if confidence >= min_conf and odds > 1.1:
                        if confidence > best_confidence:
                            best_market = market_key
                            best_odds = odds
                            best_confidence = confidence
                            best_selection = name

            if best_market and current_odds * best_odds <= config.target_odds * 1.5:
                selections.append(AccumulatorSelection(
                    fixture_id=fixture_id,
                    home_team=item["fixture"]["teams"]["home"]["name"],
                    away_team=item["fixture"]["teams"]["away"]["name"],
                    market=best_market,
                    selection=best_selection,
                    odds=best_odds,
                    confidence=best_confidence,
                    reason=f"{best_confidence:.0f}% confidence based on form analysis",
                ))
                current_odds *= best_odds
                used_fixtures.add(fixture_id)

            # Check if we've reached target
            if current_odds >= config.target_odds:
                break

        combined_confidence = np.mean([s.confidence for s in selections]) if selections else 0

        return AccumulatorResponse(
            total_odds=round(current_odds, 2),
            combined_confidence=round(combined_confidence, 1),
            selections=selections,
            risk_level=config.risk_level,
            target_odds=config.target_odds,
        )

    except Exception as e:
        logger.error(f"Accumulator generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate accumulator")
