import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import { getSeoSettings, updateSeoSettings } from "../controllers/seoSettings.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(rateLimiter.settingsLimiter);

router.get("/", getSeoSettings);
router.put("/", updateSeoSettings);

export default router;