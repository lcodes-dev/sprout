/**
 * Feature Flag Table Component
 *
 * Displays all feature flags in a table format
 */

import type { FC } from "hono/jsx";
import type { FeatureFlag } from "@/db/schema/feature-flags.js";
import { FeatureFlagRow } from "./FeatureFlagRow";

interface FeatureFlagTableProps {
	flags: FeatureFlag[];
}

export const FeatureFlagTable: FC<FeatureFlagTableProps> = ({ flags }) => {
	if (flags.length === 0) {
		return (
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
				<div class="text-gray-400 mb-4">
					<svg
						class="mx-auto h-12 w-12"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900 mb-2">
					No feature flags yet
				</h3>
				<p class="text-gray-500 mb-4">
					Get started by creating your first feature flag
				</p>
				<button
					type="button"
					class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
					x-on:click="showCreateModal = true"
				>
					Create First Flag
				</button>
			</div>
		);
	}

	return (
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Key
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Status
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Rollout
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Last Updated
						</th>
						<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{flags.map((flag) => (
						<FeatureFlagRow key={flag.id} flag={flag} />
					))}
				</tbody>
			</table>
		</div>
	);
};
