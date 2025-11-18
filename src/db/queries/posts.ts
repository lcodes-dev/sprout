/**
 * Post Query Utilities
 *
 * This module provides type-safe query functions for post-related database operations.
 * Posts are the main content entities in the blog system.
 */

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db/connection.js";
import { type NewPost, type Post, posts } from "@/db/schema/posts.js";
import { categories, type Category } from "@/db/schema/categories.js";
import { type User, users } from "@/db/schema/users.js";
import {
	type PostAttachment,
	postAttachments,
} from "@/db/schema/post-attachments.js";

/**
 * Post with all relations loaded
 */
export interface PostWithRelations extends Post {
	category: Category | null;
	author: User;
	attachments: PostAttachment[];
}

/**
 * Filters for querying posts
 */
export interface PostFilters {
	status?: "draft" | "published";
	categoryId?: number;
	authorId?: number;
}

/**
 * Get all posts from the database with optional filters
 *
 * @param filters - Optional filters to apply
 * @returns Array of posts
 *
 * @example
 * const allPosts = await getAllPosts()
 * const publishedPosts = await getAllPosts({ status: "published" })
 * const categoryPosts = await getAllPosts({ categoryId: 1 })
 */
export async function getAllPosts(filters?: PostFilters): Promise<Post[]> {
	let query = db.select().from(posts);

	const conditions = [];
	if (filters?.status) {
		conditions.push(eq(posts.status, filters.status));
	}
	if (filters?.categoryId !== undefined) {
		if (filters.categoryId === null) {
			conditions.push(isNull(posts.categoryId));
		} else {
			conditions.push(eq(posts.categoryId, filters.categoryId));
		}
	}
	if (filters?.authorId) {
		conditions.push(eq(posts.authorId, filters.authorId));
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions)) as typeof query;
	}

	return await query.orderBy(desc(posts.createdAt));
}

/**
 * Get a post by its ID with all relations
 *
 * @param id - The post's ID
 * @returns The post with relations if found, undefined otherwise
 *
 * @example
 * const post = await getPostById(1)
 * if (post) {
 *   console.log(`Found post: ${post.title}`)
 *   console.log(`Author: ${post.author.name}`)
 *   console.log(`Attachments: ${post.attachments.length}`)
 * }
 */
export async function getPostById(
	id: number,
): Promise<PostWithRelations | undefined> {
	const [post] = await db.select().from(posts).where(eq(posts.id, id));

	if (!post) {
		return undefined;
	}

	// Load relations
	const [author] = await db
		.select()
		.from(users)
		.where(eq(users.id, post.authorId));

	let category: Category | null = null;
	if (post.categoryId) {
		const [cat] = await db
			.select()
			.from(categories)
			.where(eq(categories.id, post.categoryId));
		category = cat ?? null;
	}

	const attachments = await db
		.select()
		.from(postAttachments)
		.where(eq(postAttachments.postId, post.id))
		.orderBy(postAttachments.displayOrder);

	return {
		...post,
		category,
		author,
		attachments,
	};
}

/**
 * Get a post by its slug with all relations
 *
 * @param slug - The post's slug
 * @returns The post with relations if found, undefined otherwise
 *
 * @example
 * const post = await getPostBySlug("my-first-post")
 * if (post) {
 *   console.log(`Found post: ${post.title}`)
 * }
 */
export async function getPostBySlug(
	slug: string,
): Promise<PostWithRelations | undefined> {
	const [post] = await db.select().from(posts).where(eq(posts.slug, slug));

	if (!post) {
		return undefined;
	}

	// Load relations
	const [author] = await db
		.select()
		.from(users)
		.where(eq(users.id, post.authorId));

	let category: Category | null = null;
	if (post.categoryId) {
		const [cat] = await db
			.select()
			.from(categories)
			.where(eq(categories.id, post.categoryId));
		category = cat ?? null;
	}

	const attachments = await db
		.select()
		.from(postAttachments)
		.where(eq(postAttachments.postId, post.id))
		.orderBy(postAttachments.displayOrder);

	return {
		...post,
		category,
		author,
		attachments,
	};
}

/**
 * Create a new post
 *
 * @param postData - Post data to insert
 * @returns The created post
 *
 * @example
 * const newPost = await createPost({
 *   title: "My First Post",
 *   slug: "my-first-post",
 *   content: "This is the post content...",
 *   authorId: 1,
 *   status: "draft"
 * })
 * console.log(`Created post with ID: ${newPost.id}`)
 */
export async function createPost(postData: NewPost): Promise<Post> {
	const result = await db.insert(posts).values(postData).returning();
	return result[0];
}

/**
 * Update a post by its ID
 *
 * @param id - The post's ID
 * @param postData - Partial post data to update
 * @returns The updated post if found, undefined otherwise
 *
 * @example
 * const updated = await updatePost(1, { title: "New Title" })
 * if (updated) {
 *   console.log(`Updated post: ${updated.title}`)
 * }
 */
export async function updatePost(
	id: number,
	postData: Partial<NewPost>,
): Promise<Post | undefined> {
	const result = await db
		.update(posts)
		.set(postData)
		.where(eq(posts.id, id))
		.returning();
	return result[0];
}

/**
 * Delete a post by its ID
 *
 * @param id - The post's ID
 * @returns True if post was deleted, false if not found
 *
 * @example
 * const deleted = await deletePost(1)
 * if (deleted) {
 *   console.log("Post deleted successfully")
 * }
 */
export async function deletePost(id: number): Promise<boolean> {
	const result = await db.delete(posts).where(eq(posts.id, id)).returning();
	return result.length > 0;
}

/**
 * Publish a post (set status to published and set publishedAt timestamp)
 *
 * @param id - The post's ID
 * @returns The updated post if found, undefined otherwise
 *
 * @example
 * const published = await publishPost(1)
 * if (published) {
 *   console.log(`Published post: ${published.title}`)
 * }
 */
export async function publishPost(id: number): Promise<Post | undefined> {
	const result = await db
		.update(posts)
		.set({
			status: "published",
			publishedAt: sql`CURRENT_TIMESTAMP`,
		})
		.where(eq(posts.id, id))
		.returning();
	return result[0];
}

/**
 * Unpublish a post (set status to draft and clear publishedAt timestamp)
 *
 * @param id - The post's ID
 * @returns The updated post if found, undefined otherwise
 *
 * @example
 * const unpublished = await unpublishPost(1)
 * if (unpublished) {
 *   console.log(`Unpublished post: ${unpublished.title}`)
 * }
 */
export async function unpublishPost(id: number): Promise<Post | undefined> {
	const result = await db
		.update(posts)
		.set({
			status: "draft",
			publishedAt: null,
		})
		.where(eq(posts.id, id))
		.returning();
	return result[0];
}

/**
 * Count total number of posts
 *
 * @param filters - Optional filters to apply
 * @returns The total number of posts
 *
 * @example
 * const count = await countPosts()
 * const publishedCount = await countPosts({ status: "published" })
 */
export async function countPosts(filters?: PostFilters): Promise<number> {
	const allPosts = await getAllPosts(filters);
	return allPosts.length;
}
