<template>
    <div class="homepage-content-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Quản lý nội dung Homepage</h3>
                <p>Chỉ Superadmin, Admin và Manager mới có thể quản lý nội dung này.</p>
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
                        <i class="fas fa-file-alt"></i>
                        Quản lý nội dung Homepage
                    </h1>
                    <p>Cập nhật SEO, hero và nội dung chi tiết cho trang Homepage.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="loading || sectionLoading || bannerLoading" @click="reloadAllData">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm mới
                    </button>
                    <button class="btn btn-outline" @click="previewPublicPage">
                        <i class="fas fa-eye"></i>
                        Xem trang
                    </button>
                    <button class="btn btn-primary" :disabled="saving || !hasChanges" @click="savePageData">
                        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                        <i v-else class="fas fa-save"></i>
                        {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                    </button>
                </div>
            </div>

            <div class="tab-nav top-tabs">
                <button v-for="tab in contentTabs" :key="tab.key" type="button" class="tab-btn"
                    :class="{ active: activeContentTab === tab.key }" @click="activeContentTab = tab.key">
                    {{ tab.label }}
                </button>
            </div>

            <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải nội dung...</p>
            </div>

            <div v-else>
                <div v-if="activeContentTab === 'main'" class="form-layout">
                    <div class="content-section">
                        <div class="section-header">
                            <h3><i class="fas fa-info-circle"></i> Thông tin trang</h3>
                            <p>Thông tin tổng quan của trang Homepage</p>
                        </div>
                        <div class="form-grid two-columns">
                            <div class="form-group">
                                <label>Tiêu đề trang <span class="required">*</span></label>
                                <input v-model.trim="form.title" @input="clearFieldError('title')" type="text"
                                    class="form-control" :class="{ 'is-invalid': !!formErrors.title }"
                                    placeholder="Ví dụ: Liên hệ">
                                <p v-if="formErrors.title" class="field-error">{{ formErrors.title }}</p>
                            </div>
                            <div class="form-group">
                                <label>Slug</label>
                                <input type="text" class="form-control" :value="form.slug" disabled>
                            </div>
                            <div class="form-group">
                                <label>Trạng thái</label>
                                <select v-model="form.status" class="form-control">
                                    <option value="draft">draft</option>
                                    <option value="published">published</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Loại trang</label>
                                <input type="text" class="form-control" :value="form.type" disabled>
                            </div>
                        </div>
                    </div>

                    <div class="content-section">
                        <div class="section-header">
                            <h3><i class="fas fa-heading"></i> Hero</h3>
                            <p>Nội dung hiển thị phần đầu trang</p>
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Hero title</label>
                                <input v-model.trim="form.hero_title" type="text" class="form-control"
                                    placeholder="Nhập hero title">
                            </div>
                            <div class="form-group">
                                <label>Hero description</label>
                                <textarea v-model="form.hero_description" class="form-control" rows="3"
                                    placeholder="Nhập mô tả hero"></textarea>
                            </div>
                        </div>
                    </div>

                    <div class="content-section">
                        <div class="section-header">
                            <h3><i class="fas fa-search"></i> SEO</h3>
                            <p>Tiêu đề và mô tả metadata</p>
                        </div>
                        <div class="form-grid">
                            <div class="form-group">
                                <label>Meta title</label>
                                <input v-model.trim="form.meta_title" type="text" class="form-control" maxlength="255"
                                    placeholder="Nhập meta title">
                                <small class="field-hint">{{ form.meta_title.length }}/255 ký tự</small>
                            </div>
                            <div class="form-group">
                                <label>Meta description</label>
                                <textarea v-model="form.meta_description" class="form-control" rows="3" maxlength="500"
                                    placeholder="Nhập meta description"></textarea>
                                <small class="field-hint">{{ form.meta_description.length }}/500 ký tự</small>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button class="btn btn-secondary" :disabled="saving" @click="restoreSnapshot">
                            <i class="fas fa-undo"></i>
                            Khôi phục
                        </button>
                        <button class="btn btn-primary" :disabled="saving || !hasChanges" @click="savePageData">
                            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                            <i v-else class="fas fa-save"></i>
                            {{ saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                        </button>
                    </div>
                </div>
                <!-- end main -->

                <div v-if="activeContentTab === 'sections'" class="form-layout">
                    <div class="content-section">
                        <div class="section-header">
                            <h3><i class="fas fa-layer-group"></i> Danh sách sections trang chủ</h3>
                            <p>Quản lý thứ tự, trạng thái hiển thị và nội dung từng section.</p>
                        </div>

                        <div class="form-grid">
                            <div class="section-toolbar">
                                <button class="btn btn-secondary" :disabled="sectionLoading" @click="loadSections">
                                    <i class="fas fa-sync-alt" :class="{ 'fa-spin': sectionLoading }"></i>
                                    Làm mới sections
                                </button>
                                <button class="btn btn-primary" @click="startCreateSection">
                                    <i class="fas fa-plus"></i>
                                    Thêm section
                                </button>
                            </div>

                            <div v-if="sectionLoading" class="loading-state compact-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>Đang tải sections...</p>
                            </div>

                            <div v-else class="sections-table-wrapper">
                                <table class="sections-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Tiêu đề</th>
                                            <th>Type</th>
                                            <th>Sort</th>
                                            <th>Hiển thị</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-if="!sections.length">
                                            <td colspan="6" class="empty-row">Chưa có section nào.</td>
                                        </tr>
                                        <tr v-for="(section, index) in sections" :key="section.id">
                                            <td>{{ index + 1 }}</td>
                                            <td>
                                                <strong>{{ section.title }}</strong>
                                                <p class="row-subtitle">{{ section.subtitle || 'Không có subtitle' }}</p>
                                            </td>
                                            <td><span class="type-badge">{{ getTypeLabel(section.type) }}</span></td>
                                            <td>{{ section.sort_order }}</td>
                                            <td>
                                                <span :class="['status-dot', section.is_active ? 'active' : 'inactive']">
                                                    {{ section.is_active ? 'Hoạt động' : 'Không hoạt động' }}
                                                </span>
                                            </td>
                                            <td>
                                                <div class="row-actions">
                                                    <button class="btn btn-outline btn-sm" @click="startEditSection(section)">
                                                        <i class="fas fa-pen"></i>
                                                        Sửa
                                                    </button>
                                                    <button class="btn btn-secondary btn-sm btn-danger" @click="removeSection(section)">
                                                        <i class="fas fa-trash"></i>
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div v-if="showSectionForm" class="content-section">
                        <div class="section-header">
                            <h3><i class="fas fa-pen-ruler"></i> {{ isEditingSection ? 'Chỉnh sửa section' : 'Tạo section mới' }}</h3>
                            <p>Phân loại quyết định bộ trường nội dung tương ứng.</p>
                        </div>

                        <div class="form-grid two-columns">
                            <div class="form-group">
                                <label>Tiêu đề <span class="required">*</span></label>
                                <input v-model.trim="sectionForm.title" type="text" class="form-control" placeholder="Ví dụ: Bạn đang muốn...">
                            </div>
                            <div class="form-group">
                                <label>Phụ đề <span class="required">*</span></label>
                                <input v-model.trim="sectionForm.subtitle" type="text" class="form-control" placeholder="Mô tả ngắn cho section">
                            </div>

                            <div class="form-group">
                                <label>Ghi chú</label>
                                <textarea v-model="sectionForm.description" class="form-control" rows="3" placeholder="Mô tả tổng quát section"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Phân loại <span class="required">*</span></label>
                                <select v-model="sectionForm.type" class="form-control">
                                    <option value="paragraph">Đoạn văn</option>
                                    <option value="list">Danh sách</option>
                                    <option value="card">Thẻ</option>
                                    <option value="roadmap">Lộ trình</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Thứ tự hiển thị</label>
                                <input v-model.number="sectionForm.sort_order" type="number" class="form-control" min="0">
                            </div>
                            <div class="form-group">
                                <label>Trạng thái</label>
                                <select v-model="sectionForm.is_active" class="form-control">
                                    <option :value="true">Hoạt động</option>
                                    <option :value="false">Không hoạt động</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-grid two-columns section-extra-grid">
                            <div class="form-group checkbox-group">
                                <label class="switch-label">
                                    <input  class="switch-button"
                                        v-model="sectionForm.contact_btn_show"
                                        type="checkbox"
                                    >
                                    <span>Hiển thị nút tư vấn</span>
                                </label>
                            </div>
                            <div class="form-group" v-if="sectionForm.contact_btn_show">
                                <label>Tiêu đề nút tư vấn</label>
                                <input v-model.trim="sectionForm.contact_btn_text" type="text" class="form-control" placeholder="Ví dụ: ĐĂNG KÝ TƯ VẤN">
                            </div>
                        </div>

                        <div v-if="sectionForm.type === 'paragraph' || sectionForm.type === 'list'" class="form-grid two-columns section-extra-grid">
                            <div class="form-group">
                                <label>Hình ảnh</label>
                                <div class="input-mode-switch">
                                    <button type="button" class="mode-btn" :class="{ active: sectionImageMode === 'url' }" @click="setSectionImageMode('url')">
                                        Nhập link ảnh
                                    </button>
                                    <button type="button" class="mode-btn" :class="{ active: sectionImageMode === 'upload' }" @click="setSectionImageMode('upload')">
                                        Upload lên Cloudinary
                                    </button>
                                </div>

                                <div v-if="sectionImageMode === 'url'" class="image-input-url">
                                    <input v-model.trim="sectionForm.image_url" type="url" class="form-control" placeholder="https://example.com/image.jpg">
                                </div>

                                <div v-else class="upload-actions">
                                    <input ref="sectionImageFileInput" type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden-file-input" @change="onSectionImageFileChange">
                                    <button type="button" class="btn btn-secondary" :disabled="sectionImageUploading || sectionSaving" @click="triggerSectionImagePicker">
                                        <i class="fas" :class="sectionImageUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                                        {{ sectionImageUploading ? 'Đang upload...' : 'Chọn ảnh' }}
                                    </button>
                                    <span class="upload-inline-hint">PNG/JPG/WEBP/GIF</span>
                                </div>

                                <div class="form-group">
                                    <label>Vị trí ảnh</label>
                                    <select v-model.number="sectionForm.image_position" class="form-control">
                                        <option :value="0">Bên trái</option>
                                        <option :value="1">Bên phải</option>
                                    </select>
                                </div>


                            </div>

                            <div class="form-group">
                                <div class="image-preview-card">
                                    <p class="image-preview-title">Xem trước ảnh</p>
                                    <div class="image-preview-surface">
                                        <img v-if="sectionImagePreviewSrc" :src="sectionImagePreviewSrc" :alt="sectionForm.title || 'Section preview'" class="image-preview">
                                        <div v-else class="image-preview-empty">
                                            <i class="fas fa-image"></i>
                                            <p>Chưa có ảnh để xem trước</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="sectionForm.type === 'paragraph'" class="form-grid two-columns section-extra-grid">
                            <div class="form-group full-width-block">
                                <label>Nội dung đoạn văn</label>
                                <textarea v-model="sectionForm.paragraph_text" class="form-control" rows="6" placeholder="Nội dung đoạn văn"></textarea>
                            </div>
                        </div>

                        <div v-if="sectionForm.type === 'list'" class="form-grid two-columns section-extra-grid">
                            <div class="form-group">
                                <label>Icon danh sách (tên class)</label>
                                <div class="icon-input-with-preview">
                                    <input v-model.trim="sectionForm.list_icon" type="text" class="form-control" placeholder="fas fa-check">
                                    <span class="icon-preview-chip" :title="sectionForm.list_icon || 'fas fa-check'">
                                        <i :class="previewIconClass(sectionForm.list_icon, 'fas fa-check')"></i>
                                    </span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Các mục danh sách (mỗi dòng 1 mục)</label>
                                <textarea v-model="sectionForm.list_items_text" class="form-control" rows="8" placeholder="Dòng 1&#10;Dòng 2&#10;Dòng 3"></textarea>
                            </div>
                        </div>

                        <div v-if="sectionForm.type === 'card'" class="form-grid two-columns section-extra-grid">
                            <div class="form-group full-width-block">
                                <label>Giao diện thẻ</label>
                                <select v-model="sectionForm.card_layout" class="form-control">
                                    <option value="bg-red">Màu nền đỏ</option>
                                    <option value="bg-white">Màu nền trắng</option>
                                    <option value="border-top">Viền trên đỏ - nền trắng</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Số thẻ / hàng (màn hình > 1024px)</label>
                                <input v-model.number="sectionForm.card_desktop_columns" type="number" min="1" max="6" class="form-control">
                            </div>

                            <div class="form-group">
                                <label>Số thẻ / hàng (màn hình 768px - 1024px)</label>
                                <input v-model.number="sectionForm.card_tablet_columns" type="number" min="1" max="4" class="form-control">
                            </div>

                            <div class="card-editor-list full-width-block">
                                <div v-for="(card, idx) in sectionForm.card_items" :key="idx" class="card-editor-item">
                                    <div class="card-editor-row">
                                        <div class="icon-input-with-preview">
                                            <input v-model.trim="card.icon" type="text" class="form-control" placeholder="Icon (fas fa-star)">
                                            <span class="icon-preview-chip" :title="card.icon || 'fas fa-star'">
                                                <i :class="previewIconClass(card.icon, 'fas fa-star')"></i>
                                            </span>
                                        </div>
                                        <input v-model.trim="card.title" type="text" class="form-control" placeholder="Tiêu đề card">
                                    </div>
                                    <textarea v-model="card.content" class="form-control" rows="3" placeholder="Nội dung card"></textarea>
                                    <button class="btn btn-secondary btn-sm btn-danger justify-start" @click="removeCardItem(idx)">
                                        <i class="fas fa-trash"></i>
                                        Xóa card
                                    </button>
                                </div>

                                <button class="btn btn-outline justify-start" @click="addCardItem">
                                    <i class="fas fa-plus"></i>
                                    Thêm card
                                </button>
                            </div>
                        </div>

                        <div v-if="sectionForm.type === 'roadmap'" class="form-grid two-columns section-extra-grid">
                            
                            <div class="card-editor-list full-width-block">
                                <div v-for="(step, idx) in sectionForm.roadmap_items" :key="idx" class="card-editor-item">
                                    
                                    <input v-model.trim="step.title" type="text" class="form-control" placeholder="Tiêu đề bước">
                                    
                                    <textarea v-model="step.content" class="form-control" rows="3" placeholder="Nội dung bước"></textarea>
                                    <button class="btn btn-secondary btn-sm btn-danger justify-start" @click="removeRoadmapItem(idx)">
                                        <i class="fas fa-trash"></i>
                                        Xóa bước
                                    </button>
                                </div>

                                <button class="btn btn-outline justify-start" @click="addRoadmapItem">
                                    <i class="fas fa-plus"></i>
                                    Thêm bước
                                </button>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button class="btn btn-secondary" :disabled="sectionSaving" @click="cancelSectionForm">
                                <i class="fas fa-rotate-left"></i>
                                Đóng form
                            </button>
                            <button class="btn btn-primary" :disabled="sectionSaving" @click="saveSection">
                                <i v-if="sectionSaving" class="fas fa-spinner fa-spin"></i>
                                <i v-else class="fas fa-save"></i>
                                {{ sectionSaving ? 'Đang lưu...' : (isEditingSection ? 'Cập nhật section' : 'Tạo section') }}
                            </button>
                        </div>
                    </div>
                </div>
                <!-- end sections -->

                <div v-if="activeContentTab === 'banner'" class="form-layout">
                    <div class="content-section">
                        <div class="section-header">
                            <h3><i class="fas fa-image"></i> Banner trang chủ</h3>
                            <p>Quản lý duy nhất 1 ảnh banner cho homepage.</p>
                        </div>

                        <div class="form-grid">
                            <div class="form-group">
                                <label>Nguồn ảnh banner</label>
                                <div class="input-mode-switch">
                                    <button type="button" class="mode-btn" :class="{ active: bannerImageMode === 'url' }" @click="setBannerImageMode('url')">
                                        Nhập link ảnh
                                    </button>
                                    <button type="button" class="mode-btn" :class="{ active: bannerImageMode === 'upload' }" @click="setBannerImageMode('upload')">
                                        Upload lên Cloudinary
                                    </button>
                                </div>

                                <div v-if="bannerImageMode === 'url'" class="image-input-url">
                                    <input
                                        v-model.trim="bannerForm.banner_url"
                                        type="text"
                                        class="form-control"
                                        placeholder="https://example.com/banner.jpg hoặc /assets/images/banner.jpg"
                                    >
                                </div>

                                <div v-else class="upload-actions">
                                    <input
                                        ref="bannerImageFileInput"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/gif"
                                        class="hidden-file-input"
                                        @change="onBannerImageFileChange"
                                    >
                                    <button type="button" class="btn btn-secondary" :disabled="bannerImageUploading || bannerSaving" @click="triggerBannerImagePicker">
                                        <i class="fas" :class="bannerImageUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                                        {{ bannerImageUploading ? 'Đang upload...' : 'Chọn ảnh' }}
                                    </button>
                                    <span class="upload-inline-hint">PNG/JPG/WEBP/GIF</span>
                                </div>

                                <small class="field-hint">Banner sẽ hiển thị ở đầu trang chủ public.</small>
                            </div>

                            <div class="form-group">
                                <div class="image-preview-card">
                                    <p class="image-preview-title">Xem trước banner</p>
                                    <div class="image-preview-surface">
                                        <img v-if="bannerPreviewSrc" :src="bannerPreviewSrc" alt="Homepage banner preview" class="image-preview">
                                        <div v-else class="image-preview-empty">
                                            <i class="fas fa-image"></i>
                                            <p>Chưa có banner để xem trước</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button class="btn btn-secondary" :disabled="bannerSaving || bannerLoading" @click="loadBannerData">
                                <i class="fas fa-sync-alt" :class="{ 'fa-spin': bannerLoading }"></i>
                                Tải lại banner
                            </button>
                            <button class="btn btn-primary" :disabled="bannerSaving || bannerLoading" @click="saveBannerData">
                                <i v-if="bannerSaving" class="fas fa-spinner fa-spin"></i>
                                <i v-else class="fas fa-save"></i>
                                {{ bannerSaving ? 'Đang lưu...' : 'Lưu banner' }}
                            </button>
                        </div>
                    </div>
                </div>
                <!-- end banner -->
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Quản lý nội dung Homepage - Admin'
})

const PAGE_SLUG = 'home'

const activeContentTab = ref('main')

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError, showWarning } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const loading = ref(false)
const saving = ref(false)
const sectionLoading = ref(false)
const sectionSaving = ref(false)
const sectionImageUploading = ref(false)
const bannerLoading = ref(false)
const bannerSaving = ref(false)
const bannerImageUploading = ref(false)
const sections = ref([])
const editingSectionId = ref(null)
const showSectionForm = ref(false)
const sectionImageMode = ref('url')
const sectionImageFileInput = ref(null)
const pendingSectionImageFile = ref(null)
const sectionImagePreviewTempUrl = ref('')
const bannerImageMode = ref('url')
const bannerImageFileInput = ref(null)
const pendingBannerImageFile = ref(null)
const bannerImagePreviewTempUrl = ref('')

