/**
 * Sent Emails List View
 *
 * Historical view of all sent emails with search and filters.
 */

import type { FC } from "hono/jsx";
import { BaseLayout } from "@/shared/layouts/BaseLayout.js";

export const SentListView: FC = () => {
	return (
		<BaseLayout title="Sent Emails - Admin">
			<div class="min-h-screen bg-gray-50">
				<div
					class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
					x-data="sentList()"
					x-init="loadSent()"
				>
					{/* Header */}
					<div class="mb-8">
						<h1 class="text-3xl font-bold text-gray-900">Sent Emails</h1>
						<p class="mt-2 text-sm text-gray-600">
							View history of all sent emails
						</p>
					</div>

					{/* Search and Filters */}
					<div class="mb-6 flex gap-4">
						<div class="flex-1">
							<input
								type="text"
								x-model="searchQuery"
								x-on:input="filterSent()"
								placeholder="Search by recipient email..."
								class="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						<select
							x-model="statusFilter"
							x-on:change="filterSent()"
							class="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="all">All Status</option>
							<option value="sent">Sent</option>
							<option value="delivered">Delivered</option>
							<option value="bounced">Bounced</option>
							<option value="failed">Failed</option>
						</select>
						<select
							x-model="typeFilter"
							x-on:change="filterSent()"
							class="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="all">All Types</option>
							<option value="notification">Notification</option>
							<option value="marketing">Marketing</option>
						</select>
					</div>

					{/* Sent Emails Table */}
					<div class="bg-white shadow rounded-lg overflow-hidden">
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Recipient
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Subject
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Type
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Sent At
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Opened
									</th>
									<th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
										Clicked
									</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								<template x-for="email in filteredSent" x-bind:key="email.id">
									<tr>
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="text-sm font-medium text-gray-900" x-text="email.recipientEmail"></div>
											<div class="text-sm text-gray-500" x-text="email.recipientName"></div>
										</td>
										<td class="px-6 py-4">
											<div class="text-sm text-gray-900" x-text="email.subject"></div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span
												x-bind:class="{
													'bg-blue-100 text-blue-800': email.emailType === 'notification',
													'bg-green-100 text-green-800': email.emailType === 'marketing'
												}"
												class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
												x-text="email.emailType"
											></span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<span x-text="new Date(email.sentAt).toLocaleString()"></span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span
												x-bind:class="{
													'bg-green-100 text-green-800': email.deliveryStatus === 'delivered' || email.deliveryStatus === 'sent',
													'bg-red-100 text-red-800': email.deliveryStatus === 'bounced' || email.deliveryStatus === 'failed'
												}"
												class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
												x-text="email.deliveryStatus"
											></span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
											<span x-show="email.openedAt">✓</span>
											<span x-show="!email.openedAt" class="text-gray-300">—</span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
											<span x-show="email.clickedAt">✓</span>
											<span x-show="!email.clickedAt" class="text-gray-300">—</span>
										</td>
									</tr>
								</template>
							</tbody>
						</table>

						{/* Empty State */}
						<div x-show="filteredSent.length === 0" class="text-center py-12">
							<p class="text-gray-500">No sent emails found</p>
						</div>
					</div>

					{/* Pagination (simplified) */}
					<div class="mt-6 flex items-center justify-between">
						<p class="text-sm text-gray-700">
							Showing <span x-text="filteredSent.length"></span> emails
						</p>
						<div class="flex gap-2">
							<button
								class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
								disabled
							>
								Previous
							</button>
							<button
								class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
								disabled
							>
								Next
							</button>
						</div>
					</div>
				</div>
			</div>
		</BaseLayout>
	);
};
