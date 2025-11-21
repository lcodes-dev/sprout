/**
 * Feature Flags Management Page
 *
 * Main admin page for viewing and managing feature flags
 */

import type { FC } from "hono/jsx";
import { BaseLayout } from "@/shared/layouts/BaseLayout";
import type { FeatureFlag } from "@/db/schema/feature-flags.js";
import { FeatureFlagTable } from "../components/FeatureFlagTable";
import { CreateFlagModal } from "../components/CreateFlagModal";

interface FeatureFlagsPageProps {
	flags: FeatureFlag[];
}

export const FeatureFlagsPage: FC<FeatureFlagsPageProps> = ({ flags }) => {
	return (
		<BaseLayout title="Feature Flags - Admin">
			<div
				class="min-h-screen bg-gray-50 p-6"
				x-data="{ showCreateModal: false }"
			>
				<div class="max-w-7xl mx-auto">
					{/* Page Header */}
					<div class="mb-8">
						<h1 class="text-3xl font-bold text-gray-900 mb-2">
							Feature Flags
						</h1>
						<p class="text-gray-600">
							Manage feature rollouts and control access to new functionality
						</p>
					</div>

					{/* Actions Bar */}
					<div class="mb-6 flex justify-between items-center">
						<div class="text-sm text-gray-500">
							{flags.length} {flags.length === 1 ? "flag" : "flags"} total
						</div>
						<button
							type="button"
							class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
							x-on:click="showCreateModal = true"
						>
							+ Create New Flag
						</button>
					</div>

					{/* Feature Flags Table */}
					<FeatureFlagTable flags={flags} />

					{/* Create Flag Modal */}
					<CreateFlagModal />
				</div>
			</div>
		</BaseLayout>
	);
};
