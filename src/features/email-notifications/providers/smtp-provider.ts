/**
 * SMTP Email Provider
 *
 * Email provider implementation using SMTP via nodemailer.
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type {
	EmailMessage,
	EmailProvider,
	EmailSendResult,
	SMTPConfig,
} from "../types.js";

/**
 * SMTP email provider using nodemailer
 */
export class SMTPProvider implements EmailProvider {
	private transporter: Transporter;
	private config: SMTPConfig;

	constructor(config: SMTPConfig) {
		this.config = config;
		this.transporter = nodemailer.createTransport({
			host: config.host,
			port: config.port,
			secure: config.secure,
			auth: {
				user: config.auth.user,
				pass: config.auth.pass,
			},
		});
	}

	/**
	 * Send an email via SMTP
	 */
	async send(email: EmailMessage): Promise<EmailSendResult> {
		try {
			const info = await this.transporter.sendMail({
				from: `"${email.from.name}" <${email.from.email}>`,
				to: email.to.name
					? `"${email.to.name}" <${email.to.email}>`
					: email.to.email,
				subject: email.subject,
				html: email.html,
				text: email.text,
				replyTo: email.replyTo,
			});

			return {
				success: true,
				messageId: info.messageId,
			};
		} catch (error) {
			console.error("SMTP send error:", error);
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
	 * Verify SMTP connection
	 */
	async verifyConnection(): Promise<boolean> {
		try {
			await this.transporter.verify();
			return true;
		} catch (error) {
			console.error("SMTP connection verification failed:", error);
			return false;
		}
	}
}

/**
 * Create SMTP provider from environment variables
 */
export function createSMTPProvider(): SMTPProvider {
	const host = process.env.SMTP_HOST;
	const port = process.env.SMTP_PORT;
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASSWORD;

	if (!host || !port || !user || !pass) {
		throw new Error(
			"Missing SMTP configuration. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD",
		);
	}

	return new SMTPProvider({
		host,
		port: Number.parseInt(port, 10),
		secure: port === "465", // Use TLS for port 465
		auth: {
			user,
			pass,
		},
	});
}
