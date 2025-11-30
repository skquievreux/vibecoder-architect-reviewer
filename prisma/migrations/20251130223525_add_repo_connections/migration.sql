-- CreateTable
CREATE TABLE "RepoConnection" (
    "sourceRepoId" TEXT NOT NULL,
    "targetRepoId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("sourceRepoId", "targetRepoId"),
    CONSTRAINT "RepoConnection_sourceRepoId_fkey" FOREIGN KEY ("sourceRepoId") REFERENCES "Repository" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RepoConnection_targetRepoId_fkey" FOREIGN KEY ("targetRepoId") REFERENCES "Repository" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
