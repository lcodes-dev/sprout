/**
 * Resend Email Provider
 *
 * Email provider implementation using Resend API.
 */

import { Resend } from "resend";
import type {
	EmailMessage,
	EmailProvider,
	EmailSendResult,
	ResendConfig,
} from "../types.js";

/**
 * Resend email provider
 */
export class ResendProvider implements EmailProvider {
	private client: Resend;
	private config: ResendConfig;

	constructor(config: ResendConfig) {
		this.config = config;
		this.client = new Resend(config.apiKey);
	}

	/**
	 * Send an email via Resend
	 */
	async send(email: EmailMessage): Promise<EmailSendResult> {
		try {
			const { data, error } = await this.client.emails.send({
				from: `${email.from.name} <${email.from.email}>`,
				to: email.to.name
					? `${email.to.name} <${email.to.email}>`
					: email.to.email,
				subject: email.subject,
				html: email.html,
				text: email.text,
				reply_to: email.replyTo,
			});

			if (error) {
				console.error("Resend send error:", error);
				return {
					success: false,
					error: error.message || "Failed to send email via Resend",
				};
			}

			return {
				success: true,
				messageId: data?.id,
			};
		} catch (error) {
			console.error("Resend send error:", error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Unknown error sending email",
			};
		}
	}

	/**
	 * Verify Resend connection
	 *
	 * Note: Resend doesn't have a direct connection test,
	 * so we just verify the API key is set
	 */
	async verifyConnection(): Promise<boolean> {
		try {
			// Simple check - try to access the API
			// If API key is invalid, this will fail
			if (!this.config.apiKey || this.config.apiKey.length === 0) {
				return false;
			}

			// We could make a test API call here, but that might send an email
			// For now, we just verify the key exists
			return true;
		} catch (error) {
			console.error("Resend connection verification failed:", error);
			return false;
		}
	}
}

/**
 * Create Resend provider from environment variables
 */
export function createResendProvider(): ResendProvider {
	const apiKey = process.env.RESEND_API_KEY;

	if (!apiKey) {
		throw new Error("Missing RESEND_API_KEY environment variable");
	}

	return new ResendProvider({ apiKey });
}
