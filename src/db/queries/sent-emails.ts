/**
 * Sent Email Query Utilities
 *
 * Type-safe query functions for sent email database operations.
 */

import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db/connection.js";
import {
	type NewSentEmail,
	type SentEmail,
	sentEmails,
} from "@/db/schema/sent-emails.js";

/**
 * Get all sent emails
 *
 * @param limit - Optional limit for number of results
 * @returns Array of all sent emails
 */
export async function getAllSent(limit?: number): Promise<SentEmail[]> {
	const query = db.select().from(sentEmails).orderBy(desc(sentEmails.sentAt));

	if (limit) {
		return await query.limit(limit);
	}

	return await query;
}

/**
 * Get a sent email by ID
 *
 * @param id - The sent email ID
 * @returns The sent email if found, undefined otherwise
 */
export async function getSentById(
	id: number,
): Promise<SentEmail | undefined> {
	const result = await db
		.select()
		.from(sentEmails)
		.where(eq(sentEmails.id, id));
	return result[0];
}

/**
 * Get sent emails by recipient email
 *
 * @param email - The recipient's email address
 * @returns Array of sent emails for the recipient
 */
export async function getSentByRecipient(email: string): Promise<SentEmail[]> {
	return await db
		.select()
		.from(sentEmails)
		.where(eq(sentEmails.recipientEmail, email))
		.orderBy(desc(sentEmails.sentAt));
}

/**
 * Get sent emails by delivery status
 *
 * @param status - The delivery status
 * @returns Array of sent emails with the specified status
 */
export async function getSentByDeliveryStatus(
	status: "sent" | "delivered" | "bounced" | "failed",
): Promise<SentEmail[]> {
	return await db
		.select()
		.from(sentEmails)
		.where(eq(sentEmails.deliveryStatus, status))
		.orderBy(desc(sentEmails.sentAt));
}

/**
 * Get sent emails by email type
 *
 * @param emailType - The email type ('notification' or 'marketing')
 * @returns Array of sent emails of the specified type
 */
export async function getSentByType(
	emailType: "notification" | "marketing",
): Promise<SentEmail[]> {
	return await db
		.select()
		.from(sentEmails)
		.where(eq(sentEmails.emailType, emailType))
		.orderBy(desc(sentEmails.sentAt));
}

/**
 * Get sent emails by template ID
 *
 * @param templateId - The template ID
 * @returns Array of sent emails using the specified template
 */
export async function getSentByTemplate(
	templateId: number,
): Promise<SentEmail[]> {
	return await db
		.select()
		.from(sentEmails)
		.where(eq(sentEmails.templateId, templateId))
		.orderBy(desc(sentEmails.sentAt));
}

/**
 * Get sent emails within a date range
 *
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Array of sent emails within the range
 */
export async function getSentByDateRange(
	startDate: Date,
	endDate: Date,
): Promise<SentEmail[]> {
	return await db
		.select()
		.from(sentEmails)
		.where(
			and(gte(sentEmails.sentAt, startDate), lte(sentEmails.sentAt, endDate)),
		)
		.orderBy(desc(sentEmails.sentAt));
}

/**
 * Create a new sent email record
 *
 * @param emailData - Sent email data to insert
 * @returns The created sent email record
 */
export async function createSentRecord(
	emailData: NewSentEmail,
): Promise<SentEmail> {
	const result = await db.insert(sentEmails).values(emailData).returning();
	return result[0];
}

/**
 * Update delivery status of a sent email
 *
 * @param id - The sent email ID
 * @param status - The new delivery status
 * @returns The updated sent email if found, undefined otherwise
 */
export async function updateDeliveryStatus(
	id: number,
	status: "sent" | "delivered" | "bounced" | "failed",
): Promise<SentEmail | undefined> {
	const result = await db
		.update(sentEmails)
		.set({ deliveryStatus: status })
		.where(eq(sentEmails.id, id))
		.returning();
	return result[0];
}

/**
 * Mark a sent email as opened
 *
 * @param id - The sent email ID
 * @param openedAt - The timestamp when opened (defaults to now)
 * @returns The updated sent email if found, undefined otherwise
 */
export async function markAsOpened(
	id: number,
	openedAt: Date = new Date(),
): Promise<SentEmail | undefined> {
	const result = await db
		.update(sentEmails)
		.set({ openedAt })
		.where(eq(sentEmails.id, id))
		.returning();
	return result[0];
}

/**
 * Mark a sent email as clicked
 *
 * @param id - The sent email ID
 * @param clickedAt - The timestamp when clicked (defaults to now)
 * @returns The updated sent email if found, undefined otherwise
 */
export async function markAsClicked(
	id: number,
	clickedAt: Date = new Date(),
): Promise<SentEmail | undefined> {
	const result = await db
		.update(sentEmails)
		.set({ clickedAt })
		.where(eq(sentEmails.id, id))
		.returning();
	return result[0];
}

/**
 * Count sent emails by delivery status
 *
 * @param status - The delivery status
 * @returns The number of sent emails with the status
 */
export async function countSentByStatus(
	status: "sent" | "delivered" | "bounced" | "failed",
): Promise<number> {
	const result = await db
		.select()
		.from(sentEmails)
		.where(eq(sentEmails.deliveryStatus, status));
	return result.length;
}

/**
 * Count total sent emails
 *
 * @returns The total number of sent emails
 */
export async function countTotalSent(): Promise<number> {
	const result = await db.select().from(sentEmails);
	return result.length;
}

/**
 * Count sent emails by email type
 *
 * @param emailType - The email type
 * @returns The number of sent emails of the type
 */
export async function countSentByType(
	emailType: "notification" | "marketing",
): Promise<number> {
	const result = await db
		.select()
		.from(sentEmails)
		.where(eq(sentEmails.emailType, emailType));
	return result.length;
}
