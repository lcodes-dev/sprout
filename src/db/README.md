# Database Setup Guide

This directory contains the database configuration, schema definitions, and query utilities for Sprout using Drizzle ORM with a code-first approach.

## Quick Start

### 1. Initialize the Database

Create the database directory and file:

```bash
deno task db:init
```

### 2. Sync Schema to Database

Push your schema changes to the database (code-first, no migrations):

```bash
deno task db:push
```

This command will:
- Read your schema definitions from `src/db/schema/`
- Compare with the current database state
- Apply necessary changes to sync the database

### 3. Explore with Drizzle Studio (Optional)

Launch Drizzle Studio to visually explore and manage your database:

```bash
deno task db:studio
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
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

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

2. **Export from schema index**:

```typescript
// src/db/schema/index.ts
export * from "./users.ts"
export * from "./posts.ts"  // Add this line
```

3. **Push to database**:

```bash
deno task db:push
```

4. **Create query utilities** in `src/db/queries/posts.ts`

5. **Write tests** in `src/db/queries/posts.test.ts`

## Configuration

Database configuration is in `src/db/config.ts`.

### Environment Variables

- `DATABASE_URL`: Database connection URL (default: `file:./data/sprout.db`)
- `DATABASE_AUTH_TOKEN`: Auth token for remote databases (optional)
- `DENO_ENV`: Set to `development` for verbose logging

### Example .env file

```bash
# Local SQLite (default)
DATABASE_URL=file:./data/sprout.db

# Or use Turso/libSQL for production
# DATABASE_URL=libsql://your-database.turso.io
# DATABASE_AUTH_TOKEN=your_auth_token_here

# Enable verbose logging
DENO_ENV=development
```

## Testing

Run database tests:

```bash
deno task test
```

Or test a specific file:

```bash
deno test src/db/queries/users.test.ts
```

## Best Practices

1. **Use query utilities**: Create reusable query functions in `queries/` directory
2. **Type safety**: Always use inferred types from schemas
3. **Transactions**: Use `db.transaction()` for multi-step operations
4. **Validation**: Validate input before database operations
5. **Indexes**: Add indexes for frequently queried columns
6. **Soft deletes**: Consider soft deletes instead of hard deletes for user data

## Troubleshooting

### Schema changes not applied

Make sure to run `deno task db:push` after changing schemas.

### Connection errors

1. Check `DATABASE_URL` is set correctly
2. Ensure database directory exists (`deno task db:init`)
3. Verify file permissions if using local SQLite

### Test failures

1. Ensure database is initialized and schema is pushed
2. Check for unique constraint violations (emails, etc.)
3. Clear test data between runs if needed

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [libSQL Documentation](https://docs.turso.tech/libsql)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
