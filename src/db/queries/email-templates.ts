/**
 * Email Template Query Utilities
 *
 * Type-safe query functions for email template database operations.
 */

import { eq } from "drizzle-orm";
import { db } from "@/db/connection.js";
import {
	type EmailTemplate,
	type NewEmailTemplate,
	emailTemplates,
} from "@/db/schema/email-templates.js";

/**
 * Get all email templates
 *
 * @returns Array of all email templates
 */
export async function getAllTemplates(): Promise<EmailTemplate[]> {
	return await db.select().from(emailTemplates);
}

/**
 * Get an email template by ID
 *
 * @param id - The template ID
 * @returns The template if found, undefined otherwise
 */
export async function getTemplateById(
	id: number,
): Promise<EmailTemplate | undefined> {
	const result = await db
		.select()
		.from(emailTemplates)
		.where(eq(emailTemplates.id, id));
	return result[0];
}

/**
 * Get email templates by category
 *
 * @param category - The template category ('notification' or 'marketing')
 * @returns Array of templates in the specified category
 */
export async function getTemplatesByCategory(
	category: "notification" | "marketing",
): Promise<EmailTemplate[]> {
	return await db
		.select()
		.from(emailTemplates)
		.where(eq(emailTemplates.category, category));
}

/**
 * Get an email template by name
 *
 * @param name - The template name
 * @returns The template if found, undefined otherwise
 */
export async function getTemplateByName(
	name: string,
): Promise<EmailTemplate | undefined> {
	const result = await db
		.select()
		.from(emailTemplates)
		.where(eq(emailTemplates.name, name));
	return result[0];
}

/**
 * Create a new email template
 *
 * @param templateData - Template data to insert
 * @returns The created template
 */
export async function createTemplate(
	templateData: NewEmailTemplate,
): Promise<EmailTemplate> {
	const result = await db
		.insert(emailTemplates)
		.values(templateData)
		.returning();
	return result[0];
}

/**
 * Update an email template by ID
 *
 * @param id - The template ID
 * @param templateData - Partial template data to update
 * @returns The updated template if found, undefined otherwise
 */
export async function updateTemplate(
	id: number,
	templateData: Partial<NewEmailTemplate>,
): Promise<EmailTemplate | undefined> {
	const result = await db
		.update(emailTemplates)
		.set(templateData)
		.where(eq(emailTemplates.id, id))
		.returning();
	return result[0];
}

/**
 * Delete an email template by ID
 *
 * @param id - The template ID
 * @returns True if template was deleted, false if not found
 */
export async function deleteTemplate(id: number): Promise<boolean> {
	const result = await db
		.delete(emailTemplates)
		.where(eq(emailTemplates.id, id))
		.returning();
	return result.length > 0;
}

/**
 * Count total number of templates
 *
 * @returns The total number of templates
 */
export async function countTemplates(): Promise<number> {
	const result = await db.select().from(emailTemplates);
	return result.length;
}

/**
 * Count templates by category
 *
 * @param category - The template category
 * @returns The number of templates in the category
 */
export async function countTemplatesByCategory(
	category: "notification" | "marketing",
): Promise<number> {
	const result = await db
		.select()
		.from(emailTemplates)
		.where(eq(emailTemplates.category, category));
	return result.length;
}
