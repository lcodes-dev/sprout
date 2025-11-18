/**
 * Database Configuration
 *
 * This file contains all database-related configuration settings.
 * For production, consider using environment variables for sensitive data.
 */

import "dotenv/config";

export const dbConfig = {
	// PostgreSQL connection URL
	// Format: postgresql://user:password@host:port/database
	url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/sprout",

	// Enable verbose logging in development
	verbose: process.env.NODE_ENV === "development",
} as const;

/**
 * Validates that required configuration is present
 */
export function validateConfig(): void {
	if (!dbConfig.url) {
		throw new Error("DATABASE_URL is required but not configured");
	}
}
