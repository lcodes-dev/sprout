#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run

/**
 * Unified Build Script
 * Builds both CSS and JavaScript in parallel
 */

console.log("🏗️  Starting build process...")

const cssProcess = new Deno.Command("deno", {
  args: ["task", "build:css"],
  stdout: "inherit",
  stderr: "inherit",
}).spawn()

const jsProcess = new Deno.Command("deno", {
  args: ["task", "build:js"],
  stdout: "inherit",
  stderr: "inherit",
}).spawn()

const [cssStatus, jsStatus] = await Promise.all([
  cssProcess.status,
  jsProcess.status,
])

if (cssStatus.success && jsStatus.success) {
  console.log("\n✅ Build completed successfully!")
} else {
  console.error("\n❌ Build failed!")
  Deno.exit(1)
}
