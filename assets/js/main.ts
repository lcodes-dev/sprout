/**
 * Frontend JavaScript Entry Point
 *
 * This file initializes Hotwire Turbo and Stimulus,
 * and registers all Stimulus controllers.
 */

import { Application } from "@hotwired/stimulus"
import * as Turbo from "@hotwired/turbo"

// Initialize Stimulus application
const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus = application

// Import and register controllers
import HelloController from "./controllers/hello_controller.ts"

application.register("hello", HelloController)

// Log that the application has started
console.log("🚀 Sprout frontend initialized!")
console.log("📦 Turbo:", Turbo)
console.log("⚡ Stimulus:", application)

// Make Turbo available globally for debugging
window.Turbo = Turbo

// Type augmentation for global window object
declare global {
  interface Window {
    Stimulus: Application
    Turbo: typeof Turbo
  }
}

export { application, Turbo }
