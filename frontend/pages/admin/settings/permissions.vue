<template>
    <div class="permissions-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Dang kiem tra quyen truy cap...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Khong the truy cap quan tri phan quyen</h3>
                <p>Chi Superadmin va Admin moi co quyen cau hinh phan quyen he thong.</p>
                <NuxtLink to="/admin" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Quay lai Dashboard
                </NuxtLink>
            </div>
        </div>

        <div v-else>
            <div class="page-header">
                <div class="header-content">
                    <h1>
                        <i class="fas fa-user-lock"></i>
                        Quan tri phan quyen
                    </h1>
                    <p>Dieu chinh quyen truy cap theo vai tro cho tung module trong trang admin.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="loadingConfig || savingConfig" @click="refreshConfig">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingConfig }"></i>
                        Lam moi
                    </button>
                    <button class="btn btn-outline" :disabled="!isDirty || loadingConfig || savingConfig" @click="resetDraft">
                        <i class="fas fa-undo"></i>
                        Hoan tac
                    </button>
                    <button class="btn btn-primary" :disabled="!isDirty || loadingConfig || savingConfig" @click="saveConfig">
                        <i class="fas" :class="savingConfig ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                        {{ savingConfig ? 'Dang luu...' : 'Luu cau hinh' }}
                    </button>
                </div>
            </div>

            <div class="role-legend">
                <span class="legend-title">Vai tro:</span>
                <span v-for="role in roleDefinitions" :key="role.id" class="legend-item">
                    <strong>R{{ role.id }}</strong> - {{ role.name }}
                </span>
            </div>

            <div v-if="permissionsError" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>{{ permissionsError }}</p>
            </div>

            <div class="matrix-card">
                <div class="matrix-header">
                    <div class="col-module">Module</div>
                    <div class="col-role" v-for="role in roleDefinitions" :key="`header-${role.id}`">
                        R{{ role.id }}
                    </div>
                </div>

                <div v-if="loadingConfig" class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Dang tai cau hinh phan quyen...</p>
                </div>

                <div v-else>
                    <div v-for="module in draftModules" :key="module.key" class="matrix-row">
                        <div class="col-module">
                            <div class="module-title">{{ module.label }}</div>
                            <div class="module-meta">{{ module.routePrefix }}</div>
                            <div class="module-description">{{ module.description }}</div>
                        </div>

                        <div class="col-role" v-for="role in roleDefinitions" :key="`${module.key}-${role.id}`">
                            <label class="switch" :class="{ disabled: role.id === 1 }">
                                <input
                                    type="checkbox"
                                    :checked="hasRole(module, role.id)"
                                    :disabled="role.id === 1 || savingConfig"
                                    @change="toggleRole(module.key, role.id)"
                                >
                                <span></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tips-card">
                <h3>Luu y van hanh</h3>
                <ul>
                    <li>Superadmin (R1) luon co quyen tat ca module de tranh khoa he thong.</li>
                    <li>Sau khi luu, middleware va menu admin se ap dung cau hinh moi ngay lap tuc.</li>
                    <li>Neu bo quyen mot role, nguoi dung role do se khong vao duoc route tuong ung.</li>
                </ul>
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'

const {
    roleDefinitions,
    modules,
    loading,
    saving,
    error,
    fetchPermissionsConfig,
    updatePermissionsConfig
} = usePermissionsConfig()

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError } = useNotifications()

const draftModules = ref([])

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Quan tri phan quyen - Admin'
})

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2]))
const loadingConfig = computed(() => loading.value)
const savingConfig = computed(() => saving.value)
const permissionsError = computed(() => error.value)

const normalizeModulesForCompare = (list = []) => {
    return (list || []).map((item) => ({
        key: item.key,
        allowedRoles: [...new Set((item.allowedRoles || []).map((value) => Number(value)))].sort((a, b) => a - b)
    }))
}

const isDirty = computed(() => {
    const source = JSON.stringify(normalizeModulesForCompare(modules.value))
    const draft = JSON.stringify(normalizeModulesForCompare(draftModules.value))
    return source !== draft
})

