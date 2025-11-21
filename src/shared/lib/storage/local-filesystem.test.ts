/**
 * Tests for LocalFilesystem
 */

import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalFilesystem } from "./local-filesystem.js";

describe("LocalFilesystem", () => {
	let storage: LocalFilesystem;
	let testDir: string;

	beforeEach(async () => {
		// Create a temporary directory for tests
		testDir = join(tmpdir(), `storage-test-${Date.now()}`);
		await mkdir(testDir, { recursive: true });
		storage = new LocalFilesystem(testDir);
	});

	afterEach(async () => {
		// Clean up test directory
		await rm(testDir, { recursive: true, force: true });
	});

	describe("write and read", () => {
		it("should write and read a string", async () => {
			const path = "test.txt";
			const content = "Hello World";

			await storage.write(path, content);
			const result = await storage.read(path);

			expect(result.toString()).toBe(content);
		});

		it("should write and read a buffer", async () => {
			const path = "test.bin";
			const content = Buffer.from([0x01, 0x02, 0x03, 0x04]);

			await storage.write(path, content);
			const result = await storage.read(path);

			expect(result).toEqual(content);
		});

		it("should write and read a stream", async () => {
			const path = "test-stream.txt";
			const content = "Stream content";
			const stream = Readable.from([content]);

			await storage.write(path, stream);
			const result = await storage.read(path);

			expect(result.toString()).toBe(content);
		});

		it("should create nested directories automatically", async () => {
			const path = "nested/deep/path/file.txt";
			const content = "Nested file";

			await storage.write(path, content);
			const result = await storage.read(path);

			expect(result.toString()).toBe(content);
		});

		it("should include metadata in write result", async () => {
			const path = "test.txt";
			const content = "Test";
			const options = {
				contentType: "text/plain",
				metadata: { author: "test" },
			};

			const meta = await storage.write(path, content, options);

			expect(meta.path).toBe(path);
			expect(meta.size).toBe(Buffer.byteLength(content));
			expect(meta.contentType).toBe(options.contentType);
			expect(meta.metadata).toEqual(options.metadata);
			expect(meta.lastModified).toBeInstanceOf(Date);
		});
	});

	describe("readStream", () => {
		it("should read file as stream", async () => {
			const path = "stream.txt";
			const content = "Stream test";

			await storage.write(path, content);
			const stream = await storage.readStream(path);

			// Collect stream data
			const chunks: Buffer[] = [];
			for await (const chunk of stream) {
				chunks.push(chunk as Buffer);
			}

			const result = Buffer.concat(chunks).toString();
			expect(result).toBe(content);
		});

		it("should throw error for non-existent file", async () => {
			await expect(storage.readStream("nonexistent.txt")).rejects.toThrow(
				"File not found",
			);
		});
	});

	describe("exists", () => {
		it("should return true for existing file", async () => {
			const path = "exists.txt";
			await storage.write(path, "content");

			expect(await storage.exists(path)).toBe(true);
		});

		it("should return false for non-existent file", async () => {
			expect(await storage.exists("nonexistent.txt")).toBe(false);
		});
	});

	describe("delete", () => {
		it("should delete existing file", async () => {
			const path = "delete.txt";
			await storage.write(path, "content");

			const deleted = await storage.delete(path);

			expect(deleted).toBe(true);
			expect(await storage.exists(path)).toBe(false);
		});

		it("should return false for non-existent file", async () => {
			const deleted = await storage.delete("nonexistent.txt");

			expect(deleted).toBe(false);
		});
	});

	describe("metadata", () => {
		it("should return metadata for existing file", async () => {
			const path = "meta.txt";
			const content = "Metadata test";

			await storage.write(path, content);
			const meta = await storage.metadata(path);

			expect(meta).toBeDefined();
			expect(meta?.path).toBe(path);
			expect(meta?.size).toBe(Buffer.byteLength(content));
			expect(meta?.lastModified).toBeInstanceOf(Date);
		});

		it("should return undefined for non-existent file", async () => {
			const meta = await storage.metadata("nonexistent.txt");

			expect(meta).toBeUndefined();
		});
	});

	describe("list", () => {
		it("should list files in directory", async () => {
			await storage.write("dir/file1.txt", "content1");
			await storage.write("dir/file2.txt", "content2");
			await storage.write("dir/file3.txt", "content3");

			const files = await storage.list("dir");

			expect(files).toHaveLength(3);
			expect(files).toContain("dir/file1.txt");
			expect(files).toContain("dir/file2.txt");
			expect(files).toContain("dir/file3.txt");
		});

		it("should list files recursively", async () => {
			await storage.write("dir/file1.txt", "content1");
			await storage.write("dir/sub/file2.txt", "content2");
			await storage.write("dir/sub/deep/file3.txt", "content3");

			const files = await storage.list("dir");

			expect(files).toHaveLength(3);
			expect(files).toContain("dir/file1.txt");
			expect(files).toContain("dir/sub/file2.txt");
			expect(files).toContain("dir/sub/deep/file3.txt");
		});

		it("should return empty array for non-existent directory", async () => {
			const files = await storage.list("nonexistent");

			expect(files).toEqual([]);
		});
	});

	describe("copy", () => {
		it("should copy file", async () => {
			const source = "source.txt";
			const dest = "dest.txt";
			const content = "Copy test";

			await storage.write(source, content);
			const meta = await storage.copy(source, dest);

			expect(meta.path).toBe(dest);
			expect(await storage.exists(source)).toBe(true);
			expect(await storage.exists(dest)).toBe(true);

			const destContent = await storage.read(dest);
			expect(destContent.toString()).toBe(content);
		});

		it("should copy to nested directory", async () => {
			const source = "source.txt";
			const dest = "nested/dir/dest.txt";
			const content = "Copy test";

			await storage.write(source, content);
			await storage.copy(source, dest);

			expect(await storage.exists(dest)).toBe(true);
		});
	});

	describe("move", () => {
		it("should move file", async () => {
			const source = "source.txt";
			const dest = "dest.txt";
			const content = "Move test";

			await storage.write(source, content);
			const meta = await storage.move(source, dest);

			expect(meta.path).toBe(dest);
			expect(await storage.exists(source)).toBe(false);
			expect(await storage.exists(dest)).toBe(true);

			const destContent = await storage.read(dest);
			expect(destContent.toString()).toBe(content);
		});

		it("should move to nested directory", async () => {
			const source = "source.txt";
			const dest = "nested/dir/dest.txt";
			const content = "Move test";

			await storage.write(source, content);
			await storage.move(source, dest);

			expect(await storage.exists(source)).toBe(false);
			expect(await storage.exists(dest)).toBe(true);
		});
	});
});
