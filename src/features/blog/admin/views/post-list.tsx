/**
 * Post List View
 *
 * Admin panel view for listing all blog posts
 */

import type { Post } from "@/db/schema/posts.js";
import type { Category } from "@/db/schema/categories.js";
import type { User } from "@/db/schema/users.js";
import { AdminLayout } from "./layout.js";
import { PostCard } from "../components/post-card.js";

interface PostWithAuthorAndCategory extends Post {
	author: User;
	category: Category | null;
}

interface PostListProps {
	posts: PostWithAuthorAndCategory[];
	categories: Category[];
	currentFilter?: {
		status?: string;
		categoryId?: number;
	};
}

export function PostList({ posts, categories, currentFilter }: PostListProps) {
	return (
		<AdminLayout title="Blog Posts">
			<div>
				{/* Header with create button */}
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-xl font-semibold text-gray-900">All Posts</h2>
					<a
						href="/admin/blog/create"
						class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
					>
						<svg
							class="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							/>
						</svg>
						Create Post
					</a>
				</div>

				{/* Filters */}
				<div
					class="bg-white shadow rounded-lg p-4 mb-6"
					x-data="{ status: '', categoryId: '' }"
				>
					<form
						method="GET"
						action="/admin/blog"
						class="flex items-end gap-4"
					>
						<div class="flex-1">
							<label
								for="status"
								class="block text-sm font-medium text-gray-700 mb-1"
							>
								Status
							</label>
							<select
								id="status"
								name="status"
								x-model="status"
								class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							>
								<option value="">All</option>
								<option
									value="draft"
									selected={currentFilter?.status === "draft"}
								>
									Draft
								</option>
								<option
									value="published"
									selected={currentFilter?.status === "published"}
								>
									Published
								</option>
							</select>
						</div>

						<div class="flex-1">
							<label
								for="categoryId"
								class="block text-sm font-medium text-gray-700 mb-1"
							>
								Category
							</label>
							<select
								id="categoryId"
								name="categoryId"
								x-model="categoryId"
								class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							>
								<option value="">All Categories</option>
								{categories.map((category) => (
									<option
										value={category.id}
										selected={
											category.id === currentFilter?.categoryId
										}
									>
										{category.name}
									</option>
								))}
							</select>
						</div>

						<button
							type="submit"
							class="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
						>
							Filter
						</button>
					</form>
				</div>

				{/* Posts grid */}
				{posts.length === 0 ? (
					<div class="bg-white shadow rounded-lg p-12 text-center">
						<svg
							class="mx-auto h-12 w-12 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						<h3 class="mt-2 text-sm font-medium text-gray-900">No posts</h3>
						<p class="mt-1 text-sm text-gray-500">
							Get started by creating a new post.
						</p>
						<div class="mt-6">
							<a
								href="/admin/blog/create"
								class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
							>
								Create Post
							</a>
						</div>
					</div>
				) : (
					<div class="grid gap-6">
						{posts.map((post) => (
							<PostCard
								post={post}
								category={post.category}
								authorName={post.author.name}
							/>
						))}
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
