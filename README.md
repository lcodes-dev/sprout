# Sprout 🌱

A modern web application built with Node.js, Hono, Tailwind CSS, and Hotwire.

## Quick Start

### Install dependencies

```bash
npm install
```

### Development Mode

Run the development server with automatic rebuilding of CSS and JS:

```bash
npm run dev
```

This will:
- Start PostgreSQL database via Docker Compose
- Start the web server on http://localhost:8000
- Watch and rebuild CSS files automatically
- Watch and rebuild JavaScript files automatically
- Reload the server when backend code changes (via `tsx watch`)

### Production Build

Build optimized assets for production:

```bash
npm run build
```

Then start the server:

```bash
npm run start
```

## Available Commands

- `npm run dev` - Start development server with watchers
- `npm run build` - Build CSS, JS, and compile the server
- `npm run build:css` / `build:js` - Build a single asset pipeline
- `npm run watch:css` / `watch:js` - Watch & rebuild CSS or JS
- `npm run start` - Run the compiled server from `dist/`
- `npm run typecheck` - Type-check the project without emitting output
- `npm test` - Run Vitest test suites (uses `sprout-test` database)
- `npm run db:push` / `db:studio` - Run Drizzle Kit utilities

## Project Structure

```
sprout/
├── src/                     # Application source code
│   ├── main.ts              # Application entry point
│   ├── features/            # Feature-based modules
│   │   └── landing/         # Landing page feature
│   │       ├── index.tsx    # Feature router
│   │       └── views/       # Feature views
│   │           └── HomePage.tsx
│   └── shared/              # Shared application code
│       ├── layouts/         # Layout components
│       │   └── BaseLayout.tsx
│       └── components/      # Reusable components
├── assets/                  # Source assets
│   ├── css/                 # CSS source files
│   │   └── main.css         # Tailwind CSS v4 entry point
│   └── js/                  # Frontend JavaScript source
│       └── main.ts          # Frontend entry point
├── scripts/                 # Build and utility scripts (Node)
├── static/                  # Built assets (gitignored)
│   ├── css/                 # Compiled CSS
│   └── js/                  # Bundled JavaScript
├── package.json             # Node scripts & dependencies
└── tsconfig.json            # TypeScript compiler configuration
```

## Tech Stack

- **Runtime**: Node.js + TypeScript (compiled with `tsc`/`tsx`)
- **Web Framework**: Hono
- **CSS**: Tailwind CSS v4 (CSS-first configuration)
- **Frontend JS**: Hotwire (Turbo) + Alpine.js
- **Build Tools**: esbuild, Tailwind CLI, concurrently
- **Database**: Drizzle ORM + PostgreSQL 18 (via Docker Compose)

## Testing

Tests automatically use a separate `sprout-test` database to avoid conflicts with development data. The test helpers automatically:
- Create the test database if it doesn't exist
- Clean all tables before tests run
- Reset the database after tests complete

To run tests:

```bash
npm test
```

Before running tests for the first time, sync the schema to the test database:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sprout-test npm run db:push
```

The test database is automatically managed by the test helpers in `src/db/test-helpers.ts`.

## Learn More

See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines and architecture documentation.
