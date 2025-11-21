/**
 * Category Select Component
 *
 * Dropdown for selecting a category
 */

import type { Category } from "@/db/schema/categories.js";

interface CategorySelectProps {
	categories: Category[];
	selectedId?: number | null;
	name?: string;
	required?: boolean;
}

export function CategorySelect({
	categories,
	selectedId,
	name = "categoryId",
	required = false,
}: CategorySelectProps) {
	return (
		<div>
			<label
				for={name}
				class="block text-sm font-medium text-gray-700 mb-1"
			>
				Category {required && <span class="text-red-500">*</span>}
			</label>
			<select
				id={name}
				name={name}
				required={required}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
			>
				<option value="">Select a category</option>
				{categories.map((category) => (
					<option
						value={category.id}
						selected={category.id === selectedId}
					>
						{category.name}
					</option>
				))}
			</select>
		</div>
	);
}
