import { computed, ref } from 'vue'

const ROLE_DEFINITIONS = [
    { id: 1, name: 'Superadmin' },
    { id: 2, name: 'Admin' },
    { id: 3, name: 'Manager' },
    { id: 4, name: 'Editor' },
    { id: 5, name: 'Consultant' }
]

const DEFAULT_MODULES = [
    { key: 'dashboard', label: 'Dashboard', routePrefix: '/admin', allowedRoles: [1, 2, 3, 4, 5], description: 'Trang tổng quan' },
    { key: 'users', label: 'Người dùng', routePrefix: '/admin/users', allowedRoles: [1, 2, 3], description: 'Quản lý tài khoản' },
    { key: 'contacts', label: 'Liên hệ', routePrefix: '/admin/contacts', allowedRoles: [1, 2, 3, 5], description: 'Quản lý liên hệ' },
    { key: 'schools', label: 'Trường học', routePrefix: '/admin/schools', allowedRoles: [1, 2, 3], description: 'Quản lý trường học' },
    { key: 'news', label: 'Tin tức', routePrefix: '/admin/news', allowedRoles: [1, 2, 3, 4], description: 'Quản lý tin tức' },
    { key: 'content', label: 'Nội dung', routePrefix: '/admin/content', allowedRoles: [1, 2, 3], description: 'Quản lý nội dung tĩnh' },
    { key: 'teamMembers', label: 'Đội ngũ chuyên gia', routePrefix: '/admin/team-members', allowedRoles: [1, 2, 3], description: 'Quản lý đội ngũ' },
    { key: 'other', label: 'Mục khác', routePrefix: '/admin/other', allowedRoles: [1, 2, 3], description: 'Các trang nội dung bổ sung' },
    { key: 'faqs', label: 'FAQ', routePrefix: '/admin/faqs', allowedRoles: [1, 2, 3, 4, 5], description: 'Quản lý FAQ' },
    { key: 'notifications', label: 'Thông báo', routePrefix: '/admin/notifications', allowedRoles: [1, 2, 3, 4, 5], description: 'Xem thông báo hệ thống' },
    { key: 'profile', label: 'Hồ sơ', routePrefix: '/admin/profile', allowedRoles: [1, 2, 3, 4, 5], description: 'Hồ sơ tài khoản' },
    { key: 'settings', label: 'Cài đặt', routePrefix: '/admin/settings', allowedRoles: [1, 2], description: 'Cấu hình hệ thống' },
    { key: 'permissions', label: 'Phân quyền', routePrefix: '/admin/settings/permissions', allowedRoles: [1, 2], description: 'Quản trị quyền truy cập' }
]

const CACHE_TTL = 5 * 60 * 1000

const modules = ref(DEFAULT_MODULES.map((item) => ({ ...item })))
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const lastFetchedAt = ref(0)
let fetchPromise = null

const sanitizeRoleIds = (roles) => {
    const validRoleIds = new Set(ROLE_DEFINITIONS.map((item) => item.id))
    return [...new Set((roles || []).map((value) => Number(value)).filter((value) => validRoleIds.has(value)))].sort((a, b) => a - b)
}

const normalizeModules = (incomingModules = []) => {
    const incomingMap = new Map((incomingModules || []).map((module) => [String(module?.key || ''), module]))

    return DEFAULT_MODULES.map((baseModule) => {
        const source = incomingMap.get(baseModule.key)
        const normalizedRoles = sanitizeRoleIds(source?.allowedRoles)
        const safeRoles = sanitizeRoleIds([1, ...normalizedRoles])

        return {
            ...baseModule,
            label: source?.label || baseModule.label,
            description: source?.description || baseModule.description,
            routePrefix: source?.routePrefix || baseModule.routePrefix,
            allowedRoles: safeRoles.length > 0 ? safeRoles : [...baseModule.allowedRoles]
        }
    })
}

const pickBestMatchedModuleByPath = (path, moduleList) => {
    const normalizedPath = String(path || '').trim()
    if (!normalizedPath.startsWith('/admin')) return null

    const matched = moduleList
        .filter((module) => normalizedPath === module.routePrefix || normalizedPath.startsWith(`${module.routePrefix}/`))
        .sort((a, b) => b.routePrefix.length - a.routePrefix.length)

    return matched[0] || moduleList.find((module) => module.key === 'dashboard') || null
}

export const usePermissionsConfig = () => {
    const config = useRuntimeConfig()
    const API_BASE = config.public.apiBase

    const modulesMap = computed(() => {
        const map = new Map()
        modules.value.forEach((module) => {
            map.set(module.key, module)
        })
        return map
    })

    const fetchPermissionsConfig = async (force = false) => {
        const now = Date.now()

        if (!force && modules.value.length > 0 && now - lastFetchedAt.value < CACHE_TTL) {
            return modules.value
        }

        if (fetchPromise && !force) {
            return fetchPromise
        }

        loading.value = true
        error.value = ''

        fetchPromise = (async () => {
            try {
                const response = await fetch(`${API_BASE}/permissions/config`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }

                const payload = await response.json()
                const nextModules = normalizeModules(payload?.data?.modules || [])
                modules.value = nextModules
                lastFetchedAt.value = Date.now()
                return nextModules
            } catch (fetchError) {
                error.value = fetchError?.message || 'Không thể tải cấu hình quyền'
                modules.value = normalizeModules(DEFAULT_MODULES)
                lastFetchedAt.value = Date.now()
                return modules.value
            } finally {
                loading.value = false
                fetchPromise = null
            }
        })()

        return fetchPromise
    }

    const updatePermissionsConfig = async (nextModules = []) => {
        saving.value = true
        error.value = ''

        try {
            const normalizedModules = normalizeModules(nextModules)
            const response = await fetch(`${API_BASE}/permissions/config`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ modules: normalizedModules })
            })

            const payload = await response.json()
            if (!response.ok || !payload?.success) {
                throw new Error(payload?.message || `HTTP ${response.status}`)
            }

            modules.value = normalizeModules(payload?.data?.modules || normalizedModules)
            lastFetchedAt.value = Date.now()
            return {
                success: true,
                message: payload?.message || 'Lưu cấu hình quyền thành công'
            }
        } catch (saveError) {
            error.value = saveError?.message || 'Không thể lưu cấu hình quyền'
            return {
                success: false,
                message: error.value
            }
        } finally {
            saving.value = false
        }
    }

    const canAccessModule = (moduleKey, roleId) => {
        if (Number(roleId) === 1) return true
        const module = modulesMap.value.get(moduleKey)
        if (!module) return false
        return module.allowedRoles.includes(Number(roleId))
    }

    const canAccessPath = (path, roleId) => {
        const normalizedRoleId = Number(roleId)
        if (normalizedRoleId === 1) return true

        const matchedModule = pickBestMatchedModuleByPath(path, modules.value)
        if (!matchedModule) return true

        return matchedModule.allowedRoles.includes(normalizedRoleId)
    }

    return {
        roleDefinitions: ROLE_DEFINITIONS,
        modules,
        loading,
        saving,
        error,
        fetchPermissionsConfig,
        updatePermissionsConfig,
        canAccessModule,
        canAccessPath
    }
}