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

import type { Config } from "drizzle-kit"

export default {
  schema: "./src/shared/db/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: Deno.env.get("DATABASE_URL") || "file:./data/sprout.db",
  },
  verbose: true,
  strict: true,
} satisfies Config
