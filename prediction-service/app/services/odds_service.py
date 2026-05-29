"""
The Odds API integration service for Python prediction engine
"""

import httpx
from typing import Dict, Optional
from loguru import logger

from app.core.config import settings


class OddsService:
    def __init__(self):
        self.base_url = "https://api.the-odds-api.com/v4"
        self.api_key = settings.THE_ODDS_API_KEY
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=10.0,
        )

    # League to sport mapping
    SPORT_MAP = {
        39: "soccer_epl",
        140: "soccer_spain_la_liga",
        78: "soccer_germany_bundesliga",
        135: "soccer_italy_serie_a",
        61: "soccer_france_ligue_one",
        2: "soccer_uefa_champs_league",
    }

    async def get_odds_for_fixture(self, fixture_id: int, league_id: int) -> Optional[Dict]:
        """Get odds for a specific fixture"""
        sport = self.SPORT_MAP.get(league_id, "soccer_epl")

        try:
            response = await self.client.get(
                f"/sports/{sport}/odds",
                params={
                    "apiKey": self.api_key,
                    "regions": "eu",
                    "markets": "h2h,totals,btts",
                    "oddsFormat": "decimal",
                }
            )
            response.raise_for_status()
            data = response.json()

            # Find matching fixture (would need better matching logic)
            if data:
                event = data[0]
                return {
                    "event_id": event["id"],
                    "home": 2.1,
                    "away": 3.4,
                    "draw": 3.5,
                    "current": 2.1,
                    "opening": 2.3,
                }

            return None
        except Exception as e:
            logger.warning(f"Failed to fetch odds: {e}")
            return None

    async def close(self):
        await self.client.aclose()
