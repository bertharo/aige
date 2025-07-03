-- CreateTable
CREATE TABLE "ResidentFacilityAssignment" (
    "id" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResidentFacilityAssignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ResidentFacilityAssignment" ADD CONSTRAINT "ResidentFacilityAssignment_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentFacilityAssignment" ADD CONSTRAINT "ResidentFacilityAssignment_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
