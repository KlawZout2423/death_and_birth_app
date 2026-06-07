import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type RegionBucket = {
  region: string;
  births: number;
  deaths: number;
};

type TrendBucket = {
  month: string;
  births: number;
  deaths: number;
};

function getRange(range: string) {
  const to = new Date();
  const from = new Date(to);

  if (range === "90d") {
    from.setDate(from.getDate() - 90);
  } else if (range === "1y") {
    from.setFullYear(from.getFullYear() - 1);
  } else {
    from.setDate(from.getDate() - 30);
  }

  return { from, to };
}

function monthKey(value: Date) {
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "ADMINISTRATOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "90d";
    const { from, to } = getRange(range);

    const [births, deaths] = await Promise.all([
      prisma.birthRecord.findMany({
        select: {
          dateOfBirth: true,
          birthRegion: { select: { name: true } },
        },
      }),
      prisma.deathRecord.findMany({
        select: {
          dateOfDeath: true,
          deathRegion: { select: { name: true } },
        },
      }),
    ]);

    const regionMap = new Map<string, RegionBucket>();
    for (const birth of births) {
      const regionName = birth.birthRegion?.name || "Other Regions";
      const bucket = regionMap.get(regionName) || { region: regionName, births: 0, deaths: 0 };
      bucket.births += 1;
      regionMap.set(regionName, bucket);
    }

    for (const death of deaths) {
      const regionName = death.deathRegion?.name || "Other Regions";
      const bucket = regionMap.get(regionName) || { region: regionName, births: 0, deaths: 0 };
      bucket.deaths += 1;
      regionMap.set(regionName, bucket);
    }

    const trendMap = new Map<string, TrendBucket>();
    for (const birth of births) {
      const key = monthKey(birth.dateOfBirth);
      const bucket = trendMap.get(key) || { month: key, births: 0, deaths: 0 };
      bucket.births += 1;
      trendMap.set(key, bucket);
    }

    for (const death of deaths) {
      const key = monthKey(death.dateOfDeath);
      const bucket = trendMap.get(key) || { month: key, births: 0, deaths: 0 };
      bucket.deaths += 1;
      trendMap.set(key, bucket);
    }

    const regionComparison = [...regionMap.values()]
      .sort((a, b) => b.births + b.deaths - (a.births + a.deaths));
    
    const trends = [...trendMap.values()].sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      summary: {
        births: births.length,
        deaths: deaths.length,
        records: births.length + deaths.length,
        regionsCovered: regionComparison.length,
      },
      regionComparison,
      trends,
    });
  } catch (error) {
    console.error("/api/analytics/overview error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
