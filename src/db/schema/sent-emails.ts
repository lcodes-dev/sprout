/**
 * Sent Emails Schema
 *
 * Historical record of all sent emails for tracking, analytics, and auditing.
 * Includes delivery status, engagement metrics, and metadata.
 */

import { sql } from "drizzle-orm";
import {
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { emailTemplates } from "./email-templates.js";
import { scheduledEmails } from "./scheduled-emails.js";

/**
 * Sent emails table schema
 *
 * Permanent record of all emails that have been sent.
 */
export const sentEmails = pgTable("sent_emails", {
	/**
	 * Unique identifier for the sent email record
	 * Auto-incrementing primary key
	 */
	id: serial("id").primaryKey(),

	/**
	 * Reference to the scheduled email (if sent via scheduler)
	 * NULL for manually sent emails
	 */
	scheduledEmailId: integer("scheduled_email_id").references(
		() => scheduledEmails.id,
		{ onDelete: "set null" },
	),

	/**
	 * Reference to the template used (if any)
	 * NULL if email was created with custom content
	 */
	templateId: integer("template_id").references(() => emailTemplates.id, {
		onDelete: "set null",
	}),

	/**
	 * Email subject line
	 */
	subject: text("subject").notNull(),

	/**
	 * HTML version of the email body
	 */
	bodyHtml: text("body_html").notNull(),

	/**
	 * Plain text version of the email body
	 */
	bodyText: text("body_text"),

	/**
	 * Recipient's email address
	 */
	recipientEmail: text("recipient_email").notNull(),

	/**
	 * Recipient's name (if available)
	 */
	recipientName: text("recipient_name"),

	/**
	 * Type of email
	 */
	emailType: text("email_type", { enum: ["notification", "marketing"] })
		.notNull()
		.default("notification"),

	/**
	 * Timestamp of when the email was sent
	 */
	sentAt: timestamp("sent_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	/**
	 * Delivery status from the email provider
	 */
	deliveryStatus: text("delivery_status", {
		enum: ["sent", "delivered", "bounced", "failed"],
	})
		.notNull()
		.default("sent"),

	/**
	 * Timestamp of when the email was opened by recipient
	 * NULL if not opened or tracking not available
	 */
	openedAt: timestamp("opened_at"),

	/**
	 * Timestamp of when a link in the email was clicked
	 * NULL if not clicked or tracking not available
	 */
	clickedAt: timestamp("clicked_at"),

	/**
	 * Message ID from the email provider
	 * Used for tracking with the provider's API
	 */
	providerMessageId: text("provider_message_id"),

	/**
	 * Additional metadata (JSON)
	 * Can store provider-specific data, custom fields, etc.
	 */
	metadata: jsonb("metadata"),

	/**
	 * Timestamp of when the record was created
	 */
	createdAt: timestamp("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

/**
 * TypeScript type for a sent email record (inferred from schema)
 */
export type SentEmail = typeof sentEmails.$inferSelect;

/**
 * TypeScript type for creating a new sent email record (insert)
 */
export type NewSentEmail = typeof sentEmails.$inferInsert;
