# Toast Component Usage Guide

## Giới thiệu

Toast component đã được tách ra từ `users.vue` để sử dụng chung trong toàn bộ ứng dụng. Component này cung cấp thông báo popup với các kiểu khác nhau (success, error, warning, info).

## Cách sử dụng

### 1. Import Toast Component và useNotifications

```vue
<template>
  <div>
    <!-- Nội dung page của bạn -->
    
    <!-- Thêm Toast component vào cuối template -->
    <Toast />
  </div>
</template>

<script setup>
import Toast from '~/components/Toast.vue'
import { useNotifications } from '~/composables/useNotifications'

const {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    hideNotification
} = useNotifications()

// Sử dụng các methods
const handleSuccess = () => {
    showSuccess('Thao tác thành công!')
}

const handleError = () => {
    showError('Có lỗi xảy ra!')
}

const handleWarning = () => {
    showWarning('Cảnh báo: Kiểm tra lại thông tin!')
}

const handleInfo = () => {
    showInfo('Thông tin: Dữ liệu đã được cập nhật!')
}

const handleLoading = () => {
    showLoading('Đang xử lý...')
    
    // Tự động ẩn sau khi xử lý xong
    setTimeout(() => {
        hideNotification()
        showSuccess('Hoàn thành!')
    }, 3000)
}
</script>
```

### 2. Methods của useNotifications

#### showSuccess(message, duration = 5000)
- Hiển thị thông báo thành công (màu xanh)
- Auto hide sau 5 giây

#### showError(message, duration = 8000)  
- Hiển thị thông báo lỗi (màu đỏ)
- Auto hide sau 8 giây

#### showWarning(message, duration = 6000)
- Hiển thị thông báo cảnh báo (màu vàng)
- Auto hide sau 6 giây

#### showInfo(message, duration = 5000)
- Hiển thị thông báo thông tin (màu xanh dương)
- Auto hide sau 5 giây

#### showLoading(message = 'Đang xử lý...')
- Hiển thị thông báo loading (không tự ẩn)
- Cần gọi `hideNotification()` để ẩn

#### hideNotification()
- Ẩn thông báo hiện tại

### 3. Ví dụ thực tế

```vue
<template>
  <div class="my-page">
    <button @click="handleSave">Lưu dữ liệu</button>
    <button @click="handleDelete">Xóa</button>
    
    <!-- Toast component -->
    <Toast />
  </div>
</template>

<script setup>
import Toast from '~/components/Toast.vue'
import { useNotifications } from '~/composables/useNotifications'

const { showSuccess, showError, showLoading, hideNotification } = useNotifications()

const handleSave = async () => {
    showLoading('Đang lưu dữ liệu...')
    
    try {
        await saveData()
        hideNotification()
        showSuccess('Lưu dữ liệu thành công!')
    } catch (error) {
        hideNotification()
        showError('Lưu dữ liệu thất bại: ' + error.message)
    }
}

const handleDelete = async () => {
    try {
        await deleteData()
        showSuccess('Xóa thành công!')
    } catch (error) {
        showError('Không thể xóa: ' + error.message)
    }
}
</script>
```

## Features

✅ **4 kiểu thông báo**: success, error, warning, info  
✅ **Auto-hide**: Tự động ẩn sau thời gian nhất định  
✅ **Manual hide**: Nút X để ẩn thủ công  
✅ **Loading state**: Thông báo không tự ẩn cho loading  
✅ **Responsive**: Tương thích mobile  
✅ **Animation**: Slide in từ phải  
✅ **Global state**: Shared state across components  

## Styling

Toast component đã bao gồm CSS hoàn chỉnh và responsive. Các màu sắc và icons:

- **Success**: Xanh lá (#10b981) với icon check-circle
- **Error**: Đỏ (#ef4444) với icon exclamation-circle  
- **Warning**: Vàng (#f59e0b) với icon exclamation-triangle
- **Info**: Xanh dương (#3b82f6) với icon info-circle

## Best Practices

1. **Chỉ import Toast 1 lần** trong mỗi page (thường ở cuối template)
2. **Sử dụng appropriate duration** cho từng loại message
3. **Handle loading states** properly với showLoading + hideNotification
4. **Translate error messages** từ backend sang tiếng Việt
5. **Keep messages concise** và user-friendly

## Migration từ inline toast

Nếu bạn đang có inline toast code, chỉ cần:

1. Remove inline `<div class="toast">` template
2. Remove toast CSS styles  
3. Add `<Toast />` component
4. Import useNotifications và Toast component
5. Sử dụng các methods như `showSuccess()` thay vì manipulate DOM

Đã hoàn thành migration cho `users.vue` ✅