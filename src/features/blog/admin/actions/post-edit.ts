/**
 * Post Edit Action
 *
 * Handles displaying the post edit form
 */

import type { Context } from "hono";
import { getPostById } from "@/db/queries/posts.js";
import { getAllCategories } from "@/db/queries/categories.js";
import { PostForm } from "../views/post-form.js";

export async function postEditAction(c: Context) {
	const id = Number.parseInt(c.req.param("id"));

	// Fetch the post
	const postWithRelations = await getPostById(id);

	if (!postWithRelations) {
		return c.notFound();
	}

	// Fetch categories for the dropdown
	const categories = await getAllCategories();

	return c.html(
		<PostForm
			post={postWithRelations}
			categories={categories}
			attachments={postWithRelations.attachments}
		/>,
	);
}
