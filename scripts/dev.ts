#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run --allow-net

/**
 * Development Script
 * Runs the server with watch mode for CSS and JavaScript using concurrently
 */

console.log("🚀 Starting development server...\n")

const command = new Deno.Command("deno", {
  args: [
    "run",
    "-A",
    "npm:concurrently@^9.1.0",
    "-n", "CSS,JS,SERVER",
    "-c", "cyan,magenta,green",
    "deno task watch:css",
    "deno task watch:js",
    "deno run --allow-net --allow-read --watch src/main.ts",
  ],
  stdout: "inherit",
  stderr: "inherit",
})

const process = command.spawn()
const status = await process.status

Deno.exit(status.code)
