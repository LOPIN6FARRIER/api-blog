import { Router } from "express";
import holaRouter from "./hola/hola.routes.js";
import postsRouter from "./posts/posts.routes.js";
import aboutMeRouter from "./aboutme/aboutme.routes.js";
import { healthCheckHandler } from "./health/health.handler.js";
import authRouter from "./Auth/auth.routes.js";
const router = Router();

// Health check
router.get("/health", healthCheckHandler);

// Example endpoint
router.use("/hola", holaRouter);
// Posts endpoints
router.use("/posts", postsRouter);
// About Me endpoint
router.use("/about-me", aboutMeRouter);

router.use("/auth", authRouter);

export default router;
