/**
 * Blog List View
 *
 * Public blog listing page
 */

import type { Post } from "@/db/schema/posts.js";
import type { Category } from "@/db/schema/categories.js";
import type { User } from "@/db/schema/users.js";
import type { CategoryWithCount } from "../../shared/types.js";
import { PostPreview } from "../components/post-preview.js";
import { CategoryFilter } from "../components/category-filter.js";

interface PostWithAuthorAndCategory extends Post {
	author: User;
	category: Category | null;
}

interface BlogListProps {
	posts: PostWithAuthorAndCategory[];
	categories: CategoryWithCount[];
	currentCategorySlug?: string;
}

export function BlogList({
	posts,
	categories,
	currentCategorySlug,
}: BlogListProps) {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Blog - Sprout</title>
				<link rel="stylesheet" href="/static/css/main.css" />
				<script type="module" src="/static/js/main.js" defer></script>
			</head>
			<body class="bg-gray-50">
				<div class="min-h-screen">
					{/* Header */}
					<header class="bg-white shadow">
						<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
							<h1 class="text-3xl font-bold text-gray-900">Blog</h1>
						</div>
					</header>

					{/* Main content */}
					<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
							{/* Sidebar */}
							<aside class="lg:col-span-1">
								<CategoryFilter
									categories={categories}
									currentSlug={currentCategorySlug}
								/>
							</aside>

							{/* Posts */}
							<div class="lg:col-span-3">
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
										<h3 class="mt-2 text-sm font-medium text-gray-900">
											No posts found
										</h3>
										<p class="mt-1 text-sm text-gray-500">
											Check back later for new content.
										</p>
									</div>
								) : (
									<div class="space-y-6">
										{posts.map((post) => (
											<PostPreview
												post={post}
												category={post.category}
												authorName={post.author.name}
											/>
										))}
									</div>
								)}
							</div>
						</div>
					</main>
				</div>
			</body>
		</html>
	);
}
