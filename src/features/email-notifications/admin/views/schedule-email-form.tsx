/**
 * Schedule Email Form View
 *
 * Form for scheduling a new email.
 */

import type { FC } from "hono/jsx";
import { BaseLayout } from "@/shared/layouts/BaseLayout.js";

export const ScheduleEmailFormView: FC = () => {
	return (
		<BaseLayout title="Schedule Email - Admin">
			<div class="min-h-screen bg-gray-50">
				<div
					class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
					x-data="scheduleEmailForm()"
					x-init="loadTemplates()"
				>
					{/* Header */}
					<div class="mb-8">
						<h1 class="text-3xl font-bold text-gray-900">Schedule Email</h1>
						<p class="mt-2 text-sm text-gray-600">
							Schedule an email to be sent at a specific time
						</p>
					</div>

					{/* Form */}
					<form
						x-on:submit.prevent="submitForm()"
						class="bg-white shadow rounded-lg p-6 space-y-6"
					>
						{/* Template Selector */}
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">
								Use Template (optional)
							</label>
							<select
								x-model="selectedTemplateId"
								x-on:change="loadTemplate()"
								class="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">Start from scratch</option>
								<template x-for="template in templates" x-bind:key="template.id">
									<option x-bind:value="template.id" x-text="template.name"></option>
								</template>
							</select>
						</div>

						{/* Recipient Email */}
						<div>
							<label
								for="recipientEmail"
								class="block text-sm font-medium text-gray-700 mb-2"
							>
								Recipient Email *
							</label>
							<input
								type="email"
								id="recipientEmail"
								name="recipientEmail"
								x-model="formData.recipientEmail"
								required
								class="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								placeholder="user@example.com"
							/>
						</div>

						{/* Recipient Name */}
						<div>
							<label
								for="recipientName"
								class="block text-sm font-medium text-gray-700 mb-2"
							>
								Recipient Name (optional)
							</label>
							<input
								type="text"
								id="recipientName"
								name="recipientName"
								x-model="formData.recipientName"
								class="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								placeholder="John Doe"
							/>
						</div>

						{/* Email Type */}
						<div>
							<label
								for="emailType"
								class="block text-sm font-medium text-gray-700 mb-2"
							>
								Email Type *
							</label>
							<select
								id="emailType"
								name="emailType"
								x-model="formData.emailType"
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
							></textarea>
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
							></textarea>
						</div>

						{/* Scheduled For */}
						<div>
							<label
								for="scheduledFor"
								class="block text-sm font-medium text-gray-700 mb-2"
							>
								Schedule For *
							</label>
							<input
								type="datetime-local"
								id="scheduledFor"
								name="scheduledFor"
								x-model="formData.scheduledFor"
								required
								class="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							/>
							<p class="mt-1 text-sm text-gray-500">
								Email will be sent at this time
							</p>
						</div>

						{/* Actions */}
						<div class="flex items-center justify-between pt-6 border-t border-gray-200">
							<a
								href="/admin/emails/scheduled"
								class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
							>
								Cancel
							</a>
							<button
								type="submit"
								x-bind:disabled="loading"
								class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
							>
								<span x-text="loading ? 'Scheduling...' : 'Schedule Email'"></span>
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
