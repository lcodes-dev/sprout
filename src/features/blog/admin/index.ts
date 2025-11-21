/**
 * Blog Admin Router
 *
 * Handles all admin panel routes for the blog feature
 */

import { Hono } from "hono";
import { postListAction } from "./actions/post-list.js";
import { postCreateAction } from "./actions/post-create.js";
import { postStoreAction } from "./actions/post-store.js";
import { postEditAction } from "./actions/post-edit.js";
import { postUpdateAction } from "./actions/post-update.js";
import { postDeleteAction } from "./actions/post-delete.js";
import { postPublishAction } from "./actions/post-publish.js";

const adminBlogRouter = new Hono();

// Post routes
adminBlogRouter.get("/", postListAction);
adminBlogRouter.get("/create", postCreateAction);
adminBlogRouter.post("/", postStoreAction);
adminBlogRouter.get("/:id/edit", postEditAction);
adminBlogRouter.post("/:id", postUpdateAction);
adminBlogRouter.post("/:id/delete", postDeleteAction);
adminBlogRouter.post("/:id/publish", postPublishAction);

// TODO: Add category management routes
// adminBlogRouter.get("/categories", categoryListAction);
// adminBlogRouter.post("/categories", categoryStoreAction);
// adminBlogRouter.post("/categories/:id", categoryUpdateAction);
// adminBlogRouter.post("/categories/:id/delete", categoryDeleteAction);

// TODO: Add attachment upload routes
// adminBlogRouter.post("/upload", uploadAttachmentAction);
// adminBlogRouter.post("/attachments/:id/delete", deleteAttachmentAction);

export default adminBlogRouter;
