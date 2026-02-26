/**
 * Database Seed Script
 *
 * Provides seed data for development and testing environments.
 * This script should NOT be run in production.
 *
 * Usage:
 *   bun db:seed          # Run seed script
 *   bun db:seed:reset    # Reset and reseed database
 *
 * Safety:
 * - Checks for NODE_ENV !== 'production' before seeding
 * - Uses transactions for atomicity
 * - Idempotent: can be run multiple times safely
 */

import { db } from "./index";
import { logger } from "./logger";

const isProduction = process.env.NODE_ENV === "production";

const SEED_CONFIG = {
  testUser: {
    id: "test_user_seed_001",
    name: "Test User",
    email: "test@example.com",
    image: null,
  },
  adminUser: {
    id: "test_admin_seed_001",
    name: "Admin User",
    email: "admin@example.com",
    image: null,
  },
  testClusters: [
    {
      name: "dev-cluster-us-east",
      location: "us-east-1",
      plan: "FREE" as const,
      network: "10.0.0.0/16",
      status: "RUNNING" as const,
    },
    {
      name: "staging-cluster-eu-west",
      location: "eu-west-1",
      plan: "PRO" as const,
      network: "10.1.0.0/16",
      status: "RUNNING" as const,
    },
  ],
};

async function isDatabaseEmpty(): Promise<boolean> {
  const userCount = await db
    .selectFrom("User")
    .select((eb) => eb.fn.count("id").as("count"))
    .executeTakeFirst();

  return Number(userCount?.count) === 0;
}

async function seedUsers(): Promise<void> {
  logger.info("Seeding users...");

  await db
    .insertInto("User")
    .values(SEED_CONFIG.testUser)
    .onConflict((oc) => oc.column("id").doNothing())
    .execute();

  await db
    .insertInto("User")
    .values(SEED_CONFIG.adminUser)
    .onConflict((oc) => oc.column("id").doNothing())
    .execute();

  logger.info("Users seeded successfully");
}

async function seedCustomers(): Promise<void> {
  logger.info("Seeding customers...");

  await db
    .insertInto("Customer")
    .values({
      authUserId: SEED_CONFIG.testUser.id,
      name: SEED_CONFIG.testUser.name,
      plan: "FREE",
    })
    .onConflict((oc) => oc.column("authUserId").doNothing())
    .execute();

  await db
    .insertInto("Customer")
    .values({
      authUserId: SEED_CONFIG.adminUser.id,
      name: SEED_CONFIG.adminUser.name,
      plan: "BUSINESS",
    })
    .onConflict((oc) => oc.column("authUserId").doNothing())
    .execute();

  logger.info("Customers seeded successfully");
}

async function seedClusters(): Promise<void> {
  logger.info("Seeding clusters...");

  for (const cluster of SEED_CONFIG.testClusters) {
    await db
      .insertInto("K8sClusterConfig")
      .values({
        name: cluster.name,
        location: cluster.location,
        authUserId: SEED_CONFIG.testUser.id,
        plan: cluster.plan,
        network: cluster.network,
        status: cluster.status,
        deletedAt: null,
      })
      .onConflict((oc) => oc.doNothing())
      .execute();
  }

  logger.info("Clusters seeded successfully");
}

async function seed(): Promise<void> {
  if (isProduction) {
    logger.error("Seeding is disabled in production environment");
    logger.error("Set NODE_ENV to 'development' or 'test' to enable seeding");
    process.exit(1);
  }

  logger.info("Starting database seeding...", {
    environment: process.env.NODE_ENV ?? "development",
  });

  try {
    const empty = await isDatabaseEmpty();
    if (!empty) {
      logger.warn("Database is not empty. Seed will skip existing records.");
      logger.info("Use 'db:seed:reset' to clear and reseed.");
    }

    await db.transaction().execute(async () => {
      await seedUsers();
      await seedCustomers();
      await seedClusters();
    });

    logger.info("Database seeding completed successfully!");
    logger.info("Seeded users:", {
      users: [SEED_CONFIG.testUser.email, SEED_CONFIG.adminUser.email],
    });
    logger.info("Seeded clusters:", {
      clusters: SEED_CONFIG.testClusters.map((c) => c.name),
    });
  } catch (error) {
    logger.error("Seeding failed with error:", error);
    process.exit(1);
  }
}

export async function clearSeedData(): Promise<void> {
  if (isProduction) {
    throw new Error("Cannot clear seed data in production");
  }

  logger.info("Clearing seed data...");

  const seedUserIds = [SEED_CONFIG.testUser.id, SEED_CONFIG.adminUser.id];

  await db.transaction().execute(async (trx) => {
    await trx
      .deleteFrom("K8sClusterConfig")
      .where("authUserId", "in", seedUserIds)
      .execute();

    await trx
      .deleteFrom("Customer")
      .where("authUserId", "in", seedUserIds)
      .execute();

    await trx.deleteFrom("User").where("id", "in", seedUserIds).execute();
  });

  logger.info("Seed data cleared");
}

void seed();

export { seed, SEED_CONFIG };
