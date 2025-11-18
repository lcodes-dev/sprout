/**
 * Email Provider Factory
 *
 * Creates the appropriate email provider based on environment configuration.
 */

import type { EmailProvider, ProviderType } from "../types.js";
import { createResendProvider } from "./resend-provider.js";
import { createSESProvider } from "./ses-provider.js";
import { createSMTPProvider } from "./smtp-provider.js";

/**
 * Create email provider based on environment configuration
 *
 * @returns Configured email provider
 * @throws Error if provider type is invalid or configuration is missing
 */
export function createEmailProvider(): EmailProvider {
	const providerType = (process.env.EMAIL_PROVIDER ||
		"smtp") as ProviderType;

	switch (providerType) {
		case "smtp":
			return createSMTPProvider();

		case "resend":
			return createResendProvider();

		case "ses":
			return createSESProvider();

		default:
			throw new Error(
				`Invalid EMAIL_PROVIDER: ${providerType}. Must be one of: smtp, resend, ses`,
			);
	}
}

/**
 * Validate email provider configuration
 *
 * @returns True if configuration is valid and provider can connect
 * @throws Error if configuration is invalid
 */
export async function validateEmailProvider(): Promise<boolean> {
	const provider = createEmailProvider();
	const isValid = await provider.verifyConnection();

	if (!isValid) {
		throw new Error("Email provider connection verification failed");
	}

	return true;
}

// Export individual provider creators
export { createSMTPProvider } from "./smtp-provider.js";
export { createResendProvider } from "./resend-provider.js";
export { createSESProvider } from "./ses-provider.js";
