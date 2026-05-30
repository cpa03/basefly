/**
 * Database Client Instance
 *
 * Creates and exports the singleton Kysely database instance.
 * Separated from index.ts to break circular dependencies with
 * service modules that need the db instance.
 *
 * @module db-instance
 */

import { createKysely } from "@vercel/postgres-kysely";

import type { DB } from "./prisma/types";

/**
 * The Kysely database instance configured for PostgreSQL.
 * All database operations go through this instance.
 */
export const db = createKysely<DB>();