const form = reactive({
    title: '',
    slug: PAGE_SLUG,
    hero_title: '',
    hero_description: '',
    meta_title: '',
    meta_description: '',
    type: '',
    status: 'published'
})

const snapshot = ref(null)

const formErrors = reactive({
    title: '',
    hero_title: '',
    hero_description: '',
    meta_title: '',
    meta_description: ''
})

const bannerForm = reactive({
    banner_url: '',
    banner_asset_public_id: ''
})

const createEmptySectionForm = () => ({
    title: '',
    subtitle: '',
    description: '',
    type: 'paragraph',
    contact_btn_show: false,
    contact_btn_text: '',
    paragraph_text: '',
    image_url: '',
    image_cloudinary_public_id: '',
    image_position: 1,
    list_icon: '',
    list_items_text: '',
    card_desktop_columns: 4,
    card_tablet_columns: 2,
    card_layout: 'bg-red',
    card_items: [{ icon: '', title: '', content: '' }],
    roadmap_items: [{ title: '', content: '' }],
    sort_order: 0,
    is_active: true
})

const sectionForm = reactive(createEmptySectionForm())

const isEditingSection = computed(() => editingSectionId.value !== null)

const normalizePayload = (payload = {}) => ({
    title: payload.title || '',
    slug: payload.slug || PAGE_SLUG,
    hero_title: payload.hero_title || '',
    hero_description: payload.hero_description || '',
    meta_title: payload.meta_title || '',
    meta_description: payload.meta_description || '',
    type: payload.type || 'static',
    status: payload.status || 'published'
})

