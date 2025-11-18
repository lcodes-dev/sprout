/**
 * Email Service Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	checkMarketingConsent,
	validateEmail,
	sanitizeHtml,
	scheduleEmail,
} from "./email-service.js";
import type { NewScheduledEmail } from "@/db/schema/scheduled-emails.js";

describe("Email Service", () => {
	describe("validateEmail", () => {
		it("should validate correct email addresses", () => {
			expect(validateEmail("test@example.com")).toBe(true);
			expect(validateEmail("user.name@domain.co.uk")).toBe(true);
			expect(validateEmail("user+tag@example.com")).toBe(true);
		});

		it("should reject invalid email addresses", () => {
			expect(validateEmail("invalid")).toBe(false);
			expect(validateEmail("@example.com")).toBe(false);
			expect(validateEmail("user@")).toBe(false);
			expect(validateEmail("user @example.com")).toBe(false);
		});
	});

	describe("sanitizeHtml", () => {
		it("should remove script tags", () => {
			const html = '<p>Safe content</p><script>alert("xss")</script>';
			const sanitized = sanitizeHtml(html);

			expect(sanitized).not.toContain("<script>");
			expect(sanitized).toContain("<p>Safe content</p>");
		});

		it("should remove event handlers", () => {
			const html = '<button onclick="alert(\'xss\')">Click</button>';
			const sanitized = sanitizeHtml(html);

			expect(sanitized).not.toContain("onclick");
		});

		it("should remove javascript: protocol", () => {
			const html = '<a href="javascript:alert(\'xss\')">Link</a>';
			const sanitized = sanitizeHtml(html);

			expect(sanitized).not.toContain("javascript:");
		});

		it("should preserve safe HTML", () => {
			const html =
				"<h1>Title</h1><p>Paragraph</p><a href='https://example.com'>Link</a>";
			const sanitized = sanitizeHtml(html);

			expect(sanitized).toContain("<h1>Title</h1>");
			expect(sanitized).toContain("<p>Paragraph</p>");
			expect(sanitized).toContain("https://example.com");
		});
	});

	describe("scheduleEmail", () => {
		it("should reject invalid email addresses", async () => {
			const emailData: NewScheduledEmail = {
				subject: "Test",
				bodyHtml: "<p>Test</p>",
				recipientEmail: "invalid-email",
				emailType: "notification",
				scheduledFor: new Date(),
				status: "pending",
			};

			await expect(scheduleEmail(emailData)).rejects.toThrow(
				"Invalid email address",
			);
		});

		it("should sanitize HTML content", async () => {
			const emailData: NewScheduledEmail = {
				subject: "Test",
				bodyHtml: '<p>Test</p><script>alert("xss")</script>',
				recipientEmail: "test@example.com",
				emailType: "notification",
				scheduledFor: new Date(),
				status: "pending",
			};

			// Mock the database call
			vi.mock("@/db/queries/scheduled-emails.js", () => ({
				createScheduledEmail: vi.fn().mockResolvedValue({
					id: 1,
					...emailData,
					bodyHtml: "<p>Test</p>",
				}),
			}));

			const result = await scheduleEmail(emailData);

			expect(result.bodyHtml).not.toContain("<script>");
		});
	});

	describe("checkMarketingConsent", () => {
		it("should return false for non-existent users", async () => {
			const hasConsent = await checkMarketingConsent(
				"nonexistent@example.com",
			);

			expect(hasConsent).toBe(false);
		});
	});
});
