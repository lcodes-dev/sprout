
import "dotenv/config";
import process from "node:process";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

import analyticsAdmin from "@/features/analytics/admin/index";
import {
	analyticsMiddleware,
	startAnalytics,
	stopAnalytics,
} from "@/features/analytics/init";
import landing from "@/features/landing/index";
import adminEmails from "@/features/email-notifications/admin/index";
import featureFlagsAdmin from "@/features/feature-flags/admin/index";
import { initializeCache } from "@/shared/lib/feature-flags/index";

const app = new Hono();

// Static files
app.use("/static/*", serveStatic({ root: "./" }));

// Analytics middleware (applied to all non-admin routes)
app.use("*", async (c, next) => {
	if (!c.req.path.startsWith("/admin")) {
		return analyticsMiddleware(c, next);
	}
	return next();
});

// Routes
app.route("/", landing);
app.route("/admin/emails", adminEmails);
app.route("/admin/analytics", analyticsAdmin);

app.route("/admin/feature-flags", featureFlagsAdmin);



const port = Number(process.env.PORT) || 8000;

// Start analytics system
startAnalytics();

// Handle graceful shutdown
process.on("SIGINT", async () => {
	console.log("\n🛑 Shutting down gracefully...");
	await stopAnalytics();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.log("\n🛑 Shutting down gracefully...");
	await stopAnalytics();
	process.exit(0);
});

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
