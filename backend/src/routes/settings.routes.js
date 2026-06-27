import express from "express";
import multer from "multer";
import { authenticate } from "../middlewares/auth.middleware.js";
import { rateLimiter } from "../middlewares/rateLimiter.js";
import {
	getGeneralSettings,
	updateGeneralSettings,
	uploadGeneralImage,
	deleteGeneralImage,
	getHomepageBannerSettings,
	updateHomepageBannerSettings
} from "../controllers/settings.controller.js";
import { getContactSettings, updateContactSettings } from "../controllers/settings.controller.js";
import {
	getPopupCampaigns,
	createPopupCampaign,
	updatePopupCampaign,
	deletePopupCampaign,
	uploadPopupCampaignImage,
	deletePopupCampaignImage
} from "../controllers/popupCampaigns.controller.js";
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
const maxGeneralImageSize = Number(process.env.CLOUDINARY_MAX_FILE_SIZE || 1 * 1024 * 1024);
const maxFaviconImageSize = Number(process.env.CLOUDINARY_FAVICON_MAX_FILE_SIZE || 512 * 1024);
const maxSettingsImageSize = Math.max(
	Number.isFinite(maxGeneralImageSize) && maxGeneralImageSize > 0 ? maxGeneralImageSize : 1 * 1024 * 1024,
	Number.isFinite(maxFaviconImageSize) && maxFaviconImageSize > 0 ? maxFaviconImageSize : 512 * 1024
);
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 500 * 1024 * 1024
	}
});
const generalImageUpload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: maxSettingsImageSize
	}
});

router.use(authenticate);
router.use(rateLimiter.settingsLimiter);

router.get("/general", getGeneralSettings);
router.put("/general", updateGeneralSettings);
router.get("/homepage-banner", getHomepageBannerSettings);
router.put("/homepage-banner", updateHomepageBannerSettings);
router.post("/general/upload-image", rateLimiter.uploadLimiter, generalImageUpload.single("image"), uploadGeneralImage);
router.delete("/general/upload-image", deleteGeneralImage);
router.get("/contact", getContactSettings);
router.put("/contact", updateContactSettings);

router.get("/popup-campaigns", getPopupCampaigns);
router.post("/popup-campaigns", createPopupCampaign);
router.post("/popup-campaigns/upload-image", rateLimiter.uploadLimiter, generalImageUpload.single("image"), uploadPopupCampaignImage);
router.delete("/popup-campaigns/upload-image", deletePopupCampaignImage);
router.put("/popup-campaigns/:id", updatePopupCampaign);
router.delete("/popup-campaigns/:id", deletePopupCampaign);

router.get("/backups/history", getBackupHistory);
router.post("/backups/create", createManualBackup);
router.post("/backups/upload", rateLimiter.uploadLimiter, upload.single("backupFile"), uploadBackup);
router.get("/backups/:id/download", downloadBackup);
router.post("/backups/restore", rateLimiter.strictLimiter, restoreBackup);

router.get("/backups/config", getBackupConfig);
router.put("/backups/config", updateBackupConfig);

router.get("/backups/scheduler/health", getSchedulerHealth);

export default router;
