/**
 * Template Actions
 *
 * Handler functions for template-related routes.
 */

import type { Context } from "hono";
import {
	createTemplate as createTemplateDb,
	deleteTemplate as deleteTemplateDb,
	updateTemplate as updateTemplateDb,
} from "@/db/queries/email-templates.js";
import type { NewEmailTemplate } from "@/db/schema/email-templates.js";
import { sanitizeHtml } from "../../services/email-service.js";

/**
 * Create a new email template
 */
export async function createTemplate(c: Context) {
	try {
		const body = await c.req.parseBody();

		const templateData: NewEmailTemplate = {
			name: body.name as string,
			subject: body.subject as string,
			bodyHtml: sanitizeHtml(body.bodyHtml as string),
			bodyText: (body.bodyText as string) || undefined,
			category: (body.category as "notification" | "marketing") || "notification",
		};

		// Validate required fields
		if (!templateData.name || !templateData.subject || !templateData.bodyHtml) {
			return c.json(
				{ error: "Missing required fields: name, subject, bodyHtml" },
				400,
			);
		}

		const template = await createTemplateDb(templateData);

		// Return success with redirect
		return c.redirect("/admin/emails/templates");
	} catch (error) {
		console.error("Error creating template:", error);
		return c.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to create template",
			},
			500,
		);
	}
}

/**
 * Update an existing email template
 */
export async function updateTemplate(c: Context) {
	try {
		const id = Number(c.req.param("id"));
		const body = await c.req.parseBody();

		const templateData: Partial<NewEmailTemplate> = {
			name: body.name as string,
			subject: body.subject as string,
			bodyHtml: sanitizeHtml(body.bodyHtml as string),
			bodyText: (body.bodyText as string) || undefined,
			category: (body.category as "notification" | "marketing") || "notification",
		};

		const updated = await updateTemplateDb(id, templateData);

		if (!updated) {
			return c.json({ error: "Template not found" }, 404);
		}

		return c.redirect("/admin/emails/templates");
	} catch (error) {
		console.error("Error updating template:", error);
		return c.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to update template",
			},
			500,
		);
	}
}

/**
 * Delete an email template
 */
export async function deleteTemplate(c: Context) {
	try {
		const id = Number(c.req.param("id"));

		const deleted = await deleteTemplateDb(id);

		if (!deleted) {
			return c.json({ error: "Template not found" }, 404);
		}

		return c.json({ success: true });
	} catch (error) {
		console.error("Error deleting template:", error);
		return c.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to delete template",
			},
			500,
		);
	}
}
