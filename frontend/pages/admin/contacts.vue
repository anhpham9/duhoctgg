<template>
  <div>
    <!-- Loading state while checking permissions -->
    <div v-if="isCheckingPermission" class="loading-container">
      <div class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Kiểm tra quyền truy cập...</p>
      </div>
    </div>

    <!-- Access denied -->
    <div v-else-if="!hasPermission" class="access-denied">
      <div class="denied-content">
        <i class="fas fa-ban"></i>
        <h2>Truy cập bị từ chối</h2>
        <p>Bạn không có quyền truy cập trang này.</p>
        <button @click="$router.push('/admin')" class="btn-back">
          <i class="fas fa-arrow-left"></i>
          Quay lại Dashboard
        </button>
      </div>
    </div>

    <!-- Main content -->
    <div v-else>
      <h1>Contact Management</h1>
      <p>Admin contacts management page</p>
      <div class="user-info">
        <small>Đăng nhập với quyền: {{ getUserRoleName() }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { jwtDecode } from "jwt-decode"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
  ssr: false
});

const isCheckingPermission = ref(true)
const hasPermission = ref(false)
const currentUser = ref(null)

// Check permissions on mount
onMounted(() => {
  checkPermissions()
})

const checkPermissions = () => {
  if (!process.client) return
  
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      navigateTo('/login')
      return
    }

    const user = jwtDecode(token)
    currentUser.value = user
    
    // Check if user has permission to access contacts
    // Superadmin (1), Admin/Manager (2, 3), Consultant (5)
    hasPermission.value = [1, 2, 3, 5].includes(user.role_id)
    
    if (!hasPermission.value) {
      console.warn('🚫 User does not have permission to access contacts')
      setTimeout(() => {
        navigateTo('/admin')
      }, 2000) // Show access denied message for 2 seconds before redirect
    }
  } catch (error) {
    console.error('❌ Permission check error:', error)
    navigateTo('/login')
  } finally {
    isCheckingPermission.value = false
  }
}

const getUserRoleName = () => {
  if (!currentUser.value) return 'Unknown'
  
  const roleMap = {
    1: 'Superadmin',
    2: 'Admin', 
    3: 'Manager',
    4: 'Editor',
    5: 'Consultant',
  }
  
  return roleMap[currentUser.value.role_id] || 'Unknown'
}
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading {
  text-align: center;
  color: #666;
}

.loading i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #d32f2f;
}

.access-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.denied-content {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.denied-content i {
  font-size: 4rem;
  color: #d32f2f;
  margin-bottom: 1.5rem;
}

.denied-content h2 {
  color: #333;
  margin-bottom: 1rem;
}

.denied-content p {
  color: #666;
  margin-bottom: 2rem;
}

.btn-back {
  background: #d32f2f;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.btn-back:hover {
  background: #b71c1c;
}

.btn-back i {
  margin-right: 8px;
}

.user-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 8px;
  color: #666;
}
</style>