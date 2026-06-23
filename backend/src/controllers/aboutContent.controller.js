import db from '../config/db.js'
import { logger, logInfo } from '../utils/logger.js'
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js'

// ============ Team Members CRUD ============

export const getTeamMembers = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, name, position, description, photo_url, photo_cloudinary_public_id, social_links, sort_order, is_active, created_at FROM team_members WHERE is_active = true ORDER BY sort_order ASC, created_at DESC'
        )
        res.json({
            success: true,
            data: result.rows || [],
            message: 'Lấy danh sách thành viên thành công'
        })
    } catch (error) {
        logger.error('Get team members failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách thành viên',
            errors: { server: error.message }
        })
    }
}

export const getTeamMemberById = async (req, res) => {
    try {
        const { id } = req.params
        const result = await db.query(
            'SELECT id, name, position, description, photo_url, photo_cloudinary_public_id, social_links, sort_order, is_active, created_at FROM team_members WHERE id = $1',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên',
                errors: { notFound: `Thành viên ID ${id} không tồn tại` }
            })
        }

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Lấy thành viên thành công'
        })
    } catch (error) {
        logger.error('Get team member by id failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thành viên',
            errors: { server: error.message }
        })
    }
}

export const getTeamMembersAdmin = async (req, res) => {
    try {
        // Show all members including inactive ones for admin
        const result = await db.query(
            'SELECT id, name, position, description, photo_url, photo_cloudinary_public_id, social_links, sort_order, is_active, created_at, updated_at FROM team_members ORDER BY sort_order ASC, created_at DESC'
        )
        res.json({
            success: true,
            data: result.rows || [],
            message: 'Lấy danh sách thành viên thành công'
        })
    } catch (error) {
        logger.error('Get team members admin failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách thành viên',
            errors: { server: error.message }
        })
    }
}

export const createTeamMember = async (req, res) => {
    try {
        const { name, position, description, photoUrl, socialLinks, sortOrder } = req.body

        if (!name || !position) {
            return res.status(400).json({
                success: false,
                message: 'Tên và vị trí là bắt buộc',
                errors: { validation: 'Tên và vị trí là bắt buộc' }
            })
        }

        const result = await db.query(
            'INSERT INTO team_members (name, position, description, photo_url, social_links, sort_order, is_active) VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *',
            [
                name.trim(),
                position.trim(),
                description || '',
                photoUrl || '',
                socialLinks ? JSON.stringify(socialLinks) : JSON.stringify({ facebook: '', tiktok: '', email: '' }),
                sortOrder || 0
            ]
        )

        logInfo('TEAM_MEMBER_CREATE', {
            userId: req.user?.id,
            memberId: result.rows[0].id,
            memberName: name
        })

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Tạo thành viên thành công'
        })
    } catch (error) {
        logger.error('Create team member failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể tạo thành viên',
            errors: { server: error.message }
        })
    }
}

export const updateTeamMember = async (req, res) => {
    try {
        const { id } = req.params
        const { name, position, description, photoUrl, photoPublicId, socialLinks, sortOrder, isActive } = req.body

        if (!name || !position) {
            return res.status(400).json({
                success: false,
                message: 'Tên và vị trí là bắt buộc',
                errors: { validation: 'Tên và vị trí là bắt buộc' }
            })
        }

        const result = await db.query(
            'UPDATE team_members SET name = $1, position = $2, description = $3, photo_url = $4, photo_cloudinary_public_id = $5, social_links = $6, sort_order = $7, is_active = $8, updated_at = NOW() WHERE id = $9 RETURNING *',
            [
                name.trim(),
                position.trim(),
                description || '',
                photoUrl || '',
                photoPublicId || '',
                socialLinks ? JSON.stringify(socialLinks) : JSON.stringify({ facebook: '', tiktok: '', email: '' }),
                sortOrder || 0,
                isActive !== undefined ? isActive : true,
                id
            ]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên',
                errors: { notFound: `Thành viên ID ${id} không tồn tại` }
            })
        }

        logInfo('TEAM_MEMBER_UPDATE', {
            userId: req.user?.id,
            memberId: id,
            memberName: name
        })

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Cập nhật thành viên thành công'
        })
    } catch (error) {
        logger.error('Update team member failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật thành viên',
            errors: { server: error.message }
        })
    }
}

