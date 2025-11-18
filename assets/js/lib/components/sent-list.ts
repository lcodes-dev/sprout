/**
 * Sent List Alpine.js Component
 *
 * Manages sent emails list state and filtering.
 */

export function sentList() {
	return {
		sent: [],
		filteredSent: [],
		searchQuery: "",
		statusFilter: "all",
		typeFilter: "all",
		loading: false,

		async loadSent() {
			this.loading = true;

			try {
				const response = await fetch("/admin/emails/api/sent");
				if (response.ok) {
					this.sent = await response.json();
					this.filterSent();
				}
			} catch (error) {
				console.error("Error loading sent emails:", error);
			} finally {
				this.loading = false;
			}
		},

		filterSent() {
			this.filteredSent = this.sent.filter((email: { recipientEmail: string; deliveryStatus: string; emailType: string }) => {
				const matchesSearch =
					this.searchQuery === "" ||
					email.recipientEmail
						.toLowerCase()
						.includes(this.searchQuery.toLowerCase());
				const matchesStatus =
					this.statusFilter === "all" ||
					email.deliveryStatus === this.statusFilter;
				const matchesType =
					this.typeFilter === "all" || email.emailType === this.typeFilter;

				return matchesSearch && matchesStatus && matchesType;
			});
		},
	};
}
