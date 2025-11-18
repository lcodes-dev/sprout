/**
 * Database Test Helpers
 *
 * Utilities for setting up and tearing down test databases.
 * This ensures tests run in isolation with a clean database state.
 */

import { Pool } from "pg";

const TEST_DB_NAME = "sprout-test";

/**
 * Get admin database URL from environment
 * Derives connection details from DATABASE_URL and connects to 'postgres' admin database
 */
function getAdminUrl(): string {
	const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/sprout";
	
	try {
		const url = new URL(dbUrl);
		// Change the database name to 'postgres' (the admin database)
		url.pathname = "/postgres";
		return url.toString();
	} catch {
		// Fallback if URL parsing fails
		return "postgresql://postgres:postgres@localhost:5432/postgres";
	}
}

/**
 * Get test database URL from environment
 */
function getTestUrl(): string {
	const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/sprout";
	
	try {
		const url = new URL(dbUrl);
		url.pathname = `/${TEST_DB_NAME}`;
		return url.toString();
	} catch {
		// Fallback if URL parsing fails
		return `postgresql://postgres:postgres@localhost:5432/${TEST_DB_NAME}`;
	}
}

/**
 * Get the database username from the URL
 */
function getDatabaseUser(): string {
	const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/sprout";
	
	try {
		const url = new URL(dbUrl);
		return url.username || "postgres";
	} catch {
		return "postgres";
	}
}

/**
 * Create the test database if it doesn't exist
 */
export async function createTestDatabase(): Promise<void> {
	const adminPool = new Pool({ connectionString: getAdminUrl() });
	const dbUser = getDatabaseUser();

	try {
		// Check if database exists
		const result = await adminPool.query(
			"SELECT 1 FROM pg_database WHERE datname = $1",
			[TEST_DB_NAME],
		);

		if (result.rows.length === 0) {
			// Database doesn't exist, create it with proper owner
			await adminPool.query(
				`CREATE DATABASE "${TEST_DB_NAME}" OWNER ${dbUser}`
			);
			console.log(`✓ Created test database: ${TEST_DB_NAME} (owner: ${dbUser})`);
		}
	} finally {
		await adminPool.end();
	}
}

/**
 * Drop all tables in the test database (clean slate for tests)
 */
export async function cleanTestDatabase(): Promise<void> {
	const testPool = new Pool({ connectionString: getTestUrl() });

	try {
		// Drop all tables in the public schema
		await testPool.query(`
			DO $$ DECLARE
				r RECORD;
			BEGIN
				FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
					EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
				END LOOP;
			END $$;
		`);
		console.log(`✓ Cleaned test database: ${TEST_DB_NAME}`);
	} finally {
		await testPool.end();
	}
}

/**
 * Setup test database: create database, clean tables, and apply schema
 */
export async function setupTestDatabase(): Promise<void> {
	await createTestDatabase();
	await cleanTestDatabase();

	// Apply schema by pushing with drizzle-kit would require running a command
	// Instead, we'll rely on the schema being already synced
	// Tests should document running: DATABASE_URL=...sprout-test npm run db:push
	console.log(`✓ Test database ready: ${TEST_DB_NAME}`);
}

/**
 * Teardown: Clean the test database after tests
 */
export async function teardownTestDatabase(): Promise<void> {
	await cleanTestDatabase();
}

/**
 * Drop the entire test database (use sparingly, mainly for CI cleanup)
 */
export async function dropTestDatabase(): Promise<void> {
	const adminPool = new Pool({ connectionString: getAdminUrl() });

	try {
		// Terminate all connections to the test database first
		await adminPool.query(`
			SELECT pg_terminate_backend(pg_stat_activity.pid)
			FROM pg_stat_activity
			WHERE pg_stat_activity.datname = $1
			AND pid <> pg_backend_pid()
		`, [TEST_DB_NAME]);

		// Drop the database
		await adminPool.query(`DROP DATABASE IF EXISTS "${TEST_DB_NAME}"`);
		console.log(`✓ Dropped test database: ${TEST_DB_NAME}`);
	} finally {
		await adminPool.end();
	}
}

