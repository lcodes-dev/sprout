/**
 * Post List Action
 *
 * Handles displaying the list of all posts in the admin panel
 */

import type { Context } from "hono";
import { getAllPosts } from "@/db/queries/posts.js";
import { getAllCategories } from "@/db/queries/categories.js";
import { getUserById } from "@/db/queries/users.js";
import { PostList } from "../views/post-list.js";

export async function postListAction(c: Context) {
	// Get filter parameters from query string
	const status = c.req.query("status") as "draft" | "published" | undefined;
	const categoryIdParam = c.req.query("categoryId");
	const categoryId = categoryIdParam ? Number.parseInt(categoryIdParam) : undefined;

	// Fetch posts with filters
	const posts = await getAllPosts({ status, categoryId });

	// Fetch categories for filter dropdown
	const categories = await getAllCategories();

	// Load author and category for each post
	const postsWithRelations = await Promise.all(
		posts.map(async (post) => {
			const author = await getUserById(post.authorId);
			let category = null;
			if (post.categoryId) {
				const cat = categories.find((c) => c.id === post.categoryId);
				category = cat ?? null;
			}
			return {
				...post,
				author: author!,
				category,
			};
		}),
	);

	return c.html(
		<PostList
			posts={postsWithRelations}
			categories={categories}
			currentFilter={{ status, categoryId }}
		/>,
	);
}
