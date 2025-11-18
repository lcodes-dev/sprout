/**
 * User Schema
 *
 * Defines the database schema for users using Drizzle ORM's schema builder.
 * This is a code-first approach - the schema is defined in TypeScript and
 * synced to the database using drizzle-kit push.
 */

import { sql } from "drizzle-orm";
import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Users table schema
 *
 * Core user information and authentication data.
 */
export const users = pgTable("users", {
	/**
	 * Unique identifier for the user
	 * Auto-incrementing primary key
	 */
	id: serial("id").primaryKey(),

	/**
	 * User's email address
	 * Must be unique across all users
	 */
	email: text("email").notNull().unique(),

	/**
	 * User's full name or display name
	 */
	name: text("name").notNull(),

	/**
	 * Hashed password
	 * NEVER store plain text passwords!
	 * Use a secure hashing algorithm like bcrypt or argon2
	 */
	passwordHash: text("password_hash"),

	/**
	 * User's role in the system
	 * Defaults to 'user', can be 'admin', 'moderator', etc.
	 */
	role: text("role", { enum: ["user", "admin", "moderator"] })
		.notNull()
		.default("user"),

	/**
	 * Whether the user's email has been verified
	 */
	emailVerified: boolean("email_verified")
		.notNull()
		.default(false),

	/**
	 * Timestamp of when the user was created
	 * Uses SQL's CURRENT_TIMESTAMP for automatic value
	 */
	createdAt: timestamp("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	/**
	 * Timestamp of when the user was last updated
	 * Uses SQL's CURRENT_TIMESTAMP and updates on each change
	 */
	updatedAt: timestamp("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

/**
 * TypeScript type for a user (inferred from schema)
 * Use this for type-safe user objects
 *
 * @example
 * const user: User = {
 *   id: 1,
 *   email: "user@example.com",
 *   name: "John Doe",
 *   // ... other fields
 * }
 */
export type User = typeof users.$inferSelect;

/**
 * TypeScript type for creating a new user (insert)
 * Excludes auto-generated fields like id, createdAt, updatedAt
 *
 * @example
 * const newUser: NewUser = {
 *   email: "user@example.com",
 *   name: "John Doe",
 *   passwordHash: "hashed_password_here"
 * }
 */
export type NewUser = typeof users.$inferInsert;
