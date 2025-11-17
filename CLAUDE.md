# CLAUDE.md - AI Assistant Guide for Sprout

## Project Overview

**Sprout** is a lightweight web application built with [Deno](https://deno.land/) and the [Hono](https://hono.dev/) web framework. This project is a modern, full-featured starter kit leveraging Deno's built-in TypeScript support and Hono's fast, Express-like API.

**Current State**: Early stage / minimal setup with a single "Hello World" endpoint.

## Technology Stack

- **Runtime**: Deno (latest stable)
- **Web Framework**: Hono v4.10.6+
- **Language**: TypeScript (via Deno's native support)
- **JSX Support**: Precompiled JSX with Hono's JSX runtime (SSR ONLY)
- **Hotwire**: The project will integrate with [Hotwire Turbo](https://turbo.hotwired.dev/) and [Hotwire Stimulus](https://stimulus.hotwired.dev/).

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
├── src/main.ts         # Entry point
├── src/features/       # Each feature will have a subdirectory here
├── deno.json           # Configuration
├── src/shared/middleware/         # Custom middleware (recommended)
├── src/shared/components/         # Custom JSX components. Will use only SSR JSX
├── src/shared/layouts/            # Custom JSX components
├── src/shared/lib/                # Shared utilities and helpers
├── src/shared/lib/hotwire/        # Hotwire turbo intregration
├── src/shared/types/              # TypeScript type definitions
├── static/             # Static assets (if needed)
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

## Git Workflow

- **Branch naming**: Use descriptive branch names (e.g., `feature/add-user-auth`, `fix/cors-issue`)
- **Commits**: Write clear, concise commit messages
- **Before committing**:
  1. Run `deno fmt` to format code
  2. Run `deno lint` to check for issues
  3. Run `deno check main.ts` to verify types
  4. Test the application with `deno task start`

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

**Next Steps** (suggested):
- [ ] Add structured routing with separate route files
- [ ] Implement error handling middleware
- [ ] Add logging middleware
- [ ] Set up environment variable configuration
- [ ] Add unit tests
- [ ] Configure CORS for API access
- [ ] Add database integration with Drizzle ORM using code first approach, without migration files.

---

**Last Updated**: 2025-11-17
**Maintained by**: AI assistants should keep this document current as the project evolves
