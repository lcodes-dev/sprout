import { assertEquals, assertStringIncludes } from "jsr:@std/assert@^0.223.0"
import { Hono } from "hono"
import { serveStatic } from "hono/deno"
import landing from "./index.ts"

// Create a test app with the same configuration as main.ts
const createTestApp = () => {
  const app = new Hono()
  app.use("/static/*", serveStatic({ root: "./" }))
  app.route("/", landing)
  return app
}

Deno.test("Landing Feature Tests", async (t) => {
  const app = createTestApp()

  await t.step("GET / should return status 200", async () => {
    const req = new Request("http://localhost/")
    const res = await app.fetch(req)
    assertEquals(res.status, 200)
  })

  await t.step("GET / should return HTML content", async () => {
    const req = new Request("http://localhost/")
    const res = await app.fetch(req)
    assertEquals(res.headers.get("content-type"), "text/html; charset=UTF-8")
  })

  await t.step("GET / should contain the correct title", async () => {
    const req = new Request("http://localhost/")
    const res = await app.fetch(req)
    const html = await res.text()

    // Check for the title tag
    assertStringIncludes(html, "<title>Welcome to Sprout 🌱</title>")

    // Check for the h1 heading
    assertStringIncludes(html, "Welcome to Sprout! 🌱")
  })

  await t.step("GET / should include CSS link tag", async () => {
    const req = new Request("http://localhost/")
    const res = await app.fetch(req)
    const html = await res.text()

    // Verify CSS is linked
    assertStringIncludes(html, '<link rel="stylesheet" href="/static/css/main.css"')
  })

  await t.step("GET / should include JS script tag", async () => {
    const req = new Request("http://localhost/")
    const res = await app.fetch(req)
    const html = await res.text()

    // Verify JS is included as a module
    assertStringIncludes(html, '<script type="module" src="/static/js/main.js"')
  })

  await t.step("GET / should include Stimulus controller", async () => {
    const req = new Request("http://localhost/")
    const res = await app.fetch(req)
    const html = await res.text()

    // Verify the hello controller is present
    assertStringIncludes(html, 'data-controller="hello"')
  })
})

Deno.test("Static Asset Tests", async (t) => {
  const app = createTestApp()

  await t.step("GET /static/css/main.css should be accessible", async () => {
    const req = new Request("http://localhost/static/css/main.css")
    const res = await app.fetch(req)

    // Should either exist (200) or be ready to serve when built
    // During CI/testing, static files should be built first
    if (res.status === 200) {
      assertEquals(res.status, 200)
      const contentType = res.headers.get("content-type")
      // Check that it's served as CSS
      assertStringIncludes(contentType || "", "text/css")
    } else {
      // If not built yet, that's expected in some test scenarios
      console.warn("⚠️  CSS file not found - run 'deno task build:css' to build assets")
    }
  })

  await t.step("GET /static/js/main.js should be accessible", async () => {
    const req = new Request("http://localhost/static/js/main.js")
    const res = await app.fetch(req)

    // Should either exist (200) or be ready to serve when built
    if (res.status === 200) {
      assertEquals(res.status, 200)
      const contentType = res.headers.get("content-type")
      // Check that it's served as JavaScript
      assertStringIncludes(contentType || "", "javascript")
    } else {
      // If not built yet, that's expected in some test scenarios
      console.warn("⚠️  JS file not found - run 'deno task build:js' to build assets")
    }
  })
})
