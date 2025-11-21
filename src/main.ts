
import "dotenv/config";
import process from "node:process";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

import landing from "@/features/landing/index";
import featureFlagsAdmin from "@/features/feature-flags/admin/index";
import { initializeCache } from "@/shared/lib/feature-flags/index.js";

const app = new Hono();

app.use("/static/*", serveStatic({ root: "./" }));
app.route("/", landing);
app.route("/admin/feature-flags", featureFlagsAdmin);

const port = Number(process.env.PORT) || 8000;

/**
 * Initialize application
 *
 * Performs startup tasks like loading feature flags into cache
 */
async function initialize() {
	try {
		// Initialize feature flag cache
		await initializeCache();
	} catch (error) {
		console.error("⚠️  Warning: Failed to initialize feature flags:", error);
		console.error("   Application will continue but feature flags will not work.");
	}
}

// Initialize and start server
initialize().then(() => {
	serve(
		{
			fetch: app.fetch,
			port,
		},
		(info) => {
			console.log(`🚀 Sprout server running at http://localhost:${info.port}`);
		},
	);
});
