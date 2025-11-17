import { Hono } from 'hono'
import { serveStatic } from 'hono/deno'

const app = new Hono()

// Serve static files from the static directory
app.use('/static/*', serveStatic({ root: './' }))

// Home page with Tailwind CSS test
app.get('/', (c) => {
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sprout - Hono + Deno + Tailwind</title>
        <link rel="stylesheet" href="/static/css/main.css" />
        <script type="module" src="/static/js/main.js"></script>
      </head>
      <body>
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div class="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Sprout! 🌱
            </h1>
            <p class="text-lg text-gray-600 mb-6">
              A modern web application built with Deno, Hono, Tailwind CSS, and Hotwire.
            </p>
            <div class="space-y-4">
              <div class="bg-green-50 border-l-4 border-green-500 p-4">
                <p class="text-green-700 font-semibold">✅ Deno Runtime</p>
              </div>
              <div class="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p class="text-blue-700 font-semibold">✅ Hono Web Framework</p>
              </div>
              <div class="bg-purple-50 border-l-4 border-purple-500 p-4">
                <p class="text-purple-700 font-semibold">✅ Tailwind CSS</p>
              </div>
              <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4" data-controller="hello">
                <p class="text-yellow-700 font-semibold">✅ Hotwire Stimulus (check console)</p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
})

Deno.serve(app.fetch)
