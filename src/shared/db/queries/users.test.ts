/**
 * User Query Tests
 *
 * Tests for user database operations.
 * Run with: deno task test
 *
 * Before running tests, ensure:
 * 1. Database is initialized: deno task db:init
 * 2. Schema is synced: deno task db:push
 */

import { assertEquals, assertExists } from "@std/assert"
import {
  countUsers,
  createUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  updateUser,
} from "./users.ts"
import type { NewUser } from "../schema/users.ts"

Deno.test("User Database Operations", async (t) => {
  let testUserId: number

  await t.step("Create a new user", async () => {
    const newUser: NewUser = {
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      passwordHash: "hashed_password_here",
      role: "user",
    }

    const createdUser = await createUser(newUser)
    assertExists(createdUser.id, "User should have an ID")
    assertEquals(createdUser.email, newUser.email, "Email should match")
    assertEquals(createdUser.name, newUser.name, "Name should match")

    testUserId = createdUser.id
  })

  await t.step("Get user by ID", async () => {
    const user = await getUserById(testUserId)
    assertExists(user, "User should exist")
    assertEquals(user?.id, testUserId, "User ID should match")
  })

  await t.step("Get user by email", async () => {
    const user = await getUserById(testUserId)
    assertExists(user, "User should exist")

    const foundUser = await getUserByEmail(user!.email)
    assertExists(foundUser, "User should be found by email")
    assertEquals(foundUser?.id, testUserId, "User ID should match")
  })

  await t.step("Get all users", async () => {
    const users = await getAllUsers()
    assertExists(users, "Users array should exist")
    assertEquals(
      users.length >= 1,
      true,
      "Should have at least one user",
    )
  })

  await t.step("Count users", async () => {
    const count = await countUsers()
    assertEquals(count >= 1, true, "Should have at least one user")
  })

  await t.step("Update user", async () => {
    const updatedUser = await updateUser(testUserId, {
      name: "Updated Test User",
    })
    assertExists(updatedUser, "Updated user should exist")
    assertEquals(
      updatedUser?.name,
      "Updated Test User",
      "Name should be updated",
    )
  })

  await t.step("Delete user", async () => {
    const deleted = await deleteUser(testUserId)
    assertEquals(deleted, true, "User should be deleted")

    const user = await getUserById(testUserId)
    assertEquals(user, undefined, "User should no longer exist")
  })
})
