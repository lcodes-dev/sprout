/**
 * Template Form Alpine.js Component
 *
 * Manages template creation and editing form state.
 */

export function templateForm(templateId: number | null = null) {
	return {
		formData: {
			name: "",
			subject: "",
			bodyHtml: "",
			bodyText: "",
			category: "notification",
		},
		showPreview: false,
		loading: false,
		error: null,
		isEdit: templateId !== null,

		async init() {
			if (this.isEdit && templateId) {
				await this.loadTemplate(templateId);
			}
		},

		async loadTemplate(id: number) {
			this.loading = true;

			try {
				const response = await fetch(`/admin/emails/api/templates/${id}`);
				if (response.ok) {
					const template = await response.json();
					this.formData = {
						name: template.name,
						subject: template.subject,
						bodyHtml: template.bodyHtml,
						bodyText: template.bodyText || "",
						category: template.category,
					};
				}
			} catch (error) {
				console.error("Error loading template:", error);
				this.error = "Failed to load template";
			} finally {
				this.loading = false;
			}
		},

		async submitForm() {
			this.loading = true;
			this.error = null;

			try {
				const url = this.isEdit
					? `/admin/emails/templates/${templateId}`
					: "/admin/emails/templates";
				const method = this.isEdit ? "PUT" : "POST";

				const formData = new FormData();
				formData.append("name", this.formData.name);
				formData.append("subject", this.formData.subject);
				formData.append("bodyHtml", this.formData.bodyHtml);
				formData.append("bodyText", this.formData.bodyText);
				formData.append("category", this.formData.category);

				const response = await fetch(url, {
					method,
					body: formData,
				});

				if (response.ok) {
					// Redirect to template list
					window.location.href = "/admin/emails/templates";
				} else {
					const data = await response.json();
					this.error = data.error || "Failed to save template";
				}
			} catch (error) {
				console.error("Error submitting form:", error);
				this.error = "Failed to save template";
			} finally {
				this.loading = false;
			}
		},
	};
}
