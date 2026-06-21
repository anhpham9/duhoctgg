<template>
    <div class="school-view-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Dang kiem tra quyen truy cap...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Khong the truy cap Chi tiet truong hoc</h3>
                <p>Chi Superadmin, Admin va Manager moi co the xem chi tiet truong hoc.</p>
                <NuxtLink to="/admin/schools" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Quay lai danh sach
                </NuxtLink>
            </div>
        </div>

        <div v-else class="content-wrapper">
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-school"></i> Chi tiet truong hoc</h1>
                    <p v-if="school.id">ID: #{{ school.id }} - {{ school.name }}</p>
                </div>
                <div class="header-actions">
                    <NuxtLink :to="`/admin/schools/edit/${schoolId}`" class="btn btn-primary">
                        <i class="fas fa-edit"></i>
                        Chinh sua
                    </NuxtLink>
                    <NuxtLink to="/admin/schools" class="btn btn-secondary">
                        <i class="fas fa-arrow-left"></i>
                        Quay lai
                    </NuxtLink>
                </div>
            </div>

            <div v-if="loading" class="loading-box">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Dang tai chi tiet truong hoc...</p>
            </div>

            <div v-else-if="error" class="error-box">
                <i class="fas fa-exclamation-triangle"></i>
                <p>{{ error }}</p>
                <button class="btn btn-primary" @click="fetchSchoolDetail">Thu lai</button>
            </div>

            <div v-else class="school-detail">
                <div class="tab-nav top-tabs">
                    <button
                        v-for="tab in viewTabs"
                        :key="tab.key"
                        type="button"
                        class="tab-btn"
                        :class="{ active: activeContentTab === tab.key }"
                        @click="activeContentTab = tab.key"
                    >
                        {{ tab.label }}
                    </button>
                </div>

                <div v-if="activeContentTab === 'main'" class="tab-content view-tab-content">
                    <div class="meta-grid">
                        <div class="meta-item"><span class="label">Ten truong:</span><span class="value">{{ school.name || '-' }}</span></div>
                        <div class="meta-item"><span class="label">Slug:</span><span class="value">{{ school.slug || '-' }}</span></div>
                        <div class="meta-item"><span class="label">Khu vuc:</span><span class="value">{{ school.region_name || '-' }}</span></div>
                        <div class="meta-item"><span class="label">Loai truong:</span><span class="value">{{ school.type_name || '-' }}</span></div>
                        <div class="meta-item"><span class="label">Dia diem:</span><span class="value">{{ school.location || '-' }}</span></div>
                        <div class="meta-item"><span class="label">Trang thai:</span><span class="value"><span class="badge" :class="getStatusClass(school.status)">{{ getStatusText(school.status) }}</span></span></div>
                        <div class="meta-item"><span class="label">Hoc phi/nam:</span><span class="value">{{ formatCurrency(school.tuition_per_year) }}</span></div>
                        <div class="meta-item"><span class="label">Si so lop:</span><span class="value">{{ school.class_size || '-' }}</span></div>
                        <div class="meta-item"><span class="label">Ti le visa:</span><span class="value">{{ school.visa_success_rate !== null && school.visa_success_rate !== undefined ? school.visa_success_rate + '%' : '-' }}</span></div>
                        <div class="meta-item"><span class="label">Rating:</span><span class="value">{{ Number(school.rating || 0).toFixed(1) }}</span></div>
                        <div class="meta-item"><span class="label">So review:</span><span class="value">{{ Number(school.review_count || 0) }}</span></div>
                        <div class="meta-item"><span class="label">Ngay tao:</span><span class="value">{{ formatDate(school.created_at) }}</span></div>
                        <div class="meta-item"><span class="label">Cap nhat:</span><span class="value">{{ formatDate(school.updated_at) }}</span></div>
                        <div class="meta-item full"><span class="label">Logo URL:</span><span class="value">{{ school.logo_url || '-' }}</span></div>
                        <div class="meta-item full"><span class="label">Thumbnail URL:</span><span class="value">{{ school.thumbnail_url || '-' }}</span></div>
                    </div>

                    <div class="media-preview-grid">
                        <div class="media-preview-card">
                            <p class="media-preview-title">Logo</p>
                            <div class="media-preview-surface logo-surface">
                                <img v-if="school.logo_url" :src="school.logo_url" alt="School logo" class="media-preview-image media-preview-logo">
                                <p v-else class="media-preview-empty">Chua co anh logo</p>
                            </div>
                        </div>
                        <div class="media-preview-card">
                            <p class="media-preview-title">Thumbnail</p>
                            <div class="media-preview-surface thumbnail-surface">
                                <img v-if="school.thumbnail_url" :src="school.thumbnail_url" alt="School thumbnail" class="media-preview-image media-preview-thumbnail">
                                <p v-else class="media-preview-empty">Chua co anh thumbnail</p>
                            </div>
                        </div>
                    </div>

                    <div class="content-block">
                        <h3>Features / Tag diem manh</h3>
                        <div v-if="featureTags.length" class="feature-tags">
                            <span v-for="tag in featureTags" :key="tag" class="feature-tag">{{ tag }}</span>
                        </div>
                        <div v-else class="feature-empty-state">
                            Chua co feature nao.
                        </div>
                    </div>
                </div>

                <div v-if="activeContentTab === 'intro'" class="tab-content view-tab-content">
                    <h3>Gioi thieu truong</h3>
                    <div class="detail-subgrid">
                        <div class="detail-subitem">
                            <h4>Gioi thieu ngan gon</h4>
                            <p>{{ detailContent.intro.shortIntro || '-' }}</p>
                        </div>
                        <div class="detail-subitem">
                            <h4>Lich su thanh lap</h4>
                            <p>{{ detailContent.intro.foundingHistory || '-' }}</p>
                        </div>
                        <div class="detail-subitem">
                            <h4>Ly niem nha truong</h4>
                            <p>{{ detailContent.intro.schoolPhilosophy || '-' }}</p>
                        </div>
                    </div>
                </div>

                <div v-if="activeContentTab === 'program'" class="tab-content view-tab-content">
                    <h3>Chuong trinh hoc</h3>
                    <div class="detail-overview">
                        <h4>{{ detailContent.program.heroTitle || '-' }}</h4>
                        <p>{{ detailContent.program.heroDescription || '-' }}</p>
                    </div>
                    <div v-if="detailContent.program.cards.length" class="detail-card-list">
                        <article v-for="(card, index) in detailContent.program.cards" :key="`program-card-${index}`" class="detail-card">
                            <header>
                                <span class="icon-chip">{{ card.icon || 'fas fa-graduation-cap' }}</span>
                                <h5>{{ card.courseName || '-' }}</h5>
                            </header>
                            <p>{{ card.courseDescription || '-' }}</p>
                            <div class="detail-card-meta">
                                <span>Thoi gian: {{ card.durationText || '-' }}</span>
                                <span>Hoc phi: {{ card.priceText || '-' }}</span>
                                <span>Muc tieu: {{ card.targetText || '-' }}</span>
                            </div>
                        </article>
                    </div>
                    <div v-else class="feature-empty-state">Chua co noi dung chuong trinh hoc.</div>
                </div>

                <div v-if="activeContentTab === 'admission'" class="tab-content view-tab-content">
                    <h3>Dieu kien tuyen sinh</h3>
                    <div class="detail-overview">
                        <h4>{{ detailContent.admission.heroTitle || '-' }}</h4>
                        <p>{{ detailContent.admission.heroDescription || '-' }}</p>
                    </div>
                    <div v-if="detailContent.admission.cards.length" class="detail-card-list">
                        <article v-for="(card, index) in detailContent.admission.cards" :key="`admission-card-${index}`" class="detail-card">
                            <header>
                                <span class="icon-chip">{{ card.icon || 'fas fa-file-signature' }}</span>
                                <h5>{{ card.criterionName || '-' }}</h5>
                            </header>
                            <ul v-if="card.items && card.items.length" class="detail-list">
                                <li v-for="(item, itemIndex) in card.items" :key="`admission-item-${index}-${itemIndex}`">{{ item.itemText || '-' }}</li>
                            </ul>
                            <p v-else>-</p>
                        </article>
                    </div>
                    <div v-else class="feature-empty-state">Chua co noi dung dieu kien tuyen sinh.</div>
                </div>

                <div v-if="activeContentTab === 'facility'" class="tab-content view-tab-content">
                    <h3>Co so vat chat va dich vu</h3>
                    <div class="detail-overview">
                        <h4>{{ detailContent.facility.heroTitle || '-' }}</h4>
                        <p>{{ detailContent.facility.heroDescription || '-' }}</p>
                    </div>
                    <div v-if="detailContent.facility.cards.length" class="detail-card-list">
                        <article v-for="(card, index) in detailContent.facility.cards" :key="`facility-card-${index}`" class="detail-card">
                            <header>
                                <span class="icon-chip">{{ card.icon || 'fas fa-building' }}</span>
                                <h5>{{ card.serviceName || '-' }}</h5>
                            </header>
                            <p>{{ card.contentDetail || '-' }}</p>
                        </article>
                    </div>
                    <div v-else class="feature-empty-state">Chua co noi dung co so vat chat va dich vu.</div>
                </div>
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { formatDate as formatSystemDate } from '~/utils/date'

