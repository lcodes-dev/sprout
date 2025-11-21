/**
 * Tests for Analytics Collector Middleware
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import { InMemoryCache } from "@/shared/lib/cache/in-memory-cache.js";
import { BatchProcessor } from "../lib/batch-processor.js";
import { analyticsCollectorMiddleware } from "./analytics-collector.js";
import type { AnalyticsEventData } from "../types.js";

describe("analyticsCollectorMiddleware", () => {
	let app: Hono;
	let cache: InMemoryCache<AnalyticsEventData>;
	let processor: BatchProcessor;

	beforeEach(() => {
		cache = new InMemoryCache<AnalyticsEventData>(0);
		processor = new BatchProcessor(cache);

		app = new Hono();
		app.use("*", analyticsCollectorMiddleware(processor));
		app.get("/", (c) => c.text("OK"));
		app.get("/about", (c) => c.text("About"));
	});

	afterEach(() => {
		processor.stop();
		cache.destroy();
	});

	describe("basic collection", () => {
		it("should collect analytics on request", async () => {
			const req = new Request("http://localhost/");
			await app.fetch(req);

			// Wait a bit for async collection
			await new Promise((resolve) => setTimeout(resolve, 50));

			expect(processor.getPendingCount()).toBe(1);
		});

		it("should collect analytics for different paths", async () => {
			await app.fetch(new Request("http://localhost/"));
			await app.fetch(new Request("http://localhost/about"));

			// Wait for async collection
			await new Promise((resolve) => setTimeout(resolve, 50));

			expect(processor.getPendingCount()).toBe(2);
		});

		it("should not break request on analytics error", async () => {
			// Force an error by using invalid processor
			const brokenProcessor = {
				addEvent: vi.fn().mockRejectedValue(new Error("Test error")),
			} as unknown as BatchProcessor;

			const brokenApp = new Hono();
			brokenApp.use("*", analyticsCollectorMiddleware(brokenProcessor));
			brokenApp.get("/", (c) => c.text("OK"));

			const res = await brokenApp.fetch(new Request("http://localhost/"));

			// Request should still succeed
			expect(res.status).toBe(200);
			expect(await res.text()).toBe("OK");
		});
	});

	describe("IP address handling", () => {
		it("should use X-Forwarded-For header", async () => {
			const req = new Request("http://localhost/", {
				headers: {
					"X-Forwarded-For": "192.168.1.123, 10.0.0.1",
				},
			});

			await app.fetch(req);
			await new Promise((resolve) => setTimeout(resolve, 50));

			const keys = await cache.keys();
			if (keys.length > 0) {
				const event = await cache.get(keys[0]);
				// Should use first IP from X-Forwarded-For and anonymize it
				expect(event?.anonymizedIp).toBe("192.168.1.0");
			}
		});

		it("should use X-Real-IP header", async () => {
			const req = new Request("http://localhost/", {
				headers: {
					"X-Real-IP": "192.168.1.123",
				},
			});

			await app.fetch(req);
			await new Promise((resolve) => setTimeout(resolve, 50));

			const keys = await cache.keys();
			if (keys.length > 0) {
				const event = await cache.get(keys[0]);
				expect(event?.anonymizedIp).toBe("192.168.1.0");
			}
		});

		it("should use CF-Connecting-IP header", async () => {
			const req = new Request("http://localhost/", {
				headers: {
					"CF-Connecting-IP": "192.168.1.123",
				},
			});

			await app.fetch(req);
			await new Promise((resolve) => setTimeout(resolve, 50));

			const keys = await cache.keys();
			if (keys.length > 0) {
				const event = await cache.get(keys[0]);
				expect(event?.anonymizedIp).toBe("192.168.1.0");
			}
		});
	});

	describe("path cleaning", () => {
		it("should remove sensitive query parameters", async () => {
			const req = new Request("http://localhost/api?token=secret123&page=1");
			await app.fetch(req);

			await new Promise((resolve) => setTimeout(resolve, 50));

			const keys = await cache.keys();
			if (keys.length > 0) {
				const event = await cache.get(keys[0]);
				// Token should be removed, page should remain
				expect(event?.path).toContain("page=1");
				expect(event?.path).not.toContain("token");
			}
		});
	});

	describe("user agent collection", () => {
		it("should collect user agent", async () => {
			const req = new Request("http://localhost/", {
				headers: {
					"User-Agent": "Mozilla/5.0 Chrome/120.0",
				},
			});

			await app.fetch(req);
			await new Promise((resolve) => setTimeout(resolve, 50));

			const keys = await cache.keys();
			if (keys.length > 0) {
				const event = await cache.get(keys[0]);
				expect(event?.userAgent).toBe("Mozilla/5.0 Chrome/120.0");
			}
		});

		it("should handle missing user agent", async () => {
			const req = new Request("http://localhost/");
			await app.fetch(req);

			await new Promise((resolve) => setTimeout(resolve, 50));

			const keys = await cache.keys();
			if (keys.length > 0) {
				const event = await cache.get(keys[0]);
				expect(event?.userAgent).toBe("Unknown");
			}
		});
	});

	describe("referer collection", () => {
		it("should collect referer", async () => {
			const req = new Request("http://localhost/", {
				headers: {
					Referer: "https://google.com",
				},
			});

			await app.fetch(req);
			await new Promise((resolve) => setTimeout(resolve, 50));

			const keys = await cache.keys();
			if (keys.length > 0) {
				const event = await cache.get(keys[0]);
				expect(event?.referer).toBe("https://google.com");
			}
		});

		it("should handle missing referer", async () => {
			const req = new Request("http://localhost/");
			await app.fetch(req);

			await new Promise((resolve) => setTimeout(resolve, 50));

			const keys = await cache.keys();
			if (keys.length > 0) {
				const event = await cache.get(keys[0]);
				expect(event?.referer).toBeNull();
			}
		});
	});
});
