/**
 * User Query Utilities
 *
 * This module provides type-safe query functions for user-related database operations.
 * These utilities demonstrate common patterns for working with Drizzle ORM.
 */

import { eq } from "drizzle-orm"
import { db } from "../connection.ts"
import { NewUser, User, users } from "../schema/users.ts"

/**
 * Get all users from the database
 *
 * @returns Array of all users
 *
 * @example
 * const allUsers = await getAllUsers()
 * console.log(`Found ${allUsers.length} users`)
 */
export async function getAllUsers(): Promise<User[]> {
  return await db.select().from(users)
}

/**
 * Get a user by their ID
 *
 * @param id - The user's ID
 * @returns The user if found, undefined otherwise
 *
 * @example
 * const user = await getUserById(1)
 * if (user) {
 *   console.log(`Found user: ${user.name}`)
 * }
 */
export async function getUserById(id: number): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.id, id))
  return result[0]
}

/**
 * Get a user by their email address
 *
 * @param email - The user's email address
 * @returns The user if found, undefined otherwise
 *
 * @example
 * const user = await getUserByEmail("user@example.com")
 * if (user) {
 *   console.log(`Found user: ${user.name}`)
 * }
 */
export async function getUserByEmail(
  email: string,
): Promise<User | undefined> {
  const result = await db.select().from(users).where(eq(users.email, email))
  return result[0]
}

/**
 * Create a new user
 *
 * @param userData - User data to insert
 * @returns The created user
 *
 * @example
 * const newUser = await createUser({
 *   email: "newuser@example.com",
 *   name: "Jane Doe",
 *   passwordHash: "hashed_password_here"
 * })
 * console.log(`Created user with ID: ${newUser.id}`)
 */
export async function createUser(userData: NewUser): Promise<User> {
  const result = await db.insert(users).values(userData).returning()
  return result[0]
}

/**
 * Update a user by their ID
 *
 * @param id - The user's ID
 * @param userData - Partial user data to update
 * @returns The updated user if found, undefined otherwise
 *
 * @example
 * const updated = await updateUser(1, { name: "New Name" })
 * if (updated) {
 *   console.log(`Updated user: ${updated.name}`)
 * }
 */
export async function updateUser(
  id: number,
  userData: Partial<NewUser>,
): Promise<User | undefined> {
  const result = await db
    .update(users)
    .set(userData)
    .where(eq(users.id, id))
    .returning()
  return result[0]
}

/**
 * Delete a user by their ID
 *
 * @param id - The user's ID
 * @returns True if user was deleted, false if not found
 *
 * @example
 * const deleted = await deleteUser(1)
 * if (deleted) {
 *   console.log("User deleted successfully")
 * }
 */
export async function deleteUser(id: number): Promise<boolean> {
  const result = await db.delete(users).where(eq(users.id, id)).returning()
  return result.length > 0
}

/**
 * Count total number of users
 *
 * @returns The total number of users
 *
 * @example
 * const count = await countUsers()
 * console.log(`Total users: ${count}`)
 */
export async function countUsers(): Promise<number> {
  const result = await db.select().from(users)
  return result.length
}
