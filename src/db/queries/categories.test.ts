/**
 * Categories Query Tests
 *
 * Tests for category-related database operations
 */

import { beforeEach, describe, expect, it } from "vitest";
import { resetDatabase } from "../test-helpers.js";
import {
	createCategory,
	deleteCategory,
	getAllCategories,
	getAllCategoriesWithCount,
	getCategoryById,
	getCategoryBySlug,
	updateCategory,
} from "./categories.js";

describe("Category Queries", () => {
	beforeEach(async () => {
		await resetDatabase();
	});

	describe("createCategory", () => {
		it("should create a new category", async () => {
			const category = await createCategory({
				name: "Technology",
				slug: "technology",
				description: "All tech-related posts",
			});

			expect(category.id).toBeDefined();
			expect(category.name).toBe("Technology");
			expect(category.slug).toBe("technology");
			expect(category.description).toBe("All tech-related posts");
			expect(category.createdAt).toBeDefined();
			expect(category.updatedAt).toBeDefined();
		});

		it("should create a category without description", async () => {
			const category = await createCategory({
				name: "Travel",
				slug: "travel",
			});

			expect(category.id).toBeDefined();
			expect(category.name).toBe("Travel");
			expect(category.description).toBeNull();
		});
	});

	describe("getAllCategories", () => {
		it("should return empty array when no categories exist", async () => {
			const categories = await getAllCategories();
			expect(categories).toEqual([]);
		});

		it("should return all categories", async () => {
			await createCategory({ name: "Tech", slug: "tech" });
			await createCategory({ name: "Travel", slug: "travel" });
			await createCategory({ name: "Food", slug: "food" });

			const categories = await getAllCategories();
			expect(categories).toHaveLength(3);
			expect(categories.map((c) => c.name)).toEqual(
				expect.arrayContaining(["Tech", "Travel", "Food"]),
			);
		});
	});

	describe("getCategoryById", () => {
		it("should return undefined for non-existent category", async () => {
			const category = await getCategoryById(999);
			expect(category).toBeUndefined();
		});

		it("should return category by ID", async () => {
			const created = await createCategory({ name: "Tech", slug: "tech" });
			const found = await getCategoryById(created.id);

			expect(found).toBeDefined();
			expect(found?.id).toBe(created.id);
			expect(found?.name).toBe("Tech");
		});
	});

	describe("getCategoryBySlug", () => {
		it("should return undefined for non-existent slug", async () => {
			const category = await getCategoryBySlug("non-existent");
			expect(category).toBeUndefined();
		});

		it("should return category by slug", async () => {
			await createCategory({ name: "Technology", slug: "technology" });
			const found = await getCategoryBySlug("technology");

			expect(found).toBeDefined();
			expect(found?.slug).toBe("technology");
			expect(found?.name).toBe("Technology");
		});
	});

	describe("updateCategory", () => {
		it("should return undefined for non-existent category", async () => {
			const updated = await updateCategory(999, { name: "New Name" });
			expect(updated).toBeUndefined();
		});

		it("should update category fields", async () => {
			const category = await createCategory({ name: "Tech", slug: "tech" });
			const updated = await updateCategory(category.id, {
				name: "Technology",
				description: "Updated description",
			});

			expect(updated).toBeDefined();
			expect(updated?.name).toBe("Technology");
			expect(updated?.description).toBe("Updated description");
			expect(updated?.slug).toBe("tech"); // Unchanged
		});
	});

	describe("deleteCategory", () => {
		it("should return false for non-existent category", async () => {
			const deleted = await deleteCategory(999);
			expect(deleted).toBe(false);
		});

		it("should delete category", async () => {
			const category = await createCategory({ name: "Tech", slug: "tech" });
			const deleted = await deleteCategory(category.id);

			expect(deleted).toBe(true);

			const found = await getCategoryById(category.id);
			expect(found).toBeUndefined();
		});
	});

	describe("getAllCategoriesWithCount", () => {
		it("should return categories with zero post counts", async () => {
			await createCategory({ name: "Tech", slug: "tech" });
			await createCategory({ name: "Travel", slug: "travel" });

			const categories = await getAllCategoriesWithCount();
			expect(categories).toHaveLength(2);
			expect(categories[0].postCount).toBe(0);
			expect(categories[1].postCount).toBe(0);
		});
	});
});
