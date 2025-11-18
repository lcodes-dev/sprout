/**
 * Template List Alpine.js Component
 *
 * Manages template list state, filtering, and actions.
 */

export function templateList() {
	return {
		templates: [],
		filteredTemplates: [],
		searchQuery: "",
		categoryFilter: "all",
		loading: false,

		async loadTemplates() {
			this.loading = true;

			try {
				// In a real implementation, this would fetch from an API
				// For now, we'll use a placeholder
				const response = await fetch("/admin/emails/api/templates");
				if (response.ok) {
					this.templates = await response.json();
					this.filterTemplates();
				}
			} catch (error) {
				console.error("Error loading templates:", error);
			} finally {
				this.loading = false;
			}
		},

		filterTemplates() {
			this.filteredTemplates = this.templates.filter((template: { name: string; category: string }) => {
				const matchesSearch =
					this.searchQuery === "" ||
					template.name.toLowerCase().includes(this.searchQuery.toLowerCase());
				const matchesCategory =
					this.categoryFilter === "all" ||
					template.category === this.categoryFilter;

				return matchesSearch && matchesCategory;
			});
		},

		async deleteTemplate(id: number) {
			if (!confirm("Are you sure you want to delete this template?")) {
				return;
			}

			try {
				const response = await fetch(`/admin/emails/templates/${id}`, {
					method: "DELETE",
				});

				if (response.ok) {
					// Remove from local state
					this.templates = this.templates.filter((t: { id: number }) => t.id !== id);
					this.filterTemplates();
				} else {
					alert("Failed to delete template");
				}
			} catch (error) {
				console.error("Error deleting template:", error);
				alert("Failed to delete template");
			}
		},
	};
}
