/**
 * Email Templates Query Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
	createTemplate,
	deleteTemplate,
	getAllTemplates,
	getTemplateById,
	getTemplateByName,
	getTemplatesByCategory,
	updateTemplate,
	countTemplates,
	countTemplatesByCategory,
} from "./email-templates.js";
import type { NewEmailTemplate } from "@/db/schema/email-templates.js";

describe("Email Templates Queries", () => {
	const mockTemplate: NewEmailTemplate = {
		name: "Test Template",
		subject: "Test Subject",
		bodyHtml: "<h1>Test</h1>",
		bodyText: "Test",
		category: "notification",
	};

	describe("createTemplate", () => {
		it("should create a new template", async () => {
			const template = await createTemplate(mockTemplate);

			expect(template).toBeDefined();
			expect(template.id).toBeDefined();
			expect(template.name).toBe(mockTemplate.name);
			expect(template.subject).toBe(mockTemplate.subject);
			expect(template.category).toBe(mockTemplate.category);
		});

		it("should fail to create template with duplicate name", async () => {
			await createTemplate(mockTemplate);

			await expect(createTemplate(mockTemplate)).rejects.toThrow();
		});
	});

	describe("getTemplateById", () => {
		it("should retrieve template by id", async () => {
			const created = await createTemplate(mockTemplate);
			const retrieved = await getTemplateById(created.id);

			expect(retrieved).toBeDefined();
			expect(retrieved?.id).toBe(created.id);
			expect(retrieved?.name).toBe(mockTemplate.name);
		});

		it("should return undefined for non-existent id", async () => {
			const retrieved = await getTemplateById(999999);

			expect(retrieved).toBeUndefined();
		});
	});

	describe("getTemplateByName", () => {
		it("should retrieve template by name", async () => {
			await createTemplate(mockTemplate);
			const retrieved = await getTemplateByName(mockTemplate.name);

			expect(retrieved).toBeDefined();
			expect(retrieved?.name).toBe(mockTemplate.name);
		});

		it("should return undefined for non-existent name", async () => {
			const retrieved = await getTemplateByName("Non-existent Template");

			expect(retrieved).toBeUndefined();
		});
	});

	describe("getTemplatesByCategory", () => {
		it("should retrieve templates by category", async () => {
			await createTemplate({ ...mockTemplate, name: "Template 1" });
			await createTemplate({
				...mockTemplate,
				name: "Template 2",
				category: "marketing",
			});

			const notifications = await getTemplatesByCategory("notification");
			const marketing = await getTemplatesByCategory("marketing");

			expect(notifications.length).toBeGreaterThan(0);
			expect(marketing.length).toBeGreaterThan(0);
			expect(notifications.every((t) => t.category === "notification")).toBe(
				true,
			);
			expect(marketing.every((t) => t.category === "marketing")).toBe(true);
		});
	});

	describe("updateTemplate", () => {
		it("should update template", async () => {
			const created = await createTemplate(mockTemplate);
			const updated = await updateTemplate(created.id, {
				subject: "Updated Subject",
			});

			expect(updated).toBeDefined();
			expect(updated?.subject).toBe("Updated Subject");
			expect(updated?.name).toBe(mockTemplate.name);
		});

		it("should return undefined for non-existent id", async () => {
			const updated = await updateTemplate(999999, {
				subject: "Updated",
			});

			expect(updated).toBeUndefined();
		});
	});

	describe("deleteTemplate", () => {
		it("should delete template", async () => {
			const created = await createTemplate(mockTemplate);
			const deleted = await deleteTemplate(created.id);

			expect(deleted).toBe(true);

			const retrieved = await getTemplateById(created.id);
			expect(retrieved).toBeUndefined();
		});

		it("should return false for non-existent id", async () => {
			const deleted = await deleteTemplate(999999);

			expect(deleted).toBe(false);
		});
	});

	describe("countTemplates", () => {
		it("should count all templates", async () => {
			const initialCount = await countTemplates();

			await createTemplate({ ...mockTemplate, name: "Count Test 1" });
			await createTemplate({ ...mockTemplate, name: "Count Test 2" });

			const finalCount = await countTemplates();

			expect(finalCount).toBe(initialCount + 2);
		});
	});

	describe("countTemplatesByCategory", () => {
		it("should count templates by category", async () => {
			const initialNotificationCount =
				await countTemplatesByCategory("notification");
			const initialMarketingCount = await countTemplatesByCategory("marketing");

			await createTemplate({
				...mockTemplate,
				name: "Notification Template",
				category: "notification",
			});
			await createTemplate({
				...mockTemplate,
				name: "Marketing Template",
				category: "marketing",
			});

			const finalNotificationCount =
				await countTemplatesByCategory("notification");
			const finalMarketingCount = await countTemplatesByCategory("marketing");

			expect(finalNotificationCount).toBe(initialNotificationCount + 1);
			expect(finalMarketingCount).toBe(initialMarketingCount + 1);
		});
	});
});
