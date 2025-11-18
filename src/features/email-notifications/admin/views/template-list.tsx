/**
 * Template List View
 *
 * Lists all email templates with search and filter functionality.
 */

import type { FC } from "hono/jsx";
import { BaseLayout } from "@/shared/layouts/BaseLayout.js";

export const TemplateListView: FC = () => {
	return (
		<BaseLayout title="Email Templates - Admin">
			<div class="min-h-screen bg-gray-50">
				<div
					class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
					x-data="templateList()"
					x-init="loadTemplates()"
				>
					{/* Header */}
					<div class="mb-8 flex items-center justify-between">
						<div>
							<h1 class="text-3xl font-bold text-gray-900">Email Templates</h1>
							<p class="mt-2 text-sm text-gray-600">
								Manage your email templates
							</p>
						</div>
						<a
							href="/admin/emails/templates/new"
							class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
						>
							Create Template
						</a>
					</div>

					{/* Search and Filters */}
					<div class="mb-6 flex gap-4">
						<div class="flex-1">
							<input
								type="text"
								x-model="searchQuery"
								x-on:input="filterTemplates()"
								placeholder="Search templates..."
								class="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						<select
							x-model="categoryFilter"
							x-on:change="filterTemplates()"
							class="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="all">All Categories</option>
							<option value="notification">Notification</option>
							<option value="marketing">Marketing</option>
						</select>
					</div>

					{/* Templates Table */}
					<div class="bg-white shadow rounded-lg overflow-hidden">
						<table class="min-w-full divide-y divide-gray-200">
							<thead class="bg-gray-50">
								<tr>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Name
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Subject
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Category
									</th>
									<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Created
									</th>
									<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody class="bg-white divide-y divide-gray-200">
								<template x-for="template in filteredTemplates" x-bind:key="template.id">
									<tr>
										<td class="px-6 py-4 whitespace-nowrap">
											<div class="text-sm font-medium text-gray-900" x-text="template.name"></div>
										</td>
										<td class="px-6 py-4">
											<div class="text-sm text-gray-900" x-text="template.subject"></div>
										</td>
										<td class="px-6 py-4 whitespace-nowrap">
											<span
												x-bind:class="{
													'bg-blue-100 text-blue-800': template.category === 'notification',
													'bg-green-100 text-green-800': template.category === 'marketing'
												}"
												class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
												x-text="template.category"
											></span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											<span x-text="new Date(template.createdAt).toLocaleDateString()"></span>
										</td>
										<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<a
												x-bind:href="`/admin/emails/templates/${template.id}/edit`"
												class="text-blue-600 hover:text-blue-900 mr-4"
											>
												Edit
											</a>
											<button
												x-on:click="deleteTemplate(template.id)"
												class="text-red-600 hover:text-red-900"
											>
												Delete
											</button>
										</td>
									</tr>
								</template>
							</tbody>
						</table>

						{/* Empty State */}
						<div x-show="filteredTemplates.length === 0" class="text-center py-12">
							<p class="text-gray-500">No templates found</p>
						</div>
					</div>
				</div>
			</div>
		</BaseLayout>
	);
};
