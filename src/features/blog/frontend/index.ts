/**
 * Blog Frontend Router
 *
 * Handles all public-facing routes for the blog feature
 */

import { Hono } from "hono";
import { blogListAction } from "./actions/blog-list.js";
import { blogShowAction } from "./actions/blog-show.js";
import { blogCategoryAction } from "./actions/blog-category.js";

const frontendBlogRouter = new Hono();

// Blog routes
frontendBlogRouter.get("/", blogListAction);
frontendBlogRouter.get("/category/:slug", blogCategoryAction);
frontendBlogRouter.get("/:slug", blogShowAction);

export default frontendBlogRouter;
