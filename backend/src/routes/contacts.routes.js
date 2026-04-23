import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { sanitizeInputs } from "../utils/sanitizer.js";
import {
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    // getAssignableUsers,
    getContactStats,
    getContactNotes,
    addContactNote,
    updateContactStatus
} from "../controllers/contacts.controller.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/contacts - Get all contacts (with RBAC filtering)
router.get("/", getContacts);

// GET /api/contacts/stats - Get contact statistics
router.get("/stats", getContactStats);

// GET /api/contacts/assignable-users - Get users who can be assigned contacts
// router.get("/assignable-users", getAssignableUsers);

// GET /api/contacts/:id - Get single contact
router.get("/:id", getContact);

// POST /api/contacts - Create new contact
router.post("/", sanitizeInputs, createContact);

// PUT /api/contacts/:id - Update contact
router.put("/:id", sanitizeInputs, updateContact);

// DELETE /api/contacts/:id - Delete contact
router.delete("/:id", deleteContact);

// GET /api/contacts/:contactId/notes - Get all notes for a contact
router.get("/:contactId/notes", getContactNotes);

// POST /api/contacts/:contactId/notes - Add a note to a contact
router.post("/:contactId/notes", sanitizeInputs, addContactNote);

// PUT /api/contacts/:id/status - Update contact status with business logic
router.put("/:id/status", sanitizeInputs, updateContactStatus);

export default router;