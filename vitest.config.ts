import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	test: {
		env: {
			DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/sprout-test",
		},
		poolOptions: {
			threads: {
				singleThread: true,
			},
		},
	},
});


