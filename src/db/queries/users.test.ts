/**
 * User Query Tests
 *
 * Tests for user database operations.
 * Run with: npm test
 *
 * Before running tests, ensure:
 * 1. PostgreSQL database is running: docker compose up -d
 * 2. Test schema is synced once: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sprout-test npm run db:push
 *
 * Note: Tests automatically use the 'sprout-test' database (configured in vitest.config.ts)
 * The test database is automatically cleaned before tests run.
 */

import "dotenv/config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeConnection } from "@/db/connection";
import { setupTestDatabase, teardownTestDatabase } from "@/db/test-helpers";
import type { NewUser } from "@/db/schema/users";
import {
	countUsers,
	createUser,
	deleteUser,
	getAllUsers,
	getUserByEmail,
	getUserById,
	updateUser,
} from "./users.js";

// Setup: Clean test database before running tests
beforeAll(async () => {
	await setupTestDatabase();
});

// Teardown: Clean up database connections and reset database
afterAll(async () => {
	await teardownTestDatabase();
	await closeConnection();
});

describe("User database operations", () => {
	let testUserId: number;

	it("creates a new user", async () => {
		const newUser: NewUser = {
			email: `test-${Date.now()}@example.com`,
			name: "Test User",
			passwordHash: "hashed_password_here",
			role: "user",
		};

		const createdUser = await createUser(newUser);
		expect(createdUser.id).toBeDefined();
		expect(createdUser.email).toBe(newUser.email);
		expect(createdUser.name).toBe(newUser.name);

		testUserId = createdUser.id;
	});

	it("retrieves a user by ID", async () => {
		const user = await getUserById(testUserId);
		expect(user).toBeDefined();
		expect(user?.id).toBe(testUserId);
	});

	it("retrieves a user by email", async () => {
		const user = await getUserById(testUserId);
		expect(user).toBeDefined();

		const foundUser = await getUserByEmail(user?.email ?? "");
		expect(foundUser).toBeDefined();
		expect(foundUser?.id).toBe(testUserId);
	});

	it("lists and counts users", async () => {
		const users = await getAllUsers();
		expect(Array.isArray(users)).toBe(true);
		expect(users.length).toBeGreaterThanOrEqual(1);

		const count = await countUsers();
		expect(count).toBeGreaterThanOrEqual(1);
	});

	it("updates and deletes a user", async () => {
		const updatedUser = await updateUser(testUserId, {
			name: "Updated Test User",
		});
		expect(updatedUser).toBeDefined();
		expect(updatedUser?.name).toBe("Updated Test User");

		const deleted = await deleteUser(testUserId);
		expect(deleted).toBe(true);

		const user = await getUserById(testUserId);
		expect(user).toBeUndefined();
	});
});
