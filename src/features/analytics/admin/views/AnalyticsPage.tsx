/**
 * Analytics Dashboard Page
 *
 * Main analytics dashboard for the admin panel
 */

import type { FC } from "hono/jsx";
import { BaseLayout } from "@/shared/layouts/BaseLayout.js";
import type { AnalyticsStats, Period } from "../../types.js";

interface AnalyticsPageProps {
	stats: AnalyticsStats;
	period: Period;
}

export const AnalyticsPage: FC<AnalyticsPageProps> = ({ stats, period }) => {
	return (
		<BaseLayout title="Analytics Dashboard">
			<div class="min-h-screen bg-gray-50 p-8">
				<div class="max-w-7xl mx-auto">
					{/* Header */}
					<div class="mb-8">
						<h1 class="text-3xl font-bold text-gray-900 mb-2">
							Analytics Dashboard
						</h1>
						<p class="text-gray-600">
							Track your website's performance and visitor statistics
						</p>
					</div>

					{/* Period Selector */}
					<div
						class="mb-8"
						x-data={`{ period: '${period}' }`}
						x-init="$watch('period', value => window.location.href = '/admin/analytics?period=' + value)"
					>
						<div class="inline-flex rounded-lg border border-gray-300 bg-white p-1">
							<button
								x-bind:class="period === '24h' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'"
								x-on:click="period = '24h'"
								class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
							>
								Last 24h
							</button>
							<button
								x-bind:class="period === '7d' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'"
								x-on:click="period = '7d'"
								class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
							>
								Last 7 days
							</button>
							<button
								x-bind:class="period === '30d' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'"
								x-on:click="period = '30d'"
								class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
							>
								Last 30 days
							</button>
							<button
								x-bind:class="period === 'all' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'"
								x-on:click="period = 'all'"
								class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
							>
								All Time
							</button>
						</div>
					</div>

					{/* Stats Cards */}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						<div class="bg-white rounded-lg shadow p-6">
							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm font-medium text-gray-600">Total Views</p>
									<p class="text-3xl font-bold text-gray-900 mt-2">
										{stats.totalViews.toLocaleString()}
									</p>
								</div>
								<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
									<span class="text-blue-600 text-2xl">👁️</span>
								</div>
							</div>
						</div>

						<div class="bg-white rounded-lg shadow p-6">
							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm font-medium text-gray-600">
										Unique Visitors
									</p>
									<p class="text-3xl font-bold text-gray-900 mt-2">
										{stats.uniqueVisitors.toLocaleString()}
									</p>
								</div>
								<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
									<span class="text-green-600 text-2xl">👥</span>
								</div>
							</div>
						</div>
					</div>

					{/* Charts Grid */}
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Top Pages */}
						<div class="bg-white rounded-lg shadow p-6">
							<h2 class="text-lg font-semibold text-gray-900 mb-4">
								Top Pages
							</h2>
							<div class="space-y-3">
								{stats.topPages.slice(0, 5).map((page) => (
									<div class="flex items-center justify-between">
										<span class="text-sm text-gray-700 truncate flex-1">
											{page.path}
										</span>
										<span class="text-sm font-semibold text-gray-900 ml-4">
											{page.views.toLocaleString()}
										</span>
									</div>
								))}
								{stats.topPages.length === 0 && (
									<p class="text-sm text-gray-500">No data available</p>
								)}
							</div>
						</div>

						{/* Browsers */}
						<div class="bg-white rounded-lg shadow p-6">
							<h2 class="text-lg font-semibold text-gray-900 mb-4">
								Browsers
							</h2>
							<div class="space-y-3">
								{stats.browsers.slice(0, 5).map((browser) => {
									const percentage =
										stats.totalViews > 0
											? ((browser.views / stats.totalViews) * 100).toFixed(1)
											: "0";
									return (
										<div>
											<div class="flex items-center justify-between mb-1">
												<span class="text-sm text-gray-700">{browser.browser}</span>
												<span class="text-sm font-semibold text-gray-900">
													{percentage}%
												</span>
											</div>
											<div class="w-full bg-gray-200 rounded-full h-2">
												<div
													class="bg-blue-500 h-2 rounded-full"
													style={`width: ${percentage}%`}
												/>
											</div>
										</div>
									);
								})}
								{stats.browsers.length === 0 && (
									<p class="text-sm text-gray-500">No data available</p>
								)}
							</div>
						</div>

						{/* Traffic Sources */}
						<div class="bg-white rounded-lg shadow p-6">
							<h2 class="text-lg font-semibold text-gray-900 mb-4">
								Traffic Sources
							</h2>
							<div class="space-y-3">
								{stats.referrers.slice(0, 5).map((referrer) => (
									<div class="flex items-center justify-between">
										<span class="text-sm text-gray-700 truncate flex-1">
											{referrer.referrer}
										</span>
										<span class="text-sm font-semibold text-gray-900 ml-4">
											{referrer.views.toLocaleString()}
										</span>
									</div>
								))}
								{stats.referrers.length === 0 && (
									<p class="text-sm text-gray-500">No data available</p>
								)}
							</div>
						</div>

						{/* Placeholder for future chart */}
						<div class="bg-white rounded-lg shadow p-6">
							<h2 class="text-lg font-semibold text-gray-900 mb-4">
								Page Views Over Time
							</h2>
							<div class="flex items-center justify-center h-64 text-gray-400">
								<p class="text-sm">
									Chart visualization available in production build with Chart.js
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</BaseLayout>
	);
};
