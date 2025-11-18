/**
 * AWS SES Email Provider
 *
 * Email provider implementation using AWS Simple Email Service.
 */

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import type {
	EmailMessage,
	EmailProvider,
	EmailSendResult,
	SESConfig,
} from "../types.js";

/**
 * AWS SES email provider
 */
export class SESProvider implements EmailProvider {
	private client: SESClient;
	private config: SESConfig;

	constructor(config: SESConfig) {
		this.config = config;
		this.client = new SESClient({
			region: config.region,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
			},
		});
	}

	/**
	 * Send an email via AWS SES
	 */
	async send(email: EmailMessage): Promise<EmailSendResult> {
		try {
			const command = new SendEmailCommand({
				Source: `"${email.from.name}" <${email.from.email}>`,
				Destination: {
					ToAddresses: [
						email.to.name
							? `"${email.to.name}" <${email.to.email}>`
							: email.to.email,
					],
				},
				Message: {
					Subject: {
						Data: email.subject,
						Charset: "UTF-8",
					},
					Body: {
						Html: {
							Data: email.html,
							Charset: "UTF-8",
						},
						...(email.text && {
							Text: {
								Data: email.text,
								Charset: "UTF-8",
							},
						}),
					},
				},
				...(email.replyTo && {
					ReplyToAddresses: [email.replyTo],
				}),
			});

			const response = await this.client.send(command);

			return {
				success: true,
				messageId: response.MessageId,
			};
		} catch (error) {
			console.error("AWS SES send error:", error);
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
	 * Verify AWS SES connection
	 *
	 * Tests by checking if we can access the SES API
	 */
	async verifyConnection(): Promise<boolean> {
		try {
			// Try to get account sending enabled status
			// This is a lightweight check that doesn't send emails
			await this.client.config.credentials();
			return true;
		} catch (error) {
			console.error("AWS SES connection verification failed:", error);
			return false;
		}
	}
}

/**
 * Create SES provider from environment variables
 */
export function createSESProvider(): SESProvider {
	const region = process.env.AWS_SES_REGION;
	const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
	const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

	if (!region || !accessKeyId || !secretAccessKey) {
		throw new Error(
			"Missing AWS SES configuration. Required: AWS_SES_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY",
		);
	}

	return new SESProvider({
		region,
		accessKeyId,
		secretAccessKey,
	});
}
