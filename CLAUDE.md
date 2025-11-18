# CLAUDE.md - AI Assistant Guide for Sprout

## Project Overview

**Sprout** is a lightweight web application built with [Deno](https://deno.land/) and the [Hono](https://hono.dev/) web framework. This project is a modern, full-featured starter kit leveraging Deno's built-in TypeScript support and Hono's fast, Express-like API.

**Current State**: Early stage / minimal setup with a single "Hello World" endpoint.

## Technology Stack

- **Runtime**: Deno (latest stable)
- **Web Framework**: Hono v4.10.6+
- **Language**: TypeScript (via Deno's native support)
- **JSX Support**: Precompiled JSX with Hono's JSX runtime (SSR ONLY)
- **Hotwire**: The project will integrate with [Hotwire Turbo](https://turbo.hotwired.dev/) and [Hotwire Stimulus](https://stimulus.hotwired.dev/)
- **CSS Framework**: Tailwind CSS (with build process)
- **Frontend JS**: ES modules served as static assets

## Project Structure

```
sprout/
├── .git/               # Git repository
├── .gitignore          # Git ignore rules (ignores .vscode)
├── README.md           # Basic usage instructions
├── deno.json           # Deno configuration and dependencies
└── main.ts             # Application entry point
```

### Expected Directory Structure (as project grows)

```
sprout/
├── src/main.ts                     # Entry point
├── src/features/                   # Each feature will have a subdirectory here
├── deno.json                       # Configuration
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
│       ├── controllers/            # Stimulus controllers
│       ├── lib/                    # Shared frontend utilities
│       └── main.ts                 # Frontend entry point
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

### Running the Application

```bash
deno task start
# Equivalent to: deno run --allow-net main.ts
```

The server will start and listen on the default port (typically 8000).

### Development Commands

- **Start server**: `deno task start`
- **Run with watch mode**: `deno run --allow-net --watch main.ts`
- **Build CSS**: `deno task build:css` - Compile Tailwind CSS
- **Watch CSS**: `deno task watch:css` - Watch and rebuild CSS on changes
- **Build JS**: `deno task build:js` - Bundle frontend JavaScript
- **Watch JS**: `deno task watch:js` - Watch and rebuild JS on changes
- **Build all assets**: `deno task build` - Build both CSS and JS
- **Dev mode**: `deno task dev` - Start server and watch all assets
- **Format code**: `deno fmt`
- **Lint code**: `deno lint`
- **Type check**: `deno check main.ts`

### Testing

Currently, no test framework is configured. When adding tests:

1. Use Deno's built-in test runner
2. Place test files adjacent to source files. Each feature will have a test file for each action. There can also be a test file for the router that tests calling routes.
3. Name test files with `.test.ts` suffix
4. Run with: `deno test --allow-net`

## Dependencies

### Managing Dependencies

Dependencies are managed via `deno.json` imports map:

```json
{
  "imports": {
    "hono": "jsr:@hono/hono@^4.10.6"
  }
}
```

**To add a new dependency**:
1. Add to the `imports` section in `deno.json`
2. Use JSR (`jsr:`) for Deno-first packages
3. Use npm (`npm:`) prefix for npm packages if needed
4. Use specific version ranges (e.g., `^4.10.6`)

**No lock file**: Deno projects can optionally use `deno.lock`. Consider adding one for reproducible builds:
```bash
deno cache --lock=deno.lock --lock-write main.ts
```

## Code Conventions

### General Guidelines

1. **TypeScript First**: Use TypeScript for all code
2. **Formatting**: Use Deno's built-in formatter (`deno fmt`)
3. **Linting**: Follow Deno's linting rules (`deno lint`)
4. **Imports**: Use explicit file extensions (`.ts`, `.tsx`) in imports
5. **No npm_modules**: Deno doesn't use `node_modules`; dependencies are cached globally

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
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

Deno.serve(app.fetch)
```

**Key Points**:
- Uses `Deno.serve()` to start the server
- Hono's `app.fetch` is passed directly to the serve function
- Currently only has one GET route at `/`

## AI Assistant Guidelines

### When Working on This Project

1. **Always use Deno conventions**:
   - No `require()`, use ES imports
   - No `package.json`, use `deno.json`
   - Include file extensions in imports
   - Use Deno's built-in APIs when possible

2. **Permission flags**: Remember Deno uses explicit permissions:
   - `--allow-net` for network access (required for web server)
   - `--allow-read` for file system reads
   - `--allow-write` for file system writes
   - `--allow-env` for environment variables

3. **Adding new features**:
   - Keep routes modular; consider separating into `routes/` directory
   - Add middleware to `middleware/` directory
   - Update `deno.json` tasks as needed
   - Run `deno fmt` before committing
   - Run `deno lint` to check for issues

4. **Dependencies**:
   - Prefer JSR packages over npm when available
   - Always specify version constraints
   - Test after adding new dependencies
   - Document any required permissions

5. **TypeScript**:
   - Leverage Deno's native TypeScript support
   - No need for `tsconfig.json` (use `deno.json` compilerOptions)
   - Type check with `deno check`

6. **Error Handling**:
   - Use try-catch blocks for async operations
   - Return appropriate HTTP status codes
   - Log errors appropriately (Deno has `console` built-in)

7. **Environment Variables**:
   - Use `Deno.env.get()` to access environment variables
   - Consider using a `.env` file with `--allow-env --allow-read`
   - Add `.env` to `.gitignore` if using

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
4. Run `deno task build:css` or use watch mode during development
5. Compiled CSS is output to `static/css/main.css`
6. Reference in HTML: `<link rel="stylesheet" href="/static/css/main.css">`

**Configuration**:
- `tailwind.config.ts` - Configure theme, plugins, content paths
- Content paths should include all JSX files: `src/**/*.{ts,tsx}`

### Frontend JavaScript

Frontend JavaScript (Stimulus controllers, utilities) is organized separately from backend code.

**Structure**:
- `assets/js/controllers/` - Stimulus controllers
- `assets/js/lib/` - Shared frontend utilities
- `assets/js/main.ts` - Entry point that imports and registers controllers

**Workflow**:
1. Write TypeScript in `assets/js/`
2. Run `deno task build:js` to bundle/transpile
3. Output is written to `static/js/main.js`
4. Reference in HTML: `<script type="module" src="/static/js/main.js"></script>`

**Stimulus Controllers**:
```typescript
// assets/js/controllers/hello_controller.ts
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["name"]

  greet() {
    console.log(`Hello, ${this.nameTarget.textContent}!`)
  }
}
```

### Static File Serving

The application serves static files from the `static/` directory using Hono's static file middleware.

**Setup**:
```typescript
import { serveStatic } from 'hono/deno'

app.use('/static/*', serveStatic({ root: './' }))
```

## Database (Drizzle ORM)

The project uses **Drizzle ORM** with a **code-first approach** (no migrations). Database schema is defined in TypeScript and synced directly to the database.

### Database Setup

**Quick Start**:
```bash
# 1. Initialize database directory
deno task db:init

# 2. Sync schema to database
deno task db:push

# 3. (Optional) Launch Drizzle Studio
deno task db:studio
```

### Database Configuration

- **Config**: `src/db/config.ts`
- **Connection**: `src/db/connection.ts`
- **Schemas**: `src/db/schema/`
- **Queries**: `src/db/queries/`

**Environment Variables**:
- `DATABASE_URL`: Database connection URL (default: `file:./data/sprout.db`)
- `DATABASE_AUTH_TOKEN`: Auth token for remote databases (optional)
- `DENO_ENV`: Set to `development` for verbose logging

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
3. Run `deno task db:push` to sync schema
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

- `deno task db:init` - Initialize database directory
- `deno task db:push` - Sync schema changes to database
- `deno task db:studio` - Launch Drizzle Studio (database UI)

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
- **Before committing**:
  1. Run `deno fmt` to format code
  2. Run `deno lint` to check for issues
  3. Run `deno check main.ts` to verify types
  4. Build assets with `deno task build`
  5. Test the application with `deno task start`

## Performance Considerations

- **Deno is fast**: Native TypeScript execution
- **Hono is lightweight**: Minimal overhead
- **Streaming**: Consider streaming responses for large data
- **Caching**: Deno caches dependencies; use `--reload` to force refresh

## Security Best Practices

1. **Permissions**: Only grant necessary permissions in `deno.json` tasks
2. **Input Validation**: Always validate user input
3. **Dependencies**: Audit dependencies regularly
4. **Environment**: Never commit secrets; use environment variables
5. **CORS**: Configure CORS middleware if building an API
6. **Headers**: Set security headers (CSP, HSTS, etc.)

## Resources

- [Deno Documentation](https://docs.deno.com/)
- [Hono Documentation](https://hono.dev/)
- [Deno Standard Library](https://deno.land/std)
- [JSR Package Registry](https://jsr.io/)

## Project Status & Roadmap

**Current Version**: Initial setup (v0.1.0)

### Phase 1: Core Infrastructure

#### 1. Tailwind CSS Integration
- [ ] **Install Tailwind CSS dependencies**
  - [ ] Add Tailwind CSS via npm (`npm:tailwindcss`)
  - [ ] Add PostCSS and autoprefixer if needed
  - [ ] Add Tailwind typography plugin (optional)
  - [ ] Update `deno.json` with all CSS build dependencies

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
  - [ ] Add `build:css` task to `deno.json`
  - [ ] Add `watch:css` task for development
  - [ ] Test CSS compilation and output

- [ ] **Configure static file serving**
  - [ ] Add Hono static file middleware
  - [ ] Configure `/static/*` route to serve files
  - [ ] Test serving compiled CSS from `/static/css/main.css`
  - [ ] Add `.gitignore` entry for `static/css/` (built files)

#### 2. Frontend JavaScript Structure
- [ ] **Set up frontend JavaScript directories**
  - [ ] Create `assets/js/` directory structure
  - [ ] Create `assets/js/controllers/` for Stimulus controllers
  - [ ] Create `assets/js/lib/` for utilities
  - [ ] Create `assets/js/main.ts` as entry point

- [ ] **Install Hotwire Stimulus dependencies**
  - [ ] Add `@hotwired/stimulus` via npm to `deno.json`
  - [ ] Add `@hotwired/turbo` via npm to `deno.json`
  - [ ] Verify imports work with Deno

- [ ] **Create JavaScript build process**
  - [ ] Create `static/js/` output directory
  - [ ] Choose bundler (esbuild via npm or deno bundle)
  - [ ] Write build script in `scripts/build-js.ts`
  - [ ] Configure TypeScript compilation for frontend code
  - [ ] Set up source maps for development
  - [ ] Add minification for production builds
  - [ ] Add `build:js` task to `deno.json`
  - [ ] Add `watch:js` task for development
  - [ ] Test JavaScript bundling and output

- [ ] **Create Stimulus application bootstrap**
  - [ ] Write `assets/js/main.ts` to initialize Stimulus
  - [ ] Set up controller auto-registration system
  - [ ] Create example controller (`hello_controller.ts`)
  - [ ] Document controller naming conventions
  - [ ] Test Stimulus initialization in browser

- [ ] **Configure static JavaScript serving**
  - [ ] Verify static middleware serves JS files
  - [ ] Test serving from `/static/js/main.js`
  - [ ] Add `.gitignore` entry for `static/js/` (built files)
  - [ ] Set up proper MIME types for ES modules

#### 3. Unified Build System
- [ ] **Create unified build tasks**
  - [ ] Add `build` task that runs both CSS and JS builds
  - [ ] Add `watch` task for development (watches both)
  - [ ] Add `dev` task that runs server + watch
  - [ ] Create `scripts/build.ts` orchestrator script
  - [ ] Add build validation and error handling

- [ ] **Optimize build performance**
  - [ ] Implement parallel CSS and JS builds
  - [ ] Add build caching where possible
  - [ ] Optimize watch mode to only rebuild changed files
  - [ ] Add build time reporting

- [ ] **Update documentation**
  - [ ] Document build commands in README
  - [ ] Add examples for creating new Stimulus controllers
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
  - [ ] Set up Deno test configuration
  - [ ] Create test utilities
  - [ ] Add example tests for routes
  - [ ] Add CI integration for tests

- [x] **Set up GitHub Actions CI/CD pipeline** ✅
  - [x] Create `.github/workflows/` directory structure
  - [x] Create `ci.yml` workflow file
  - [x] Configure triggers (push to master, pull requests, tags)
  - [x] Add Deno setup action
  - [x] Add linting step (`deno lint`)
  - [x] Add formatting check step (`deno fmt --check`)
  - [x] Add type checking step (`deno check`)
  - [x] Add test step (`deno test`)
  - [x] Configure Deno dependency caching for faster builds
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
