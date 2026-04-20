import express from 'express';
import { 
    getSchoolReviews,
    getSchoolReviewById,
    createSchoolReview,
    updateSchoolReview,
    deleteSchoolReview
} from '../controllers/schoolReviews.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Apply rate limiting
router.use(rateLimiter.schoolReviewsLimiter);

// School reviews routes
router.get('/', getSchoolReviews);               // GET /api/school-reviews
router.get('/:id', getSchoolReviewById);         // GET /api/school-reviews/:id
router.post('/', createSchoolReview);            // POST /api/school-reviews
router.put('/:id', updateSchoolReview);          // PUT /api/school-reviews/:id
router.delete('/:id', deleteSchoolReview);       // DELETE /api/school-reviews/:id

export default router;