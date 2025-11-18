/**
 * Scheduled Emails Schema
 *
 * Defines emails that are scheduled to be sent at a specific time.
 * Can be created from templates or with custom content.
 */

import { sql } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { emailTemplates } from "./email-templates.js";

/**
 * Scheduled emails table schema
 *
 * Tracks emails that are scheduled for future sending.
 */
export const scheduledEmails = pgTable("scheduled_emails", {
	/**
	 * Unique identifier for the scheduled email
	 * Auto-incrementing primary key
	 */
	id: serial("id").primaryKey(),

	/**
	 * Reference to the template used (if any)
	 * NULL if email was created with custom content
	 */
	templateId: integer("template_id").references(() => emailTemplates.id, {
		onDelete: "set null",
	}),

	/**
	 * Email subject line
	 * Required even if using a template
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
	 * Recipient's name (optional, used in personalization)
	 */
	recipientName: text("recipient_name"),

	/**
	 * Type of email (determines consent requirements)
	 */
	emailType: text("email_type", { enum: ["notification", "marketing"] })
		.notNull()
		.default("notification"),

	/**
	 * When the email should be sent
	 */
	scheduledFor: timestamp("scheduled_for").notNull(),

	/**
	 * Current status of the scheduled email
	 */
	status: text("status", {
		enum: ["pending", "sent", "failed", "cancelled"],
	})
		.notNull()
		.default("pending"),

	/**
	 * Timestamp of when the email was actually sent
	 * NULL until the email is sent
	 */
	sentAt: timestamp("sent_at"),

	/**
	 * Reason for failure if status is 'failed'
	 */
	failureReason: text("failure_reason"),

	/**
	 * Timestamp of when the scheduled email was created
	 */
	createdAt: timestamp("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	/**
	 * Timestamp of when the scheduled email was last updated
	 */
	updatedAt: timestamp("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

/**
 * TypeScript type for a scheduled email (inferred from schema)
 */
export type ScheduledEmail = typeof scheduledEmails.$inferSelect;

/**
 * TypeScript type for creating a new scheduled email (insert)
 */
export type NewScheduledEmail = typeof scheduledEmails.$inferInsert;
