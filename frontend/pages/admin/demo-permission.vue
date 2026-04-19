<template>
    <!-- Demo page để test PermissionGuard UI states -->
    <div class="demo-page">
        <div class="demo-header">
            <h1>🧪 Demo PermissionGuard UI</h1>
            <p>Trang này để test các trạng thái UI của PermissionGuard component</p>
        </div>

        <!-- Test case 1: Chỉ Superadmin -->
        <div class="demo-section">
            <h2>Test 1: Chỉ Superadmin được phép</h2>
            <PermissionGuard :allowed-roles="[1]" :show-user-info="true" :show-error-details="true"
                denied-title="🚫 Chỉ dành cho Superadmin"
                denied-message="Tính năng này chỉ dành cho Superadmin. Bạn cần quyền cao hơn."
                back-button-text="Quay lại Dashboard">
                <template #default="{ user, userRole }">
                    <div class="success-content">
                        <h3>🎉 Chào mừng Superadmin!</h3>
                        <p><strong>User:</strong> {{ user.username }}</p>
                        <p><strong>Role:</strong> {{ userRole }}</p>
                    </div>
                </template>
            </PermissionGuard>
        </div>

        <!-- Test case 2: Admin + Manager -->
        <div class="demo-section">
            <h2>Test 2: Admin và Manager được phép</h2>
            <PermissionGuard :allowed-roles="[1, 2, 3]" :show-user-info="true" denied-title="⚠️ Quyền truy cập hạn chế"
                denied-message="Chỉ Admin và Manager mới có thể truy cập khu vực này."
                loading-message="Đang xác thực quyền Admin/Manager...">
                <template #default="{ user, userRole }">
                    <div class="success-content">
                        <h3>✅ Truy cập được cấp phép</h3>
                        <p>Bạn có quyền truy cập với vai trò: <strong>{{ userRole }}</strong></p>
                    </div>
                </template>
            </PermissionGuard>
        </div>

        <!-- Test case 3: Consultant only -->
        <div class="demo-section">
            <h2>Test 3: Chỉ Consultant được phép</h2>
            <PermissionGuard :allowed-roles="[5]" :show-user-info="false" :auto-redirect="false"
                denied-title="🎯 Khu vực Consultant"
                denied-message="Tính năng này chỉ dành riêng cho nhân viên Consultant."
                back-button-text="Về trang chính">
                <template #default="{ user, userRole }">
                    <div class="success-content consultant-area">
                        <h3>🎯 Chào Consultant!</h3>
                        <p>Đây là khu vực làm việc dành riêng cho Consultant</p>
                    </div>
                </template>
            </PermissionGuard>
        </div>
    </div>
</template>

<script setup>
// Import PermissionGuard component
import PermissionGuard from '~/components/admin/PermissionGuard.vue'

definePageMeta({
    layout: "admin",
    middleware: ["auth"], // Chỉ dùng auth, không dùng permission middleware
    ssr: false
});
</script>

<style scoped>
.demo-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.demo-header {
    text-align: center;
    margin-bottom: 3rem;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 15px;
}

.demo-header h1 {
    margin: 0 0 1rem 0;
    font-size: 2.5rem;
}

.demo-header p {
    margin: 0;
    opacity: 0.9;
    font-size: 1.1rem;
}

.demo-section {
    margin-bottom: 3rem;
    border: 2px solid #eee;
    border-radius: 15px;
    overflow: hidden;
}

.demo-section h2 {
    margin: 0;
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    color: #333;
    border-bottom: 2px solid #eee;
    font-size: 1.3rem;
}

.demo-section> :global(.permission-guard) {
    padding: 2rem;
}

.success-content {
    background: #d4edda;
    border: 2px solid #c3e6cb;
    border-radius: 10px;
    padding: 2rem;
    text-align: center;
}

.success-content h3 {
    color: #155724;
    margin: 0 0 1rem 0;
}

.success-content p {
    color: #155724;
    margin: 0.5rem 0;
}

.consultant-area {
    background: #fff3cd;
    border-color: #ffeaa7;
}

.consultant-area h3,
.consultant-area p {
    color: #856404;
}

/* Responsive */
@media (max-width: 768px) {
    .demo-page {
        padding: 1rem;
    }

    .demo-header {
        padding: 1.5rem;
    }

    .demo-header h1 {
        font-size: 2rem;
    }

    .demo-section h2 {
        padding: 1rem 1.5rem;
        font-size: 1.1rem;
    }

    .demo-section> :global(.permission-guard) {
        padding: 1.5rem;
    }
}
</style>