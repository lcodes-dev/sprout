/**
 * Storage Interface
 *
 * Generic storage interface that can be implemented by different storage providers
 * (local filesystem, S3, Google Cloud Storage, Azure Blob Storage, etc.)
 *
 * This abstraction allows the application to switch between storage implementations
 * without changing the code that uses storage.
 */

import type { Readable } from "node:stream";

/**
 * Options for write operations
 */
export interface WriteOptions {
	/**
	 * Content type (MIME type)
	 * Example: 'application/json', 'text/plain', 'image/png'
	 */
	contentType?: string;

	/**
	 * Additional metadata for the file
	 */
	metadata?: Record<string, string>;
}

/**
 * File metadata returned by storage operations
 */
export interface FileMetadata {
	/**
	 * File path/key
	 */
	path: string;

	/**
	 * File size in bytes
	 */
	size: number;

	/**
	 * Content type (MIME type)
	 */
	contentType?: string;

	/**
	 * Last modified timestamp
	 */
	lastModified?: Date;

	/**
	 * Additional metadata
	 */
	metadata?: Record<string, string>;
}

/**
 * Generic storage interface
 */
export interface StorageInterface {
	/**
	 * Write data to storage
	 *
	 * @param path - The file path/key
	 * @param data - The data to write (string, Buffer, or ReadableStream)
	 * @param options - Optional write options
	 * @returns Metadata of the written file
	 */
	write(
		path: string,
		data: string | Buffer | Readable,
		options?: WriteOptions,
	): Promise<FileMetadata>;

	/**
	 * Read data from storage
	 *
	 * @param path - The file path/key
	 * @returns The file contents as a Buffer
	 */
	read(path: string): Promise<Buffer>;

	/**
	 * Read data from storage as a stream
	 *
	 * @param path - The file path/key
	 * @returns A readable stream of the file contents
	 */
	readStream(path: string): Promise<Readable>;

	/**
	 * Check if a file exists
	 *
	 * @param path - The file path/key
	 * @returns True if the file exists, false otherwise
	 */
	exists(path: string): Promise<boolean>;

	/**
	 * Delete a file from storage
	 *
	 * @param path - The file path/key
	 * @returns True if the file existed and was deleted, false otherwise
	 */
	delete(path: string): Promise<boolean>;

	/**
	 * Get file metadata
	 *
	 * @param path - The file path/key
	 * @returns File metadata or undefined if not found
	 */
	metadata(path: string): Promise<FileMetadata | undefined>;

	/**
	 * List files in a directory/prefix
	 *
	 * @param prefix - The directory/prefix to list
	 * @returns Array of file paths
	 */
	list(prefix: string): Promise<string[]>;

	/**
	 * Copy a file
	 *
	 * @param sourcePath - The source file path
	 * @param destPath - The destination file path
	 * @returns Metadata of the copied file
	 */
	copy(sourcePath: string, destPath: string): Promise<FileMetadata>;

	/**
	 * Move/rename a file
	 *
	 * @param sourcePath - The source file path
	 * @param destPath - The destination file path
	 * @returns Metadata of the moved file
	 */
	move(sourcePath: string, destPath: string): Promise<FileMetadata>;
}
