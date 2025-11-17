#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run

/**
 * CSS Build Script
 * Compiles Tailwind CSS from assets/css/main.css to static/css/main.css
 */

import { join } from "jsr:@std/path@^0.223.0";

const watchMode = Deno.args.includes("--watch");
const inputPath = join(Deno.cwd(), "assets", "css", "main.css");
const outputPath = join(Deno.cwd(), "static", "css", "main.css");
const configPath = join(Deno.cwd(), "tailwind.config.ts");

async function buildCSS() {
  console.log("🎨 Building CSS...");

  const args = [
    "npm:tailwindcss@^3.4.0",
    "-i", inputPath,
    "-o", outputPath,
    "-c", configPath,
  ];

  if (watchMode) {
    args.push("--watch");
    console.log("👀 Watching for CSS changes...");
  } else {
    args.push("--minify");
  }

  const command = new Deno.Command("deno", {
    args: ["run", "-A", ...args],
    stdout: "inherit",
    stderr: "inherit",
  });

  const process = command.spawn();
  const status = await process.status;

  if (!watchMode) {
    if (status.success) {
      console.log("✅ CSS built successfully!");
    } else {
      console.error("❌ CSS build failed!");
      Deno.exit(1);
    }
  }
}

await buildCSS();