const route = useRoute()
const schoolId = route.params.id

definePageMeta({ layout: 'admin', middleware: ['auth', 'permission'], ssr: false })
useHead({ title: 'Chi tiet truong hoc - Admin' })

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const school = ref({})
const loading = ref(true)
const error = ref('')
const activeContentTab = ref('main')
const viewTabs = [
    { key: 'main', label: 'Thong tin chinh' },
    { key: 'intro', label: 'Gioi thieu truong' },
    { key: 'program', label: 'Chuong trinh hoc' },
    { key: 'admission', label: 'Dieu kien tuyen sinh' },
    { key: 'facility', label: 'Co so vat chat & dich vu' }
]
const detailContent = ref({
    intro: {
        shortIntro: '',
        foundingHistory: '',
        schoolPhilosophy: ''
    },
    program: {
        heroTitle: '',
        heroDescription: '',
        cards: []
    },
    admission: {
        heroTitle: '',
        heroDescription: '',
        cards: []
    },
    facility: {
        heroTitle: '',
        heroDescription: '',
        cards: []
    }
})

const fetchSchoolDetail = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await fetch(`${API_BASE}/schools/${schoolId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)
        school.value = data.data || {}
    } catch (err) {
        error.value = err.message || 'Khong the tai chi tiet truong hoc'
    } finally {
        loading.value = false
    }
}

const normalizeDetailContent = (payload = {}) => {
    const intro = payload?.intro || {}
    const program = payload?.program || {}
    const admission = payload?.admission || {}
    const facility = payload?.facility || {}

    detailContent.value = {
        intro: {
            shortIntro: String(intro.shortIntro || ''),
            foundingHistory: String(intro.foundingHistory || ''),
            schoolPhilosophy: String(intro.schoolPhilosophy || '')
        },
        program: {
            heroTitle: String(program.heroTitle || ''),
            heroDescription: String(program.heroDescription || ''),
            cards: Array.isArray(program.cards)
                ? program.cards.map((card) => ({
                    icon: String(card?.icon || ''),
                    courseName: String(card?.courseName || ''),
                    courseDescription: String(card?.courseDescription || ''),
                    durationText: String(card?.durationText || ''),
                    priceText: String(card?.priceText || ''),
                    targetText: String(card?.targetText || '')
                }))
                : []
        },
        admission: {
            heroTitle: String(admission.heroTitle || ''),
            heroDescription: String(admission.heroDescription || ''),
            cards: Array.isArray(admission.cards)
                ? admission.cards.map((card) => ({
                    icon: String(card?.icon || ''),
                    criterionName: String(card?.criterionName || ''),
                    items: Array.isArray(card?.items)
                        ? card.items.map((item) => ({ itemText: String(item?.itemText || '') }))
                        : []
                }))
                : []
        },
        facility: {
            heroTitle: String(facility.heroTitle || ''),
            heroDescription: String(facility.heroDescription || ''),
            cards: Array.isArray(facility.cards)
                ? facility.cards.map((card) => ({
                    icon: String(card?.icon || ''),
                    serviceName: String(card?.serviceName || ''),
                    contentDetail: String(card?.contentDetail || '')
                }))
                : []
        }
    }
}

const fetchSchoolDetailContent = async () => {
    try {
        const response = await fetch(`${API_BASE}/schools/${schoolId}/detail-content`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)
        normalizeDetailContent(data?.data || {})
    } catch {
        normalizeDetailContent({})
    }
}

const formatDate = (date) => {
    if (!date) return '-'
    return formatSystemDate(date)
}

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '-'
    return Number(value).toLocaleString('vi-VN') + ' VND'
}

const normalizeFeatureTags = (features) => {
    const rawItems = Array.isArray(features)
        ? features
        : features && typeof features === 'object'
            ? Object.entries(features).every(([key]) => /^\d+$/.test(key))
                ? Object.values(features)
                : Object.keys(features)
            : typeof features === 'string'
                ? features.split(/[,\n;]/)
                : []

    const normalized = []
    const seen = new Set()

    for (const item of rawItems) {
        const value = String(item || '').trim()
        if (!value) continue

        const key = value.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        normalized.push(value)
    }

    return normalized
}

const featureTags = computed(() => normalizeFeatureTags(school.value.features))

const getStatusClass = (status) => {
    const classes = {
        partner: 'badge-primary',
        active: 'badge-success',
        paused: 'badge-warning',
        pending: 'badge-secondary'
    }
    return classes[status] || 'badge-secondary'
}

const getStatusText = (status) => {
    const texts = {
        partner: 'Doi tac',
        active: 'Hoat dong',
        paused: 'Tam dung',
        pending: 'Cho duyet'
    }
    return texts[status] || status || '-'
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await Promise.all([fetchSchoolDetail(), fetchSchoolDetailContent()])
    }
})
</script>

<style scoped>
.school-view-page { padding: 0; min-height: 100vh; }
.content-wrapper { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #eee; }
.page-header h1 { margin: 0 0 0.5rem 0; color: #333; display: flex; align-items: center; gap: 10px; }
.page-header p { margin: 0; color: #666; }
.header-actions { display: flex; gap: 0.75rem; }
.loading-box, .error-box { text-align: center; padding: 2rem; color: #666; }
.loading-box i { font-size: 2rem; color: #2196f3; margin-bottom: 1rem; }
.error-box i { font-size: 2rem; color: #f44336; margin-bottom: 1rem; }
.school-detail { margin-top: 1rem; }

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

.tab-content {
    border: 1px solid #e1e9f5;
    border-radius: 10px;
    padding: 1rem;
    background: #fbfdff;
}

.view-tab-content h3 {
    margin-top: 0;
}

.meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem 1rem; margin-bottom: 1.5rem; }
.meta-item { display: flex; gap: 0.5rem; align-items: flex-start; }
.meta-item.full { grid-column: 1 / -1; }
.label { min-width: 130px; color: #666; font-weight: 600; }
.value { color: #222; word-break: break-word; }
.media-preview-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.9rem; margin-bottom: 1.1rem; }
.media-preview-card { border: 1px solid #dbe6f5; border-radius: 10px; background: #fff; padding: 0.8rem; }
.media-preview-title { margin: 0 0 0.55rem; color: #1b4b7b; font-weight: 600; }
.media-preview-surface { border: 1px dashed #bfd3ed; border-radius: 8px; padding: 0.75rem; background: #f8fbff; display: flex; align-items: center; justify-content: center; }
.logo-surface { min-height: 120px; }
.thumbnail-surface { min-height: 120px; }
.media-preview-image { max-width: 100%; max-height: 140px; object-fit: contain; }
.media-preview-empty { margin: 0; color: #64748b; font-size: 0.9rem; }
.content-block { border-top: 1px solid #eee; padding-top: 1rem; }
.content-block h3 { margin: 0 0 0.75rem 0; color: #333; }
.detail-subgrid { display: grid; gap: 0.75rem; }
.detail-subitem { border: 1px solid #dbe6f5; border-radius: 10px; padding: 0.85rem; background: #fff; }
.detail-subitem h4 { margin: 0 0 0.45rem; color: #17406f; font-size: 0.95rem; }
.detail-subitem p { margin: 0; color: #334155; white-space: pre-line; }
.detail-overview { margin-bottom: 0.85rem; }
.detail-overview h4 { margin: 0 0 0.35rem; color: #17406f; }
.detail-overview p { margin: 0; color: #334155; }
.detail-card-list { display: grid; gap: 0.75rem; }
.detail-card { border: 1px solid #dbe6f5; border-radius: 10px; background: #fff; padding: 0.9rem; }
.detail-card header { display: flex; gap: 0.6rem; align-items: center; margin-bottom: 0.45rem; }
.detail-card h5 { margin: 0; color: #0f355f; }
.icon-chip { display: inline-flex; align-items: center; justify-content: center; min-width: 130px; padding: 0.2rem 0.5rem; border-radius: 999px; background: #ecf3ff; color: #1c4b82; font-size: 0.75rem; }
.detail-card p { margin: 0; color: #334155; white-space: pre-line; }
.detail-card-meta { margin-top: 0.45rem; display: grid; gap: 0.25rem; color: #475569; font-size: 0.9rem; }
.detail-list { margin: 0; padding-left: 1.1rem; color: #334155; display: grid; gap: 0.2rem; }
.feature-tags { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.feature-tag { display: inline-flex; align-items: center; padding: 0.5rem 0.85rem; border-radius: 999px; background: #e0f2fe; color: #075985; font-weight: 600; font-size: 0.92rem; }
.feature-empty-state { padding: 0.85rem 1rem; border: 1px dashed #cbd5e1; border-radius: 10px; background: #f8fafc; color: #64748b; font-size: 0.92rem; }
.badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; }
.badge-primary { background: #dbeafe; color: #1d4ed8; }
.badge-success { background: #d4edda; color: #155724; }
.badge-warning { background: #fff3cd; color: #856404; }
.badge-secondary { background: #e2e3e5; color: #383d41; }
.btn { padding: 0.75rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
.btn-primary { background: #1976d2; color: white; }
.btn-secondary { background: #f5f5f5; color: #666; }
.permission-check { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: 2rem; }
.loading-permission, .permission-denied { text-align: center; max-width: 500px; padding: 3rem 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.loading-permission i { font-size: 3rem; color: #2196f3; margin-bottom: 1rem; }
.permission-denied i { font-size: 3rem; color: #f44336; margin-bottom: 1rem; }
@media (max-width: 768px) {
    .content-wrapper { padding: 1rem; }
    .page-header { flex-direction: column; gap: 1rem; }
    .header-actions { width: 100%; display: grid; grid-template-columns: 1fr; }
    .meta-grid { grid-template-columns: 1fr; }
    .media-preview-grid { grid-template-columns: 1fr; }
    .label { min-width: 110px; }
}
</style>
