-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "regionSlug" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "gb" REAL NOT NULL,
    "validityDays" INTEGER NOT NULL,
    "costUsd" REAL NOT NULL,
    "priceUsd" REAL NOT NULL,
    "priceOverridden" BOOLEAN NOT NULL DEFAULT false,
    "coverage" TEXT NOT NULL DEFAULT '',
    "speed" TEXT NOT NULL DEFAULT '',
    "networks" TEXT NOT NULL DEFAULT '',
    "fupPolicy" TEXT NOT NULL DEFAULT '',
    "topUpType" TEXT NOT NULL DEFAULT '',
    "visible" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderRef" TEXT NOT NULL,
    "cartGroup" TEXT,
    "planId" TEXT NOT NULL,
    "days" INTEGER NOT NULL DEFAULT 1,
    "email" TEXT NOT NULL,
    "wechatId" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "amountUsd" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "esimIccid" TEXT,
    "esimActivation" TEXT,
    "esimSmdp" TEXT,
    "supplierOrderNo" TEXT,
    "esimTranNo" TEXT,
    "failureReason" TEXT,
    "adminNote" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    "deliveredAt" DATETIME,
    CONSTRAINT "Order_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactFirstName" TEXT NOT NULL,
    "contactLastName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL DEFAULT '',
    "storeZip" TEXT NOT NULL,
    "storeState" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "role" TEXT NOT NULL DEFAULT 'PARTNER',
    "balanceUsd" REAL NOT NULL DEFAULT 0,
    "retailMarkupPercent" REAL NOT NULL DEFAULT 20,
    "brandName" TEXT NOT NULL DEFAULT '',
    "brandAlias" TEXT NOT NULL,
    "brandUrl" TEXT NOT NULL DEFAULT '',
    "brandEmail" TEXT NOT NULL DEFAULT '',
    "brandLogoUrl" TEXT NOT NULL DEFAULT '',
    "brandIconUrl" TEXT NOT NULL DEFAULT '',
    "brandHeroUrl" TEXT NOT NULL DEFAULT '',
    "brandColor" TEXT NOT NULL DEFAULT '#10b981',
    "supportEmail" TEXT NOT NULL DEFAULT '',
    "supportPhone" TEXT NOT NULL DEFAULT '',
    "adminNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PartnerOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderRef" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "packageType" TEXT NOT NULL DEFAULT 'ESIM',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "subtotalUsd" REAL NOT NULL,
    "taxUsd" REAL NOT NULL,
    "totalUsd" REAL NOT NULL,
    "orderedBy" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" DATETIME,
    CONSTRAINT "PartnerOrder_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PartnerOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitCostUsd" REAL NOT NULL,
    "unitWholesale" REAL NOT NULL,
    "taxUsd" REAL NOT NULL,
    "networks" TEXT NOT NULL DEFAULT '',
    "planName" TEXT NOT NULL DEFAULT '',
    "region" TEXT NOT NULL DEFAULT '',
    "dataLabel" TEXT NOT NULL DEFAULT '',
    "validityDays" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "PartnerOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PartnerOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PartnerOrderItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PartnerEsim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "orderId" TEXT,
    "planId" TEXT NOT NULL DEFAULT '',
    "planName" TEXT NOT NULL DEFAULT '',
    "region" TEXT NOT NULL DEFAULT '',
    "regionCode" TEXT NOT NULL DEFAULT '',
    "dataLabel" TEXT NOT NULL DEFAULT '',
    "validityDays" INTEGER NOT NULL DEFAULT 1,
    "networks" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PENDING_ACTIVATION',
    "iccid" TEXT,
    "assignee" TEXT NOT NULL DEFAULT '',
    "nickname" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "activationCode" TEXT,
    "smdpAddress" TEXT,
    "matchingId" TEXT,
    "supplierOrderNo" TEXT,
    "esimTranNo" TEXT,
    "dataRemainingGb" REAL,
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "unitPaidUsd" REAL NOT NULL DEFAULT 0,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" DATETIME,
    "expiresAt" DATETIME,
    CONSTRAINT "PartnerEsim_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PartnerEsim_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PartnerOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BalanceTopUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invNumber" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amountUsd" REAL NOT NULL,
    "paymentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" DATETIME,
    CONSTRAINT "BalanceTopUp_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuickShareLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "esimId" TEXT,
    "orderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "QuickShareLink_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QuickShareLink_esimId_fkey" FOREIGN KEY ("esimId") REFERENCES "PartnerEsim" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QuickShareLink_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PartnerOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StateTaxRate" (
    "stateCode" TEXT NOT NULL PRIMARY KEY,
    "stateName" TEXT NOT NULL,
    "rate" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "PartnerFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PartnerFeedback_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Plan_regionSlug_idx" ON "Plan"("regionSlug");

-- CreateIndex
CREATE INDEX "Plan_region_idx" ON "Plan"("region");

-- CreateIndex
CREATE INDEX "Plan_visible_region_idx" ON "Plan"("visible", "region");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderRef_key" ON "Order"("orderRef");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_cartGroup_idx" ON "Order"("cartGroup");

-- CreateIndex
CREATE INDEX "Order_email_idx" ON "Order"("email");

-- CreateIndex
CREATE INDEX "Order_esimTranNo_idx" ON "Order"("esimTranNo");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_brandAlias_key" ON "Partner"("brandAlias");

-- CreateIndex
CREATE INDEX "Partner_status_idx" ON "Partner"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerOrder_orderRef_key" ON "PartnerOrder"("orderRef");

-- CreateIndex
CREATE INDEX "PartnerOrder_partnerId_idx" ON "PartnerOrder"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerOrder_status_idx" ON "PartnerOrder"("status");

-- CreateIndex
CREATE INDEX "PartnerOrder_createdAt_idx" ON "PartnerOrder"("createdAt");

-- CreateIndex
CREATE INDEX "PartnerOrder_partnerId_status_idx" ON "PartnerOrder"("partnerId", "status");

-- CreateIndex
CREATE INDEX "PartnerOrder_partnerId_createdAt_idx" ON "PartnerOrder"("partnerId", "createdAt");

-- CreateIndex
CREATE INDEX "PartnerOrderItem_orderId_idx" ON "PartnerOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "PartnerOrderItem_planId_idx" ON "PartnerOrderItem"("planId");

-- CreateIndex
CREATE INDEX "PartnerEsim_partnerId_idx" ON "PartnerEsim"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerEsim_status_idx" ON "PartnerEsim"("status");

-- CreateIndex
CREATE INDEX "PartnerEsim_iccid_idx" ON "PartnerEsim"("iccid");

-- CreateIndex
CREATE INDEX "PartnerEsim_orderId_idx" ON "PartnerEsim"("orderId");

-- CreateIndex
CREATE INDEX "PartnerEsim_partnerId_status_idx" ON "PartnerEsim"("partnerId", "status");

-- CreateIndex
CREATE INDEX "PartnerEsim_partnerId_issuedAt_idx" ON "PartnerEsim"("partnerId", "issuedAt");

-- CreateIndex
CREATE INDEX "PartnerEsim_partnerId_archived_idx" ON "PartnerEsim"("partnerId", "archived");

-- CreateIndex
CREATE INDEX "PartnerEsim_esimTranNo_idx" ON "PartnerEsim"("esimTranNo");

-- CreateIndex
CREATE UNIQUE INDEX "BalanceTopUp_invNumber_key" ON "BalanceTopUp"("invNumber");

-- CreateIndex
CREATE INDEX "BalanceTopUp_partnerId_idx" ON "BalanceTopUp"("partnerId");

-- CreateIndex
CREATE INDEX "BalanceTopUp_status_idx" ON "BalanceTopUp"("status");

-- CreateIndex
CREATE INDEX "BalanceTopUp_createdAt_idx" ON "BalanceTopUp"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuickShareLink_token_key" ON "QuickShareLink"("token");

-- CreateIndex
CREATE INDEX "QuickShareLink_partnerId_idx" ON "QuickShareLink"("partnerId");

-- CreateIndex
CREATE INDEX "QuickShareLink_token_idx" ON "QuickShareLink"("token");

-- CreateIndex
CREATE INDEX "PartnerFeedback_partnerId_idx" ON "PartnerFeedback"("partnerId");
