<template>
	<div class="faqs-admin-page">
		<div v-if="loadingUser || !hasPermission" class="permission-check">
			<div v-if="loadingUser" class="loading-permission">
				<i class="fas fa-spinner fa-spin"></i>
				<p>Đang kiểm tra quyền truy cập...</p>
			</div>
			<div v-else class="permission-denied">
				<i class="fas fa-shield-alt"></i>
				<h3>Không thể truy cập quản lý FAQ</h3>
				<p>Chỉ Superadmin, Admin và Manager mới có thể quản lý FAQ.</p>
				<NuxtLink to="/admin" class="btn btn-primary">
					<i class="fas fa-arrow-left"></i>
					Quay lại Dashboard
				</NuxtLink>
			</div>
		</div>

		<div v-else>
			<div class="page-header">
				<div class="header-content">
					<h1>
						<i class="fas fa-question-circle"></i>
						Quản lý FAQs
					</h1>
					<p>Quản lý câu hỏi thường gặp, thứ tự hiển thị và trạng thái hoạt động.</p>
				</div>
				<div class="header-actions">
					<button class="btn btn-secondary" :disabled="loading" @click="fetchFaqs">
						<i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
						Làm mới
					</button>
					<NuxtLink class="btn btn-primary" to="/admin/faqs/create">
						<i class="fas fa-plus"></i>
						Tạo FAQ
					</NuxtLink>
				</div>
			</div>

			<div class="stats-row">
				<div class="stat-card">
					<span class="stat-label">Tổng FAQ</span>
					<strong class="stat-value">{{ faqs.length }}</strong>
				</div>
				<div class="stat-card">
					<span class="stat-label">Đang hoạt động</span>
					<strong class="stat-value">{{ activeFaqCount }}</strong>
				</div>
				<div class="stat-card">
					<span class="stat-label">FAQ trường học</span>
					<strong class="stat-value">{{ schoolFaqCount }}</strong>
				</div>
			</div>

			<section class="list-panel">
				<div class="panel-header">
					<h3>Danh sách FAQ</h3>
				</div>

				<div class="filters-grid">
					<div class="form-group">
						<label>Tìm kiếm</label>
						<input v-model.trim="filters.search" type="text" class="form-control" placeholder="Tìm theo câu hỏi hoặc câu trả lời">
					</div>
					<div class="form-group">
						<label>Loại FAQ</label>
						<select v-model="filters.type" class="form-control">
							<option value="">Tất cả</option>
							<option value="general">General</option>
							<option value="school">School</option>
						</select>
					</div>
					<div class="form-group">
						<label>Trạng thái</label>
						<select v-model="filters.isActive" class="form-control">
							<option value="">Tất cả</option>
							<option value="true">Đang hoạt động</option>
							<option value="false">Đã ẩn</option>
						</select>
					</div>
					<div v-if="showSchoolFilter" class="form-group">
						<label>Trường học</label>
						<select v-model="filters.schoolId" class="form-control">
							<option value="">Tất cả</option>
							<option v-for="school in schools" :key="school.id" :value="String(school.id)">
								{{ school.name }}
							</option>
						</select>
					</div>
					<div class="form-group">
						<label>Hiển thị</label>
						<select :value="perPage" class="form-control" @change="setItemsPerPage(parseInt($event.target.value))">
							<option v-for="option in itemsPerPageOptions" :key="option.value" :value="option.value">
								{{ option.label }}
							</option>
						</select>
					</div>
				</div>

				<div v-if="loading" class="loading-state">
					<i class="fas fa-spinner fa-spin"></i>
					<p>Đang tải FAQs...</p>
				</div>

				<div v-else-if="error" class="error-state">
					<i class="fas fa-exclamation-triangle"></i>
					<p>{{ error }}</p>
				</div>

				<div v-else-if="filteredFaqs.length === 0" class="empty-state">
					<i class="fas fa-inbox"></i>
					<p>Không tìm thấy FAQ phù hợp.</p>
				</div>

				<div v-else class="faq-list">
					<article
						v-for="faq in paginatedFaqs"
						:key="faq.id"
						class="faq-card"
					>
						<div class="faq-card-top">
							<div class="faq-meta-row">
								<span class="badge" :class="faq.type === 'school' ? 'badge-school' : 'badge-general'">
									{{ faq.type }}
								</span>
								<span class="badge" :class="faq.is_active ? 'badge-active' : 'badge-inactive'">
									{{ faq.is_active ? 'Hiển thị' : 'Ẩn' }}
								</span>
								<span class="order-chip">#{{ faq.sort_order }}</span>
							</div>
							<div class="faq-actions-inline">
								<button class="icon-btn" @click="editFaq(faq)" title="Chỉnh sửa">
									<i class="fas fa-edit"></i>
								</button>
								<button class="icon-btn danger" :disabled="deletingId === faq.id" @click="deleteFaqItem(faq)" title="Xóa">
									<i class="fas" :class="deletingId === faq.id ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
								</button>
							</div>
						</div>

						<h4 class="faq-question">{{ faq.question }}</h4>
						<p class="faq-answer">{{ faq.answer }}</p>
						<p v-if="faq.school_name" class="faq-school">
							<i class="fas fa-school"></i>
							{{ faq.school_name }}
						</p>
					</article>

                    <div v-if="totalPages > 1" class="pagination">
                        <div class="pagination-info">
                            Hien thi {{ ((currentPage - 1) * perPage) + 1 }} -
                            {{ Math.min(currentPage * perPage, filteredFaqs.length) }}
                            trong tong so {{ filteredFaqs.length }} FAQ
                        </div>
                        <div class="pagination-controls">
                            <button @click="goToPage(1)" :disabled="currentPage === 1" class="btn-page btn-page-first">
                                <i class="fas fa-angle-double-left"></i>
                            </button>
                            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn-page btn-page-prev">
                                <i class="fas fa-angle-left"></i>
                            </button>

                            <template v-for="page in visiblePages" :key="page">
                                <button v-if="page === '...'" class="btn-page btn-page-dots" disabled>
                                    ...
                                </button>
                                <button v-else @click="goToPage(page)" :class="['btn-page', { 'btn-page-active': page === currentPage }]">
                                    {{ page }}
                                </button>
                            </template>

                            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn-page btn-page-next">
                                <i class="fas fa-angle-right"></i>
                            </button>
                            <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="btn-page btn-page-last">
                                <i class="fas fa-angle-double-right"></i>
                            </button>
                        </div>
                    </div>

                    <!-- <div v-if="totalPages > 1" class="pagination-bar">
						<button class="btn btn-secondary btn-sm" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
							<i class="fas fa-chevron-left"></i>
							Trước
						</button>

						<div class="pagination-pages">
							<template v-for="page in visiblePages" :key="page">
								<button v-if="page === '...'" class="page-btn" disabled>
									...
								</button>
								<button
									v-else
									class="page-btn"
									:class="{ active: currentPage === page }"
									@click="goToPage(page)"
								>
									{{ page }}
								</button>
							</template>
						</div>

						<button class="btn btn-secondary btn-sm" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
							Sau
							<i class="fas fa-chevron-right"></i>
						</button>
					</div> -->


				</div>
			</section>
		</div>

		<Toast />
	</div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'
