
import "dotenv/config";
import process from "node:process";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

import landing from "@/features/landing/index.js";
import analyticsAdmin from "@/features/analytics/admin/index.js";
import {
	analyticsMiddleware,
	startAnalytics,
	stopAnalytics,
} from "@/features/analytics/init.js";

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
app.route("/admin/analytics", analyticsAdmin);

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

serve(
	{
		fetch: app.fetch,
		port,
	},
	(info) => {
		console.log(`🚀 Sprout server running at http://localhost:${info.port}`);
	},
);
