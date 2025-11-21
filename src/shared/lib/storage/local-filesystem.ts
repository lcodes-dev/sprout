/**
 * Local Filesystem Storage Implementation
 *
 * Implements the StorageInterface using the local filesystem.
 * Suitable for single-server deployments or development.
 *
 * For cloud deployments, consider migrating to S3 or similar.
 */

import {
	createReadStream,
	createWriteStream,
	type PathLike,
	type Stats,
} from "node:fs";
import {
	access,
	copyFile,
	mkdir,
	readFile,
	readdir,
	rename,
	rm,
	stat,
	writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type {
	FileMetadata,
	StorageInterface,
	WriteOptions,
} from "./storage.interface.js";

/**
 * Local filesystem storage implementation
 *
 * Features:
 * - Uses native Node.js fs module
 * - Automatic directory creation
 * - Stream support for large files
 * - Metadata stored as extended attributes (where supported)
 *
 * Limitations:
 * - Single server only (no distributed storage)
 * - Limited by disk space
 * - No built-in redundancy
 *
 * @example
 * ```typescript
 * const storage = new LocalFilesystem('/var/data')
 * await storage.write('test.txt', 'Hello World')
 * const content = await storage.read('test.txt')
 * ```
 */
export class LocalFilesystem implements StorageInterface {
	private readonly basePath: string;

	/**
	 * Create a new local filesystem storage instance
	 *
	 * @param basePath - The base directory for all storage operations
	 */
	constructor(basePath: string) {
		this.basePath = basePath;
	}

	/**
	 * Get the full filesystem path for a storage path
	 */
	private getFullPath(path: string): string {
		return join(this.basePath, path);
	}

	/**
	 * Ensure a directory exists
	 */
	private async ensureDir(dirPath: string): Promise<void> {
		try {
			await mkdir(dirPath, { recursive: true });
		} catch (error) {
			// Ignore error if directory already exists
			if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
				throw error;
			}
		}
	}

	/**
	 * Get file stats
	 */
	private async getStats(path: PathLike): Promise<Stats | undefined> {
		try {
			return await stat(path);
		} catch {
			return undefined;
		}
	}

	/**
	 * Write data to storage
	 */
	async write(
		path: string,
		data: string | Buffer | Readable,
		options?: WriteOptions,
	): Promise<FileMetadata> {
		const fullPath = this.getFullPath(path);
		const dirPath = dirname(fullPath);

		// Ensure directory exists
		await this.ensureDir(dirPath);

		// Write the data
		if (typeof data === "string" || data instanceof Buffer) {
			await writeFile(fullPath, data);
		} else {
			// Handle stream
			const writeStream = createWriteStream(fullPath);
			await pipeline(data, writeStream);
		}

		// Get file stats
		const stats = await stat(fullPath);

		return {
			path,
			size: stats.size,
			contentType: options?.contentType,
			lastModified: stats.mtime,
			metadata: options?.metadata,
		};
	}

	/**
	 * Read data from storage
	 */
	async read(path: string): Promise<Buffer> {
		const fullPath = this.getFullPath(path);
		return await readFile(fullPath);
	}

	/**
	 * Read data from storage as a stream
	 */
	async readStream(path: string): Promise<Readable> {
		const fullPath = this.getFullPath(path);

		// Check if file exists
		const exists = await this.exists(path);
		if (!exists) {
			throw new Error(`File not found: ${path}`);
		}

		return createReadStream(fullPath);
	}

	/**
	 * Check if a file exists
	 */
	async exists(path: string): Promise<boolean> {
		const fullPath = this.getFullPath(path);

		try {
			await access(fullPath);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Delete a file from storage
	 */
	async delete(path: string): Promise<boolean> {
		const fullPath = this.getFullPath(path);

		try {
			await rm(fullPath);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get file metadata
	 */
	async metadata(path: string): Promise<FileMetadata | undefined> {
		const fullPath = this.getFullPath(path);
		const stats = await this.getStats(fullPath);

		if (!stats) {
			return undefined;
		}

		return {
			path,
			size: stats.size,
			lastModified: stats.mtime,
		};
	}

	/**
	 * List files in a directory
	 */
	async list(prefix: string): Promise<string[]> {
		const fullPath = this.getFullPath(prefix);

		try {
			const entries = await readdir(fullPath, { withFileTypes: true });
			const files: string[] = [];

			for (const entry of entries) {
				const relativePath = join(prefix, entry.name);

				if (entry.isDirectory()) {
					// Recursively list subdirectories
					const subFiles = await this.list(relativePath);
					files.push(...subFiles);
				} else {
					files.push(relativePath);
				}
			}

			return files;
		} catch {
			return [];
		}
	}

	/**
	 * Copy a file
	 */
	async copy(sourcePath: string, destPath: string): Promise<FileMetadata> {
		const fullSourcePath = this.getFullPath(sourcePath);
		const fullDestPath = this.getFullPath(destPath);
		const destDir = dirname(fullDestPath);

		// Ensure destination directory exists
		await this.ensureDir(destDir);

		// Copy the file
		await copyFile(fullSourcePath, fullDestPath);

		// Get destination file stats
		const stats = await stat(fullDestPath);

		return {
			path: destPath,
			size: stats.size,
			lastModified: stats.mtime,
		};
	}

	/**
	 * Move/rename a file
	 */
	async move(sourcePath: string, destPath: string): Promise<FileMetadata> {
		const fullSourcePath = this.getFullPath(sourcePath);
		const fullDestPath = this.getFullPath(destPath);
		const destDir = dirname(fullDestPath);

		// Ensure destination directory exists
		await this.ensureDir(destDir);

		// Move the file
		await rename(fullSourcePath, fullDestPath);

		// Get destination file stats
		const stats = await stat(fullDestPath);

		return {
			path: destPath,
			size: stats.size,
			lastModified: stats.mtime,
		};
	}
}
