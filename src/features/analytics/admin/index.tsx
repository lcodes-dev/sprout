/**
 * Analytics Admin Router
 *
 * Routes for the analytics admin dashboard
 */

import { Hono } from "hono";
import { getStats } from "./actions/get-stats.js";
import {
	type ChartType,
	getChartData,
} from "./actions/get-chart-data.js";
import type { Period } from "../types.js";
import { AnalyticsPage } from "./views/AnalyticsPage.js";

const analyticsAdmin = new Hono();

/**
 * GET /admin/analytics
 * Main analytics dashboard page
 */
analyticsAdmin.get("/", async (c) => {
	const period = (c.req.query("period") as Period) || "7d";
	const stats = await getStats(period);

	return c.html(<AnalyticsPage stats={stats} period={period} />);
});

/**
 * GET /admin/analytics/api/stats
 * API endpoint for fetching stats (for AJAX updates)
 */
analyticsAdmin.get("/api/stats", async (c) => {
	const period = (c.req.query("period") as Period) || "7d";
	const stats = await getStats(period);

	return c.json(stats);
});

/**
 * GET /admin/analytics/api/chart-data
 * API endpoint for fetching chart data
 */
analyticsAdmin.get("/api/chart-data", async (c) => {
	const chartType = (c.req.query("type") as ChartType) || "timeseries";
	const period = (c.req.query("period") as Period) || "7d";

	const chartData = await getChartData(chartType, period);

	return c.json(chartData);
});

export default analyticsAdmin;
