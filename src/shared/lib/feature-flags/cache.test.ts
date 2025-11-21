/**
 * Feature Flag Cache Tests
 *
 * Tests for the in-memory feature flag cache
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	initializeCache,
	getFromCache,
	getAllFromCache,
	updateCache,
	removeFromCache,
	refreshCache,
	getCacheSize,
	clearCache,
} from "./cache.js";
import { createFeatureFlag } from "@/db/queries/feature-flags.js";
import {
	cleanupTestDatabase,
	withTestDatabase,
} from "@/db/test-helpers.js";
import type { FeatureFlag } from "@/db/schema/feature-flags.js";

describe("Feature Flag Cache", () => {
	beforeEach(async () => {
		await cleanupTestDatabase();
		clearCache();
	});

	describe("initializeCache", () => {
		it("should populate cache with all flags from database", async () => {
			await withTestDatabase(async () => {
				// Create test flags in database
				await createFeatureFlag({
					key: "flag_1",
					active: true,
					percentage: 50,
				});
				await createFeatureFlag({
					key: "flag_2",
					active: false,
					percentage: 25,
				});

				// Initialize cache
				await initializeCache();

				// Verify cache is populated
				expect(getCacheSize()).toBe(2);
				expect(getFromCache("flag_1")).toBeDefined();
				expect(getFromCache("flag_2")).toBeDefined();
			});
		});

		it("should clear existing cache before populating", async () => {
			await withTestDatabase(async () => {
				// Add flag directly to cache
				updateCache({
					id: 999,
					key: "old_flag",
					active: true,
					percentage: 100,
					updatedAt: new Date(),
				});
				expect(getCacheSize()).toBe(1);

				// Create different flag in database
				await createFeatureFlag({
					key: "new_flag",
					active: true,
					percentage: 50,
				});

				// Initialize cache - should clear old and load new
				await initializeCache();

				expect(getCacheSize()).toBe(1);
				expect(getFromCache("old_flag")).toBeUndefined();
				expect(getFromCache("new_flag")).toBeDefined();
			});
		});

		it("should handle empty database", async () => {
			await withTestDatabase(async () => {
				await initializeCache();
				expect(getCacheSize()).toBe(0);
			});
		});
	});

	describe("getFromCache", () => {
		it("should return undefined for non-existent key", () => {
			const flag = getFromCache("non_existent");
			expect(flag).toBeUndefined();
		});

		it("should return flag for existing key", async () => {
			await withTestDatabase(async () => {
				const created = await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 75,
				});
				await initializeCache();

				const cached = getFromCache("test_flag");
				expect(cached).toBeDefined();
				expect(cached?.key).toBe("test_flag");
				expect(cached?.active).toBe(true);
				expect(cached?.percentage).toBe(75);
			});
		});
	});

	describe("getAllFromCache", () => {
		it("should return empty array when cache is empty", () => {
			const flags = getAllFromCache();
			expect(flags).toEqual([]);
		});

		it("should return all cached flags", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({ key: "flag_1", active: true });
				await createFeatureFlag({ key: "flag_2", active: false });
				await createFeatureFlag({ key: "flag_3", active: true });
				await initializeCache();

				const flags = getAllFromCache();
				expect(flags).toHaveLength(3);
				expect(flags.map((f) => f.key)).toContain("flag_1");
				expect(flags.map((f) => f.key)).toContain("flag_2");
				expect(flags.map((f) => f.key)).toContain("flag_3");
			});
		});
	});

	describe("updateCache", () => {
		it("should add new flag to cache", () => {
			const flag: FeatureFlag = {
				id: 1,
				key: "new_flag",
				active: true,
				percentage: 50,
				updatedAt: new Date(),
			};

			updateCache(flag);

			expect(getCacheSize()).toBe(1);
			expect(getFromCache("new_flag")).toEqual(flag);
		});

		it("should update existing flag in cache", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "test_flag",
					active: false,
					percentage: 25,
				});
				await initializeCache();

				const cached = getFromCache("test_flag");
				expect(cached?.active).toBe(false);
				expect(cached?.percentage).toBe(25);

				// Update the cache
				const updated: FeatureFlag = {
					id: cached!.id,
					key: "test_flag",
					active: true,
					percentage: 75,
					updatedAt: new Date(),
				};
				updateCache(updated);

				const updatedCached = getFromCache("test_flag");
				expect(updatedCached?.active).toBe(true);
				expect(updatedCached?.percentage).toBe(75);
			});
		});
	});

	describe("removeFromCache", () => {
		it("should remove existing flag from cache", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({ key: "test_flag", active: true });
				await initializeCache();

				expect(getFromCache("test_flag")).toBeDefined();
				expect(getCacheSize()).toBe(1);

				removeFromCache("test_flag");

				expect(getFromCache("test_flag")).toBeUndefined();
				expect(getCacheSize()).toBe(0);
			});
		});

		it("should handle removing non-existent flag gracefully", () => {
			expect(() => removeFromCache("non_existent")).not.toThrow();
		});
	});

	describe("refreshCache", () => {
		it("should reload all flags from database", async () => {
			await withTestDatabase(async () => {
				// Initialize with one flag
				await createFeatureFlag({ key: "flag_1", active: true });
				await initializeCache();
				expect(getCacheSize()).toBe(1);

				// Add another flag to database
				await createFeatureFlag({ key: "flag_2", active: false });

				// Refresh cache
				await refreshCache();

				// Should now have both flags
				expect(getCacheSize()).toBe(2);
				expect(getFromCache("flag_1")).toBeDefined();
				expect(getFromCache("flag_2")).toBeDefined();
			});
		});

		it("should replace manually updated cache entries", async () => {
			await withTestDatabase(async () => {
				const created = await createFeatureFlag({
					key: "test_flag",
					active: false,
					percentage: 25,
				});
				await initializeCache();

				// Manually update cache
				updateCache({
					id: created.id,
					key: "test_flag",
					active: true,
					percentage: 100,
					updatedAt: new Date(),
				});

				const manuallyUpdated = getFromCache("test_flag");
				expect(manuallyUpdated?.percentage).toBe(100);

				// Refresh cache - should restore database values
				await refreshCache();

				const refreshed = getFromCache("test_flag");
				expect(refreshed?.percentage).toBe(25); // Original value from DB
			});
		});
	});

	describe("getCacheSize", () => {
		it("should return 0 for empty cache", () => {
			expect(getCacheSize()).toBe(0);
		});

		it("should return correct size", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({ key: "flag_1", active: true });
				await createFeatureFlag({ key: "flag_2", active: false });
				await initializeCache();

				expect(getCacheSize()).toBe(2);
			});
		});
	});

	describe("clearCache", () => {
		it("should remove all flags from cache", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({ key: "flag_1", active: true });
				await createFeatureFlag({ key: "flag_2", active: false });
				await initializeCache();

				expect(getCacheSize()).toBe(2);

				clearCache();

				expect(getCacheSize()).toBe(0);
				expect(getAllFromCache()).toEqual([]);
			});
		});
	});
});
