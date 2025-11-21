/**
 * Get Analytics Stats Action
 *
 * Fetches aggregated analytics statistics for a given period
 */

import {
	getBrowserStats,
	getReferrerStats,
	getTopPages,
	getTotalViews,
	getUniqueVisitors,
} from "@/db/queries/analytics-events.js";
import type { AnalyticsStats, Period } from "../../types.js";

/**
 * Parse period string to number of days
 */
function parsePeriod(period: Period): number | undefined {
	switch (period) {
		case "24h":
			return 1;
		case "7d":
			return 7;
		case "30d":
			return 30;
		case "all":
			return undefined;
		default:
			return 7; // Default to 7 days
	}
}

/**
 * Get analytics statistics for a period
 *
 * @param period - Time period ('24h', '7d', '30d', 'all')
 * @returns Aggregated analytics statistics
 */
export async function getStats(period: Period = "7d"): Promise<AnalyticsStats> {
	const days = parsePeriod(period);

	const [totalViews, uniqueVisitors, topPages, browsers, referrers] =
		await Promise.all([
			getTotalViews(days),
			days ? getUniqueVisitors(days) : Promise.resolve(0),
			getTopPages(10, days),
			getBrowserStats(days),
			getReferrerStats(10, days),
		]);

	return {
		totalViews,
		uniqueVisitors,
		topPages,
		browsers,
		referrers,
		period,
	};
}
