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

## Feature Flag System

The application includes a comprehensive feature flag management system that allows administrators to control feature rollouts with percentage-based targeting.

### Overview

Feature flags (also known as feature toggles) enable you to:
- Enable/disable features without code deployment
- Gradually roll out features to a percentage of users
- A/B test new functionality
- Quickly disable problematic features

### Architecture

The feature flag system consists of three main components:

1. **Database Layer** (`src/db/schema/feature-flags.ts`)
   - Stores feature flag configuration
   - Tracks flag status, percentage rollout, and metadata

2. **Cache Layer** (`src/shared/lib/feature-flags/cache.ts`)
   - In-memory cache of all feature flags
   - Automatically refreshes on application startup and flag changes
   - Provides fast flag lookups without database queries

3. **Utility Functions** (`src/shared/lib/feature-flags/index.ts`)
   - `isFeatureEnabled(key: string, userId?: number): boolean`
   - `getFeatureFlagPercentage(key: string): number`
   - `refreshFeatureFlagCache(): Promise<void>`

### Database Schema

```typescript
// src/db/schema/feature-flags.ts
export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  active: boolean("active").notNull().default(false),
  percentage: integer("percentage").notNull().default(0), // 0-100
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
})
```

### Using Feature Flags

**In route handlers:**
```typescript
import { isFeatureEnabled } from '@/shared/lib/feature-flags'

app.get('/new-feature', async (c) => {
  const userId = c.get('userId') // from auth middleware

  if (!isFeatureEnabled('new_dashboard', userId)) {
    return c.text('Feature not available', 404)
  }

  // Feature code here
  return c.html(<NewDashboard />)
})
```

**In views (JSX):**
```typescript
import { isFeatureEnabled } from '@/shared/lib/feature-flags'

export const Dashboard: FC = () => {
  const showNewUI = isFeatureEnabled('new_ui_redesign')

  return (
    <div>
      {showNewUI ? <NewUI /> : <OldUI />}
    </div>
  )
}
```

**Percentage-based rollout:**
When a feature flag has a percentage set (e.g., 25%), the system will:
1. If no userId is provided, use the percentage as a global probability
2. If userId is provided, use deterministic hashing to ensure the same user always gets the same result
3. Return true for approximately 25% of users

### Admin Panel

Administrators can manage feature flags through the admin panel at `/admin/feature-flags`:

**Features:**
- View all feature flags in a table
- Toggle flags on/off with a switch
- Edit percentage rollout with a slider
- Create new feature flags
- Delete existing flags
- See last update timestamp

**Components:**
- `FeatureFlagsPage` - Main page layout
- `FeatureFlagTable` - Table displaying all flags
- `FeatureFlagRow` - Individual flag row with inline editing
- `CreateFlagModal` - Modal for creating new flags
- `DeleteConfirmModal` - Confirmation dialog for deletion

**Interactivity:**
- Uses Alpine.js for client-side state management
- Uses Hotwire Turbo for form submissions and updates
- Real-time UI updates without page refreshes
- Optimistic UI updates for better UX

### Cache Invalidation

The cache is automatically refreshed when:
1. Application starts up
2. A flag is created, updated, or deleted via admin panel
3. Manual refresh via `refreshFeatureFlagCache()`

### Best Practices

1. **Flag Naming**: Use descriptive, lowercase names with underscores (e.g., `new_checkout_flow`)
2. **Cleanup**: Remove flags once features are fully rolled out
3. **Testing**: Always test both enabled and disabled states
4. **Documentation**: Document what each flag controls
5. **Monitoring**: Track flag usage and performance impact

### Security Considerations

- Admin panel should be protected by authentication middleware
- Feature flag keys should not contain sensitive information
- Cache is stored in memory (lost on restart, but automatically rebuilt)
- SQL injection prevented by Drizzle ORM parameterization

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

