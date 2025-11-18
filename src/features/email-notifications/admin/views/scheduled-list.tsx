/**
 * Scheduled Emails List View
 *
 * Lists all scheduled emails with filters.
 */

import type { FC } from "hono/jsx";
import { BaseLayout } from "@/shared/layouts/BaseLayout.js";
import { EmailStatusBadge } from "../components/EmailStatusBadge.js";

export const ScheduledListView: FC = () => {
	return (
		<BaseLayout title="Scheduled Emails - Admin">
			<div class="min-h-screen bg-gray-50">
				<div
					class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
					x-data="scheduledList()"
					x-init="loadScheduled()"
				>
					{/* Header */}
					<div class="mb-8 flex items-center justify-between">
						<div>
							<h1 class="text-3xl font-bold text-gray-900">Scheduled Emails</h1>
							<p class="mt-2 text-sm text-gray-600">
								View and manage scheduled emails
							</p>
						</div>
						<a
							href="/admin/emails/scheduled/new"
							class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
						>
							Schedule Email
						</a>
					</div>

					{/* Filters */}
					<div class="mb-6 flex gap-4">
						<select
							x-model="statusFilter"
							x-on:change="filterScheduled()"
							class="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="all">All Status</option>
							<option value="pending">Pending</option>
							<option value="sent">Sent</option>
							<option value="failed">Failed</option>
							<option value="cancelled">Cancelled</option>
						</select>
						<select
							x-model="typeFilter"
							x-on:change="filterScheduled()"
							class="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="all">All Types</option>
							<option value="notification">Notification</option>
							<option value="marketing">Marketing</option>
						</select>
					</div>

					{/* Scheduled Emails Table */}
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
										Scheduled For
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								<template x-for="email in filteredScheduled" x-bind:key="email.id">
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
											<span x-text="new Date(email.scheduledFor).toLocaleString()"></span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span
												x-bind:class="{
													'bg-green-100 text-green-800': email.status === 'sent',
													'bg-yellow-100 text-yellow-800': email.status === 'pending',
													'bg-red-100 text-red-800': email.status === 'failed',
													'bg-gray-100 text-gray-800': email.status === 'cancelled'
												}"
												class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
												x-text="email.status"
											></span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<button
												x-show="email.status === 'pending'"
												x-on:click="cancelScheduled(email.id)"
												class="text-red-600 hover:text-red-900"
											>
												Cancel
											</button>
										</td>
									</tr>
								</template>
							</tbody>
						</table>

						{/* Empty State */}
						<div x-show="filteredScheduled.length === 0" class="text-center py-12">
							<p class="text-gray-500">No scheduled emails found</p>
						</div>
					</div>
				</div>
			</div>
		</BaseLayout>
	);
};
