<template>
    <div class="profile-page">
        <div class="page-header">
            <h1>Hồ sơ cá nhân</h1>
            <p>Cập nhật thông tin tài khoản và đổi mật khẩu</p>
        </div>

        <div v-if="pageLoading || loadingUser" class="state-card loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang tải thông tin tài khoản...</span>
        </div>

        <div v-else-if="!currentUser" class="state-card error-state">
            <i class="fas fa-triangle-exclamation"></i>
            <span>Không thể tải thông tin tài khoản. Vui lòng đăng nhập lại.</span>
        </div>

        <div v-else class="profile-grid">
            <section class="card profile-summary">
                <div class="avatar-wrap">
                    <i class="fas fa-user-circle"></i>
                </div>
                <h2>{{ currentUser.name || currentUser.username || 'Người dùng' }}</h2>
                <p class="role">{{ currentUser.role_name || 'Unknown' }}</p>
                <div class="meta-row">
                    <span>Tài khoản:</span>
                    <strong>@{{ currentUser.username }}</strong>
                </div>
                <div class="meta-row">
                    <span>ID:</span>
                    <strong>#{{ currentUser.id }}</strong>
                </div>
                <div class="meta-row">
                    <span>Vai trò:</span>
                    <strong>{{ currentUser.role_name || 'Unknown' }}</strong>
                </div>
                <div class="meta-row">
                    <span>Lần đăng nhập cuối:</span>
                    <strong>{{ formatSmartDate(currentUser.last_login) }}</strong>
                </div>
            </section>

            <div class="profile-content">
                <div class="tab-nav top-tabs">
                    <button v-for="tab in contentTabs" :key="tab.key" type="button" class="tab-btn"
                        :class="{ active: activeContentTab === tab.key }" @click="activeContentTab = tab.key">
                        {{ tab.label }}
                    </button>
                </div>


                <section v-if="activeContentTab === 'profile'" class="card profile-form-card">
                    <h3>Thông tin cá nhân</h3>
                    <form @submit.prevent="handleSaveProfile">
                        <div class="form-group">
                            <label for="name">Họ và tên</label>
                            <input id="name" v-model="profileForm.name" type="text" maxlength="100" />
                            <small v-if="profileErrors.name" class="field-error">{{ profileErrors.name }}</small>
                        </div>

                        <div class="form-group">
                            <label for="email">Email</label>
                            <input id="email" v-model="profileForm.email" type="email" maxlength="120" />
                            <small v-if="profileErrors.email" class="field-error">{{ profileErrors.email }}</small>
                        </div>

                        <div class="form-group">
                            <label for="phone">Số điện thoại</label>
                            <input id="phone" v-model="profileForm.phone" type="text" maxlength="20" />
                            <small v-if="profileErrors.phone" class="field-error">{{ profileErrors.phone }}</small>
                        </div>

                        <!-- <small v-if="profileErrors._general" class="field-error">{{ profileErrors._general }}</small> -->

                        <div class="actions">
                            <button type="button" class="btn btn-light" @click="resetProfileForm"
                                :disabled="savingProfile">
                                Khôi phục
                            </button>
                            <button type="submit" class="btn btn-primary" :disabled="savingProfile">
                                <i v-if="savingProfile" class="fas fa-spinner fa-spin"></i>
                                {{ savingProfile ? 'Đang lưu...' : 'Lưu thay đổi' }}
                            </button>
                        </div>
                    </form>
                </section>

                <section v-if="activeContentTab === 'password'" class="card password-form-card">
                    <h3>Đổi mật khẩu</h3>
                    <form @submit.prevent="handleChangePassword">
                        <div class="form-group">
                            <label for="currentPassword">Mật khẩu hiện tại</label>
                            <input id="currentPassword" v-model="passwordForm.currentPassword" type="password"
                                autocomplete="current-password" />
                            <small v-if="passwordErrors.currentPassword" class="field-error">{{
                                passwordErrors.currentPassword }}</small>
                        </div>

                        <div class="form-group">
                            <label for="newPassword">Mật khẩu mới</label>
                            <input id="newPassword" v-model="passwordForm.newPassword" type="password"
                                autocomplete="new-password" @input="checkPasswordStrength" />
                            <small v-if="passwordErrors.newPassword" class="field-error">{{ passwordErrors.newPassword
                            }}</small>

                            <div v-if="passwordForm.newPassword" class="password-strength">
                                <h4>Kiểm tra độ bảo mật mật khẩu:</h4>
                                <div class="strength-checks">
                                    <div class="strength-check"
                                        :class="{ 'check-valid': passwordStrength.hasMinLength }">
                                        <i
                                            :class="passwordStrength.hasMinLength ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                                        <span>Ít nhất 8 ký tự</span>
                                    </div>
                                    <div class="strength-check"
                                        :class="{ 'check-valid': passwordStrength.hasLettersAndNumbers }">
                                        <i
                                            :class="passwordStrength.hasLettersAndNumbers ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                                        <span>Gồm chữ và số</span>
                                    </div>
                                    <div class="strength-check"
                                        :class="{ 'check-valid': passwordStrength.hasMixedCase }">
                                        <i
                                            :class="passwordStrength.hasMixedCase ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                                        <span>Gồm chữ in hoa và in thường</span>
                                    </div>
                                </div>
                                <div class="strength-indicator">
                                    <div class="strength-bar">
                                        <div class="strength-progress"
                                            :class="getPasswordStrengthClass(passwordStrength)"
                                            :style="{ width: getPasswordStrengthPercentage(passwordStrength) + '%' }">
                                        </div>
                                    </div>
                                    <span class="strength-text">{{ getPasswordStrengthText(passwordStrength) }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="confirmPassword">Xác nhận mật khẩu mới</label>
                            <input id="confirmPassword" v-model="passwordForm.confirmPassword" type="password"
                                autocomplete="new-password" />
                            <small v-if="passwordErrors.confirmPassword" class="field-error">{{
                                passwordErrors.confirmPassword }}</small>
                        </div>

                        <!-- <small v-if="passwordErrors._general" class="field-error">{{ passwordErrors._general }}</small> -->

                        <div class="actions">
                            <button type="button" class="btn btn-light" @click="resetPasswordForm"
                                :disabled="changingPassword">
                                Xóa nội dung
                            </button>
                            <button type="submit" class="btn btn-primary" :disabled="changingPassword">
                                <i v-if="changingPassword" class="fas fa-spinner fa-spin"></i>
                                {{ changingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu' }}
                            </button>
                        </div>
                    </form>
                </section>

            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { formatSmartDate, formatDate } from '~/utils/date'

definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});

const activeContentTab = ref('profile')

const contentTabs = [
    { key: 'profile', label: 'Thông tin cá nhân' },
    { key: 'password', label: 'Đổi mật khẩu' }
]

const config = useRuntimeConfig()
const { showSuccess, showError } = useToast()
const {
    validateRequired,
    validateEmail,
    validateVietnamesePhone,
    validatePasswordStrength,
    validatePasswordConfirmation,
    parseBackendValidationError,
    createPasswordStrength,
    getPasswordStrengthPercentage,
    getPasswordStrengthText,
    getPasswordStrengthClass
} = useValidation()

const {
    currentUser,
    loadingUser,
    fetchCurrentUser
} = useCurrentUser()

const pageLoading = ref(true)
const savingProfile = ref(false)
const changingPassword = ref(false)

const profileForm = ref({
    name: '',
    email: '',
    phone: ''
})

const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const profileErrors = ref({})
const passwordErrors = ref({})
const passwordStrength = createPasswordStrength()

const syncProfileFormFromCurrentUser = () => {
    if (!currentUser.value) return

    profileForm.value = {
        name: currentUser.value.name || '',
        email: currentUser.value.email || '',
        phone: currentUser.value.phone || ''
    }
}

watch(
    () => currentUser.value,
    () => {
        if (!savingProfile.value) {
            syncProfileFormFromCurrentUser()
        }
    },
    { immediate: true }
)

const resetProfileForm = () => {
    profileErrors.value = {}
    syncProfileFormFromCurrentUser()
}

const resetPasswordForm = () => {
    passwordErrors.value = {}
    passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    }

    passwordStrength.hasMinLength = false
    passwordStrength.hasLettersAndNumbers = false
    passwordStrength.hasMixedCase = false
}