const contentTabs = [
    { key: 'main', label: 'Meta & SEO' },
    { key: 'banner', label: 'Ảnh banner' },
    { key: 'sections', label: 'Sections' }
]

const SECTION_TYPE_LABELS = {
    paragraph: 'Đoạn văn',
    list: 'Danh sách',
    card: 'Thẻ',
    roadmap: 'Lộ trình'
}

const getTypeLabel = (type) => SECTION_TYPE_LABELS[type] || type

const hasChanges = computed(() => {
    if (!snapshot.value) return false
    const current = JSON.stringify(normalizePayload(form))
    const original = JSON.stringify(snapshot.value)
    return current !== original
})

const clearFieldError = (field) => {
    if (formErrors[field]) formErrors[field] = ''
}

const normalizeListItemsText = (value) => {
    if (!Array.isArray(value)) return ''
    return value
        .map((item) => {
            if (typeof item === 'string') return item.trim()
            if (item && typeof item === 'object') return String(item.text || item.value || '').trim()
            return ''
        })
        .filter(Boolean)
        .join('\n')
}

const normalizeCardItems = (value) => {
    if (!Array.isArray(value)) return [{ icon: '', title: '', content: '' }]

    const rows = value
        .map((item) => ({
            icon: String(item?.icon || '').trim(),
            title: String(item?.title || '').trim(),
            content: String(item?.content || '').trim()
        }))
        .filter((item) => item.icon || item.title || item.content)

    return rows.length ? rows : [{ icon: '', title: '', content: '' }]
}

