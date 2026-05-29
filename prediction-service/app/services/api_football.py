"""
API-Football integration service for Python prediction engine
"""

import httpx
import asyncio
from typing import List, Dict, Optional, Any
from loguru import logger

from app.core.config import settings


class ApiFootballService:
    def __init__(self):
        self.base_url = f"https://{settings.API_FOOTBALL_HOST}"
        self.headers = {
            "x-rapidapi-key": settings.API_FOOTBALL_KEY,
            "x-rapidapi-host": settings.API_FOOTBALL_HOST,
        }
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers=self.headers,
            timeout=10.0,
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
        )

    async def _make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Dict:
        """Make API request with retry logic"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await self.client.get(endpoint, params=params)
                response.raise_for_status()
                data = response.json()

                if data.get("errors"):
                    logger.warning(f"API errors: {data['errors']}")

                return data.get("response", [])
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    wait_time = 2 ** attempt
                    logger.warning(f"Rate limited. Waiting {wait_time}s...")
                    await asyncio.sleep(wait_time)
                else:
                    raise
            except Exception as e:
                if attempt == max_retries - 1:
                    logger.error(f"Failed after {max_retries} attempts: {e}")
                    raise
                await asyncio.sleep(1)
        return []

    async def get_fixture(self, fixture_id: int) -> Optional[Dict]:
        """Get fixture by ID"""
        data = await self._make_request("/fixtures", {"id": fixture_id})
        return data[0] if data else None

    async def get_team_form(self, team_id: int, last: int = 5, season: Optional[int] = None) -> List[Dict]:
        """Get team's recent form"""
        params = {"team": team_id, "last": last}
        if season:
            params["season"] = season

        fixtures = await self._make_request("/fixtures", params)

        form = []
        for fixture in fixtures:
            home_team = fixture["teams"]["home"]["id"]
            home_goals = fixture["goals"]["home"] or 0
            away_goals = fixture["goals"]["away"] or 0

            is_home = home_team == team_id
            team_goals = home_goals if is_home else away_goals
            opp_goals = away_goals if is_home else home_goals

            if team_goals > opp_goals:
                result = "W"
            elif team_goals == opp_goals:
                result = "D"
            else:
                result = "L"

            form.append({
                "fixture_id": fixture["fixture"]["id"],
                "result": result,
                "goals_for": team_goals,
                "goals_against": opp_goals,
                "venue": "home" if is_home else "away",
                "opponent": fixture["teams"]["away" if is_home else "home"]["name"],
                "date": fixture["fixture"]["date"],
            })

        return form

    async def get_head_to_head(self, team1: int, team2: int, last: int = 10) -> List[Dict]:
        """Get head-to-head record"""
        data = await self._make_request(
            "/fixtures/headtohead",
            {"h2h": f"{team1}-{team2}", "last": last}
        )

        h2h = []
        for fixture in data:
            h2h.append({
                "fixture_id": fixture["fixture"]["id"],
                "home_team_id": fixture["teams"]["home"]["id"],
                "away_team_id": fixture["teams"]["away"]["id"],
                "home_goals": fixture["goals"]["home"] or 0,
                "away_goals": fixture["goals"]["away"] or 0,
                "date": fixture["fixture"]["date"],
                "league": fixture["league"]["name"],
            })

        return h2h

    async def get_injuries(self, team_id: int) -> List[Dict]:
        """Get team injuries"""
        data = await self._make_request("/injuries", {"team": team_id})

        injuries = []
        for injury in data:
            injuries.append({
                "player_id": injury["player"]["id"],
                "player_name": injury["player"]["name"],
                "type": injury["player"]["type"],
                "reason": injury["player"].get("reason", ""),
            })

        return injuries

    async def get_standings(self, league_id: int, season: int) -> List[Dict]:
        """Get league standings"""
        data = await self._make_request("/standings", {"league": league_id, "season": season})

        if data and len(data) > 0:
            return data[0]["league"]["standings"][0] if data[0]["league"]["standings"] else []
        return []

    async def get_fixtures_by_date_range(
        self, 
        date_range: str, 
        leagues: Optional[List[int]] = None
    ) -> List[Dict]:
        """Get fixtures for date range"""
        from datetime import datetime, timedelta

        today = datetime.now()

        if date_range == "today":
            date = today.strftime("%Y-%m-%d")
            return await self._make_request("/fixtures", {"date": date, "league": leagues or "", "season": today.year})
        elif date_range == "tomorrow":
            date = (today + timedelta(days=1)).strftime("%Y-%m-%d")
            return await self._make_request("/fixtures", {"date": date, "league": leagues or "", "season": today.year})
        elif date_range == "week":
            fixtures = []
            for i in range(7):
                date = (today + timedelta(days=i)).strftime("%Y-%m-%d")
                day_fixtures = await self._make_request("/fixtures", {"date": date, "league": leagues or "", "season": today.year})
                fixtures.extend(day_fixtures)
            return fixtures

        return []

    async def close(self):
        await self.client.aclose()
