/**
 * Template Form View
 *
 * Form for creating and editing email templates.
 */

import type { FC } from "hono/jsx";
import { BaseLayout } from "@/shared/layouts/BaseLayout.js";

interface TemplateFormViewProps {
	mode: "create" | "edit";
	templateId?: number;
}

export const TemplateFormView: FC<TemplateFormViewProps> = ({
	mode,
	templateId,
}) => {
	const isEdit = mode === "edit";
	const title = isEdit ? "Edit Template" : "Create Template";

	return (
		<BaseLayout title={`${title} - Admin`}>
			<div class="min-h-screen bg-gray-50">
				<div
					class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
					x-data={`templateForm(${isEdit ? templateId : "null"})`}
					x-init="init()"
				>
					{/* Header */}
					<div class="mb-8">
						<h1 class="text-3xl font-bold text-gray-900">{title}</h1>
						<p class="mt-2 text-sm text-gray-600">
							{isEdit
								? "Update your email template"
								: "Create a new email template"}
						</p>
					</div>

					{/* Form */}
					<form
						x-on:submit.prevent="submitForm()"
						class="bg-white shadow rounded-lg p-6 space-y-6"
					>
						{/* Name */}
						<div>
							<label
								for="name"
								class="block text-sm font-medium text-gray-700 mb-2"
							>
								Template Name *
							</label>
							<input
								type="text"
								id="name"
								name="name"
								x-model="formData.name"
								required
								class="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								placeholder="e.g., Welcome Email"
							/>
						</div>

						{/* Category */}
						<div>
							<label
								for="category"
								class="block text-sm font-medium text-gray-700 mb-2"
							>
								Category *
							</label>
							<select
								id="category"
								name="category"
								x-model="formData.category"
								required
								class="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="notification">Notification</option>
								<option value="marketing">Marketing</option>
							</select>
							<p class="mt-1 text-sm text-gray-500">
								Marketing emails require user consent
							</p>
						</div>

						{/* Subject */}
						<div>
							<label
								for="subject"
								class="block text-sm font-medium text-gray-700 mb-2"
							>
								Subject Line *
							</label>
							<input
								type="text"
								id="subject"
								name="subject"
								x-model="formData.subject"
								required
								class="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								placeholder="e.g., Welcome to our platform!"
							/>
						</div>

						{/* HTML Body */}
						<div>
							<label
								for="bodyHtml"
								class="block text-sm font-medium text-gray-700 mb-2"
							>
								HTML Body *
							</label>
							<textarea
								id="bodyHtml"
								name="bodyHtml"
								x-model="formData.bodyHtml"
								required
								rows={12}
								class="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
								placeholder="<h1>Welcome!</h1>"
							></textarea>
							<p class="mt-1 text-sm text-gray-500">
								HTML content for the email body
							</p>
						</div>

						{/* Text Body */}
						<div>
							<label
								for="bodyText"
								class="block text-sm font-medium text-gray-700 mb-2"
							>
								Plain Text Body (optional)
							</label>
							<textarea
								id="bodyText"
								name="bodyText"
								x-model="formData.bodyText"
								rows={8}
								class="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
								placeholder="Welcome to our platform!"
							></textarea>
							<p class="mt-1 text-sm text-gray-500">
								Fallback for email clients that don't support HTML
							</p>
						</div>

						{/* Preview Toggle */}
						<div>
							<button
								type="button"
								x-on:click="showPreview = !showPreview"
								class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
							>
								<span x-text="showPreview ? 'Hide Preview' : 'Show Preview'"></span>
							</button>
						</div>

						{/* Preview */}
						<div x-show="showPreview" class="border border-gray-300 rounded-md p-4">
							<h3 class="text-lg font-medium text-gray-900 mb-4">Preview</h3>
							<div class="border-b border-gray-200 pb-4 mb-4">
								<p class="text-sm text-gray-600">Subject:</p>
								<p class="text-lg font-medium" x-text="formData.subject"></p>
							</div>
							<div
								class="prose max-w-none"
								x-html="formData.bodyHtml"
							></div>
						</div>

						{/* Actions */}
						<div class="flex items-center justify-between pt-6 border-t border-gray-200">
							<a
								href="/admin/emails/templates"
								class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
							>
								Cancel
							</a>
							<button
								type="submit"
								x-bind:disabled="loading"
								class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
							>
								<span x-text="loading ? 'Saving...' : (isEdit ? 'Update Template' : 'Create Template')"></span>
							</button>
						</div>

						{/* Error Message */}
						<div x-show="error" class="rounded-md bg-red-50 p-4">
							<p class="text-sm text-red-800" x-text="error"></p>
						</div>
					</form>
				</div>
			</div>
		</BaseLayout>
	);
};
