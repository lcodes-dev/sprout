/**
 * Toggle Switch Component
 *
 * Accessible toggle switch for feature flag active status
 */

import type { FC } from "hono/jsx";

export const ToggleSwitch: FC = () => {
	return (
		<button
			type="button"
			x-on:click="toggleActive"
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			x-bind:class="active ? 'bg-blue-600' : 'bg-gray-200'"
			role="switch"
			x-bind:aria-checked="active"
		>
			<span class="sr-only">Toggle feature flag</span>
			<span
				class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
				x-bind:class="active ? 'translate-x-6' : 'translate-x-1'"
			></span>
		</button>
	);
};
