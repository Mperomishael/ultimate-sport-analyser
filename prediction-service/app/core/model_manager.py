"""
Machine Learning Model Manager
Handles loading, caching, and inference of prediction models
"""

import os
import pickle
import numpy as np
from typing import Optional, Dict, Any
from loguru import logger


class ModelManager:
    """Manages ML models for prediction refinement"""

    def __init__(self, model_path: str = "./models"):
        self.model_path = model_path
        self.models = {}
        self.scaler = None
        self.feature_importance = None

    async def load_models(self):
        """Load all trained models"""
        logger.info("Loading ML models...")

        # Check for saved models
        model_files = {
            "ensemble": "ensemble_model.pkl",
            "scaler": "feature_scaler.pkl",
            "importance": "feature_importance.pkl",
        }

        for name, filename in model_files.items():
            filepath = os.path.join(self.model_path, filename)
            if os.path.exists(filepath):
                try:
                    with open(filepath, "rb") as f:
                        self.models[name] = pickle.load(f)
                    logger.info(f"Loaded {name} model")
                except Exception as e:
                    logger.warning(f"Failed to load {name}: {e}")
            else:
                logger.info(f"No saved {name} model found, using statistical predictions only")

        logger.info("Model loading complete")

    def predict(self, features: np.ndarray) -> Optional[Dict[str, float]]:
        """
        Make ML prediction using ensemble model.
        Returns probability distribution for match outcomes.
        """
        if "ensemble" not in self.models:
            return None

        try:
            # Scale features
            if self.scaler:
                features = self.scaler.transform(features.reshape(1, -1))

            model = self.models["ensemble"]
            probabilities = model.predict_proba(features)[0]

            return {
                "home_win": float(probabilities[0]),
                "draw": float(probabilities[1]),
                "away_win": float(probabilities[2]),
            }
        except Exception as e:
            logger.error(f"ML prediction error: {e}")
            return None

    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Cleaning up model resources...")
        self.models.clear()