import { useVisiblePages } from '~/composables/usePaginationHelper'
import { usePaginationSettings } from '~/composables/usePaginationSettings'

definePageMeta({
	layout: 'admin',
	middleware: ['auth', 'permission'],
	ssr: false
})

useHead({
	title: 'Quan ly FAQs - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const loading = ref(false)
const deletingId = ref(null)
const error = ref('')
const faqs = ref([])
const schools = ref([])
const currentPage = ref(1)
const { itemsPerPage: perPage, itemsPerPageOptions, setItemsPerPage } = usePaginationSettings()

const filters = reactive({
	search: '',
	type: '',
	isActive: '',
	schoolId: ''
})

const activeFaqCount = computed(() => faqs.value.filter((item) => item.is_active).length)
const schoolFaqCount = computed(() => faqs.value.filter((item) => item.type === 'school').length)
const showSchoolFilter = computed(() => filters.type === 'school')

const filteredFaqs = computed(() => {
	return faqs.value.filter((item) => {
		const matchesSearch = !filters.search || `${item.question} ${item.answer}`.toLowerCase().includes(filters.search.toLowerCase())
		const matchesType = !filters.type || item.type === filters.type
		const matchesActive = filters.isActive === '' || String(Boolean(item.is_active)) === filters.isActive
		const matchesSchool = !showSchoolFilter.value || !filters.schoolId || String(item.school_id || '') === filters.schoolId
		return matchesSearch && matchesType && matchesActive && matchesSchool
	})
})

const totalPages = computed(() => {
	if (perPage.value === -1) return 1
	return Math.max(1, Math.ceil(filteredFaqs.value.length / perPage.value))
})

const paginatedFaqs = computed(() => {
	if (perPage.value === -1) return filteredFaqs.value
	const start = (currentPage.value - 1) * perPage.value
	const end = start + perPage.value
	return filteredFaqs.value.slice(start, end)
})

const visiblePages = useVisiblePages(totalPages, currentPage)

watch(() => filters.type, (value) => {
	if (value !== 'school') {
		filters.schoolId = ''
	}
	currentPage.value = 1
})

watch(() => [filters.search, filters.isActive, filters.schoolId], () => {
	currentPage.value = 1
})

watch(perPage, () => {
	currentPage.value = 1
})

watch(totalPages, (value) => {
	if (currentPage.value > value) {
		currentPage.value = value
	}
})

const goToPage = (page) => {
	if (typeof page !== 'number') return
	if (page < 1 || page > totalPages.value) return
	currentPage.value = page
}

const editFaq = (faq) => {
	navigateTo(`/admin/faqs/create?id=${faq.id}`)
}

const fetchSchools = async () => {
	try {
		const response = await fetch(`${API_BASE}/schools`, {
			method: 'GET',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' }
		})
		const data = await response.json()
		if (response.ok) {
			schools.value = data.data || []
		}
	} catch {
		schools.value = []
	}
}

const fetchFaqs = async () => {
	loading.value = true
	error.value = ''

	try {
		const response = await fetch(`${API_BASE}/faqs`, {
			method: 'GET',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' }
		})
		const data = await response.json()

		if (!response.ok) {
			throw new Error(data?.message || `HTTP ${response.status}`)
		}

		faqs.value = data.data || []
		currentPage.value = 1
	} catch (err) {
		error.value = err.message || 'Khong the tai FAQs'
	} finally {
		loading.value = false
	}
}

const deleteFaqItem = async (faq) => {
	const confirmed = window.confirm(`Xoa FAQ: "${faq.question}"?`)
	if (!confirmed) return

	deletingId.value = faq.id
	try {
		const response = await fetch(`${API_BASE}/faqs/${faq.id}`, {
			method: 'DELETE',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' }
		})
		const data = await response.json()

		if (!response.ok) {
			throw new Error(data?.message || 'Khong the xoa FAQ')
		}

		showSuccess(data?.message || 'Da xoa FAQ')
		await fetchFaqs()
	} catch (err) {
		showError(err.message || 'Khong the xoa FAQ')
	} finally {
		deletingId.value = null
	}
}

onMounted(async () => {
	await fetchCurrentUser()
	if (hasPermission.value) {
		await Promise.all([fetchFaqs(), fetchSchools()])
	}
})
</script>

<style scoped>
.faqs-admin-page { min-height: 100vh; }
.permission-check { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: 2rem; }
.loading-permission, .permission-denied, .loading-state, .error-state, .empty-state { text-align: center; background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
.loading-permission i, .loading-state i { font-size: 2rem; color: #1976d2; margin-bottom: 0.75rem; }
.permission-denied i, .error-state i, .empty-state i { font-size: 2rem; margin-bottom: 0.75rem; color: #ef4444; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #eef2f7; }
.header-content h1 { margin: 0 0 0.4rem; display: flex; align-items: center; gap: 0.75rem; color: #1f2937; }
.header-content p { margin: 0; color: #6b7280; }
.header-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.stats-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1rem; }
.stat-card, .list-panel { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06); padding: 1rem; }
.stat-label { display: block; color: #64748b; font-size: 0.9rem; margin-bottom: 0.4rem; }
.stat-value { font-size: 1.6rem; color: #0f172a; }
.panel-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 2px solid #eee; }
.panel-header h3 { margin: 0; color: #111827; }
.filters-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.85rem; }
.faq-list { display: flex; flex-direction: column; gap: 0.85rem; margin-top: 1rem; }
.pagination { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; background: #f8f9fa; border-top: 1px solid #eee; }

.pagination-info { color: #666; font-size: 0.9rem; }

.pagination-controls { display: flex; gap: 0.25rem; }

.btn-page {
    min-width: 36px;
    height: 36px;
    border: 1px solid #ddd;
    background: white;
    color: #666;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
    background: #f0f0f0;
    border-color: #1976d2;
}

.btn-page-active {
    background: #1976d2;
    color: white;
    border-color: #1976d2;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.faq-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
.faq-card:hover { border-color: #1976d2; box-shadow: 0 8px 18px rgba(25, 118, 210, 0.08); }
.faq-card-top, .faq-meta-row { display: flex; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
.faq-meta-row { justify-content: flex-start; margin-bottom: 0.75rem; }
.badge, .order-chip { display: inline-flex; align-items: center; padding: 0.25rem 0.55rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; }
.badge-general { background: #e0f2fe; color: #0369a1; }
.badge-school { background: #ede9fe; color: #6d28d9; }
.badge-active { background: #dcfce7; color: #166534; }
.badge-inactive { background: #fee2e2; color: #991b1b; }
.order-chip { background: #f3f4f6; color: #4b5563; }
.faq-actions-inline { display: flex; gap: 0.4rem; }
.faq-question { margin: 0 0 0.6rem; color: #111827; }
.faq-answer, .faq-school { margin: 0; color: #6b7280; }
.faq-school { margin-top: 0.7rem; font-size: 0.9rem; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.45rem; font-weight: 500; color: #333; }
.form-control { width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font: inherit; }
.form-control:focus { outline: none; border-color: #1976d2; box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12); }
.btn, .icon-btn { border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s ease; }
.btn { padding: 0.72rem 1.1rem; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
.btn-sm { padding: 0.5rem 0.8rem; }
.icon-btn { width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center; background: #eff6ff; color: #1d4ed8; }
.icon-btn.danger { background: #fef2f2; color: #dc2626; }
.btn-primary { background: #1976d2; color: white; }
.btn-primary:hover:not(:disabled) { background: #1565c0; }
.btn-secondary { background: #f3f4f6; color: #374151; }
.btn-secondary:hover:not(:disabled) { background: #e5e7eb; }
.btn:disabled, .icon-btn:disabled, .page-btn:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 768px) {
	.page-header, .panel-header { flex-direction: column; align-items: stretch; }
	.stats-row, .filters-grid { grid-template-columns: 1fr; }
	.header-actions { width: 100%; }
	.header-actions .btn { flex: 1; justify-content: center; }
    .pagination { flex-direction: column; gap: 1rem; padding: 1rem; }
}
</style>
