/**
 * Local Filesystem Storage Provider
 *
 * Implements the StorageProvider interface for local filesystem storage.
 * Files are stored in the `uploads/` directory relative to the project root.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import type {
	SaveResult,
	StorageFile,
	StorageProvider,
} from "./interface.js";

/**
 * Configuration options for local storage
 */
export interface LocalStorageConfig {
	/**
	 * Root directory for uploads
	 * Default: "uploads"
	 */
	uploadDir?: string;

	/**
	 * Base URL for serving files
	 * Default: "/uploads"
	 */
	baseUrl?: string;
}

/**
 * Local filesystem storage provider
 *
 * Stores files in the local filesystem with automatic directory creation.
 *
 * @example
 * const storage = new LocalStorage({
 *   uploadDir: "uploads",
 *   baseUrl: "/uploads"
 * })
 *
 * const result = await storage.save(file, "blog/images/photo.jpg")
 */
export class LocalStorage implements StorageProvider {
	private uploadDir: string;
	private baseUrl: string;
	private projectRoot: string;

	constructor(config: LocalStorageConfig = {}) {
		this.uploadDir = config.uploadDir ?? "uploads";
		this.baseUrl = config.baseUrl ?? "/uploads";

		// Get project root (assuming we're in src/shared/lib/storage)
		this.projectRoot = path.resolve(process.cwd());
	}

	/**
	 * Save a file to local storage
	 */
	async save(file: StorageFile, relativePath: string): Promise<SaveResult> {
		// Normalize the path to prevent directory traversal attacks
		const normalizedPath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
		const fullPath = path.join(this.projectRoot, this.uploadDir, normalizedPath);

		// Ensure the directory exists
		const dir = path.dirname(fullPath);
		await fs.mkdir(dir, { recursive: true });

		// Write the file
		await fs.writeFile(fullPath, file.buffer);

		// Return save result
		return {
			path: normalizedPath,
			url: this.getUrl(normalizedPath),
			size: file.size,
		};
	}

	/**
	 * Delete a file from local storage
	 */
	async delete(relativePath: string): Promise<void> {
		const normalizedPath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
		const fullPath = path.join(this.projectRoot, this.uploadDir, normalizedPath);

		try {
			await fs.unlink(fullPath);
		} catch (error) {
			// If file doesn't exist, consider it already deleted
			if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
				throw error;
			}
		}
	}

	/**
	 * Check if a file exists in local storage
	 */
	async exists(relativePath: string): Promise<boolean> {
		const normalizedPath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
		const fullPath = path.join(this.projectRoot, this.uploadDir, normalizedPath);

		try {
			await fs.access(fullPath);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get the public URL for a file
	 */
	getUrl(relativePath: string): string {
		// Ensure we use forward slashes for URLs
		const urlPath = relativePath.split(path.sep).join("/");
		return `${this.baseUrl}/${urlPath}`;
	}

	/**
	 * Get the absolute file path
	 */
	getAbsolutePath(relativePath: string): string {
		const normalizedPath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
		return path.join(this.projectRoot, this.uploadDir, normalizedPath);
	}
}