const normalizeRoadmapItems = (value) => {
    if (!Array.isArray(value)) return [{ title: '', content: '' }]

    const rows = value
        .map((step) => ({
            title: String(step?.title || '').trim(),
            content: String(step?.content || '').trim()
        }))
        .filter((step) => step.title || step.content)

    return rows.length ? rows : [{ title: '', content: '' }]
}

const isValidImageUrlInput = (value) => {
    if (!value) return true

    const normalized = String(value).trim()
    if (!normalized) return true

    // Support project/local paths such as /assets/images/example.jpg
    if (normalized.startsWith('/') || normalized.startsWith('./') || normalized.startsWith('../')) {
        return true
    }

    try {
        const parsed = new URL(normalized)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
        return false
    }
}

const previewIconClass = (value, fallback = 'fas fa-circle') => String(value || '').trim() || fallback

const sectionImagePreviewSrc = computed(() => String(sectionImagePreviewTempUrl.value || sectionForm.image_url || '').trim())
const bannerPreviewSrc = computed(() => String(bannerImagePreviewTempUrl.value || bannerForm.banner_url || '').trim())

const resetSectionImagePreview = () => {
    if (sectionImagePreviewTempUrl.value) {
        URL.revokeObjectURL(sectionImagePreviewTempUrl.value)
        sectionImagePreviewTempUrl.value = ''
    }
}

