-- CreateTable
CREATE TABLE "HealthSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalRepositories" INTEGER NOT NULL,
    "outdatedDependenciesCount" INTEGER NOT NULL,
    "vulnerabilitiesCount" INTEGER NOT NULL,
    "healthScore" INTEGER NOT NULL DEFAULT 0
);
