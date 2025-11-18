/**
 * Email Dashboard Alpine.js Component
 *
 * Manages dashboard state and data fetching.
 */

export function emailDashboard() {
	return {
		stats: {
			totalSent: 0,
			totalDelivered: 0,
			totalBounced: 0,
			totalFailed: 0,
			totalOpened: 0,
			totalClicked: 0,
			deliveryRate: 0,
			openRate: 0,
			clickRate: 0,
			byType: {
				notification: { sent: 0, delivered: 0 },
				marketing: { sent: 0, delivered: 0 },
			},
		},
		recentActivity: [],
		loading: false,
		error: null,

		async loadStats() {
			this.loading = true;
			this.error = null;

			try {
				const response = await fetch("/admin/emails/analytics?days=30");
				if (!response.ok) {
					throw new Error("Failed to load analytics");
				}

				const data = await response.json();
				this.stats = data.stats;
				this.recentActivity = data.recentActivity || [];
			} catch (error) {
				console.error("Error loading stats:", error);
				this.error = error.message;
			} finally {
				this.loading = false;
			}
		},
	};
}