export const deleteTeamMember = async (req, res) => {
    try {
        const { id } = req.params

        // Get member to retrieve cloudinary public id
        const getMember = await db.query('SELECT photo_cloudinary_public_id FROM team_members WHERE id = $1', [id])
        if (getMember.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành viên',
                errors: { notFound: `Thành viên ID ${id} không tồn tại` }
            })
        }

        const publicId = getMember.rows[0].photo_cloudinary_public_id

        // Delete from database
        await db.query('DELETE FROM team_members WHERE id = $1', [id])

        // Delete from cloudinary if exists
        if (publicId && isCloudinaryConfigured()) {
            try {
                await cloudinary.uploader.destroy(publicId)
            } catch (cloudinaryError) {
                logger.warn('Failed to delete image from cloudinary', { publicId, error: cloudinaryError })
            }
        }

        logInfo('TEAM_MEMBER_DELETE', { userId: req.user?.id, memberId: id, publicId })

        res.json({
            success: true,
            message: 'Xóa thành viên thành công'
        })
    } catch (error) {
        logger.error('Delete team member failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể xóa thành viên',
            errors: { server: error.message }
        })
    }
}

// ============ About Stats CRUD ============

export const getAboutStats = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, icon, number, label, sort_order, is_active, created_at FROM about_stats WHERE is_active = true ORDER BY sort_order ASC'
        )
        res.json({
            success: true,
            data: result.rows || [],
            message: 'Lấy thành tích thành công'
        })
    } catch (error) {
        logger.error('Get about stats failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thành tích',
            errors: { server: error.message }
        })
    }
}

export const getAboutStatsAdmin = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, icon, number, label, sort_order, is_active, created_at, updated_at FROM about_stats ORDER BY sort_order ASC'
        )
        res.json({
            success: true,
            data: result.rows || [],
            message: 'Lấy thành tích thành công'
        })
    } catch (error) {
        logger.error('Get about stats admin failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể lấy thành tích',
            errors: { server: error.message }
        })
    }
}

export const createAboutStat = async (req, res) => {
    try {
        const { icon, number, label, sortOrder } = req.body

        if (!label || number === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Label và số là bắt buộc',
                errors: { validation: 'Label và số là bắt buộc' }
            })
        }

        const result = await db.query(
            'INSERT INTO about_stats (icon, number, label, sort_order, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *',
            [icon || '', Number(number), label.trim(), sortOrder || 0]
        )

        logInfo('ABOUT_STAT_CREATE', { userId: req.user?.id, statId: result.rows[0].id, label })

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Tạo thành tích thành công'
        })
    } catch (error) {
        logger.error('Create about stat failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể tạo thành tích',
            errors: { server: error.message }
        })
    }
}

export const updateAboutStat = async (req, res) => {
    try {
        const { id } = req.params
        const { icon, number, label, sortOrder, isActive } = req.body

        if (!label || number === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Label và số là bắt buộc',
                errors: { validation: 'Label và số là bắt buộc' }
            })
        }

        const result = await db.query(
            'UPDATE about_stats SET icon = $1, number = $2, label = $3, sort_order = $4, is_active = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
            [icon || '', Number(number), label.trim(), sortOrder || 0, isActive !== undefined ? isActive : true, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thành tích',
                errors: { notFound: `Thành tích ID ${id} không tồn tại` }
            })
        }

        logInfo('ABOUT_STAT_UPDATE', { userId: req.user?.id, statId: id, label })

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Cập nhật thành tích thành công'
        })
    } catch (error) {
        logger.error('Update about stat failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật thành tích',
            errors: { server: error.message }
        })
    }
}

