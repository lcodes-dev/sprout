/**
 * Post Store Action
 *
 * Handles creating a new post from form submission
 */

import type { Context } from "hono";
import { createPost } from "@/db/queries/posts.js";
import { getAllCategories } from "@/db/queries/categories.js";
import { isValidSlug } from "../../shared/utils.js";
import { PostForm } from "../views/post-form.js";

export async function postStoreAction(c: Context) {
	const formData = await c.req.formData();

	// Extract form fields
	const title = formData.get("title") as string;
	const slug = formData.get("slug") as string;
	const content = formData.get("content") as string;
	const excerpt = formData.get("excerpt") as string | null;
	const categoryIdParam = formData.get("categoryId") as string;
	const status = formData.get("status") as "draft" | "published";

	// Validate input
	const errors: Record<string, string> = {};

	if (!title || title.trim().length === 0) {
		errors.title = "Title is required";
	}

	if (!slug || slug.trim().length === 0) {
		errors.slug = "Slug is required";
	} else if (!isValidSlug(slug)) {
		errors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
	}

	if (!content || content.trim().length === 0) {
		errors.content = "Content is required";
	}

	// If there are validation errors, redisplay the form
	if (Object.keys(errors).length > 0) {
		const categories = await getAllCategories();
		return c.html(<PostForm categories={categories} errors={errors} />, 422);
	}

	// Get the current user (for now, we'll use user ID 1 as a placeholder)
	// In a real app, this would come from the authenticated session
	const authorId = 1;

	const categoryId = categoryIdParam && categoryIdParam !== ""
		? Number.parseInt(categoryIdParam)
		: null;

	try {
		// Create the post
		const post = await createPost({
			title: title.trim(),
			slug: slug.trim(),
			content: content.trim(),
			excerpt: excerpt?.trim() || null,
			categoryId,
			authorId,
			status,
			publishedAt: status === "published" ? new Date() : null,
		});

		// TODO: Handle file uploads (images and downloads)
		// This would be implemented in a separate file upload handler

		// Redirect to the post edit page
		return c.redirect(`/admin/blog/${post.id}/edit`);
	} catch (error) {
		console.error("Error creating post:", error);
		const categories = await getAllCategories();
		return c.html(
			<PostForm
				categories={categories}
				errors={{ _general: "An error occurred while creating the post" }}
			/>,
			500,
		);
	}
}
