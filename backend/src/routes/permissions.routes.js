import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { sanitizeInputs } from "../utils/sanitizer.js";
import {
    getPermissionsConfig,
    updatePermissionsConfig
} from "../controllers/permissions.controller.js";

const router = Router();

router.use(authenticate);

router.get("/config", getPermissionsConfig);
router.put("/config", sanitizeInputs, updatePermissionsConfig);

export default router;