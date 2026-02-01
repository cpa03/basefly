import { db } from "@saasfly/db";

import { IntegrationError } from "./integration";
import { logger } from "./logger";

/**
 * Check if a Stripe webhook event has already been processed
 *
 * @param eventId - Stripe event ID (evt_*)
 * @returns true if event was already processed, false otherwise
 */
export async function hasEventBeenProcessed(eventId: string): Promise<boolean> {
  try {
    const event = await db
      .selectFrom("StripeWebhookEvent")
      .select(["id", "processed"])
      .where("id", "=", eventId)
      .executeTakeFirst();

    return !!event;
  } catch (error) {
    logger.error("Failed to check webhook event processing status", error, { eventId });
    return false;
  }
}

/**
 * Mark a Stripe webhook event as processed
 *
 * @param eventId - Stripe event ID (evt_*)
 * @returns Promise that resolves when the event is marked as processed
 */
export async function markEventAsProcessed(eventId: string): Promise<void> {
  try {
    await db
      .updateTable("StripeWebhookEvent")
      .where("id", "=", eventId)
      .set({
        processed: true,
        updatedAt: new Date(),
      })
      .execute();
  } catch (error) {
    logger.error("Failed to mark webhook event as processed", error, { eventId });
    throw new IntegrationError(
      "Failed to update webhook event status",
      "WEBHOOK_UPDATE_FAILED",
      error,
    );
  }
}

/**
 * Register a new Stripe webhook event for idempotency tracking
 *
 * Attempts to insert a record for the webhook event. If the event already exists,
 * this will fail due to the unique constraint, which indicates the event was
 * already processed.
 *
 * @param eventId - Stripe event ID (evt_*)
 * @param eventType - Stripe event type (e.g., checkout.session.completed)
 * @returns true if event was newly registered, false if already existed
 * @throws IntegrationError if database insert fails for other reasons
 */
export async function registerWebhookEvent(
  eventId: string,
  eventType: string,
): Promise<boolean> {
  try {
    await db
      .insertInto("StripeWebhookEvent")
      .values({
        id: eventId,
        eventType,
        processed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .execute();

    logger.info("Registered new webhook event", { eventId, eventType });
    return true;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      logger.info("Webhook event already processed, skipping", { eventId, eventType });
      return false;
    }

    logger.error("Failed to register webhook event", error, { eventId, eventType });
    throw new IntegrationError(
      "Failed to register webhook event",
      "WEBHOOK_REGISTRATION_FAILED",
      error,
    );
  }
}

/**
 * Check if a database error is a duplicate key violation
 *
 * PostgreSQL duplicate key error codes:
 * - 23505: unique_violation
 *
 * @param error - Error to check
 * @returns true if error is a duplicate key violation
 */
function isDuplicateKeyError(error: unknown): boolean {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code?: string }).code === "string"
  ) {
    const code = (error as { code: string }).code;
    return code === "23505";
  }

  return false;
}

/**
 * Execute a webhook handler with idempotency protection
 *
 * This is a helper function that combines registration and execution:
 * 1. Register the webhook event (fails if duplicate)
 * 2. Execute the handler function
 * 3. Mark the event as processed
 *
 * If the event is a duplicate, the handler function is not called.
 *
 * @param eventId - Stripe event ID (evt_*)
 * @param eventType - Stripe event type
 * @param handler - Async function to execute for the webhook
 * @returns Promise that resolves when handler completes or skips if duplicate
 */
export async function executeIdempotentWebhook<T>(
  eventId: string,
  eventType: string,
  handler: () => Promise<T>,
): Promise<T | null> {
  const isNewEvent = await registerWebhookEvent(eventId, eventType);

  if (!isNewEvent) {
    return null;
  }

  try {
    const result = await handler();
    await markEventAsProcessed(eventId);
    return result;
  } catch (error) {
    logger.error("Webhook handler execution failed", error, { eventId, eventType });
    throw error;
  }
}

/**
 * Clean up old processed webhook events
 *
 * Removes webhook events older than the specified retention period.
 * This should be run periodically to prevent the table from growing indefinitely.
 *
 * @param retentionDays - Number of days to retain events (default: 90)
 * @returns Number of events deleted
 */
export async function cleanupOldWebhookEvents(
  retentionDays: number = 90,
): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await db
      .deleteFrom("StripeWebhookEvent")
      .where("createdAt", "<", cutoffDate)
      .where("processed", "=", true)
      .executeTakeFirst();

    const deletedCount = Number(result.numDeletedRows ?? 0n);

    if (deletedCount > 0) {
      logger.info("Cleaned up old webhook events", {
        deletedCount,
        retentionDays,
        cutoffDate,
      });
    }

    return deletedCount;
  } catch (error) {
    logger.error("Failed to cleanup old webhook events", error, { retentionDays });
    return 0;
  }
}
