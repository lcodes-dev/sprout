import { Hono } from "hono"
import { BaseLayout } from "../../shared/layouts/BaseLayout.tsx"
import { HomePage } from "./views/HomePage.tsx"

const landing = new Hono()

landing.get("/", (c) => {
  return c.html(
    <BaseLayout title="Welcome to Sprout 🌱">
      <HomePage />
    </BaseLayout>
  )
})

export default landing
