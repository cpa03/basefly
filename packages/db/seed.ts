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
  // eslint-disable-next-line no-console
  console.log("Seeding users...");

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

  // eslint-disable-next-line no-console
  console.log("✓ Users seeded successfully");
}

async function seedCustomers(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Seeding customers...");

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

  // eslint-disable-next-line no-console
  console.log("✓ Customers seeded successfully");
}

async function seedClusters(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Seeding clusters...");

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

  // eslint-disable-next-line no-console
  console.log("✓ Clusters seeded successfully");
}

async function seed(): Promise<void> {
  if (isProduction) {
    console.error("❌ Seeding is disabled in production environment");
    console.error("Set NODE_ENV to 'development' or 'test' to enable seeding");
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log("🌱 Starting database seeding...");
  // eslint-disable-next-line no-console
  console.log(`Environment: ${process.env.NODE_ENV ?? "development"}`);
  // eslint-disable-next-line no-console
  console.log("");

  try {
    const empty = await isDatabaseEmpty();
    if (!empty) {
      // eslint-disable-next-line no-console
      console.log(
        "⚠️  Database is not empty. Seed will skip existing records.",
      );
      // eslint-disable-next-line no-console
      console.log("   Use 'db:seed:reset' to clear and reseed.");
      // eslint-disable-next-line no-console
      console.log("");
    }

    await db.transaction().execute(async () => {
      await seedUsers();
    });

    await seedCustomers();
    await seedClusters();

    // eslint-disable-next-line no-console
    console.log("");
    // eslint-disable-next-line no-console
    console.log("✅ Database seeding completed successfully!");
    // eslint-disable-next-line no-console
    console.log("");
    // eslint-disable-next-line no-console
    console.log("Seeded data:");
    // eslint-disable-next-line no-console
    console.log(
      `  - Users: ${SEED_CONFIG.testUser.email}, ${SEED_CONFIG.adminUser.email}`,
    );
    // eslint-disable-next-line no-console
    console.log(
      `  - Clusters: ${SEED_CONFIG.testClusters.map((c) => c.name).join(", ")}`,
    );
  } catch (error) {
    console.error("");
    console.error("❌ Seeding failed with error:");
    console.error(error);
    process.exit(1);
  }
}

export async function clearSeedData(): Promise<void> {
  if (isProduction) {
    throw new Error("Cannot clear seed data in production");
  }

  // eslint-disable-next-line no-console
  console.log("🧹 Clearing seed data...");

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

  // eslint-disable-next-line no-console
  console.log("✓ Seed data cleared");
}

void seed();

export { seed, SEED_CONFIG };
