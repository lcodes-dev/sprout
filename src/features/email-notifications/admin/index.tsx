/**
 * Email Notifications Admin Router
 *
 * Routes for the email notification system admin panel.
 */

import { Hono } from "hono";
import { DashboardView } from "./views/dashboard.js";
import { TemplateListView } from "./views/template-list.js";
import { TemplateFormView } from "./views/template-form.js";
import { ScheduleEmailFormView } from "./views/schedule-email-form.js";
import { ScheduledListView } from "./views/scheduled-list.js";
import { SentListView } from "./views/sent-list.js";
import {
	createTemplate,
	deleteTemplate as deleteTemplateAction,
	updateTemplate,
} from "./actions/template-actions.js";
import {
	cancelScheduledEmail as cancelScheduledEmailAction,
	createScheduledEmail,
} from "./actions/scheduled-actions.js";
import { getAnalytics } from "./actions/analytics-actions.js";

const adminEmails = new Hono();

// Dashboard
adminEmails.get("/", (c) => {
	return c.html(<DashboardView />);
});

// Template routes
adminEmails.get("/templates", async (c) => {
	return c.html(<TemplateListView />);
});

adminEmails.get("/templates/new", (c) => {
	return c.html(<TemplateFormView mode="create" />);
});

adminEmails.post("/templates", async (c) => {
	return await createTemplate(c);
});

adminEmails.get("/templates/:id/edit", async (c) => {
	const id = Number(c.req.param("id"));
	return c.html(<TemplateFormView mode="edit" templateId={id} />);
});

adminEmails.put("/templates/:id", async (c) => {
	return await updateTemplate(c);
});

adminEmails.delete("/templates/:id", async (c) => {
	return await deleteTemplateAction(c);
});

// Scheduled email routes
adminEmails.get("/scheduled", async (c) => {
	return c.html(<ScheduledListView />);
});

adminEmails.get("/scheduled/new", (c) => {
	return c.html(<ScheduleEmailFormView />);
});

adminEmails.post("/scheduled", async (c) => {
	return await createScheduledEmail(c);
});

adminEmails.delete("/scheduled/:id", async (c) => {
	return await cancelScheduledEmailAction(c);
});

// Sent email routes
adminEmails.get("/sent", async (c) => {
	return c.html(<SentListView />);
});

// Analytics API
adminEmails.get("/analytics", async (c) => {
	return await getAnalytics(c);
});

export default adminEmails;
