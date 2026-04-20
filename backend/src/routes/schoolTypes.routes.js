import express from 'express';
import { 
    getSchoolTypes,
    getSchoolTypeById,
    createSchoolType,
    updateSchoolType,
    deleteSchoolType
} from '../controllers/schoolTypes.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Apply rate limiting
router.use(rateLimiter.schoolTypesLimiter);

// School types routes
router.get('/', getSchoolTypes);                 // GET /api/school-types
router.get('/:id', getSchoolTypeById);           // GET /api/school-types/:id
router.post('/', createSchoolType);              // POST /api/school-types
router.put('/:id', updateSchoolType);            // PUT /api/school-types/:id
router.delete('/:id', deleteSchoolType);         // DELETE /api/school-types/:id

export default router;