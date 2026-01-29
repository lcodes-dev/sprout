/**
 * Turbo - Hotwire Turbo integration for Phoenix
 *
 * Provides Turbo Drive, Turbo Frames, and Turbo Streams over HTTP and WebSocket.
 *
 * @example
 * import Turbo from "./turbo"
 * Turbo.initialize("/turbo-socket", { _csrf_token: csrfToken })
 */

import * as Turbo from "@hotwired/turbo";
import { Socket } from "phoenix";

class TurboStreamsManager {
  constructor(socket) {
    this.socket = socket;
    this.channels = new Map();
  }

  /**
   * Subscribe to a Turbo Stream topic
   * @param {string} topic - The topic to subscribe to (e.g., "posts")
   * @param {Object} options - Subscription options
   * @param {boolean} options.private - Whether to use private channel (default: false)
   * @returns {Channel} The Phoenix Channel
   */
  subscribe(topic, options = {}) {
    const { private: isPrivate = false } = options;
    const channelName = isPrivate
      ? `turbo_stream:private:${topic}`
      : `turbo_stream:public:${topic}`;

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName);
    }

    const channel = this.socket.channel(channelName, {});

    channel.on("turbo_stream", ({ html }) => {
      Turbo.renderStreamMessage(html);
    });

    channel
      .join()
      .receive("ok", () => {
        console.log(`[Turbo] Subscribed to ${channelName}`);
      })
      .receive("error", (resp) => {
        console.error(`[Turbo] Failed to subscribe to ${channelName}`, resp);
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Unsubscribe from a Turbo Stream topic
   * @param {string} topic - The topic to unsubscribe from
   * @param {Object} options - Subscription options
   * @param {boolean} options.private - Whether this is a private channel
   */
  unsubscribe(topic, options = {}) {
    const { private: isPrivate = false } = options;
    const channelName = isPrivate
      ? `turbo_stream:private:${topic}`
      : `turbo_stream:public:${topic}`;

    const channel = this.channels.get(channelName);
    if (channel) {
      channel.leave();
      this.channels.delete(channelName);
      console.log(`[Turbo] Unsubscribed from ${channelName}`);
    }
  }

  /**
   * Unsubscribe from all topics
   */
  unsubscribeAll() {
    this.channels.forEach((channel, channelName) => {
      channel.leave();
      console.log(`[Turbo] Unsubscribed from ${channelName}`);
    });
    this.channels.clear();
  }
}

class FlashManager {
  constructor() {
    this.observer = null;
  }

  /**
   * Set up handlers for a flash element
   * @param {HTMLElement} flashElement - The flash element to set up
   */
  setupFlashHandlers(flashElement) {
    if (flashElement.hasAttribute("data-flash-initialized")) {
      return;
    }
    flashElement.setAttribute("data-flash-initialized", "true");

    const closeButton = flashElement.querySelector(
      "button[aria-label='close']",
    );
    if (closeButton) {
      closeButton.addEventListener("click", (e) => {
        e.stopPropagation();
        flashElement.remove();
      });
    }

    setTimeout(() => {
      if (flashElement.parentNode) {
        flashElement.remove();
      }
    }, 5000);
  }

  /**
   * Initialize flash message handling
   */
  initialize() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === 1 &&
            node.hasAttribute &&
            node.hasAttribute("data-flash")
          ) {
            this.setupFlashHandlers(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll("[data-flash]").forEach((el) => {
              this.setupFlashHandlers(el);
            });
          }
        });
      });
    });

    const initObserver = () => {
      const flashContainer = document.getElementById("flash-messages");
      if (
        flashContainer &&
        !flashContainer.hasAttribute("data-observer-attached")
      ) {
        flashContainer.setAttribute("data-observer-attached", "true");
        this.observer.observe(flashContainer, {
          childList: true,
          subtree: true,
        });
      }
    };

    document.addEventListener("DOMContentLoaded", initObserver);
    document.addEventListener("turbo:load", initObserver);

    document.addEventListener("turbo:load", () => {
      document.querySelectorAll("[data-flash]").forEach((el) => {
        this.setupFlashHandlers(el);
      });
    });
  }
}

/**
 * Initialize Turbo with Phoenix Socket for WebSocket streams
 *
 * @param {string} socketPath - The WebSocket path (default: "/turbo-socket")
 * @param {Object} socketParams - Parameters for socket connection
 * @param {Object} options - Additional options
 * @param {boolean} options.autoSubscribe - Auto-subscribe to meta tags (default: true)
 * @param {boolean} options.enableFlash - Enable flash message handling (default: true)
 *
 * @example
 * const csrfToken = document.querySelector("meta[name='csrf-token']")?.getAttribute("content")
 * initializeTurbo("/turbo-socket", { _csrf_token: csrfToken })
 */
export function initializeTurbo(
  socketPath = "/turbo-socket",
  socketParams = {},
  options = {},
) {
  const { autoSubscribe = true, enableFlash = true } = options;

  console.log("[Turbo] Initializing...");

  const socket = new Socket(socketPath, { params: socketParams });
  socket.connect();

  const turboStreams = new TurboStreamsManager(socket);

  window.turboStreams = turboStreams;
  window.turboSocket = socket;

  if (autoSubscribe) {
    document.addEventListener("turbo:load", () => {
      document
        .querySelectorAll('meta[name="turbo-stream-source"]')
        .forEach((meta) => {
          const topic = meta.getAttribute("content");
          const isPrivate = meta.getAttribute("data-private") === "true";
          if (topic) {
            turboStreams.subscribe(topic, { private: isPrivate });
          }
        });
    });
  }

  if (enableFlash) {
    const flashManager = new FlashManager();
    flashManager.initialize();
    window.flashManager = flashManager;
  }

  console.log("[Turbo] Initialized successfully");

  return {
    socket,
    turboStreams,
    Turbo,
  };
}

export { Turbo, TurboStreamsManager, FlashManager };
export default { initializeTurbo, Turbo, TurboStreamsManager, FlashManager };
