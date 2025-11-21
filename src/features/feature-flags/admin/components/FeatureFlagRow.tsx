/**
 * Feature Flag Row Component
 *
 * Individual row for a feature flag with inline editing
 */

import type { FC } from "hono/jsx";
import type { FeatureFlag } from "@/db/schema/feature-flags.js";
import { ToggleSwitch } from "./ToggleSwitch";
import { PercentageSlider } from "./PercentageSlider";

interface FeatureFlagRowProps {
	flag: FeatureFlag;
}

export const FeatureFlagRow: FC<FeatureFlagRowProps> = ({ flag }) => {
	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<tr
			class="hover:bg-gray-50 transition-colors"
			x-data={`{
				flagId: ${flag.id},
				flagKey: '${flag.key}',
				active: ${flag.active},
				percentage: ${flag.percentage},
				showDeleteConfirm: false,
				async toggleActive() {
					const oldValue = this.active;
					this.active = !this.active; // Optimistic update

					try {
						const response = await fetch(\`/admin/feature-flags/\${this.flagId}/toggle\`, {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' }
						});

						if (!response.ok) {
							this.active = oldValue; // Revert on error
							alert('Failed to toggle flag');
						} else {
							// Reload page to refresh data
							window.location.reload();
						}
					} catch (error) {
						this.active = oldValue; // Revert on error
						alert('Failed to toggle flag');
					}
				},
				async updatePercentage() {
					try {
						const response = await fetch(\`/admin/feature-flags/\${this.flagId}/percentage\`, {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: new URLSearchParams({ percentage: this.percentage.toString() })
						});

						if (!response.ok) {
							alert('Failed to update percentage');
							window.location.reload();
						} else {
							// Reload page to refresh data
							window.location.reload();
						}
					} catch (error) {
						alert('Failed to update percentage');
					}
				},
				async deleteFlag() {
					if (!confirm(\`Are you sure you want to delete the feature flag "\${this.flagKey}"?\`)) {
						return;
					}

					try {
						const response = await fetch(\`/admin/feature-flags/\${this.flagId}\`, {
							method: 'DELETE'
						});

						if (response.ok) {
							window.location.reload();
						} else {
							alert('Failed to delete flag');
						}
					} catch (error) {
						alert('Failed to delete flag');
					}
				}
			}`}
		>
			{/* Key */}
			<td class="px-6 py-4 whitespace-nowrap">
				<div class="flex items-center">
					<code class="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
						{flag.key}
					</code>
				</div>
			</td>

			{/* Status Toggle */}
			<td class="px-6 py-4 whitespace-nowrap">
				<ToggleSwitch />
			</td>

			{/* Percentage Slider */}
			<td class="px-6 py-4 whitespace-nowrap">
				<PercentageSlider />
			</td>

			{/* Last Updated */}
			<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
				{formatDate(flag.updatedAt)}
			</td>

			{/* Actions */}
			<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
				<button
					type="button"
					class="text-red-600 hover:text-red-900 transition-colors"
					x-on:click="deleteFlag"
					title="Delete flag"
				>
					<svg
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			</td>
		</tr>
	);
};
