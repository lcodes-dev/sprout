/**
 * Posts Query Tests
 *
 * Tests for post-related database operations
 */

import { beforeEach, describe, expect, it } from "vitest";
import { resetDatabase } from "../test-helpers.js";
import { createUser } from "./users.js";
import { createCategory } from "./categories.js";
import {
	countPosts,
	createPost,
	deletePost,
	getAllPosts,
	getPostById,
	getPostBySlug,
	publishPost,
	unpublishPost,
	updatePost,
} from "./posts.js";

describe("Post Queries", () => {
	let authorId: number;
	let categoryId: number;

	beforeEach(async () => {
		await resetDatabase();

		// Create test user and category
		const user = await createUser({
			email: "author@example.com",
			name: "Test Author",
			passwordHash: "hashed",
		});
		authorId = user.id;

		const category = await createCategory({
			name: "Technology",
			slug: "technology",
		});
		categoryId = category.id;
	});

	describe("createPost", () => {
		it("should create a new draft post", async () => {
			const post = await createPost({
				title: "My First Post",
				slug: "my-first-post",
				content: "This is the content...",
				excerpt: "A brief summary",
				categoryId,
				authorId,
				status: "draft",
			});

			expect(post.id).toBeDefined();
			expect(post.title).toBe("My First Post");
			expect(post.slug).toBe("my-first-post");
			expect(post.status).toBe("draft");
			expect(post.publishedAt).toBeNull();
		});

		it("should create a published post", async () => {
			const publishedAt = new Date();
			const post = await createPost({
				title: "Published Post",
				slug: "published-post",
				content: "Content",
				authorId,
				status: "published",
				publishedAt,
			});

			expect(post.status).toBe("published");
			expect(post.publishedAt).toBeDefined();
		});

		it("should create a post without category", async () => {
			const post = await createPost({
				title: "Uncategorized",
				slug: "uncategorized",
				content: "Content",
				authorId,
				status: "draft",
			});

			expect(post.categoryId).toBeNull();
		});
	});

	describe("getAllPosts", () => {
		it("should return empty array when no posts exist", async () => {
			const posts = await getAllPosts();
			expect(posts).toEqual([]);
		});

		it("should return all posts", async () => {
			await createPost({
				title: "Post 1",
				slug: "post-1",
				content: "Content 1",
				authorId,
				status: "draft",
			});
			await createPost({
				title: "Post 2",
				slug: "post-2",
				content: "Content 2",
				authorId,
				status: "published",
				publishedAt: new Date(),
			});

			const posts = await getAllPosts();
			expect(posts).toHaveLength(2);
		});

		it("should filter posts by status", async () => {
			await createPost({
				title: "Draft",
				slug: "draft",
				content: "Content",
				authorId,
				status: "draft",
			});
			await createPost({
				title: "Published",
				slug: "published",
				content: "Content",
				authorId,
				status: "published",
				publishedAt: new Date(),
			});

			const drafts = await getAllPosts({ status: "draft" });
			expect(drafts).toHaveLength(1);
			expect(drafts[0].status).toBe("draft");

			const published = await getAllPosts({ status: "published" });
			expect(published).toHaveLength(1);
			expect(published[0].status).toBe("published");
		});

		it("should filter posts by category", async () => {
			const category2 = await createCategory({
				name: "Travel",
				slug: "travel",
			});

			await createPost({
				title: "Tech Post",
				slug: "tech-post",
				content: "Content",
				authorId,
				categoryId,
				status: "draft",
			});
			await createPost({
				title: "Travel Post",
				slug: "travel-post",
				content: "Content",
				authorId,
				categoryId: category2.id,
				status: "draft",
			});

			const techPosts = await getAllPosts({ categoryId });
			expect(techPosts).toHaveLength(1);
			expect(techPosts[0].categoryId).toBe(categoryId);
		});
	});

	describe("getPostById", () => {
		it("should return undefined for non-existent post", async () => {
			const post = await getPostById(999);
			expect(post).toBeUndefined();
		});

		it("should return post with all relations", async () => {
			const created = await createPost({
				title: "Test Post",
				slug: "test-post",
				content: "Content",
				categoryId,
				authorId,
				status: "draft",
			});

			const post = await getPostById(created.id);
			expect(post).toBeDefined();
			expect(post?.title).toBe("Test Post");
			expect(post?.author).toBeDefined();
			expect(post?.author.id).toBe(authorId);
			expect(post?.category).toBeDefined();
			expect(post?.category?.id).toBe(categoryId);
			expect(post?.attachments).toEqual([]);
		});
	});

	describe("getPostBySlug", () => {
		it("should return undefined for non-existent slug", async () => {
			const post = await getPostBySlug("non-existent");
			expect(post).toBeUndefined();
		});

		it("should return post by slug", async () => {
			await createPost({
				title: "Test Post",
				slug: "test-post",
				content: "Content",
				authorId,
				status: "draft",
			});

			const post = await getPostBySlug("test-post");
			expect(post).toBeDefined();
			expect(post?.slug).toBe("test-post");
		});
	});

	describe("updatePost", () => {
		it("should return undefined for non-existent post", async () => {
			const updated = await updatePost(999, { title: "New Title" });
			expect(updated).toBeUndefined();
		});

		it("should update post fields", async () => {
			const post = await createPost({
				title: "Original",
				slug: "original",
				content: "Content",
				authorId,
				status: "draft",
			});

			const updated = await updatePost(post.id, {
				title: "Updated",
				content: "New content",
			});

			expect(updated).toBeDefined();
			expect(updated?.title).toBe("Updated");
			expect(updated?.content).toBe("New content");
			expect(updated?.slug).toBe("original"); // Unchanged
		});
	});

	describe("deletePost", () => {
		it("should return false for non-existent post", async () => {
			const deleted = await deletePost(999);
			expect(deleted).toBe(false);
		});

		it("should delete post", async () => {
			const post = await createPost({
				title: "Test",
				slug: "test",
				content: "Content",
				authorId,
				status: "draft",
			});

			const deleted = await deletePost(post.id);
			expect(deleted).toBe(true);

			const found = await getPostById(post.id);
			expect(found).toBeUndefined();
		});
	});

	describe("publishPost", () => {
		it("should publish a draft post", async () => {
			const post = await createPost({
				title: "Draft",
				slug: "draft",
				content: "Content",
				authorId,
				status: "draft",
			});

			const published = await publishPost(post.id);
			expect(published?.status).toBe("published");
			expect(published?.publishedAt).toBeDefined();
		});
	});

	describe("unpublishPost", () => {
		it("should unpublish a published post", async () => {
			const post = await createPost({
				title: "Published",
				slug: "published",
				content: "Content",
				authorId,
				status: "published",
				publishedAt: new Date(),
			});

			const unpublished = await unpublishPost(post.id);
			expect(unpublished?.status).toBe("draft");
			expect(unpublished?.publishedAt).toBeNull();
		});
	});

	describe("countPosts", () => {
		it("should return 0 when no posts exist", async () => {
			const count = await countPosts();
			expect(count).toBe(0);
		});

		it("should count all posts", async () => {
			await createPost({
				title: "Post 1",
				slug: "post-1",
				content: "Content",
				authorId,
				status: "draft",
			});
			await createPost({
				title: "Post 2",
				slug: "post-2",
				content: "Content",
				authorId,
				status: "published",
				publishedAt: new Date(),
			});

			const count = await countPosts();
			expect(count).toBe(2);
		});

		it("should count posts by status", async () => {
			await createPost({
				title: "Draft",
				slug: "draft",
				content: "Content",
				authorId,
				status: "draft",
			});
			await createPost({
				title: "Published",
				slug: "published",
				content: "Content",
				authorId,
				status: "published",
				publishedAt: new Date(),
			});

			const draftCount = await countPosts({ status: "draft" });
			expect(draftCount).toBe(1);

			const publishedCount = await countPosts({ status: "published" });
			expect(publishedCount).toBe(1);
		});
	});
});
