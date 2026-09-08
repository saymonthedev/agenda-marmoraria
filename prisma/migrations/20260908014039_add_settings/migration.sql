-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "dueSoonDays" INTEGER NOT NULL DEFAULT 5,
    "companyName" TEXT,
    "companyPhone" TEXT,
    "companyEmail" TEXT,
    "companyAddress" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
