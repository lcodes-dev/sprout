/**
 * Local Storage Tests
 *
 * Tests for local filesystem storage provider
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { LocalStorage } from "./local-storage.js";
import type { StorageFile } from "./interface.js";

describe("LocalStorage", () => {
	let storage: LocalStorage;
	const testDir = "test-uploads";

	beforeEach(() => {
		storage = new LocalStorage({
			uploadDir: testDir,
			baseUrl: "/test-uploads",
		});
	});

	afterEach(async () => {
		// Clean up test directory
		try {
			await fs.rm(testDir, { recursive: true, force: true });
		} catch (error) {
			// Ignore errors if directory doesn't exist
		}
	});

	describe("save", () => {
		it("should save a file to storage", async () => {
			const file: StorageFile = {
				buffer: Buffer.from("test content"),
				originalName: "test.txt",
				mimeType: "text/plain",
				size: 12,
			};

			const result = await storage.save(file, "blog/test.txt");

			expect(result.path).toBe("blog/test.txt");
			expect(result.url).toBe("/test-uploads/blog/test.txt");
			expect(result.size).toBe(12);

			// Verify file exists
			const exists = await storage.exists("blog/test.txt");
			expect(exists).toBe(true);

			// Verify file content
			const content = await fs.readFile(
				storage.getAbsolutePath("blog/test.txt"),
				"utf-8",
			);
			expect(content).toBe("test content");
		});

		it("should create directories automatically", async () => {
			const file: StorageFile = {
				buffer: Buffer.from("test"),
				originalName: "photo.jpg",
				mimeType: "image/jpeg",
				size: 4,
			};

			const result = await storage.save(file, "blog/images/2024/01/photo.jpg");

			expect(result.path).toBe("blog/images/2024/01/photo.jpg");
			const exists = await storage.exists("blog/images/2024/01/photo.jpg");
			expect(exists).toBe(true);
		});

		it("should normalize path to prevent directory traversal", async () => {
			const file: StorageFile = {
				buffer: Buffer.from("test"),
				originalName: "test.txt",
				mimeType: "text/plain",
				size: 4,
			};

			const result = await storage.save(file, "../../../etc/passwd");

			// Path should be normalized and safe
			expect(result.path).not.toContain("..");
		});
	});

	describe("delete", () => {
		it("should delete a file from storage", async () => {
			const file: StorageFile = {
				buffer: Buffer.from("test"),
				originalName: "test.txt",
				mimeType: "text/plain",
				size: 4,
			};

			await storage.save(file, "blog/test.txt");
			await storage.delete("blog/test.txt");

			const exists = await storage.exists("blog/test.txt");
			expect(exists).toBe(false);
		});

		it("should not throw error when deleting non-existent file", async () => {
			await expect(
				storage.delete("non-existent.txt"),
			).resolves.toBeUndefined();
		});
	});

	describe("exists", () => {
		it("should return true for existing file", async () => {
			const file: StorageFile = {
				buffer: Buffer.from("test"),
				originalName: "test.txt",
				mimeType: "text/plain",
				size: 4,
			};

			await storage.save(file, "blog/test.txt");
			const exists = await storage.exists("blog/test.txt");

			expect(exists).toBe(true);
		});

		it("should return false for non-existent file", async () => {
			const exists = await storage.exists("non-existent.txt");
			expect(exists).toBe(false);
		});
	});

	describe("getUrl", () => {
		it("should return correct URL for file", () => {
			const url = storage.getUrl("blog/images/photo.jpg");
			expect(url).toBe("/test-uploads/blog/images/photo.jpg");
		});

		it("should handle Windows path separators", () => {
			const url = storage.getUrl("blog\\images\\photo.jpg");
			expect(url).toContain("/");
			expect(url).not.toContain("\\");
		});
	});

	describe("getAbsolutePath", () => {
		it("should return absolute path for file", () => {
			const absPath = storage.getAbsolutePath("blog/test.txt");
			expect(path.isAbsolute(absPath)).toBe(true);
			expect(absPath).toContain(testDir);
			expect(absPath).toContain("blog");
		});

		it("should normalize path", () => {
			const absPath = storage.getAbsolutePath("../../../etc/passwd");
			expect(absPath).not.toContain("..");
		});
	});
});
