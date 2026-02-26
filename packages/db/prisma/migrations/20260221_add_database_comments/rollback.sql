-- Rollback: Remove Database Comments
-- Migration: 20260221_add_database_comments

-- Purpose: Remove all database comments added for documentation
-- Impact: Removes metadata, no data or performance impact

-- ============================================================================
-- TABLE COMMENTS
-- ============================================================================

COMMENT ON TABLE "User" IS NULL;
COMMENT ON TABLE "Customer" IS NULL;
COMMENT ON TABLE "Account" IS NULL;
COMMENT ON TABLE "Session" IS NULL;
COMMENT ON TABLE "VerificationToken" IS NULL;
COMMENT ON TABLE "K8sClusterConfig" IS NULL;
COMMENT ON TABLE "StripeWebhookEvent" IS NULL;

-- ============================================================================
-- USER TABLE COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN "User"."id" IS NULL;
COMMENT ON COLUMN "User"."name" IS NULL;
COMMENT ON COLUMN "User"."email" IS NULL;
COMMENT ON COLUMN "User"."emailVerified" IS NULL;
COMMENT ON COLUMN "User"."image" IS NULL;

-- ============================================================================
-- CUSTOMER TABLE COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN "Customer"."id" IS NULL;
COMMENT ON COLUMN "Customer"."authUserId" IS NULL;
COMMENT ON COLUMN "Customer"."name" IS NULL;
COMMENT ON COLUMN "Customer"."plan" IS NULL;
COMMENT ON COLUMN "Customer"."stripeCustomerId" IS NULL;
COMMENT ON COLUMN "Customer"."stripeSubscriptionId" IS NULL;
COMMENT ON COLUMN "Customer"."stripePriceId" IS NULL;
COMMENT ON COLUMN "Customer"."stripeCurrentPeriodEnd" IS NULL;
COMMENT ON COLUMN "Customer"."createdAt" IS NULL;
COMMENT ON COLUMN "Customer"."updatedAt" IS NULL;

-- ============================================================================
-- ACCOUNT TABLE COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN "Account"."id" IS NULL;
COMMENT ON COLUMN "Account"."userId" IS NULL;
COMMENT ON COLUMN "Account"."type" IS NULL;
COMMENT ON COLUMN "Account"."provider" IS NULL;
COMMENT ON COLUMN "Account"."providerAccountId" IS NULL;
COMMENT ON COLUMN "Account"."refresh_token" IS NULL;
COMMENT ON COLUMN "Account"."access_token" IS NULL;
COMMENT ON COLUMN "Account"."expires_at" IS NULL;
COMMENT ON COLUMN "Account"."token_type" IS NULL;
COMMENT ON COLUMN "Account"."scope" IS NULL;
COMMENT ON COLUMN "Account"."id_token" IS NULL;
COMMENT ON COLUMN "Account"."session_state" IS NULL;

-- ============================================================================
-- SESSION TABLE COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN "Session"."id" IS NULL;
COMMENT ON COLUMN "Session"."sessionToken" IS NULL;
COMMENT ON COLUMN "Session"."userId" IS NULL;
COMMENT ON COLUMN "Session"."expires" IS NULL;

-- ============================================================================
-- VERIFICATIONTOKEN TABLE COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN "VerificationToken"."identifier" IS NULL;
COMMENT ON COLUMN "VerificationToken"."token" IS NULL;
COMMENT ON COLUMN "VerificationToken"."expires" IS NULL;

-- ============================================================================
-- K8SCLUSTERCONFIG TABLE COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN "K8sClusterConfig"."id" IS NULL;
COMMENT ON COLUMN "K8sClusterConfig"."name" IS NULL;
COMMENT ON COLUMN "K8sClusterConfig"."location" IS NULL;
COMMENT ON COLUMN "K8sClusterConfig"."authUserId" IS NULL;
COMMENT ON COLUMN "K8sClusterConfig"."plan" IS NULL;
COMMENT ON COLUMN "K8sClusterConfig"."network" IS NULL;
COMMENT ON COLUMN "K8sClusterConfig"."createdAt" IS NULL;
COMMENT ON COLUMN "K8sClusterConfig"."updatedAt" IS NULL;
COMMENT ON COLUMN "K8sClusterConfig"."status" IS NULL;
COMMENT ON COLUMN "K8sClusterConfig"."deletedAt" IS NULL;

-- ============================================================================
-- STRIPEWEBHOOKEVENT TABLE COLUMN COMMENTS
-- ============================================================================

COMMENT ON COLUMN "StripeWebhookEvent"."id" IS NULL;
COMMENT ON COLUMN "StripeWebhookEvent"."eventType" IS NULL;
COMMENT ON COLUMN "StripeWebhookEvent"."processed" IS NULL;
COMMENT ON COLUMN "StripeWebhookEvent"."createdAt" IS NULL;
COMMENT ON COLUMN "StripeWebhookEvent"."updatedAt" IS NULL;
