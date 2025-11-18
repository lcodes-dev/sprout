/**
 * Scheduled Emails Query Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
	createScheduledEmail,
	deleteScheduledEmail,
	getAllScheduled,
	getScheduledById,
	getScheduledByStatus,
	getPendingScheduled,
	getScheduledByRecipient,
	getScheduledByType,
	updateScheduledEmail,
	markScheduledAsSent,
	markScheduledAsFailed,
	cancelScheduledEmail,
	countScheduledByStatus,
} from "./scheduled-emails.js";
import type { NewScheduledEmail } from "@/db/schema/scheduled-emails.js";

describe("Scheduled Emails Queries", () => {
	const mockScheduledEmail: NewScheduledEmail = {
		subject: "Test Email",
		bodyHtml: "<p>Test content</p>",
		bodyText: "Test content",
		recipientEmail: "test@example.com",
		recipientName: "Test User",
		emailType: "notification",
		scheduledFor: new Date(),
		status: "pending",
	};

	describe("createScheduledEmail", () => {
		it("should create a new scheduled email", async () => {
			const scheduled = await createScheduledEmail(mockScheduledEmail);

			expect(scheduled).toBeDefined();
			expect(scheduled.id).toBeDefined();
			expect(scheduled.subject).toBe(mockScheduledEmail.subject);
			expect(scheduled.recipientEmail).toBe(mockScheduledEmail.recipientEmail);
			expect(scheduled.status).toBe("pending");
		});
	});

	describe("getScheduledById", () => {
		it("should retrieve scheduled email by id", async () => {
			const created = await createScheduledEmail(mockScheduledEmail);
			const retrieved = await getScheduledById(created.id);

			expect(retrieved).toBeDefined();
			expect(retrieved?.id).toBe(created.id);
		});

		it("should return undefined for non-existent id", async () => {
			const retrieved = await getScheduledById(999999);

			expect(retrieved).toBeUndefined();
		});
	});

	describe("getScheduledByStatus", () => {
		it("should retrieve scheduled emails by status", async () => {
			await createScheduledEmail(mockScheduledEmail);
			const pending = await getScheduledByStatus("pending");

			expect(pending.length).toBeGreaterThan(0);
			expect(pending.every((e) => e.status === "pending")).toBe(true);
		});
	});

	describe("getPendingScheduled", () => {
		it("should retrieve pending emails due now", async () => {
			const pastDate = new Date();
			pastDate.setHours(pastDate.getHours() - 1);

			await createScheduledEmail({
				...mockScheduledEmail,
				scheduledFor: pastDate,
			});

			const pending = await getPendingScheduled();

			expect(pending.length).toBeGreaterThan(0);
			expect(pending.every((e) => e.status === "pending")).toBe(true);
		});

		it("should not retrieve future scheduled emails", async () => {
			const futureDate = new Date();
			futureDate.setHours(futureDate.getHours() + 24);

			await createScheduledEmail({
				...mockScheduledEmail,
				scheduledFor: futureDate,
			});

			const pending = await getPendingScheduled();

			// Should not include the future email
			const hasFutureEmail = pending.some(
				(e) => e.scheduledFor.getTime() > new Date().getTime(),
			);
			expect(hasFutureEmail).toBe(false);
		});
	});

	describe("getScheduledByRecipient", () => {
		it("should retrieve scheduled emails by recipient", async () => {
			const email = "recipient@example.com";
			await createScheduledEmail({
				...mockScheduledEmail,
				recipientEmail: email,
			});

			const scheduled = await getScheduledByRecipient(email);

			expect(scheduled.length).toBeGreaterThan(0);
			expect(scheduled.every((e) => e.recipientEmail === email)).toBe(true);
		});
	});

	describe("getScheduledByType", () => {
		it("should retrieve scheduled emails by type", async () => {
			await createScheduledEmail({
				...mockScheduledEmail,
				emailType: "marketing",
			});

			const marketing = await getScheduledByType("marketing");

			expect(marketing.length).toBeGreaterThan(0);
			expect(marketing.every((e) => e.emailType === "marketing")).toBe(true);
		});
	});

	describe("updateScheduledEmail", () => {
		it("should update scheduled email", async () => {
			const created = await createScheduledEmail(mockScheduledEmail);
			const updated = await updateScheduledEmail(created.id, {
				subject: "Updated Subject",
			});

			expect(updated).toBeDefined();
			expect(updated?.subject).toBe("Updated Subject");
		});
	});

	describe("markScheduledAsSent", () => {
		it("should mark scheduled email as sent", async () => {
			const created = await createScheduledEmail(mockScheduledEmail);
			const updated = await markScheduledAsSent(created.id);

			expect(updated).toBeDefined();
			expect(updated?.status).toBe("sent");
			expect(updated?.sentAt).toBeDefined();
		});
	});

	describe("markScheduledAsFailed", () => {
		it("should mark scheduled email as failed", async () => {
			const created = await createScheduledEmail(mockScheduledEmail);
			const reason = "Test failure reason";
			const updated = await markScheduledAsFailed(created.id, reason);

			expect(updated).toBeDefined();
			expect(updated?.status).toBe("failed");
			expect(updated?.failureReason).toBe(reason);
		});
	});

	describe("cancelScheduledEmail", () => {
		it("should cancel scheduled email", async () => {
			const created = await createScheduledEmail(mockScheduledEmail);
			const cancelled = await cancelScheduledEmail(created.id);

			expect(cancelled).toBeDefined();
			expect(cancelled?.status).toBe("cancelled");
		});
	});

	describe("deleteScheduledEmail", () => {
		it("should delete scheduled email", async () => {
			const created = await createScheduledEmail(mockScheduledEmail);
			const deleted = await deleteScheduledEmail(created.id);

			expect(deleted).toBe(true);

			const retrieved = await getScheduledById(created.id);
			expect(retrieved).toBeUndefined();
		});
	});

	describe("countScheduledByStatus", () => {
		it("should count scheduled emails by status", async () => {
			const initialCount = await countScheduledByStatus("pending");

			await createScheduledEmail(mockScheduledEmail);

			const finalCount = await countScheduledByStatus("pending");

			expect(finalCount).toBe(initialCount + 1);
		});
	});
});
