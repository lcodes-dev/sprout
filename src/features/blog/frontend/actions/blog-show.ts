/**
 * Blog Show Action
 *
 * Handles displaying a single blog post
 */

import type { Context } from "hono";
import { getPostBySlug } from "@/db/queries/posts.js";
import { BlogPost } from "../views/blog-post.js";

export async function blogShowAction(c: Context) {
	const slug = c.req.param("slug");

	// Fetch the post with all relations
	const post = await getPostBySlug(slug);

	if (!post) {
		return c.notFound();
	}

	// Only show published posts on the frontend
	if (post.status !== "published") {
		return c.notFound();
	}

	return c.html(<BlogPost post={post} />);
}
