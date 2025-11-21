/**
 * Feature Flag Utilities
 *
 * Main API for checking feature flag status in the application.
 * Uses in-memory cache for fast lookups without database queries.
 */

import { getFromCache } from "./cache.js";
import type { FeatureFlag } from "@/db/schema/feature-flags.js";

// Re-export cache management functions
export {
	initializeCache,
	refreshCache,
	clearCache,
	getCacheSize,
} from "./cache.js";

/**
 * Check if a feature flag is enabled for a given user
 *
 * This is the main function used throughout the application to check feature flags.
 *
 * **Behavior:**
 * 1. If flag doesn't exist, returns false
 * 2. If flag is not active, returns false
 * 3. If percentage is 0, returns false
 * 4. If percentage is 100, returns true
 * 5. If userId is provided, uses deterministic hashing (userId % 100 < percentage)
 * 6. If no userId, uses random probability based on percentage
 *
 * **Deterministic behavior with userId:**
 * When a userId is provided, the same user will always get the same result
 * for a given flag percentage. This ensures consistent user experience.
 *
 * @param key - The feature flag key (e.g., "new_checkout_flow")
 * @param userId - Optional user ID for deterministic rollout
 * @returns True if feature is enabled, false otherwise
 *
 * @example
 * // Simple check (no user targeting)
 * if (isFeatureEnabled("new_ui_redesign")) {
 *   return <NewUI />
 * }
 *
 * @example
 * // With user targeting (deterministic)
 * const userId = c.get('userId')
 * if (isFeatureEnabled("beta_feature", userId)) {
 *   return <BetaFeature />
 * }
 */
export function isFeatureEnabled(key: string, userId?: number): boolean {
	const flag = getFromCache(key);

	// Flag doesn't exist
	if (!flag) {
		return false;
	}

	// Flag is not active
	if (!flag.active) {
		return false;
	}

	// Check percentage
	if (flag.percentage === 0) {
		return false;
	}

	if (flag.percentage === 100) {
		return true;
	}

	// Percentage-based rollout
	if (userId !== undefined) {
		// Deterministic: same user always gets same result
		// Use simple modulo for consistent hashing
		return (userId % 100) < flag.percentage;
	}

	// No userId: use random probability
	return Math.random() * 100 < flag.percentage;
}

/**
 * Get the rollout percentage for a feature flag
 *
 * @param key - The feature flag key
 * @returns The percentage (0-100), or 0 if flag doesn't exist
 *
 * @example
 * const percentage = getFeatureFlagPercentage("new_feature")
 * console.log(`Feature is enabled for ${percentage}% of users`)
 */
export function getFeatureFlagPercentage(key: string): number {
	const flag = getFromCache(key);
	return flag?.percentage ?? 0;
}

/**
 * Get a feature flag by its key
 *
 * Returns the complete feature flag object from cache.
 * Useful when you need access to all flag properties.
 *
 * @param key - The feature flag key
 * @returns The feature flag if found, undefined otherwise
 *
 * @example
 * const flag = getFeatureFlag("new_feature")
 * if (flag) {
 *   console.log(`Flag ${flag.key} is ${flag.active ? 'active' : 'inactive'}`)
 *   console.log(`Rollout: ${flag.percentage}%`)
 *   console.log(`Last updated: ${flag.updatedAt}`)
 * }
 */
export function getFeatureFlag(key: string): FeatureFlag | undefined {
	return getFromCache(key);
}

/**
 * Check if a feature flag exists in the cache
 *
 * @param key - The feature flag key
 * @returns True if flag exists, false otherwise
 *
 * @example
 * if (featureFlagExists("new_feature")) {
 *   console.log("Flag is defined")
 * }
 */
export function featureFlagExists(key: string): boolean {
	return getFromCache(key) !== undefined;
}

/**
 * Get all active feature flags
 *
 * Returns an array of all feature flags that are currently active.
 *
 * @returns Array of active feature flags
 *
 * @example
 * const activeFlags = getActiveFeatureFlags()
 * console.log(`${activeFlags.length} features are currently active`)
 */
export function getActiveFeatureFlags(): FeatureFlag[] {
	const { getAllFromCache } = require("./cache.js");
	return getAllFromCache().filter((flag: FeatureFlag) => flag.active);
}

/**
 * Get all feature flag keys
 *
 * Returns an array of all feature flag keys in the cache.
 * Useful for debugging or listing available flags.
 *
 * @returns Array of feature flag keys
 *
 * @example
 * const keys = getAllFeatureFlagKeys()
 * console.log(`Available flags: ${keys.join(", ")}`)
 */
export function getAllFeatureFlagKeys(): string[] {
	const { getAllFromCache } = require("./cache.js");
	return getAllFromCache().map((flag: FeatureFlag) => flag.key);
}
