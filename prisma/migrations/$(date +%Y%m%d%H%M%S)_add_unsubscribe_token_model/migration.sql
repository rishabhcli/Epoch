-- CreateTable
CREATE TABLE "UnsubscribeToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnsubscribeToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnsubscribeToken_token_key" ON "UnsubscribeToken"("token");

-- CreateIndex
CREATE INDEX "UnsubscribeToken_token_idx" ON "UnsubscribeToken"("token");

-- CreateIndex
CREATE INDEX "UnsubscribeToken_userId_idx" ON "UnsubscribeToken"("userId");

-- CreateIndex
CREATE INDEX "UnsubscribeToken_expiresAt_idx" ON "UnsubscribeToken"("expiresAt");
