-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "keyword" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "category" TEXT,
    "region" TEXT NOT NULL DEFAULT 'Nepal',
    "metricsJson" JSONB,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSignal" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT,
    "price" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "reviewText" TEXT,
    "complaintKeywords" JSONB,
    "sourceUrl" TEXT,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailerSignal" (
    "id" TEXT NOT NULL,
    "retailerName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "category" TEXT,
    "note" TEXT NOT NULL,
    "urgency" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RetailerSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trend" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "region" TEXT NOT NULL DEFAULT 'Nepal',
    "demandScore" DOUBLE PRECISION NOT NULL,
    "velocityScore" DOUBLE PRECISION NOT NULL,
    "competitionScore" DOUBLE PRECISION NOT NULL,
    "marginScore" DOUBLE PRECISION NOT NULL,
    "retailerPullScore" DOUBLE PRECISION NOT NULL,
    "viralityScore" DOUBLE PRECISION NOT NULL,
    "manufacturingEaseScore" DOUBLE PRECISION NOT NULL,
    "distributionFeasibilityScore" DOUBLE PRECISION NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "lifecycleStage" TEXT NOT NULL,
    "summary" TEXT,
    "recommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'Nepal',
    "summary" TEXT NOT NULL,
    "opportunitiesJson" JSONB NOT NULL,
    "risksJson" JSONB NOT NULL,
    "recommendationsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollectorRun" (
    "id" TEXT NOT NULL,
    "collector" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "itemsCreated" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CollectorRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Signal_source_collectedAt_idx" ON "Signal"("source", "collectedAt");

-- CreateIndex
CREATE INDEX "Signal_keyword_collectedAt_idx" ON "Signal"("keyword", "collectedAt");

-- CreateIndex
CREATE INDEX "ProductSignal_platform_collectedAt_idx" ON "ProductSignal"("platform", "collectedAt");

-- CreateIndex
CREATE INDEX "ProductSignal_category_collectedAt_idx" ON "ProductSignal"("category", "collectedAt");

-- CreateIndex
CREATE INDEX "RetailerSignal_location_createdAt_idx" ON "RetailerSignal"("location", "createdAt");

-- CreateIndex
CREATE INDEX "RetailerSignal_productName_createdAt_idx" ON "RetailerSignal"("productName", "createdAt");

-- CreateIndex
CREATE INDEX "Trend_finalScore_idx" ON "Trend"("finalScore");

-- CreateIndex
CREATE INDEX "Trend_updatedAt_idx" ON "Trend"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Trend_name_region_key" ON "Trend"("name", "region");

-- CreateIndex
CREATE INDEX "AIReport_createdAt_idx" ON "AIReport"("createdAt");

-- CreateIndex
CREATE INDEX "CollectorRun_collector_startedAt_idx" ON "CollectorRun"("collector", "startedAt");
