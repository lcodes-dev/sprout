/**
 * Post Preview Component
 *
 * Displays a post preview card for the blog listing page
 */

import type { Post } from "@/db/schema/posts.js";
import type { Category } from "@/db/schema/categories.js";
import { formatDate, truncateText } from "../../shared/utils.js";

interface PostPreviewProps {
	post: Post;
	category?: Category | null;
	authorName: string;
	excerpt?: string;
}

export function PostPreview({
	post,
	category,
	authorName,
	excerpt,
}: PostPreviewProps) {
	const displayExcerpt = excerpt || post.excerpt || "";

	return (
		<article class="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
			<div class="p-6">
				<div class="flex items-center gap-2 mb-2">
					{category && (
						<a
							href={`/blog/category/${category.slug}`}
							class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
						>
							{category.name}
						</a>
					)}
					<span class="text-sm text-gray-500">
						{formatDate(post.publishedAt, "short")}
					</span>
				</div>

				<h2 class="text-2xl font-bold text-gray-900 mb-2">
					<a
						href={`/blog/${post.slug}`}
						class="hover:text-blue-600 transition-colors"
					>
						{post.title}
					</a>
				</h2>

				{displayExcerpt && (
					<p class="text-gray-600 mb-4">{displayExcerpt}</p>
				)}

				<div class="flex items-center justify-between">
					<div class="flex items-center text-sm text-gray-500">
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
					</div>

					<a
						href={`/blog/${post.slug}`}
						class="text-blue-600 hover:text-blue-800 font-medium text-sm"
					>
						Read more →
					</a>
				</div>
			</div>
		</article>
	);
}
