/**
 * Email Provider Types and Interfaces
 *
 * Defines the contract for email providers and common types.
 */

/**
 * Email message to be sent
 */
export interface EmailMessage {
	/** Recipient information */
	to: {
		email: string;
		name?: string;
	};
	/** Sender information */
	from: {
		email: string;
		name: string;
	};
	/** Email subject */
	subject: string;
	/** HTML body content */
	html: string;
	/** Plain text body content (fallback) */
	text?: string;
	/** Reply-to address */
	replyTo?: string;
}

/**
 * Result of sending an email
 */
export interface EmailSendResult {
	/** Whether the email was sent successfully */
	success: boolean;
	/** Message ID from the provider (if available) */
	messageId?: string;
	/** Error message if sending failed */
	error?: string;
}

/**
 * Email provider interface
 *
 * All email providers must implement this interface
 */
export interface EmailProvider {
	/**
	 * Send an email
	 *
	 * @param email - The email message to send
	 * @returns Result of the send operation
	 */
	send(email: EmailMessage): Promise<EmailSendResult>;

	/**
	 * Verify that the provider is configured correctly
	 *
	 * @returns True if the connection can be established
	 */
	verifyConnection(): Promise<boolean>;
}

/**
 * Provider type from environment
 */
export type ProviderType = "smtp" | "resend" | "ses";

/**
 * SMTP configuration
 */
export interface SMTPConfig {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
}

/**
 * Resend configuration
 */
export interface ResendConfig {
	apiKey: string;
}

/**
 * AWS SES configuration
 */
export interface SESConfig {
	region: string;
	accessKeyId: string;
	secretAccessKey: string;
}