export const deleteAboutStat = async (req, res) => {
    try {
        const { id } = req.params
        await db.query('DELETE FROM about_stats WHERE id = $1', [id])

        logInfo('ABOUT_STAT_DELETE', { userId: req.user?.id, statId: id })

        res.json({
            success: true,
            message: 'Xóa thành tích thành công'
        })
    } catch (error) {
        logger.error('Delete about stat failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể xóa thành tích',
            errors: { server: error.message }
        })
    }
}

// ============ About Reasons CRUD ============

export const getAboutReasons = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, icon, title, description, sort_order, is_active, created_at FROM about_reasons WHERE is_active = true ORDER BY sort_order ASC'
        )
        res.json({
            success: true,
            data: result.rows || [],
            message: 'Lấy lý do chọn thành công'
        })
    } catch (error) {
        logger.error('Get about reasons failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể lấy lý do chọn',
            errors: { server: error.message }
        })
    }
}

export const getAboutReasonsAdmin = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, icon, title, description, sort_order, is_active, created_at, updated_at FROM about_reasons ORDER BY sort_order ASC'
        )
        res.json({
            success: true,
            data: result.rows || [],
            message: 'Lấy lý do chọn thành công'
        })
    } catch (error) {
        logger.error('Get about reasons admin failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể lấy lý do chọn',
            errors: { server: error.message }
        })
    }
}

export const createAboutReason = async (req, res) => {
    try {
        const { icon, title, description, sortOrder } = req.body

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề và mô tả là bắt buộc',
                errors: { validation: 'Tiêu đề và mô tả là bắt buộc' }
            })
        }

        const result = await db.query(
            'INSERT INTO about_reasons (icon, title, description, sort_order, is_active) VALUES ($1, $2, $3, $4, true) RETURNING *',
            [icon || '', title.trim(), description.trim(), sortOrder || 0]
        )

        logInfo('ABOUT_REASON_CREATE', { userId: req.user?.id, reasonId: result.rows[0].id, title })

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Tạo lý do chọn thành công'
        })
    } catch (error) {
        logger.error('Create about reason failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể tạo lý do chọn',
            errors: { server: error.message }
        })
    }
}

export const updateAboutReason = async (req, res) => {
    try {
        const { id } = req.params
        const { icon, title, description, sortOrder, isActive } = req.body

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề và mô tả là bắt buộc',
                errors: { validation: 'Tiêu đề và mô tả là bắt buộc' }
            })
        }

        const result = await db.query(
            'UPDATE about_reasons SET icon = $1, title = $2, description = $3, sort_order = $4, is_active = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
            [icon || '', title.trim(), description.trim(), sortOrder || 0, isActive !== undefined ? isActive : true, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy lý do chọn',
                errors: { notFound: `Lý do chọn ID ${id} không tồn tại` }
            })
        }

        logInfo('ABOUT_REASON_UPDATE', { userId: req.user?.id, reasonId: id, title })

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Cập nhật lý do chọn thành công'
        })
    } catch (error) {
        logger.error('Update about reason failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật lý do chọn',
            errors: { server: error.message }
        })
    }
}

export const deleteAboutReason = async (req, res) => {
    try {
        const { id } = req.params
        await db.query('DELETE FROM about_reasons WHERE id = $1', [id])

        logInfo('ABOUT_REASON_DELETE', { userId: req.user?.id, reasonId: id })

        res.json({
            success: true,
            message: 'Xóa lý do chọn thành công'
        })
    } catch (error) {
        logger.error('Delete about reason failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể xóa lý do chọn',
            errors: { server: error.message }
        })
    }
}

// ============ Team Member Image Upload ============

