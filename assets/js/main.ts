/**
 * Frontend JavaScript Entry Point
 *
 * This file initializes Hotwire Turbo and Alpine.js.
 */

import * as Turbo from "@hotwired/turbo";
import Alpine from "alpinejs";

// Import email notification Alpine.js components
import { emailDashboard } from "./lib/components/email-dashboard.js";
import { emailVolumeChart } from "./lib/components/email-volume-chart.js";
import { templateList } from "./lib/components/template-list.js";
import { templateForm } from "./lib/components/template-form.js";
import { scheduledList } from "./lib/components/scheduled-list.js";
import { scheduleEmailForm } from "./lib/components/schedule-email-form.js";
import { sentList } from "./lib/components/sent-list.js";

// Make Alpine and Turbo available globally via window
declare global {
	interface Window {
		Alpine: typeof Alpine;
		Turbo: typeof Turbo;
		// Email notification Alpine.js components
		emailDashboard: typeof emailDashboard;
		emailVolumeChart: typeof emailVolumeChart;
		templateList: typeof templateList;
		templateForm: typeof templateForm;
		scheduledList: typeof scheduledList;
		scheduleEmailForm: typeof scheduleEmailForm;
		sentList: typeof sentList;
	}
}

window.Alpine = Alpine;
window.Turbo = Turbo;

// Register email notification Alpine.js components
window.emailDashboard = emailDashboard;
window.emailVolumeChart = emailVolumeChart;
window.templateList = templateList;
window.templateForm = templateForm;
window.scheduledList = scheduledList;
window.scheduleEmailForm = scheduleEmailForm;
window.sentList = sentList;

// Start Alpine after assigning to window
window.Alpine.start();

// Log that the application has started
console.log("🚀 Sprout frontend initialized!");
console.log("📦 Turbo:", window.Turbo);
console.log("⚡ Alpine.js:", window.Alpine);

export { Alpine, Turbo };
