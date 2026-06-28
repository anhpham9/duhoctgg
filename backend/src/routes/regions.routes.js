import express from 'express';
import { 
    getRegions,
    getRegionById,
    createRegion,
    updateRegion,
    deleteRegion
} from '../controllers/regions.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Apply rate limiting
router.use(rateLimiter.regionsLimiter);

// Regions routes
router.get('/', getRegions);                     // GET /api/regions
router.get('/:id', getRegionById);               // GET /api/regions/:id
router.post('/', createRegion);                  // POST /api/regions
router.put('/:id', updateRegion);                // PUT /api/regions/:id
router.delete('/:id', deleteRegion);             // DELETE /api/regions/:id

export default router;