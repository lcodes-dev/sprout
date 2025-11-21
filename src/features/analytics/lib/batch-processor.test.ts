/**
 * Tests for Batch Processor
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryCache } from "@/shared/lib/cache/in-memory-cache.js";
import { db } from "@/db/connection.js";
import { analyticsEvents } from "@/db/schema/analytics-events.js";
import { BatchProcessor } from "./batch-processor.js";
import type { AnalyticsEventData } from "../types.js";

// Mock the database insert function
vi.mock("@/db/queries/analytics-events.js", async () => {
	const actual = await vi.importActual("@/db/queries/analytics-events.js");
	return {
		...actual,
		insertAnalyticsEvents: vi.fn().mockResolvedValue([]),
	};
});

import { insertAnalyticsEvents } from "@/db/queries/analytics-events.js";

describe("BatchProcessor", () => {
	let cache: InMemoryCache<AnalyticsEventData>;
	let processor: BatchProcessor;

	beforeEach(async () => {
		// Clear analytics events table
		await db.delete(analyticsEvents);

		// Create fresh cache and processor
		cache = new InMemoryCache<AnalyticsEventData>(0);
		processor = new BatchProcessor(cache);

		// Clear mocks
		vi.clearAllMocks();
	});

	afterEach(async () => {
		await processor.stop();
		cache.destroy();
	});

	describe("basic operations", () => {
		it("should start and stop processor", () => {
			expect(processor.isActive()).toBe(false);

			processor.start();
			expect(processor.isActive()).toBe(true);

			processor.stop();
		});

		it("should not start twice", () => {
			processor.start();
			processor.start();

			expect(processor.isActive()).toBe(true);
		});

		it("should handle stop when not running", async () => {
			await expect(processor.stop()).resolves.not.toThrow();
		});
	});

	describe("event batching", () => {
		it("should add events to cache", async () => {
			const event: AnalyticsEventData = {
				anonymizedIp: "192.168.1.0",
				userAgent: "Mozilla/5.0",
				path: "/",
				referer: null,
				timestamp: new Date(),
			};

			await processor.addEvent(event);

			expect(processor.getPendingCount()).toBe(1);
		});

		it("should track multiple events", async () => {
			const events: AnalyticsEventData[] = [
				{
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: new Date(),
				},
				{
					anonymizedIp: "10.0.0.0",
					userAgent: "Mozilla/5.0",
					path: "/about",
					referer: null,
					timestamp: new Date(),
				},
			];

			for (const event of events) {
				await processor.addEvent(event);
			}

			expect(processor.getPendingCount()).toBe(2);
		});
	});

	describe("volume trigger", () => {
		it("should flush when batch size is reached", async () => {
			// Create processor with small batch size
			const smallBatchProcessor = new BatchProcessor(cache, {
				maxBatchSize: 3,
			});

			const events: AnalyticsEventData[] = [
				{
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0",
					path: "/page1",
					referer: null,
					timestamp: new Date(),
				},
				{
					anonymizedIp: "10.0.0.0",
					userAgent: "Mozilla/5.0",
					path: "/page2",
					referer: null,
					timestamp: new Date(),
				},
				{
					anonymizedIp: "172.16.0.0",
					userAgent: "Mozilla/5.0",
					path: "/page3",
					referer: null,
					timestamp: new Date(),
				},
			];

			// Add 3 events (should trigger flush)
			for (const event of events) {
				await smallBatchProcessor.addEvent(event);
			}

			// Wait a bit for async flush
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Should have flushed
			expect(insertAnalyticsEvents).toHaveBeenCalled();

			await smallBatchProcessor.stop();
		});
	});

	describe("time trigger", () => {
		it("should flush on timer interval", async () => {
			vi.useFakeTimers();

			// Create processor with short flush interval
			const timerProcessor = new BatchProcessor(cache, {
				flushInterval: 100,
			});

			timerProcessor.start();

			// Add an event
			await timerProcessor.addEvent({
				anonymizedIp: "192.168.1.0",
				userAgent: "Mozilla/5.0",
				path: "/",
				referer: null,
				timestamp: new Date(),
			});

			// Advance timer past flush interval
			vi.advanceTimersByTime(150);

			// Wait for async operations
			await vi.runAllTimersAsync();

			// Should have flushed
			expect(insertAnalyticsEvents).toHaveBeenCalled();

			await timerProcessor.stop();
			vi.useRealTimers();
		});
	});

	describe("flush behavior", () => {
		it("should flush events to database", async () => {
			const event: AnalyticsEventData = {
				anonymizedIp: "192.168.1.0",
				userAgent: "Mozilla/5.0",
				path: "/",
				referer: null,
				timestamp: new Date(),
			};

			await processor.addEvent(event);
			await processor.flush();

			expect(insertAnalyticsEvents).toHaveBeenCalledWith([event]);
		});

		it("should clear cache after flush", async () => {
			await processor.addEvent({
				anonymizedIp: "192.168.1.0",
				userAgent: "Mozilla/5.0",
				path: "/",
				referer: null,
				timestamp: new Date(),
			});

			expect(processor.getPendingCount()).toBe(1);

			await processor.flush();

			expect(processor.getPendingCount()).toBe(0);
		});

		it("should handle empty flush", async () => {
			await expect(processor.flush()).resolves.not.toThrow();
		});

		it("should prevent concurrent flushes", async () => {
			// Add multiple events
			for (let i = 0; i < 5; i++) {
				await processor.addEvent({
					anonymizedIp: "192.168.1.0",
					userAgent: "Mozilla/5.0",
					path: "/",
					referer: null,
					timestamp: new Date(),
				});
			}

			// Trigger multiple flushes concurrently
			const flushPromises = [
				processor.flush(),
				processor.flush(),
				processor.flush(),
			];

			await Promise.all(flushPromises);

			// Should only flush once
			expect(insertAnalyticsEvents).toHaveBeenCalledTimes(1);
		});
	});

	describe("error handling", () => {
		it("should handle database errors gracefully", async () => {
			// Mock database error
			vi.mocked(insertAnalyticsEvents).mockRejectedValueOnce(
				new Error("Database error"),
			);

			await processor.addEvent({
				anonymizedIp: "192.168.1.0",
				userAgent: "Mozilla/5.0",
				path: "/",
				referer: null,
				timestamp: new Date(),
			});

			// Should not throw
			await expect(processor.flush()).resolves.not.toThrow();

			// Events should still be in cache (not cleared on error)
			expect(processor.getPendingCount()).toBe(1);
		});
	});

	describe("configuration options", () => {
		it("should use custom batch size", () => {
			const customProcessor = new BatchProcessor(cache, {
				maxBatchSize: 100,
			});

			expect(customProcessor).toBeDefined();
		});

		it("should use custom flush interval", () => {
			const customProcessor = new BatchProcessor(cache, {
				flushInterval: 5000,
			});

			expect(customProcessor).toBeDefined();
		});

		it("should use custom cache key prefix", async () => {
			const customProcessor = new BatchProcessor(cache, {
				cacheKeyPrefix: "custom:analytics:",
			});

			await customProcessor.addEvent({
				anonymizedIp: "192.168.1.0",
				userAgent: "Mozilla/5.0",
				path: "/",
				referer: null,
				timestamp: new Date(),
			});

			const keys = await cache.keys();
			expect(keys.some((key) => key.startsWith("custom:analytics:"))).toBe(
				true,
			);

			await customProcessor.stop();
		});
	});
});
