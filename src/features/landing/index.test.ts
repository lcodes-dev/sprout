import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import landing from "./index";

const createTestApp = () => {
	const app = new Hono();
	app.route("/", landing);
	return app;
};

describe("Landing feature", () => {
	const app = createTestApp();

	it("GET / returns status 200", async () => {
		const res = await app.fetch(new Request("http://localhost/"));
		expect(res.status).toBe(200);
	});

	it("GET / returns HTML content", async () => {
		const res = await app.fetch(new Request("http://localhost/"));
		expect(res.headers.get("content-type")).toBe("text/html; charset=UTF-8");
	});

	it("GET / contains the correct title and heading", async () => {
		const res = await app.fetch(new Request("http://localhost/"));
		const html = await res.text();
		expect(html).toContain("<title>Welcome to Sprout 🌱</title>");
		expect(html).toContain("Welcome to Sprout! 🌱");
	});

	it("GET / includes CSS and JS assets plus Stimulus controller", async () => {
		const res = await app.fetch(new Request("http://localhost/"));
		const html = await res.text();
		expect(html).toContain(
			'<link rel="stylesheet" href="/static/css/main.css"',
		);
		expect(html).toContain('<script type="module" src="/static/js/main.js"');
		expect(html).toContain('data-controller="hello"');
	});
});
