-- AlterTable
ALTER TABLE "BusinessCanvas" ADD COLUMN "consolidationGroup" TEXT;
ALTER TABLE "BusinessCanvas" ADD COLUMN "estimatedARR" DECIMAL;
ALTER TABLE "BusinessCanvas" ADD COLUMN "marketSize" TEXT;
ALTER TABLE "BusinessCanvas" ADD COLUMN "monetizationPotential" TEXT;

-- AlterTable
ALTER TABLE "Repository" ADD COLUMN "apiSpec" TEXT;
