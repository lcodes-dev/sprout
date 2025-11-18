/**
 * Scheduled Email Query Utilities
 *
 * Type-safe query functions for scheduled email database operations.
 */

import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db/connection.js";
import {
	type NewScheduledEmail,
	type ScheduledEmail,
	scheduledEmails,
} from "@/db/schema/scheduled-emails.js";

/**
 * Get all scheduled emails
 *
 * @returns Array of all scheduled emails
 */
export async function getAllScheduled(): Promise<ScheduledEmail[]> {
	return await db.select().from(scheduledEmails);
}

/**
 * Get a scheduled email by ID
 *
 * @param id - The scheduled email ID
 * @returns The scheduled email if found, undefined otherwise
 */
export async function getScheduledById(
	id: number,
): Promise<ScheduledEmail | undefined> {
	const result = await db
		.select()
		.from(scheduledEmails)
		.where(eq(scheduledEmails.id, id));
	return result[0];
}

/**
 * Get scheduled emails by status
 *
 * @param status - The status to filter by
 * @returns Array of scheduled emails with the specified status
 */
export async function getScheduledByStatus(
	status: "pending" | "sent" | "failed" | "cancelled",
): Promise<ScheduledEmail[]> {
	return await db
		.select()
		.from(scheduledEmails)
		.where(eq(scheduledEmails.status, status));
}

/**
 * Get pending scheduled emails that are due to be sent
 *
 * @param currentTime - The current timestamp (defaults to now)
 * @returns Array of pending emails that should be sent
 */
export async function getPendingScheduled(
	currentTime: Date = new Date(),
): Promise<ScheduledEmail[]> {
	return await db
		.select()
		.from(scheduledEmails)
		.where(
			and(
				eq(scheduledEmails.status, "pending"),
				lte(scheduledEmails.scheduledFor, currentTime),
			),
		);
}

/**
 * Get scheduled emails by recipient email
 *
 * @param email - The recipient's email address
 * @returns Array of scheduled emails for the recipient
 */
export async function getScheduledByRecipient(
	email: string,
): Promise<ScheduledEmail[]> {
	return await db
		.select()
		.from(scheduledEmails)
		.where(eq(scheduledEmails.recipientEmail, email));
}

/**
 * Get scheduled emails by email type
 *
 * @param emailType - The email type ('notification' or 'marketing')
 * @returns Array of scheduled emails of the specified type
 */
export async function getScheduledByType(
	emailType: "notification" | "marketing",
): Promise<ScheduledEmail[]> {
	return await db
		.select()
		.from(scheduledEmails)
		.where(eq(scheduledEmails.emailType, emailType));
}

/**
 * Create a new scheduled email
 *
 * @param emailData - Scheduled email data to insert
 * @returns The created scheduled email
 */
export async function createScheduledEmail(
	emailData: NewScheduledEmail,
): Promise<ScheduledEmail> {
	const result = await db
		.insert(scheduledEmails)
		.values(emailData)
		.returning();
	return result[0];
}

/**
 * Update a scheduled email by ID
 *
 * @param id - The scheduled email ID
 * @param emailData - Partial scheduled email data to update
 * @returns The updated scheduled email if found, undefined otherwise
 */
export async function updateScheduledEmail(
	id: number,
	emailData: Partial<NewScheduledEmail>,
): Promise<ScheduledEmail | undefined> {
	const result = await db
		.update(scheduledEmails)
		.set(emailData)
		.where(eq(scheduledEmails.id, id))
		.returning();
	return result[0];
}

/**
 * Mark a scheduled email as sent
 *
 * @param id - The scheduled email ID
 * @param sentAt - The timestamp when sent (defaults to now)
 * @returns The updated scheduled email if found, undefined otherwise
 */
export async function markScheduledAsSent(
	id: number,
	sentAt: Date = new Date(),
): Promise<ScheduledEmail | undefined> {
	return await updateScheduledEmail(id, {
		status: "sent",
		sentAt,
	});
}

/**
 * Mark a scheduled email as failed
 *
 * @param id - The scheduled email ID
 * @param failureReason - The reason for failure
 * @returns The updated scheduled email if found, undefined otherwise
 */
export async function markScheduledAsFailed(
	id: number,
	failureReason: string,
): Promise<ScheduledEmail | undefined> {
	return await updateScheduledEmail(id, {
		status: "failed",
		failureReason,
	});
}

/**
 * Cancel a scheduled email
 *
 * @param id - The scheduled email ID
 * @returns The updated scheduled email if found, undefined otherwise
 */
export async function cancelScheduledEmail(
	id: number,
): Promise<ScheduledEmail | undefined> {
	return await updateScheduledEmail(id, {
		status: "cancelled",
	});
}

/**
 * Delete a scheduled email by ID
 *
 * @param id - The scheduled email ID
 * @returns True if scheduled email was deleted, false if not found
 */
export async function deleteScheduledEmail(id: number): Promise<boolean> {
	const result = await db
		.delete(scheduledEmails)
		.where(eq(scheduledEmails.id, id))
		.returning();
	return result.length > 0;
}

/**
 * Count scheduled emails by status
 *
 * @param status - The status to count
 * @returns The number of scheduled emails with the status
 */
export async function countScheduledByStatus(
	status: "pending" | "sent" | "failed" | "cancelled",
): Promise<number> {
	const result = await db
		.select()
		.from(scheduledEmails)
		.where(eq(scheduledEmails.status, status));
	return result.length;
}
