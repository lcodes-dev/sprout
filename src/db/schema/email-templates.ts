/**
 * Email Templates Schema
 *
 * Defines reusable email templates for notifications and marketing.
 * Templates can be used to schedule emails with consistent branding and content.
 */

import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Email templates table schema
 *
 * Stores reusable email templates with HTML and plain text content.
 */
export const emailTemplates = pgTable("email_templates", {
	/**
	 * Unique identifier for the template
	 * Auto-incrementing primary key
	 */
	id: serial("id").primaryKey(),

	/**
	 * Template name (must be unique)
	 * Used for easy identification and selection
	 */
	name: text("name").notNull().unique(),

	/**
	 * Email subject line
	 * Can include template variables like {{name}}
	 */
	subject: text("subject").notNull(),

	/**
	 * HTML version of the email body
	 * Required for all templates
	 */
	bodyHtml: text("body_html").notNull(),

	/**
	 * Plain text version of the email body
	 * Fallback for email clients that don't support HTML
	 */
	bodyText: text("body_text"),

	/**
	 * Template category
	 * Determines consent requirements and usage context
	 */
	category: text("category", { enum: ["notification", "marketing"] })
		.notNull()
		.default("notification"),

	/**
	 * Timestamp of when the template was created
	 */
	createdAt: timestamp("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	/**
	 * Timestamp of when the template was last updated
	 */
	updatedAt: timestamp("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

/**
 * TypeScript type for an email template (inferred from schema)
 *
 * @example
 * const template: EmailTemplate = {
 *   id: 1,
 *   name: "Welcome Email",
 *   subject: "Welcome to our platform!",
 *   bodyHtml: "<h1>Welcome!</h1>",
 *   // ... other fields
 * }
 */
export type EmailTemplate = typeof emailTemplates.$inferSelect;

/**
 * TypeScript type for creating a new email template (insert)
 * Excludes auto-generated fields like id, createdAt, updatedAt
 *
 * @example
 * const newTemplate: NewEmailTemplate = {
 *   name: "Welcome Email",
 *   subject: "Welcome!",
 *   bodyHtml: "<h1>Welcome!</h1>",
 *   category: "notification"
 * }
 */
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;