const setSectionImageMode = (mode) => {
    if (!['url', 'upload'].includes(mode)) return
    sectionImageMode.value = mode
    if (mode === 'url') {
        pendingSectionImageFile.value = null
        resetSectionImagePreview()
    }
}

const triggerSectionImagePicker = () => {
    sectionImageFileInput.value?.click()
}

const resetBannerImagePreview = () => {
    if (bannerImagePreviewTempUrl.value) {
        URL.revokeObjectURL(bannerImagePreviewTempUrl.value)
        bannerImagePreviewTempUrl.value = ''
    }
}

const setBannerImageMode = (mode) => {
    if (!['url', 'upload'].includes(mode)) return
    bannerImageMode.value = mode
    if (mode === 'url') {
        pendingBannerImageFile.value = null
        resetBannerImagePreview()
    }
}

const triggerBannerImagePicker = () => {
    bannerImageFileInput.value?.click()
}

const onBannerImageFileChange = (event) => {
    const file = event?.target?.files?.[0]
    event.target.value = ''
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(String(file.type || '').toLowerCase())) {
        showError('Định dạng file ảnh không hợp lệ (chỉ nhận PNG/JPG/WEBP/GIF)')
        return
    }

    if (file.size > 5 * 1024 * 1024) {
        showError('File ảnh vượt quá 5MB')
        return
    }

    pendingBannerImageFile.value = file
    bannerForm.banner_url = file.name
    bannerForm.banner_asset_public_id = ''

    resetBannerImagePreview()
    bannerImagePreviewTempUrl.value = URL.createObjectURL(file)
}

const onSectionImageFileChange = (event) => {
    const file = event?.target?.files?.[0]
    event.target.value = ''
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(String(file.type || '').toLowerCase())) {
        showError('Định dạng file ảnh không hợp lệ (chỉ nhận PNG/JPG/WEBP/GIF)')
        return
    }

    if (file.size > 5 * 1024 * 1024) {
        showError('File ảnh vượt quá 5MB')
        return
    }

    pendingSectionImageFile.value = file
    sectionForm.image_url = file.name
    sectionForm.image_cloudinary_public_id = ''

    resetSectionImagePreview()
    sectionImagePreviewTempUrl.value = URL.createObjectURL(file)
}

