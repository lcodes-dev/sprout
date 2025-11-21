/**
 * Post Create Action
 *
 * Handles displaying the post creation form
 */

import type { Context } from "hono";
import { getAllCategories } from "@/db/queries/categories.js";
import { PostForm } from "../views/post-form.js";

export async function postCreateAction(c: Context) {
	// Fetch categories for the dropdown
	const categories = await getAllCategories();

	return c.html(<PostForm categories={categories} />);
}
