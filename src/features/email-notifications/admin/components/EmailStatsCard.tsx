/**
 * Email Stats Card Component
 *
 * Reusable card for displaying email statistics.
 */

import type { FC } from "hono/jsx";

interface EmailStatsCardProps {
	title: string;
	value: string | number;
	subtitle?: string;
	icon?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
}

export const EmailStatsCard: FC<EmailStatsCardProps> = ({
	title,
	value,
	subtitle,
	icon,
	trend,
}) => {
	return (
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex items-center justify-between">
				<div class="flex-1">
					<p class="text-sm font-medium text-gray-600">{title}</p>
					<p class="mt-2 text-3xl font-bold text-gray-900">{value}</p>
					{subtitle && <p class="mt-1 text-sm text-gray-500">{subtitle}</p>}
				</div>
				{icon && (
					<div class="flex-shrink-0">
						<span class="text-3xl">{icon}</span>
					</div>
				)}
			</div>
			{trend && (
				<div class="mt-4">
					<span
						class={`text-sm font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
					>
						{trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
					</span>
					<span class="text-sm text-gray-500 ml-2">vs last period</span>
				</div>
			)}
		</div>
	);
};
