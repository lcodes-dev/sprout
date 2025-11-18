/**
 * Shared Blog Types
 *
 * Common TypeScript types and interfaces used across the blog feature.
 * These types are shared between admin and frontend parts of the blog.
 */

import type { Category } from "@/db/schema/categories.js";
import type { Post } from "@/db/schema/posts.js";
import type { PostAttachment } from "@/db/schema/post-attachments.js";
import type { User } from "@/db/schema/users.js";

/**
 * Post with all relations loaded
 */
export interface PostWithRelations extends Post {
	category: Category | null;
	author: User;
	attachments: PostAttachment[];
}

/**
 * Category with post count
 */
export interface CategoryWithCount extends Category {
	postCount: number;
}

/**
 * Form data for creating/updating a post
 */
export interface PostFormData {
	title: string;
	slug: string;
	content: string;
	excerpt?: string;
	categoryId?: number | null;
	status: "draft" | "published";
}

/**
 * File upload data
 */
export interface UploadedFile {
	buffer: Buffer;
	originalName: string;
	mimeType: string;
	size: number;
}

/**
 * Attachment upload data with metadata
 */
export interface AttachmentUpload {
	file: UploadedFile;
	fileType: "image" | "download";
	displayOrder: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
	page: number;
	perPage: number;
}

/**
 * Pagination result metadata
 */
export interface PaginationMeta {
	currentPage: number;
	perPage: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
	data: T[];
	meta: PaginationMeta;
}

/**
 * Post filters for admin panel
 */
export interface AdminPostFilters {
	status?: "draft" | "published" | "all";
	categoryId?: number | null;
	authorId?: number;
	search?: string;
}

/**
 * Post filters for frontend
 */
export interface FrontendPostFilters {
	categorySlug?: string;
	categoryId?: number;
}

/**
 * Sorting parameters
 */
export interface SortParams {
	field: "title" | "createdAt" | "updatedAt" | "publishedAt";
	direction: "asc" | "desc";
}
