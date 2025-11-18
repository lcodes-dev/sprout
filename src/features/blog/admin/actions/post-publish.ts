/**
 * Post Publish/Unpublish Action
 *
 * Handles toggling the publish status of a post
 */

import type { Context } from "hono";
import { getPostById, publishPost, unpublishPost } from "@/db/queries/posts.js";

export async function postPublishAction(c: Context) {
	const id = Number.parseInt(c.req.param("id"));

	try {
		// Get the current post
		const post = await getPostById(id);

		if (!post) {
			return c.notFound();
		}

		// Toggle the status
		if (post.status === "draft") {
			await publishPost(id);
		} else {
			await unpublishPost(id);
		}

		// Redirect back to the post list
		return c.redirect("/admin/blog");
	} catch (error) {
		console.error("Error toggling post status:", error);
		return c.redirect("/admin/blog");
	}
}
