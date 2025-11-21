/**
 * Analytics Events Query Utilities
 *
 * Type-safe query functions for analytics-related database operations.
 * These utilities provide aggregated statistics and insights from analytics data.
 */

import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/connection.js";
import {
	type AnalyticsEvent,
	analyticsEvents,
	type NewAnalyticsEvent,
} from "@/db/schema/analytics-events.js";

/**
 * Insert multiple analytics events (batch insert)
 *
 * @param events - Array of events to insert
 * @returns Array of inserted events
 *
 * @example
 * await insertAnalyticsEvents([
 *   { anonymizedIp: "192.168.1.0", userAgent: "...", path: "/", timestamp: new Date() },
 *   { anonymizedIp: "10.0.0.0", userAgent: "...", path: "/about", timestamp: new Date() }
 * ])
 */
export async function insertAnalyticsEvents(
	events: NewAnalyticsEvent[],
): Promise<AnalyticsEvent[]> {
	if (events.length === 0) {
		return [];
	}

	return await db.insert(analyticsEvents).values(events).returning();
}

/**
 * Get analytics events for a specific period
 *
 * @param days - Number of days to look back (e.g., 7 for last 7 days)
 * @returns Analytics events from the specified period
 *
 * @example
 * const last7Days = await getAnalyticsForPeriod(7)
 */
export async function getAnalyticsForPeriod(
	days: number,
): Promise<AnalyticsEvent[]> {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	return await db
		.select()
		.from(analyticsEvents)
		.where(gte(analyticsEvents.timestamp, startDate))
		.orderBy(desc(analyticsEvents.timestamp));
}

/**
 * Get top N most visited pages
 *
 * @param limit - Maximum number of pages to return (default: 10)
 * @param days - Number of days to look back (optional, all time if not specified)
 * @returns Array of pages with view counts
 *
 * @example
 * const topPages = await getTopPages(10, 7) // Top 10 pages in last 7 days
 */
export async function getTopPages(
	limit = 10,
	days?: number,
): Promise<Array<{ path: string; views: number }>> {
	let query = db
		.select({
			path: analyticsEvents.path,
			views: count(analyticsEvents.id).as("views"),
		})
		.from(analyticsEvents)
		.groupBy(analyticsEvents.path)
		.orderBy(desc(sql`views`))
		.limit(limit);

	if (days) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);
		query = query.where(gte(analyticsEvents.timestamp, startDate)) as typeof query;
	}

	return await query;
}

/**
 * Get browser statistics from user agents
 *
 * Note: This extracts browser info from user agent strings.
 * For production use, consider using a user agent parsing library.
 *
 * @param days - Number of days to look back (optional)
 * @returns Array of browsers with view counts
 *
 * @example
 * const browsers = await getBrowserStats(30)
 */
export async function getBrowserStats(
	days?: number,
): Promise<Array<{ browser: string; views: number }>> {
	let query = db
		.select({
			userAgent: analyticsEvents.userAgent,
		})
		.from(analyticsEvents);

	if (days) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);
		query = query.where(gte(analyticsEvents.timestamp, startDate)) as typeof query;
	}

	const events = await query;

	// Group by browser (simple extraction from user agent)
	const browserCounts = new Map<string, number>();

	for (const event of events) {
		const browser = extractBrowser(event.userAgent);
		browserCounts.set(browser, (browserCounts.get(browser) || 0) + 1);
	}

	// Convert to array and sort
	return Array.from(browserCounts.entries())
		.map(([browser, views]) => ({ browser, views }))
		.sort((a, b) => b.views - a.views);
}

/**
 * Get referrer statistics
 *
 * @param limit - Maximum number of referrers to return (default: 10)
 * @param days - Number of days to look back (optional)
 * @returns Array of referrers with view counts
 *
 * @example
 * const topReferrers = await getReferrerStats(10, 7)
 */
export async function getReferrerStats(
	limit = 10,
	days?: number,
): Promise<Array<{ referrer: string; views: number }>> {
	let query = db
		.select({
			referer: analyticsEvents.referer,
			views: count(analyticsEvents.id).as("views"),
		})
		.from(analyticsEvents)
		.groupBy(analyticsEvents.referer)
		.orderBy(desc(sql`views`))
		.limit(limit);

	if (days) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);
		query = query.where(gte(analyticsEvents.timestamp, startDate)) as typeof query;
	}

	const results = await query;

	// Map null referer to "Direct"
	return results.map((r) => ({
		referrer: r.referer || "Direct",
		views: r.views,
	}));
}

/**
 * Get unique visitors count (estimated by unique anonymized IPs)
 *
 * Note: This is an estimate as IP anonymization may group multiple users
 *
 * @param days - Number of days to look back
 * @returns Number of unique visitors
 *
 * @example
 * const uniqueVisitors = await getUniqueVisitors(7)
 */
export async function getUniqueVisitors(days: number): Promise<number> {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	const result = await db
		.select({
			uniqueIps: sql<number>`COUNT(DISTINCT ${analyticsEvents.anonymizedIp})`,
		})
		.from(analyticsEvents)
		.where(gte(analyticsEvents.timestamp, startDate));

	return result[0]?.uniqueIps || 0;
}

/**
 * Get total page views count
 *
 * @param days - Number of days to look back (optional, all time if not specified)
 * @returns Total number of page views
 *
 * @example
 * const totalViews = await getTotalViews(30)
 */
export async function getTotalViews(days?: number): Promise<number> {
	let query = db
		.select({
			total: count(analyticsEvents.id).as("total"),
		})
		.from(analyticsEvents);

	if (days) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);
		query = query.where(gte(analyticsEvents.timestamp, startDate)) as typeof query;
	}

	const result = await query;
	return result[0]?.total || 0;
}

/**
 * Get time series data for charts
 *
 * @param days - Number of days to look back
 * @param groupBy - Grouping interval ('hour' or 'day')
 * @returns Array of time buckets with view counts
 *
 * @example
 * const hourlyViews = await getTimeSeriesData(1, 'hour') // Last 24 hours
 * const dailyViews = await getTimeSeriesData(30, 'day') // Last 30 days
 */
export async function getTimeSeriesData(
	days: number,
	groupBy: "hour" | "day" = "day",
): Promise<Array<{ timestamp: string; views: number }>> {
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	// Format based on grouping
	const dateFormat =
		groupBy === "hour"
			? sql`to_char(${analyticsEvents.timestamp}, 'YYYY-MM-DD HH24:00:00')`
			: sql`to_char(${analyticsEvents.timestamp}, 'YYYY-MM-DD')`;

	const results = await db
		.select({
			timestamp: dateFormat.as("timestamp"),
			views: count(analyticsEvents.id).as("views"),
		})
		.from(analyticsEvents)
		.where(gte(analyticsEvents.timestamp, startDate))
		.groupBy(dateFormat)
		.orderBy(dateFormat);

	return results.map((r) => ({
		timestamp: r.timestamp as string,
		views: r.views,
	}));
}

/**
 * Extract browser name from user agent string
 *
 * Simple extraction - for production, use a library like ua-parser-js
 *
 * @param userAgent - User agent string
 * @returns Browser name
 *
 * @private
 */
function extractBrowser(userAgent: string): string {
	const ua = userAgent.toLowerCase();

	if (ua.includes("edg/")) return "Edge";
	if (ua.includes("chrome/") && !ua.includes("edg/")) return "Chrome";
	if (ua.includes("firefox/")) return "Firefox";
	if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
	if (ua.includes("opera/") || ua.includes("opr/")) return "Opera";

	return "Other";
}
