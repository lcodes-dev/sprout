# CLAUDE.md - AI Assistant Guide for Sprout

## Project Overview

**Sprout** is a lightweight web application built with Node.js and the [Hono](https://hono.dev/) web framework. This project is a modern, full-featured starter kit leveraging TypeScript (compiled via `tsc`/`tsx`) and Hono's fast, Express-like API.

**Current State**: Early stage / minimal setup with a single "Hello World" endpoint.

## Technology Stack

- **Runtime**: Node.js (latest LTS)
- **Web Framework**: Hono v4.10.6+
- **Language**: TypeScript (compiled with tsc / executed via tsx)
- **JSX Support**: Precompiled JSX with Hono's JSX runtime (SSR ONLY)
- **Hotwire**: The project integrates with [Hotwire Turbo](https://turbo.hotwired.dev/)
- **Alpine.js**: Lightweight JavaScript framework for interactivity ([Alpine.js](https://alpinejs.dev/))
- **CSS Framework**: Tailwind CSS (with build process)
- **Frontend JS**: ES modules served as static assets

## Project Structure

```
sprout/
├── .git/               # Git repository
├── .gitignore          # Git ignore rules (ignores .vscode)
├── README.md           # Basic usage instructions
├── package.json        # Node scripts and dependencies
└── tsconfig.json       # TypeScript compiler configuration
```

### Expected Directory Structure (as project grows)

```
sprout/
├── src/main.ts                     # Entry point
├── src/features/                   # Each feature will have a subdirectory here
├── package.json                    # Configuration/scripts
├── src/shared/middleware/          # Custom middleware (recommended)
├── src/shared/components/          # Custom JSX components. Will use only SSR JSX
├── src/shared/layouts/             # Custom JSX components
├── src/shared/lib/                 # Shared utilities and helpers
├── src/shared/lib/hotwire/         # Hotwire turbo integration
├── src/shared/types/               # TypeScript type definitions
├── assets/                         # Source assets (before build)
│   ├── css/                        # CSS source files
│   │   └── main.css                # Main Tailwind CSS entry point
│   └── js/                         # Frontend JavaScript source
│       ├── lib/                    # Shared frontend utilities
│       └── main.ts                 # Frontend entry point (Alpine.js + Turbo)
├── static/                         # Built/static assets (served to frontend)
│   ├── css/                        # Compiled CSS files
│   ├── js/                         # Bundled/transpiled JS files
│   └── images/                     # Images and other static files
├── tailwind.config.ts              # Tailwind CSS configuration
```

#### Structure of features

Each feature will be created inside `sprout/src/features/`.
Each feature will define a router. The `src/main.ts` file will automatically scan all folders and subfolders in `features` to find router types to import them and register their routes.

```
sprout/
├── src/features/example-feature/
├── src/features/example-feature/index.ts # router file for the feature
├── src/features/example-feature/actions/ # Individual actions for the feature, such as example_create.ts, example_read.ts
├── src/features/example-feature/views/ # JSX views used in the feature.
├── src/features/example-feature/... # shared files used ONLY in the feature
```

When a feature is more complex, for example when it spans the user frontend and the admin panel the feature can be divided in subfolders.
Example:
```
sprout/
├── src/features/example-feature/
├── src/features/example-feature/admin/index.ts # router file for the feature in the admin panel
├── src/features/example-feature/admin/... # all the other files
├── src/features/example-feature/frontend/index.ts # router 
file for the feature in the frontend site
├── src/features/example-feature/frontend/... # all the other files
```

## Development Workflow

### Initial Setup

After cloning the repository, run these commands:

```bash
# 1. Install git hooks (HIGHLY RECOMMENDED)
./scripts/install-git-hooks.sh

# 2. Install dependencies
npm install

# 3. Verify everything is working
npm run typecheck && npm test
```

### Running the Application

```bash
npm run dev
# Runs CSS/JS watchers + tsx watch for the server
```

The server will start and listen on http://localhost:8000 by default.

### Development Commands

- **Start dev server**: `npm run dev`
- **Start production build**: `npm run start` (after `npm run build`)
- **Build CSS**: `npm run build:css` - Compile Tailwind CSS
- **Watch CSS**: `npm run watch:css`
- **Build JS**: `npm run build:js` - Bundle frontend JavaScript
- **Watch JS**: `npm run watch:js`
- **Build everything**: `npm run build`
- **Type check**: `npm run typecheck`
- **Tests**: `npm test`
- **DB utilities**: `npm run db:init`, `npm run db:push`, `npm run db:studio`

### Testing

Vitest is configured for the project:

1. Place test files adjacent to source files with the `.test.ts` suffix.
2. Import `describe`, `it`, and `expect` from `vitest`.
3. Run all tests with `npm test` (CI) or `npm run test:watch` locally.

## Dependencies

### Managing Dependencies

Dependencies are managed via `package.json`:

```json
{
  "dependencies": {
    "hono": "^4.10.6",
    "@hono/node-server": "^1.19.6",
    "drizzle-orm": "^0.36.4"
  }
}
```

**To add a new dependency**:
1. Run `npm install <package>` (or `npm install -D <package>` for dev deps)
2. Import using standard ES module specifiers
3. Commit the updated `package.json` and `package-lock.json`

Node projects rely on `package-lock.json` for reproducible installs—do not edit it manually.

## Code Conventions

### General Guidelines

1. **TypeScript First**: Use TypeScript for all code
2. **Formatting**: Use your editor's formatter or Prettier to keep style consistent
3. **Type Checking**: Run `npm run typecheck` before pushing
4. **Imports**: Use explicit file extensions (`.ts`, `.tsx`) in imports (NodeNext module resolution)
5. **Node Modules**: Dependencies are installed into `node_modules/`—commit only `package-lock.json`

### File Naming

- **Source files**:`kebab-case.ts`
- **Test files**: `file-name.test.ts`
- **Type definitions**: `types.ts` or specific `*.types.ts`

### Code Style

```typescript
// Use ES modules
import { Hono } from 'hono'

// Use const for immutable bindings
const app = new Hono()

// Use arrow functions for handlers
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Prefer explicit types when needed
app.get('/user/:id', (c) => {
  const id: string = c.req.param('id')
  return c.json({ id })
})
```

### Hono-Specific Patterns

1. **Route Handlers**: Use the Context object (`c`) for request/response
2. **Middleware**: Chain middleware with `app.use()`
3. **Route Grouping**: Use `app.route()` for nested routes
4. **Response Types**: Use typed responses: `c.text()`, `c.json()`, `c.html()`

## Current Application Structure

### main.ts

The entry point initializes a Hono application with a single route:

```typescript
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({ fetch: app.fetch, port: 8000 })
```

**Key Points**:
- Uses `@hono/node-server`'s `serve()` helper to start the server
- Hono's `app.fetch` is passed directly to the server
- Currently only has one GET route at `/`

## AI Assistant Guidelines

### When Working on This Project

1. **Stick to the Node.js toolchain**:
   - Use ES module syntax (`import`/`export`)
   - Keep `package.json`/`tsconfig.json` as the source of truth
   - Include file extensions in imports (NodeNext semantics)
   - Prefer built-in Node APIs or well-maintained npm packages

2. **Runtime commands live in npm scripts**:
   - `npm run dev` for the watch server
   - `npm run build` / `npm run start` for production
   - Keep scripts organized inside `package.json`

3. **CRITICAL - Pre-commit workflow**:
   - **ALWAYS** run checks before committing code
   - Type check: `npm run typecheck`
   - Tests: `npm test`
   - Asset build (when relevant): `npm run build`
   - These mirror the CI workflow—do not skip them

4. **Adding new features**:
   - Keep routes modular; consider separating into `routes/` directories
   - Add middleware under `src/shared/middleware`
   - Update documentation when commands or behaviors change
   - Follow the pre-commit workflow before committing

5. **Dependencies**:
   - Use `npm install <pkg>` / `npm install -D <pkg>`
   - Always commit the updated `package-lock.json`
   - Re-run tests/type-checks after adding dependencies

6. **TypeScript**:
   - `tsconfig.json` defines compiler behavior (NodeNext, JSX, etc.)
   - Keep strict typing enabled
   - Use `npm run typecheck` (tsc --noEmit) to validate changes

7. **Error Handling**:
   - Use try/catch for async operations
   - Return appropriate HTTP status codes
   - Log errors via `console` or structured logging utilities

8. **Environment Variables**:
   - Use `process.env` (dotenv is already configured)
   - Document required env vars (see `.env.example` when available)
   - Add new secrets to `.gitignore`-protected files

### Common Tasks

#### Adding a new route
```typescript
app.get('/api/users', async (c) => {
  // Handler logic
  return c.json({ users: [] })
})
```

#### Adding middleware
```typescript
import { logger } from 'hono/logger'
app.use('*', logger())
```

#### Organizing routes
```typescript
// routes/users.ts
import { Hono } from 'hono'
const users = new Hono()
users.get('/', (c) => c.json({ users: [] }))
export default users

// main.ts
import users from './routes/users.ts'
app.route('/users', users)
```

#### Adding JSX/HTML templates
```typescript
import { jsx } from 'hono/jsx'

app.get('/page', (c) => {
  return c.html(
    <html>
      <body>
        <h1>Hello from JSX!</h1>
      </body>
    </html>
  )
})
```

## Frontend Assets & Build Process

### Tailwind CSS

The project uses Tailwind CSS for styling, which requires a build step to compile the CSS.

**Workflow**:
1. Edit CSS in `assets/css/main.css`
2. Use Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
3. Add custom CSS classes as needed
4. Run `npm run build:css` or `npm run watch:css` during development
5. Compiled CSS is output to `static/css/main.css`
6. Reference in HTML: `<link rel="stylesheet" href="/static/css/main.css">`

**Configuration**:
- `tailwind.config.ts` - Configure theme, plugins, content paths
- Content paths should include all JSX files: `src/**/*.{ts,tsx}`

### Frontend JavaScript

Frontend JavaScript (Alpine.js, utilities) is organized separately from backend code.

**Structure**:
- `assets/js/lib/` - Shared frontend utilities and Alpine.js components
- `assets/js/main.ts` - Entry point that initializes Alpine.js and Turbo

**Workflow**:
1. Write TypeScript in `assets/js/`
2. Run `npm run build:js` (or `npm run watch:js`) to bundle/transpile
3. Output is written to `static/js/main.js`
4. Reference in HTML: `<script type="module" src="/static/js/main.js"></script>`

**Alpine.js Usage**:
Alpine.js provides reactive and declarative JavaScript right in your HTML. Use `x-data`, `x-on`, `x-bind`, and other directives directly in your templates.

```html
<!-- Example Alpine.js component in your JSX template -->
<div x-data="{ count: 0 }">
  <button x-on:click="count++">Increment</button>
  <span x-text="count"></span>
</div>
```

**Creating Reusable Alpine Components**:
```typescript
// assets/js/lib/components/counter.ts
export function counter(initialValue = 0) {
  return {
    count: initialValue,
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    }
  }
}

// Use in HTML:
// <div x-data="counter(5)">
//   <button @click="decrement">-</button>
//   <span x-text="count"></span>
//   <button @click="increment">+</button>
// </div>
```

### Static File Serving

The application serves static files from the `static/` directory using Hono's static file middleware.

**Setup**:
```typescript
import { serveStatic } from 'hono/serve-static'

app.use('/static/*', serveStatic({ root: './' }))
```

## Database (Drizzle ORM)

The project uses **Drizzle ORM** with a **code-first approach** (no migrations). Database schema is defined in TypeScript and synced directly to the database.

### Database Setup

**Quick Start**:
```bash
# 1. Initialize database directory
npm run db:init

# 2. Sync schema to database
npm run db:push

# 3. (Optional) Launch Drizzle Studio
npm run db:studio
```

### Database Configuration

- **Config**: `src/db/config.ts`
- **Connection**: `src/db/connection.ts`
- **Schemas**: `src/db/schema/`
- **Queries**: `src/db/queries/`

**Environment Variables**:
- `DATABASE_URL`: Database connection URL (default: `file:./sprout.db`)
- `DATABASE_AUTH_TOKEN`: Auth token for remote databases (optional)
- `NODE_ENV`: Set to `development` for verbose logging

### Using the Database

**Import the database instance**:
```typescript
import { db } from "./db/connection.ts"
import { users } from "./db/schema/users.ts"
```

**Basic queries**:
```typescript
// Using Drizzle ORM directly
const allUsers = await db.select().from(users)

// Using query utilities (recommended)
import { getAllUsers, createUser } from "./db/queries/users.ts"
const users = await getAllUsers()
const newUser = await createUser({
  email: "user@example.com",
  name: "John Doe",
  passwordHash: "hashed_password"
})
```

### Adding New Tables

1. Create schema file in `src/db/schema/[table-name].ts`
2. Export from `src/db/schema/index.ts`
3. Run `npm run db:push` to sync schema
4. Create query utilities in `src/db/queries/[table-name].ts`
5. Write tests in `src/db/queries/[table-name].test.ts`

**Example schema**:
```typescript
// src/db/schema/posts.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"
import { users } from "./users.ts"

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
})

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
```

### Database Tasks

- `npm run db:init` - Initialize database directory
- `npm run db:push` - Sync schema changes to database
- `npm run db:studio` - Launch Drizzle Studio (database UI)

### Code-First Workflow

The code-first approach means:
- ✅ Schema defined in TypeScript
- ✅ Changes pushed directly to database
- ❌ No migration files generated
- ⚡ Faster development iteration

**When to use code-first**: Small to medium projects, rapid prototyping, solo/small teams

**When to use migrations**: Large production systems, strict schema controls, rollback requirements

See `src/db/README.md` for detailed documentation.

## Git Workflow

- **Branch naming**: Use descriptive branch names (e.g., `feature/add-user-auth`, `fix/cors-issue`)
- **Commits**: Write clear, concise commit messages

### Automated Git Hooks (RECOMMENDED)

**Install git hooks to automatically run checks before each commit:**

```bash
./scripts/install-git-hooks.sh
```

This will install a pre-commit hook that automatically runs:
- `npm run typecheck` - Type check
- `npm test` - Run tests

If any check fails, the commit will be blocked. This **prevents CI/CD failures** and ensures code quality.

**Benefits:**
- ✅ Never forget to format/lint/test
- ✅ Prevents broken commits from being pushed
- ✅ Saves time by catching issues early
- ✅ Ensures CI/CD pipeline always passes

### CRITICAL: Pre-Commit Checklist

**ALWAYS run these commands before committing. All must pass without errors:**

```bash
# 1. Type check (REQUIRED - must pass with 0 errors)
npm run typecheck

# 2. Run tests (REQUIRED - all tests must pass)
npm test

# 3. Build assets/server (when touching frontend/backend code)
npm run build
```

**Why this matters:**
- The CI/CD pipeline runs these same checks
- If any check fails, the CI/CD pipeline will fail
- This wastes time and creates failed builds
- Always ensure local checks pass before pushing

**Quick pre-commit command:**
```bash
npm run typecheck && npm test && npm run build
```

If this command completes successfully, you're ready to commit.

## Performance Considerations

- **Node.js + Hono are lightweight**: keep middleware stacks small
- **Streaming**: Consider streaming responses for large data
- **Caching**: Use HTTP caching headers and CDN-backed static hosting

## Security Best Practices

1. **Permissions**: Limit access tokens/API keys; avoid running with elevated OS permissions
2. **Input Validation**: Always validate user input
3. **Dependencies**: Audit dependencies regularly
4. **Environment**: Never commit secrets; use environment variables
5. **CORS**: Configure CORS middleware if building an API
6. **Headers**: Set security headers (CSP, HSTS, etc.)

## Resources

- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)

## Project Status & Roadmap

**Current Version**: Initial setup (v0.1.0)

### Phase 1: Core Infrastructure

#### 1. Tailwind CSS Integration
- [ ] **Install Tailwind CSS dependencies**
  - [ ] Add Tailwind CSS via npm (`tailwindcss`, `@tailwindcss/cli`)
  - [ ] Add PostCSS/autoprefixer if needed
  - [ ] Add Tailwind typography plugin (optional)
  - [ ] Update `package.json` with all CSS build dependencies

- [ ] **Create Tailwind configuration**
  - [ ] Create `tailwind.config.ts` in project root
  - [ ] Configure content paths to include `src/**/*.{ts,tsx}`
  - [ ] Set up custom theme (colors, fonts, etc.)
  - [ ] Configure plugins (forms, typography, etc.)
  - [ ] Set up dark mode strategy (class or media)

- [ ] **Set up CSS source files**
  - [ ] Create `assets/css/` directory
  - [ ] Create `assets/css/main.css` with Tailwind directives
  - [ ] Add base styles and custom CSS utilities
  - [ ] Set up CSS layer organization (base, components, utilities)

- [ ] **Create CSS build process**
  - [ ] Create `static/css/` output directory
  - [ ] Write build script in `scripts/build-css.ts`
  - [ ] Implement Tailwind CLI integration for compilation
  - [ ] Add minification for production builds
  - [ ] Add `build:css` npm script to `package.json`
  - [ ] Add `watch:css` script for development
  - [ ] Test CSS compilation and output

- [ ] **Configure static file serving**
  - [ ] Add Hono static file middleware
  - [ ] Configure `/static/*` route to serve files
  - [ ] Test serving compiled CSS from `/static/css/main.css`
  - [ ] Add `.gitignore` entry for `static/css/` (built files)

#### 2. Frontend JavaScript Structure
- [x] **Set up frontend JavaScript directories** ✅
  - [x] Create `assets/js/` directory structure
  - [x] Create `assets/js/lib/` for utilities and Alpine components
  - [x] Create `assets/js/main.ts` as entry point

- [x] **Install Alpine.js and Hotwire dependencies** ✅
  - [x] Add `alpinejs` via npm to `package.json`
  - [x] Add `@hotwired/turbo` via npm to `package.json`
  - [x] Verify imports work with Node / esbuild

- [ ] **Create JavaScript build process**
  - [ ] Create `static/js/` output directory
  - [ ] Choose bundler (esbuild via npm)
  - [ ] Write build script in `scripts/build-js.ts`
  - [ ] Configure TypeScript compilation for frontend code
  - [ ] Set up source maps for development
  - [ ] Add minification for production builds
  - [ ] Add `build:js` npm script to `package.json`
  - [ ] Add `watch:js` script for development
  - [ ] Test JavaScript bundling and output

- [x] **Create Alpine.js application bootstrap** ✅
  - [x] Write `assets/js/main.ts` to initialize Alpine.js
  - [x] Initialize Hotwire Turbo integration
  - [x] Make Alpine and Turbo available globally
  - [x] Document Alpine.js usage patterns
  - [x] Test Alpine.js initialization

- [ ] **Configure static JavaScript serving**
  - [ ] Verify static middleware serves JS files
  - [ ] Test serving from `/static/js/main.js`
  - [ ] Add `.gitignore` entry for `static/js/` (built files)
  - [ ] Set up proper MIME types for ES modules

#### 3. Unified Build System
- [ ] **Create unified build tasks**
  - [ ] Add `build` script that runs CSS/JS/server builds
  - [ ] Add `watch` scripts for development (CSS + JS)
  - [ ] Add `dev` script that runs server + watchers
  - [ ] Create `scripts/build.ts` orchestrator script if needed
  - [ ] Add build validation and error handling

- [ ] **Optimize build performance**
  - [ ] Implement parallel CSS and JS builds
  - [ ] Add build caching where possible
  - [ ] Optimize watch mode to only rebuild changed files
  - [ ] Add build time reporting

- [ ] **Update documentation**
  - [ ] Document build commands in README
  - [ ] Add examples for creating Alpine.js components
  - [ ] Document Tailwind usage patterns
  - [ ] Create quick start guide for frontend development

### Phase 2: Application Features

- [ ] **Add structured routing with separate route files**
  - [ ] Create router auto-discovery system for features
  - [ ] Implement feature-based routing structure
  - [ ] Add example feature with routes

- [ ] **Implement error handling middleware**
  - [ ] Create global error handler
  - [ ] Add 404 handler
  - [ ] Add error logging
  - [ ] Create error pages with Tailwind styling

- [ ] **Add logging middleware**
  - [ ] Integrate request logging
  - [ ] Configure log levels
  - [ ] Add structured logging

- [ ] **Set up environment variable configuration**
  - [ ] Create `.env.example` file
  - [ ] Add environment loading utility
  - [ ] Document required environment variables
  - [ ] Add `.env` to `.gitignore`

- [ ] **Add unit tests**
  - [ ] Set up Vitest configuration
  - [ ] Create test utilities
  - [ ] Add example tests for routes
  - [ ] Add CI integration for tests

- [x] **Set up GitHub Actions CI/CD pipeline** ✅
  - [x] Create `.github/workflows/` directory structure
  - [x] Create `ci.yml` workflow file
  - [x] Configure triggers (push to master, pull requests, tags)
  - [x] Add Node.js setup action (`actions/setup-node`)
  - [x] Install dependencies with `npm ci`
  - [x] Add type checking step (`npm run typecheck`)
  - [x] Add test step (`npm test`)
  - [x] Add build/lint steps as needed
  - [x] Document CI/CD workflow in comments

- [ ] **Configure CORS for API access**
  - [ ] Add CORS middleware
  - [ ] Configure allowed origins
  - [ ] Document CORS settings

- [x] **Add database integration** ✅
  - [x] Integrate Drizzle ORM using code-first approach
  - [x] Set up database connection
  - [x] Create example schema (users table)
  - [x] Add database utilities (query helpers)
  - [x] Document database workflow (no migrations)

### Phase 3: User Analytics System

- [ ] **Infrastructure Layer**
  - [ ] Create cache interface in `src/shared/lib/cache/`
    - [ ] Define `CacheInterface` with get/set/delete/clear methods
    - [ ] Implement `InMemoryCache` class
    - [ ] Add support for TTL (time-to-live)
    - [ ] Write unit tests for cache operations
    - [ ] Document Redis migration path

  - [ ] Create storage interface in `src/shared/lib/storage/`
    - [ ] Define `StorageInterface` with read/write/delete methods
    - [ ] Implement `LocalFilesystem` class
    - [ ] Add file streaming support
    - [ ] Write unit tests for storage operations
    - [ ] Document S3 migration path

  - [ ] Set up analytics database schema
    - [ ] Create `src/db/schema/analytics-events.ts`
    - [ ] Define table with fields: id, anonymizedIp, userAgent, path, referer, timestamp
    - [ ] Add indexes for timestamp and path fields
    - [ ] Export types (AnalyticsEvent, NewAnalyticsEvent)
    - [ ] Update `src/db/schema/index.ts` to export analytics schema
    - [ ] Run `npm run db:push` to sync schema

  - [ ] Create analytics query utilities
    - [ ] Create `src/db/queries/analytics-events.ts`
    - [ ] Implement `insertAnalyticsEvents(events[])` for batch inserts
    - [ ] Implement `getAnalyticsForPeriod(days)` for time-based queries
    - [ ] Implement `getTopPages(limit)` for popular pages
    - [ ] Implement `getBrowserStats()` for user agent analysis
    - [ ] Implement `getReferrerStats()` for traffic sources
    - [ ] Implement `getUniqueVisitors(days)` for visitor counts
    - [ ] Write comprehensive tests in `analytics-events.test.ts`

- [ ] **Data Collection Layer**
  - [ ] Create analytics utilities
    - [ ] Implement IP anonymization in `src/features/analytics/lib/ip-anonymizer.ts`
      - [ ] Support IPv4 anonymization (set last octet to 0)
      - [ ] Support IPv6 anonymization (set last 80 bits to 0)
      - [ ] Write unit tests with various IP formats

    - [ ] Implement path cleaning in `src/features/analytics/lib/path-cleaner.ts`
      - [ ] Remove sensitive query parameters (token, secret, password, etc.)
      - [ ] Generalize dynamic segments (/user/123 → /user/:id)
      - [ ] Handle edge cases (malformed URLs, special characters)
      - [ ] Write unit tests with various path patterns

  - [ ] Create analytics middleware
    - [ ] Implement `src/features/analytics/middleware/analytics-collector.ts`
    - [ ] Extract request metadata (IP, user agent, path, referer)
    - [ ] Apply IP anonymization and path cleaning
    - [ ] Send data to cache (non-blocking)
    - [ ] Handle errors gracefully (don't break user requests)
    - [ ] Write unit tests for middleware behavior
    - [ ] Write integration tests with mock Hono context

  - [ ] Implement batch processor
    - [ ] Create `src/features/analytics/lib/batch-processor.ts`
    - [ ] Initialize with cache instance
    - [ ] Implement volume trigger (flush at 500 items)
    - [ ] Implement time trigger (flush every 1 second using setInterval)
    - [ ] Handle concurrent flush operations safely
    - [ ] Implement graceful shutdown
    - [ ] Write unit tests for both trigger types
    - [ ] Write integration tests with database

- [ ] **Admin Dashboard Layer**
  - [ ] Install charting dependencies
    - [ ] Add `chart.js` via npm
    - [ ] Add `date-fns` for date manipulation
    - [ ] Update `package.json` and commit lockfile

  - [ ] Create analytics types
    - [ ] Create `src/features/analytics/types.ts`
    - [ ] Define `AnalyticsStats` interface
    - [ ] Define `ChartData` interface
    - [ ] Define `Period` type union ('24h' | '7d' | '30d')

  - [ ] Create analytics actions
    - [ ] Create `src/features/analytics/admin/actions/get-stats.ts`
      - [ ] Accept period parameter from query string
      - [ ] Call query utilities to fetch aggregated stats
      - [ ] Return JSON with totalViews, uniqueVisitors, topPages
      - [ ] Write unit tests for action

    - [ ] Create `src/features/analytics/admin/actions/get-chart-data.ts`
      - [ ] Accept chart type and period from query string
      - [ ] Generate appropriate chart data format
      - [ ] Support timeseries, topPages, browsers, referrers
      - [ ] Write unit tests for each chart type

  - [ ] Build admin analytics views
    - [ ] Create `src/features/analytics/admin/views/components/StatsCard.tsx`
      - [ ] Accept title, value, change percentage props
      - [ ] Style with Tailwind CSS
      - [ ] Add trend indicator (up/down arrow)

    - [ ] Create `src/features/analytics/admin/views/components/TimeSeriesChart.tsx`
      - [ ] Use Chart.js for line chart
      - [ ] Alpine.js for period selection (24h, 7d, 30d)
      - [ ] Fetch data via Turbo Frame
      - [ ] Show loading state

    - [ ] Create `src/features/analytics/admin/views/components/TopPagesChart.tsx`
      - [ ] Use Chart.js for horizontal bar chart
      - [ ] Show top 10 pages
      - [ ] Include view counts

    - [ ] Create `src/features/analytics/admin/views/components/BrowsersChart.tsx`
      - [ ] Use Chart.js for doughnut chart
      - [ ] Parse user agents to extract browser names
      - [ ] Show percentage breakdown

    - [ ] Create `src/features/analytics/admin/views/components/ReferrersChart.tsx`
      - [ ] Use Chart.js for bar chart
      - [ ] Show top referrer sources
      - [ ] Handle direct traffic

    - [ ] Create `src/features/analytics/admin/views/AnalyticsPage.tsx`
      - [ ] Import all chart components
      - [ ] Create layout with stats cards at top
      - [ ] Arrange charts in grid layout
      - [ ] Add period selector using Alpine.js
      - [ ] Wrap charts in Turbo Frames for updates

  - [ ] Create analytics admin router
    - [ ] Create `src/features/analytics/admin/index.tsx`
    - [ ] Define route: GET `/admin/analytics`
    - [ ] Define route: GET `/admin/analytics/api/stats`
    - [ ] Define route: GET `/admin/analytics/api/chart-data`
    - [ ] Wire up actions to routes
    - [ ] Write integration tests for routes

  - [ ] Integrate analytics into main app
    - [ ] Update `src/main.ts` to import analytics middleware
    - [ ] Apply middleware to all non-admin routes
    - [ ] Import and mount admin analytics router at `/admin/analytics`
    - [ ] Initialize batch processor on app startup
    - [ ] Handle graceful shutdown of batch processor

- [ ] **Testing & Documentation**
  - [ ] Write comprehensive tests
    - [ ] Unit tests for IP anonymizer (100% coverage)
    - [ ] Unit tests for path cleaner (100% coverage)
    - [ ] Unit tests for cache interface
    - [ ] Unit tests for storage interface
    - [ ] Integration tests for middleware
    - [ ] Integration tests for batch processor
    - [ ] Integration tests for database queries
    - [ ] Integration tests for admin routes
    - [ ] All tests must pass with `npm test`

  - [ ] Update documentation
    - [ ] Verify CLAUDE.md analytics section is complete
    - [ ] Add inline code comments for complex logic
    - [ ] Add JSDoc comments for all public functions
    - [ ] Create README in `src/features/analytics/` if needed

### Phase 4: Production Readiness

- [ ] **Optimize production builds**
  - [ ] Add production CSS minification
  - [ ] Add production JS minification
  - [ ] Implement asset fingerprinting/hashing
  - [ ] Add compression middleware

- [ ] **Add security enhancements**
  - [ ] Implement helmet-style security headers
  - [ ] Add CSRF protection
  - [ ] Configure CSP headers
  - [ ] Add rate limiting

- [ ] **Performance monitoring**
  - [ ] Add performance metrics
  - [ ] Implement response time tracking
  - [ ] Add health check endpoint

- [ ] **Deployment preparation**
  - [ ] Create Dockerfile
  - [ ] Add deployment documentation
  - [ ] Configure production environment
  - [ ] Add deployment scripts

## User Analytics System

The project includes a comprehensive user analytics system built into the admin panel. This system provides privacy-focused website analytics similar to Plausible Analytics, tracking page views, user agents, and traffic patterns while respecting user privacy through IP anonymization.

### Analytics Overview

**Purpose**: Track website usage patterns, popular pages, browser/device statistics, and traffic trends to help administrators understand how users interact with the site.

**Privacy-First Approach**:
- IP addresses are anonymized (last octet removed)
- No personal data collection
- No cookies or client-side tracking
- Aggregate statistics only

### Architecture

The analytics system consists of several key components:

1. **Data Collection Middleware**: Passively collects analytics data on every non-admin request
2. **Batch Processing System**: Efficiently writes analytics data to database in batches
3. **Cache Layer**: In-memory cache with interface for future Redis support
4. **Storage Layer**: Local filesystem with interface for future S3 support
5. **Admin Dashboard**: Interactive charts and statistics visualization

### How It Works

#### 1. Data Collection Flow

```
User Request → Analytics Middleware → Cache → Batch Processor → Database
```

1. **User makes request** to any route (except `/admin/*`)
2. **Middleware captures** request metadata:
   - Anonymized IP (e.g., `192.168.1.0` instead of `192.168.1.123`)
   - User agent string
   - Path with cleaned query parameters
   - Timestamp
3. **Data sent to cache** (in-memory cache, future: Redis)
4. **Batch processor** writes to database when:
   - Cache reaches 500 items, OR
   - 1 second has elapsed since last write
5. **Database stores** analytics events for querying

#### 2. Batch Processing Strategy

The batch processor uses a dual-trigger approach for efficiency:

- **Volume Trigger**: When cache reaches 500 items, immediately flush to DB
- **Time Trigger**: Every 1 second, flush any pending items to DB

This ensures:
- Minimal database write operations (improved performance)
- Low latency for analytics data (max 1 second delay)
- No impact on user-facing request performance

#### 3. Data Privacy & Cleaning

**IP Anonymization**:
- IPv4: Last octet set to 0 (e.g., `192.168.1.123` → `192.168.1.0`)
- IPv6: Last 80 bits set to 0 (e.g., `2001:db8::1` → `2001:db8::`)

**Path Cleaning**:
- Sensitive query parameters removed (e.g., `token`, `secret`, `password`)
- User IDs generalized (e.g., `/user/123` → `/user/:id`)
- Session identifiers stripped

### Database Schema

```typescript
// src/db/schema/analytics-events.ts
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  anonymizedIp: text("anonymized_ip").notNull(),
  userAgent: text("user_agent").notNull(),
  path: text("path").notNull(),
  referer: text("referer"),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
})
```

### Admin Dashboard Features

The admin analytics dashboard (`/admin/analytics`) provides:

1. **Overview Statistics**:
   - Total page views
   - Unique visitors (estimated by anonymized IP)
   - Top pages
   - Average session duration

2. **Interactive Charts** (using Chart.js + Alpine.js):
   - **Time Series Chart**: Page views over time (24h, 7d, 30d views)
   - **Top Pages Chart**: Most visited pages (bar chart)
   - **Browser Statistics**: Browser/device breakdown (pie chart)
   - **Referrer Sources**: Traffic sources (bar chart)

3. **Real-time Updates**:
   - Uses Hotwire Turbo for seamless data updates
   - Alpine.js for interactive filtering and date range selection
   - No full page reloads required

### API Endpoints

**Admin Analytics Routes** (`/admin/analytics`):

```typescript
// GET /admin/analytics
// Renders the main analytics dashboard

// GET /admin/analytics/api/stats?period=7d
// Returns aggregate statistics for the specified period
// Response: { totalViews, uniqueVisitors, topPages, ... }

// GET /admin/analytics/api/chart-data?type=timeseries&period=24h
// Returns data for specific chart type
// Response: { labels: [...], datasets: [...] }
```

### Usage in Code

#### Applying Analytics Middleware

```typescript
// src/main.ts
import { analyticsMiddleware } from "@/features/analytics/middleware/analytics-collector.js"

const app = new Hono()

// Apply to all routes except admin
app.use("*", async (c, next) => {
  if (!c.req.path.startsWith("/admin")) {
    return analyticsMiddleware(c, next)
  }
  return next()
})
```

#### Querying Analytics Data

```typescript
import {
  getAnalyticsForPeriod,
  getTopPages,
  getBrowserStats
} from "@/db/queries/analytics-events.js"

// Get last 7 days of analytics
const stats = await getAnalyticsForPeriod(7)

// Get top 10 pages
const topPages = await getTopPages(10)

// Get browser breakdown
const browsers = await getBrowserStats()
```

### Implementation Structure

```
src/features/analytics/
├── admin/                          # Admin-only analytics dashboard
│   ├── index.tsx                   # Admin router
│   ├── actions/
│   │   ├── get-stats.ts            # Fetch aggregate statistics
│   │   └── get-chart-data.ts       # Fetch chart-specific data
│   ├── views/
│   │   ├── AnalyticsPage.tsx       # Main dashboard
│   │   └── components/
│   │       ├── StatsCard.tsx       # Stat display card
│   │       ├── TimeSeriesChart.tsx # Page views over time
│   │       ├── TopPagesChart.tsx   # Popular pages
│   │       ├── BrowsersChart.tsx   # Browser breakdown
│   │       └── ReferrersChart.tsx  # Traffic sources
│   └── admin.test.ts
├── middleware/
│   ├── analytics-collector.ts      # Request collection middleware
│   └── analytics-collector.test.ts
├── lib/
│   ├── batch-processor.ts          # Batch write logic
│   ├── batch-processor.test.ts
│   ├── ip-anonymizer.ts            # IP anonymization
│   ├── ip-anonymizer.test.ts
│   ├── path-cleaner.ts             # Path sanitization
│   └── path-cleaner.test.ts
└── types.ts                         # Analytics type definitions

src/shared/lib/cache/
├── cache.interface.ts               # Generic cache interface
├── in-memory-cache.ts               # In-memory implementation
└── in-memory-cache.test.ts

src/shared/lib/storage/
├── storage.interface.ts             # Generic storage interface
├── local-filesystem.ts              # Local FS implementation
└── local-filesystem.test.ts

src/db/schema/
└── analytics-events.ts              # Analytics DB schema

src/db/queries/
├── analytics-events.ts              # Analytics queries
└── analytics-events.test.ts
```

### Performance Considerations

1. **Batch Writes**: Reduces database load by batching inserts
2. **Non-blocking**: Middleware doesn't wait for cache/DB operations
3. **Efficient Queries**: Database queries use indexes on timestamp and path
4. **Caching**: Future Redis support for distributed caching
5. **No Client Impact**: Analytics collection is server-side only

### Future Enhancements

- **Redis Cache**: Replace in-memory cache with Redis for multi-instance support
- **S3 Storage**: Archive old analytics data to S3 for long-term storage
- **Advanced Filtering**: Filter by date range, page, referrer in dashboard
- **Export Functionality**: Export analytics data as CSV/JSON
- **Real-time Dashboard**: WebSocket updates for live analytics
- **Custom Events**: Track custom events (clicks, form submissions, etc.)

### Testing

All analytics components include comprehensive tests:

- **Unit Tests**: Individual functions (IP anonymization, path cleaning)
- **Integration Tests**: Middleware, batch processor, database queries
- **E2E Tests**: Full analytics flow from request to dashboard display

Run tests with:
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
```

---

**Last Updated**: 2025-11-18
**Maintained by**: AI assistants should keep this document current as the project evolves
