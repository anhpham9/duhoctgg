import express from "express";
import multer from "multer";
import { authenticate } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import { getGeneralSettings, updateGeneralSettings } from "../controllers/settings.controller.js";
import { getContactSettings, updateContactSettings } from "../controllers/settings.controller.js";
import {
	getBackupHistory,
	createManualBackup,
	uploadBackup,
	restoreBackup,
	downloadBackup,
	getBackupConfig,
	updateBackupConfig,
	getSchedulerHealth
} from "../controllers/backup.controller.js";

const router = express.Router();
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 500 * 1024 * 1024
	}
});

router.use(authenticate);
router.use(rateLimiter.settingsLimiter);

router.get("/general", getGeneralSettings);
router.put("/general", updateGeneralSettings);
router.get("/contact", getContactSettings);
router.put("/contact", updateContactSettings);

router.get("/backups/history", getBackupHistory);
router.post("/backups/create", createManualBackup);
router.post("/backups/upload", rateLimiter.uploadLimiter, upload.single("backupFile"), uploadBackup);
router.get("/backups/:id/download", downloadBackup);
router.post("/backups/restore", rateLimiter.strictLimiter, restoreBackup);

router.get("/backups/config", getBackupConfig);
router.put("/backups/config", updateBackupConfig);

router.get("/backups/scheduler/health", getSchedulerHealth);

export default router;
