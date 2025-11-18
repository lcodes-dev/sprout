/**
 * Email Dashboard View
 *
 * Main dashboard for email notification system.
 */

import type { FC } from "hono/jsx";
import { BaseLayout } from "@/shared/layouts/BaseLayout.js";
import { EmailStatsCard } from "../components/EmailStatsCard.js";

export const DashboardView: FC = () => {
	return (
		<BaseLayout title="Email Dashboard - Admin">
			<div class="min-h-screen bg-gray-50">
				<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Header */}
					<div class="mb-8">
						<h1 class="text-3xl font-bold text-gray-900">Email Dashboard</h1>
						<p class="mt-2 text-sm text-gray-600">
							Monitor and manage your email campaigns
						</p>
					</div>

					{/* Quick Actions */}
					<div class="mb-8 flex gap-4">
						<a
							href="/admin/emails/scheduled/new"
							class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
						>
							Schedule Email
						</a>
						<a
							href="/admin/emails/templates/new"
							class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
						>
							Create Template
						</a>
					</div>

					{/* Stats Grid */}
					<div
						class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
						x-data="emailDashboard()"
						x-init="loadStats()"
					>
						<EmailStatsCard
							title="Total Sent"
							value="<span x-text='stats.totalSent'>0</span>"
							icon="📧"
						/>
						<EmailStatsCard
							title="Delivery Rate"
							value="<span x-text='stats.deliveryRate'>0</span>%"
							icon="✅"
						/>
						<EmailStatsCard
							title="Open Rate"
							value="<span x-text='stats.openRate'>0</span>%"
							icon="👁️"
						/>
						<EmailStatsCard
							title="Click Rate"
							value="<span x-text='stats.clickRate'>0</span>%"
							icon="👆"
						/>
					</div>

					{/* Charts */}
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
						{/* Volume Chart */}
						<div
							class="bg-white rounded-lg shadow p-6"
							x-data="emailVolumeChart()"
							x-init="initChart()"
						>
							<h3 class="text-lg font-medium text-gray-900 mb-4">
								Email Volume (Last 30 Days)
							</h3>
							<div x-ref="chartContainer" class="h-64"></div>
						</div>

						{/* Performance by Type */}
						<div class="bg-white rounded-lg shadow p-6">
							<h3 class="text-lg font-medium text-gray-900 mb-4">
								Performance by Type
							</h3>
							<div class="space-y-4" x-data="emailDashboard()">
								<div>
									<div class="flex items-center justify-between mb-2">
										<span class="text-sm font-medium text-gray-700">
											Notification Emails
										</span>
										<span
											class="text-sm text-gray-600"
											x-text="stats.byType.notification.sent"
										>
											0
										</span>
									</div>
									<div class="w-full bg-gray-200 rounded-full h-2">
										<div
											class="bg-blue-600 h-2 rounded-full"
											x-bind:style="`width: ${(stats.byType.notification.delivered / stats.byType.notification.sent * 100) || 0}%`"
										></div>
									</div>
								</div>
								<div>
									<div class="flex items-center justify-between mb-2">
										<span class="text-sm font-medium text-gray-700">
											Marketing Emails
										</span>
										<span
											class="text-sm text-gray-600"
											x-text="stats.byType.marketing.sent"
										>
											0
										</span>
									</div>
									<div class="w-full bg-gray-200 rounded-full h-2">
										<div
											class="bg-green-600 h-2 rounded-full"
											x-bind:style="`width: ${(stats.byType.marketing.delivered / stats.byType.marketing.sent * 100) || 0}%`"
										></div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Recent Activity */}
					<div
						class="bg-white rounded-lg shadow"
						x-data="emailDashboard()"
						x-init="loadStats()"
					>
						<div class="px-6 py-4 border-b border-gray-200">
							<h3 class="text-lg font-medium text-gray-900">Recent Activity</h3>
						</div>
						<div class="divide-y divide-gray-200">
							<template x-for="email in recentActivity" x-bind:key="email.id">
								<div class="px-6 py-4 flex items-center justify-between">
									<div class="flex-1">
										<p class="text-sm font-medium text-gray-900" x-text="email.subject"></p>
										<p class="text-sm text-gray-500">
											To: <span x-text="email.recipientEmail"></span>
										</p>
									</div>
									<div class="flex items-center gap-4">
										<span
											class="text-sm text-gray-500"
											x-text="new Date(email.sentAt).toLocaleDateString()"
										></span>
										<span
											x-bind:class="{
												'bg-green-100 text-green-800': email.deliveryStatus === 'delivered',
												'bg-yellow-100 text-yellow-800': email.deliveryStatus === 'sent',
												'bg-red-100 text-red-800': email.deliveryStatus === 'failed'
											}"
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
											x-text="email.deliveryStatus"
										></span>
									</div>
								</div>
							</template>
						</div>
					</div>

					{/* Navigation Links */}
					<div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
						<a
							href="/admin/emails/templates"
							class="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
						>
							<h4 class="text-lg font-medium text-gray-900 mb-2">Templates</h4>
							<p class="text-sm text-gray-600">
								Manage your email templates
							</p>
						</a>
						<a
							href="/admin/emails/scheduled"
							class="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
						>
							<h4 class="text-lg font-medium text-gray-900 mb-2">
								Scheduled Emails
							</h4>
							<p class="text-sm text-gray-600">
								View and manage scheduled emails
							</p>
						</a>
						<a
							href="/admin/emails/sent"
							class="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
						>
							<h4 class="text-lg font-medium text-gray-900 mb-2">
								Sent Emails
							</h4>
							<p class="text-sm text-gray-600">View sent email history</p>
						</a>
					</div>
				</div>
			</div>
		</BaseLayout>
	);
};