- [ ] **Feature Flag Management System**
  - [ ] **Database Layer**
    - [ ] Create `src/db/schema/feature-flags.ts`
      - [ ] Define `featureFlags` table with pgTable
      - [ ] Add fields: id (serial, primary key)
      - [ ] Add fields: key (text, not null, unique)
      - [ ] Add fields: active (boolean, not null, default false)
      - [ ] Add fields: percentage (integer, not null, default 0)
      - [ ] Add fields: updatedAt (timestamp, not null, auto-update)
      - [ ] Export FeatureFlag and NewFeatureFlag types
    - [ ] Export schema from `src/db/schema/index.ts`
    - [ ] Run `npm run db:push` to sync schema

  - [ ] **Query Utilities**
    - [ ] Create `src/db/queries/feature-flags.ts`
      - [ ] Implement `getAllFeatureFlags(): Promise<FeatureFlag[]>`
      - [ ] Implement `getFeatureFlagByKey(key: string): Promise<FeatureFlag | undefined>`
      - [ ] Implement `getFeatureFlagById(id: number): Promise<FeatureFlag | undefined>`
      - [ ] Implement `createFeatureFlag(data: NewFeatureFlag): Promise<FeatureFlag>`
      - [ ] Implement `updateFeatureFlag(id: number, data: Partial<NewFeatureFlag>): Promise<FeatureFlag | undefined>`
      - [ ] Implement `deleteFeatureFlag(id: number): Promise<boolean>`
      - [ ] Implement `toggleFeatureFlag(id: number): Promise<FeatureFlag | undefined>`
      - [ ] Add comprehensive JSDoc documentation
    - [ ] Create `src/db/queries/feature-flags.test.ts`
      - [ ] Test getAllFeatureFlags with empty database
      - [ ] Test getAllFeatureFlags with multiple flags
      - [ ] Test getFeatureFlagByKey with existing and non-existing keys
      - [ ] Test getFeatureFlagById with valid and invalid IDs
      - [ ] Test createFeatureFlag with valid data
      - [ ] Test createFeatureFlag with duplicate key (should fail)
      - [ ] Test updateFeatureFlag for active status
      - [ ] Test updateFeatureFlag for percentage
      - [ ] Test deleteFeatureFlag with existing and non-existing IDs
      - [ ] Test toggleFeatureFlag switching from false to true and vice versa

  - [ ] **Cache System**
    - [ ] Create `src/shared/lib/feature-flags/cache.ts`
      - [ ] Define in-memory cache Map<string, FeatureFlag>
      - [ ] Implement `initializeCache(): Promise<void>` - loads all flags on startup
      - [ ] Implement `getFromCache(key: string): FeatureFlag | undefined`
      - [ ] Implement `getAllFromCache(): FeatureFlag[]`
      - [ ] Implement `updateCache(flag: FeatureFlag): void`
      - [ ] Implement `removeFromCache(key: string): void`
      - [ ] Implement `refreshCache(): Promise<void>` - reloads all flags
      - [ ] Add error handling and logging
    - [ ] Create `src/shared/lib/feature-flags/cache.test.ts`
      - [ ] Test initializeCache populates cache correctly
      - [ ] Test getFromCache returns correct flag
      - [ ] Test getFromCache returns undefined for missing key
      - [ ] Test getAllFromCache returns all cached flags
      - [ ] Test updateCache adds new flag
      - [ ] Test updateCache updates existing flag
      - [ ] Test removeFromCache removes flag
      - [ ] Test refreshCache reloads all flags

  - [ ] **Utility Functions**
    - [ ] Create `src/shared/lib/feature-flags/index.ts`
      - [ ] Implement `isFeatureEnabled(key: string, userId?: number): boolean`
        - [ ] Check if flag exists in cache
        - [ ] If not active, return false
        - [ ] If percentage is 0, return false
        - [ ] If percentage is 100, return true
        - [ ] If userId provided, use deterministic hash (userId % 100 < percentage)
        - [ ] If no userId, use random probability based on percentage
      - [ ] Implement `getFeatureFlagPercentage(key: string): number`
        - [ ] Return percentage from cache or 0 if not found
      - [ ] Implement `getFeatureFlag(key: string): FeatureFlag | undefined`
        - [ ] Return flag from cache
      - [ ] Export cache management functions (initializeCache, refreshCache)
      - [ ] Add comprehensive JSDoc documentation
    - [ ] Create `src/shared/lib/feature-flags/index.test.ts`
      - [ ] Test isFeatureEnabled returns false for non-existent flag
      - [ ] Test isFeatureEnabled returns false when flag is inactive
      - [ ] Test isFeatureEnabled returns false when percentage is 0
      - [ ] Test isFeatureEnabled returns true when percentage is 100
      - [ ] Test isFeatureEnabled with userId uses deterministic logic
      - [ ] Test isFeatureEnabled without userId uses probability
      - [ ] Test getFeatureFlagPercentage returns correct value
      - [ ] Test getFeatureFlagPercentage returns 0 for missing flag
      - [ ] Test getFeatureFlag returns correct flag
      - [ ] Test getFeatureFlag returns undefined for missing flag

  - [ ] **Application Initialization**
    - [ ] Update `src/main.ts`
      - [ ] Import `initializeCache` from feature flags
      - [ ] Call `initializeCache()` before starting server
      - [ ] Add error handling for cache initialization
      - [ ] Log successful cache initialization

  - [ ] **Admin Feature Structure**
    - [ ] Create directory `src/features/feature-flags/`
    - [ ] Create directory `src/features/feature-flags/admin/`
    - [ ] Create directory `src/features/feature-flags/admin/actions/`
    - [ ] Create directory `src/features/feature-flags/admin/views/`
    - [ ] Create directory `src/features/feature-flags/admin/components/`

  - [ ] **Admin Routes**
    - [ ] Create `src/features/feature-flags/admin/index.tsx`
      - [ ] Create Hono router for `/admin/feature-flags`
      - [ ] GET `/` - display feature flags page
      - [ ] POST `/` - create new feature flag
      - [ ] PATCH `/:id/toggle` - toggle flag active status
      - [ ] PATCH `/:id/percentage` - update flag percentage
      - [ ] DELETE `/:id` - delete feature flag
      - [ ] Import all action handlers
      - [ ] Add error handling middleware
    - [ ] Create `src/features/feature-flags/admin/index.test.ts`
      - [ ] Test GET / returns feature flags page
      - [ ] Test POST / creates new flag and refreshes cache
      - [ ] Test POST / validates input (key required, percentage 0-100)
      - [ ] Test POST / returns error for duplicate key
      - [ ] Test PATCH /:id/toggle toggles flag and refreshes cache
      - [ ] Test PATCH /:id/percentage updates percentage and refreshes cache
      - [ ] Test DELETE /:id deletes flag and refreshes cache
      - [ ] Test all routes return appropriate status codes

  - [ ] **Admin Actions**
    - [ ] Create `src/features/feature-flags/admin/actions/list.ts`
      - [ ] Fetch all feature flags from database
      - [ ] Render FeatureFlagsPage with flags
      - [ ] Handle errors gracefully
    - [ ] Create `src/features/feature-flags/admin/actions/create.ts`
      - [ ] Validate request body (key, active, percentage)
      - [ ] Create feature flag in database
      - [ ] Refresh cache
      - [ ] Return success response or error
    - [ ] Create `src/features/feature-flags/admin/actions/toggle.ts`
      - [ ] Get flag ID from params
      - [ ] Toggle flag using query utility
      - [ ] Refresh cache
      - [ ] Return updated flag or error
    - [ ] Create `src/features/feature-flags/admin/actions/update-percentage.ts`
      - [ ] Get flag ID from params
      - [ ] Validate percentage (0-100)
      - [ ] Update flag in database
      - [ ] Refresh cache
      - [ ] Return updated flag or error
    - [ ] Create `src/features/feature-flags/admin/actions/delete.ts`
      - [ ] Get flag ID from params
      - [ ] Delete flag from database
      - [ ] Refresh cache
      - [ ] Return success response or error

  - [ ] **Admin Views**
    - [ ] Create `src/features/feature-flags/admin/views/FeatureFlagsPage.tsx`
      - [ ] Use BaseLayout with title "Feature Flags"
      - [ ] Add page header with title and description
      - [ ] Add "Create New Flag" button that opens modal
      - [ ] Include FeatureFlagTable component
      - [ ] Include CreateFlagModal component
      - [ ] Add Alpine.js data for modal state
      - [ ] Style with Tailwind CSS

  - [ ] **Admin Components**
    - [ ] Create `src/features/feature-flags/admin/components/FeatureFlagTable.tsx`
      - [ ] Accept flags array as prop
      - [ ] Render table with headers: Key, Status, Percentage, Last Updated, Actions
      - [ ] Map flags to FeatureFlagRow components
      - [ ] Show empty state if no flags
      - [ ] Style with Tailwind CSS
    - [ ] Create `src/features/feature-flags/admin/components/FeatureFlagRow.tsx`
      - [ ] Accept flag as prop
      - [ ] Display flag key in first column
      - [ ] Display toggle switch for active status with Alpine.js
      - [ ] Display percentage slider with Alpine.js
      - [ ] Display formatted last updated date
      - [ ] Display delete button with confirmation
      - [ ] Use Turbo for form submissions
      - [ ] Add optimistic UI updates
      - [ ] Style with Tailwind CSS
    - [ ] Create `src/features/feature-flags/admin/components/CreateFlagModal.tsx`
      - [ ] Accept isOpen and onClose props
      - [ ] Render modal backdrop and container
      - [ ] Add form with key input, active checkbox, percentage slider
      - [ ] Use Turbo for form submission
      - [ ] Validate inputs with Alpine.js
      - [ ] Close modal on success
      - [ ] Show validation errors
      - [ ] Style with Tailwind CSS
    - [ ] Create `src/features/feature-flags/admin/components/ToggleSwitch.tsx`
      - [ ] Accept checked and onChange props
      - [ ] Render accessible toggle switch
      - [ ] Use Alpine.js for interactivity
      - [ ] Style with Tailwind CSS
    - [ ] Create `src/features/feature-flags/admin/components/PercentageSlider.tsx`
      - [ ] Accept value and onChange props
      - [ ] Render slider input (0-100)
      - [ ] Display current percentage value
      - [ ] Use Alpine.js for real-time updates
      - [ ] Style with Tailwind CSS

  - [ ] **Frontend Interactivity**
    - [ ] Create `assets/js/lib/feature-flags-admin.ts`
      - [ ] Create Alpine.js component for modal management
      - [ ] Create Alpine.js component for toggle switch
      - [ ] Create Alpine.js component for percentage slider
      - [ ] Create Alpine.js component for delete confirmation
      - [ ] Add Turbo form handlers for async submissions
      - [ ] Add optimistic UI update helpers
    - [ ] Update `assets/js/main.ts` if needed
      - [ ] Register feature flag admin components

  - [ ] **Register Admin Routes**
    - [ ] Update `src/main.ts`
      - [ ] Import feature flags admin router
      - [ ] Mount router at `/admin/feature-flags`

  - [ ] **Documentation**
    - [ ] Verify CLAUDE.md has complete feature flag documentation
    - [ ] Add inline code comments where needed
    - [ ] Create example usage snippets

  - [ ] **Integration Testing**
    - [ ] Create `src/features/feature-flags/admin/integration.test.ts`
      - [ ] Test complete flow: create -> toggle -> update percentage -> delete
      - [ ] Test cache invalidation after each operation
      - [ ] Test concurrent updates
      - [ ] Test error scenarios

### Phase 3: Production Readiness

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

---

**Last Updated**: 2025-11-18
**Maintained by**: AI assistants should keep this document current as the project evolves