const uploadSectionImageToCloudinary = async (file) => {
    const uploadFormData = new FormData()
    uploadFormData.append('image', file)

    const response = await fetch(`${API_BASE}/about/team-members/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: uploadFormData
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data?.message || 'Upload ảnh thất bại')
    }

    const uploadedUrl = String(data?.data?.url || '').trim()
    if (!uploadedUrl) {
        throw new Error('Không nhận được URL ảnh từ server')
    }

    return {
        uploadedUrl,
        uploadedPublicId: String(data?.data?.publicId || '').trim()
    }
}

const uploadBannerImageToCloudinary = async (file) => {
    const uploadFormData = new FormData()
    uploadFormData.append('image', file)
    uploadFormData.append('type', 'homepage-banner')

    const response = await fetch(`${API_BASE}/settings/general/upload-image`, {
        method: 'POST',
        credentials: 'include',
        body: uploadFormData
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data?.message || 'Upload ảnh banner thất bại')
    }

    const uploadedUrl = String(data?.data?.url || '').trim()
    if (!uploadedUrl) {
        throw new Error('Không nhận được URL banner từ server')
    }

    return {
        uploadedUrl,
        uploadedPublicId: String(data?.data?.publicId || '').trim()
    }
}

const parseListItems = (rawText = '') => {
    return String(rawText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
}

const addCardItem = () => {
    sectionForm.card_items.push({ icon: '', title: '', content: '' })
}

const removeCardItem = (index) => {
    sectionForm.card_items.splice(index, 1)
    if (!sectionForm.card_items.length) {
        sectionForm.card_items.push({ icon: '', title: '', content: '' })
    }
}

const addRoadmapItem = () => {
    sectionForm.roadmap_items.push({ title: '', content: '' })
}

const removeRoadmapItem = (index) => {
    sectionForm.roadmap_items.splice(index, 1)
    if (!sectionForm.roadmap_items.length) {
        sectionForm.roadmap_items.push({ title: '', content: '' })
    }
}

const resetSectionForm = () => {
    Object.assign(sectionForm, createEmptySectionForm())
    editingSectionId.value = null
    sectionImageMode.value = 'url'
    pendingSectionImageFile.value = null
    resetSectionImagePreview()
}

const startCreateSection = () => {
    resetSectionForm()
    showSectionForm.value = true
}

const startEditSection = (section) => {
    editingSectionId.value = section.id
    showSectionForm.value = true
    sectionImageMode.value = section.image_url ? 'url' : 'upload'
    pendingSectionImageFile.value = null
    resetSectionImagePreview()
    Object.assign(sectionForm, {
        title: section.title || '',
        subtitle: section.subtitle || '',
        description: section.description || '',
        type: section.type || 'paragraph',
        contact_btn_show: Boolean(section.contact_btn_show),
        contact_btn_text: section.contact_btn_text || '',
        paragraph_text: section.paragraph_text || '',
        image_url: section.image_url || '',
        image_cloudinary_public_id: section.image_cloudinary_public_id || '',
        image_position: Number(section.image_position) === 0 ? 0 : 1,
        list_icon: section.list_icon || '',
        list_items_text: normalizeListItemsText(section.list_items),
        card_desktop_columns: Number(section.card_desktop_columns || 4),
        card_tablet_columns: Number(section.card_tablet_columns || 2),
        card_layout: section.card_layout || 'bg-red',
        card_items: normalizeCardItems(section.card_items),
        roadmap_items: normalizeRoadmapItems(section.roadmap_items),
        sort_order: Number(section.sort_order || 0),
        is_active: Boolean(section.is_active)
    })
}

const cancelSectionForm = () => {
    resetSectionForm()
    showSectionForm.value = false
}

const loadSections = async () => {
    sectionLoading.value = true

    try {
        const response = await fetch(`${API_BASE}/homepage-sections`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)

        sections.value = Array.isArray(data?.data) ? data.data : []
    } catch (error) {
        showError(error.message || 'Không thể tải danh sách sections')
    } finally {
        sectionLoading.value = false
    }
}

const applyBannerPayload = (payload = {}) => {
    bannerForm.banner_url = String(payload?.bannerUrl || '').trim()
    bannerForm.banner_asset_public_id = String(payload?.bannerAssetPublicId || '').trim()
    bannerImageMode.value = bannerForm.banner_asset_public_id ? 'upload' : 'url'
    pendingBannerImageFile.value = null
    resetBannerImagePreview()
}

const loadBannerData = async () => {
    bannerLoading.value = true

    try {
        const response = await fetch(`${API_BASE}/settings/homepage-banner`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)

        applyBannerPayload(data?.data || {})
    } catch (error) {
        showError(error.message || 'Không thể tải banner homepage')
    } finally {
        bannerLoading.value = false
    }
}

const saveBannerData = async () => {
    if (bannerImageMode.value === 'url' && bannerForm.banner_url.trim() && !isValidImageUrlInput(bannerForm.banner_url.trim())) {
        showError('URL banner không hợp lệ')
        return
    }

    bannerSaving.value = true

    try {
        let bannerUrl = bannerForm.banner_url.trim()
        let bannerAssetPublicId = String(bannerForm.banner_asset_public_id || '').trim()

        if (bannerImageMode.value === 'upload' && pendingBannerImageFile.value) {
            bannerImageUploading.value = true
            const uploadResult = await uploadBannerImageToCloudinary(pendingBannerImageFile.value)
            bannerUrl = uploadResult.uploadedUrl
            bannerAssetPublicId = uploadResult.uploadedPublicId
        }

        if (bannerImageMode.value === 'url') {
            bannerAssetPublicId = ''
        }

        const payload = {
            bannerUrl,
            bannerAssetPublicId
        }

        const response = await fetch(`${API_BASE}/settings/homepage-banner`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)

        showSuccess(data?.message || 'Đã lưu banner homepage thành công')
        applyBannerPayload(data?.data || payload)
    } catch (error) {
        showError(error.message || 'Không thể lưu banner homepage')
    } finally {
        bannerSaving.value = false
        bannerImageUploading.value = false
    }
}

const validateSection = () => {
    if (!sectionForm.title.trim()) return 'Tiêu đề section là bắt buộc'
    if (!sectionForm.subtitle.trim()) return 'Subtitle section là bắt buộc'

    if (sectionForm.contact_btn_show && !sectionForm.contact_btn_text.trim()) {
        return 'Bạn cần nhập tiêu đề nút tư vấn khi bật hiển thị nút'
    }

    if ((sectionForm.type === 'paragraph' || sectionForm.type === 'list') && sectionImageMode.value === 'url' && sectionForm.image_url.trim() && !isValidImageUrlInput(sectionForm.image_url.trim())) {
        return 'URL ảnh không hợp lệ'
    }

    if (sectionForm.type === 'paragraph' && !sectionForm.paragraph_text.trim() && !sectionForm.image_url.trim()) {
        return 'Section paragraph cần paragraph_text hoặc image_url'
    }

    if (sectionForm.type === 'list') {
        if (!sectionForm.list_icon.trim()) return 'Section list cần list_icon'
        if (!parseListItems(sectionForm.list_items_text).length) return 'Section list cần ít nhất 1 dòng'
    }

    if (sectionForm.type === 'card') {
        if (Number(sectionForm.card_desktop_columns) < 1 || Number(sectionForm.card_desktop_columns) > 6) {
            return 'Section card chỉ cho phép desktop columns từ 1 đến 6'
        }
        if (Number(sectionForm.card_tablet_columns) < 1 || Number(sectionForm.card_tablet_columns) > 4) {
            return 'Section card chỉ cho phép tablet columns từ 1 đến 4'
        }
        const validCards = sectionForm.card_items.filter((card) => card.icon?.trim() && card.title?.trim() && card.content?.trim())
        if (!validCards.length) return 'Section card cần ít nhất 1 card hợp lệ (icon, title, content)'
    }

    if (sectionForm.type === 'roadmap') {
        const validSteps = sectionForm.roadmap_items.filter((step) => step.title?.trim() && step.content?.trim())
        if (!validSteps.length) return 'Section roadmap cần ít nhất 1 bước hợp lệ (title, content)'
    }

    return null
}

const saveSection = async () => {
    const validationError = validateSection()
    if (validationError) {
        showError(validationError)
        return
    }

    sectionSaving.value = true

    try {
        let imageUrl = sectionForm.image_url.trim()
        let imagePublicId = String(sectionForm.image_cloudinary_public_id || '').trim()

        if ((sectionForm.type === 'paragraph' || sectionForm.type === 'list') && sectionImageMode.value === 'upload' && pendingSectionImageFile.value) {
            sectionImageUploading.value = true
            const uploadResult = await uploadSectionImageToCloudinary(pendingSectionImageFile.value)
            imageUrl = uploadResult.uploadedUrl
            imagePublicId = uploadResult.uploadedPublicId
        }

        const payload = {
            title: sectionForm.title.trim(),
            subtitle: sectionForm.subtitle.trim(),
            description: sectionForm.description.trim(),
            type: sectionForm.type,
            contact_btn_show: Boolean(sectionForm.contact_btn_show),
            contact_btn_text: sectionForm.contact_btn_show ? sectionForm.contact_btn_text.trim() : '',
            paragraph_text: sectionForm.type === 'paragraph' ? sectionForm.paragraph_text : '',
            image_url: (sectionForm.type === 'paragraph' || sectionForm.type === 'list') ? imageUrl : '',
            image_cloudinary_public_id: (sectionForm.type === 'paragraph' || sectionForm.type === 'list') ? imagePublicId : '',
            image_position: (sectionForm.type === 'paragraph' || sectionForm.type === 'list') ? Number(sectionForm.image_position ?? 1) : 1,
            list_icon: sectionForm.type === 'list' ? sectionForm.list_icon.trim() : '',
            list_items: sectionForm.type === 'list' ? parseListItems(sectionForm.list_items_text) : [],
            card_desktop_columns: sectionForm.type === 'card' ? Number(sectionForm.card_desktop_columns || 4) : 4,
            card_tablet_columns: sectionForm.type === 'card' ? Number(sectionForm.card_tablet_columns || 2) : 2,
            card_layout: sectionForm.type === 'card' ? sectionForm.card_layout : 'bg-red',
            card_items: sectionForm.type === 'card'
                ? sectionForm.card_items
                    .map((card) => ({
                        icon: card.icon.trim(),
                        title: card.title.trim(),
                        content: card.content.trim()
                    }))
                    .filter((card) => card.icon && card.title && card.content)
                : [],
            roadmap_items: sectionForm.type === 'roadmap'
                ? sectionForm.roadmap_items
                    .map((step) => ({
                        title: step.title.trim(),
                        content: step.content.trim()
                    }))
                    .filter((step) => step.title && step.content)
                : [],
            sort_order: Number(sectionForm.sort_order || 0),
            is_active: Boolean(sectionForm.is_active)
        }

        const isEditing = isEditingSection.value
        const targetUrl = isEditing
            ? `${API_BASE}/homepage-sections/${editingSectionId.value}`
            : `${API_BASE}/homepage-sections`

        const response = await fetch(targetUrl, {
            method: isEditing ? 'PUT' : 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)

        showSuccess(data?.message || (isEditing ? 'Cập nhật section thành công' : 'Tạo section thành công'))
        await loadSections()
        resetSectionForm()
        showSectionForm.value = false
    } catch (error) {
        showError(error.message || 'Không thể lưu section')
    } finally {
        sectionSaving.value = false
        sectionImageUploading.value = false
    }
}

const removeSection = async (section) => {
    if (!process.client) return

    const accepted = window.confirm(`Bạn có chắc muốn xóa section "${section.title}"?`)
    if (!accepted) return

    sectionSaving.value = true

    try {
        const response = await fetch(`${API_BASE}/homepage-sections/${section.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)

        showSuccess(data?.message || 'Xóa section thành công')
        await loadSections()

        if (editingSectionId.value === section.id) {
            resetSectionForm()
        }
    } catch (error) {
        showError(error.message || 'Không thể xóa section')
    } finally {
        sectionSaving.value = false
    }
}

