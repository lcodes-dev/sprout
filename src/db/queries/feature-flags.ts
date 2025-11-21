/**
 * Feature Flag Query Utilities
 *
 * This module provides type-safe query functions for feature flag database operations.
 * These utilities handle CRUD operations for the feature flags system.
 */

import { eq } from "drizzle-orm";
import { db } from "@/db/connection.js";
import {
	type FeatureFlag,
	type NewFeatureFlag,
	featureFlags,
} from "@/db/schema/feature-flags.js";

/**
 * Get all feature flags from the database
 *
 * @returns Array of all feature flags
 *
 * @example
 * const allFlags = await getAllFeatureFlags()
 * console.log(`Found ${allFlags.length} feature flags`)
 */
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
	return await db.select().from(featureFlags);
}

/**
 * Get a feature flag by its unique key
 *
 * @param key - The feature flag's unique key
 * @returns The feature flag if found, undefined otherwise
 *
 * @example
 * const flag = await getFeatureFlagByKey("new_checkout_flow")
 * if (flag && flag.active) {
 *   console.log(`Feature is enabled for ${flag.percentage}% of users`)
 * }
 */
export async function getFeatureFlagByKey(
	key: string,
): Promise<FeatureFlag | undefined> {
	const result = await db
		.select()
		.from(featureFlags)
		.where(eq(featureFlags.key, key));
	return result[0];
}

/**
 * Get a feature flag by its ID
 *
 * @param id - The feature flag's ID
 * @returns The feature flag if found, undefined otherwise
 *
 * @example
 * const flag = await getFeatureFlagById(1)
 * if (flag) {
 *   console.log(`Found flag: ${flag.key}`)
 * }
 */
export async function getFeatureFlagById(
	id: number,
): Promise<FeatureFlag | undefined> {
	const result = await db
		.select()
		.from(featureFlags)
		.where(eq(featureFlags.id, id));
	return result[0];
}

/**
 * Create a new feature flag
 *
 * @param flagData - Feature flag data to insert
 * @returns The created feature flag
 *
 * @example
 * const newFlag = await createFeatureFlag({
 *   key: "new_dashboard",
 *   active: true,
 *   percentage: 25
 * })
 * console.log(`Created feature flag with ID: ${newFlag.id}`)
 */
export async function createFeatureFlag(
	flagData: NewFeatureFlag,
): Promise<FeatureFlag> {
	const result = await db.insert(featureFlags).values(flagData).returning();
	return result[0];
}

/**
 * Update a feature flag by its ID
 *
 * @param id - The feature flag's ID
 * @param flagData - Partial feature flag data to update
 * @returns The updated feature flag if found, undefined otherwise
 *
 * @example
 * const updated = await updateFeatureFlag(1, { percentage: 50 })
 * if (updated) {
 *   console.log(`Updated flag to ${updated.percentage}%`)
 * }
 */
export async function updateFeatureFlag(
	id: number,
	flagData: Partial<NewFeatureFlag>,
): Promise<FeatureFlag | undefined> {
	const result = await db
		.update(featureFlags)
		.set(flagData)
		.where(eq(featureFlags.id, id))
		.returning();
	return result[0];
}

/**
 * Delete a feature flag by its ID
 *
 * @param id - The feature flag's ID
 * @returns True if flag was deleted, false if not found
 *
 * @example
 * const deleted = await deleteFeatureFlag(1)
 * if (deleted) {
 *   console.log("Feature flag deleted successfully")
 * }
 */
export async function deleteFeatureFlag(id: number): Promise<boolean> {
	const result = await db
		.delete(featureFlags)
		.where(eq(featureFlags.id, id))
		.returning();
	return result.length > 0;
}

/**
 * Toggle a feature flag's active status
 *
 * @param id - The feature flag's ID
 * @returns The updated feature flag if found, undefined otherwise
 *
 * @example
 * const toggled = await toggleFeatureFlag(1)
 * if (toggled) {
 *   console.log(`Flag is now ${toggled.active ? 'active' : 'inactive'}`)
 * }
 */
export async function toggleFeatureFlag(
	id: number,
): Promise<FeatureFlag | undefined> {
	// First, get the current flag
	const currentFlag = await getFeatureFlagById(id);
	if (!currentFlag) {
		return undefined;
	}

	// Toggle the active status
	return await updateFeatureFlag(id, { active: !currentFlag.active });
}

/**
 * Count total number of feature flags
 *
 * @returns The total number of feature flags
 *
 * @example
 * const count = await countFeatureFlags()
 * console.log(`Total feature flags: ${count}`)
 */
export async function countFeatureFlags(): Promise<number> {
	const result = await db.select().from(featureFlags);
	return result.length;
}
