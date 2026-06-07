-- Create region dimension table for analytics.
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- Add optional normalized region references.
ALTER TABLE "BirthRecord" ADD COLUMN "birthRegionId" TEXT;
ALTER TABLE "DeathRecord" ADD COLUMN "deathRegionId" TEXT;

-- Fast grouping/filtering by region.
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");
CREATE INDEX "BirthRecord_birthRegionId_idx" ON "BirthRecord"("birthRegionId");
CREATE INDEX "DeathRecord_deathRegionId_idx" ON "DeathRecord"("deathRegionId");

-- Keep records if a region row is retired/deleted.
ALTER TABLE "BirthRecord" ADD CONSTRAINT "BirthRecord_birthRegionId_fkey"
  FOREIGN KEY ("birthRegionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DeathRecord" ADD CONSTRAINT "DeathRecord_deathRegionId_fkey"
  FOREIGN KEY ("deathRegionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