const applyDraftFromSource = () => {
    draftModules.value = modules.value.map((module) => ({
        ...module,
        allowedRoles: [...module.allowedRoles].sort((a, b) => a - b)
    }))
}

const hasRole = (module, roleId) => {
    return (module.allowedRoles || []).includes(Number(roleId))
}

const toggleRole = (moduleKey, roleId) => {
    const normalizedRoleId = Number(roleId)
    if (normalizedRoleId === 1) return

    draftModules.value = draftModules.value.map((module) => {
        if (module.key !== moduleKey) return module

        const current = new Set(module.allowedRoles || [])
        if (current.has(normalizedRoleId)) {
            current.delete(normalizedRoleId)
        } else {
            current.add(normalizedRoleId)
        }

        current.add(1)

        return {
            ...module,
            allowedRoles: [...current].sort((a, b) => a - b)
        }
    })
}

const refreshConfig = async () => {
    await fetchPermissionsConfig(true)
    applyDraftFromSource()
}

const resetDraft = () => {
    applyDraftFromSource()
}

const saveConfig = async () => {
    const result = await updatePermissionsConfig(draftModules.value)

    if (!result.success) {
        showError(result.message || 'Khong the luu cau hinh phan quyen')
        return
    }

    showSuccess(result.message || 'Luu cau hinh phan quyen thanh cong')
    applyDraftFromSource()
}

onMounted(async () => {
    await fetchCurrentUser()
    await fetchPermissionsConfig()
    applyDraftFromSource()
})
</script>

<style scoped>
.permissions-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.header-content h1 {
    margin: 0;
    font-size: 1.6rem;
}

.header-content p {
    margin: 6px 0 0;
    color: #6b7280;
}

.header-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn {
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 8px 14px;
    font-weight: 600;
    cursor: pointer;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: #0f4c81;
    color: #fff;
}

.btn-secondary {
    background: #f3f4f6;
    color: #111827;
    border-color: #d1d5db;
}

.btn-outline {
    background: #fff;
    color: #374151;
    border-color: #d1d5db;
}

.role-legend {
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.legend-title {
    font-weight: 700;
}

.legend-item {
    font-size: 0.92rem;
    color: #374151;
}

.matrix-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    overflow: hidden;
}

.matrix-header,
.matrix-row {
    display: grid;
    grid-template-columns: minmax(230px, 1fr) repeat(5, 80px);
    gap: 8px;
    align-items: center;
    padding: 12px;
}

.matrix-header {
    background: #f3f4f6;
    font-weight: 700;
}

.matrix-row {
    border-top: 1px solid #f1f5f9;
}

.col-role {
    display: flex;
    justify-content: center;
}

.module-title {
    font-weight: 700;
    color: #111827;
}

.module-meta {
    margin-top: 2px;
    font-size: 0.8rem;
    color: #6366f1;
}

.module-description {
    margin-top: 4px;
    font-size: 0.85rem;
    color: #6b7280;
}

.switch {
    width: 48px;
    height: 26px;
    background: #d1d5db;
    border-radius: 999px;
    position: relative;
    display: inline-block;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.switch span {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    transition: background 0.2s ease;
}

.switch span::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    left: 3px;
    top: 3px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.18);
}

.switch input:checked + span {
    background: #15803d;
}

.switch input:checked + span::before {
    transform: translateX(22px);
}

.switch.disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.loading-state,
.error-state,
.loading-permission,
.permission-denied {
    text-align: center;
    padding: 18px;
}

.tips-card {
    background: #fefce8;
    border: 1px solid #fde68a;
    border-radius: 12px;
    padding: 14px;
}

.tips-card h3 {
    margin: 0 0 8px;
}

.tips-card ul {
    margin: 0;
    padding-left: 18px;
}

@media (max-width: 960px) {
    .matrix-header,
    .matrix-row {
        grid-template-columns: minmax(170px, 1fr) repeat(5, 58px);
        font-size: 0.88rem;
        padding: 10px;
    }

    .switch {
        width: 42px;
        height: 24px;
    }

    .switch span::before {
        width: 18px;
        height: 18px;
    }

    .switch input:checked + span::before {
        transform: translateX(18px);
    }
}
</style>
