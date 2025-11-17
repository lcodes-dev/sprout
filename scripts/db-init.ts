/**
 * Database Initialization Script
 *
 * This script ensures the database directory exists and provides
 * helpful information about database setup.
 *
 * Run with: deno task db:init
 */

import { ensureDir } from "@std/fs"
import { dirname } from "@std/path"

const dbUrl = Deno.env.get("DATABASE_URL") || "file:./data/sprout.db"

console.log("🗄️  Initializing database...")
console.log(`📍 Database URL: ${dbUrl}`)

// Extract the directory path from the database URL
let dbPath: string

if (dbUrl.startsWith("file:")) {
  dbPath = dbUrl.replace("file:", "")
} else {
  console.log("✅ Using remote database - no local directory needed")
  Deno.exit(0)
}

// Ensure the directory exists
const dbDir = dirname(dbPath)
await ensureDir(dbDir)
console.log(`📁 Created directory: ${dbDir}`)

console.log("\n✅ Database initialization complete!")
console.log("\n📋 Next steps:")
console.log("  1. Run 'deno task db:push' to sync your schema to the database")
console.log("  2. Run 'deno task db:studio' to explore your database")
console.log("  3. Start your application with 'deno task start'")
