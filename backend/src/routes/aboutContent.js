import express from 'express'
import {
    // Team Members
    getTeamMembers,
    getTeamMemberById,
    getTeamMembersAdmin,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    uploadTeamMemberImage,
    // About Stats
    getAboutStats,
    getAboutStatsAdmin,
    createAboutStat,
    updateAboutStat,
    deleteAboutStat,
    // About Reasons
    getAboutReasons,
    getAboutReasonsAdmin,
    createAboutReason,
    updateAboutReason,
    deleteAboutReason,
    // About Missions
    getAboutMissions,
    getAboutMissionsAdmin,
    createAboutMission,
    updateAboutMission,
    deleteAboutMission
} from '../controllers/aboutContent.controller.js'
import multer from 'multer'
import { authenticate } from '../middlewares/auth.middleware.js'

const upload = multer({ storage: multer.memoryStorage() })

const authorizeRole = (allowedRoles = []) => (req, res, next) => {
    const roleId = Number(req.user?.role_id)
    if (!allowedRoles.includes(roleId)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: insufficient permissions'
        })
    }
    return next()
}

const router = express.Router()

// ============ Team Members ============

// Static routes FIRST — must come before /:id to prevent route shadowing
router.get('/team-members', getTeamMembers)
router.get('/team-members/admin', authenticate, authorizeRole([1, 2, 3]), getTeamMembersAdmin)
router.post('/team-members', authenticate, authorizeRole([1, 2, 3]), createTeamMember)
router.post('/team-members/upload-image', authenticate, authorizeRole([1, 2, 3]), upload.single('image'), uploadTeamMemberImage)

// Dynamic routes AFTER static routes
router.get('/team-members/:id', getTeamMemberById)
router.put('/team-members/:id', authenticate, authorizeRole([1, 2, 3]), updateTeamMember)
router.delete('/team-members/:id', authenticate, authorizeRole([1, 2]), deleteTeamMember)

// ============ About Stats ============

router.get('/stats', getAboutStats)
router.get('/stats/admin', authenticate, authorizeRole([1, 2, 3]), getAboutStatsAdmin)
router.post('/stats', authenticate, authorizeRole([1, 2, 3]), createAboutStat)
router.put('/stats/:id', authenticate, authorizeRole([1, 2, 3]), updateAboutStat)
router.delete('/stats/:id', authenticate, authorizeRole([1, 2]), deleteAboutStat)

// ============ About Reasons ============

router.get('/reasons', getAboutReasons)
router.get('/reasons/admin', authenticate, authorizeRole([1, 2, 3]), getAboutReasonsAdmin)
router.post('/reasons', authenticate, authorizeRole([1, 2, 3]), createAboutReason)
router.put('/reasons/:id', authenticate, authorizeRole([1, 2, 3]), updateAboutReason)
router.delete('/reasons/:id', authenticate, authorizeRole([1, 2]), deleteAboutReason)

// ============ About Missions ============

router.get('/missions', getAboutMissions)
router.get('/missions/admin', authenticate, authorizeRole([1, 2, 3]), getAboutMissionsAdmin)
router.post('/missions', authenticate, authorizeRole([1, 2, 3]), createAboutMission)
router.put('/missions/:id', authenticate, authorizeRole([1, 2, 3]), updateAboutMission)
router.delete('/missions/:id', authenticate, authorizeRole([1, 2]), deleteAboutMission)

export default router
