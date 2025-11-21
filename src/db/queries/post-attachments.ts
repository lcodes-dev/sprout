/**
 * Post Attachment Query Utilities
 *
 * This module provides type-safe query functions for post attachment-related database operations.
 * Attachments are files (images or downloads) associated with blog posts.
 */

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/connection.js";
import {
	type NewPostAttachment,
	type PostAttachment,
	postAttachments,
} from "@/db/schema/post-attachments.js";

/**
 * Get all attachments for a post
 *
 * @param postId - The post's ID
 * @param fileType - Optional file type filter ("image" or "download")
 * @returns Array of attachments ordered by display order
 *
 * @example
 * const allAttachments = await getAttachmentsByPostId(1)
 * const images = await getAttachmentsByPostId(1, "image")
 * const downloads = await getAttachmentsByPostId(1, "download")
 */
export async function getAttachmentsByPostId(
	postId: number,
	fileType?: "image" | "download",
): Promise<PostAttachment[]> {
	let query = db
		.select()
		.from(postAttachments)
		.where(eq(postAttachments.postId, postId));

	if (fileType) {
		query = query.where(
			and(
				eq(postAttachments.postId, postId),
				eq(postAttachments.fileType, fileType),
			),
		) as typeof query;
	}

	return await query.orderBy(asc(postAttachments.displayOrder));
}

/**
 * Get an attachment by its ID
 *
 * @param id - The attachment's ID
 * @returns The attachment if found, undefined otherwise
 *
 * @example
 * const attachment = await getAttachmentById(1)
 * if (attachment) {
 *   console.log(`Found attachment: ${attachment.fileName}`)
 * }
 */
export async function getAttachmentById(
	id: number,
): Promise<PostAttachment | undefined> {
	const result = await db
		.select()
		.from(postAttachments)
		.where(eq(postAttachments.id, id));
	return result[0];
}

/**
 * Create a new attachment
 *
 * @param attachmentData - Attachment data to insert
 * @returns The created attachment
 *
 * @example
 * const newAttachment = await createAttachment({
 *   postId: 1,
 *   filePath: "blog/images/2024/01/photo.jpg",
 *   fileName: "photo.jpg",
 *   fileType: "image",
 *   mimeType: "image/jpeg",
 *   fileSize: 102400,
 *   displayOrder: 0
 * })
 * console.log(`Created attachment with ID: ${newAttachment.id}`)
 */
export async function createAttachment(
	attachmentData: NewPostAttachment,
): Promise<PostAttachment> {
	const result = await db
		.insert(postAttachments)
		.values(attachmentData)
		.returning();
	return result[0];
}

/**
 * Update an attachment by its ID
 *
 * @param id - The attachment's ID
 * @param attachmentData - Partial attachment data to update
 * @returns The updated attachment if found, undefined otherwise
 *
 * @example
 * const updated = await updateAttachment(1, { displayOrder: 1 })
 * if (updated) {
 *   console.log(`Updated attachment: ${updated.fileName}`)
 * }
 */
export async function updateAttachment(
	id: number,
	attachmentData: Partial<NewPostAttachment>,
): Promise<PostAttachment | undefined> {
	const result = await db
		.update(postAttachments)
		.set(attachmentData)
		.where(eq(postAttachments.id, id))
		.returning();
	return result[0];
}

/**
 * Delete an attachment by its ID
 *
 * @param id - The attachment's ID
 * @returns True if attachment was deleted, false if not found
 *
 * @example
 * const deleted = await deleteAttachment(1)
 * if (deleted) {
 *   console.log("Attachment deleted successfully")
 * }
 */
export async function deleteAttachment(id: number): Promise<boolean> {
	const result = await db
		.delete(postAttachments)
		.where(eq(postAttachments.id, id))
		.returning();
	return result.length > 0;
}

/**
 * Delete all attachments for a post
 *
 * @param postId - The post's ID
 * @returns The number of attachments deleted
 *
 * @example
 * const count = await deleteAttachmentsByPostId(1)
 * console.log(`Deleted ${count} attachments`)
 */
export async function deleteAttachmentsByPostId(
	postId: number,
): Promise<number> {
	const result = await db
		.delete(postAttachments)
		.where(eq(postAttachments.postId, postId))
		.returning();
	return result.length;
}

/**
 * Update display order for multiple attachments
 *
 * @param updates - Array of { id, displayOrder } objects
 * @returns Promise that resolves when all updates are complete
 *
 * @example
 * await updateDisplayOrders([
 *   { id: 1, displayOrder: 2 },
 *   { id: 2, displayOrder: 1 },
 *   { id: 3, displayOrder: 0 }
 * ])
 */
export async function updateDisplayOrders(
	updates: Array<{ id: number; displayOrder: number }>,
): Promise<void> {
	await Promise.all(
		updates.map((update) =>
			db
				.update(postAttachments)
				.set({ displayOrder: update.displayOrder })
				.where(eq(postAttachments.id, update.id)),
		),
	);
}

/**
 * Count total number of attachments for a post
 *
 * @param postId - The post's ID
 * @param fileType - Optional file type filter
 * @returns The total number of attachments
 *
 * @example
 * const count = await countAttachments(1)
 * const imageCount = await countAttachments(1, "image")
 */
export async function countAttachments(
	postId: number,
	fileType?: "image" | "download",
): Promise<number> {
	const attachments = await getAttachmentsByPostId(postId, fileType);
	return attachments.length;
}
