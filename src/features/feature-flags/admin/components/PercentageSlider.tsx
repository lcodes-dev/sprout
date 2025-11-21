/**
 * Percentage Slider Component
 *
 * Slider for adjusting feature flag rollout percentage
 */

import type { FC } from "hono/jsx";

export const PercentageSlider: FC = () => {
	return (
		<div class="flex items-center space-x-3 min-w-[200px]">
			<input
				type="range"
				min="0"
				max="100"
				step="1"
				class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
				x-model="percentage"
				x-on:change="updatePercentage"
			/>
			<div class="w-12 text-right">
				<span class="text-sm font-medium text-gray-900" x-text="`${percentage}%`"></span>
			</div>
		</div>
	);
};
