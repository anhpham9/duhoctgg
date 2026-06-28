import express from 'express';
import multer from 'multer';
import { 
    getSchools, 
    getSchoolById, 
    createSchool, 
    updateSchool, 
    deleteSchool,
    getSchoolsStats,
    getSchoolDetailContent,
    updateSchoolDetailContent,
    uploadSchoolImage,
    deleteSchoolImage
} from '../controllers/schools.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();
const maxSchoolImageSize = Number(process.env.CLOUDINARY_MAX_FILE_SIZE || 1 * 1024 * 1024);
const schoolImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: Number.isFinite(maxSchoolImageSize) && maxSchoolImageSize > 0 ? maxSchoolImageSize : 1 * 1024 * 1024
    }
});

// All routes require authentication
router.use(authenticate);

// Apply rate limiting
router.use(rateLimiter.schoolsLimiter);

// Schools routes
router.get('/', getSchools);                    // GET /api/schools
router.get('/stats', getSchoolsStats);          // GET /api/schools/stats
router.post('/upload-image', rateLimiter.uploadLimiter, schoolImageUpload.single('image'), uploadSchoolImage); // POST /api/schools/upload-image
router.delete('/upload-image', deleteSchoolImage); // DELETE /api/schools/upload-image
router.get('/:id/detail-content', getSchoolDetailContent); // GET /api/schools/:id/detail-content
router.put('/:id/detail-content', updateSchoolDetailContent); // PUT /api/schools/:id/detail-content
router.get('/:id', getSchoolById);              // GET /api/schools/:id
router.post('/', createSchool);                 // POST /api/schools
router.put('/:id', updateSchool);               // PUT /api/schools/:id
router.delete('/:id', deleteSchool);            // DELETE /api/schools/:id

export default router;