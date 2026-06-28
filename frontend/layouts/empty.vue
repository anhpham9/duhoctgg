<template>
    <div class="login-container">
        <div class="login-background">
            <div class="background-shapes">
                <div class="shape shape-1"></div>
                <div class="shape shape-2"></div>
                <div class="shape shape-3"></div>
            </div>
        </div>
        
        <slot />
    </div>
</template>
<script setup>

import "~/assets/css/admin/login.css";

// Reset body styles for login layout
onMounted(() => {
    if (process.client) {
        // Save original body styles
        const originalStyles = {
            background: document.body.style.background || '',
            overflow: document.body.style.overflow || '',
            position: document.body.style.position || '',
            display: document.body.style.display || '',
            minHeight: document.body.style.minHeight || ''
        }
        
        // Set login-specific styles
        document.body.style.background = 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 50%, #8e24aa 100%)'
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'relative'
        document.body.style.display = 'block'
        
        // Cleanup on unmount
        onBeforeUnmount(() => {
            // Restore body to default state for next layout
            document.body.style.background = ''
            document.body.style.overflow = ''
            document.body.style.position = ''
            document.body.style.display = ''
            document.body.style.minHeight = ''
        })
    }
})

</script>