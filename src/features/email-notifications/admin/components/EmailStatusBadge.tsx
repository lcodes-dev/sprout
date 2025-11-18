/**
 * Email Status Badge Component
 *
 * Displays status with appropriate styling.
 */

import type { FC } from "hono/jsx";

interface EmailStatusBadgeProps {
	status: "pending" | "sent" | "failed" | "cancelled" | "delivered" | "bounced";
}

export const EmailStatusBadge: FC<EmailStatusBadgeProps> = ({ status }) => {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "sent":
			case "delivered":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "failed":
			case "bounced":
				return "bg-red-100 text-red-800";
			case "cancelled":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<span
			class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
		>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</span>
	);
};
