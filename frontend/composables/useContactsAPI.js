
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { usePaginationSettings } from './usePaginationSettings'

// Role constants for maintainability
export const ROLES = {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    EDITOR: 'editor',
    CONSULTANT: 'consultant'
}

export const useContactsAPI = () => {
    // State
    const contacts = ref([])
    const contactNotes = ref([])
    const loading = ref(false)
    const loadingNotes = ref(false)
    const isAddingNote = ref(false)
    const error = ref(null)

    // Pagination settings (persistent across sessions)
    const { itemsPerPage, itemsPerPageOptions, setItemsPerPage } = usePaginationSettings()

    // Search/Filter/Sort
    const searchQuery = ref('')
    const selectedStatusFilter = ref('')
    const selectedMethodFilter = ref('')
    const currentPage = ref(1)


    // Sort State
    const sortColumn = ref('')
    const sortDirection = ref('asc')

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

    // Form data
    const editForm = reactive({
        id: null,
        contact_method: '',
        social_contact: '',
        status: 'new'
    })

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

        // Apply status and method filters
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

    // Watch itemsPerPage changes to reset current page
    watch(itemsPerPage, () => {
        currentPage.value = 1
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

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            contacts.value = data.data || []
        } catch (err) {
            error.value = err.message
            console.error('Fetch contacts error:', err)
        } finally {
            loading.value = false
        }
    }

    const fetchContact = async (contactId) => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_BASE}/contacts/${contactId}`, {
                credentials: 'include',
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            detailContact.value = data.data || null
        } catch (err) {
            error.value = err.message
            console.error('Fetch contacts error:', err)
        } finally {
            loading.value = false
        }
    }

    // const fetchContactStats = async () => {
    //     try {
    //         const response = await fetch(`${API_BASE}/contacts/stats`, {
    //             credentials: 'include',
    //             headers: getAuthHeaders()
    //         })
    //         const data = await response.json()
    //         // stats handled by computed
    //     } catch (err) {
    //         // ignore
    //     }
    // }

    const fetchContactNotes = async (contactId) => {
        loadingNotes.value = true
        try {
            const response = await fetch(`${API_BASE}/contacts/${contactId}/notes`, {
                headers: getAuthHeaders(),
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            contactNotes.value = data.data || []
        } catch (err) {
            contactNotes.value = []
            console.error('Fetch contact notes error:', err)
        } finally {
            loadingNotes.value = false
        }
    }

    const updateContact = async () => {
        loading.value = true
        error.value = null

        try {
            const { id, ...updateData } = editForm
            const response = await fetch(`${API_BASE}/contacts/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                credentials: 'include', // Include cookies
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

            // Success
            await fetchContacts()
            await fetchContact(editForm.id) // Refresh detail view if open
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

            // Success
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

    // Get next status in cycle
    const getNextStatus = (currentStatus) => {
        const statusCycle = ['new', 'pending', 'responded', 'closed']
        const currentIndex = statusCycle.indexOf(currentStatus)
        const nextIndex = (currentIndex + 1) % statusCycle.length
        return statusCycle[nextIndex]
    }

    const advanceStatus = async (contact) => {
        loading.value = true
        error.value = null

        try {
            const nextStatus = getNextStatus(contact.status)
            if (!nextStatus) return { success: false, message: 'Không thể chuyển trạng thái tiếp theo.' }

            const response = await fetch(`/api/contacts/${contact.id}/status`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({
                    status: nextStatus
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`)
            }

            contact.status = data.data?.status
            console.log('Status updated:', data)
            await fetchContacts()
            // await fetchContact(contact.id) // Refresh detail view if open
            // await fetchContactStats()
            return { success: true, message: data.message }
        } catch (err) {
            error.value = err.message
            return { success: false, message: err.message }
        } finally {
            loading.value = false
        }
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
    const openDetailModal = async (contact) => {
        detailContact.value = contact
        await fetchContactNotes(contact.id)
        showDetailModal.value = true
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

    const openAddNoteForm = () => {
        newNote.value = ''
        showAddNoteForm.value = true
    }

    const openDeleteConfirm = (contact) => {
        contactToDelete.value = contact
        showDeleteConfirm.value = true
    }

    const closeAllModals = () => {
        showDetailModal.value = false
        showEditForm.value = false
        showDeleteConfirm.value = false
        showAddNoteForm.value = false
        detailContact.value = null
        editingContact.value = null
        contactToDelete.value = null
        error.value = null
    }

    const closeAddNoteForm = () => {
        showAddNoteForm.value = false
        newNote.value = ''
    }

    const closeEditForm = () => {
        showEditForm.value = false
        Object.assign(editForm, {
            id: null,
            contact_method: '',
            social_contact: '',
            status: 'new'
        })
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

    // Permission helper for closed status (consultant cannot change closed contacts to other statuses)
    const canChangeClosedStatus = (currentUser) => {
        if (!currentUser) return false
        const currentRoleName = currentUser.role_name
        // Only consultant cannot change closed status
        if (currentRoleName === ROLES.CONSULTANT) return false
        // Other roles can change closed status
        return true
    }

    const canDeleteContact = (currentUser) => {
        if (!currentUser) return false
        const currentRoleName = currentUser.role_name
        // Only consultant cannot delete contacts
        if (currentRoleName === ROLES.CONSULTANT) return false
        // Other roles can delete contacts
        return true
    }

    const handleUpdateContact = async ({ validateEditForm, showError, showSuccess, parseBackendValidationError, editValidationErrors, setBackendValidationErrors }) => {
        // Validate form first
        const isValid = await validateEditForm()
        if (!isValid) {
            showError('Vui lòng sửa các lỗi trong form')
            return
        }

        const result = await updateContact()

        if (result.success) {
            showSuccess(result.message || 'Cập nhật liên hệ thành công!')
            // Clear any previous backend errors
            Object.keys(editValidationErrors).forEach(key => {
                editValidationErrors[key] = ''
            })
        } else {
            // Parse and set backend validation errors
            try {
                const backendErrors = parseBackendValidationError(result.error || result.message)

                // If there are field-specific errors, set them
                const hasFieldErrors = Object.keys(backendErrors).some(key => key !== '_general')

                if (hasFieldErrors) {
                    setBackendValidationErrors(backendErrors, true)
                    showError('Cập nhật liên hệ thất bại, xin hãy kiểm tra lại thông tin')
                } else {
                    // Show general error
                    showError(backendErrors._general || result.message || 'Có lỗi xảy ra khi cập nhật liên hệ')
                }
            } catch (error) {
                console.error('Error parsing backend validation:', error)
                showError(result.message || 'Có lỗi xảy ra khi cập nhật liên hệ')
            }
        }

        return result
    }

    const handleDeleteContact = async ({ showError, showSuccess }) => {
        if (!contactToDelete.value) return

        const result = await deleteContact(contactToDelete.value.id)

        if (result.success) {
            showSuccess(result.message || 'Xóa liên hệ thành công!')
        } else {
            showError(result.message || 'Có lỗi xảy ra khi xóa liên hệ')
        }
        return result
    }


    const handleAddNote = async ({ showError, showSuccess }) => {
        if (!detailContact.value?.id || !newNote.value.trim()) return
        isAddingNote.value = true

        const result = await addContactNote(detailContact.value.id, newNote.value.trim())
        isAddingNote.value = false

        if (result.success) {
            showSuccess(result.message || 'Thêm ghi chú thành công!')

            closeAddNoteForm()
            // Reload notes list
            await fetchContactNotes(detailContact.value.id)
        } else {
            showError(result.message || 'Thêm ghi chú thất bại!')
        }
    }

    // Handle status change
    // const handleChangeStatus = async (contact) => {
    //     const nextStatus = getNextStatus(contact.status)

    //     try {
    //         const response = await $fetch(`/api/contacts/${contact.id}`, {
    //             method: 'PUT',
    //             headers: {
    //                 'Authorization': `Bearer ${useCookie('token').value}`
    //             },
    //             body: {
    //                 status: nextStatus
    //             }
    //         })

    //         if (response.success) {
    //             showSuccess(`Cập nhật trạng thái thành "${getStatusDisplayName(nextStatus)}" thành công`)
    //             await fetchContacts()
    //             await fetchContactStats()
    //         } else {
    //             showError(response.message || 'Cập nhật trạng thái thất bại')
    //         }
    //     } catch (err) {
    //         console.error('Update status error:', err)
    //         showError(err.data?.message || 'Cập nhật trạng thái thất bại')
    //     }
    // }

    const handleChangeStatus = async (contact, { showError, showSuccess }) => {
        const result = await advanceStatus(contact)
        if (result.success) {
            console.log('Status advanced successfully:', result)
            showSuccess(result.message || 'Cập nhật trạng thái thành công!')
        } else {
            console.error('Error advancing status:', result)
            showError(result.message || 'Cập nhật trạng thái thất bại!')
        }

        return result
    }

    // Init
    onMounted(async () => {
        await Promise.all([
            fetchContacts(),
            // fetchContactNotes()
        ])
    })

    return {
        contacts,
        stats,
        newNote,
        contactNotes,
        loading,
        loadingNotes,
        isAddingNote,
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
        // fetchContactStats,
        fetchContactNotes,
        updateContact,
        deleteContact,
        addContactNote,
        advanceStatus,
        getNextStatus,
        // Form helpers
        resetEditForm,
        openDetailModal,
        openEditForm,
        openAddNoteForm,
        closeAddNoteForm,

        openDeleteConfirm,
        closeAllModals,
        closeEditForm,
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
        getMethodBadgeColor,
        canChangeClosedStatus,
        canDeleteContact,
        // Event handlers for direct use in page
        handleUpdateContact,
        handleDeleteContact,
        handleAddNote,
        handleChangeStatus
    }
}
