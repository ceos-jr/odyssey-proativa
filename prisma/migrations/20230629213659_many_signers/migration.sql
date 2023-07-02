/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Module` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_ownerId_fkey";

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "ownerId";

-- CreateTable
CREATE TABLE "SigendModule" (
    "moduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SigendModule_userId_moduleId_key" ON "SigendModule"("userId", "moduleId");

-- AddForeignKey
ALTER TABLE "SigendModule" ADD CONSTRAINT "SigendModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SigendModule" ADD CONSTRAINT "SigendModule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
