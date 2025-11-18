/**
 * Analytics Batch Processor
 *
 * Efficiently writes analytics events to the database in batches.
 * Uses a dual-trigger approach:
 * - Volume trigger: Flush when cache reaches 500 items
 * - Time trigger: Flush every 1 second
 *
 * This minimizes database writes while ensuring low latency for analytics data.
 */

import type { CacheInterface } from "@/shared/lib/cache/cache.interface.js";
import { insertAnalyticsEvents } from "@/db/queries/analytics-events.js";
import type { AnalyticsEventData } from "../types.js";

/**
 * Configuration options for batch processor
 */
export interface BatchProcessorOptions {
	/**
	 * Maximum number of events before triggering a flush
	 * Default: 500
	 */
	maxBatchSize?: number;

	/**
	 * Time interval in milliseconds between flushes
	 * Default: 1000 (1 second)
	 */
	flushInterval?: number;

	/**
	 * Cache key prefix for analytics events
	 * Default: "analytics:event:"
	 */
	cacheKeyPrefix?: string;
}

/**
 * Batch processor for analytics events
 *
 * Collects events in cache and periodically flushes them to the database.
 *
 * @example
 * ```typescript
 * const cache = new InMemoryCache()
 * const processor = new BatchProcessor(cache)
 *
 * // Start the processor
 * processor.start()
 *
 * // Add events
 * await processor.addEvent({
 *   anonymizedIp: "192.168.1.0",
 *   userAgent: "...",
 *   path: "/",
 *   referer: null,
 *   timestamp: new Date()
 * })
 *
 * // Stop when shutting down
 * await processor.stop()
 * ```
 */
export class BatchProcessor {
	private cache: CacheInterface<AnalyticsEventData>;
	private options: Required<BatchProcessorOptions>;
	private flushTimer: NodeJS.Timeout | null = null;
	private eventCount = 0;
	private isRunning = false;
	private isFlushing = false;

	constructor(
		cache: CacheInterface<AnalyticsEventData>,
		options: BatchProcessorOptions = {},
	) {
		this.cache = cache;
		this.options = {
			maxBatchSize: options.maxBatchSize ?? 500,
			flushInterval: options.flushInterval ?? 1000,
			cacheKeyPrefix: options.cacheKeyPrefix ?? "analytics:event:",
		};
	}

	/**
	 * Start the batch processor
	 *
	 * Begins the periodic flush timer
	 */
	start(): void {
		if (this.isRunning) {
			return;
		}

		this.isRunning = true;

		// Start the time-based flush timer
		this.flushTimer = setInterval(() => {
			this.flush().catch((error) => {
				console.error("Error flushing analytics events:", error);
			});
		}, this.options.flushInterval);

		// Prevent the timer from keeping the process alive
		this.flushTimer.unref();
	}

	/**
	 * Stop the batch processor
	 *
	 * Clears the flush timer and flushes any remaining events
	 */
	async stop(): Promise<void> {
		if (!this.isRunning) {
			return;
		}

		this.isRunning = false;

		// Clear the timer
		if (this.flushTimer) {
			clearInterval(this.flushTimer);
			this.flushTimer = null;
		}

		// Flush any remaining events
		await this.flush();
	}

	/**
	 * Add an analytics event to the batch
	 *
	 * @param event - The analytics event data
	 */
	async addEvent(event: AnalyticsEventData): Promise<void> {
		// Generate a unique key for this event
		const key = `${this.options.cacheKeyPrefix}${Date.now()}-${Math.random()}`;

		// Add to cache
		await this.cache.set(key, event);

		// Increment event count
		this.eventCount++;

		// Check if we've reached the max batch size (volume trigger)
		if (this.eventCount >= this.options.maxBatchSize) {
			// Flush in the background
			this.flush().catch((error) => {
				console.error("Error flushing analytics events:", error);
			});
		}
	}

	/**
	 * Flush all pending events to the database
	 *
	 * This method is safe to call concurrently - it will skip if already flushing
	 */
	async flush(): Promise<void> {
		// Prevent concurrent flushes
		if (this.isFlushing) {
			return;
		}

		this.isFlushing = true;

		try {
			// Get all analytics event keys from cache
			const allKeys = await this.cache.keys();
			const eventKeys = allKeys.filter((key) =>
				key.startsWith(this.options.cacheKeyPrefix),
			);

			if (eventKeys.length === 0) {
				this.eventCount = 0;
				return;
			}

			// Retrieve all events from cache
			const events: AnalyticsEventData[] = [];

			for (const key of eventKeys) {
				const event = await this.cache.get(key);
				if (event) {
					events.push(event);
				}
			}

			if (events.length === 0) {
				this.eventCount = 0;
				return;
			}

			// Insert events into database
			await insertAnalyticsEvents(events);

			// Remove events from cache
			for (const key of eventKeys) {
				await this.cache.delete(key);
			}

			// Reset event count
			this.eventCount = 0;
		} catch (error) {
			console.error("Error flushing analytics events to database:", error);
			// Don't clear the cache on error - events will be retried next flush
		} finally {
			this.isFlushing = false;
		}
	}

	/**
	 * Get the current number of pending events
	 *
	 * @returns Number of events waiting to be flushed
	 */
	getPendingCount(): number {
		return this.eventCount;
	}

	/**
	 * Check if the processor is currently running
	 *
	 * @returns True if running, false otherwise
	 */
	isActive(): boolean {
		return this.isRunning;
	}
}
