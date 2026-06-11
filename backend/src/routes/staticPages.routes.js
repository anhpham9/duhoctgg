import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import { getStaticPageBySlug, upsertStaticPageBySlug } from "../controllers/staticPages.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(rateLimiter.staticPagesLimiter);

router.get("/:slug", getStaticPageBySlug);
router.put("/:slug", upsertStaticPageBySlug);

export default router;
