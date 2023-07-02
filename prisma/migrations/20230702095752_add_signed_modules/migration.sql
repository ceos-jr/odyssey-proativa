-- CreateTable
CREATE TABLE "SignedModule" (
    "moduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SignedModule_userId_moduleId_key" ON "SignedModule"("userId", "moduleId");

-- AddForeignKey
ALTER TABLE "SignedModule" ADD CONSTRAINT "SignedModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignedModule" ADD CONSTRAINT "SignedModule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
