#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run --allow-net

/**
 * Development Script
 * Runs the server with watch mode for CSS and JavaScript
 */

console.log("🚀 Starting development server...\n")

// Start CSS watcher
const cssWatcher = new Deno.Command("deno", {
  args: ["task", "watch:css"],
  stdout: "inherit",
  stderr: "inherit",
}).spawn()

// Start JS watcher
const jsWatcher = new Deno.Command("deno", {
  args: ["task", "watch:js"],
  stdout: "inherit",
  stderr: "inherit",
}).spawn()

// Wait a bit for the watchers to start
await new Promise((resolve) => setTimeout(resolve, 2000))

// Start the server with watch mode
console.log("\n🌐 Starting web server...\n")
const server = new Deno.Command("deno", {
  args: [
    "run",
    "--allow-net",
    "--allow-read",
    "--watch",
    "main.ts",
  ],
  stdout: "inherit",
  stderr: "inherit",
}).spawn()

// Handle cleanup on exit
const cleanup = () => {
  console.log("\n🛑 Shutting down...")
  cssWatcher.kill()
  jsWatcher.kill()
  server.kill()
  Deno.exit(0)
}

// Listen for termination signals
Deno.addSignalListener("SIGINT", cleanup)
Deno.addSignalListener("SIGTERM", cleanup)

// Wait for server to exit
await server.status
