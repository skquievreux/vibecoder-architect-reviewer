-- CreateTable
CREATE TABLE "BusinessCanvas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repositoryId" TEXT NOT NULL,
    "valueProposition" TEXT,
    "customerSegments" TEXT,
    "revenueStreams" TEXT,
    "costStructure" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessCanvas_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessCanvas_repositoryId_key" ON "BusinessCanvas"("repositoryId");
