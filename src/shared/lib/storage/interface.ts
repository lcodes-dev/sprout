/**
 * Storage Interface
 *
 * Defines an abstraction layer for file storage operations.
 * This interface allows the application to support multiple storage backends
 * (local filesystem, AWS S3, Cloudflare R2, etc.) with a consistent API.
 */

/**
 * Represents a file to be stored
 */
export interface StorageFile {
	/**
	 * File content as a Buffer
	 */
	buffer: Buffer;

	/**
	 * Original filename
	 */
	originalName: string;

	/**
	 * MIME type of the file
	 */
	mimeType: string;

	/**
	 * File size in bytes
	 */
	size: number;
}

/**
 * Result of a successful save operation
 */
export interface SaveResult {
	/**
	 * Full path where the file was saved
	 */
	path: string;

	/**
	 * Public URL to access the file
	 */
	url: string;

	/**
	 * File size in bytes
	 */
	size: number;
}

/**
 * Storage provider interface
 *
 * Implement this interface to create a new storage backend.
 */
export interface StorageProvider {
	/**
	 * Save a file to storage
	 *
	 * @param file - The file to save
	 * @param path - Desired path (relative to storage root)
	 * @returns Promise resolving to save result
	 *
	 * @example
	 * const result = await storage.save(file, "blog/images/2024/01/photo.jpg")
	 * console.log(result.url) // "/uploads/blog/images/2024/01/photo.jpg"
	 */
	save(file: StorageFile, path: string): Promise<SaveResult>;

	/**
	 * Delete a file from storage
	 *
	 * @param path - Path to the file to delete
	 * @returns Promise resolving when deletion is complete
	 *
	 * @example
	 * await storage.delete("blog/images/2024/01/photo.jpg")
	 */
	delete(path: string): Promise<void>;

	/**
	 * Check if a file exists in storage
	 *
	 * @param path - Path to check
	 * @returns Promise resolving to true if file exists, false otherwise
	 *
	 * @example
	 * const exists = await storage.exists("blog/images/2024/01/photo.jpg")
	 */
	exists(path: string): Promise<boolean>;

	/**
	 * Get the public URL for a file
	 *
	 * @param path - Path to the file
	 * @returns Public URL to access the file
	 *
	 * @example
	 * const url = storage.getUrl("blog/images/2024/01/photo.jpg")
	 * // Returns: "/uploads/blog/images/2024/01/photo.jpg"
	 */
	getUrl(path: string): string;

	/**
	 * Get the absolute file path (for local storage)
	 *
	 * @param path - Relative path to the file
	 * @returns Absolute file path
	 *
	 * @example
	 * const absPath = storage.getAbsolutePath("blog/images/2024/01/photo.jpg")
	 * // Returns: "/home/user/sprout/uploads/blog/images/2024/01/photo.jpg"
	 */
	getAbsolutePath(path: string): string;
}
