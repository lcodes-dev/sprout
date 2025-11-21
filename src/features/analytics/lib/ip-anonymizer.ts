/**
 * IP Anonymizer
 *
 * Anonymizes IP addresses for privacy-focused analytics.
 * - IPv4: Sets the last octet to 0 (e.g., 192.168.1.123 → 192.168.1.0)
 * - IPv6: Sets the last 80 bits to 0 (e.g., 2001:db8::1 → 2001:db8::)
 *
 * This ensures compliance with privacy regulations (GDPR, etc.) while
 * still maintaining useful geographic/network information.
 */

/**
 * Anonymize an IP address
 *
 * @param ip - The IP address to anonymize (IPv4 or IPv6)
 * @returns Anonymized IP address
 *
 * @example
 * anonymizeIp('192.168.1.123') // '192.168.1.0'
 * anonymizeIp('2001:db8::1') // '2001:db8::'
 * anonymizeIp('::1') // '::'
 */
export function anonymizeIp(ip: string): string {
	// Check if IPv6 (contains colons)
	if (ip.includes(":")) {
		return anonymizeIpv6(ip);
	}

	// Otherwise treat as IPv4
	return anonymizeIpv4(ip);
}

/**
 * Anonymize an IPv4 address
 *
 * Sets the last octet to 0
 *
 * @param ip - IPv4 address
 * @returns Anonymized IPv4 address
 *
 * @example
 * anonymizeIpv4('192.168.1.123') // '192.168.1.0'
 * anonymizeIpv4('10.0.0.1') // '10.0.0.0'
 */
function anonymizeIpv4(ip: string): string {
	const parts = ip.split(".");

	if (parts.length !== 4) {
		// Invalid IPv4, return as-is
		return ip;
	}

	// Set last octet to 0
	parts[3] = "0";

	return parts.join(".");
}

/**
 * Anonymize an IPv6 address
 *
 * Sets the last 80 bits (5 groups) to 0
 * IPv6 addresses are 128 bits, we keep the first 48 bits (3 groups)
 *
 * @param ip - IPv6 address
 * @returns Anonymized IPv6 address
 *
 * @example
 * anonymizeIpv6('2001:db8:85a3::8a2e:370:7334') // '2001:db8:85a3::'
 * anonymizeIpv6('2001:db8::1') // '2001:db8::'
 * anonymizeIpv6('::1') // '::'
 */
function anonymizeIpv6(ip: string): string {
	// Expand compressed IPv6 notation
	const expanded = expandIpv6(ip);

	// Split into groups
	const groups = expanded.split(":");

	if (groups.length !== 8) {
		// Invalid IPv6, return as-is
		return ip;
	}

	// Keep first 3 groups (48 bits), zero out the rest
	const anonymized = groups.slice(0, 3).join(":") + "::";

	return anonymized;
}

/**
 * Expand compressed IPv6 notation to full form
 *
 * Handles :: compression and missing leading zeros
 *
 * @param ip - IPv6 address (possibly compressed)
 * @returns Expanded IPv6 address with all 8 groups
 *
 * @example
 * expandIpv6('2001:db8::1') // '2001:0db8:0000:0000:0000:0000:0000:0001'
 * expandIpv6('::1') // '0000:0000:0000:0000:0000:0000:0000:0001'
 */
function expandIpv6(ip: string): string {
	// Handle special case of '::'
	if (ip === "::") {
		return "0000:0000:0000:0000:0000:0000:0000:0000";
	}

	// Split by '::'
	const parts = ip.split("::");

	if (parts.length === 1) {
		// No compression, just pad each group
		return ip
			.split(":")
			.map((group) => group.padStart(4, "0"))
			.join(":");
	}

	// Handle compression
	const left = parts[0] ? parts[0].split(":") : [];
	const right = parts[1] ? parts[1].split(":") : [];

	// Calculate number of zero groups needed
	const missingGroups = 8 - left.length - right.length;
	const zeros = Array(missingGroups).fill("0000");

	// Combine all parts
	const allGroups = [...left, ...zeros, ...right];

	// Pad each group to 4 characters
	return allGroups.map((group) => group.padStart(4, "0")).join(":");
}
