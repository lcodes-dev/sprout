/**
 * Email Service
 *
 * Business logic for email operations including consent checking,
 * validation, and sending.
 */

import { getUserByEmail } from "@/db/queries/users.js";
import {
	createScheduledEmail,
	getPendingScheduled,
	markScheduledAsFailed,
	markScheduledAsSent,
} from "@/db/queries/scheduled-emails.js";
import { createSentRecord } from "@/db/queries/sent-emails.js";
import type { NewScheduledEmail } from "@/db/schema/scheduled-emails.js";
import { createEmailProvider } from "../providers/index.js";
import type { EmailMessage } from "../types.js";

/**
 * Check if a user has marketing consent
 *
 * @param email - User's email address
 * @returns True if user has marketing consent, false otherwise
 */
export async function checkMarketingConsent(
	email: string,
): Promise<boolean> {
	const user = await getUserByEmail(email);

	if (!user) {
		// User doesn't exist, no consent
		return false;
	}

	return user.marketingConsent === true;
}

/**
 * Validate email address format
 *
 * @param email - Email address to validate
 * @returns True if email is valid
 */
export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Sanitize HTML content
 * Basic sanitization to prevent XSS attacks
 *
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
	// Remove script tags
	html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

	// Remove event handlers (onclick, onerror, etc.)
	html = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "");
	html = html.replace(/\son\w+\s*=\s*[^\s>]*/gi, "");

	// Remove javascript: protocol
	html = html.replace(/javascript:/gi, "");

	return html;
}

/**
 * Schedule an email to be sent
 *
 * @param emailData - Scheduled email data
 * @returns The created scheduled email
 * @throws Error if validation fails
 */
export async function scheduleEmail(emailData: NewScheduledEmail) {
	// Validate recipient email
	if (!validateEmail(emailData.recipientEmail)) {
		throw new Error(`Invalid email address: ${emailData.recipientEmail}`);
	}

	// Check marketing consent for marketing emails
	if (emailData.emailType === "marketing") {
		const hasConsent = await checkMarketingConsent(emailData.recipientEmail);
		if (!hasConsent) {
			throw new Error(
				`User ${emailData.recipientEmail} has not consented to marketing emails`,
			);
		}
	}

	// Sanitize HTML content
	const sanitizedEmailData = {
		...emailData,
		bodyHtml: sanitizeHtml(emailData.bodyHtml),
	};

	// Create scheduled email
	return await createScheduledEmail(sanitizedEmailData);
}

/**
 * Send a single email immediately
 *
 * @param email - Email message to send
 * @returns Result of the send operation
 */
export async function sendEmail(email: EmailMessage) {
	const provider = createEmailProvider();
	return await provider.send(email);
}

/**
 * Process pending scheduled emails
 *
 * This function should be called periodically (e.g., by a cron job)
 * to send pending scheduled emails that are due.
 */
export async function processPendingEmails(): Promise<void> {
	const pendingEmails = await getPendingScheduled();

	console.log(`Processing ${pendingEmails.length} pending emails...`);

	for (const scheduledEmail of pendingEmails) {
		try {
			// Check marketing consent for marketing emails
			if (scheduledEmail.emailType === "marketing") {
				const hasConsent = await checkMarketingConsent(
					scheduledEmail.recipientEmail,
				);
				if (!hasConsent) {
					await markScheduledAsFailed(
						scheduledEmail.id,
						"User has not consented to marketing emails",
					);
					console.log(
						`Skipped marketing email to ${scheduledEmail.recipientEmail} - no consent`,
					);
					continue;
				}
			}

			// Get default sender info from environment
			const fromEmail =
				process.env.EMAIL_FROM_ADDRESS || "noreply@example.com";
			const fromName = process.env.EMAIL_FROM_NAME || "Sprout";

			// Send the email
			const result = await sendEmail({
				to: {
					email: scheduledEmail.recipientEmail,
					name: scheduledEmail.recipientName || undefined,
				},
				from: {
					email: fromEmail,
					name: fromName,
				},
				subject: scheduledEmail.subject,
				html: scheduledEmail.bodyHtml,
				text: scheduledEmail.bodyText || undefined,
			});

			if (result.success) {
				// Mark as sent
				await markScheduledAsSent(scheduledEmail.id);

				// Create sent record
				await createSentRecord({
					scheduledEmailId: scheduledEmail.id,
					templateId: scheduledEmail.templateId || undefined,
					subject: scheduledEmail.subject,
					bodyHtml: scheduledEmail.bodyHtml,
					bodyText: scheduledEmail.bodyText || undefined,
					recipientEmail: scheduledEmail.recipientEmail,
					recipientName: scheduledEmail.recipientName || undefined,
					emailType: scheduledEmail.emailType,
					sentAt: new Date(),
					deliveryStatus: "sent",
					providerMessageId: result.messageId || undefined,
				});

				console.log(
					`Successfully sent email to ${scheduledEmail.recipientEmail}`,
				);
			} else {
				// Mark as failed
				await markScheduledAsFailed(
					scheduledEmail.id,
					result.error || "Unknown error",
				);
				console.error(
					`Failed to send email to ${scheduledEmail.recipientEmail}: ${result.error}`,
				);
			}
		} catch (error) {
			console.error(`Error processing scheduled email ${scheduledEmail.id}:`, error);
			await markScheduledAsFailed(
				scheduledEmail.id,
				error instanceof Error ? error.message : "Unknown error",
			);
		}
	}

	console.log("Finished processing pending emails");
}
