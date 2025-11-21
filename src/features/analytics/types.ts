/**
 * Analytics Types
 *
 * Type definitions for the analytics feature
 */

/**
 * Analytics event data collected from requests
 */
export interface AnalyticsEventData {
	anonymizedIp: string;
	userAgent: string;
	path: string;
	referer: string | null;
	timestamp: Date;
}

/**
 * Period options for analytics queries
 */
export type Period = "24h" | "7d" | "30d" | "all";

/**
 * Aggregated analytics statistics
 */
export interface AnalyticsStats {
	totalViews: number;
	uniqueVisitors: number;
	topPages: Array<{ path: string; views: number }>;
	browsers: Array<{ browser: string; views: number }>;
	referrers: Array<{ referrer: string; views: number }>;
	period: Period;
}

/**
 * Chart data format for frontend visualization
 */
export interface ChartData {
	labels: string[];
	datasets: Array<{
		label: string;
		data: number[];
		backgroundColor?: string | string[];
		borderColor?: string;
		borderWidth?: number;
	}>;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
	timestamp: string;
	views: number;
}
