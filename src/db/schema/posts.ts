/**
 * Posts Schema
 *
 * Defines the database schema for blog posts using Drizzle ORM's schema builder.
 * This is a code-first approach - the schema is defined in TypeScript and
 * synced to the database using drizzle-kit push.
 */

import { sql } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { categories } from "./categories.js";
import { users } from "./users.js";

/**
 * Posts table schema
 *
 * Stores blog post content and metadata.
 */
export const posts = pgTable("posts", {
	/**
	 * Unique identifier for the post
	 * Auto-incrementing primary key
	 */
	id: serial("id").primaryKey(),

	/**
	 * Post title
	 */
	title: text("title").notNull(),

	/**
	 * URL-friendly slug for the post
	 * Must be unique across all posts
	 * Used in URLs like /blog/my-first-post
	 */
	slug: text("slug").notNull().unique(),

	/**
	 * Full post content
	 * Can contain HTML or Markdown
	 */
	content: text("content").notNull(),

	/**
	 * Short excerpt or summary of the post
	 * Used in post listings and previews
	 */
	excerpt: text("excerpt"),

	/**
	 * Category ID (foreign key)
	 * References the categories table
	 * Nullable to allow uncategorized posts
	 */
	categoryId: integer("category_id").references(() => categories.id, {
		onDelete: "set null",
	}),

	/**
	 * Author ID (foreign key)
	 * References the users table
	 * Required field - every post must have an author
	 */
	authorId: integer("author_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),

	/**
	 * Publication status
	 * - 'draft': Not visible to the public
	 * - 'published': Visible to the public
	 */
	status: text("status", { enum: ["draft", "published"] })
		.notNull()
		.default("draft"),

	/**
	 * Timestamp of when the post was published
	 * Null if the post is still a draft
	 */
	publishedAt: timestamp("published_at"),

	/**
	 * Timestamp of when the post was created
	 * Uses SQL's CURRENT_TIMESTAMP for automatic value
	 */
	createdAt: timestamp("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),

	/**
	 * Timestamp of when the post was last updated
	 * Uses SQL's CURRENT_TIMESTAMP and updates on each change
	 */
	updatedAt: timestamp("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

/**
 * TypeScript type for a post (inferred from schema)
 * Use this for type-safe post objects
 *
 * @example
 * const post: Post = {
 *   id: 1,
 *   title: "My First Post",
 *   slug: "my-first-post",
 *   content: "This is the post content...",
 *   excerpt: "A brief summary",
 *   categoryId: 1,
 *   authorId: 1,
 *   status: "published",
 *   publishedAt: new Date(),
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * }
 */
export type Post = typeof posts.$inferSelect;

/**
 * TypeScript type for creating a new post (insert)
 * Excludes auto-generated fields like id, createdAt, updatedAt
 *
 * @example
 * const newPost: NewPost = {
 *   title: "My First Post",
 *   slug: "my-first-post",
 *   content: "This is the post content...",
 *   excerpt: "A brief summary",
 *   categoryId: 1,
 *   authorId: 1,
 *   status: "draft"
 * }
 */
export type NewPost = typeof posts.$inferInsert;
