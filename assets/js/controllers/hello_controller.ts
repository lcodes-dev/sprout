import { Controller } from "@hotwired/stimulus"

/**
 * Example Stimulus Controller
 *
 * Usage in HTML:
 * <div data-controller="hello">
 *   <span data-hello-target="output"></span>
 * </div>
 */
export default class extends Controller {
  static targets = ["output"]

  declare readonly outputTarget: HTMLElement

  connect() {
    console.log("Hello controller connected!")
    console.log("🎉 Hotwire Stimulus is working!")
  }

  disconnect() {
    console.log("Hello controller disconnected!")
  }
}
