/**
 * Analytics Collection Middleware
 *
 * Hono middleware that collects analytics data from requests.
 * - Extracts IP, user agent, path, and referer
 * - Anonymizes IP addresses
 * - Cleans paths of sensitive parameters
 * - Sends data to batch processor (non-blocking)
 */

import type { Context, Next } from "hono";
import { anonymizeIp } from "../lib/ip-anonymizer.js";
import { cleanPath } from "../lib/path-cleaner.js";
import type { BatchProcessor } from "../lib/batch-processor.js";
import type { AnalyticsEventData } from "../types.js";

/**
 * Analytics collector middleware factory
 *
 * Creates middleware that collects analytics data from requests
 *
 * @param processor - The batch processor to send events to
 * @returns Hono middleware function
 *
 * @example
 * ```typescript
 * const cache = new InMemoryCache()
 * const processor = new BatchProcessor(cache)
 * processor.start()
 *
 * const analytics = analyticsCollectorMiddleware(processor)
 *
 * app.use('*', analytics)
 * ```
 */
export function analyticsCollectorMiddleware(processor: BatchProcessor) {
	return async (c: Context, next: Next) => {
		// Call next first to let the request proceed
		await next();

		// Collect analytics in the background (non-blocking)
		// Don't await - we don't want to slow down the response
		collectAnalytics(c, processor).catch((error) => {
			// Log error but don't throw - analytics shouldn't break the app
			console.error("Error collecting analytics:", error);
		});
	};
}

/**
 * Collect analytics data from a request
 *
 * @param c - Hono context
 * @param processor - Batch processor
 */
async function collectAnalytics(
	c: Context,
	processor: BatchProcessor,
): Promise<void> {
	try {
		// Extract raw data from request
		const rawIp = getClientIp(c);
		const userAgent = c.req.header("user-agent") || "Unknown";
		const rawPath = c.req.path + (c.req.url.includes("?") ? `?${new URL(c.req.url).search.substring(1)}` : "");
		const referer = c.req.header("referer") || c.req.header("referrer") || null;

		// Anonymize and clean data
		const anonymizedIp = anonymizeIp(rawIp);
		const cleanedPath = cleanPath(rawPath);

		// Create analytics event
		const event: AnalyticsEventData = {
			anonymizedIp,
			userAgent,
			path: cleanedPath,
			referer,
			timestamp: new Date(),
		};

		// Add to batch processor
		await processor.addEvent(event);
	} catch (error) {
		// Silently fail - analytics shouldn't break the app
		console.error("Error processing analytics event:", error);
	}
}

/**
 * Extract client IP address from request
 *
 * Checks various headers for the real client IP, falling back to connection IP
 *
 * @param c - Hono context
 * @returns Client IP address
 */
function getClientIp(c: Context): string {
	// Check common proxy headers
	const forwardedFor = c.req.header("x-forwarded-for");
	if (forwardedFor) {
		// X-Forwarded-For can contain multiple IPs, take the first one
		return forwardedFor.split(",")[0].trim();
	}

	const realIp = c.req.header("x-real-ip");
	if (realIp) {
		return realIp;
	}

	const cfConnectingIp = c.req.header("cf-connecting-ip");
	if (cfConnectingIp) {
		return cfConnectingIp;
	}

	// Fallback to connection IP (if available)
	// Note: In Hono, this might not be available depending on the runtime
	return "0.0.0.0";
}
