-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "riotId" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "riotPuuid" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_riotId_key" ON "users"("riotId");

-- CreateIndex
CREATE UNIQUE INDEX "users_riotPuuid_key" ON "users"("riotPuuid");
