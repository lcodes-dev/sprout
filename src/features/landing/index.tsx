import { Hono } from "hono"
import { HomePage } from "./views/HomePage.tsx"

const landing = new Hono()

landing.get("/", (c) => {
  return c.html(
    <HomePage title="Welcome to Sprout 🌱"/>
  )
})

export default landing