const validateProfileForm = () => {
    const errors = {}

    const requiredName = validateRequired(profileForm.value.name, 'Họ và tên')
    if (!requiredName.isValid) {
        errors.name = requiredName.message
    }

    const emailCheck = validateEmail(profileForm.value.email)
    if (!emailCheck.isValid) {
        errors.email = emailCheck.message
    }

    const phoneCheck = validateVietnamesePhone(profileForm.value.phone)
    if (!phoneCheck.isValid) {
        errors.phone = phoneCheck.message
    }

    profileErrors.value = errors
    return Object.keys(errors).length === 0
}

const handleSaveProfile = async () => {
    if (!currentUser.value) {
        showError('Không tìm thấy tài khoản hiện tại')
        return
    }

    if (!validateProfileForm()) {
        return
    }

    savingProfile.value = true

    try {
        const response = await fetch(`${config.public.apiBase}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                name: profileForm.value.name,
                email: profileForm.value.email,
                phone: profileForm.value.phone
            })
        })

        const data = await response.json()

        if (!response.ok || !data?.success) {
            const parsedErrors = parseBackendValidationError(data?.message || data || 'Cập nhật hồ sơ thất bại')
            profileErrors.value = parsedErrors
            showError(parsedErrors._general || data?.message || 'Cập nhật hồ sơ thất bại')
            return
        }

        await fetchCurrentUser(true)
        syncProfileFormFromCurrentUser()
        showSuccess(data?.message || 'Cập nhật hồ sơ thành công')
    } catch (error) {
        showError(error?.message || 'Không thể kết nối máy chủ')
    } finally {
        savingProfile.value = false
    }
}

const validatePasswordForm = () => {
    const errors = {}

    const currentPasswordRequired = validateRequired(passwordForm.value.currentPassword, 'Mật khẩu hiện tại')
    if (!currentPasswordRequired.isValid) {
        errors.currentPassword = currentPasswordRequired.message
    }

    const passwordValidation = validatePasswordStrength(passwordForm.value.newPassword, passwordStrength)
    if (!passwordValidation.isValid) {
        errors.newPassword = passwordValidation.message
    }

    const confirmCheck = validatePasswordConfirmation(passwordForm.value.newPassword, passwordForm.value.confirmPassword)
    if (!confirmCheck.isValid) {
        errors.confirmPassword = confirmCheck.message
    }

    if (passwordForm.value.currentPassword && passwordForm.value.newPassword && passwordForm.value.currentPassword === passwordForm.value.newPassword) {
        errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại'
    }

    passwordErrors.value = errors
    return Object.keys(errors).length === 0
}

const checkPasswordStrength = () => {
    const passwordValidation = validatePasswordStrength(passwordForm.value.newPassword, passwordStrength)

    if (passwordValidation.isValid) {
        passwordErrors.value.newPassword = ''
    }

    if (passwordForm.value.confirmPassword) {
        const confirmValidation = validatePasswordConfirmation(passwordForm.value.newPassword, passwordForm.value.confirmPassword)
        passwordErrors.value.confirmPassword = confirmValidation.isValid ? '' : confirmValidation.message
    }
}

const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
        return
    }

    changingPassword.value = true

    try {
        const response = await fetch(`${config.public.apiBase}/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                currentPassword: passwordForm.value.currentPassword,
                newPassword: passwordForm.value.newPassword
            })
        })

        const data = await response.json()

        if (!response.ok || !data?.success) {
            const parsedErrors = parseBackendValidationError(data?.message || data || 'Đổi mật khẩu thất bại')
            passwordErrors.value = parsedErrors
            showError(parsedErrors._general || data?.message || 'Đổi mật khẩu thất bại')
            return
        }

        resetPasswordForm()
        showSuccess(data?.message || 'Đổi mật khẩu thành công')
    } catch (error) {
        showError(error?.message || 'Không thể kết nối máy chủ')
    } finally {
        changingPassword.value = false
    }
}

