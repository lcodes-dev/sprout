/**
 * Frontend JavaScript Entry Point
 *
 * This file initializes Hotwire Turbo and Alpine.js.
 */

import Alpine from "alpinejs"
import * as Turbo from "@hotwired/turbo"

// Make Alpine available globally before initialization
globalThis.Alpine = Alpine

// Start Alpine
Alpine.start()

// Log that the application has started
console.log("🚀 Sprout frontend initialized!")
console.log("📦 Turbo:", Turbo)
console.log("⚡ Alpine.js:", Alpine)

// Make Turbo available globally for debugging
globalThis.Turbo = Turbo

// Type augmentation for global object
declare global {
  interface Window {
    Alpine: typeof Alpine
    Turbo: typeof Turbo
  }
}

export { Alpine, Turbo }
