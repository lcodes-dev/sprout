/**
 * Database Connection Module
 *
 * This module manages the database connection using Drizzle ORM with libSQL.
 * It provides a singleton connection instance and utilities for database operations.
 */

import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"
import { dbConfig, validateConfig } from "./config.ts"
import * as schema from "./schema/index.ts"

/**
 * Initialize the libSQL client
 */
function initClient() {
  validateConfig()

  const client = createClient({
    url: dbConfig.url,
    authToken: dbConfig.authToken,
  })

  return client
}

/**
 * Database client instance
 * This is the raw libSQL client, use sparingly - prefer using `db` for queries
 */
export const client = initClient()

/**
 * Drizzle database instance
 * Use this for all database queries and operations
 *
 * @example
 * import { db } from "./shared/db/connection.ts"
 * import { users } from "./shared/db/schema/users.ts"
 *
 * const allUsers = await db.select().from(users)
 */
export const db = drizzle(client, {
  schema,
  logger: dbConfig.verbose,
})

/**
 * Close the database connection
 * Call this when shutting down the application
 */
export async function closeConnection(): Promise<void> {
  await client.close()
}

/**
 * Test the database connection
 * Returns true if connection is successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    await client.execute("SELECT 1")
    return true
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}
