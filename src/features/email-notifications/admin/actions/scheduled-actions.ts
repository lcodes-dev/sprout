/**
 * Scheduled Email Actions
 *
 * Handler functions for scheduled email routes.
 */

import type { Context } from "hono";
import { getTemplateById } from "@/db/queries/email-templates.js";
import { cancelScheduledEmail as cancelScheduledEmailDb } from "@/db/queries/scheduled-emails.js";
import { scheduleEmail } from "../../services/email-service.js";
import type { NewScheduledEmail } from "@/db/schema/scheduled-emails.js";

/**
 * Create a new scheduled email
 */
export async function createScheduledEmail(c: Context) {
	try {
		const body = await c.req.parseBody();

		// Check if using a template
		const templateId = body.templateId
			? Number(body.templateId)
			: undefined;
		let subject = body.subject as string;
		let bodyHtml = body.bodyHtml as string;
		let bodyText = (body.bodyText as string) || undefined;
		let emailType: "notification" | "marketing" =
			(body.emailType as "notification" | "marketing") || "notification";

		// If using a template, load template data
		if (templateId) {
			const template = await getTemplateById(templateId);
			if (!template) {
				return c.json({ error: "Template not found" }, 404);
			}

			// Use template data (allow override from form)
			subject = subject || template.subject;
			bodyHtml = bodyHtml || template.bodyHtml;
			bodyText = bodyText || template.bodyText || undefined;
			emailType = template.category;
		}

		// Parse scheduled time
		const scheduledFor = new Date(body.scheduledFor as string);
		if (Number.isNaN(scheduledFor.getTime())) {
			return c.json({ error: "Invalid scheduled date/time" }, 400);
		}

		const emailData: NewScheduledEmail = {
			templateId,
			subject,
			bodyHtml,
			bodyText,
			recipientEmail: body.recipientEmail as string,
			recipientName: (body.recipientName as string) || undefined,
			emailType,
			scheduledFor,
			status: "pending",
		};

		// Validate required fields
		if (
			!emailData.subject ||
			!emailData.bodyHtml ||
			!emailData.recipientEmail
		) {
			return c.json(
				{
					error:
						"Missing required fields: subject, bodyHtml, recipientEmail",
				},
				400,
			);
		}

		const scheduled = await scheduleEmail(emailData);

		return c.redirect("/admin/emails/scheduled");
	} catch (error) {
		console.error("Error scheduling email:", error);
		return c.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to schedule email",
			},
			500,
		);
	}
}

/**
 * Cancel a scheduled email
 */
export async function cancelScheduledEmail(c: Context) {
	try {
		const id = Number(c.req.param("id"));

		const cancelled = await cancelScheduledEmailDb(id);

		if (!cancelled) {
			return c.json({ error: "Scheduled email not found" }, 404);
		}

		return c.json({ success: true });
	} catch (error) {
		console.error("Error cancelling scheduled email:", error);
		return c.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to cancel scheduled email",
			},
			500,
		);
	}
}
