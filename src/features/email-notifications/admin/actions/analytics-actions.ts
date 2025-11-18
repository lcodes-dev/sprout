/**
 * Analytics Actions
 *
 * Handler functions for analytics API routes.
 */

import type { Context } from "hono";
import {
	getEmailStats,
	getEmailVolumeOverTime,
	getEngagementMetrics,
	getRecentActivity,
} from "@/db/queries/email-analytics.js";

/**
 * Get email analytics data
 */
export async function getAnalytics(c: Context) {
	try {
		const query = c.req.query();
		const days = query.days ? Number(query.days) : 30;

		// Get date range
		const endDate = new Date();
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		// Fetch all analytics data
		const [stats, volumeData, engagement, recentActivity] = await Promise.all([
			getEmailStats(startDate, endDate),
			getEmailVolumeOverTime(days),
			getEngagementMetrics(startDate, endDate),
			getRecentActivity(10),
		]);

		return c.json({
			stats,
			volumeData,
			engagement,
			recentActivity,
		});
	} catch (error) {
		console.error("Error fetching analytics:", error);
		return c.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch analytics",
			},
			500,
		);
	}
}
