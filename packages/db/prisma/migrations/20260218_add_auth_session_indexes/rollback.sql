-- Rollback: Remove Authentication and Session Indexes
-- Migration: 20260218_add_auth_session_indexes (rollback)

-- Purpose: Remove indexes added for auth/session optimization
-- Use this if the indexes cause unexpected performance issues

-- Remove all indexes created by the migration
DROP INDEX IF EXISTS "Account_userId_idx";
DROP INDEX IF EXISTS "Session_userId_idx";
DROP INDEX IF EXISTS "Session_expires_idx";
DROP INDEX IF EXISTS "VerificationToken_expires_idx";
DROP INDEX IF EXISTS "VerificationToken_identifier_idx";
