import { Router } from "express";
import {
  getPostsHandler,
  getPostHandler,
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
  uploadPostImageHandler,
} from "./posts.handler.js";
import upload from "../../middleware/upload.middleware.js";

const router = Router();

// List / query posts
router.get("/", getPostsHandler);

// Single post by id or slug
router.get("/:idOrSlug", getPostHandler);

// Create
router.post("/", createPostHandler);

// Upload image for a post (field name: image)
router.post("/:id/image", upload.single("image"), uploadPostImageHandler);

// Upload multiple images for a post (field name: images[])
import { uploadPostImagesHandler } from "./posts.handler.js";
router.post("/:id/images", upload.array("images"), uploadPostImagesHandler);

// Update
router.put("/:id", updatePostHandler);

// Delete
router.delete("/:id", deletePostHandler);

export default router;
