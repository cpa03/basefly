-- Add Indexes for Authentication and Session Tables
-- Migration: 20260218_add_auth_session_indexes

-- Purpose: Optimize query performance for authentication and session management
-- Impact: Faster user account lookups, session validation, and token cleanup

-- Index 1: Account.userId for user account lookups
-- Optimizes queries finding all OAuth accounts for a user
-- Used by: Authentication flows, account linking, provider management
CREATE INDEX IF NOT EXISTS "Account_userId_idx"
ON "Account" ("userId");

-- Index 2: Session.userId for session validation
-- Optimizes queries validating user sessions
-- Used by: Session middleware, auth checks, session cleanup
CREATE INDEX IF NOT EXISTS "Session_userId_idx"
ON "Session" ("userId");

-- Index 3: Session.expires for session cleanup jobs
-- Optimizes cleanup jobs that delete expired sessions
-- Used by: Scheduled cleanup jobs, session garbage collection
CREATE INDEX IF NOT EXISTS "Session_expires_idx"
ON "Session" ("expires");

-- Index 4: VerificationToken.expires for token cleanup jobs
-- Optimizes cleanup jobs that delete expired verification tokens
-- Used by: Email verification cleanup, password reset cleanup
CREATE INDEX IF NOT EXISTS "VerificationToken_expires_idx"
ON "VerificationToken" ("expires");

-- Index 5: VerificationToken.identifier for token lookups
-- Optimizes token validation by identifier (e.g., email address)
-- Used by: Email verification, password reset flows
CREATE INDEX IF NOT EXISTS "VerificationToken_identifier_idx"
ON "VerificationToken" ("identifier");

-- Notes:
-- 1. These indexes complement the existing unique constraints
-- 2. Account table has a unique constraint on (provider, providerAccountId)
--    but no index on userId for reverse lookups
-- 3. Session table has a unique constraint on sessionToken
--    but no index on userId for user session queries
-- 4. VerificationToken has unique constraints on token and (identifier, token)
--    but no index on expires for cleanup optimization
--
-- Performance Benefits:
-- - Account_userId_idx: O(log n) instead of O(n) for user account lookups
-- - Session_userId_idx: Faster session validation per user
-- - Session_expires_idx: Efficient cleanup of expired sessions
-- - VerificationToken_expires_idx: Efficient cleanup of expired tokens
-- - VerificationToken_identifier_idx: Faster token validation by email
--
-- Index Strategy:
-- - All indexes use IF NOT EXISTS for idempotency
-- - Single-column indexes for specific query patterns
-- - These tables typically have low-to-moderate write volume
--
-- Rollback Strategy:
-- DROP INDEX IF EXISTS "Account_userId_idx";
-- DROP INDEX IF EXISTS "Session_userId_idx";
-- DROP INDEX IF EXISTS "Session_expires_idx";
-- DROP INDEX IF EXISTS "VerificationToken_expires_idx";
-- DROP INDEX IF EXISTS "VerificationToken_identifier_idx";
