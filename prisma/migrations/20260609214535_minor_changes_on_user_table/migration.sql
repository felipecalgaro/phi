/*
  Warnings:

  - You are about to drop the column `highschoolCountry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `studienkollegs` on the `User` table. All the data in the column will be lost.
  - The `plannedAttendanceSemester` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Semester" AS ENUM ('SUMMER', 'WINTER');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "highschoolCountry",
DROP COLUMN "studienkollegs",
ADD COLUMN     "countryOfHighschool" TEXT,
ADD COLUMN     "plannedStudienkollegs" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "plannedAttendanceSemester",
ADD COLUMN     "plannedAttendanceSemester" "Semester";
