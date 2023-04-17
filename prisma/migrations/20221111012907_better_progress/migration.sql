/*
  Warnings:

  - Added the required column `index` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleId` to the `UserLessonProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lessonId` to the `UserTaskProgress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "index" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserLessonProgress" ADD COLUMN     "moduleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserTaskProgress" ADD COLUMN     "lessonId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UserLessonProgress" ADD CONSTRAINT "UserLessonProgress_userId_moduleId_fkey" FOREIGN KEY ("userId", "moduleId") REFERENCES "UserModuleProgress"("userId", "moduleId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskProgress" ADD CONSTRAINT "UserTaskProgress_userId_lessonId_fkey" FOREIGN KEY ("userId", "lessonId") REFERENCES "UserLessonProgress"("userId", "lessonId") ON DELETE CASCADE ON UPDATE CASCADE;
