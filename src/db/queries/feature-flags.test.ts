/**
 * Feature Flag Query Utilities Tests
 *
 * Tests for feature flag database operations
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
	cleanupTestDatabase,
	seedTestDatabase,
	withTestDatabase,
} from "@/db/test-helpers.js";
import {
	getAllFeatureFlags,
	getFeatureFlagByKey,
	getFeatureFlagById,
	createFeatureFlag,
	updateFeatureFlag,
	deleteFeatureFlag,
	toggleFeatureFlag,
	countFeatureFlags,
} from "./feature-flags.js";

describe("Feature Flag Queries", () => {
	beforeEach(async () => {
		await cleanupTestDatabase();
	});

	describe("getAllFeatureFlags", () => {
		it("should return empty array when no flags exist", async () => {
			await withTestDatabase(async () => {
				const flags = await getAllFeatureFlags();
				expect(flags).toEqual([]);
			});
		});

		it("should return all feature flags", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "test_flag_1",
					active: true,
					percentage: 50,
				});
				await createFeatureFlag({
					key: "test_flag_2",
					active: false,
					percentage: 25,
				});

				const flags = await getAllFeatureFlags();
				expect(flags).toHaveLength(2);
				expect(flags[0].key).toBe("test_flag_1");
				expect(flags[1].key).toBe("test_flag_2");
			});
		});
	});

	describe("getFeatureFlagByKey", () => {
		it("should return undefined for non-existing key", async () => {
			await withTestDatabase(async () => {
				const flag = await getFeatureFlagByKey("non_existing");
				expect(flag).toBeUndefined();
			});
		});

		it("should return feature flag for existing key", async () => {
			await withTestDatabase(async () => {
				const created = await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 75,
				});

				const found = await getFeatureFlagByKey("test_flag");
				expect(found).toBeDefined();
				expect(found?.id).toBe(created.id);
				expect(found?.key).toBe("test_flag");
				expect(found?.active).toBe(true);
				expect(found?.percentage).toBe(75);
			});
		});
	});

	describe("getFeatureFlagById", () => {
		it("should return undefined for invalid ID", async () => {
			await withTestDatabase(async () => {
				const flag = await getFeatureFlagById(99999);
				expect(flag).toBeUndefined();
			});
		});

		it("should return feature flag for valid ID", async () => {
			await withTestDatabase(async () => {
				const created = await createFeatureFlag({
					key: "test_flag",
					active: false,
					percentage: 10,
				});

				const found = await getFeatureFlagById(created.id);
				expect(found).toBeDefined();
				expect(found?.id).toBe(created.id);
				expect(found?.key).toBe("test_flag");
			});
		});
	});

	describe("createFeatureFlag", () => {
		it("should create a feature flag with valid data", async () => {
			await withTestDatabase(async () => {
				const flag = await createFeatureFlag({
					key: "new_feature",
					active: true,
					percentage: 100,
				});

				expect(flag.id).toBeDefined();
				expect(flag.key).toBe("new_feature");
				expect(flag.active).toBe(true);
				expect(flag.percentage).toBe(100);
				expect(flag.updatedAt).toBeInstanceOf(Date);
			});
		});

		it("should create flag with default values", async () => {
			await withTestDatabase(async () => {
				const flag = await createFeatureFlag({
					key: "default_flag",
				});

				expect(flag.active).toBe(false);
				expect(flag.percentage).toBe(0);
			});
		});

		it("should fail to create flag with duplicate key", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({
					key: "duplicate_key",
					active: true,
					percentage: 50,
				});

				// Attempt to create another flag with the same key
				await expect(
					createFeatureFlag({
						key: "duplicate_key",
						active: false,
						percentage: 25,
					}),
				).rejects.toThrow();
			});
		});
	});

	describe("updateFeatureFlag", () => {
		it("should return undefined for non-existing flag", async () => {
			await withTestDatabase(async () => {
				const updated = await updateFeatureFlag(99999, { active: true });
				expect(updated).toBeUndefined();
			});
		});

		it("should update active status", async () => {
			await withTestDatabase(async () => {
				const created = await createFeatureFlag({
					key: "test_flag",
					active: false,
					percentage: 50,
				});

				const updated = await updateFeatureFlag(created.id, { active: true });
				expect(updated).toBeDefined();
				expect(updated?.active).toBe(true);
				expect(updated?.percentage).toBe(50); // unchanged
			});
		});

		it("should update percentage", async () => {
			await withTestDatabase(async () => {
				const created = await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 25,
				});

				const updated = await updateFeatureFlag(created.id, { percentage: 75 });
				expect(updated).toBeDefined();
				expect(updated?.percentage).toBe(75);
				expect(updated?.active).toBe(true); // unchanged
			});
		});

		it("should update multiple fields", async () => {
			await withTestDatabase(async () => {
				const created = await createFeatureFlag({
					key: "test_flag",
					active: false,
					percentage: 0,
				});

				const updated = await updateFeatureFlag(created.id, {
					active: true,
					percentage: 100,
				});
				expect(updated).toBeDefined();
				expect(updated?.active).toBe(true);
				expect(updated?.percentage).toBe(100);
			});
		});
	});

	describe("deleteFeatureFlag", () => {
		it("should return false for non-existing flag", async () => {
			await withTestDatabase(async () => {
				const deleted = await deleteFeatureFlag(99999);
				expect(deleted).toBe(false);
			});
		});

		it("should delete existing flag and return true", async () => {
			await withTestDatabase(async () => {
				const created = await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 50,
				});

				const deleted = await deleteFeatureFlag(created.id);
				expect(deleted).toBe(true);

				// Verify flag is actually deleted
				const found = await getFeatureFlagById(created.id);
				expect(found).toBeUndefined();
			});
		});
	});

	describe("toggleFeatureFlag", () => {
		it("should return undefined for non-existing flag", async () => {
			await withTestDatabase(async () => {
				const toggled = await toggleFeatureFlag(99999);
				expect(toggled).toBeUndefined();
			});
		});

		it("should toggle from false to true", async () => {
			await withTestDatabase(async () => {
				const created = await createFeatureFlag({
					key: "test_flag",
					active: false,
					percentage: 50,
				});

				const toggled = await toggleFeatureFlag(created.id);
				expect(toggled).toBeDefined();
				expect(toggled?.active).toBe(true);
			});
		});

		it("should toggle from true to false", async () => {
			await withTestDatabase(async () => {
				const created = await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 50,
				});

				const toggled = await toggleFeatureFlag(created.id);
				expect(toggled).toBeDefined();
				expect(toggled?.active).toBe(false);
			});
		});

		it("should preserve other fields when toggling", async () => {
			await withTestDatabase(async () => {
				const created = await createFeatureFlag({
					key: "test_flag",
					active: true,
					percentage: 75,
				});

				const toggled = await toggleFeatureFlag(created.id);
				expect(toggled).toBeDefined();
				expect(toggled?.active).toBe(false);
				expect(toggled?.key).toBe("test_flag");
				expect(toggled?.percentage).toBe(75);
			});
		});
	});

	describe("countFeatureFlags", () => {
		it("should return 0 when no flags exist", async () => {
			await withTestDatabase(async () => {
				const count = await countFeatureFlags();
				expect(count).toBe(0);
			});
		});

		it("should return correct count of flags", async () => {
			await withTestDatabase(async () => {
				await createFeatureFlag({ key: "flag_1", active: true });
				await createFeatureFlag({ key: "flag_2", active: false });
				await createFeatureFlag({ key: "flag_3", active: true });

				const count = await countFeatureFlags();
				expect(count).toBe(3);
			});
		});
	});
});
