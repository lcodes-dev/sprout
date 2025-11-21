/**
 * Get Chart Data Action
 *
 * Fetches data formatted for Chart.js charts
 */

import {
	getBrowserStats,
	getReferrerStats,
	getTimeSeriesData,
	getTopPages,
} from "@/db/queries/analytics-events.js";
import type { ChartData, Period } from "../../types.js";

/**
 * Chart type options
 */
export type ChartType = "timeseries" | "topPages" | "browsers" | "referrers";

/**
 * Parse period string to number of days
 */
function parsePeriod(period: Period): number {
	switch (period) {
		case "24h":
			return 1;
		case "7d":
			return 7;
		case "30d":
			return 30;
		case "all":
			return 365; // Show last year for "all"
		default:
			return 7;
	}
}

/**
 * Get chart data for a specific chart type
 *
 * @param chartType - Type of chart
 * @param period - Time period
 * @returns Chart data formatted for Chart.js
 */
export async function getChartData(
	chartType: ChartType,
	period: Period = "7d",
): Promise<ChartData> {
	const days = parsePeriod(period);

	switch (chartType) {
		case "timeseries":
			return await getTimeSeriesChartData(days, period);
		case "topPages":
			return await getTopPagesChartData(days);
		case "browsers":
			return await getBrowsersChartData(days);
		case "referrers":
			return await getReferrersChartData(days);
		default:
			throw new Error(`Unknown chart type: ${chartType}`);
	}
}

/**
 * Get time series chart data
 */
async function getTimeSeriesChartData(
	days: number,
	period: Period,
): Promise<ChartData> {
	const groupBy = period === "24h" ? "hour" : "day";
	const data = await getTimeSeriesData(days, groupBy);

	return {
		labels: data.map((d) => d.timestamp),
		datasets: [
			{
				label: "Page Views",
				data: data.map((d) => d.views),
				borderColor: "rgb(59, 130, 246)",
				backgroundColor: "rgba(59, 130, 246, 0.1)",
				borderWidth: 2,
			},
		],
	};
}

/**
 * Get top pages chart data
 */
async function getTopPagesChartData(days: number): Promise<ChartData> {
	const data = await getTopPages(10, days);

	return {
		labels: data.map((d) => d.path),
		datasets: [
			{
				label: "Views",
				data: data.map((d) => d.views),
				backgroundColor: "rgba(59, 130, 246, 0.8)",
			},
		],
	};
}

/**
 * Get browsers chart data
 */
async function getBrowsersChartData(days: number): Promise<ChartData> {
	const data = await getBrowserStats(days);

	const colors = [
		"rgba(59, 130, 246, 0.8)", // Blue
		"rgba(16, 185, 129, 0.8)", // Green
		"rgba(245, 158, 11, 0.8)", // Yellow
		"rgba(239, 68, 68, 0.8)", // Red
		"rgba(139, 92, 246, 0.8)", // Purple
	];

	return {
		labels: data.map((d) => d.browser),
		datasets: [
			{
				label: "Browser Usage",
				data: data.map((d) => d.views),
				backgroundColor: colors.slice(0, data.length),
			},
		],
	};
}

/**
 * Get referrers chart data
 */
async function getReferrersChartData(days: number): Promise<ChartData> {
	const data = await getReferrerStats(10, days);

	return {
		labels: data.map((d) => d.referrer),
		datasets: [
			{
				label: "Traffic Sources",
				data: data.map((d) => d.views),
				backgroundColor: "rgba(16, 185, 129, 0.8)",
			},
		],
	};
}
