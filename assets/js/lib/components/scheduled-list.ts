/**
 * Scheduled List Alpine.js Component
 *
 * Manages scheduled emails list state and filtering.
 */

export function scheduledList() {
	return {
		scheduled: [],
		filteredScheduled: [],
		statusFilter: "all",
		typeFilter: "all",
		loading: false,

		async loadScheduled() {
			this.loading = true;

			try {
				const response = await fetch("/admin/emails/api/scheduled");
				if (response.ok) {
					this.scheduled = await response.json();
					this.filterScheduled();
				}
			} catch (error) {
				console.error("Error loading scheduled emails:", error);
			} finally {
				this.loading = false;
			}
		},

		filterScheduled() {
			this.filteredScheduled = this.scheduled.filter((email: { status: string; emailType: string }) => {
				const matchesStatus =
					this.statusFilter === "all" || email.status === this.statusFilter;
				const matchesType =
					this.typeFilter === "all" || email.emailType === this.typeFilter;

				return matchesStatus && matchesType;
			});
		},

		async cancelScheduled(id: number) {
			if (!confirm("Are you sure you want to cancel this scheduled email?")) {
				return;
			}

			try {
				const response = await fetch(`/admin/emails/scheduled/${id}`, {
					method: "DELETE",
				});

				if (response.ok) {
					// Reload scheduled emails
					await this.loadScheduled();
				} else {
					alert("Failed to cancel scheduled email");
				}
			} catch (error) {
				console.error("Error cancelling scheduled email:", error);
				alert("Failed to cancel scheduled email");
			}
		},
	};
}