onMounted(async () => {
    try {
        await fetchCurrentUser(true)
        syncProfileFormFromCurrentUser()
    } finally {
        pageLoading.value = false
    }
})
</script>

<style scoped>
.profile-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.page-header h1 {
    margin: 0;
    font-size: 28px;
    color: #1f2937;
}

.page-header p {
    margin: 8px 0 0;
    color: #6b7280;
}

.state-card {
    border-radius: 12px;
    padding: 18px;
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: 15px;
}

.loading-state {
    background: #eff6ff;
    color: #1e40af;
}

.error-state {
    background: #fef2f2;
    color: #b91c1c;
}

.profile-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 20px;
}

.card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.04);
}

.tab-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.top-tabs {
    margin-bottom: 1.25rem;
}

.tab-btn {
    border: 1px solid #cdd8ea;
    background: #f7faff;
    color: #214165;
    padding: 0.5rem 0.85rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}

.tab-btn.active {
    background: #1976d2;
    border-color: #1976d2;
    color: #fff;
}

.tab-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.profile-summary {
    text-align: center;
}

.avatar-wrap i {
    font-size: 72px;
    color: #2563eb;
}

.profile-summary h2 {
    margin: 14px 0 4px;
    font-size: 20px;
    color: #111827;
}

.profile-summary .role {
    margin: 0 0 18px;
    color: #4b5563;
}

