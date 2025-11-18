/**
 * Path Cleaner
 *
 * Cleans URL paths for privacy-focused analytics by:
 * - Removing sensitive query parameters (tokens, secrets, passwords, etc.)
 * - Optionally generalizing dynamic segments (/user/123 → /user/:id)
 * - Handling edge cases (malformed URLs, special characters)
 *
 * This ensures analytics data doesn't leak sensitive information.
 */

/**
 * List of sensitive query parameter names to remove
 */
const SENSITIVE_PARAMS = [
	"token",
	"access_token",
	"refresh_token",
	"api_key",
	"apikey",
	"secret",
	"password",
	"pwd",
	"pass",
	"session",
	"sessionid",
	"sid",
	"auth",
	"key",
	"code",
	"state",
	"nonce",
];

/**
 * Options for path cleaning
 */
export interface PathCleanerOptions {
	/**
	 * Remove sensitive query parameters
	 * Default: true
	 */
	removeSensitiveParams?: boolean;

	/**
	 * Generalize numeric IDs in path segments
	 * e.g., /user/123 → /user/:id
	 * Default: false (keep specific paths for more detailed analytics)
	 */
	generalizeIds?: boolean;

	/**
	 * Additional parameter names to consider sensitive
	 */
	additionalSensitiveParams?: string[];
}

/**
 * Clean a URL path for analytics
 *
 * @param path - The URL path to clean (can include query string)
 * @param options - Cleaning options
 * @returns Cleaned path
 *
 * @example
 * cleanPath('/api/users?token=secret123') // '/api/users'
 * cleanPath('/user/123', { generalizeIds: true }) // '/user/:id'
 * cleanPath('/search?q=test&sessionid=abc') // '/search?q=test'
 */
export function cleanPath(
	path: string,
	options: PathCleanerOptions = {},
): string {
	const {
		removeSensitiveParams = true,
		generalizeIds = false,
		additionalSensitiveParams = [],
	} = options;

	try {
		// Split path and query string
		const [pathname, queryString] = path.split("?");

		let cleanedPath = pathname;

		// Generalize IDs if requested
		if (generalizeIds) {
			cleanedPath = generalizePathIds(cleanedPath);
		}

		// Clean query string if present
		if (queryString && removeSensitiveParams) {
			const sensitiveParams = [
				...SENSITIVE_PARAMS,
				...additionalSensitiveParams,
			];
			const cleanedQuery = cleanQueryString(queryString, sensitiveParams);

			if (cleanedQuery) {
				cleanedPath += `?${cleanedQuery}`;
			}
		} else if (queryString) {
			cleanedPath += `?${queryString}`;
		}

		return cleanedPath;
	} catch {
		// If anything goes wrong, return the original path
		return path;
	}
}

/**
 * Generalize numeric IDs in path segments
 *
 * Replaces numeric segments with :id placeholder
 *
 * @param pathname - The path to generalize
 * @returns Generalized path
 *
 * @example
 * generalizePathIds('/user/123') // '/user/:id'
 * generalizePathIds('/posts/456/comments/789') // '/posts/:id/comments/:id'
 * generalizePathIds('/about') // '/about' (unchanged)
 */
function generalizePathIds(pathname: string): string {
	const segments = pathname.split("/");

	const generalizedSegments = segments.map((segment) => {
		// Check if segment is purely numeric
		if (/^\d+$/.test(segment)) {
			return ":id";
		}

		// Check if segment is a UUID
		if (
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
				segment,
			)
		) {
			return ":uuid";
		}

		return segment;
	});

	return generalizedSegments.join("/");
}

/**
 * Clean sensitive parameters from query string
 *
 * @param queryString - The query string (without leading '?')
 * @param sensitiveParams - List of parameter names to remove
 * @returns Cleaned query string (without leading '?'), or empty string if all removed
 *
 * @example
 * cleanQueryString('q=test&token=secret', ['token']) // 'q=test'
 * cleanQueryString('token=secret&key=abc', ['token', 'key']) // ''
 */
function cleanQueryString(
	queryString: string,
	sensitiveParams: string[],
): string {
	const params = new URLSearchParams(queryString);
	const cleanedParams = new URLSearchParams();

	// Filter out sensitive parameters
	for (const [key, value] of params.entries()) {
		const keyLower = key.toLowerCase();

		if (!sensitiveParams.some((sensitive) => keyLower.includes(sensitive))) {
			cleanedParams.set(key, value);
		}
	}

	return cleanedParams.toString();
}
