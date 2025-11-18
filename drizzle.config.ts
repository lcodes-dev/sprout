/**
 * Drizzle Kit Configuration
 *
 * This file configures drizzle-kit for database operations like:
 * - db:push - Sync schema changes to the database (code-first, no migrations)
 * - db:studio - Launch Drizzle Studio for database exploration
 *
 * For code-first approach, we use `drizzle-kit push` which directly applies
 * schema changes to the database without creating migration files.
 */

import "dotenv/config";
import process from "node:process";
import type { Config } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/sprout";

export default {
	schema: "./src/db/schema/index.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: databaseUrl,
	},
	verbose: true,
	strict: true,
} satisfies Config;
