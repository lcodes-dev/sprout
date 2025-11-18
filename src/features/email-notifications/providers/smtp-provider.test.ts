/**
 * SMTP Provider Tests
 */

import { describe, it, expect, vi } from "vitest";
import { SMTPProvider } from "./smtp-provider.js";
import type { EmailMessage } from "../types.js";

describe("SMTPProvider", () => {
	const mockConfig = {
		host: "smtp.test.com",
		port: 587,
		secure: false,
		auth: {
			user: "test@test.com",
			pass: "password",
		},
	};

	const mockEmail: EmailMessage = {
		to: {
			email: "recipient@example.com",
			name: "Recipient",
		},
		from: {
			email: "sender@example.com",
			name: "Sender",
		},
		subject: "Test Email",
		html: "<p>Test content</p>",
		text: "Test content",
	};

	describe("constructor", () => {
		it("should create provider with config", () => {
			const provider = new SMTPProvider(mockConfig);

			expect(provider).toBeDefined();
		});
	});

	describe("send", () => {
		it("should return success result when email is sent", async () => {
			const provider = new SMTPProvider(mockConfig);

			// Mock the transporter.sendMail method
			vi.spyOn(provider as any, "transporter").mockImplementation({
				sendMail: vi.fn().mockResolvedValue({
					messageId: "test-message-id",
				}),
			});

			const result = await provider.send(mockEmail);

			expect(result.success).toBe(true);
			expect(result.messageId).toBe("test-message-id");
		});

		it("should return error result when send fails", async () => {
			const provider = new SMTPProvider(mockConfig);

			// Mock the transporter.sendMail method to throw error
			vi.spyOn(provider as any, "transporter").mockImplementation({
				sendMail: vi.fn().mockRejectedValue(new Error("SMTP Error")),
			});

			const result = await provider.send(mockEmail);

			expect(result.success).toBe(false);
			expect(result.error).toContain("SMTP Error");
		});
	});

	describe("verifyConnection", () => {
		it("should return true when connection is successful", async () => {
			const provider = new SMTPProvider(mockConfig);

			// Mock the transporter.verify method
			vi.spyOn(provider as any, "transporter").mockImplementation({
				verify: vi.fn().mockResolvedValue(true),
			});

			const isValid = await provider.verifyConnection();

			expect(isValid).toBe(true);
		});

		it("should return false when connection fails", async () => {
			const provider = new SMTPProvider(mockConfig);

			// Mock the transporter.verify method to throw error
			vi.spyOn(provider as any, "transporter").mockImplementation({
				verify: vi.fn().mockRejectedValue(new Error("Connection failed")),
			});

			const isValid = await provider.verifyConnection();

			expect(isValid).toBe(false);
		});
	});
});
