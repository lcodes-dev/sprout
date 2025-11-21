/**
 * Feature Flags Schema
 *
 * Defines the database schema for feature flags using Drizzle ORM's schema builder.
 * Feature flags enable controlled feature rollouts with percentage-based targeting.
 */

import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Feature flags table schema
 *
 * Stores configuration for feature flags/toggles that control feature rollouts.
 */
export const featureFlags = pgTable("feature_flags", {
	/**
	 * Unique identifier for the feature flag
	 * Auto-incrementing primary key
	 */
	id: serial("id").primaryKey(),

	/**
	 * Unique key identifying the feature flag
	 * Used in code to check if feature is enabled
	 * Format: lowercase_with_underscores (e.g., "new_checkout_flow")
	 */
	key: text("key").notNull().unique(),

	/**
	 * Whether the feature flag is active
	 * If false, feature is disabled for all users regardless of percentage
	 */
	active: boolean("active").notNull().default(false),

	/**
	 * Percentage of users who should see the feature (0-100)
	 * - 0: Feature disabled for all users
	 * - 100: Feature enabled for all users
	 * - 25: Feature enabled for ~25% of users
	 * Uses deterministic hashing based on userId for consistent experience
	 */
	percentage: integer("percentage").notNull().default(0),

	/**
	 * Timestamp of when the feature flag was last updated
	 * Automatically updates on each change
	 */
	updatedAt: timestamp("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

/**
 * TypeScript type for a feature flag (inferred from schema)
 * Use this for type-safe feature flag objects
 *
 * @example
 * const flag: FeatureFlag = {
 *   id: 1,
 *   key: "new_ui_redesign",
 *   active: true,
 *   percentage: 50,
 *   updatedAt: new Date()
 * }
 */
export type FeatureFlag = typeof featureFlags.$inferSelect;

/**
 * TypeScript type for creating a new feature flag (insert)
 * Excludes auto-generated fields like id and updatedAt
 *
 * @example
 * const newFlag: NewFeatureFlag = {
 *   key: "new_dashboard",
 *   active: true,
 *   percentage: 25
 * }
 */
export type NewFeatureFlag = typeof featureFlags.$inferInsert;
