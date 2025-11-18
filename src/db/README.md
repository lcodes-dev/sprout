# Database Setup Guide

This directory contains the database configuration, schema definitions, and query utilities for Sprout using Drizzle ORM with PostgreSQL 18 and a code-first approach.

## Quick Start

### 1. Start the Database

The database is managed via Docker Compose. Start it with:

```bash
docker compose up -d
```

Or simply run `npm run dev` which will start the database automatically.

### 2. Sync Schema to Database

Push your schema changes to the database (code-first, no migrations):

```bash
npm run db:push
```

This command will:
- Read your schema definitions from `src/db/schema/`
- Compare with the current database state
- Apply necessary changes to sync the database

### 3. Explore with Drizzle Studio (Optional)

Launch Drizzle Studio to visually explore and manage your database:

```bash
npm run db:studio
```

This opens a web interface (usually at `https://local.drizzle.studio`) where you can:
- Browse tables and data
- Run queries
- Edit records
- View relationships

## Directory Structure

```
src/db/
├── schema/              # Database schema definitions
│   ├── index.ts        # Exports all schemas
│   └── users.ts        # User table schema
├── queries/            # Query utilities and helpers
│   ├── users.ts        # User query functions
│   └── users.test.ts   # User query tests
├── config.ts           # Database configuration
├── connection.ts       # Database connection management
└── README.md          # This file
```

## Code-First Approach

This project uses a **code-first** approach with Drizzle ORM, meaning:

- ✅ Schema is defined in TypeScript code
- ✅ Changes are pushed directly to the database
- ❌ No migration files are generated or maintained
- ⚡ Faster development iteration

### When to Use Code-First

Code-first is ideal for:
- Small to medium projects
- Rapid prototyping
- Solo development or small teams
- Projects where migration history isn't critical

### When to Use Migrations

Consider using migrations (not this approach) for:
- Large production systems
- Teams with strict schema change controls
- Projects requiring rollback capabilities
- Compliance requirements needing audit trails

## Working with the Database

### Importing the Database Instance

```typescript
import { db } from "./db/connection.ts"
import { users } from "./db/schema/users.ts"
```

### Basic Queries

```typescript
// Get all users
const allUsers = await db.select().from(users)

// Get user by ID
import { eq } from "drizzle-orm"
const user = await db.select().from(users).where(eq(users.id, 1))

// Create a user
const newUser = await db.insert(users).values({
  email: "user@example.com",
  name: "John Doe",
  passwordHash: "hashed_password_here"
}).returning()

// Update a user
const updated = await db
  .update(users)
  .set({ name: "Jane Doe" })
  .where(eq(users.id, 1))
  .returning()

// Delete a user
await db.delete(users).where(eq(users.id, 1))
```

### Using Query Utilities

For cleaner code, use the query utility functions:

```typescript
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "./db/queries/users.ts"

// Much cleaner!
const users = await getAllUsers()
const user = await getUserById(1)
const newUser = await createUser({ ... })
```

## Adding New Tables

1. **Create schema file** in `src/db/schema/`:

```typescript
// src/db/schema/posts.ts
import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
})

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
```

2. **Export from schema index**:

```typescript
// src/db/schema/index.ts
export * from "./users.ts"
export * from "./posts.ts"  // Add this line
```

3. **Push to database**:

```bash
npm run db:push
```

4. **Create query utilities** in `src/db/queries/posts.ts`

5. **Write tests** in `src/db/queries/posts.test.ts`

## Configuration

Database configuration is in `src/db/config.ts`.

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection URL (default: `postgresql://postgres:postgres@localhost:5432/sprout`)
- `NODE_ENV`: Set to `development` for verbose logging

### Example .env file

```bash
# Local PostgreSQL (default)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sprout

# Or use a remote PostgreSQL instance
# DATABASE_URL=postgresql://user:password@host:port/database

# Enable verbose logging
NODE_ENV=development
```

## Testing

Tests use a separate `sprout-test` database to isolate test data from development data. Database setup and teardown is handled automatically by test helpers.

### How Test Database Management Works

The test helpers (`src/db/test-helpers.ts`) provide functions to:
- **`setupTestDatabase()`**: Creates the test database if needed and cleans all tables before tests run
- **`teardownTestDatabase()`**: Cleans all tables after tests complete
- **`dropTestDatabase()`**: Drops the entire test database (useful for CI cleanup)

Test files automatically call `setupTestDatabase()` in `beforeAll()` and `teardownTestDatabase()` in `afterAll()` hooks.

### Running Tests

```bash
npm test
```

Or test a specific file:

```bash
npm test -- src/db/queries/users.test.ts
```

### First-Time Setup

Before running tests for the first time, sync the schema to the test database:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sprout-test npm run db:push
```

After this initial setup, the test helpers will automatically manage the database state for each test run.

## Best Practices

1. **Use query utilities**: Create reusable query functions in `queries/` directory
2. **Type safety**: Always use inferred types from schemas
3. **Transactions**: Use `db.transaction()` for multi-step operations
4. **Validation**: Validate input before database operations
5. **Indexes**: Add indexes for frequently queried columns
6. **Soft deletes**: Consider soft deletes instead of hard deletes for user data

## Troubleshooting

### Schema changes not applied

Make sure to run `npm run db:push` after changing schemas.

### Connection errors

1. Check `DATABASE_URL` is set correctly
2. Ensure Docker Compose is running: `docker compose up -d`
3. Verify PostgreSQL container is healthy: `docker compose ps`
4. Check database logs: `docker compose logs postgres`

### Test failures

1. Ensure database is initialized and schema is pushed
2. Check for unique constraint violations (emails, etc.)
3. Clear test data between runs if needed

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
