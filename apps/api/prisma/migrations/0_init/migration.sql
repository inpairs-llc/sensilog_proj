-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "riotId" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "riotPuuid" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settingsRecords" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sensitivity" DOUBLE PRECISION NOT NULL,
    "dpi" INTEGER NOT NULL,
    "scopedSensitivity" DOUBLE PRECISION,
    "windowsSensitivity" INTEGER DEFAULT 6,
    "windowsAcceleration" BOOLEAN DEFAULT false,
    "mouseDevice" VARCHAR(100),
    "mousepad" VARCHAR(100),
    "keyboardDevice" VARCHAR(100),
    "screenResolution" VARCHAR(20),
    "aspectRatio" VARCHAR(10),
    "displayScaling" VARCHAR(10),
    "displayMode" VARCHAR(20),
    "rawInputBuffer" BOOLEAN DEFAULT true,
    "innerDeadzone" DOUBLE PRECISION DEFAULT 0.0,
    "outerDeadzone" DOUBLE PRECISION DEFAULT 1.0,
    "comment" TEXT,
    "tags" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settingsRecords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matchData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" VARCHAR(50) NOT NULL,
    "gameStartTime" TIMESTAMP(3) NOT NULL,
    "gameEndTime" TIMESTAMP(3) NOT NULL,
    "mapName" VARCHAR(50) NOT NULL,
    "gameMode" VARCHAR(50) NOT NULL,
    "rankTier" VARCHAR(50),
    "rr" INTEGER,
    "agentName" VARCHAR(50) NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "combatScore" DECIMAL(10,2) NOT NULL,
    "damageDealt" INTEGER NOT NULL,
    "headshotCount" INTEGER NOT NULL,
    "bodyshotCount" INTEGER NOT NULL,
    "legshotCount" INTEGER NOT NULL,
    "headshotPercentage" DECIMAL(5,2),
    "kdRatio" DECIMAL(5,2),
    "adr" DECIMAL(10,2),
    "roundsPlayed" INTEGER NOT NULL,
    "teamWon" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matchData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "color" VARCHAR(7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teamMembers" (
    "teamId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teamMembers_pkey" PRIMARY KEY ("teamId","userId")
);

-- CreateTable
CREATE TABLE "adminActions" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "actionType" VARCHAR(50) NOT NULL,
    "targetUserId" TEXT,
    "resourceType" VARCHAR(50),
    "resourceId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adminActions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_riotId_key" ON "users"("riotId");

-- CreateIndex
CREATE UNIQUE INDEX "users_riotPuuid_key" ON "users"("riotPuuid");

-- CreateIndex
CREATE UNIQUE INDEX "matchData_userId_matchId_key" ON "matchData"("userId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- AddForeignKey
ALTER TABLE "settingsRecords" ADD CONSTRAINT "settingsRecords_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchData" ADD CONSTRAINT "matchData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamMembers" ADD CONSTRAINT "teamMembers_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamMembers" ADD CONSTRAINT "teamMembers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adminActions" ADD CONSTRAINT "adminActions_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

