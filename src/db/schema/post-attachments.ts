/**
 * Post Attachments Schema
 *
 * Defines the database schema for blog post attachments using Drizzle ORM's schema builder.
 * Attachments can be images or downloadable files associated with blog posts.
 * This is a code-first approach - the schema is defined in TypeScript and
 * synced to the database using drizzle-kit push.
 */

import { sql } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { posts } from "./posts.js";

/**
 * Post Attachments table schema
 *
 * Stores metadata for files attached to blog posts (images and downloads).
 */
export const postAttachments = pgTable("post_attachments", {
	/**
	 * Unique identifier for the attachment
	 * Auto-incrementing primary key
	 */
	id: serial("id").primaryKey(),

	/**
	 * Post ID (foreign key)
	 * References the posts table
	 * Cascade delete: when a post is deleted, all its attachments are deleted
	 */
	postId: integer("post_id")
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),

	/**
	 * Full path to the file in storage
	 * Example: "uploads/blog/images/2024/01/photo.jpg"
	 */
	filePath: text("file_path").notNull(),

	/**
	 * Original filename
	 * Preserved for user-friendly display and downloads
	 */
	fileName: text("file_name").notNull(),

	/**
	 * Type of attachment
	 * - 'image': Display in galleries and content
	 * - 'download': Available as downloadable file
	 */
	fileType: text("file_type", { enum: ["image", "download"] }).notNull(),

	/**
	 * MIME type of the file
	 * Examples: "image/jpeg", "application/pdf", "application/zip"
	 */
	mimeType: text("mime_type").notNull(),

	/**
	 * File size in bytes
	 * Used for displaying file size to users and validation
	 */
	fileSize: integer("file_size").notNull(),

	/**
	 * Display order for sorting attachments
	 * Lower numbers appear first
	 * Defaults to 0
	 */
	displayOrder: integer("display_order").notNull().default(0),

	/**
	 * Timestamp of when the attachment was created
	 * Uses SQL's CURRENT_TIMESTAMP for automatic value
	 */
	createdAt: timestamp("created_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
});

/**
 * TypeScript type for a post attachment (inferred from schema)
 * Use this for type-safe attachment objects
 *
 * @example
 * const attachment: PostAttachment = {
 *   id: 1,
 *   postId: 1,
 *   filePath: "uploads/blog/images/2024/01/photo.jpg",
 *   fileName: "photo.jpg",
 *   fileType: "image",
 *   mimeType: "image/jpeg",
 *   fileSize: 102400,
 *   displayOrder: 0,
 *   createdAt: new Date(),
 * }
 */
export type PostAttachment = typeof postAttachments.$inferSelect;

/**
 * TypeScript type for creating a new post attachment (insert)
 * Excludes auto-generated fields like id, createdAt
 *
 * @example
 * const newAttachment: NewPostAttachment = {
 *   postId: 1,
 *   filePath: "uploads/blog/images/2024/01/photo.jpg",
 *   fileName: "photo.jpg",
 *   fileType: "image",
 *   mimeType: "image/jpeg",
 *   fileSize: 102400,
 *   displayOrder: 0
 * }
 */
export type NewPostAttachment = typeof postAttachments.$inferInsert;
