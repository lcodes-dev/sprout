/**
 * Post Card Component
 *
 * Displays a post preview card in the admin panel with actions
 */

import type { Post } from "@/db/schema/posts.js";
import type { Category } from "@/db/schema/categories.js";
import { formatDate } from "../../shared/utils.js";
import { StatusBadge } from "./status-badge.js";

interface PostCardProps {
	post: Post;
	category?: Category | null;
	authorName: string;
}

export function PostCard({ post, category, authorName }: PostCardProps) {
	return (
		<div class="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<div class="flex items-center gap-2 mb-2">
						<h3 class="text-lg font-semibold text-gray-900">
							{post.title}
						</h3>
						<StatusBadge status={post.status} />
					</div>

					{post.excerpt && (
						<p class="text-gray-600 text-sm mb-3">{post.excerpt}</p>
					)}

					<div class="flex items-center gap-4 text-sm text-gray-500">
						{category && (
							<span class="inline-flex items-center">
								<svg
									class="w-4 h-4 mr-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
									/>
								</svg>
								{category.name}
							</span>
						)}
						<span class="inline-flex items-center">
							<svg
								class="w-4 h-4 mr-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
							{authorName}
						</span>
						<span class="inline-flex items-center">
							<svg
								class="w-4 h-4 mr-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							{formatDate(post.createdAt, "short")}
						</span>
					</div>
				</div>
			</div>

			<div class="mt-4 flex items-center gap-2">
				<a
					href={`/admin/blog/${post.id}/edit`}
					class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
				>
					Edit
				</a>

				<form
					method="POST"
					action={`/admin/blog/${post.id}/publish`}
					class="inline"
				>
					<button
						type="submit"
						class="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
					>
						{post.status === "draft" ? "Publish" : "Unpublish"}
					</button>
				</form>

				<form
					method="POST"
					action={`/admin/blog/${post.id}/delete`}
					class="inline"
					onsubmit="return confirm('Are you sure you want to delete this post?')"
				>
					<button
						type="submit"
						class="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
					>
						Delete
					</button>
				</form>

				{post.status === "published" && (
					<a
						href={`/blog/${post.slug}`}
						target="_blank"
						class="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
					>
						View
					</a>
				)}
			</div>
		</div>
	);
}