export const uploadTeamMemberImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ảnh để upload',
                errors: { file: 'Không tìm thấy file ảnh' }
            })
        }

        if (!isCloudinaryConfigured()) {
            return res.status(500).json({
                success: false,
                message: 'Cloudinary chưa được cấu hình',
                errors: { cloudinary: 'Hệ thống chưa được cấu hình để upload ảnh' }
            })
        }

        // Upload to cloudinary
        const uploadResult = await cloudinary.uploader.upload_stream(
            {
                folder: 'duhocnb/team-members',
                resource_type: 'auto',
                quality: 'auto',
                fetch_format: 'auto'
            },
            async (error, result) => {
                if (error) {
                    logger.error('Cloudinary upload failed', { error })
                    return res.status(500).json({
                        success: false,
                        message: 'Upload ảnh thất bại',
                        errors: { cloudinary: error.message }
                    })
                }

                res.json({
                    success: true,
                    data: {
                        url: result.secure_url,
                        publicId: result.public_id
                    },
                    message: 'Upload ảnh thành công'
                })
            }
        ).end(req.file.buffer)
    } catch (error) {
        logger.error('Upload team member image failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể upload ảnh',
            errors: { server: error.message }
        })
    }
}

// ============ About Missions CRUD ============

/**
 * Serialize description before saving:
 *   type=paragraph → plain text string
 *   type=list      → JSON.stringify([{key, value}, ...])
 */
const serializeDescription = (type, description) => {
    if (type === 'list') {
        // Accept either an already-stringified JSON or a JS array
        if (typeof description === 'string') {
            try {
                JSON.parse(description) // validate it's valid JSON
                return description
            } catch {
                return '[]'
            }
        }
        return JSON.stringify(description)
    }
    return String(description || '')
}

export const getAboutMissions = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, icon, title, type, description, sort_order, is_active, created_at FROM about_missions WHERE is_active = true ORDER BY sort_order ASC'
        )
        res.json({ success: true, data: result.rows || [], message: 'Lấy tầm nhìn thành công' })
    } catch (error) {
        logger.error('Get about missions failed', { error })
        res.status(500).json({ success: false, message: 'Không thể lấy tầm nhìn', errors: { server: error.message } })
    }
}

export const getAboutMissionsAdmin = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, icon, title, type, description, sort_order, is_active, created_at, updated_at FROM about_missions ORDER BY sort_order ASC'
        )
        res.json({ success: true, data: result.rows || [], message: 'Lấy tầm nhìn thành công' })
    } catch (error) {
        logger.error('Get about missions admin failed', { error })
        res.status(500).json({ success: false, message: 'Không thể lấy tầm nhìn', errors: { server: error.message } })
    }
}

export const createAboutMission = async (req, res) => {
    try {
        const { icon, title, type, description, sortOrder } = req.body

        if (!title || !description || !type) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề, loại và mô tả là bắt buộc',
                errors: { validation: 'Tiêu đề, loại và mô tả là bắt buộc' }
            })
        }

        if (!['paragraph', 'list'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'type phải là "paragraph" hoặc "list"',
                errors: { validation: 'type không hợp lệ' }
            })
        }

        const serialized = serializeDescription(type, description)

        const result = await db.query(
            'INSERT INTO about_missions (icon, title, type, description, sort_order, is_active) VALUES ($1, $2, $3, $4, $5, true) RETURNING *',
            [icon || '', title.trim(), type, serialized, sortOrder ?? 0]
        )

        logInfo('ABOUT_MISSION_CREATE', { userId: req.user?.id, missionId: result.rows[0].id, title })

        res.status(201).json({ success: true, data: result.rows[0], message: 'Tạo tầm nhìn thành công' })
    } catch (error) {
        logger.error('Create about mission failed', { error })
        res.status(500).json({ success: false, message: 'Không thể tạo tầm nhìn', errors: { server: error.message } })
    }
}

