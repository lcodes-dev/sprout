
import "dotenv/config";
import process from "node:process";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

import landing from "@/features/landing/index";

const app = new Hono();

app.use("/static/*", serveStatic({ root: "./" }));
app.route("/", landing);

const port = Number(process.env.PORT) || 8000;

serve(
	{
		fetch: app.fetch,
		port,
	},
	(info) => {
		console.log(`🚀 Sprout server running at http://localhost:${info.port}`);
	},
);
