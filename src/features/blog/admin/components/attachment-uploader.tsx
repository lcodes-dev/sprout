/**
 * Attachment Uploader Component
 *
 * File upload component for images and downloadable files
 */

import type { PostAttachment } from "@/db/schema/post-attachments.js";
import { formatFileSize } from "../../shared/utils.js";

interface AttachmentUploaderProps {
	postId?: number;
	attachments?: PostAttachment[];
	fileType: "image" | "download";
}

export function AttachmentUploader({
	postId,
	attachments = [],
	fileType,
}: AttachmentUploaderProps) {
	const title = fileType === "image" ? "Images" : "Downloadable Files";
	const accept =
		fileType === "image"
			? "image/jpeg,image/jpg,image/png,image/gif,image/webp"
			: ".pdf,.zip,.doc,.docx,.xls,.xlsx,.txt,.csv";

	return (
		<div
			class="border-2 border-dashed border-gray-300 rounded-lg p-6"
			x-data={`{
				uploading: false,
				files: [],
				handleFiles(event) {
					this.files = Array.from(event.target.files);
				}
			}`}
		>
			<h3 class="text-lg font-medium text-gray-900 mb-4">{title}</h3>

			{/* Existing attachments */}
			{attachments.length > 0 && (
				<div class="mb-4 grid grid-cols-2 gap-4">
					{attachments.map((attachment) => (
						<div class="relative group">
							{fileType === "image" ? (
								<img
									src={`/uploads/${attachment.filePath}`}
									alt={attachment.fileName}
									class="w-full h-32 object-cover rounded"
								/>
							) : (
								<div class="flex items-center p-3 bg-gray-50 rounded">
									<svg
										class="w-8 h-8 text-gray-400 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
										/>
									</svg>
									<div class="flex-1">
										<p class="text-sm font-medium text-gray-900">
											{attachment.fileName}
										</p>
										<p class="text-xs text-gray-500">
											{formatFileSize(attachment.fileSize)}
										</p>
									</div>
								</div>
							)}
							<button
								type="button"
								class="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
								onclick={`fetch('/admin/blog/attachments/${attachment.id}/delete', { method: 'POST' }).then(() => location.reload())`}
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					))}
				</div>
			)}

			{/* Upload new files */}
			<div class="text-center">
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
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
					/>
				</svg>
				<div class="mt-4">
					<label
						for={`${fileType}-upload`}
						class="cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
					>
						<span>Upload {fileType === "image" ? "images" : "files"}</span>
						<input
							id={`${fileType}-upload`}
							name={`${fileType}s`}
							type="file"
							class="sr-only"
							multiple
							accept={accept}
							x-on:change="handleFiles"
						/>
					</label>
					<p class="text-xs text-gray-500 mt-1">
						{fileType === "image"
							? "PNG, JPG, GIF up to 10MB"
							: "PDF, ZIP, DOC up to 10MB"}
					</p>
				</div>
			</div>
		</div>
	);
}
