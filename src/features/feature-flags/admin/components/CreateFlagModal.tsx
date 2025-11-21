/**
 * Create Flag Modal Component
 *
 * Modal dialog for creating a new feature flag
 */

import type { FC } from "hono/jsx";

export const CreateFlagModal: FC = () => {
	return (
		<div
			x-show="showCreateModal"
			x-cloak
			class="fixed inset-0 z-50 overflow-y-auto"
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal="true"
		>
			{/* Backdrop */}
			<div
				class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
				x-show="showCreateModal"
				x-transition:enter="ease-out duration-300"
				x-transition:enter-start="opacity-0"
				x-transition:enter-end="opacity-100"
				x-transition:leave="ease-in duration-200"
				x-transition:leave-start="opacity-100"
				x-transition:leave-end="opacity-0"
				x-on:click="showCreateModal = false"
			></div>

			{/* Modal Panel */}
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div
					class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
					x-show="showCreateModal"
					x-transition:enter="ease-out duration-300"
					x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
					x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100"
					x-transition:leave="ease-in duration-200"
					x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100"
					x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
					x-data={`{
						key: '',
						active: true,
						percentage: 0,
						error: '',
						async createFlag() {
							if (!this.key.trim()) {
								this.error = 'Flag key is required';
								return;
							}

							if (this.percentage < 0 || this.percentage > 100) {
								this.error = 'Percentage must be between 0 and 100';
								return;
							}

							try {
								const response = await fetch('/admin/feature-flags', {
									method: 'POST',
									headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
									body: new URLSearchParams({
										key: this.key,
										active: this.active.toString(),
										percentage: this.percentage.toString()
									})
								});

								if (response.ok) {
									window.location.reload();
								} else {
									const data = await response.json();
									this.error = data.error || 'Failed to create flag';
								}
							} catch (error) {
								this.error = 'Failed to create flag';
							}
						}
					}`}
				>
					<div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
						<div class="sm:flex sm:items-start">
							<div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
								<h3
									class="text-lg font-semibold leading-6 text-gray-900 mb-4"
									id="modal-title"
								>
									Create New Feature Flag
								</h3>

								{/* Error Message */}
								<div
									x-show="error"
									class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
								>
									<span x-text="error"></span>
								</div>

								<form x-on:submit.prevent="createFlag" class="space-y-4">
									{/* Key Input */}
									<div>
										<label
											for="flag-key"
											class="block text-sm font-medium text-gray-700 mb-1"
										>
											Flag Key <span class="text-red-500">*</span>
										</label>
										<input
											type="text"
											id="flag-key"
											x-model="key"
											class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											placeholder="new_feature_name"
											required
										/>
										<p class="mt-1 text-xs text-gray-500">
											Use lowercase letters, numbers, and underscores
										</p>
									</div>

									{/* Active Checkbox */}
									<div>
										<label class="flex items-center">
											<input
												type="checkbox"
												x-model="active"
												class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
											/>
											<span class="ml-2 text-sm text-gray-700">
												Active by default
											</span>
										</label>
									</div>

									{/* Percentage Slider */}
									<div>
										<label
											for="flag-percentage"
											class="block text-sm font-medium text-gray-700 mb-1"
										>
											Rollout Percentage: <span x-text="`${percentage}%`"></span>
										</label>
										<input
											type="range"
											id="flag-percentage"
											min="0"
											max="100"
											step="1"
											x-model="percentage"
											class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
										/>
										<div class="flex justify-between text-xs text-gray-500 mt-1">
											<span>0%</span>
											<span>50%</span>
											<span>100%</span>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>

					{/* Modal Actions */}
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button
							type="button"
							x-on:click="createFlag"
							class="inline-flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto transition-colors"
						>
							Create Flag
						</button>
						<button
							type="button"
							x-on:click="showCreateModal = false"
							class="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors"
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
