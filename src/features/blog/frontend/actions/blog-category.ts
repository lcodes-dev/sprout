/**
 * Blog Category Action
 *
 * Handles displaying posts filtered by category
 */

import type { Context } from "hono";
import { getAllPosts } from "@/db/queries/posts.js";
import {
	getAllCategoriesWithCount,
	getCategoryBySlug,
} from "@/db/queries/categories.js";
import { getUserById } from "@/db/queries/users.js";
import { BlogList } from "../views/blog-list.js";

export async function blogCategoryAction(c: Context) {
	const categorySlug = c.req.param("slug");

	// Fetch the category
	const category = await getCategoryBySlug(categorySlug);

	if (!category) {
		return c.notFound();
	}

	// Fetch published posts in this category
	const posts = await getAllPosts({
		status: "published",
		categoryId: category.id,
	});

	// Fetch all categories with post counts
	const categories = await getAllCategoriesWithCount();

	// Load author and category for each post
	const postsWithRelations = await Promise.all(
		posts.map(async (post) => {
			const author = await getUserById(post.authorId);
			return {
				...post,
				author: author!,
				category,
			};
		}),
	);

	return c.html(
		<BlogList
			posts={postsWithRelations}
			categories={categories}
			currentCategorySlug={categorySlug}
		/>,
	);
}
