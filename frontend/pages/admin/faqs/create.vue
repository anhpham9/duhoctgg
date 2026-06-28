<template>
	<div class="faq-form-page">
		<div v-if="loadingUser || !hasPermission" class="permission-check">
			<div v-if="loadingUser" class="loading-permission">
				<i class="fas fa-spinner fa-spin"></i>
				<p>Dang kiem tra quyen truy cap...</p>
			</div>
			<div v-else class="permission-denied">
				<i class="fas fa-shield-alt"></i>
				<h3>Khong the truy cap form FAQ</h3>
				<p>Chi Superadmin, Admin va Manager moi co the tao/chinh sua FAQ.</p>
				<NuxtLink to="/admin/faqs" class="btn btn-primary">
					<i class="fas fa-arrow-left"></i>
					Quay lai danh sach
				</NuxtLink>
			</div>
		</div>

		<div v-else class="form-wrapper">
			<div class="page-header">
				<div>
					<h1>
						<i class="fas fa-question-circle"></i>
						{{ editingFaqId ? 'Chinh sua FAQ' : 'Tao FAQ moi' }}
					</h1>
					<p>{{ editingFaqId ? 'Cap nhat noi dung FAQ hien tai' : 'Nhap thong tin FAQ moi' }}</p>
				</div>
				<NuxtLink to="/admin/faqs" class="btn btn-secondary">
					<i class="fas fa-arrow-left"></i>
					Quay lai
				</NuxtLink>
			</div>

			<form class="faq-form" @submit.prevent="saveFaq">
				<div class="form-grid two-columns">
					<div class="form-group full">
						<label>Cau hoi <span class="required">*</span></label>
						<textarea
							v-model="form.question"
							class="form-control"
							:class="{ 'is-invalid': !!formErrors.question }"
							rows="3"
							placeholder="Nhap cau hoi FAQ"
							@input="clearFieldError('question')"
						></textarea>
						<p v-if="formErrors.question" class="field-error">{{ formErrors.question }}</p>
					</div>

					<div class="form-group full">
						<label>Cau tra loi <span class="required">*</span></label>
						<textarea
							v-model="form.answer"
							class="form-control"
							:class="{ 'is-invalid': !!formErrors.answer }"
							rows="6"
							placeholder="Nhap cau tra loi"
							@input="clearFieldError('answer')"
						></textarea>
						<p v-if="formErrors.answer" class="field-error">{{ formErrors.answer }}</p>
					</div>

					<div class="form-group">
						<label>Loai FAQ</label>
						<select v-model="form.type" class="form-control">
							<option value="general">General</option>
							<option value="school">School</option>
						</select>
					</div>

					<div class="form-group">
						<label>Thu tu hien thi</label>
						<input v-model.number="form.sort_order" type="number" min="0" class="form-control">
					</div>

					<div class="form-group">
						<label>Truong hoc lien quan</label>
						<select v-model="form.school_id" class="form-control" :disabled="form.type !== 'school'">
							<option value="">Khong ap dung</option>
							<option v-for="school in schools" :key="school.id" :value="String(school.id)">
								{{ school.name }}
							</option>
						</select>
						<small class="field-hint">Chi dung khi loai FAQ la school.</small>
					</div>

					<div class="form-group toggle-group">
						<label>Trang thai</label>
						<label class="toggle-card">
							<input v-model="form.is_active" type="checkbox">
							<span>{{ form.is_active ? 'Dang hien thi' : 'Dang an' }}</span>
						</label>
					</div>
				</div>

				<div class="form-actions">
					<button type="button" class="btn btn-secondary" :disabled="saving" @click="resetForm">
						<i class="fas fa-undo"></i>
						Dat lai
					</button>
					<button class="btn btn-primary" type="submit" :disabled="saving">
						<i class="fas" :class="saving ? 'fa-spinner fa-spin' : (editingFaqId ? 'fa-save' : 'fa-plus')"></i>
						{{ saving ? 'Dang luu...' : (editingFaqId ? 'Cap nhat FAQ' : 'Tao FAQ') }}
					</button>
				</div>
			</form>
		</div>

		<Toast />
	</div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({
	layout: 'admin',
	middleware: ['auth', 'permission'],
	ssr: false
})

const route = useRoute()
const editingFaqId = ref(null)

useHead(() => ({
	title: editingFaqId.value ? 'Chinh sua FAQ - Admin' : 'Tao FAQ - Admin'
}))

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError, showInfo } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const saving = ref(false)
const schools = ref([])

const defaultForm = () => ({
	question: '',
	answer: '',
	type: 'general',
	school_id: '',
	sort_order: 0,
	is_active: true
})

const form = reactive(defaultForm())

const formErrors = reactive({
	question: '',
	answer: ''
})

watch(() => form.type, (value) => {
	if (value !== 'school') {
		form.school_id = ''
	}
})

