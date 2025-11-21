/**
 * Categories Schema
 *
 * Defines the database schema for blog post categories using Drizzle ORM's schema builder.
 * This is a code-first approach - the schema is defined in TypeScript and
 * synced to the database using drizzle-kit push.
 */

import { sql } from "drizzle-orm";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Categories table schema
 *
 * Categories are used to organize blog posts into logical groups.
 */
export const categories = pgTable("categories", {
	/**
	 * Unique identifier for the category
	 * Auto-incrementing primary key
	 */
	id: serial("id").primaryKey(),

	/**
	 * Category name
	 * Must be unique across all categories
	 */
	name: text("name").notNull().unique(),

	/**
	 * URL-friendly slug for the category
	 * Must be unique across all categories
	 * Used in URLs like /blog/category/tech
	 */
	slug: text("slug").notNull().unique(),

	/**
	 * Optional description of the category
	 */
	description: text("description"),

	/**
	 * Timestamp of when the category was created
	 * Uses SQL's CURRENT_TIMESTAMP for automatic value
	 */
	createdAt: timestamp("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	/**
	 * Timestamp of when the category was last updated
	 * Uses SQL's CURRENT_TIMESTAMP and updates on each change
	 */
	updatedAt: timestamp("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

/**
 * TypeScript type for a category (inferred from schema)
 * Use this for type-safe category objects
 *
 * @example
 * const category: Category = {
 *   id: 1,
 *   name: "Technology",
 *   slug: "technology",
 *   description: "All tech-related posts",
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * }
 */
export type Category = typeof categories.$inferSelect;

/**
 * TypeScript type for creating a new category (insert)
 * Excludes auto-generated fields like id, createdAt, updatedAt
 *
 * @example
 * const newCategory: NewCategory = {
 *   name: "Technology",
 *   slug: "technology",
 *   description: "All tech-related posts"
 * }
 */
export type NewCategory = typeof categories.$inferInsert;
