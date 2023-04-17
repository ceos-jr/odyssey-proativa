/*
  Warnings:

  - Added the required column `text` to the `les_suggestions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `mod_suggestions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "les_suggestions" ADD COLUMN     "readed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "mod_suggestions" ADD COLUMN     "readed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "text" TEXT NOT NULL;