export const updateAboutMission = async (req, res) => {
    try {
        const { id } = req.params
        const { icon, title, type, description, sortOrder, isActive } = req.body

        if (!title || !description || !type) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề, loại và mô tả là bắt buộc',
                errors: { validation: 'Tiêu đề, loại và mô tả là bắt buộc' }
            })
        }

        if (!['paragraph', 'list'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'type phải là "paragraph" hoặc "list"',
                errors: { validation: 'type không hợp lệ' }
            })
        }

        const serialized = serializeDescription(type, description)

        const result = await db.query(
            'UPDATE about_missions SET icon = $1, title = $2, type = $3, description = $4, sort_order = $5, is_active = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
            [icon || '', title.trim(), type, serialized, sortOrder ?? 0, isActive !== undefined ? isActive : true, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: `Tầm nhìn ID ${id} không tồn tại` })
        }

        logInfo('ABOUT_MISSION_UPDATE', { userId: req.user?.id, missionId: id, title })

        res.json({ success: true, data: result.rows[0], message: 'Cập nhật tầm nhìn thành công' })
    } catch (error) {
        logger.error('Update about mission failed', { error })
        res.status(500).json({ success: false, message: 'Không thể cập nhật tầm nhìn', errors: { server: error.message } })
    }
}

export const deleteAboutMission = async (req, res) => {
    try {
        const { id } = req.params
        const check = await db.query('SELECT id FROM about_missions WHERE id = $1', [id])
        if (check.rows.length === 0) {
            return res.status(404).json({ success: false, message: `Tầm nhìn ID ${id} không tồn tại` })
        }

        await db.query('DELETE FROM about_missions WHERE id = $1', [id])
        logInfo('ABOUT_MISSION_DELETE', { userId: req.user?.id, missionId: id })

        res.json({ success: true, message: 'Xóa tầm nhìn thành công' })
    } catch (error) {
        logger.error('Delete about mission failed', { error })
        res.status(500).json({ success: false, message: 'Không thể xóa tầm nhìn', errors: { server: error.message } })
    }
}

// ============ About Content CRUD ============

const ABOUT_CONTENT_KEYS = ['content', 'history']

const normalizeTimelineItems = (timelineItems) => {
    if (!timelineItems) return []

    const rows = Array.isArray(timelineItems)
        ? timelineItems
        : typeof timelineItems === 'string'
            ? JSON.parse(timelineItems)
            : []

    return rows
        .filter((item) => item && (item.year || item.title || item.content))
        .map((item) => ({
            year: String(item.year || '').trim(),
            title: String(item.title || item.content || '').trim(),
            content: String(item.content || '').trim()
        }))
        .filter((item) => item.year && item.content)
}

const mapAboutContentRow = (row) => ({
    ...row,
    timeline_items: normalizeTimelineItems(row.timeline_items)
})

export const getAboutContent = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, section_key, title, subtitle, type, content, timeline_items, image_url, sort_order, is_active, created_at FROM about_content WHERE is_active = true AND section_key = ANY($1) ORDER BY CASE section_key WHEN 'content' THEN 1 WHEN 'history' THEN 2 ELSE 99 END",
            [ABOUT_CONTENT_KEYS]
        )
        res.json({
            success: true,
            data: (result.rows || []).map(mapAboutContentRow),
            message: 'Lấy nội dung về chúng tôi thành công'
        })
    } catch (error) {
        logger.error('Get about content failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể lấy nội dung',
            errors: { server: error.message }
        })
    }
}

export const getAboutContentAdmin = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, section_key, title, subtitle, type, content, timeline_items, image_url, image_cloudinary_public_id, sort_order, is_active, created_at, updated_at FROM about_content WHERE section_key = ANY($1) ORDER BY CASE section_key WHEN 'content' THEN 1 WHEN 'history' THEN 2 ELSE 99 END",
            [ABOUT_CONTENT_KEYS]
        )
        res.json({
            success: true,
            data: (result.rows || []).map(mapAboutContentRow),
            message: 'Lấy nội dung về chúng tôi thành công'
        })
    } catch (error) {
        logger.error('Get about content admin failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể lấy nội dung',
            errors: { server: error.message }
        })
    }
}

