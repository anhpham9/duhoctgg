// ========================================
// SHARED CURRENT USER COMPOSABLE 
// ========================================
// Tránh duplicate API calls từ AdminHeader và AdminSidebar

import { ref, computed, readonly } from 'vue'

// Shared state across components
const currentUser = ref(null)
const loadingUser = ref(false)
const errorUser = ref(null)
let fetchPromise = null // Để tránh multiple concurrent requests

export const useCurrentUser = () => {
    const config = useRuntimeConfig()

    // Fetch user data from API
    const fetchCurrentUser = async (force = false) => {
        // Nếu đang loading và không force, return existing promise
        if (fetchPromise && !force) {
            return fetchPromise
        }

        // Nếu đã có data và không force, không cần fetch lại
        if (currentUser.value && !force) {
            return currentUser.value
        }

        if (!process.client) {
            return null
        }
        
        loadingUser.value = true
        errorUser.value = null
        
        fetchPromise = (async () => {
            try {
                const response = await fetch(`${config.public.apiBase}/auth/me`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                
                if (response.ok) {
                    const data = await response.json()
                    currentUser.value = data.user
                    return data.user
                } else {
                    currentUser.value = null
                    errorUser.value = `HTTP ${response.status}`
                    return null
                }
            } catch (error) {
                console.error('Error fetching current user:', error)
                currentUser.value = null
                errorUser.value = error.message
                return null
            } finally {
                loadingUser.value = false
                fetchPromise = null
            }
        })()

        return fetchPromise
    }

    // Clear user data (useful for logout)
    const clearUser = () => {
        currentUser.value = null
        loadingUser.value = false
        errorUser.value = null
        fetchPromise = null
    }

    // Computed getters
    const userName = computed(() => {
        return currentUser.value?.name || currentUser.value?.username || 'Admin'
    })

    const userRole = computed(() => {
        return currentUser.value?.role_name || 'Unknown'
    })

    const isLoaded = computed(() => {
        return !loadingUser.value && currentUser.value !== null
    })

    // Permission helpers
    const hasRole = (roleId) => {
        return currentUser.value?.role_id === roleId
    }

    const hasAnyRole = (roleIds) => {
        return roleIds.includes(currentUser.value?.role_id)
    }

    const isSuperadmin = computed(() => hasRole(1))
    const isAdmin = computed(() => hasAnyRole([1, 2]))
    const isManager = computed(() => hasAnyRole([1, 2, 3]))

    return {
        // State
        currentUser: readonly(currentUser),
        loadingUser: readonly(loadingUser),
        errorUser: readonly(errorUser),
        
        // Actions
        fetchCurrentUser,
        clearUser,
        
        // Computed
        userName,
        userRole,
        isLoaded,
        
        // Permissions
        hasRole,
        hasAnyRole,
        isSuperadmin,
        isAdmin,
        isManager
    }
}