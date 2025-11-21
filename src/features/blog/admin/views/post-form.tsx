/**
 * Post Form View
 *
 * Admin panel view for creating/editing blog posts
 */

import type { Post } from "@/db/schema/posts.js";
import type { Category } from "@/db/schema/categories.js";
import type { PostAttachment } from "@/db/schema/post-attachments.js";
import { AdminLayout } from "./layout.js";
import { CategorySelect } from "../components/category-select.js";
import { AttachmentUploader } from "../components/attachment-uploader.js";

interface PostFormProps {
	post?: Post;
	categories: Category[];
	attachments?: PostAttachment[];
	errors?: Record<string, string>;
}

export function PostForm({
	post,
	categories,
	attachments = [],
	errors = {},
}: PostFormProps) {
	const isEdit = !!post;
	const title = isEdit ? "Edit Post" : "Create Post";
	const action = isEdit ? `/admin/blog/${post.id}` : "/admin/blog";

	return (
		<AdminLayout title={title}>
			<div class="max-w-4xl">
				<div class="bg-white shadow rounded-lg p-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-6">{title}</h2>

					<form
						method="POST"
						action={action}
						enctype="multipart/form-data"
						x-data={`{
							title: '${post?.title ?? ""}',
							slug: '${post?.slug ?? ""}',
							generateSlug() {
								this.slug = this.title
									.toLowerCase()
									.trim()
									.replace(/\\s+/g, '-')
									.replace(/[^\\w\\-]+/g, '')
									.replace(/\\-\\-+/g, '-')
									.replace(/^-+/, '')
									.replace(/-+$/, '');
							}
						}`}
					>
						{/* Title */}
						<div class="mb-6">
							<label
								for="title"
								class="block text-sm font-medium text-gray-700 mb-1"
							>
								Title <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="title"
								name="title"
								x-model="title"
								x-on:input="generateSlug"
								required
								class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								placeholder="Enter post title"
							/>
							{errors.title && (
								<p class="mt-1 text-sm text-red-600">{errors.title}</p>
							)}
						</div>

						{/* Slug */}
						<div class="mb-6">
							<label
								for="slug"
								class="block text-sm font-medium text-gray-700 mb-1"
							>
								Slug <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="slug"
								name="slug"
								x-model="slug"
								required
								class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
								placeholder="post-url-slug"
							/>
							<p class="mt-1 text-sm text-gray-500">
								URL: /blog/<span x-text="slug || 'post-url-slug'"></span>
							</p>
							{errors.slug && (
								<p class="mt-1 text-sm text-red-600">{errors.slug}</p>
							)}
						</div>

						{/* Excerpt */}
						<div class="mb-6">
							<label
								for="excerpt"
								class="block text-sm font-medium text-gray-700 mb-1"
							>
								Excerpt
							</label>
							<textarea
								id="excerpt"
								name="excerpt"
								rows={3}
								class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								placeholder="Brief summary of the post"
							>{post?.excerpt}</textarea>
							<p class="mt-1 text-sm text-gray-500">
								Short description shown in post listings
							</p>
						</div>

						{/* Content */}
						<div class="mb-6">
							<label
								for="content"
								class="block text-sm font-medium text-gray-700 mb-1"
							>
								Content <span class="text-red-500">*</span>
							</label>
							<textarea
								id="content"
								name="content"
								rows={15}
								required
								class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
								placeholder="Write your post content here..."
							>{post?.content}</textarea>
							{errors.content && (
								<p class="mt-1 text-sm text-red-600">{errors.content}</p>
							)}
						</div>

						{/* Category */}
						<div class="mb-6">
							<CategorySelect
								categories={categories}
								selectedId={post?.categoryId}
							/>
						</div>

						{/* Status */}
						<div class="mb-6">
							<label
								for="status"
								class="block text-sm font-medium text-gray-700 mb-1"
							>
								Status <span class="text-red-500">*</span>
							</label>
							<select
								id="status"
								name="status"
								required
								class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							>
								<option
									value="draft"
									selected={post?.status === "draft" || !post}
								>
									Draft
								</option>
								<option
									value="published"
									selected={post?.status === "published"}
								>
									Published
								</option>
							</select>
						</div>

						{/* Attachments - Images */}
						<div class="mb-6">
							<AttachmentUploader
								postId={post?.id}
								attachments={attachments.filter((a) => a.fileType === "image")}
								fileType="image"
							/>
						</div>

						{/* Attachments - Downloads */}
						<div class="mb-6">
							<AttachmentUploader
								postId={post?.id}
								attachments={attachments.filter((a) => a.fileType === "download")}
								fileType="download"
							/>
						</div>

						{/* Actions */}
						<div class="flex items-center justify-between pt-6 border-t">
							<a
								href="/admin/blog"
								class="text-gray-600 hover:text-gray-900 font-medium"
							>
								Cancel
							</a>
							<button
								type="submit"
								class="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
							>
								{isEdit ? "Update Post" : "Create Post"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</AdminLayout>
	);
}
