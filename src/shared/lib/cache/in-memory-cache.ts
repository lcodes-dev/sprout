/**
 * In-Memory Cache Implementation
 *
 * Simple in-memory cache using a Map.
 * Suitable for single-instance applications.
 *
 * For multi-instance deployments, consider migrating to Redis.
 */

import type { CacheInterface, CacheOptions } from "./cache.interface.js";

/**
 * Cache entry with value and expiration
 */
interface CacheEntry<T> {
	value: T;
	expiresAt?: number;
}

/**
 * In-memory cache implementation
 *
 * Features:
 * - Fast O(1) lookups
 * - TTL support with automatic expiration
 * - Type-safe with generics
 *
 * Limitations:
 * - Not shared across multiple processes
 * - Data lost on restart
 * - Memory-bounded
 *
 * @template T - The type of values stored in the cache
 *
 * @example
 * ```typescript
 * const cache = new InMemoryCache<string>()
 * await cache.set('key', 'value', { ttl: 60000 }) // 60 second TTL
 * const value = await cache.get('key')
 * ```
 */
export class InMemoryCache<T = unknown> implements CacheInterface<T> {
	private cache: Map<string, CacheEntry<T>>;
	private cleanupInterval: NodeJS.Timeout | null;

	/**
	 * Create a new in-memory cache
	 *
	 * @param cleanupIntervalMs - Interval in milliseconds to clean up expired items (default: 60000 = 1 minute)
	 */
	constructor(cleanupIntervalMs = 60000) {
		this.cache = new Map();
		this.cleanupInterval = null;

		// Start cleanup interval if specified
		if (cleanupIntervalMs > 0) {
			this.cleanupInterval = setInterval(() => {
				this.cleanup();
			}, cleanupIntervalMs);

			// Prevent the interval from keeping the process alive
			this.cleanupInterval.unref();
		}
	}

	/**
	 * Get a value from the cache
	 */
	async get(key: string): Promise<T | undefined> {
		const entry = this.cache.get(key);

		if (!entry) {
			return undefined;
		}

		// Check if expired
		if (entry.expiresAt && Date.now() > entry.expiresAt) {
			this.cache.delete(key);
			return undefined;
		}

		return entry.value;
	}

	/**
	 * Set a value in the cache
	 */
	async set(key: string, value: T, options?: CacheOptions): Promise<void> {
		const entry: CacheEntry<T> = {
			value,
			expiresAt: options?.ttl ? Date.now() + options.ttl : undefined,
		};

		this.cache.set(key, entry);
	}

	/**
	 * Delete a value from the cache
	 */
	async delete(key: string): Promise<boolean> {
		return this.cache.delete(key);
	}

	/**
	 * Check if a key exists in the cache
	 */
	async has(key: string): Promise<boolean> {
		const entry = this.cache.get(key);

		if (!entry) {
			return false;
		}

		// Check if expired
		if (entry.expiresAt && Date.now() > entry.expiresAt) {
			this.cache.delete(key);
			return false;
		}

		return true;
	}

	/**
	 * Clear all items from the cache
	 */
	async clear(): Promise<void> {
		this.cache.clear();
	}

	/**
	 * Get all keys in the cache
	 */
	async keys(): Promise<string[]> {
		return Array.from(this.cache.keys());
	}

	/**
	 * Get the number of items in the cache
	 */
	async size(): Promise<number> {
		return this.cache.size;
	}

	/**
	 * Clean up expired entries
	 *
	 * @private
	 */
	private cleanup(): void {
		const now = Date.now();

		for (const [key, entry] of this.cache.entries()) {
			if (entry.expiresAt && now > entry.expiresAt) {
				this.cache.delete(key);
			}
		}
	}

	/**
	 * Destroy the cache and clear the cleanup interval
	 *
	 * Call this when shutting down the application to prevent memory leaks
	 */
	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
		}
		this.cache.clear();
	}
}
