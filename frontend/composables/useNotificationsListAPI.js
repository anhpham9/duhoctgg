import { ref, reactive, computed, onMounted } from 'vue'

export const useNotificationsListAPI = () => {
    // State
    const notifications = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Pagination
    const currentPage = ref(1)
    const limit = ref(10)
    const total = ref(0)
    const itemsPerPageOptions = [5, 10, 20, 50]

    // Search/Filter
    const searchQuery = ref('')
    const selectedType = ref('')
    const selectedStatus = ref('')

    // Sort
    const sortColumn = ref('created_at')
    const sortDirection = ref('desc')

    // API Base URL
    const config = useRuntimeConfig()
    const API_BASE = config.public.apiBase

    // Notification type options
    const notificationTypes = [
        { value: 'contact_submission', label: 'Liên hệ mới' },
        { value: 'backup_completed', label: 'Sao lưu hoàn tất' },
        { value: 'account_locked', label: 'Tài khoản bị khóa' },
        { value: 'settings_changed', label: 'Cài đặt thay đổi' }
    ]

    const statusOptions = [
        { value: 'unread', label: 'Chưa xem' },
        { value: 'read', label: 'Đã xem' }
    ]

    // Computed properties
    const totalPages = computed(() => Math.ceil(total.value / limit.value))

    const getTypeLabel = (type) => {
        const typeObj = notificationTypes.find(t => t.value === type)
        return typeObj ? typeObj.label : type
    }

    const getStatusLabel = (isRead) => {
        return isRead ? 'Đã xem' : 'Chưa xem'
    }

    const getIconByType = (type) => {
        const icons = {
            'contact_submission': 'fas fa-envelope',
            'backup_completed': 'fas fa-save',
            'account_locked': 'fas fa-lock',
            'settings_changed': 'fas fa-cog'
        }
        return icons[type] || 'fas fa-bell'
    }

    const getColorByType = (type) => {
        const colors = {
            'contact_submission': 'blue',
            'backup_completed': 'green',
            'account_locked': 'red',
            'settings_changed': 'orange'
        }
        return colors[type] || 'gray'
    }

    // Data fetching
    const fetchNotifications = async () => {
        loading.value = true
        error.value = null

        try {
            const params = new URLSearchParams({
                page: currentPage.value,
                limit: limit.value
            })

            if (searchQuery.value) {
                params.append('search', searchQuery.value)
            }

            if (selectedType.value) {
                params.append('type', selectedType.value)
            }

            if (selectedStatus.value) {
                params.append('status', selectedStatus.value)
            }

            const response = await fetch(`${API_BASE}/notifications?${params}`, {
                credentials: 'include'
            })

            const result = await response.json()

            if (result.success) {
                notifications.value = result.data.map(n => ({
                    id: n.id,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    data: n.data || {},
                    created_at: n.created_at,
                    is_read: n.is_read,
                    icon: getIconByType(n.type),
                    color: getColorByType(n.type)
                }))
                total.value = result.total
            }
        } catch (err) {
            console.error('Fetch notifications error:', err)
            error.value = 'Lỗi khi tải thông báo'
            notifications.value = []
        } finally {
            loading.value = false
        }
    }

    // Mark single notification as read
    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })

            const result = await response.json()

            if (result.success) {
                const notification = notifications.value.find(n => n.id === notificationId)
                if (notification) {
                    notification.is_read = true
                }
            }

            return result.success
        } catch (error) {
            console.error('Mark as read error:', error)
            return false
        }
    }

    // Mark multiple as read
    const markMultipleAsRead = async (notificationIds) => {
        try {
            // Mark each notification individually (or create batch endpoint)
            const results = await Promise.all(
                notificationIds.map(id => markAsRead(id))
            )
            return results.every(r => r)
        } catch (error) {
            console.error('Mark multiple as read error:', error)
            return false
        }
    }

    // Delete notification
    const deleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })

            const result = await response.json()

            if (result.success) {
                notifications.value = notifications.value.filter(n => n.id !== notificationId)
                total.value = Math.max(0, total.value - 1)
            }

            return result.success
        } catch (error) {
            console.error('Delete notification error:', error)
            return false
        }
    }

    // Delete multiple notifications
    const deleteMultiple = async (notificationIds) => {
        try {
            const results = await Promise.all(
                notificationIds.map(id => deleteNotification(id))
            )
            return results.every(r => r)
        } catch (error) {
            console.error('Delete multiple error:', error)
            return false
        }
    }

    // Filter/Search handlers
    const setSearchQuery = (query) => {
        searchQuery.value = query
        currentPage.value = 1
        fetchNotifications()
    }

    const setType = (type) => {
        selectedType.value = type
        currentPage.value = 1
        fetchNotifications()
    }

    const setStatus = (status) => {
        selectedStatus.value = status
        currentPage.value = 1
        fetchNotifications()
    }

    const setItemsPerPage = (newLimit) => {
        limit.value = newLimit
        currentPage.value = 1
        fetchNotifications()
    }

    const goToPage = (page) => {
        currentPage.value = Math.max(1, Math.min(page, totalPages.value))
        fetchNotifications()
    }

    const clearFilters = () => {
        searchQuery.value = ''
        selectedType.value = ''
        selectedStatus.value = ''
        currentPage.value = 1
        fetchNotifications()
    }

    // Format utilities
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffSec = Math.floor(diffMs / 1000)
        const diffMin = Math.floor(diffSec / 60)
        const diffHour = Math.floor(diffMin / 60)
        const diffDay = Math.floor(diffHour / 24)

        if (diffSec < 60) return 'Vừa xong'
        if (diffMin < 60) return `${diffMin} phút trước`
        if (diffHour < 24) return `${diffHour} giờ trước`
        if (diffDay < 7) return `${diffDay} ngày trước`

        return formatDate(dateString)
    }

    return {
        // State
        notifications: computed(() => notifications.value),
        loading: computed(() => loading.value),
        error: computed(() => error.value),

        // Pagination
        currentPage: computed(() => currentPage.value),
        limit: computed(() => limit.value),
        total: computed(() => total.value),
        totalPages: computed(() => totalPages.value),
        itemsPerPageOptions,

        // Filters
        searchQuery: computed(() => searchQuery.value),
        selectedType: computed(() => selectedType.value),
        selectedStatus: computed(() => selectedStatus.value),
        notificationTypes,
        statusOptions,

        // Sort
        sortColumn: computed(() => sortColumn.value),
        sortDirection: computed(() => sortDirection.value),

        // Methods
        fetchNotifications,
        markAsRead,
        markMultipleAsRead,
        deleteNotification,
        deleteMultiple,
        setSearchQuery,
        setType,
        setStatus,
        setItemsPerPage,
        goToPage,
        clearFilters,

        // Helpers
        getTypeLabel,
        getStatusLabel,
        getIconByType,
        getColorByType,
        formatDate,
        formatTimeAgo
    }
}
