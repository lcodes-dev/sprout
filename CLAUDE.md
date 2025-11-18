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

## Blog System

The blog system is a full-featured content management feature that spans both the admin panel and public frontend. It provides a complete blogging solution with categories, posts, and file attachments.

### Blog Features

**Admin Panel**:
- List all blog posts with filtering and search
- Create new blog posts with rich content
- Edit existing posts
- Publish/unpublish posts (draft/published status)
- Delete posts
- Manage categories
- Upload and manage attachments (images and downloadable files)
- Interactive UI with Alpine.js and Hotwire Turbo

**Frontend**:
- Browse published blog posts
- Filter posts by category
- View individual post details
- Display post images in galleries
- Download attached files
- Responsive design with Tailwind CSS

### Blog Database Schema

The blog system uses three main tables:

#### 1. Categories Table
```typescript
// src/db/schema/categories.ts
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
})
```

#### 2. Posts Table
```typescript
// src/db/schema/posts.ts
export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  categoryId: integer("category_id").references(() => categories.id),
  authorId: integer("author_id").notNull().references(() => users.id),
  status: text("status").notNull().default("draft"), // 'draft' or 'published'
  publishedAt: text("published_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
})
```

#### 3. Post Attachments Table
```typescript
// src/db/schema/post-attachments.ts
export const postAttachments = sqliteTable("post_attachments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // 'image' or 'download'
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
})
```

### Blog Directory Structure

```
src/features/blog/
├── admin/                          # Admin panel functionality
│   ├── index.ts                    # Admin router
│   ├── actions/
│   │   ├── post-list.ts           # List all posts
│   │   ├── post-create.ts         # Show create form
│   │   ├── post-store.ts          # Handle post creation
│   │   ├── post-edit.ts           # Show edit form
│   │   ├── post-update.ts         # Handle post updates
│   │   ├── post-delete.ts         # Handle post deletion
│   │   ├── post-publish.ts        # Toggle publish status
│   │   ├── category-list.ts       # List categories
│   │   ├── category-store.ts      # Create category
│   │   ├── category-update.ts     # Update category
│   │   ├── category-delete.ts     # Delete category
│   │   └── upload-attachment.ts   # Handle file uploads
│   ├── views/
│   │   ├── layout.tsx             # Admin layout wrapper
│   │   ├── post-list.tsx          # Posts listing page
│   │   ├── post-form.tsx          # Post create/edit form
│   │   └── category-manager.tsx   # Category management UI
│   └── components/
│       ├── post-card.tsx          # Post preview card
│       ├── status-badge.tsx       # Draft/Published badge
│       ├── attachment-uploader.tsx # File upload component
│       └── category-select.tsx    # Category dropdown
├── frontend/                       # Public frontend
│   ├── index.ts                    # Frontend router
│   ├── actions/
│   │   ├── blog-list.ts           # List published posts
│   │   ├── blog-show.ts           # Show single post
│   │   └── blog-category.ts       # Filter by category
│   ├── views/
│   │   ├── blog-list.tsx          # Blog listing page
│   │   ├── blog-post.tsx          # Single post view
│   │   └── blog-sidebar.tsx       # Category filters
│   └── components/
│       ├── post-preview.tsx       # Post preview card
│       ├── category-filter.tsx    # Category filter widget
│       ├── attachment-gallery.tsx # Image gallery
│       └── download-list.tsx      # Downloadable files list
└── shared/
    ├── types.ts                    # Shared TypeScript types
    └── utils.ts                    # Shared utilities (slug generation, etc.)
```

### Storage System

The blog uses an abstracted storage interface to support multiple storage backends:

```typescript
// src/shared/lib/storage/interface.ts
export interface StorageProvider {
  save(file: File, path: string): Promise<string>
  delete(path: string): Promise<void>
  exists(path: string): Promise<boolean>
  getUrl(path: string): string
}
```

**Current Implementation**: Local filesystem storage
**Future Support**: AWS S3, CloudFlare R2, etc.

**Storage locations**:
- Uploaded files: `uploads/blog/` directory
- Images: `uploads/blog/images/`
- Downloads: `uploads/blog/downloads/`

### Blog Routes

**Admin Routes** (prefix: `/admin/blog`):
- `GET /admin/blog` - List all posts
- `GET /admin/blog/create` - Show create form
- `POST /admin/blog` - Create new post
- `GET /admin/blog/:id/edit` - Show edit form
- `POST /admin/blog/:id` - Update post
- `POST /admin/blog/:id/delete` - Delete post
- `POST /admin/blog/:id/publish` - Toggle publish status
- `GET /admin/blog/categories` - Manage categories
- `POST /admin/blog/categories` - Create category
- `POST /admin/blog/categories/:id` - Update category
- `DELETE /admin/blog/categories/:id` - Delete category
- `POST /admin/blog/upload` - Upload attachment

