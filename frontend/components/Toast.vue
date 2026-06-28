<template>
    <Teleport to="body">
        <Transition name="toast" appear>
            <div v-if="notification.show" class="toast" :class="notification.type">
                <i :class="notification.icon"></i>
                <span>{{ notification.message }}</span>
                <button @click="hideNotification" class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { useNotifications } from '~/composables/useNotifications'

// Use notification composable
const {
    notification,
    hideNotification
} = useNotifications()
</script>

<style>
/* Global Toast Notification Styles - No scoped để work với Teleport */
.toast {
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    padding: 16px 20px !important;
    border-radius: 8px !important;
    background: white !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    z-index: 999999 !important;
    min-width: 300px !important;
    max-width: 500px !important;
    border-left: 4px solid !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    pointer-events: auto !important;
    transform: translateZ(0) !important;
    /* Đảm bảo visible */
    visibility: visible !important;
    opacity: 1 !important;
}

/* Vue Transition Classes */
.toast-enter-active {
    transition: all 0.3s ease-out !important;
}

.toast-leave-active {
    transition: all 0.3s ease-in !important;
}

.toast-enter-from {
    transform: translateX(100%) !important;
    opacity: 0 !important;
}

.toast-leave-to {
    transform: translateX(100%) !important;
    opacity: 0 !important;
}

/* Toast Type Colors */
.toast.success {
    border-left-color: #10b981 !important;
    background: #f0fdf4 !important;
}

.toast.success i {
    color: #10b981 !important;
}

.toast.error {
    border-left-color: #ef4444 !important;
    background: #fef2f2 !important;
}

.toast.error i {
    color: #ef4444 !important;
}

.toast.warning {
    border-left-color: #f59e0b !important;
    background: #fffbeb !important;
}

.toast.warning i {
    color: #f59e0b !important;
}

.toast.info {
    border-left-color: #3b82f6 !important;
    background: #eff6ff !important;
}

.toast.info i {
    color: #3b82f6 !important;
}

.toast span {
    flex: 1 !important;
    color: #374151 !important;
    line-height: 1.5 !important;
}

.toast-close {
    background: none !important;
    border: none !important;
    cursor: pointer !important;
    padding: 4px !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: background-color 0.2s !important;
    color: #6b7280 !important;
}

.toast-close:hover {
    background: rgba(0, 0, 0, 0.1) !important;
    color: #374151 !important;
}

.toast-close i {
    font-size: 12px !important;
}

/* Responsive Design */
@media (max-width: 640px) {
    .toast {
        top: 10px !important;
        right: 10px !important;
        left: 10px !important;
        min-width: auto !important;
        max-width: none !important;
    }
}
</style>