/**
 * Frontend JavaScript Entry Point
 *
 * This file initializes Hotwire Turbo and Alpine.js.
 */

import * as Turbo from "@hotwired/turbo";
import Alpine from "alpinejs";

// Make Alpine and Turbo available globally via window
declare global {
	interface Window {
		Alpine: typeof Alpine;
		Turbo: typeof Turbo;
	}
}

window.Alpine = Alpine;
window.Turbo = Turbo;

// Start Alpine after assigning to window
window.Alpine.start();

// Log that the application has started
console.log("🚀 Sprout frontend initialized!");
console.log("📦 Turbo:", window.Turbo);
console.log("⚡ Alpine.js:", window.Alpine);

export { Alpine, Turbo };
