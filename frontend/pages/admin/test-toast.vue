<template>
  <div class="test-page">
    <h1>Test Toast Notifications</h1>
    
    <div class="button-grid">
      <button @click="testSuccess" class="btn btn-success">
        <i class="fas fa-check"></i>
        Test Success
      </button>
      
      <button @click="testError" class="btn btn-error">
        <i class="fas fa-times"></i>
        Test Error
      </button>
      
      <button @click="testWarning" class="btn btn-warning">
        <i class="fas fa-exclamation-triangle"></i>
        Test Warning
      </button>
      
      <button @click="testInfo" class="btn btn-info">
        <i class="fas fa-info"></i>
        Test Info
      </button>
      
      <button @click="testLoading" class="btn btn-loading">
        <i class="fas fa-spinner"></i>
        Test Loading
      </button>
    </div>
    
    <!-- Toast Component -->
    <Toast />
  </div>
</template>

<script setup>
import Toast from '~/components/Toast.vue'
import { useNotifications } from '~/composables/useNotifications'

// Page meta
definePageMeta({
  layout: 'admin'
})

const {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  hideNotification
} = useNotifications()

const testSuccess = () => {
  showSuccess('Đây là thông báo thành công! 🎉')
}

const testError = () => {
  showError('Đây là thông báo lỗi! ❌')
}

const testWarning = () => {
  showWarning('Đây là thông báo cảnh báo! ⚠️')
}

const testInfo = () => {
  showInfo('Đây là thông báo thông tin! ℹ️')
}

const testLoading = () => {
  showLoading('Đang xử lý... Sẽ tự ẩn sau 3 giây')
  
  setTimeout(() => {
    hideNotification()
    showSuccess('Hoàn thành!')
  }, 3000)
}
</script>

<style scoped>
.test-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  transition: all 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-error {
  background: #ef4444;
  color: white;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-info {
  background: #3b82f6;
  color: white;
}

.btn-loading {
  background: #6b7280;
  color: white;
}
</style>