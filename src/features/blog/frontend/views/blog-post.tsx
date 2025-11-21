/**
 * Blog Post View
 *
 * Single blog post page
 */

import type { PostWithRelations } from "../../shared/types.js";
import { formatDate } from "../../shared/utils.js";
import { AttachmentGallery } from "../components/attachment-gallery.js";
import { DownloadList } from "../components/download-list.js";

interface BlogPostProps {
	post: PostWithRelations;
}

export function BlogPost({ post }: BlogPostProps) {
	const images = post.attachments.filter((a) => a.fileType === "image");
	const downloads = post.attachments.filter((a) => a.fileType === "download");

	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{post.title} - Blog - Sprout</title>
				<meta name="description" content={post.excerpt || ""} />
				<link rel="stylesheet" href="/static/css/main.css" />
				<script type="module" src="/static/js/main.js" defer></script>
			</head>
			<body class="bg-gray-50">
				<div class="min-h-screen">
					{/* Header */}
					<header class="bg-white shadow">
						<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
							<nav class="mb-4">
								<a
									href="/blog"
									class="text-blue-600 hover:text-blue-800 font-medium"
								>
									← Back to Blog
								</a>
							</nav>
						</div>
					</header>

					{/* Main content */}
					<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<article class="bg-white shadow rounded-lg p-8">
							{/* Post header */}
							<header class="mb-8">
								<div class="flex items-center gap-2 mb-4">
									{post.category && (
										<a
											href={`/blog/category/${post.category.slug}`}
											class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
										>
											{post.category.name}
										</a>
									)}
									<span class="text-sm text-gray-500">
										{formatDate(post.publishedAt, "long")}
									</span>
								</div>

								<h1 class="text-4xl font-bold text-gray-900 mb-4">
									{post.title}
								</h1>

								<div class="flex items-center text-gray-600">
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
											d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
										/>
									</svg>
									<span>By {post.author.name}</span>
								</div>
							</header>

							{/* Post content */}
							<div class="prose prose-lg max-w-none">
								<div dangerouslySetInnerHTML={{ __html: post.content }} />
							</div>

							{/* Attachments */}
							{images.length > 0 && <AttachmentGallery attachments={images} />}
							{downloads.length > 0 && (
								<DownloadList attachments={downloads} />
							)}
						</article>

						{/* Footer */}
						<div class="mt-8 text-center">
							<a
								href="/blog"
								class="text-blue-600 hover:text-blue-800 font-medium"
							>
								← Back to all posts
							</a>
						</div>
					</main>
				</div>
			</body>
		</html>
	);
}
