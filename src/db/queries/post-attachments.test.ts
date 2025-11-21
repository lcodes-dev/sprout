/**
 * Post Attachments Query Tests
 *
 * Tests for post attachment-related database operations
 */

import { beforeEach, describe, expect, it } from "vitest";
import { resetDatabase } from "../test-helpers.js";
import { createUser } from "./users.js";
import { createPost } from "./posts.js";
import {
	countAttachments,
	createAttachment,
	deleteAttachment,
	deleteAttachmentsByPostId,
	getAttachmentById,
	getAttachmentsByPostId,
	updateAttachment,
	updateDisplayOrders,
} from "./post-attachments.js";

describe("Post Attachment Queries", () => {
	let postId: number;

	beforeEach(async () => {
		await resetDatabase();

		// Create test user and post
		const user = await createUser({
			email: "author@example.com",
			name: "Test Author",
			passwordHash: "hashed",
		});

		const post = await createPost({
			title: "Test Post",
			slug: "test-post",
			content: "Content",
			authorId: user.id,
			status: "draft",
		});
		postId = post.id;
	});

	describe("createAttachment", () => {
		it("should create an image attachment", async () => {
			const attachment = await createAttachment({
				postId,
				filePath: "blog/images/photo.jpg",
				fileName: "photo.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 102400,
				displayOrder: 0,
			});

			expect(attachment.id).toBeDefined();
			expect(attachment.postId).toBe(postId);
			expect(attachment.fileType).toBe("image");
			expect(attachment.displayOrder).toBe(0);
		});

		it("should create a download attachment", async () => {
			const attachment = await createAttachment({
				postId,
				filePath: "blog/downloads/document.pdf",
				fileName: "document.pdf",
				fileType: "download",
				mimeType: "application/pdf",
				fileSize: 204800,
				displayOrder: 0,
			});

			expect(attachment.fileType).toBe("download");
			expect(attachment.mimeType).toBe("application/pdf");
		});
	});

	describe("getAttachmentsByPostId", () => {
		it("should return empty array when no attachments exist", async () => {
			const attachments = await getAttachmentsByPostId(postId);
			expect(attachments).toEqual([]);
		});

		it("should return all attachments for a post", async () => {
			await createAttachment({
				postId,
				filePath: "blog/images/photo1.jpg",
				fileName: "photo1.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 0,
			});

			await createAttachment({
				postId,
				filePath: "blog/images/photo2.jpg",
				fileName: "photo2.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 1,
			});

			const attachments = await getAttachmentsByPostId(postId);
			expect(attachments).toHaveLength(2);
		});

		it("should filter by file type", async () => {
			await createAttachment({
				postId,
				filePath: "blog/images/photo.jpg",
				fileName: "photo.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 0,
			});

			await createAttachment({
				postId,
				filePath: "blog/downloads/document.pdf",
				fileName: "document.pdf",
				fileType: "download",
				mimeType: "application/pdf",
				fileSize: 200000,
				displayOrder: 0,
			});

			const images = await getAttachmentsByPostId(postId, "image");
			expect(images).toHaveLength(1);
			expect(images[0].fileType).toBe("image");

			const downloads = await getAttachmentsByPostId(postId, "download");
			expect(downloads).toHaveLength(1);
			expect(downloads[0].fileType).toBe("download");
		});

		it("should order by display order", async () => {
			await createAttachment({
				postId,
				filePath: "blog/images/photo2.jpg",
				fileName: "photo2.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 2,
			});

			await createAttachment({
				postId,
				filePath: "blog/images/photo1.jpg",
				fileName: "photo1.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 0,
			});

			const attachments = await getAttachmentsByPostId(postId);
			expect(attachments[0].displayOrder).toBe(0);
			expect(attachments[1].displayOrder).toBe(2);
		});
	});

	describe("getAttachmentById", () => {
		it("should return undefined for non-existent attachment", async () => {
			const attachment = await getAttachmentById(999);
			expect(attachment).toBeUndefined();
		});

		it("should return attachment by ID", async () => {
			const created = await createAttachment({
				postId,
				filePath: "blog/images/photo.jpg",
				fileName: "photo.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 0,
			});

			const found = await getAttachmentById(created.id);
			expect(found).toBeDefined();
			expect(found?.id).toBe(created.id);
		});
	});

	describe("updateAttachment", () => {
		it("should return undefined for non-existent attachment", async () => {
			const updated = await updateAttachment(999, { displayOrder: 1 });
			expect(updated).toBeUndefined();
		});

		it("should update attachment fields", async () => {
			const attachment = await createAttachment({
				postId,
				filePath: "blog/images/photo.jpg",
				fileName: "photo.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 0,
			});

			const updated = await updateAttachment(attachment.id, {
				displayOrder: 5,
			});

			expect(updated).toBeDefined();
			expect(updated?.displayOrder).toBe(5);
		});
	});

	describe("deleteAttachment", () => {
		it("should return false for non-existent attachment", async () => {
			const deleted = await deleteAttachment(999);
			expect(deleted).toBe(false);
		});

		it("should delete attachment", async () => {
			const attachment = await createAttachment({
				postId,
				filePath: "blog/images/photo.jpg",
				fileName: "photo.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 0,
			});

			const deleted = await deleteAttachment(attachment.id);
			expect(deleted).toBe(true);

			const found = await getAttachmentById(attachment.id);
			expect(found).toBeUndefined();
		});
	});

	describe("deleteAttachmentsByPostId", () => {
		it("should delete all attachments for a post", async () => {
			await createAttachment({
				postId,
				filePath: "blog/images/photo1.jpg",
				fileName: "photo1.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 0,
			});

			await createAttachment({
				postId,
				filePath: "blog/images/photo2.jpg",
				fileName: "photo2.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 1,
			});

			const count = await deleteAttachmentsByPostId(postId);
			expect(count).toBe(2);

			const attachments = await getAttachmentsByPostId(postId);
			expect(attachments).toEqual([]);
		});

		it("should return 0 when no attachments exist", async () => {
			const count = await deleteAttachmentsByPostId(postId);
			expect(count).toBe(0);
		});
	});

	describe("updateDisplayOrders", () => {
		it("should update display orders for multiple attachments", async () => {
			const att1 = await createAttachment({
				postId,
				filePath: "blog/images/photo1.jpg",
				fileName: "photo1.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 0,
			});

			const att2 = await createAttachment({
				postId,
				filePath: "blog/images/photo2.jpg",
				fileName: "photo2.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 1,
			});

			await updateDisplayOrders([
				{ id: att1.id, displayOrder: 2 },
				{ id: att2.id, displayOrder: 0 },
			]);

			const updated1 = await getAttachmentById(att1.id);
			const updated2 = await getAttachmentById(att2.id);

			expect(updated1?.displayOrder).toBe(2);
			expect(updated2?.displayOrder).toBe(0);
		});
	});

	describe("countAttachments", () => {
		it("should return 0 when no attachments exist", async () => {
			const count = await countAttachments(postId);
			expect(count).toBe(0);
		});

		it("should count all attachments", async () => {
			await createAttachment({
				postId,
				filePath: "blog/images/photo.jpg",
				fileName: "photo.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 0,
			});

			await createAttachment({
				postId,
				filePath: "blog/downloads/doc.pdf",
				fileName: "doc.pdf",
				fileType: "download",
				mimeType: "application/pdf",
				fileSize: 200000,
				displayOrder: 0,
			});

			const count = await countAttachments(postId);
			expect(count).toBe(2);
		});

		it("should count attachments by type", async () => {
			await createAttachment({
				postId,
				filePath: "blog/images/photo.jpg",
				fileName: "photo.jpg",
				fileType: "image",
				mimeType: "image/jpeg",
				fileSize: 100000,
				displayOrder: 0,
			});

			await createAttachment({
				postId,
				filePath: "blog/downloads/doc.pdf",
				fileName: "doc.pdf",
				fileType: "download",
				mimeType: "application/pdf",
				fileSize: 200000,
				displayOrder: 0,
			});

			const imageCount = await countAttachments(postId, "image");
			const downloadCount = await countAttachments(postId, "download");

			expect(imageCount).toBe(1);
			expect(downloadCount).toBe(1);
		});
	});
});
