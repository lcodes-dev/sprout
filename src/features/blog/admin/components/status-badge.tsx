/**
 * Status Badge Component
 *
 * Displays a colored badge for post status (draft/published)
 */

interface StatusBadgeProps {
	status: "draft" | "published";
}

export function StatusBadge({ status }: StatusBadgeProps) {
	const isDraft = status === "draft";

	return (
		<span
			class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
				isDraft
					? "bg-yellow-100 text-yellow-800"
					: "bg-green-100 text-green-800"
			}`}
		>
			{isDraft ? "Draft" : "Published"}
		</span>
	);
}
