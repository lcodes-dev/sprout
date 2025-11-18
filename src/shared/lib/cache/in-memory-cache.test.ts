/**
 * Tests for InMemoryCache
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryCache } from "./in-memory-cache.js";

describe("InMemoryCache", () => {
	let cache: InMemoryCache<string>;

	beforeEach(() => {
		// Create cache without auto-cleanup for deterministic tests
		cache = new InMemoryCache<string>(0);
	});

	afterEach(() => {
		cache.destroy();
	});

	describe("basic operations", () => {
		it("should set and get a value", async () => {
			await cache.set("key1", "value1");
			const value = await cache.get("key1");

			expect(value).toBe("value1");
		});

		it("should return undefined for non-existent key", async () => {
			const value = await cache.get("nonexistent");

			expect(value).toBeUndefined();
		});

		it("should delete a value", async () => {
			await cache.set("key1", "value1");
			const deleted = await cache.delete("key1");
			const value = await cache.get("key1");

			expect(deleted).toBe(true);
			expect(value).toBeUndefined();
		});

		it("should return false when deleting non-existent key", async () => {
			const deleted = await cache.delete("nonexistent");

			expect(deleted).toBe(false);
		});

		it("should check if key exists", async () => {
			await cache.set("key1", "value1");

			expect(await cache.has("key1")).toBe(true);
			expect(await cache.has("nonexistent")).toBe(false);
		});

		it("should clear all items", async () => {
			await cache.set("key1", "value1");
			await cache.set("key2", "value2");
			await cache.clear();

			expect(await cache.size()).toBe(0);
			expect(await cache.get("key1")).toBeUndefined();
		});

		it("should get all keys", async () => {
			await cache.set("key1", "value1");
			await cache.set("key2", "value2");
			await cache.set("key3", "value3");

			const keys = await cache.keys();

			expect(keys).toHaveLength(3);
			expect(keys).toContain("key1");
			expect(keys).toContain("key2");
			expect(keys).toContain("key3");
		});

		it("should get cache size", async () => {
			expect(await cache.size()).toBe(0);

			await cache.set("key1", "value1");
			expect(await cache.size()).toBe(1);

			await cache.set("key2", "value2");
			expect(await cache.size()).toBe(2);

			await cache.delete("key1");
			expect(await cache.size()).toBe(1);
		});
	});

	describe("TTL support", () => {
		it("should expire item after TTL", async () => {
			vi.useFakeTimers();

			await cache.set("key1", "value1", { ttl: 1000 }); // 1 second TTL

			// Value should exist immediately
			expect(await cache.get("key1")).toBe("value1");

			// Fast-forward 500ms (not expired yet)
			vi.advanceTimersByTime(500);
			expect(await cache.get("key1")).toBe("value1");

			// Fast-forward another 600ms (total 1100ms, should be expired)
			vi.advanceTimersByTime(600);
			expect(await cache.get("key1")).toBeUndefined();

			vi.useRealTimers();
		});

		it("should handle has() with expired items", async () => {
			vi.useFakeTimers();

			await cache.set("key1", "value1", { ttl: 1000 });

			expect(await cache.has("key1")).toBe(true);

			vi.advanceTimersByTime(1100);

			expect(await cache.has("key1")).toBe(false);

			vi.useRealTimers();
		});

		it("should not expire item without TTL", async () => {
			vi.useFakeTimers();

			await cache.set("key1", "value1"); // No TTL

			vi.advanceTimersByTime(10000); // 10 seconds

			expect(await cache.get("key1")).toBe("value1");

			vi.useRealTimers();
		});
	});

	describe("type safety", () => {
		it("should work with different types", async () => {
			const numberCache = new InMemoryCache<number>(0);
			await numberCache.set("num", 42);
			expect(await numberCache.get("num")).toBe(42);
			numberCache.destroy();

			const objectCache = new InMemoryCache<{ name: string }>(0);
			await objectCache.set("obj", { name: "test" });
			expect(await objectCache.get("obj")).toEqual({ name: "test" });
			objectCache.destroy();

			const arrayCache = new InMemoryCache<string[]>(0);
			await arrayCache.set("arr", ["a", "b", "c"]);
			expect(await arrayCache.get("arr")).toEqual(["a", "b", "c"]);
			arrayCache.destroy();
		});
	});

	describe("cleanup", () => {
		it("should automatically clean up expired items", async () => {
			vi.useFakeTimers();

			// Create cache with 100ms cleanup interval
			const autoCache = new InMemoryCache<string>(100);

			await autoCache.set("key1", "value1", { ttl: 50 });
			await autoCache.set("key2", "value2", { ttl: 150 });

			expect(await autoCache.size()).toBe(2);

			// Advance time to trigger cleanup
			vi.advanceTimersByTime(110);

			// key1 should be cleaned up, key2 should still exist
			expect(await autoCache.size()).toBe(1);
			expect(await autoCache.has("key1")).toBe(false);
			expect(await autoCache.has("key2")).toBe(true);

			autoCache.destroy();
			vi.useRealTimers();
		});
	});

	describe("destroy", () => {
		it("should clear cache and stop cleanup interval", async () => {
			await cache.set("key1", "value1");
			expect(await cache.size()).toBe(1);

			cache.destroy();

			expect(await cache.size()).toBe(0);
		});
	});
});