const validateForm = () => {
    formErrors.title = ''

    const title = (form.title || '').trim()
    if (!title) {
        formErrors.title = 'Tiêu đề trang là bắt buộc'
        return false
    }

    if (title.length < 3) {
        formErrors.title = 'Tiêu đề phải có ít nhất 3 ký tự'
        return false
    }

    return true
}

const applyForm = (data = {}) => {
    const normalized = normalizePayload(data)
    Object.assign(form, normalized)
    snapshot.value = { ...normalized }
}


const loadPageData = async () => {
    loading.value = true
    try {
        const response = await fetch(`${API_BASE}/static-pages/${PAGE_SLUG}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()

        if (!response.ok) {
            if (response.status === 404) {
                applyForm({
                    title: 'Homepage',
                    slug: PAGE_SLUG,
                    hero_title: 'Chào mừng đến với DuhocNB',
                    hero_description: 'Khám phá các dịch vụ và thông tin về DuhocNB.',
                    meta_title: 'Homepage - DuhocNB',
                    meta_description: 'Thông tin về trang chủ của DuhocNB.',
                    type: 'dynamic',
                    status: 'published'
                })
                showWarning('Chưa có dữ liệu trong hệ thống. Đang sử dụng giá trị mặc định.')
                return
            }
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        applyForm(data?.data || {})
    } catch (error) {
        showError(error.message || 'Không thể tải nội dung trang')
    } finally {
        loading.value = false
    }
}

const reloadAllData = async () => {
    await Promise.all([
        loadPageData(),
        loadSections(),
        loadBannerData()
    ])
}

const savePageData = async () => {
    if (!validateForm()) {
        showError('Vui lòng kiểm tra lại thông tin trước khi lưu')
        return
    }

    saving.value = true
    try {
        const payload = {
            title: form.title.trim(),
            hero_title: (form.hero_title || '').trim(),
            hero_description: form.hero_description || '',
            meta_title: (form.meta_title || '').trim(),
            meta_description: form.meta_description || '',
            status: form.status
        }

        const response = await fetch(`${API_BASE}/static-pages/${PAGE_SLUG}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (!response.ok) {
            if (data?.errors?.title) formErrors.title = data.errors.title
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        applyForm(data?.data || payload)
        showSuccess(data?.message || 'Đã lưu nội dung trang homepage thành công')
    } catch (error) {
        showError(error.message || 'Không thể lưu nội dung trang homepage')
    } finally {
        saving.value = false
    }
}

const restoreSnapshot = () => {
    if (!snapshot.value) return
    applyForm(snapshot.value)
    showSuccess('Đã khôi phục về nội dung gần nhất')
}

const previewPublicPage = () => {
    if (process.client) {
        window.open('/', '_blank')
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await reloadAllData()
    }
})
</script>

<style scoped>
.switch-label { display: flex !important; align-items: center; gap: 0.6rem; cursor: pointer; }
.switch-button {

    appearance: none;

    width: 52px;
    height: 28px;

    background: #d1d5db;

    border-radius: 999px;

    cursor: pointer;

    position: relative;

    transition: .25s;

}

.switch-button::before {

    content: "";

    position: absolute;

    width: 22px;
    height: 22px;

    top: 3px;
    left: 3px;

    background: white;

    border-radius: 50%;

    box-shadow:
        0 2px 6px rgba(0,0,0,.15);

    transition: .25s;

}

.switch-button:checked {

    background: #22c55e;

}

.switch-button:checked::before {

    transform: translateX(24px);

}

.switch-button:hover {

    filter: brightness(0.97);

}

.switch-button:disabled {

    opacity: .5;

    cursor: not-allowed;

}
.justify-start {justify-self: start;}
.homepage-content-page {
    padding: 0;
    min-height: 100vh;
}

.permission-check {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 2rem;
}

.loading-permission,
.permission-denied {
    text-align: center;
    max-width: 520px;
    padding: 3rem 2rem;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-permission i {
    font-size: 3rem;
    color: #2196f3;
    margin-bottom: 1rem;
}

.permission-denied i {
    font-size: 3rem;
    color: #f44336;
    margin-bottom: 1rem;
}

.permission-denied h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.4rem;
}

.permission-denied p {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.5;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1.5rem 0;
    border-bottom: 2px solid #eee;
}

.header-content h1 {
    color: #333;
    margin: 0 0 0.5rem;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 2rem;
}

.header-content h1 i {
    color: #1976d2;
}

.header-content p {
    margin: 0;
    color: #666;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.loading-state {
    padding: 3rem 2rem;
    text-align: center;
    color: #666;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.loading-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #2196f3;
}

.form-layout {
    display: grid;
    gap: 1rem;
}

.content-section {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.section-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
}

.section-header h3 {
    margin: 0;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-header p {
    margin: 0.4rem 0 0;
    color: #666;
    font-size: 0.92rem;
}

.form-grid {
    padding: 1.25rem;
    display: grid;
    gap: 1rem;
}

.two-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.form-group label {
    color: #333;
    font-weight: 600;
}

.form-control {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.7rem 0.8rem;
    font-size: 0.95rem;
    color: #333;
    background: #fff;
}

.form-control:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.14);
}

