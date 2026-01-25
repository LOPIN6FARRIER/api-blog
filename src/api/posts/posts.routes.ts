import { Router } from "express";
import {
  getPostsHandler,
  getPostHandler,
  createPostHandler,
  createMusicPostFromSpotifyHandler,
  updatePostHandler,
  deletePostHandler,
  uploadPostImageHandler,
} from "./posts.handler.js";
import upload from "../../middleware/upload.middleware.js";
import { optimizeImage, optimizeImages } from "../../middleware/image-optimizer.middleware.js";

const router = Router();

// List / query posts
router.get("/", getPostsHandler);

// Create
router.post("/", createPostHandler);

// Create music post from Spotify URL (MUST be before /:idOrSlug)
router.post("/from-spotify", createMusicPostFromSpotifyHandler);

// Single post by id or slug
router.get("/:idOrSlug", getPostHandler);

// Upload image for a post (field name: image) - CON OPTIMIZACIÓN
router.post("/:id/image", upload.single("image"), optimizeImage(), uploadPostImageHandler);

// Upload multiple images for a post (field name: images[]) - CON OPTIMIZACIÓN
import { uploadPostImagesHandler } from "./posts.handler.js";

router.post("/:id/images", upload.array("images"), optimizeImages(), uploadPostImagesHandler);

// Update
router.put("/:id", updatePostHandler);

// Delete
router.delete("/:id", deletePostHandler);

export default router;
