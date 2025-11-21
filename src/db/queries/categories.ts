/**
 * Category Query Utilities
 *
 * This module provides type-safe query functions for category-related database operations.
 * Categories are used to organize blog posts into logical groups.
 */

import { eq, sql } from "drizzle-orm";
import { db } from "@/db/connection.js";
import {
	type Category,
	type NewCategory,
	categories,
} from "@/db/schema/categories.js";
import { posts } from "@/db/schema/posts.js";

/**
 * Category with post count
 */
export interface CategoryWithCount extends Category {
	postCount: number;
}

/**
 * Get all categories from the database
 *
 * @returns Array of all categories
 *
 * @example
 * const allCategories = await getAllCategories()
 * console.log(`Found ${allCategories.length} categories`)
 */
export async function getAllCategories(): Promise<Category[]> {
	return await db.select().from(categories);
}

/**
 * Get all categories with post counts
 *
 * @returns Array of categories with post counts
 *
 * @example
 * const categoriesWithCounts = await getAllCategoriesWithCount()
 * categoriesWithCounts.forEach(cat => {
 *   console.log(`${cat.name}: ${cat.postCount} posts`)
 * })
 */
export async function getAllCategoriesWithCount(): Promise<CategoryWithCount[]> {
	const result = await db
		.select({
			id: categories.id,
			name: categories.name,
			slug: categories.slug,
			description: categories.description,
			createdAt: categories.createdAt,
			updatedAt: categories.updatedAt,
			postCount: sql<number>`count(${posts.id})::int`,
		})
		.from(categories)
		.leftJoin(posts, eq(posts.categoryId, categories.id))
		.groupBy(categories.id);

	return result as CategoryWithCount[];
}

/**
 * Get a category by its ID
 *
 * @param id - The category's ID
 * @returns The category if found, undefined otherwise
 *
 * @example
 * const category = await getCategoryById(1)
 * if (category) {
 *   console.log(`Found category: ${category.name}`)
 * }
 */
export async function getCategoryById(
	id: number,
): Promise<Category | undefined> {
	const result = await db
		.select()
		.from(categories)
		.where(eq(categories.id, id));
	return result[0];
}

/**
 * Get a category by its slug
 *
 * @param slug - The category's slug
 * @returns The category if found, undefined otherwise
 *
 * @example
 * const category = await getCategoryBySlug("technology")
 * if (category) {
 *   console.log(`Found category: ${category.name}`)
 * }
 */
export async function getCategoryBySlug(
	slug: string,
): Promise<Category | undefined> {
	const result = await db
		.select()
		.from(categories)
		.where(eq(categories.slug, slug));
	return result[0];
}

/**
 * Create a new category
 *
 * @param categoryData - Category data to insert
 * @returns The created category
 *
 * @example
 * const newCategory = await createCategory({
 *   name: "Technology",
 *   slug: "technology",
 *   description: "All tech-related posts"
 * })
 * console.log(`Created category with ID: ${newCategory.id}`)
 */
export async function createCategory(
	categoryData: NewCategory,
): Promise<Category> {
	const result = await db
		.insert(categories)
		.values(categoryData)
		.returning();
	return result[0];
}

/**
 * Update a category by its ID
 *
 * @param id - The category's ID
 * @param categoryData - Partial category data to update
 * @returns The updated category if found, undefined otherwise
 *
 * @example
 * const updated = await updateCategory(1, { name: "New Name" })
 * if (updated) {
 *   console.log(`Updated category: ${updated.name}`)
 * }
 */
export async function updateCategory(
	id: number,
	categoryData: Partial<NewCategory>,
): Promise<Category | undefined> {
	const result = await db
		.update(categories)
		.set(categoryData)
		.where(eq(categories.id, id))
		.returning();
	return result[0];
}

/**
 * Delete a category by its ID
 *
 * @param id - The category's ID
 * @returns True if category was deleted, false if not found
 *
 * @example
 * const deleted = await deleteCategory(1)
 * if (deleted) {
 *   console.log("Category deleted successfully")
 * }
 */
export async function deleteCategory(id: number): Promise<boolean> {
	const result = await db
		.delete(categories)
		.where(eq(categories.id, id))
		.returning();
	return result.length > 0;
}

/**
 * Count total number of categories
 *
 * @returns The total number of categories
 *
 * @example
 * const count = await countCategories()
 * console.log(`Total categories: ${count}`)
 */
export async function countCategories(): Promise<number> {
	const result = await db.select().from(categories);
	return result.length;
}
