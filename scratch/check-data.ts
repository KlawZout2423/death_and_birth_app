import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [births, deaths] = await Promise.all([
    prisma.birthRecord.findMany({
      include: { birthRegion: true }
    }),
    prisma.deathRecord.findMany({
      include: { deathRegion: true }
    })
  ]);

  console.log("Total Births:", births.length);
  console.log("Total Deaths:", deaths.length);

  const regions: Record<string, { births: number; deaths: number }> = {};

  births.forEach(b => {
    const r = b.birthRegion?.name || "Unknown";
    if (!regions[r]) regions[r] = { births: 0, deaths: 0 };
    regions[r].births++;
  });

  deaths.forEach(d => {
    const r = d.deathRegion?.name || "Unknown";
    if (!regions[r]) regions[r] = { births: 0, deaths: 0 };
    regions[r].deaths++;
  });

  console.log("Region Counts:");
  console.table(regions);
}

main().catch(console.error).finally(() => prisma.$disconnect());
