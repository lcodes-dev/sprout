/**
 * Post Delete Action
 *
 * Handles deleting a post
 */

import type { Context } from "hono";
import { deletePost } from "@/db/queries/posts.js";

export async function postDeleteAction(c: Context) {
	const id = Number.parseInt(c.req.param("id"));

	try {
		// Delete the post (attachments will be cascade deleted)
		const deleted = await deletePost(id);

		if (!deleted) {
			return c.notFound();
		}

		// TODO: Delete associated files from storage

		// Redirect back to the post list
		return c.redirect("/admin/blog");
	} catch (error) {
		console.error("Error deleting post:", error);
		return c.redirect("/admin/blog");
	}
}
