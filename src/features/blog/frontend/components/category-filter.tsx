/**
 * Category Filter Component
 *
 * Sidebar widget for filtering posts by category
 */

import type { CategoryWithCount } from "../../shared/types.js";

interface CategoryFilterProps {
	categories: CategoryWithCount[];
	currentSlug?: string;
}

export function CategoryFilter({
	categories,
	currentSlug,
}: CategoryFilterProps) {
	return (
		<div class="bg-white shadow rounded-lg p-6">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
			<ul class="space-y-2">
				<li>
					<a
						href="/blog"
						class={`block px-3 py-2 rounded-md transition-colors ${
							!currentSlug
								? "bg-blue-100 text-blue-800 font-medium"
								: "text-gray-700 hover:bg-gray-100"
						}`}
					>
						<span class="flex items-center justify-between">
							<span>All Posts</span>
						</span>
					</a>
				</li>
				{categories.map((category) => (
					<li>
						<a
							href={`/blog/category/${category.slug}`}
							class={`block px-3 py-2 rounded-md transition-colors ${
								currentSlug === category.slug
									? "bg-blue-100 text-blue-800 font-medium"
									: "text-gray-700 hover:bg-gray-100"
							}`}
						>
							<span class="flex items-center justify-between">
								<span>{category.name}</span>
								<span class="text-sm text-gray-500">
									{category.postCount}
								</span>
							</span>
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
