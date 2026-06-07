-- CreateTable
CREATE TABLE "BirthRecord" (
    "id" TEXT NOT NULL,
    "childName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "timeOfBirth" TEXT,
    "gender" TEXT,
    "placeOfBirth" TEXT NOT NULL,
    "birthType" TEXT,
    "motherName" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "informantName" TEXT,
    "informantContact" TEXT,
    "registrationCenter" TEXT,
    "attendantName" TEXT,
    "supportingDocumentUrl" TEXT,
    "verificationNotes" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "rejectionReason" TEXT,
    "createdById" TEXT NOT NULL,
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BirthRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BirthRecord" ADD CONSTRAINT "BirthRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirthRecord" ADD CONSTRAINT "BirthRecord_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