export const createAboutContent = async (req, res) => {
    try {
        const { sectionKey, title, subtitle, type, content, timelineItems, imageUrl, sortOrder } = req.body
        const normalizedSectionKey = String(sectionKey || '').trim()
        const normalizedType = String(type || '').trim()

        if (!ABOUT_CONTENT_KEYS.includes(normalizedSectionKey)) {
            return res.status(400).json({
                success: false,
                message: 'Section key chỉ được phép là content hoặc history',
                errors: { validation: 'Section key chỉ được phép là content hoặc history' }
            })
        }

        const existed = await db.query('SELECT id FROM about_content WHERE section_key = $1', [normalizedSectionKey])
        if (existed.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Section này đã tồn tại, chỉ được chỉnh sửa',
                errors: { validation: 'Section này đã tồn tại, chỉ được chỉnh sửa' }
            })
        }

        if (!['paragraph', 'timeline'].includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                message: 'Type chỉ được phép là paragraph hoặc timeline',
                errors: { validation: 'Type chỉ được phép là paragraph hoặc timeline' }
            })
        }

        if (normalizedType === 'timeline' && normalizedSectionKey !== 'history') {
            return res.status(400).json({
                success: false,
                message: 'Type timeline chỉ dùng cho section history',
                errors: { validation: 'Type timeline chỉ dùng cho section history' }
            })
        }

        if (normalizedType === 'paragraph' && normalizedSectionKey !== 'content') {
            return res.status(400).json({
                success: false,
                message: 'Type paragraph chỉ dùng cho section content',
                errors: { validation: 'Type paragraph chỉ dùng cho section content' }
            })
        }

        if (String(subtitle || '').trim().length > 255) {
            return res.status(400).json({
                success: false,
                message: 'Subtitle tối đa 255 ký tự',
                errors: { validation: 'Subtitle tối đa 255 ký tự' }
            })
        }

        const normalizedTimelineItems = normalizedType === 'timeline' ? normalizeTimelineItems(timelineItems) : []
        const normalizedContent = normalizedType === 'timeline'
            ? ''
            : String(content || '').trim()

        if (normalizedType === 'paragraph' && !normalizedContent) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung là bắt buộc với type paragraph',
                errors: { validation: 'Nội dung là bắt buộc với type paragraph' }
            })
        }

        if (normalizedType === 'timeline' && normalizedTimelineItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Timeline phải có ít nhất một mốc',
                errors: { validation: 'Timeline phải có ít nhất một mốc' }
            })
        }

        const result = await db.query(
            'INSERT INTO about_content (section_key, title, subtitle, type, content, timeline_items, image_url, sort_order, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *',
            [normalizedSectionKey, String(title || '').trim(), String(subtitle || '').trim(), normalizedType, normalizedContent, JSON.stringify(normalizedTimelineItems), imageUrl || '', sortOrder || 0]
        )

        logInfo('ABOUT_CONTENT_CREATE', { userId: req.user?.id, contentId: result.rows[0].id, sectionKey: normalizedSectionKey })

        res.status(201).json({
            success: true,
            data: mapAboutContentRow(result.rows[0]),
            message: 'Tạo nội dung thành công'
        })
    } catch (error) {
        logger.error('Create about content failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể tạo nội dung',
            errors: { server: error.message }
        })
    }
}

