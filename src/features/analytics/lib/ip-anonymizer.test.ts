/**
 * Tests for IP Anonymizer
 */

import { describe, expect, it } from "vitest";
import { anonymizeIp } from "./ip-anonymizer.js";

describe("anonymizeIp", () => {
	describe("IPv4", () => {
		it("should anonymize standard IPv4 address", () => {
			expect(anonymizeIp("192.168.1.123")).toBe("192.168.1.0");
		});

		it("should anonymize IPv4 with .0 in last octet", () => {
			expect(anonymizeIp("192.168.1.0")).toBe("192.168.1.0");
		});

		it("should anonymize different IPv4 addresses", () => {
			expect(anonymizeIp("10.0.0.1")).toBe("10.0.0.0");
			expect(anonymizeIp("172.16.254.255")).toBe("172.16.254.0");
			expect(anonymizeIp("8.8.8.8")).toBe("8.8.8.0");
		});

		it("should handle invalid IPv4 gracefully", () => {
			expect(anonymizeIp("192.168.1")).toBe("192.168.1");
			expect(anonymizeIp("invalid")).toBe("invalid");
		});
	});

	describe("IPv6", () => {
		it("should anonymize standard IPv6 address", () => {
			expect(anonymizeIp("2001:db8:85a3::8a2e:370:7334")).toBe("2001:db8:85a3::");
		});

		it("should anonymize compressed IPv6", () => {
			expect(anonymizeIp("2001:db8::1")).toBe("2001:db8:0000::");
		});

		it("should anonymize localhost IPv6", () => {
			expect(anonymizeIp("::1")).toBe("0000:0000:0000::");
		});

		it("should anonymize full IPv6", () => {
			expect(
				anonymizeIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334"),
			).toBe("2001:0db8:85a3::");
		});

		it("should anonymize double colon at start", () => {
			expect(anonymizeIp("::ffff:192.0.2.1")).toBe("0000:0000:0000::");
		});

		it("should anonymize double colon at end", () => {
			expect(anonymizeIp("2001:db8::")).toBe("2001:0db8:0000::");
		});

		it("should anonymize just double colon", () => {
			expect(anonymizeIp("::")).toBe("0000:0000:0000::");
		});
	});

	describe("edge cases", () => {
		it("should handle empty string", () => {
			expect(anonymizeIp("")).toBe("");
		});

		it("should preserve anonymization", () => {
			const anonymized = anonymizeIp("192.168.1.123");
			expect(anonymizeIp(anonymized)).toBe(anonymized);
		});

		it("should work with various formats", () => {
			// IPv4-mapped IPv6
			const result = anonymizeIp("::ffff:192.0.2.128");
			expect(result).toBe("0000:0000:0000::");
		});
	});
});
