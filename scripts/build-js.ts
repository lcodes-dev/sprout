#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run

/**
 * JavaScript Build Script
 * Bundles frontend JavaScript from assets/js/main.ts to static/js/main.js
 */

import * as esbuild from "esbuild"
import { join } from "@std/path"

const watchMode = Deno.args.includes("--watch")
const inputPath = join(Deno.cwd(), "assets", "js", "main.ts")
const outputPath = join(Deno.cwd(), "static", "js", "main.js")

async function buildJS() {
  console.log("🔨 Building JavaScript...")

  const buildOptions: esbuild.BuildOptions = {
    entryPoints: [inputPath],
    outfile: outputPath,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    sourcemap: !watchMode ? false : "inline",
    minify: !watchMode,
    treeShaking: true,
    logLevel: "info",
  }

  try {
    if (watchMode) {
      console.log("👀 Watching for JavaScript changes...")
      const ctx = await esbuild.context(buildOptions)
      await ctx.watch()
      console.log("✅ JavaScript watcher started!")
      // Keep the process alive
      await new Promise(() => {})
    } else {
      await esbuild.build(buildOptions)
      console.log("✅ JavaScript built successfully!")
      esbuild.stop()
    }
  } catch (error) {
    console.error("❌ JavaScript build failed!")
    console.error(error)
    esbuild.stop()
    Deno.exit(1)
  }
}

await buildJS()