**Frontend Routes** (prefix: `/blog`):
- `GET /blog` - List published posts
- `GET /blog/:slug` - View single post
- `GET /blog/category/:slug` - Filter by category

### Using Alpine.js and Hotwire

**Example: Post Editor with Alpine.js**
```typescript
// In post-form.tsx
<div x-data="postEditor()">
  <input type="text" x-model="title" @input="generateSlug" />
  <input type="text" x-model="slug" />
  <select x-model="status">
    <option value="draft">Draft</option>
    <option value="published">Published</option>
  </select>
</div>
```

**Example: Category Filter with Turbo**
```typescript
// In blog-list.tsx
<form data-turbo-frame="posts" data-turbo-action="advance">
  <select name="category" data-turbo-submit-on-change>
    <option value="">All Categories</option>
    {categories.map(cat => <option value={cat.id}>{cat.name}</option>)}
  </select>
</form>

<turbo-frame id="posts">
  {/* Post list content */}
</turbo-frame>
```

### Testing Strategy

All blog components include comprehensive tests:

1. **Database Query Tests**: Test CRUD operations for posts, categories, and attachments
2. **Storage Tests**: Test file upload, deletion, and retrieval
3. **Route Handler Tests**: Test HTTP endpoints and responses
4. **Component Tests**: Test JSX rendering and props
5. **Integration Tests**: Test complete workflows (create post, upload files, publish)

See `src/features/blog/*/actions/*.test.ts` and `src/db/queries/*.test.ts` for examples.

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

