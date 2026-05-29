"""
Football Prediction Engine
Weighted statistical scoring + Machine Learning ensemble
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from loguru import logger

from app.core.config import settings
from app.services.api_football import ApiFootballService
from app.services.odds_service import OddsService


@dataclass
class TeamMetrics:
    """Comprehensive team performance metrics"""
    recent_form_score: float
    home_form_score: float
    away_form_score: float
    goals_scored_avg: float
    goals_conceded_avg: float
    clean_sheets_pct: float
    btts_pct: float
    over_1_5_pct: float
    over_2_5_pct: float
    win_streak: int
    unbeaten_streak: int
    form_string: str


@dataclass
class PredictionResult:
    """Complete prediction output"""
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
    scores: Dict[str, float]
    overall_confidence: float
    recommended_bet: str
    value_rating: float
    ml_probability: Optional[Dict[str, float]]
    feature_vector: Optional[List[float]]


class PredictionEngine:
    """
    Core prediction engine using weighted statistical analysis
    before machine learning refinement.
    """

    DEFAULT_WEIGHTS = {
        "recent_form": 0.20,
        "h2h": 0.15,
        "home_away_form": 0.15,
        "goals_trend": 0.15,
        "injuries": 0.10,
        "odds_movement": 0.10,
        "standings": 0.10,
        "motivation": 0.05,
    }

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or self.DEFAULT_WEIGHTS
        self.api_football = ApiFootballService()
        self.odds_service = OddsService()

    def _validate_weights(self) -> bool:
        total = sum(self.weights.values())
        return abs(total - 1.0) < 0.001

    def _calculate_form_score(self, form_results: List[Dict]) -> float:
        if not form_results:
            return 50.0
        scores = []
        for i, match in enumerate(form_results):
            result = match.get("result", "D")
            weight = 1.0 + (i * 0.1)
            if result == "W":
                scores.append(3.0 * weight)
            elif result == "D":
                scores.append(1.0 * weight)
            else:
                scores.append(0.0)
        max_possible = sum([3.0 * (1.0 + (i * 0.1)) for i in range(len(form_results))])
        actual = sum(scores)
        return (actual / max_possible) * 100 if max_possible > 0 else 50.0

    def _calculate_goals_trend(self, matches: List[Dict]) -> Tuple[float, float, float]:
        if not matches:
            return 50.0, 50.0, 50.0
        goals_for = [m.get("goals_for", 0) for m in matches]
        goals_against = [m.get("goals_against", 0) for m in matches]
        total_goals = [gf + ga for gf, ga in zip(goals_for, goals_against)]
        avg_scored = np.mean(goals_for) if goals_for else 0
        avg_conceded = np.mean(goals_against) if goals_against else 0
        avg_total = np.mean(total_goals) if total_goals else 0
        scoring = min(avg_scored / 3.0 * 100, 100)
        conceding = min(avg_conceded / 3.0 * 100, 100)
        total = min(avg_total / 4.0 * 100, 100)
        return scoring, conceding, total

    def _calculate_h2h_score(self, h2h_matches: List[Dict], team_id: int) -> float:
        if not h2h_matches:
            return 50.0
        wins = 0
        draws = 0
        total = len(h2h_matches)
        for match in h2h_matches:
            home_team = match.get("home_team_id")
            home_goals = match.get("home_goals", 0)
            away_goals = match.get("away_goals", 0)
            if home_team == team_id:
                if home_goals > away_goals:
                    wins += 1
                elif home_goals == away_goals:
                    draws += 1
            else:
                if away_goals > home_goals:
                    wins += 1
                elif away_goals == home_goals:
                    draws += 1
        score = (wins * 3 + draws * 1) / (total * 3) * 100
        return score

    def _calculate_injury_impact(self, injuries: List[Dict]) -> float:
        if not injuries:
            return 100.0
        total_impact = 0
        for injury in injuries:
            severity = 1.0 if injury.get("type") == "Missing Fixture" else 0.5
            total_impact += severity
        impact_score = max(100 - (total_impact * 15), 30)
        return impact_score

    def _calculate_odds_movement_score(self, current_odds: float, opening_odds: float) -> float:
        if opening_odds <= 0 or current_odds <= 0:
            return 50.0
        movement = (opening_odds - current_odds) / opening_odds
        score = 50 + (movement * 100)
        return max(0, min(100, score))

    def _calculate_standings_score(self, team_rank: int, opponent_rank: int, total_teams: int) -> float:
        if total_teams <= 1:
            return 50.0
        rank_diff = opponent_rank - team_rank
        max_diff = total_teams - 1
        score = 50 + (rank_diff / max_diff * 50)
        return max(0, min(100, score))

    def _calculate_market_probabilities(
        self, home_metrics, away_metrics, h2h_score_home, h2h_score_away,
        home_advantage, injury_home, injury_away, standings_home, standings_away,
        odds_home, odds_away, odds_draw
    ) -> Dict[str, float]:
        home_strength = (
            home_metrics.recent_form_score * 0.3 +
            home_metrics.home_form_score * 0.3 +
            standings_home * 0.2 +
            h2h_score_home * 0.2
        )
        away_strength = (
            away_metrics.recent_form_score * 0.3 +
            away_metrics.away_form_score * 0.3 +
            standings_away * 0.2 +
            h2h_score_away * 0.2
        )
        home_strength = home_strength * (home_advantage / 100) * (injury_home / 100)
        away_strength = away_strength * (injury_away / 100)
        total_strength = home_strength + away_strength
        if total_strength == 0:
            total_strength = 100
        home_win_prob = (home_strength / total_strength) * 100
        away_win_prob = (away_strength / total_strength) * 100
        draw_prob = max(100 - home_win_prob - away_win_prob, 5)
        total = home_win_prob + away_win_prob + draw_prob
        home_win_prob = (home_win_prob / total) * 100
        away_win_prob = (away_win_prob / total) * 100
        draw_prob = (draw_prob / total) * 100
        avg_goals = (
            home_metrics.goals_scored_avg + away_metrics.goals_scored_avg +
            home_metrics.goals_conceded_avg + away_metrics.goals_conceded_avg
        ) / 4
        over_1_5 = min(50 + (avg_goals - 1.5) * 30, 95)
        over_2_5 = min(50 + (avg_goals - 2.5) * 25, 90)
        btts_prob = (
            home_metrics.btts_pct * 0.4 +
            away_metrics.btts_pct * 0.4 +
            (100 - abs(home_metrics.goals_scored_avg - away_metrics.goals_scored_avg) * 10) * 0.2
        )
        dc_home_draw = home_win_prob + draw_prob
        dc_home_away = home_win_prob + away_win_prob
        dc_draw_away = draw_prob + away_win_prob
        dnb_home = home_win_prob / (home_win_prob + away_win_prob) * 100 if (home_win_prob + away_win_prob) > 0 else 50
        dnb_away = away_win_prob / (home_win_prob + away_win_prob) * 100 if (home_win_prob + away_win_prob) > 0 else 50
        return {
            "over_1_5": round(over_1_5, 1),
            "over_2_5": round(over_2_5, 1),
            "btts": round(btts_prob, 1),
            "home_win": round(home_win_prob, 1),
            "away_win": round(away_win_prob, 1),
            "draw": round(draw_prob, 1),
            "double_chance_hd": round(dc_home_draw, 1),
            "double_chance_ha": round(dc_home_away, 1),
            "double_chance_da": round(dc_draw_away, 1),
            "dnb_home": round(dnb_home, 1),
            "dnb_away": round(dnb_away, 1),
        }

    def _determine_recommended_bet(self, probabilities, home_metrics, away_metrics):
        markets = {
            "Over 1.5 Goals": probabilities["over_1_5"],
            "Over 2.5 Goals": probabilities["over_2_5"],
            "BTTS Yes": probabilities["btts"],
            "Home Win": probabilities["home_win"],
            "Away Win": probabilities["away_win"],
            "Draw": probabilities["draw"],
        }
        best_market = max(markets, key=markets.get)
        best_confidence = markets[best_market]
        sorted_probs = sorted(markets.values(), reverse=True)
        confidence_gap = sorted_probs[0] - sorted_probs[1] if len(sorted_probs) > 1 else 0
        value_rating = min(5 + (confidence_gap / 10), 10)
        if "Over" in best_market and (home_metrics.over_2_5_pct + away_metrics.over_2_5_pct) / 2 > 60:
            value_rating = min(value_rating + 0.5, 10)
        return best_market, round(value_rating, 1)

    async def predict(self, fixture_id: int) -> PredictionResult:
        logger.info(f"Generating prediction for fixture {fixture_id}")
        fixture = await self.api_football.get_fixture(fixture_id)
        if not fixture:
            raise ValueError(f"Fixture {fixture_id} not found")
        home_team_id = fixture["teams"]["home"]["id"]
        away_team_id = fixture["teams"]["away"]["id"]
        league_id = fixture["league"]["id"]
        season = fixture["league"]["season"]

        import asyncio
        home_form, away_form, h2h, home_injuries, away_injuries, standings, odds = await asyncio.gather(
            self.api_football.get_team_form(home_team_id, 5, season),
            self.api_football.get_team_form(away_team_id, 5, season),
            self.api_football.get_head_to_head(home_team_id, away_team_id, 10),
            self.api_football.get_injuries(home_team_id),
            self.api_football.get_injuries(away_team_id),
            self.api_football.get_standings(league_id, season),
            self.odds_service.get_odds_for_fixture(fixture_id, league_id),
        )

        home_metrics = self._build_team_metrics(home_form, is_home=True)
        away_metrics = self._build_team_metrics(away_form, is_home=False)

        home_form_score = self._calculate_form_score(home_form)
        away_form_score = self._calculate_form_score(away_form)
        h2h_score_home = self._calculate_h2h_score(h2h, home_team_id)
        h2h_score_away = self._calculate_h2h_score(h2h, away_team_id)
        home_goals_trend = self._calculate_goals_trend(home_form)
        away_goals_trend = self._calculate_goals_trend(away_form)
        goals_trend_score = (home_goals_trend[2] + away_goals_trend[2]) / 2
        injury_home = self._calculate_injury_impact(home_injuries)
        injury_away = self._calculate_injury_impact(away_injuries)
        injury_score = (injury_home + injury_away) / 2
        home_rank = self._get_team_rank(standings, home_team_id)
        away_rank = self._get_team_rank(standings, away_team_id)
        total_teams = len(standings) if standings else 20
        standings_home = self._calculate_standings_score(home_rank, away_rank, total_teams)
        standings_away = self._calculate_standings_score(away_rank, home_rank, total_teams)
        odds_movement_score = 50.0
        if odds:
            odds_movement_score = self._calculate_odds_movement_score(
                odds.get("current", 2.0), odds.get("opening", 2.0)
            )

        probabilities = self._calculate_market_probabilities(
            home_metrics, away_metrics, h2h_score_home, h2h_score_away,
            home_advantage=60, injury_home=injury_home, injury_away=injury_away,
            standings_home=standings_home, standings_away=standings_away,
            odds_home=odds.get("home", 2.0) if odds else 2.0,
            odds_away=odds.get("away", 3.0) if odds else 3.0,
            odds_draw=odds.get("draw", 3.5) if odds else 3.5,
        )

        overall_confidence = (
            home_form_score * self.weights["recent_form"] +
            away_form_score * self.weights["recent_form"] +
            (h2h_score_home + h2h_score_away) / 2 * self.weights["h2h"] +
            (home_metrics.home_form_score + away_metrics.away_form_score) / 2 * self.weights["home_away_form"] +
            goals_trend_score * self.weights["goals_trend"] +
            injury_score * self.weights["injuries"] +
            odds_movement_score * self.weights["odds_movement"] +
            (standings_home + standings_away) / 2 * self.weights["standings"] +
            50 * self.weights["motivation"]
        )

        recommended_bet, value_rating = self._determine_recommended_bet(
            probabilities, home_metrics, away_metrics
        )

        feature_vector = [
            home_form_score / 100, away_form_score / 100,
            h2h_score_home / 100, home_metrics.home_form_score / 100,
            away_metrics.away_form_score / 100, home_goals_trend[0] / 100,
            away_goals_trend[0] / 100, injury_home / 100, injury_away / 100,
            standings_home / 100, standings_away / 100, odds_movement_score / 100,
        ]

        scores = {
            "home_form": round(home_form_score, 1),
            "away_form": round(away_form_score, 1),
            "h2h": round((h2h_score_home + h2h_score_away) / 2, 1),
            "home_away": round((home_metrics.home_form_score + away_metrics.away_form_score) / 2, 1),
            "goals_trend": round(goals_trend_score, 1),
            "injuries": round(injury_score, 1),
            "odds_movement": round(odds_movement_score, 1),
            "standings": round((standings_home + standings_away) / 2, 1),
            "motivation": 50.0,
        }

        return PredictionResult(
            fixture_id=fixture_id,
            over_1_5=probabilities["over_1_5"],
            over_2_5=probabilities["over_2_5"],
            btts=probabilities["btts"],
            home_win=probabilities["home_win"],
            away_win=probabilities["away_win"],
            draw=probabilities["draw"],
            double_chance_hd=probabilities["double_chance_hd"],
            double_chance_ha=probabilities["double_chance_ha"],
            double_chance_da=probabilities["double_chance_da"],
            dnb_home=probabilities["dnb_home"],
            dnb_away=probabilities["dnb_away"],
            scores=scores,
            overall_confidence=round(overall_confidence, 1),
            recommended_bet=recommended_bet,
            value_rating=value_rating,
            ml_probability=None,
            feature_vector=feature_vector,
        )

    def _build_team_metrics(self, form_matches, is_home):
        if not form_matches:
            return TeamMetrics(
                recent_form_score=50.0, home_form_score=50.0, away_form_score=50.0,
                goals_scored_avg=1.0, goals_conceded_avg=1.0, clean_sheets_pct=20.0,
                btts_pct=50.0, over_1_5_pct=60.0, over_2_5_pct=40.0,
                win_streak=0, unbeaten_streak=0, form_string="?????",
            )
        goals_for = [m.get("goals_for", 0) for m in form_matches]
        goals_against = [m.get("goals_against", 0) for m in form_matches]
        clean_sheets = sum(1 for ga in goals_against if ga == 0)
        btts_count = sum(1 for gf, ga in zip(goals_for, goals_against) if gf > 0 and ga > 0)
        over_1_5_count = sum(1 for gf, ga in zip(goals_for, goals_against) if gf + ga > 1)
        over_2_5_count = sum(1 for gf, ga in zip(goals_for, goals_against) if gf + ga > 2)
        total = len(form_matches)
        win_streak = 0
        unbeaten_streak = 0
        for match in reversed(form_matches):
            result = match.get("result", "D")
            if result == "W":
                win_streak += 1
                unbeaten_streak += 1
            elif result == "D":
                unbeaten_streak += 1
                win_streak = 0
            else:
                break
        return TeamMetrics(
            recent_form_score=self._calculate_form_score(form_matches),
            home_form_score=self._calculate_form_score([m for m in form_matches if m.get("venue") == "home"]) if is_home else 50.0,
            away_form_score=self._calculate_form_score([m for m in form_matches if m.get("venue") == "away"]) if not is_home else 50.0,
            goals_scored_avg=round(np.mean(goals_for), 2),
            goals_conceded_avg=round(np.mean(goals_against), 2),
            clean_sheets_pct=round(clean_sheets / total * 100, 1),
            btts_pct=round(btts_count / total * 100, 1),
            over_1_5_pct=round(over_1_5_count / total * 100, 1),
            over_2_5_pct=round(over_2_5_count / total * 100, 1),
            win_streak=win_streak,
            unbeaten_streak=unbeaten_streak,
            form_string="".join([m.get("result", "D") for m in form_matches]),
        )

    def _get_team_rank(self, standings, team_id):
        for standing in standings:
            if standing.get("team", {}).get("id") == team_id:
                return standing.get("rank", 10)
        return 10
