/**
 * Cache Interface
 *
 * Generic cache interface that can be implemented by different cache providers
 * (in-memory, Redis, Memcached, etc.)
 *
 * This abstraction allows the application to switch between cache implementations
 * without changing the code that uses the cache.
 */

/**
 * Options for cache operations
 */
export interface CacheOptions {
	/**
	 * Time-to-live in milliseconds
	 * If not specified, the item never expires
	 */
	ttl?: number;
}

/**
 * Generic cache interface
 *
 * @template T - The type of values stored in the cache
 */
export interface CacheInterface<T = unknown> {
	/**
	 * Get a value from the cache
	 *
	 * @param key - The cache key
	 * @returns The cached value or undefined if not found or expired
	 */
	get(key: string): Promise<T | undefined>;

	/**
	 * Set a value in the cache
	 *
	 * @param key - The cache key
	 * @param value - The value to cache
	 * @param options - Optional cache options (TTL, etc.)
	 */
	set(key: string, value: T, options?: CacheOptions): Promise<void>;

	/**
	 * Delete a value from the cache
	 *
	 * @param key - The cache key
	 * @returns True if the key existed and was deleted, false otherwise
	 */
	delete(key: string): Promise<boolean>;

	/**
	 * Check if a key exists in the cache
	 *
	 * @param key - The cache key
	 * @returns True if the key exists, false otherwise
	 */
	has(key: string): Promise<boolean>;

	/**
	 * Clear all items from the cache
	 */
	clear(): Promise<void>;

	/**
	 * Get all keys in the cache
	 *
	 * @returns Array of all cache keys
	 */
	keys(): Promise<string[]>;

	/**
	 * Get the number of items in the cache
	 *
	 * @returns The number of cached items
	 */
	size(): Promise<number>;
}
