/**
 * Database Configuration
 *
 * This file contains all database-related configuration settings.
 * For production, consider using environment variables for sensitive data.
 */

export const dbConfig = {
  // SQLite database file path
  // In production, consider using a more robust location
  url: Deno.env.get("DATABASE_URL") || "file:./data/sprout.db",

  // Connection options
  authToken: Deno.env.get("DATABASE_AUTH_TOKEN"),

  // Enable verbose logging in development
  verbose: Deno.env.get("DENO_ENV") === "development",
} as const

/**
 * Validates that required configuration is present
 */
export function validateConfig(): void {
  if (!dbConfig.url) {
    throw new Error("DATABASE_URL is required but not configured")
  }
}
