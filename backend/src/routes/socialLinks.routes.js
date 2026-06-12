import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import {
    getSocialLinks,
    createSocialLink,
    updateSocialLink,
    deleteSocialLink,
    reorderSocialLinks
} from "../controllers/socialLinks.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(rateLimiter.settingsLimiter);

router.get("/", getSocialLinks);
router.post("/", createSocialLink);
router.put("/:id", updateSocialLink);
router.delete("/:id", deleteSocialLink);
router.post("/reorder", reorderSocialLinks);

export default router;