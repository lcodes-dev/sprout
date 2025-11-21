/**
 * Attachment Gallery Component
 *
 * Displays a gallery of images from post attachments
 */

import type { PostAttachment } from "@/db/schema/post-attachments.js";

interface AttachmentGalleryProps {
	attachments: PostAttachment[];
}

export function AttachmentGallery({ attachments }: AttachmentGalleryProps) {
	if (attachments.length === 0) {
		return null;
	}

	return (
		<div
			class="my-8"
			x-data={`{
				currentImage: 0,
				showLightbox: false,
				nextImage() {
					this.currentImage = (this.currentImage + 1) % ${attachments.length};
				},
				prevImage() {
					this.currentImage = (this.currentImage - 1 + ${attachments.length}) % ${attachments.length};
				}
			}`}
		>
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Images</h3>
			<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
				{attachments.map((attachment, index) => (
					<div
						class="cursor-pointer group relative"
						x-on:click={`currentImage = ${index}; showLightbox = true`}
					>
						<img
							src={`/uploads/${attachment.filePath}`}
							alt={attachment.fileName}
							class="w-full h-48 object-cover rounded-lg group-hover:opacity-75 transition-opacity"
						/>
						<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
							<svg
								class="w-8 h-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
								/>
							</svg>
						</div>
					</div>
				))}
			</div>

			{/* Lightbox */}
			<div
				x-show="showLightbox"
				x-cloak
				class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
				x-on:click="showLightbox = false"
			>
				<button
					type="button"
					class="absolute top-4 right-4 text-white hover:text-gray-300"
					x-on:click="showLightbox = false"
				>
					<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<button
					type="button"
					class="absolute left-4 text-white hover:text-gray-300"
					x-on:click.stop="prevImage"
				>
					<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>

				<img
					x-bind:src={`'/uploads/' + ${JSON.stringify(attachments.map((a) => a.filePath))}[currentImage]`}
					class="max-w-4xl max-h-screen"
					x-on:click.stop
				/>

				<button
					type="button"
					class="absolute right-4 text-white hover:text-gray-300"
					x-on:click.stop="nextImage"
				>
					<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
}
