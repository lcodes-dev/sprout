/**
 * Blog Utilities Tests
 *
 * Tests for shared blog utility functions
 */

import { describe, expect, it } from "vitest";
import {
	formatDate,
	formatFileSize,
	generateExcerpt,
	generateSlug,
	generateUniqueFilename,
	getFileExtension,
	isValidSlug,
	stripHtml,
	truncateText,
	validateFileType,
} from "./utils.js";

describe("Blog Utilities", () => {
	describe("generateSlug", () => {
		it("should convert text to lowercase slug", () => {
			expect(generateSlug("My First Blog Post")).toBe("my-first-blog-post");
		});

		it("should replace spaces with hyphens", () => {
			expect(generateSlug("Hello World")).toBe("hello-world");
		});

		it("should remove special characters", () => {
			expect(generateSlug("Special Chars: #@$%")).toBe("special-chars");
		});

		it("should handle multiple consecutive spaces", () => {
			expect(generateSlug("Too   Many    Spaces")).toBe("too-many-spaces");
		});

		it("should remove leading and trailing hyphens", () => {
			expect(generateSlug("  -  Test  -  ")).toBe("test");
		});

		it("should handle empty string", () => {
			expect(generateSlug("")).toBe("");
		});
	});

	describe("validateFileType", () => {
		it("should validate image types", () => {
			expect(validateFileType("image/jpeg", "image")).toBe(true);
			expect(validateFileType("image/png", "image")).toBe(true);
			expect(validateFileType("image/gif", "image")).toBe(true);
			expect(validateFileType("image/webp", "image")).toBe(true);
		});

		it("should reject invalid image types", () => {
			expect(validateFileType("text/html", "image")).toBe(false);
			expect(validateFileType("application/pdf", "image")).toBe(false);
		});

		it("should validate download types", () => {
			expect(validateFileType("application/pdf", "download")).toBe(true);
			expect(validateFileType("application/zip", "download")).toBe(true);
			expect(validateFileType("text/plain", "download")).toBe(true);
		});

		it("should reject invalid download types", () => {
			expect(validateFileType("image/jpeg", "download")).toBe(false);
			expect(validateFileType("video/mp4", "download")).toBe(false);
		});
	});

	describe("formatFileSize", () => {
		it("should format bytes", () => {
			expect(formatFileSize(0)).toBe("0 Bytes");
			expect(formatFileSize(500)).toBe("500 Bytes");
		});

		it("should format kilobytes", () => {
			expect(formatFileSize(1024)).toBe("1.00 KB");
			expect(formatFileSize(1536, 1)).toBe("1.5 KB");
		});

		it("should format megabytes", () => {
			expect(formatFileSize(1048576)).toBe("1.00 MB");
			expect(formatFileSize(5242880)).toBe("5.00 MB");
		});

		it("should format gigabytes", () => {
			expect(formatFileSize(1073741824)).toBe("1.00 GB");
		});
	});

	describe("formatDate", () => {
		const testDate = new Date("2024-01-15T12:00:00Z");

		it("should format date in short format", () => {
			const formatted = formatDate(testDate, "short");
			expect(formatted).toContain("Jan");
			expect(formatted).toContain("15");
			expect(formatted).toContain("2024");
		});

		it("should format date in long format", () => {
			const formatted = formatDate(testDate, "long");
			expect(formatted).toContain("January");
			expect(formatted).toContain("15");
			expect(formatted).toContain("2024");
		});

		it("should handle null date", () => {
			expect(formatDate(null)).toBe("");
		});

		it("should handle string date", () => {
			const formatted = formatDate("2024-01-15", "short");
			expect(formatted).toBeTruthy();
		});
	});

	describe("truncateText", () => {
		it("should truncate long text", () => {
			const text = "This is a very long text that needs to be truncated";
			expect(truncateText(text, 20)).toBe("This is a very long ...");
		});

		it("should not truncate short text", () => {
			const text = "Short";
			expect(truncateText(text, 10)).toBe("Short");
		});

		it("should handle exact length", () => {
			const text = "Exact length";
			expect(truncateText(text, 12)).toBe("Exact length");
		});
	});

	describe("stripHtml", () => {
		it("should remove HTML tags", () => {
			expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
		});

		it("should handle nested tags", () => {
			expect(stripHtml("<div><p><span>Text</span></p></div>")).toBe("Text");
		});

		it("should handle plain text", () => {
			expect(stripHtml("Plain text")).toBe("Plain text");
		});

		it("should trim whitespace", () => {
			expect(stripHtml("  <p>  Text  </p>  ")).toBe("Text");
		});
	});

	describe("generateExcerpt", () => {
		it("should generate excerpt from HTML", () => {
			const html = "<p>This is a long post content that should be truncated...</p>";
			const excerpt = generateExcerpt(html, 20);
			expect(excerpt).toBe("This is a long post ...");
		});

		it("should strip HTML and truncate", () => {
			const html = "<p>Plain text content</p>";
			const excerpt = generateExcerpt(html, 50);
			expect(excerpt).toBe("Plain text content");
			expect(excerpt).not.toContain("<");
		});
	});

	describe("isValidSlug", () => {
		it("should validate correct slugs", () => {
			expect(isValidSlug("my-blog-post")).toBe(true);
			expect(isValidSlug("post-123")).toBe(true);
			expect(isValidSlug("hello-world")).toBe(true);
		});

		it("should reject invalid slugs", () => {
			expect(isValidSlug("My Blog Post")).toBe(false);
			expect(isValidSlug("post_with_underscore")).toBe(false);
			expect(isValidSlug("-leading-hyphen")).toBe(false);
			expect(isValidSlug("trailing-hyphen-")).toBe(false);
			expect(isValidSlug("double--hyphen")).toBe(false);
		});
	});

	describe("getFileExtension", () => {
		it("should extract file extension", () => {
			expect(getFileExtension("photo.jpg")).toBe("jpg");
			expect(getFileExtension("document.pdf")).toBe("pdf");
			expect(getFileExtension("archive.tar.gz")).toBe("gz");
		});

		it("should handle files without extension", () => {
			expect(getFileExtension("README")).toBe("");
		});

		it("should return lowercase extension", () => {
			expect(getFileExtension("PHOTO.JPG")).toBe("jpg");
		});
	});

	describe("generateUniqueFilename", () => {
		it("should generate unique filename with timestamp", () => {
			const filename = generateUniqueFilename("photo.jpg");
			expect(filename).toMatch(/^\d+-photo\.jpg$/);
		});

		it("should slugify the filename", () => {
			const filename = generateUniqueFilename("My Photo File.jpg");
			expect(filename).toMatch(/^\d+-my-photo-file\.jpg$/);
		});

		it("should preserve file extension", () => {
			const filename = generateUniqueFilename("document.pdf");
			expect(filename).toMatch(/\.pdf$/);
		});
	});
});
