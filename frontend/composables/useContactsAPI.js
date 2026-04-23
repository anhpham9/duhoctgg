import { ref, reactive, onMounted, computed, watch } from 'vue'
import { usePaginationSettings } from './usePaginationSettings'

export const useContactsAPI = () => {
    // State
    const contacts = ref([])
    const contactNotes = ref([])
    const loading = ref(false)
    const loadingNotes = ref(false)
    const error = ref(null)

    // Pagination settings
    const { itemsPerPage, itemsPerPageOptions, setItemsPerPage } = usePaginationSettings()
    const currentPage = ref(1)

    // Search/Filter/Sort
    const searchQuery = ref('')
    const selectedStatusFilter = ref('')
    const selectedMethodFilter = ref('')
    const sortColumn = ref('')
    const sortDirection = ref('asc')

    // Form data
    const editForm = reactive({
        id: null,
        contact_method: '',
        social_contact: '',
        status: 'new'
    })

    // UI State
    const detailContact = ref(null)
    const editingContact = ref(null)
    const showDetailModal = ref(false)
    const showEditForm = ref(false)
    const showDeleteConfirm = ref(false)
    const contactToDelete = ref(null)

    const newNote = ref('')
    const showAddNoteForm = ref(false)

    // API Base URL
    const config = useRuntimeConfig()
    const API_BASE = config.public.apiBase

    // Helpers
    const getAuthHeaders = () => ({ 'Content-Type': 'application/json' })

    // Filtered and paginated contacts
    const filteredContacts = computed(() => {
        let filtered = contacts.value
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            filtered = filtered.filter(contact =>
                contact.name.toLowerCase().includes(query) ||
                contact.message.toLowerCase().includes(query) ||
                contact.email.toLowerCase().includes(query) ||
                (contact.phone && contact.phone.toLowerCase().includes(query))
            )
        }
        if (selectedStatusFilter.value) {
            filtered = filtered.filter(contact => contact.status === selectedStatusFilter.value)
        }
        if (selectedMethodFilter.value) {
            filtered = filtered.filter(contact => contact.contact_method === selectedMethodFilter.value)
        }
        if (sortColumn.value) {
            filtered.sort((a, b) => {
                let aVal = a[sortColumn.value]
                let bVal = b[sortColumn.value]
                if (sortColumn.value === 'id') {
                    aVal = parseInt(aVal)
                    bVal = parseInt(bVal)
                } else if (sortColumn.value === 'created_at') {
                    aVal = new Date(aVal)
                    bVal = new Date(bVal)
                } else {
                    aVal = aVal ? aVal.toString().toLowerCase() : ''
                    bVal = bVal ? bVal.toString().toLowerCase() : ''
                }
                if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
                if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
                return 0
            })
        }
        return filtered
    })

    const totalPages = computed(() => {
        if (itemsPerPage.value === -1) return 1
        return Math.ceil(filteredContacts.value.length / itemsPerPage.value)
    })

    const paginatedContacts = computed(() => {
        if (itemsPerPage.value === -1) return filteredContacts.value
        const start = (currentPage.value - 1) * itemsPerPage.value
        const end = start + itemsPerPage.value
        return filteredContacts.value.slice(start, end)
    })

    // Stats
    const stats = computed(() => {
        const methodStats = { email: 0, phone: 0, social: 0 }
        const statusStats = { new: 0, pending: 0, responded: 0, closed: 0 }
        contacts.value.forEach(contact => {
            const method = contact.contact_method || 'unknown'
            methodStats[method] = (methodStats[method] || 0) + 1
            const status = contact.status || 'unknown'
            statusStats[status] = (statusStats[status] || 0) + 1
        })
        return { ...methodStats, ...statusStats, total: contacts.value.length }
    })

    // CRUD
    const fetchContacts = async () => {
        loading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_BASE}/contacts`, {
                credentials: 'include',
                headers: getAuthHeaders()
            })
            const data = await response.json()
            contacts.value = data.data || []
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const fetchContactStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/contacts/stats`, {
                credentials: 'include',
                headers: getAuthHeaders()
            })
            const data = await response.json()
            // stats handled by computed
        } catch (err) {
            // ignore
        }
    }

    const fetchContactNotes = async (contactId) => {
        loadingNotes.value = true
        try {
            const response = await fetch(`${API_BASE}/contacts/${contactId}/notes`, {
                headers: getAuthHeaders(),
                credentials: 'include'
            })
            const data = await response.json()
            contactNotes.value = data.data || []
        } catch (err) {
            contactNotes.value = []
        } finally {
            loadingNotes.value = false
        }
    }

    const createContact = async (form) => {
        loading.value = true
        try {
            const response = await fetch(`${API_BASE}/contacts`, {
                method: 'POST',
                credentials: 'include',
                headers: getAuthHeaders(),
                body: JSON.stringify(form)
            })
            const data = await response.json()
            return data
        } catch (err) {
            return { success: false, message: err.message }
        } finally {
            loading.value = false
        }
    }

    const updateContact = async () => {
        loading.value = true
        error.value = null
        try {
            const { id, contact_method, social_contact, status } = editForm
            const updateData = { contact_method, social_contact, status }
            const response = await fetch(`${API_BASE}/contacts/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData)
            })
            const data = await response.json()
            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `HTTP ${response.status}`,
                    error: data,
                    status: response.status
                }
            }
            await fetchContacts()
            resetEditForm()
            showEditForm.value = false
            editingContact.value = null
            return { success: true, message: data.message }
        } catch (err) {
            error.value = err.message
            return {
                success: false,
                message: err.message,
                error: err.message
            }
        } finally {
            loading.value = false
        }
    }

    const deleteContact = async (contactId) => {
        loading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_BASE}/contacts/${contactId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
                credentials: 'include'
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`)
            }
            await fetchContacts()
            showDeleteConfirm.value = false
            contactToDelete.value = null
            return { success: true, message: data.message }
        } catch (err) {
            error.value = err.message
            return { success: false, message: err.message }
        } finally {
            loading.value = false
        }
    }

    const addContactNote = async (contactId, note) => {
        loadingNotes.value = true
        error.value = null
        try {
            const response = await fetch(`${API_BASE}/contacts/${contactId}/notes`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({ note: note })
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`)
            }

            await fetchContactNotes(contactId)
            console.log('Note added:', data)
            console.log('Note added with:', note)

            return { success: true, message: data.message }
        } catch (err) {
            error.value = err.message
            return { success: false, message: err.message }
        } finally {
            loadingNotes.value = false
        }
    }

    // Status chuyển tuần tự
    const getNextStatus = (currentStatus) => {
        const validStatuses = ['new', 'pending', 'responded', 'closed']
        const idx = validStatuses.indexOf(currentStatus)
        if (idx === -1 || idx === validStatuses.length - 1) return null
        return validStatuses[idx + 1]
    }
    const advanceStatus = async (contact) => {
        const nextStatus = getNextStatus(contact.status)
        if (!nextStatus) return { success: false, message: 'Không thể chuyển trạng thái tiếp theo.' }
        Object.assign(editForm, {
            id: contact.id,
            contact_method: contact.contact_method || '',
            social_contact: contact.social_contact || '',
            status: nextStatus
        })
        return await updateContact()
    }

    // Form helpers
    const resetEditForm = () => {
        Object.assign(editForm, {
            id: null,
            contact_method: '',
            social_contact: '',
            status: 'new'
        })
    }
    const openEditForm = (contact) => {
        editingContact.value = contact
        Object.assign(editForm, {
            id: contact.id,
            contact_method: contact.contact_method || '',
            social_contact: contact.social_contact || '',
            status: contact.status
        })
        showEditForm.value = true
    }
    const openDetailModal = async (contact) => {
        detailContact.value = contact
        await fetchContactNotes(contact.id)
        showDetailModal.value = true
    }

    const openAddNoteForm = () => {
        newNote.value = ''
        showAddNoteForm.value = true
    }
    const openDeleteConfirm = (contact) => {
        contactToDelete.value = contact
        showDeleteConfirm.value = true
    }

    const closeAddNoteForm = () => {
        showAddNoteForm.value = false
        newNote.value = ''
    }
    const closeAllModals = () => {
        showEditForm.value = false
        showDetailModal.value = false
        showDeleteConfirm.value = false
        showAddNoteForm.value = false
        detailContact.value = null
        editingContact.value = null
        contactToDelete.value = null
        error.value = null
    }

    // Search/Filter helpers
    const setSearchQuery = (query) => {
        searchQuery.value = query
        currentPage.value = 1
    }
    const setMethodFilter = (method) => {
        selectedMethodFilter.value = method
        currentPage.value = 1
    }
    const setStatusFilter = (status) => {
        selectedStatusFilter.value = status
        currentPage.value = 1
    }
    const handleSort = (column) => {
        if (sortColumn.value === column) {
            sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
        } else {
            sortColumn.value = column
            sortDirection.value = 'asc'
        }
        currentPage.value = 1
    }
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page
        }
    }

    // Status helpers
    const getStatusDisplayName = (statusName) => {
        const statusMap = {
            'new': 'Mới',
            'pending': 'Chờ phản hồi',
            'responded': 'Đã phản hồi',
            'closed': 'Đã đóng'
        }
        return statusMap[statusName] || statusName
    }
    const getStatusIcon = (statusName) => {
        const iconMap = {
            'new': 'fas fa-envelope',
            'pending': 'fas fa-clock',
            'responded': 'fas fa-check-circle',
            'closed': 'fas fa-times-circle'
        }
        return iconMap[statusName] || 'fas fa-question-circle'
    }
    const getStatusBadgeColor = (statusName) => {
        const colorMap = {
            'new': 'status-new',
            'pending': 'status-pending',
            'responded': 'status-responded',
            'closed': 'status-closed'
        }
        return colorMap[statusName] || 'status-default'
    }
    const getMethodDisplayName = (methodName) => {
        const methodMap = {
            'email': 'Email',
            'phone': 'Điện thoại',
            'social': 'Fb/Zalo'
        }
        return methodMap[methodName] || methodName
    }
    const getMethodIcon = (methodName) => {
        const iconMap = {
            'email': 'fas fa-envelope',
            'phone': 'fas fa-phone',
            'social': 'fas fa-share-alt'
        }
        return iconMap[methodName] || 'fas fa-question-circle'
    }
    const getMethodBadgeColor = (methodName) => {
        const colorMap = {
            'email': 'method-email',
            'phone': 'method-phone',
            'social': 'method-social'
        }
        return colorMap[methodName] || 'method-default'
    }

    // Init
    onMounted(async () => {
        await Promise.all([
            fetchContacts(),
            fetchContactStats()
        ])
    })

    return {
        contacts,
        stats,
        contactNotes,
        loading,
        loadingNotes,
        error,
        // Search/Filter/Sort
        searchQuery,
        selectedStatusFilter,
        selectedMethodFilter,
        sortColumn,
        sortDirection,
        // Pagination
        currentPage,
        itemsPerPage,
        itemsPerPageOptions,
        filteredContacts,
        paginatedContacts,
        totalPages,
        // Form state
        detailContact,
        editingContact,
        showDetailModal,
        showEditForm,
        showDeleteConfirm,
        contactToDelete,
        showAddNoteForm,
        editForm,
        // Methods
        fetchContacts,
        fetchContactStats,
        fetchContactNotes,
        createContact,
        updateContact,
        deleteContact,
        addContactNote,
        advanceStatus,
        getNextStatus,
        // Form helpers
        resetEditForm,
        openDetailModal,
        openEditForm,
        newNote,
        openAddNoteForm,
        closeAddNoteForm,

        openDeleteConfirm,
        closeAllModals,
        // Search/Filter helpers
        setSearchQuery,
        setMethodFilter,
        setStatusFilter,
        handleSort,
        setItemsPerPage,
        goToPage,
        // Display helpers
        getStatusDisplayName,
        getStatusBadgeColor,
        getStatusIcon,
        getMethodDisplayName,
        getMethodIcon,
        getMethodBadgeColor
    }
}
