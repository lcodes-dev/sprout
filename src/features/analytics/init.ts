/**
 * Analytics Initialization
 *
 * Initialize and export the analytics system components
 */

import { InMemoryCache } from "@/shared/lib/cache/in-memory-cache.js";
import { BatchProcessor } from "./lib/batch-processor.js";
import { analyticsCollectorMiddleware } from "./middleware/analytics-collector.js";
import type { AnalyticsEventData } from "./types.js";

/**
 * Analytics cache (in-memory)
 * For production with multiple instances, replace with Redis
 */
export const analyticsCache = new InMemoryCache<AnalyticsEventData>(60000); // 1 minute cleanup

/**
 * Analytics batch processor
 * Flushes events to database every 1 second or when 500 events are reached
 */
export const analyticsBatchProcessor = new BatchProcessor(analyticsCache);

/**
 * Analytics collection middleware
 * Apply this to routes you want to track
 */
export const analyticsMiddleware = analyticsCollectorMiddleware(
	analyticsBatchProcessor,
);

/**
 * Start the analytics system
 * Call this during app initialization
 */
export function startAnalytics(): void {
	analyticsBatchProcessor.start();
	console.log("✅ Analytics system started");
}

/**
 * Stop the analytics system
 * Call this during graceful shutdown
 */
export async function stopAnalytics(): Promise<void> {
	await analyticsBatchProcessor.stop();
	analyticsCache.destroy();
	console.log("✅ Analytics system stopped");
}
