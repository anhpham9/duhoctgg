import express from 'express';
import { 
    getFaqs,
    getFaqById,
    createFaq,
    updateFaq,
    deleteFaq
} from '../controllers/faqs.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Apply rate limiting
router.use(rateLimiter.faqsLimiter);

// FAQs routes
router.get('/', getFaqs);                        // GET /api/faqs
router.get('/:id', getFaqById);                  // GET /api/faqs/:id
router.post('/', createFaq);                     // POST /api/faqs
router.put('/:id', updateFaq);                   // PUT /api/faqs/:id
router.delete('/:id', deleteFaq);                // DELETE /api/faqs/:id

export default router;