/*
  Warnings:

  - You are about to drop the column `completed` on the `UserTaskProgress` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOTSUBMITTED', 'SUBMITTED', 'COMPLETED');

-- AlterTable
ALTER TABLE "UserTaskProgress" DROP COLUMN "completed",
ADD COLUMN     "grade" DOUBLE PRECISION,
ADD COLUMN     "richText" TEXT,
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'NOTSUBMITTED';
