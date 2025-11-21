/**
 * Feature Flag Cache
 *
 * In-memory cache for feature flags to avoid database queries on every check.
 * The cache is automatically populated on application startup and can be
 * refreshed when flags are modified through the admin panel.
 */

import { getAllFeatureFlags } from "@/db/queries/feature-flags.js";
import type { FeatureFlag } from "@/db/schema/feature-flags.js";

/**
 * In-memory cache of feature flags
 * Key: feature flag key (e.g., "new_dashboard")
 * Value: complete FeatureFlag object
 */
const cache = new Map<string, FeatureFlag>();

/**
 * Initialize the feature flag cache
 *
 * Loads all feature flags from the database into memory.
 * This should be called once when the application starts.
 *
 * @throws Error if database query fails
 *
 * @example
 * await initializeCache()
 * console.log("Feature flag cache initialized")
 */
export async function initializeCache(): Promise<void> {
	try {
		const flags = await getAllFeatureFlags();
		cache.clear();
		for (const flag of flags) {
			cache.set(flag.key, flag);
		}
		console.log(`✅ Feature flag cache initialized with ${flags.length} flags`);
	} catch (error) {
		console.error("❌ Failed to initialize feature flag cache:", error);
		throw error;
	}
}

/**
 * Get a feature flag from the cache
 *
 * @param key - The feature flag key
 * @returns The feature flag if found, undefined otherwise
 *
 * @example
 * const flag = getFromCache("new_checkout_flow")
 * if (flag && flag.active) {
 *   console.log(`Feature is enabled at ${flag.percentage}%`)
 * }
 */
export function getFromCache(key: string): FeatureFlag | undefined {
	return cache.get(key);
}

/**
 * Get all feature flags from the cache
 *
 * @returns Array of all cached feature flags
 *
 * @example
 * const allFlags = getAllFromCache()
 * console.log(`Cache contains ${allFlags.length} flags`)
 */
export function getAllFromCache(): FeatureFlag[] {
	return Array.from(cache.values());
}

/**
 * Update or add a feature flag in the cache
 *
 * @param flag - The feature flag to update/add
 *
 * @example
 * updateCache({
 *   id: 1,
 *   key: "new_feature",
 *   active: true,
 *   percentage: 50,
 *   updatedAt: new Date()
 * })
 */
export function updateCache(flag: FeatureFlag): void {
	cache.set(flag.key, flag);
	console.log(`📝 Feature flag cache updated: ${flag.key}`);
}

/**
 * Remove a feature flag from the cache
 *
 * @param key - The feature flag key to remove
 *
 * @example
 * removeFromCache("old_feature")
 */
export function removeFromCache(key: string): void {
	const deleted = cache.delete(key);
	if (deleted) {
		console.log(`🗑️  Feature flag removed from cache: ${key}`);
	}
}

/**
 * Refresh the entire cache from the database
 *
 * Reloads all feature flags from the database, replacing the current cache.
 * This is typically called after CRUD operations on feature flags.
 *
 * @throws Error if database query fails
 *
 * @example
 * await refreshCache()
 * console.log("Feature flag cache refreshed")
 */
export async function refreshCache(): Promise<void> {
	try {
		await initializeCache();
		console.log("🔄 Feature flag cache refreshed");
	} catch (error) {
		console.error("❌ Failed to refresh feature flag cache:", error);
		throw error;
	}
}

/**
 * Get the current size of the cache
 *
 * @returns Number of feature flags in cache
 *
 * @example
 * const size = getCacheSize()
 * console.log(`Cache contains ${size} flags`)
 */
export function getCacheSize(): number {
	return cache.size;
}

/**
 * Clear the entire cache
 *
 * This is primarily used for testing purposes.
 *
 * @example
 * clearCache()
 */
export function clearCache(): void {
	cache.clear();
	console.log("🧹 Feature flag cache cleared");
}