.form-control:disabled {
    background: #f4f5f7;
    color: #777;
}

.form-control.is-invalid {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15);
}

.field-hint {
    color: #6c757d;
    font-size: 0.82rem;
}

.field-error {
    margin: 0;
    color: #dc3545;
    font-size: 0.85rem;
}

.required {
    color: #dc3545;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 0.5rem 0 1rem;
}

.btn {
    padding: 0.75rem 1.1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    font-size: 0.92rem;
}

.btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.btn-primary {
    background: #1976d2;
    color: #fff;
}

.btn-primary:hover:not(:disabled) {
    background: #1565c0;
}

.btn-secondary {
    background: #f0f2f5;
    color: #495057;
}

.btn-secondary:hover:not(:disabled) {
    background: #e7eaef;
}

.btn-outline {
    background: #fff;
    color: #1976d2;
    border: 1px solid #1976d2;
}

.btn-outline:hover:not(:disabled) {
    background: #e8f1fb;
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

.section-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.sections-table-wrapper {
    overflow-x: auto;
}

.sections-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 780px;
}

.sections-table th,
.sections-table td {
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    text-align: left;
    vertical-align: top;
}

.sections-table th {
    color: #355073;
    background: #f8f9fa;
    font-size: 0.86rem;
}

.row-subtitle {
    margin: 0.35rem 0 0;
    color: #6c757d;
    font-size: 0.82rem;
}

.type-badge {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    border: 1px solid #b8c8de;
    background: #f1f6ff;
    color: #2a4870;
    font-size: 0.8rem;
    font-weight: 600;
}

.status-dot {
    font-size: 0.8rem;
    text-transform: uppercase;
    font-weight: 700;
}

.status-dot.active {
    color: #1f8f4d;
}

.status-dot.inactive {
    color: #a54141;
}

.row-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.btn-sm {
    padding: 0.4rem 0.65rem;
    font-size: 0.82rem;
    border-radius: 6px;
}

.btn-danger {
    border-color: #d9534f;
    color: #d9534f;
}

.btn-danger:hover:not(:disabled) {
    background: #ffeaea;
}

.empty-row {
    color: #6c757d;
    text-align: center;
    padding: 1rem !important;
}

.compact-loading {
    padding: 1rem;
}

.compact-placeholder {
    padding: 0.75rem;
}

.section-extra-grid {
    border-top: 1px dashed #e5e7eb;
    /* margin-top: 0.4rem;
    padding-top: 1.25rem; */
}

.checkbox-group {
    justify-content: center;
}

.checkbox-group label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.card-editor-list {
    display: grid;
    gap: 0.75rem;
}

.card-editor-item {
    border: 1px solid #d9e3f2;
    background: #fbfdff;
    border-radius: 8px;
    padding: 0.75rem;
    display: grid;
    gap: 0.6rem;
}

.card-editor-item:has(> .btn-danger:hover) {
    background: #fff2f4;
    border-color: #f3b4bd;
    box-shadow: inset 0 0 0 1px rgba(220, 53, 69, 0.08);
}

.card-editor-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
}

.input-mode-switch {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
}

.mode-btn {
    border: 1px solid #d6dce6;
    background: #fff;
    color: #4a5568;
    border-radius: 8px;
    padding: 0.45rem 0.75rem;
    font-size: 0.9rem;
}

.mode-btn.active {
    border-color: #1976d2;
    background: #eaf3ff;
    color: #1565c0;
}

.hidden-file-input {
    display: none;
}

.upload-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.upload-inline-hint {
    color: #6c757d;
    font-size: 0.85rem;
}

.image-preview-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 0.9rem;
    background: #fafbfc;
}

.image-preview-title {
    margin: 0 0 0.6rem;
    font-weight: 600;
    color: #334155;
}

.image-preview-surface {
    min-height: 190px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 10px;
    background: #fff;
    border: 1px dashed #d7dde8;
}

.image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-preview-empty {
    text-align: center;
    color: #8b95a7;
    padding: 1rem;
}

.image-preview-empty i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.icon-input-with-preview {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.icon-input-with-preview .form-control {
    flex: 1;
}

.icon-preview-chip {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    border: 1px solid #d7dde8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    color: #d32f2f;
    flex: 0 0 auto;
}

.icon-preview-chip i {
    font-size: 1rem;
}

.full-width-block {
    grid-column: 1 / -1;
}

@media (max-width: 992px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .header-actions {
        width: 100%;
        justify-content: flex-start;
    }

    .two-columns {
        grid-template-columns: 1fr;
    }

    .card-editor-row {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .header-content h1 {
        font-size: 1.45rem;
    }

    .form-grid,
    .section-header {
        padding: 1rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>