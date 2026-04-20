import express from 'express';
import { 
    getSchools, 
    getSchoolById, 
    createSchool, 
    updateSchool, 
    deleteSchool,
    getSchoolsStats 
} from '../controllers/schools.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Apply rate limiting
router.use(rateLimiter.schoolsLimiter);

// Schools routes
router.get('/', getSchools);                    // GET /api/schools
router.get('/stats', getSchoolsStats);          // GET /api/schools/stats
router.get('/:id', getSchoolById);              // GET /api/schools/:id
router.post('/', createSchool);                 // POST /api/schools
router.put('/:id', updateSchool);               // PUT /api/schools/:id
router.delete('/:id', deleteSchool);            // DELETE /api/schools/:id

export default router;