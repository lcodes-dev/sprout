/**
 * Storage Factory
 *
 * Factory function to create the appropriate storage provider based on configuration.
 * Currently supports local filesystem storage with future support for S3, R2, etc.
 */

import { LocalStorage } from "./local-storage.js";
import type { StorageProvider } from "./interface.js";

/**
 * Storage provider types
 */
export type StorageType = "local" | "s3" | "r2";

/**
 * Storage configuration
 */
export interface StorageConfig {
	/**
	 * Type of storage provider to use
	 * Default: "local"
	 */
	type?: StorageType;

	/**
	 * Local storage configuration
	 */
	local?: {
		uploadDir?: string;
		baseUrl?: string;
	};

	/**
	 * S3 storage configuration (future)
	 */
	s3?: {
		bucket: string;
		region: string;
		accessKeyId: string;
		secretAccessKey: string;
	};

	/**
	 * Cloudflare R2 configuration (future)
	 */
	r2?: {
		accountId: string;
		accessKeyId: string;
		secretAccessKey: string;
		bucket: string;
	};
}

/**
 * Create a storage provider instance
 *
 * @param config - Storage configuration
 * @returns StorageProvider instance
 *
 * @example
 * // Use local storage (default)
 * const storage = createStorage()
 *
 * @example
 * // Use local storage with custom config
 * const storage = createStorage({
 *   type: "local",
 *   local: {
 *     uploadDir: "public/uploads",
 *     baseUrl: "/uploads"
 *   }
 * })
 *
 * @example
 * // Use S3 storage (future)
 * const storage = createStorage({
 *   type: "s3",
 *   s3: {
 *     bucket: "my-bucket",
 *     region: "us-east-1",
 *     accessKeyId: "...",
 *     secretAccessKey: "..."
 *   }
 * })
 */
export function createStorage(config: StorageConfig = {}): StorageProvider {
	const type = config.type ?? "local";

	switch (type) {
		case "local":
			return new LocalStorage(config.local);

		case "s3":
			// TODO: Implement S3 storage provider
			throw new Error("S3 storage provider not yet implemented");

		case "r2":
			// TODO: Implement R2 storage provider
			throw new Error("R2 storage provider not yet implemented");

		default:
			throw new Error(`Unknown storage type: ${type}`);
	}
}

/**
 * Default storage instance
 *
 * Uses local filesystem storage with default configuration.
 * Import this for convenience in most cases.
 *
 * @example
 * import { storage } from "./storage-factory.js"
 *
 * const result = await storage.save(file, "blog/images/photo.jpg")
 */
export const storage = createStorage();
