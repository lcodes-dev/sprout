/**
 * Tests for Path Cleaner
 */

import { describe, expect, it } from "vitest";
import { cleanPath } from "./path-cleaner.js";

describe("cleanPath", () => {
	describe("sensitive parameter removal", () => {
		it("should remove token parameter", () => {
			expect(cleanPath("/api/users?token=secret123")).toBe("/api/users");
		});

		it("should remove multiple sensitive parameters", () => {
			expect(
				cleanPath("/api/data?token=abc&session=xyz&key=123"),
			).toBe("/api/data");
		});

		it("should keep safe parameters", () => {
			expect(cleanPath("/search?q=test&page=1")).toBe("/search?q=test&page=1");
		});

		it("should remove sensitive and keep safe parameters", () => {
			expect(
				cleanPath("/search?q=test&token=secret&page=1"),
			).toBe("/search?q=test&page=1");
		});

		it("should handle various sensitive parameter names", () => {
			expect(cleanPath("/api?access_token=abc")).toBe("/api");
			expect(cleanPath("/api?refresh_token=abc")).toBe("/api");
			expect(cleanPath("/api?api_key=abc")).toBe("/api");
			expect(cleanPath("/api?apikey=abc")).toBe("/api");
			expect(cleanPath("/api?secret=abc")).toBe("/api");
			expect(cleanPath("/api?password=abc")).toBe("/api");
			expect(cleanPath("/api?pwd=abc")).toBe("/api");
			expect(cleanPath("/api?pass=abc")).toBe("/api");
			expect(cleanPath("/api?session=abc")).toBe("/api");
			expect(cleanPath("/api?sessionid=abc")).toBe("/api");
			expect(cleanPath("/api?sid=abc")).toBe("/api");
			expect(cleanPath("/api?auth=abc")).toBe("/api");
			expect(cleanPath("/api?code=abc")).toBe("/api");
			expect(cleanPath("/api?state=abc")).toBe("/api");
			expect(cleanPath("/api?nonce=abc")).toBe("/api");
		});

		it("should handle case-insensitive parameter names", () => {
			expect(cleanPath("/api?TOKEN=secret")).toBe("/api");
			expect(cleanPath("/api?Token=secret")).toBe("/api");
			expect(cleanPath("/api?AccessToken=secret")).toBe("/api");
		});

		it("should support additional sensitive params", () => {
			expect(
				cleanPath("/api?custom=secret", {
					additionalSensitiveParams: ["custom"],
				}),
			).toBe("/api");
		});
	});

	describe("ID generalization", () => {
		it("should generalize numeric IDs when enabled", () => {
			expect(cleanPath("/user/123", { generalizeIds: true })).toBe("/user/:id");
		});

		it("should not generalize IDs by default", () => {
			expect(cleanPath("/user/123")).toBe("/user/123");
		});

		it("should generalize multiple numeric IDs", () => {
			expect(
				cleanPath("/posts/456/comments/789", { generalizeIds: true }),
			).toBe("/posts/:id/comments/:id");
		});

		it("should generalize UUIDs", () => {
			expect(
				cleanPath(
					"/user/550e8400-e29b-41d4-a716-446655440000",
					{ generalizeIds: true },
				),
			).toBe("/user/:uuid");
		});

		it("should not generalize non-numeric segments", () => {
			expect(cleanPath("/about/team", { generalizeIds: true })).toBe(
				"/about/team",
			);
		});

		it("should handle mixed segments", () => {
			expect(
				cleanPath("/api/users/123/profile", { generalizeIds: true }),
			).toBe("/api/users/:id/profile");
		});
	});

	describe("combined operations", () => {
		it("should clean params and generalize IDs", () => {
			expect(
				cleanPath("/user/123?token=secret&name=john", {
					generalizeIds: true,
				}),
			).toBe("/user/:id?name=john");
		});

		it("should handle path with no query string", () => {
			expect(cleanPath("/about")).toBe("/about");
		});

		it("should handle root path", () => {
			expect(cleanPath("/")).toBe("/");
		});

		it("should handle path with only sensitive params", () => {
			expect(cleanPath("/api?token=abc&key=xyz")).toBe("/api");
		});
	});

	describe("edge cases", () => {
		it("should handle empty path", () => {
			expect(cleanPath("")).toBe("");
		});

		it("should handle path with empty query string", () => {
			expect(cleanPath("/api?")).toBe("/api?");
		});

		it("should handle malformed query strings gracefully", () => {
			expect(cleanPath("/api?invalid")).toBe("/api?invalid");
		});

		it("should handle special characters in path", () => {
			expect(cleanPath("/search?q=test%20query")).toBe("/search?q=test%20query");
		});

		it("should handle hash fragments", () => {
			// Note: Typically hash fragments aren't sent to server,
			// but we handle them gracefully
			expect(cleanPath("/page#section")).toBe("/page#section");
		});

		it("should not modify clean paths", () => {
			const cleanPaths = [
				"/",
				"/about",
				"/api/users",
				"/search?q=test",
				"/posts/latest",
			];

			for (const path of cleanPaths) {
				expect(cleanPath(path)).toBe(path);
			}
		});
	});

	describe("parameter preservation", () => {
		it("should preserve multiple safe parameters", () => {
			expect(
				cleanPath("/search?q=test&page=1&sort=date&order=desc"),
			).toBe("/search?q=test&page=1&sort=date&order=desc");
		});

		it("should preserve parameter order when removing sensitive ones", () => {
			const result = cleanPath("/api?a=1&token=secret&b=2&key=secret&c=3");
			expect(result).toBe("/api?a=1&b=2&c=3");
		});
	});

	describe("disable sensitive param removal", () => {
		it("should keep all params when disabled", () => {
			expect(
				cleanPath("/api?token=secret&q=test", {
					removeSensitiveParams: false,
				}),
			).toBe("/api?token=secret&q=test");
		});
	});
});
