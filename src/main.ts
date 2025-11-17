import { Hono } from "hono"
import { serveStatic } from "hono/deno"

// Import feature routers
import landing from "./features/landing/index.ts"

const app = new Hono()

// Serve static files from the static directory
app.use("/static/*", serveStatic({ root: "./" }))

// Register feature routes
app.route("/", landing)

Deno.serve(app.fetch)
