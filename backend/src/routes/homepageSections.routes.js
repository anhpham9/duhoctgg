import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkModuleAccess } from "../middlewares/permission.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import {
    createHomepageSection,
    deleteHomepageSection,
    getHomepageSectionsAdmin,
    updateHomepageSection
} from "../controllers/homepageSections.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(checkModuleAccess("content"));
router.use(rateLimiter.staticPagesLimiter);

router.get("/", getHomepageSectionsAdmin);
router.post("/", createHomepageSection);
router.put("/:id", updateHomepageSection);
router.delete("/:id", deleteHomepageSection);

export default router;