.meta-row {
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #f3f4f6;
    padding: 10px 0;
    font-size: 14px;
}

.meta-row span {
    color: #6b7280;
}

.profile-form-card h3,
.password-form-card h3 {
    margin: 0 0 14px;
    color: #111827;
}

.form-group {
    margin-bottom: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-size: 14px;
    color: #374151;
    font-weight: 600;
}

.form-group input {
    border: 1px solid #d1d5db;
    border-radius: 10px;
    height: 42px;
    padding: 0 12px;
    font-size: 14px;
}

.form-group input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.field-error {
    color: #b91c1c;
    font-size: 13px;
}

.actions {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.btn {
    border: 0;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 14px;
    cursor: pointer;
    display: inline-flex;
    gap: 8px;
    align-items: center;
}

.btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.btn-primary {
    background: #2563eb;
    color: #ffffff;
}

.btn-light {
    background: #f3f4f6;
    color: #1f2937;
}

.password-strength {
    margin-top: 0.75rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.password-strength h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.9rem;
    color: #495057;
    font-weight: 600;
}

.strength-checks {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.strength-check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #6c757d;
    transition: all 0.2s ease;
}

.strength-check.check-valid {
    color: #28a745;
}

.strength-check i {
    width: 16px;
    font-size: 0.9rem;
}

.strength-check.check-valid i {
    color: #28a745;
}

.strength-check:not(.check-valid) i {
    color: #dc3545;
}

.strength-indicator {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.strength-bar {
    width: 100%;
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
}

.strength-progress {
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 4px;
}

.strength-progress.strength-weak {
    background: #dc3545;
}

.strength-progress.strength-medium {
    background: #ffc107;
}

.strength-progress.strength-strong {
    background: #28a745;
}

.strength-text {
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
}

@media (max-width: 1200px) {
    .profile-grid {
        grid-template-columns: 1fr 1fr;
    }

    .profile-summary {
        grid-column: 1 / -1;
    }
}

@media (max-width: 768px) {
    .profile-grid {
        grid-template-columns: 1fr;
    }
}
</style>