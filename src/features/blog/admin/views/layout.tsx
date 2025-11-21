/**
 * Admin Layout
 *
 * Common layout wrapper for admin panel pages
 */

interface AdminLayoutProps {
	title: string;
	children: any;
}

export function AdminLayout({ title, children }: AdminLayoutProps) {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title} - Blog Admin</title>
				<link rel="stylesheet" href="/static/css/main.css" />
				<script type="module" src="/static/js/main.js" defer></script>
			</head>
			<body class="bg-gray-100">
				<div class="min-h-screen">
					{/* Header */}
					<header class="bg-white shadow">
						<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
							<div class="flex items-center justify-between">
								<h1 class="text-2xl font-bold text-gray-900">{title}</h1>
								<nav class="flex items-center gap-4">
									<a
										href="/admin/blog"
										class="text-gray-600 hover:text-gray-900"
									>
										Posts
									</a>
									<a
										href="/admin/blog/categories"
										class="text-gray-600 hover:text-gray-900"
									>
										Categories
									</a>
									<a
										href="/blog"
										target="_blank"
										class="text-gray-600 hover:text-gray-900"
									>
										View Blog
									</a>
								</nav>
							</div>
						</div>
					</header>

					{/* Main content */}
					<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						{children}
					</main>
				</div>
			</body>
		</html>
	);
}
