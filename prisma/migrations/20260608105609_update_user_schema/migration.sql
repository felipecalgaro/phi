-- AlterTable
ALTER TABLE "User" ADD COLUMN     "citizenships" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "highschoolCountry" TEXT,
ADD COLUMN     "plannedAttendanceSemester" TEXT,
ADD COLUMN     "plannedAttendanceYear" INTEGER,
ADD COLUMN     "studienkollegs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "subscribedToMarketing" BOOLEAN;
