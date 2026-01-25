import { Router } from "express";
import {
  getAboutMeHandler,
  updateAboutMeHandler,
  addSkillHandler,
  removeSkillHandler,
  addInterestHandler,
  removeInterestHandler,
  addSocialHandler,
  removeSocialHandler,
} from "./aboutme.handler.js";
import { requireAuth } from "../Auth/auth.midleware.js";

const router = Router();

// Public: Get About Me information
router.get("/", getAboutMeHandler);

// Protected: Update About Me (requires authentication)
router.put("/", requireAuth, updateAboutMeHandler);

// Protected: Manage Skills
router.post("/skills", requireAuth, addSkillHandler);
router.delete("/skills/:skill", requireAuth, removeSkillHandler);

// Protected: Manage Interests
router.post("/interests", requireAuth, addInterestHandler);
router.delete("/interests/:interest", requireAuth, removeInterestHandler);

// Protected: Manage Socials
router.post("/socials", requireAuth, addSocialHandler);
router.delete("/socials/:label", requireAuth, removeSocialHandler);

export default router;
