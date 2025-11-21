/**
 * Feature Flags Admin Router
 *
 * Admin panel routes for managing feature flags
 */

import { Hono } from "hono";
import type { Context } from "hono";
import { getAllFeatureFlags, createFeatureFlag, updateFeatureFlag, deleteFeatureFlag, toggleFeatureFlag } from "@/db/queries/feature-flags.js";
import { refreshCache } from "@/shared/lib/feature-flags/index.js";
import { FeatureFlagsPage } from "./views/FeatureFlagsPage";

const admin = new Hono();

/**
 * GET /admin/feature-flags
 *
 * Display the feature flags management page
 */
admin.get("/", async (c: Context) => {
	try {
		const flags = await getAllFeatureFlags();
		return c.html(<FeatureFlagsPage flags={flags} />);
	} catch (error) {
		console.error("Error loading feature flags:", error);
		return c.text("Error loading feature flags", 500);
	}
});

/**
 * POST /admin/feature-flags
 *
 * Create a new feature flag
 */
admin.post("/", async (c: Context) => {
	try {
		const body = await c.req.parseBody();

		// Validate input
		const key = body.key as string;
		const active = body.active === "true" || body.active === "on";
		const percentage = Number(body.percentage) || 0;

		if (!key || key.trim() === "") {
			return c.json({ error: "Flag key is required" }, 400);
		}

		if (percentage < 0 || percentage > 100) {
			return c.json({ error: "Percentage must be between 0 and 100" }, 400);
		}

		// Create flag
		const flag = await createFeatureFlag({
			key: key.trim().toLowerCase().replace(/\s+/g, "_"),
			active,
			percentage,
		});

		// Refresh cache
		await refreshCache();

		// Return success
		return c.json({ success: true, flag }, 201);
	} catch (error: any) {
		console.error("Error creating feature flag:", error);

		// Check for unique constraint violation
		if (error.message?.includes("unique") || error.code === "23505") {
			return c.json({ error: "A flag with this key already exists" }, 409);
		}

		return c.json({ error: "Failed to create feature flag" }, 500);
	}
});

/**
 * PATCH /admin/feature-flags/:id/toggle
 *
 * Toggle a feature flag's active status
 */
admin.patch("/:id/toggle", async (c: Context) => {
	try {
		const id = Number(c.req.param("id"));

		if (isNaN(id)) {
			return c.json({ error: "Invalid flag ID" }, 400);
		}

		const flag = await toggleFeatureFlag(id);

		if (!flag) {
			return c.json({ error: "Flag not found" }, 404);
		}

		// Refresh cache
		await refreshCache();

		return c.json({ success: true, flag });
	} catch (error) {
		console.error("Error toggling feature flag:", error);
		return c.json({ error: "Failed to toggle feature flag" }, 500);
	}
});

/**
 * PATCH /admin/feature-flags/:id/percentage
 *
 * Update a feature flag's percentage
 */
admin.patch("/:id/percentage", async (c: Context) => {
	try {
		const id = Number(c.req.param("id"));
		const body = await c.req.parseBody();
		const percentage = Number(body.percentage);

		if (isNaN(id)) {
			return c.json({ error: "Invalid flag ID" }, 400);
		}

		if (isNaN(percentage) || percentage < 0 || percentage > 100) {
			return c.json({ error: "Percentage must be between 0 and 100" }, 400);
		}

		const flag = await updateFeatureFlag(id, { percentage });

		if (!flag) {
			return c.json({ error: "Flag not found" }, 404);
		}

		// Refresh cache
		await refreshCache();

		return c.json({ success: true, flag });
	} catch (error) {
		console.error("Error updating feature flag percentage:", error);
		return c.json({ error: "Failed to update percentage" }, 500);
	}
});

/**
 * DELETE /admin/feature-flags/:id
 *
 * Delete a feature flag
 */
admin.delete("/:id", async (c: Context) => {
	try {
		const id = Number(c.req.param("id"));

		if (isNaN(id)) {
			return c.json({ error: "Invalid flag ID" }, 400);
		}

		const deleted = await deleteFeatureFlag(id);

		if (!deleted) {
			return c.json({ error: "Flag not found" }, 404);
		}

		// Refresh cache
		await refreshCache();

		return c.json({ success: true });
	} catch (error) {
		console.error("Error deleting feature flag:", error);
		return c.json({ error: "Failed to delete feature flag" }, 500);
	}
});

export default admin;
