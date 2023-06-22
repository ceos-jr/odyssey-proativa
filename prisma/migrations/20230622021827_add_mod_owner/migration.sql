-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "ownerId" TEXT;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
