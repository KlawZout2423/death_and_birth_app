-- CreateEnum
CREATE TYPE "NextOfKinLookupStatus" AS ENUM ('FOUND', 'NOT_FOUND');

-- CreateTable
CREATE TABLE "NextOfKin" (
    "id" TEXT NOT NULL,
    "deathRecordId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "lookupStatus" "NextOfKinLookupStatus" NOT NULL DEFAULT 'FOUND',
    "infoSource" TEXT,
    "fullName" TEXT,
    "relation" TEXT,
    "contactNumber" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NextOfKin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NextOfKin_deathRecordId_institutionId_key" ON "NextOfKin"("deathRecordId", "institutionId");

-- AddForeignKey
ALTER TABLE "NextOfKin" ADD CONSTRAINT "NextOfKin_deathRecordId_fkey" FOREIGN KEY ("deathRecordId") REFERENCES "DeathRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NextOfKin" ADD CONSTRAINT "NextOfKin_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
