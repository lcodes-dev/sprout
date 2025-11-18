/**
 * Schedule Email Form Alpine.js Component
 *
 * Manages email scheduling form state.
 */

export function scheduleEmailForm() {
	return {
		templates: [],
		selectedTemplateId: "",
		formData: {
			recipientEmail: "",
			recipientName: "",
			emailType: "notification",
			subject: "",
			bodyHtml: "",
			bodyText: "",
			scheduledFor: "",
		},
		loading: false,
		error: null,

		async loadTemplates() {
			try {
				const response = await fetch("/admin/emails/api/templates");
				if (response.ok) {
					this.templates = await response.json();
				}
			} catch (error) {
				console.error("Error loading templates:", error);
			}
		},

		async loadTemplate() {
			if (!this.selectedTemplateId) {
				return;
			}

			this.loading = true;

			try {
				const response = await fetch(
					`/admin/emails/api/templates/${this.selectedTemplateId}`,
				);
				if (response.ok) {
					const template = await response.json();
					this.formData.subject = template.subject;
					this.formData.bodyHtml = template.bodyHtml;
					this.formData.bodyText = template.bodyText || "";
					this.formData.emailType = template.category;
				}
			} catch (error) {
				console.error("Error loading template:", error);
			} finally {
				this.loading = false;
			}
		},

		async submitForm() {
			this.loading = true;
			this.error = null;

			try {
				const formData = new FormData();
				if (this.selectedTemplateId) {
					formData.append("templateId", this.selectedTemplateId);
				}
				formData.append("recipientEmail", this.formData.recipientEmail);
				formData.append("recipientName", this.formData.recipientName);
				formData.append("emailType", this.formData.emailType);
				formData.append("subject", this.formData.subject);
				formData.append("bodyHtml", this.formData.bodyHtml);
				formData.append("bodyText", this.formData.bodyText);
				formData.append("scheduledFor", this.formData.scheduledFor);

				const response = await fetch("/admin/emails/scheduled", {
					method: "POST",
					body: formData,
				});

				if (response.ok) {
					// Redirect to scheduled list
					window.location.href = "/admin/emails/scheduled";
				} else {
					const data = await response.json();
					this.error = data.error || "Failed to schedule email";
				}
			} catch (error) {
				console.error("Error submitting form:", error);
				this.error = "Failed to schedule email";
			} finally {
				this.loading = false;
			}
		},
	};
}
