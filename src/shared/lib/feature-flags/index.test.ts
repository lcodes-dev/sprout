/**
 * Feature Flag Utilities Tests
 *
 * Tests for the main feature flag checking functions
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	isFeatureEnabled,
	getFeatureFlagPercentage,
	getFeatureFlag,
	featureFlagExists,
	getActiveFeatureFlags,
	getAllFeatureFlagKeys,
	initializeCache,
	clearCache,
} from "./index.js";
import { createFeatureFlag } from "@/db/queries/feature-flags.js";
import {
	cleanupTestDatabase,
	withTestDatabase,
} from "@/db/test-helpers.js";

describe("Feature Flag Utilities", () => {
	beforeEach(async () => {
		await cleanupTestDatabase();
		clearCache();
	});

	describe("isFeatureEnabled", () => {
		it("should return false for non-existent flag", () => {
			const enabled = isFeatureEnabled("non_existent_flag");
			expect(enabled).toBe(false);
		});

		it("should return false when flag is inactive", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "test_flag",
					active: false,
					percentage: 100,
				});
				await initializeCache();

				const enabled = isFeatureEnabled("test_flag");
				expect(enabled).toBe(false);
			});
		});

		it("should return false when percentage is 0", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 0,
				});
				await initializeCache();

				const enabled = isFeatureEnabled("test_flag");
				expect(enabled).toBe(false);
			});
		});

		it("should return true when percentage is 100", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 100,
				});
				await initializeCache();

				const enabled = isFeatureEnabled("test_flag");
				expect(enabled).toBe(true);
			});
		});

		it("should use deterministic logic with userId", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 50,
				});
				await initializeCache();

				// User 25 should be enabled (25 % 100 < 50)
				const user25 = isFeatureEnabled("test_flag", 25);
				expect(user25).toBe(true);

				// User 75 should be disabled (75 % 100 >= 50)
				const user75 = isFeatureEnabled("test_flag", 75);
				expect(user75).toBe(false);

				// Same user should always get same result
				const user25Again = isFeatureEnabled("test_flag", 25);
				expect(user25Again).toBe(user25);
			});
		});

		it("should be consistent for same userId across multiple calls", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 30,
				});
				await initializeCache();

				const userId = 42;
				const results = [];
				for (let i = 0; i < 10; i++) {
					results.push(isFeatureEnabled("test_flag", userId));
				}

				// All results should be the same
				expect(new Set(results).size).toBe(1);
			});
		});

		it("should use probability without userId", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 50,
				});
				await initializeCache();

				// Mock Math.random for predictable testing
				const originalRandom = Math.random;

				Math.random = () => 0.25; // 25% -> should be enabled
				expect(isFeatureEnabled("test_flag")).toBe(true);

				Math.random = () => 0.75; // 75% -> should be disabled
				expect(isFeatureEnabled("test_flag")).toBe(false);

				// Restore original
				Math.random = originalRandom;
			});
		});

		it("should handle edge case percentages with userId", async () => {
			await withTestDatabase(async () => {
				// Test 1% rollout
				await createFeatureFlag({
					key: "test_1_percent",
					active: true,
					percentage: 1,
				});

				// Test 99% rollout
				await createFeatureFlag({
					key: "test_99_percent",
					active: true,
					percentage: 99,
				});

				await initializeCache();

				// User 0 should be in 1% (0 % 100 < 1)
				expect(isFeatureEnabled("test_1_percent", 0)).toBe(true);
				expect(isFeatureEnabled("test_99_percent", 0)).toBe(true);

				// User 99 should not be in 1% (99 % 100 >= 1)
				expect(isFeatureEnabled("test_1_percent", 99)).toBe(false);
				// But should be in 99% (99 % 100 < 99)
				expect(isFeatureEnabled("test_99_percent", 99)).toBe(false);
			});
		});
	});

	describe("getFeatureFlagPercentage", () => {
		it("should return 0 for non-existent flag", () => {
			const percentage = getFeatureFlagPercentage("non_existent");
			expect(percentage).toBe(0);
		});

		it("should return correct percentage for existing flag", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 75,
				});
				await initializeCache();

				const percentage = getFeatureFlagPercentage("test_flag");
				expect(percentage).toBe(75);
			});
		});

		it("should return percentage even if flag is inactive", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "test_flag",
					active: false,
					percentage: 50,
				});
				await initializeCache();

				const percentage = getFeatureFlagPercentage("test_flag");
				expect(percentage).toBe(50);
			});
		});
	});

	describe("getFeatureFlag", () => {
		it("should return undefined for non-existent flag", () => {
			const flag = getFeatureFlag("non_existent");
			expect(flag).toBeUndefined();
		});

		it("should return complete flag object for existing flag", async () => {
			await withTestDatabase(async () => {
				const created = await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 60,
				});
				await initializeCache();

				const flag = getFeatureFlag("test_flag");
				expect(flag).toBeDefined();
				expect(flag?.id).toBe(created.id);
				expect(flag?.key).toBe("test_flag");
				expect(flag?.active).toBe(true);
				expect(flag?.percentage).toBe(60);
				expect(flag?.updatedAt).toBeInstanceOf(Date);
			});
		});
	});

	describe("featureFlagExists", () => {
		it("should return false for non-existent flag", () => {
			const exists = featureFlagExists("non_existent");
			expect(exists).toBe(false);
		});

		it("should return true for existing flag", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 50,
				});
				await initializeCache();

				const exists = featureFlagExists("test_flag");
				expect(exists).toBe(true);
			});
		});
	});

	describe("getActiveFeatureFlags", () => {
		it("should return empty array when no flags are active", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "flag_1",
					active: false,
					percentage: 50,
				});
				await createFeatureFlag({
					key: "flag_2",
					active: false,
					percentage: 75,
				});
				await initializeCache();

				const activeFlags = getActiveFeatureFlags();
				expect(activeFlags).toEqual([]);
			});
		});

		it("should return only active flags", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "active_flag_1",
					active: true,
					percentage: 50,
				});
				await createFeatureFlag({
					key: "inactive_flag",
					active: false,
					percentage: 75,
				});
				await createFeatureFlag({
					key: "active_flag_2",
					active: true,
					percentage: 100,
				});
				await initializeCache();

				const activeFlags = getActiveFeatureFlags();
				expect(activeFlags).toHaveLength(2);
				expect(activeFlags.map((f) => f.key)).toContain("active_flag_1");
				expect(activeFlags.map((f) => f.key)).toContain("active_flag_2");
				expect(activeFlags.map((f) => f.key)).not.toContain("inactive_flag");
			});
		});
	});

	describe("getAllFeatureFlagKeys", () => {
		it("should return empty array when cache is empty", () => {
			const keys = getAllFeatureFlagKeys();
			expect(keys).toEqual([]);
		});

		it("should return all flag keys", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({ key: "flag_1", active: true });
				await createFeatureFlag({ key: "flag_2", active: false });
				await createFeatureFlag({ key: "flag_3", active: true });
				await initializeCache();

				const keys = getAllFeatureFlagKeys();
				expect(keys).toHaveLength(3);
				expect(keys).toContain("flag_1");
				expect(keys).toContain("flag_2");
				expect(keys).toContain("flag_3");
			});
		});
	});
});
