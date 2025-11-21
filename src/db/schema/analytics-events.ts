/**
 * Analytics Events Schema
 *
 * Stores anonymized analytics events for tracking website usage.
 * Privacy-focused design:
 * - IP addresses are anonymized (last octet removed)
 * - No cookies or personal identifiers
 * - Paths are cleaned of sensitive parameters
 * - Aggregate data only
 */

import { index, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Analytics events table schema
 *
 * Tracks page views and user behavior while preserving privacy.
 */
export const analyticsEvents = pgTable(
	"analytics_events",
	{
		/**
		 * Unique identifier for the event
		 * Auto-incrementing primary key
		 */
		id: serial("id").primaryKey(),

		/**
		 * Anonymized IP address
		 * IPv4: Last octet set to 0 (e.g., 192.168.1.0)
		 * IPv6: Last 80 bits set to 0
		 */
		anonymizedIp: text("anonymized_ip").notNull(),

		/**
		 * User agent string
		 * Used to determine browser, OS, and device type
		 */
		userAgent: text("user_agent").notNull(),

		/**
		 * Cleaned URL path
		 * - Sensitive parameters removed (token, secret, etc.)
		 * - Dynamic segments may be generalized (/user/123 → /user/:id)
		 */
		path: text("path").notNull(),

		/**
		 * HTTP referer
		 * Source of the traffic (where the user came from)
		 * Null for direct traffic
		 */
		referer: text("referer"),

		/**
		 * Timestamp of the event
		 * When the page was viewed
		 */
		timestamp: timestamp("timestamp").notNull(),

		/**
		 * Timestamp of when the record was created
		 * For batch inserts, may differ from event timestamp
		 */
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => ({
		/**
		 * Index on timestamp for efficient time-based queries
		 * Used for: "show me analytics for the last 7 days"
		 */
		timestampIdx: index("analytics_events_timestamp_idx").on(table.timestamp),

		/**
		 * Index on path for efficient page-specific queries
		 * Used for: "show me top pages"
		 */
		pathIdx: index("analytics_events_path_idx").on(table.path),

		/**
		 * Composite index on timestamp + path for efficient filtered queries
		 * Used for: "show me views for /about in the last 30 days"
		 */
		timestampPathIdx: index("analytics_events_timestamp_path_idx").on(
			table.timestamp,
			table.path,
		),
	}),
);

/**
 * TypeScript type for an analytics event (inferred from schema)
 * Use this for type-safe analytics event objects
 *
 * @example
 * const event: AnalyticsEvent = {
 *   id: 1,
 *   anonymizedIp: "192.168.1.0",
 *   userAgent: "Mozilla/5.0...",
 *   path: "/about",
 *   referer: "https://google.com",
 *   timestamp: new Date(),
 *   createdAt: new Date()
 * }
 */
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

/**
 * TypeScript type for creating a new analytics event (insert)
 * Excludes auto-generated fields like id and createdAt
 *
 * @example
 * const newEvent: NewAnalyticsEvent = {
 *   anonymizedIp: "192.168.1.0",
 *   userAgent: "Mozilla/5.0...",
 *   path: "/about",
 *   referer: "https://google.com",
 *   timestamp: new Date()
 * }
 */
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
