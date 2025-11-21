/**
 * Download List Component
 *
 * Displays a list of downloadable files from post attachments
 */

import type { PostAttachment } from "@/db/schema/post-attachments.js";
import { formatFileSize } from "../../shared/utils.js";

interface DownloadListProps {
	attachments: PostAttachment[];
}

export function DownloadList({ attachments }: DownloadListProps) {
	if (attachments.length === 0) {
		return null;
	}

	return (
		<div class="my-8">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Downloads</h3>
			<div class="space-y-2">
				{attachments.map((attachment) => (
					<a
						href={`/uploads/${attachment.filePath}`}
						download={attachment.fileName}
						class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
					>
						<svg
							class="w-8 h-8 text-gray-400 mr-3"
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
							<p class="font-medium text-gray-900 group-hover:text-blue-600">
								{attachment.fileName}
							</p>
							<p class="text-sm text-gray-500">
								{formatFileSize(attachment.fileSize)}
							</p>
						</div>
						<svg
							class="w-5 h-5 text-gray-400 group-hover:text-blue-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
							/>
						</svg>
					</a>
				))}
			</div>
		</div>
	);
}
