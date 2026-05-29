import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  getFixtures,
  getFixtureById,
  getTeamForm,
  getHeadToHead,
  getInjuries,
  getFixtureStatistics,
  getLiveFixtures,
} from "@/services/api-football";
import {
  getFixtureCache,
  setFixtureCache,
} from "@/services/cache";
import { authMiddleware } from "@/middleware/api";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request);
  if (authResult.status !== 200) return authResult;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const league = searchParams.get("league");
  const fixtureId = searchParams.get("id");
  const live = searchParams.get("live");

  try {
    if (fixtureId) {
      const cacheKey = `fixture:${fixtureId}`;
      let fixture = await getFixtureCache(cacheKey);

      if (!fixture) {
        const apiFixture = await getFixtureById(parseInt(fixtureId));
        if (!apiFixture) {
          return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
        }

        const [homeForm, awayForm, h2h, injuries, stats] = await Promise.all([
          getTeamForm(apiFixture.teams.home.id, 5),
          getTeamForm(apiFixture.teams.away.id, 5),
          getHeadToHead(apiFixture.teams.home.id, apiFixture.teams.away.id, 10),
          getInjuries(apiFixture.teams.home.id),
          getFixtureStatistics(parseInt(fixtureId)),
        ]);

        fixture = {
          ...apiFixture,
          homeForm,
          awayForm,
          h2h,
          injuries,
          statistics: stats,
        };

        await setFixtureCache(cacheKey, fixture);
      }

      return NextResponse.json(fixture);
    }

    if (live === "true") {
      const fixtures = await getLiveFixtures();
      return NextResponse.json(fixtures);
    }

    if (date) {
      const cacheKey = `fixtures:${date}:${league || "all"}`;
      let fixtures = await getFixtureCache(cacheKey);

      if (!fixtures) {
        fixtures = await getFixtures(
          date,
          league ? parseInt(league) : undefined
        );
        await setFixtureCache(cacheKey, fixtures);
      }

      return NextResponse.json(fixtures);
    }

    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Fixtures API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
