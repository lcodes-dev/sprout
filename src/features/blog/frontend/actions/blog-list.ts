/**
 * Blog List Action
 *
 * Handles displaying the public blog listing page
 */

import type { Context } from "hono";
import { getAllPosts } from "@/db/queries/posts.js";
import { getAllCategoriesWithCount } from "@/db/queries/categories.js";
import { getUserById } from "@/db/queries/users.js";
import { BlogList } from "../views/blog-list.js";

export async function blogListAction(c: Context) {
	// Fetch published posts only
	const posts = await getAllPosts({ status: "published" });

	// Fetch categories with post counts
	const categories = await getAllCategoriesWithCount();

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

	return c.html(<BlogList posts={postsWithRelations} categories={categories} />);
}