export const updateAboutContent = async (req, res) => {
    try {
        const { id } = req.params
        const { title, subtitle, type, content, timelineItems, imageUrl, imagePublicId, sortOrder, isActive } = req.body

        const existing = await db.query('SELECT id, section_key FROM about_content WHERE id = $1', [id])
        if (existing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nội dung',
                errors: { notFound: `Nội dung ID ${id} không tồn tại` }
            })
        }

        const normalizedSectionKey = String(existing.rows[0].section_key || '').trim()
        const normalizedType = String(type || '').trim() || (normalizedSectionKey === 'history' ? 'timeline' : 'paragraph')

        if (!['paragraph', 'timeline'].includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                message: 'Type chỉ được phép là paragraph hoặc timeline',
                errors: { validation: 'Type chỉ được phép là paragraph hoặc timeline' }
            })
        }

        if (String(subtitle || '').trim().length > 255) {
            return res.status(400).json({
                success: false,
                message: 'Subtitle tối đa 255 ký tự',
                errors: { validation: 'Subtitle tối đa 255 ký tự' }
            })
        }

        if (normalizedSectionKey === 'content' && normalizedType !== 'paragraph') {
            return res.status(400).json({
                success: false,
                message: 'Section content chỉ cho phép type paragraph',
                errors: { validation: 'Section content chỉ cho phép type paragraph' }
            })
        }

        if (normalizedSectionKey === 'history' && normalizedType !== 'timeline') {
            return res.status(400).json({
                success: false,
                message: 'Section history chỉ cho phép type timeline',
                errors: { validation: 'Section history chỉ cho phép type timeline' }
            })
        }

        const normalizedTimelineItems = normalizedType === 'timeline' ? normalizeTimelineItems(timelineItems) : []
        const normalizedContent = normalizedType === 'timeline'
            ? ''
            : String(content || '').trim()

        if (normalizedType === 'paragraph' && !normalizedContent) {
            return res.status(400).json({
                success: false,
                message: 'Nội dung là bắt buộc với type paragraph',
                errors: { validation: 'Nội dung là bắt buộc với type paragraph' }
            })
        }

        if (normalizedType === 'timeline' && normalizedTimelineItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Timeline phải có ít nhất một mốc',
                errors: { validation: 'Timeline phải có ít nhất một mốc' }
            })
        }

        const result = await db.query(
            'UPDATE about_content SET title = $1, subtitle = $2, type = $3, content = $4, timeline_items = $5, image_url = $6, image_cloudinary_public_id = $7, sort_order = $8, is_active = $9, updated_at = NOW() WHERE id = $10 RETURNING *',
            [String(title || '').trim(), String(subtitle || '').trim(), normalizedType, normalizedContent, JSON.stringify(normalizedTimelineItems), imageUrl || '', imagePublicId || '', sortOrder || 0, isActive !== undefined ? isActive : true, id]
        )

        logInfo('ABOUT_CONTENT_UPDATE', { userId: req.user?.id, contentId: id, sectionKey: normalizedSectionKey })

        res.json({
            success: true,
            data: mapAboutContentRow(result.rows[0]),
            message: 'Cập nhật nội dung thành công'
        })
    } catch (error) {
        logger.error('Update about content failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể cập nhật nội dung',
            errors: { server: error.message }
        })
    }
}

export const deleteAboutContent = async (req, res) => {
    try {
        const { id } = req.params

        const getMember = await db.query('SELECT image_cloudinary_public_id FROM about_content WHERE id = $1', [id])
        if (getMember.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nội dung',
                errors: { notFound: `Nội dung ID ${id} không tồn tại` }
            })
        }

        const publicId = getMember.rows[0].image_cloudinary_public_id

        await db.query('DELETE FROM about_content WHERE id = $1', [id])

        if (publicId && isCloudinaryConfigured()) {
            try {
                await cloudinary.uploader.destroy(publicId)
            } catch (cloudinaryError) {
                logger.warn('Failed to delete image from cloudinary', { publicId, error: cloudinaryError })
            }
        }

        logInfo('ABOUT_CONTENT_DELETE', { userId: req.user?.id, contentId: id, publicId })

        res.json({
            success: true,
            message: 'Xóa nội dung thành công'
        })
    } catch (error) {
        logger.error('Delete about content failed', { error })
        res.status(500).json({
            success: false,
            message: 'Không thể xóa nội dung',
            errors: { server: error.message }
        })
    }
}
