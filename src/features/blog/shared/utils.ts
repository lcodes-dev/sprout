/**
 * Shared Blog Utilities
 *
 * Common utility functions used across the blog feature.
 * These utilities are shared between admin and frontend parts of the blog.
 */

/**
 * Generate a URL-friendly slug from a string
 *
 * @param text - The text to convert to a slug
 * @returns URL-friendly slug
 *
 * @example
 * generateSlug("My First Blog Post") // "my-first-blog-post"
 * generateSlug("Hello, World!") // "hello-world"
 * generateSlug("Special Chars: #@$%") // "special-chars"
 */
export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		// Replace spaces with hyphens
		.replace(/\s+/g, "-")
		// Remove special characters
		.replace(/[^\w\-]+/g, "")
		// Replace multiple hyphens with single hyphen
		.replace(/\-\-+/g, "-")
		// Remove leading/trailing hyphens
		.replace(/^-+/, "")
		.replace(/-+$/, "");
}

/**
 * Validate file type against allowed types
 *
 * @param mimeType - The MIME type to validate
 * @param fileType - The file type category ("image" or "download")
 * @returns True if valid, false otherwise
 *
 * @example
 * validateFileType("image/jpeg", "image") // true
 * validateFileType("application/pdf", "download") // true
 * validateFileType("text/html", "image") // false
 */
export function validateFileType(
	mimeType: string,
	fileType: "image" | "download",
): boolean {
	const allowedImageTypes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/svg+xml",
	];

	const allowedDownloadTypes = [
		"application/pdf",
		"application/zip",
		"application/x-zip-compressed",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"text/plain",
		"text/csv",
	];

	if (fileType === "image") {
		return allowedImageTypes.includes(mimeType);
	}

	if (fileType === "download") {
		return allowedDownloadTypes.includes(mimeType);
	}

	return false;
}

/**
 * Format file size in human-readable format
 *
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 *
 * @example
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1536, 1) // "1.5 KB"
 * formatFileSize(1048576) // "1.00 MB"
 * formatFileSize(0) // "0 Bytes"
 */
export function formatFileSize(bytes: number, decimals = 2): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format a date in a human-readable format
 *
 * @param date - The date to format
 * @param format - Format type ("short", "long", "relative")
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date("2024-01-15"), "short") // "Jan 15, 2024"
 * formatDate(new Date("2024-01-15"), "long") // "January 15, 2024"
 */
export function formatDate(
	date: Date | string | null,
	format: "short" | "long" | "relative" = "short",
): string {
	if (!date) return "";

	const d = typeof date === "string" ? new Date(date) : date;

	if (format === "short") {
		return d.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	if (format === "long") {
		return d.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}

	if (format === "relative") {
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
		return `${Math.floor(diffDays / 365)} years ago`;
	}

	return d.toLocaleDateString();
}

/**
 * Truncate text to a maximum length with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 *
 * @example
 * truncateText("This is a long text", 10) // "This is a..."
 * truncateText("Short", 10) // "Short"
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength)}...`;
}

/**
 * Extract plain text from HTML content
 *
 * @param html - HTML string
 * @returns Plain text without HTML tags
 *
 * @example
 * stripHtml("<p>Hello <strong>world</strong></p>") // "Hello world"
 */
export function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Generate an excerpt from content
 *
 * @param content - Full content (HTML or plain text)
 * @param maxLength - Maximum length of excerpt
 * @returns Generated excerpt
 *
 * @example
 * generateExcerpt("<p>This is a long post content...</p>", 50)
 */
export function generateExcerpt(content: string, maxLength = 150): string {
	const plainText = stripHtml(content);
	return truncateText(plainText, maxLength);
}

/**
 * Calculate pagination metadata
 *
 * @param total - Total number of items
 * @param page - Current page number (1-based)
 * @param perPage - Items per page
 * @returns Pagination metadata
 */
export function calculatePagination(
	total: number,
	page: number,
	perPage: number,
) {
	const totalPages = Math.ceil(total / perPage);
	const currentPage = Math.max(1, Math.min(page, totalPages));

	return {
		currentPage,
		perPage,
		total,
		totalPages,
		hasNextPage: currentPage < totalPages,
		hasPrevPage: currentPage > 1,
		offset: (currentPage - 1) * perPage,
		limit: perPage,
	};
}

/**
 * Validate slug format
 *
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidSlug("my-blog-post") // true
 * isValidSlug("My Blog Post") // false
 * isValidSlug("post-123") // true
 */
export function isValidSlug(slug: string): boolean {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Get file extension from filename
 *
 * @param filename - The filename
 * @returns File extension (without dot)
 *
 * @example
 * getFileExtension("photo.jpg") // "jpg"
 * getFileExtension("document.pdf") // "pdf"
 */
export function getFileExtension(filename: string): string {
	const parts = filename.split(".");
	return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Generate a unique filename to prevent collisions
 *
 * @param originalName - Original filename
 * @returns Unique filename with timestamp
 *
 * @example
 * generateUniqueFilename("photo.jpg") // "1704067200000-photo.jpg"
 */
export function generateUniqueFilename(originalName: string): string {
	const timestamp = Date.now();
	const ext = getFileExtension(originalName);
	const nameWithoutExt = originalName.slice(
		0,
		originalName.length - ext.length - 1,
	);
	const slug = generateSlug(nameWithoutExt);
	return `${timestamp}-${slug}.${ext}`;
}