- [ ] **Implement Blog System**
  - [ ] **Phase 1: Database Schema**
    - [ ] Create categories schema (`src/db/schema/categories.ts`)
    - [ ] Create posts schema (`src/db/schema/posts.ts`)
    - [ ] Create post attachments schema (`src/db/schema/post-attachments.ts`)
    - [ ] Export schemas from `src/db/schema/index.ts`
    - [ ] Run `npm run db:push` to sync schema
    - [ ] Write tests for schema types and constraints

  - [ ] **Phase 2: Database Queries**
    - [ ] Create categories queries (`src/db/queries/categories.ts`)
      - [ ] getAllCategories()
      - [ ] getCategoryById()
      - [ ] getCategoryBySlug()
      - [ ] createCategory()
      - [ ] updateCategory()
      - [ ] deleteCategory()
    - [ ] Create posts queries (`src/db/queries/posts.ts`)
      - [ ] getAllPosts() with filters (status, category, author)
      - [ ] getPostById() with relations
      - [ ] getPostBySlug() with relations
      - [ ] createPost()
      - [ ] updatePost()
      - [ ] deletePost()
      - [ ] publishPost() / unpublishPost()
    - [ ] Create post attachments queries (`src/db/queries/post-attachments.ts`)
      - [ ] getAttachmentsByPostId()
      - [ ] createAttachment()
      - [ ] deleteAttachment()
      - [ ] updateDisplayOrder()
    - [ ] Write comprehensive tests for all query functions

  - [ ] **Phase 3: Storage Interface**
    - [ ] Create storage interface (`src/shared/lib/storage/interface.ts`)
      - [ ] Define StorageProvider interface
      - [ ] Define File type/interface
    - [ ] Implement local storage (`src/shared/lib/storage/local-storage.ts`)
      - [ ] Implement save() method
      - [ ] Implement delete() method
      - [ ] Implement exists() method
      - [ ] Implement getUrl() method
      - [ ] Handle directory creation
      - [ ] Handle file validation
    - [ ] Create storage factory (`src/shared/lib/storage/storage-factory.ts`)
      - [ ] Return appropriate storage provider based on config
    - [ ] Write tests for storage interface and local implementation
    - [ ] Create uploads directory structure

  - [ ] **Phase 4: Shared Blog Utilities**
    - [ ] Create shared types (`src/features/blog/shared/types.ts`)
      - [ ] PostWithRelations type
      - [ ] CategoryWithCount type
      - [ ] AttachmentUpload type
      - [ ] PostFormData type
    - [ ] Create shared utilities (`src/features/blog/shared/utils.ts`)
      - [ ] generateSlug() function
      - [ ] validateFileType() function
      - [ ] formatFileSize() function
      - [ ] formatDate() function
    - [ ] Write tests for utility functions

  - [ ] **Phase 5: Admin Panel - Components**
    - [ ] Create admin layout (`src/features/blog/admin/views/layout.tsx`)
    - [ ] Create post card component (`src/features/blog/admin/components/post-card.tsx`)
    - [ ] Create status badge component (`src/features/blog/admin/components/status-badge.tsx`)
    - [ ] Create attachment uploader (`src/features/blog/admin/components/attachment-uploader.tsx`)
    - [ ] Create category select (`src/features/blog/admin/components/category-select.tsx`)
    - [ ] Write tests for components

  - [ ] **Phase 6: Admin Panel - Views**
    - [ ] Create post list view (`src/features/blog/admin/views/post-list.tsx`)
      - [ ] Table/grid layout
      - [ ] Filter controls (status, category)
      - [ ] Search functionality
      - [ ] Pagination
      - [ ] Alpine.js for interactivity
    - [ ] Create post form view (`src/features/blog/admin/views/post-form.tsx`)
      - [ ] Title and slug fields
      - [ ] Content editor (textarea for now)
      - [ ] Excerpt field
      - [ ] Category select
      - [ ] Status select (draft/published)
      - [ ] Attachment uploader
      - [ ] Alpine.js for slug generation
    - [ ] Create category manager view (`src/features/blog/admin/views/category-manager.tsx`)
      - [ ] List existing categories
      - [ ] Inline editing
      - [ ] Delete functionality
    - [ ] Write tests for views

  - [ ] **Phase 7: Admin Panel - Actions**
    - [ ] Create post list action (`src/features/blog/admin/actions/post-list.ts`)
    - [ ] Create post create action (`src/features/blog/admin/actions/post-create.ts`)
    - [ ] Create post store action (`src/features/blog/admin/actions/post-store.ts`)
    - [ ] Create post edit action (`src/features/blog/admin/actions/post-edit.ts`)
    - [ ] Create post update action (`src/features/blog/admin/actions/post-update.ts`)
    - [ ] Create post delete action (`src/features/blog/admin/actions/post-delete.ts`)
    - [ ] Create post publish action (`src/features/blog/admin/actions/post-publish.ts`)
    - [ ] Create category list action (`src/features/blog/admin/actions/category-list.ts`)
    - [ ] Create category store action (`src/features/blog/admin/actions/category-store.ts`)
    - [ ] Create category update action (`src/features/blog/admin/actions/category-update.ts`)
    - [ ] Create category delete action (`src/features/blog/admin/actions/category-delete.ts`)
    - [ ] Create upload attachment action (`src/features/blog/admin/actions/upload-attachment.ts`)
    - [ ] Write tests for all actions

  - [ ] **Phase 8: Admin Panel - Router**
    - [ ] Create admin router (`src/features/blog/admin/index.ts`)
    - [ ] Register all routes
    - [ ] Add middleware (authentication, etc.)
    - [ ] Write integration tests for router

  - [ ] **Phase 9: Frontend - Components**
    - [ ] Create post preview component (`src/features/blog/frontend/components/post-preview.tsx`)
    - [ ] Create category filter component (`src/features/blog/frontend/components/category-filter.tsx`)
    - [ ] Create attachment gallery component (`src/features/blog/frontend/components/attachment-gallery.tsx`)
    - [ ] Create download list component (`src/features/blog/frontend/components/download-list.tsx`)
    - [ ] Write tests for components

  - [ ] **Phase 10: Frontend - Views**
    - [ ] Create blog list view (`src/features/blog/frontend/views/blog-list.tsx`)
      - [ ] Post grid/list
      - [ ] Category sidebar/filter
      - [ ] Pagination
      - [ ] Turbo frame for filtering
    - [ ] Create blog post view (`src/features/blog/frontend/views/blog-post.tsx`)
      - [ ] Post title and metadata
      - [ ] Content rendering
      - [ ] Image gallery
      - [ ] Download section
      - [ ] Category link
    - [ ] Create blog sidebar view (`src/features/blog/frontend/views/blog-sidebar.tsx`)
      - [ ] Category list with counts
      - [ ] Recent posts
    - [ ] Write tests for views

  - [ ] **Phase 11: Frontend - Actions**
    - [ ] Create blog list action (`src/features/blog/frontend/actions/blog-list.ts`)
      - [ ] Fetch published posts
      - [ ] Apply category filter
      - [ ] Pagination
    - [ ] Create blog show action (`src/features/blog/frontend/actions/blog-show.ts`)
      - [ ] Fetch post by slug
      - [ ] Include attachments
      - [ ] 404 handling
    - [ ] Create blog category action (`src/features/blog/frontend/actions/blog-category.ts`)
      - [ ] Filter posts by category
    - [ ] Write tests for all actions

  - [ ] **Phase 12: Frontend - Router**
    - [ ] Create frontend router (`src/features/blog/frontend/index.ts`)
    - [ ] Register all routes
    - [ ] Write integration tests for router

  - [ ] **Phase 13: Integration & Testing**
    - [ ] Integrate admin router into main app
    - [ ] Integrate frontend router into main app
    - [ ] Create end-to-end tests
      - [ ] Test complete post creation workflow
      - [ ] Test file upload and display
      - [ ] Test publish/unpublish workflow
      - [ ] Test category filtering
    - [ ] Test Hotwire Turbo interactions
    - [ ] Test Alpine.js interactivity
    - [ ] Verify responsive design

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
