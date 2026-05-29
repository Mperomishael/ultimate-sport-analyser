import { NextRequest, NextResponse } from "next/server";
import { getOdds, getEventOdds, mapFixtureToOddsSport } from "@/services/odds-api";
import { getOddsCache, setOddsCache } from "@/services/cache";
import { authMiddleware } from "@/middleware/api";

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request);
  if (authResult.status !== 200) return authResult;

  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get("leagueId");
  const eventId = searchParams.get("eventId");

  try {
    if (eventId) {
      const cacheKey = `odds:event:${eventId}`;
      let odds = await getOddsCache(cacheKey);

      if (!odds) {
        odds = await getEventOdds(eventId);
        if (odds) await setOddsCache(cacheKey, odds);
      }

      return NextResponse.json(odds);
    }

    if (leagueId) {
      const sport = mapFixtureToOddsSport(parseInt(leagueId));
      const cacheKey = `odds:league:${leagueId}`;
      let odds = await getOddsCache(cacheKey);

      if (!odds) {
        odds = await getOdds(sport);
        await setOddsCache(cacheKey, odds);
      }

      return NextResponse.json(odds);
    }

    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Odds API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
