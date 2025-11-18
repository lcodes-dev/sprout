/**
 * Email Analytics Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
	getEmailStats,
	getTemplatePerformance,
	getEmailVolumeOverTime,
	getEngagementMetrics,
} from "./email-analytics.js";
import { createSentRecord } from "./sent-emails.js";
import { createTemplate } from "./email-templates.js";
import type { NewSentEmail } from "@/db/schema/sent-emails.js";

describe("Email Analytics", () => {
	const mockSentEmail: NewSentEmail = {
		subject: "Test Email",
		bodyHtml: "<p>Test</p>",
		recipientEmail: "test@example.com",
		emailType: "notification",
		sentAt: new Date(),
		deliveryStatus: "delivered",
	};

	describe("getEmailStats", () => {
		it("should return email statistics", async () => {
			// Create some test sent emails
			await createSentRecord({
				...mockSentEmail,
				deliveryStatus: "delivered",
				openedAt: new Date(),
			});
			await createSentRecord({
				...mockSentEmail,
				deliveryStatus: "delivered",
			});
			await createSentRecord({
				...mockSentEmail,
				deliveryStatus: "failed",
			});

			const stats = await getEmailStats();

			expect(stats).toBeDefined();
			expect(stats.totalSent).toBeGreaterThan(0);
			expect(stats.totalDelivered).toBeGreaterThan(0);
			expect(stats.deliveryRate).toBeGreaterThanOrEqual(0);
			expect(stats.deliveryRate).toBeLessThanOrEqual(100);
			expect(stats.openRate).toBeGreaterThanOrEqual(0);
			expect(stats.openRate).toBeLessThanOrEqual(100);
		});

		it("should filter by date range", async () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);

			await createSentRecord({
				...mockSentEmail,
				sentAt: new Date(),
			});

			const stats = await getEmailStats(yesterday, tomorrow);

			expect(stats.totalSent).toBeGreaterThan(0);
		});

		it("should calculate correct rates", async () => {
			// Create 10 delivered emails, 5 opened, 2 clicked
			for (let i = 0; i < 10; i++) {
				await createSentRecord({
					...mockSentEmail,
					recipientEmail: `test${i}@example.com`,
					deliveryStatus: "delivered",
					openedAt: i < 5 ? new Date() : undefined,
					clickedAt: i < 2 ? new Date() : undefined,
				});
			}

			const stats = await getEmailStats();

			// Open rate should be 50% (5/10)
			expect(stats.openRate).toBeGreaterThanOrEqual(45);
			expect(stats.openRate).toBeLessThanOrEqual(55);

			// Click rate should be 40% (2/5)
			expect(stats.clickRate).toBeGreaterThanOrEqual(35);
			expect(stats.clickRate).toBeLessThanOrEqual(45);
		});
	});

	describe("getTemplatePerformance", () => {
		it("should return template performance stats", async () => {
			const template = await createTemplate({
				name: "Performance Test",
				subject: "Test",
				bodyHtml: "<p>Test</p>",
				category: "notification",
			});

			await createSentRecord({
				...mockSentEmail,
				templateId: template.id,
				deliveryStatus: "delivered",
			});

			const performance = await getTemplatePerformance(template.id);

			expect(performance).toBeDefined();
			expect(performance.templateId).toBe(template.id);
			expect(performance.totalSent).toBeGreaterThan(0);
		});
	});

	describe("getEmailVolumeOverTime", () => {
		it("should return volume data grouped by date", async () => {
			// Create emails from different dates
			const today = new Date();
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			await createSentRecord({
				...mockSentEmail,
				sentAt: today,
			});
			await createSentRecord({
				...mockSentEmail,
				sentAt: yesterday,
			});

			const volumeData = await getEmailVolumeOverTime(7);

			expect(volumeData).toBeDefined();
			expect(Array.isArray(volumeData)).toBe(true);
		});
	});

	describe("getEngagementMetrics", () => {
		it("should return engagement statistics", async () => {
			await createSentRecord({
				...mockSentEmail,
				deliveryStatus: "delivered",
				openedAt: new Date(),
				clickedAt: new Date(),
			});

			const engagement = await getEngagementMetrics();

			expect(engagement).toBeDefined();
			expect(engagement.totalEmails).toBeGreaterThan(0);
			expect(engagement.openRate).toBeGreaterThanOrEqual(0);
			expect(engagement.clickRate).toBeGreaterThanOrEqual(0);
			expect(engagement.clickToOpenRate).toBeGreaterThanOrEqual(0);
		});
	});
});