const clearFieldError = (field) => {
	if (formErrors[field]) formErrors[field] = ''
}

const resetForm = () => {
	Object.assign(form, defaultForm())
	formErrors.question = ''
	formErrors.answer = ''
}

const validateForm = () => {
	formErrors.question = ''
	formErrors.answer = ''

	if (!String(form.question || '').trim()) {
		formErrors.question = 'Cau hoi la bat buoc'
	}

	if (!String(form.answer || '').trim()) {
		formErrors.answer = 'Cau tra loi la bat buoc'
	}

	if (form.type === 'school' && !form.school_id) {
		showError('FAQ loai school can chon truong hoc')
		return false
	}

	return !formErrors.question && !formErrors.answer
}

const applyFaqToForm = (faq) => {
	form.question = faq.question || ''
	form.answer = faq.answer || ''
	form.type = faq.type || 'general'
	form.school_id = faq.school_id ? String(faq.school_id) : ''
	form.sort_order = Number(faq.sort_order || 0)
	form.is_active = Boolean(faq.is_active)
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

const fetchFaqById = async (id) => {
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

		const found = (data.data || []).find((item) => Number(item.id) === Number(id))
		if (!found) {
			throw new Error('Khong tim thay FAQ can chinh sua')
		}
		applyFaqToForm(found)
	} catch (err) {
		showError(err.message || 'Khong the tai FAQ')
		await navigateTo('/admin/faqs')
	}
}

const saveFaq = async () => {
	if (!validateForm()) return

	saving.value = true
	try {
		const payload = {
			question: form.question,
			answer: form.answer,
			type: form.type,
			school_id: form.type === 'school' && form.school_id ? Number(form.school_id) : null,
			sort_order: Number(form.sort_order || 0),
			is_active: Boolean(form.is_active)
		}

		const url = editingFaqId.value ? `${API_BASE}/faqs/${editingFaqId.value}` : `${API_BASE}/faqs`
		const method = editingFaqId.value ? 'PUT' : 'POST'

		const response = await fetch(url, {
			method,
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		})
		const data = await response.json()

		if (!response.ok) {
			throw new Error(data?.message || 'Khong the luu FAQ')
		}

		showSuccess(data?.message || (editingFaqId.value ? 'Da cap nhat FAQ' : 'Da tao FAQ'))
		await navigateTo('/admin/faqs')
	} catch (err) {
		showError(err.message || 'Khong the luu FAQ')
	} finally {
		saving.value = false
	}
}

onMounted(async () => {
	await fetchCurrentUser()
	if (!hasPermission.value) return

	const idFromQuery = route.query.id
	if (idFromQuery) {
		editingFaqId.value = Number(idFromQuery)
	}

	await fetchSchools()

	if (editingFaqId.value) {
		await fetchFaqById(editingFaqId.value)
	} else {
		showInfo('San sang tao FAQ moi')
	}
})
</script>

<style scoped>
.faq-form-page { padding: 0; min-height: 100vh; }
.form-wrapper { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #eee; }
.page-header h1 { margin: 0 0 0.5rem 0; color: #333; display: flex; align-items: center; gap: 10px; }
.page-header p { margin: 0; color: #666; }
.faq-form { margin-top: 1rem; }
.form-grid.two-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500; }
.form-control { width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem; }
.form-control:focus { outline: none; border-color: #1976d2; box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12); }
.form-control.is-invalid { border-color: #dc3545; box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15); }
.field-error { margin: 0.4rem 0 0; color: #dc3545; font-size: 0.85rem; }
textarea.form-control { resize: vertical; }
.required { color: #dc3545; }
.field-hint { margin: 0.45rem 0 0; color: #6b7280; font-size: 0.85rem; }
.toggle-group { display: flex; flex-direction: column; justify-content: flex-end; }
.toggle-card { display: inline-flex; align-items: center; gap: 0.55rem; min-height: 46px; border: 1px solid #d1d5db; border-radius: 8px; padding: 0.7rem 0.85rem; cursor: pointer; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn { padding: 0.75rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
.btn-primary { background: #1976d2; color: white; }
.btn-secondary { background: #f5f5f5; color: #666; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.permission-check { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: 2rem; }
.loading-permission, .permission-denied { text-align: center; max-width: 500px; padding: 3rem 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.loading-permission i { font-size: 3rem; color: #2196f3; margin-bottom: 1rem; }
.permission-denied i { font-size: 3rem; color: #f44336; margin-bottom: 1rem; }

@media (max-width: 768px) {
	.form-grid.two-columns { grid-template-columns: 1fr; }
	.form-wrapper { padding: 1rem; }
	.page-header { flex-direction: column; gap: 1rem; }
	.form-actions { width: 100%; }
	.form-actions .btn { flex: 1; justify-content: center; }
}
</style>
