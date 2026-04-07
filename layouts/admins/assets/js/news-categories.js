// News Categories Management System
class CategoriesManager {
    constructor() {
        this.categories = [
            {
                id: 1,
                name: 'Tin tức',
                slug: 'tin-tuc',
                description: 'Các tin tức chung và thông tin mới nhất',
                color: '#d32f2f',
                postCount: 12,
                status: 'active',
                createdDate: '2024-01-15',
                createdBy: 'Admin',
                order: 1
            },
            {
                id: 2,
                name: 'Luật lệ',
                slug: 'luat-le',
                description: 'Quy định và luật pháp về du học',
                color: '#1976d2',
                postCount: 8,
                status: 'active',
                createdDate: '2024-01-20',
                createdBy: 'Admin',
                order: 2
            },
            {
                id: 3,
                name: 'Sự kiện',
                slug: 'su-kien',
                description: 'Các sự kiện và hoạt động tuyển sinh',
                color: '#388e3c',
                postCount: 5,
                status: 'active',
                createdDate: '2024-02-01',
                createdBy: 'Admin',
                order: 3
            },
            {
                id: 4,
                name: 'Blog',
                slug: 'blog',
                description: 'Chia sẻ kinh nghiệm và câu chuyện du học',
                color: '#f57c00',
                postCount: 15,
                status: 'active',
                createdDate: '2024-02-10',
                createdBy: 'Admin',
                order: 4
            },
            {
                id: 5,
                name: 'Học bổng',
                slug: 'hoc-bong',
                description: 'Thông tin về các chương trình học bổng',
                color: '#7b1fa2',
                postCount: 7,
                status: 'active',
                createdDate: '2024-02-15',
                createdBy: 'Admin',
                order: 5
            },
            {
                id: 6,
                name: 'Thông báo',
                slug: 'thong-bao',
                description: 'Các thông báo quan trọng từ tổ chức',
                color: '#e53935',
                postCount: 3,
                status: 'active',
                createdDate: '2024-03-01',
                createdBy: 'Admin',
                order: 6
            },
            {
                id: 7,
                name: 'Hướng dẫn',
                slug: 'huong-dan',
                description: 'Các bài hướng dẫn thủ tục du học',
                color: '#00acc1',
                postCount: 0,
                status: 'inactive',
                createdDate: '2024-03-15',
                createdBy: 'Admin',
                order: 7
            },
            {
                id: 8,
                name: 'FAQ',
                slug: 'faq',
                description: 'Câu hỏi thường gặp',
                color: '#5d4037',
                postCount: 0,
                status: 'inactive',
                createdDate: '2024-03-20',
                createdBy: 'Admin',
                order: 8
            }
        ];
        
        this.filteredCategories = [...this.categories];
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.currentView = 'table';
        this.sortColumn = 'id';
        this.sortDirection = 'asc';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCategories();
        this.updateStats();
        this.generateSlugFromName();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterCategories();
        });

        // Filter controls
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterCategories();
        });

        document.getElementById('sortFilter').addEventListener('change', (e) => {
            this.sortCategories(e.target.value);
        });

        // Clear filters
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // View toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleView(e.currentTarget.dataset.view);
            });
        });

        // Add category button
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.openAddCategoryModal();
        });

        // Form submission
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });

        // Pagination
        this.setupPagination();

        // Table sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                this.sortCategories(column);
            });
        });

        // Select all checkbox
        document.getElementById('selectAll').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });

        // Bulk actions
        document.getElementById('applyBulkAction').addEventListener('click', () => {
            this.applyBulkAction();
        });

        // Auto-generate slug from name
        document.getElementById('categoryName').addEventListener('input', () => {
            this.generateSlugFromName();
        });

        // Modal action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close')) {
                const modalId = e.target.closest('.modal-overlay').id;
                if (modalId === 'categoryModal') closeCategoryModal();
                else if (modalId === 'addEditCategoryModal') closeAddEditCategoryModal();
                else if (modalId === 'confirmModal') closeConfirmModal();
            }
        });
    }

    filterCategories() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;

        this.filteredCategories = this.categories.filter(category => {
            const matchesSearch = category.name.toLowerCase().includes(searchTerm) ||
                                category.description.toLowerCase().includes(searchTerm) ||
                                category.slug.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || category.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        this.currentPage = 1;
        this.renderCategories();
    }

    sortCategories(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.filteredCategories.sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];

            if (column === 'createdDate') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            }

            if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.renderCategories();
        this.updateSortIcons();
    }

    updateSortIcons() {
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });

        const currentHeader = document.querySelector(`[data-sort="${this.sortColumn}"] i`);
        if (currentHeader) {
            currentHeader.className = `fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'}`;
        }
    }

    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('sortFilter').value = 'name';
        
        this.filteredCategories = [...this.categories];
        this.currentPage = 1;
        this.renderCategories();
    }

    toggleView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Toggle view containers
        document.getElementById('tableView').style.display = view === 'table' ? 'block' : 'none';
        document.getElementById('gridView').style.display = view === 'grid' ? 'block' : 'none';

        this.renderCategories();
    }

    renderCategories() {
        if (this.currentView === 'table') {
            this.renderTableView();
        } else {
            this.renderGridView();
        }
        this.updatePagination();
    }

    renderTableView() {
        const tbody = document.getElementById('categoriesTableBody');
        const startIndex = (this.currentPage - 1) * this.rowsPerPage;
        const endIndex = startIndex + this.rowsPerPage;
        const paginatedCategories = this.filteredCategories.slice(startIndex, endIndex);

        if (paginatedCategories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">Không có dữ liệu</td></tr>';
            return;
        }

        tbody.innerHTML = paginatedCategories.map(category => `
            <tr>
                <td><input type="checkbox" name="selectedCategories" value="${category.id}"></td>
                <td>#${category.id}</td>
                <td>
                    <div class="category-info">
                        <span class="category-name-colored" style="background-color: ${category.color}; color: white;">
                            ${category.name}
                        </span>
                    </div>
                </td>
                <td><code>${category.slug}</code></td>
                <td class="description-cell">${category.description}</td>
                <td>
                    <span class="post-count-badge">${category.postCount}</span>
                </td>
                <td>${this.formatDate(category.createdDate)}</td>
                <td>
                    <span class="status-badge ${category.status}">
                        <i class="fas ${category.status === 'active' ? 'fa-eye' : 'fa-eye-slash'}"></i>
                        ${category.status === 'active' ? 'Hiển thị' : 'Tạm ẩn'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="window.categoriesManager.viewCategory(${category.id})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="window.categoriesManager.editCategory(${category.id})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="window.categoriesManager.deleteCategory(${category.id})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    renderGridView() {
        const grid = document.getElementById('categoriesGrid');
        const startIndex = (this.currentPage - 1) * this.rowsPerPage;
        const endIndex = startIndex + this.rowsPerPage;
        const paginatedCategories = this.filteredCategories.slice(startIndex, endIndex);

        if (paginatedCategories.length === 0) {
            grid.innerHTML = '<div class="grid-empty">Không có dữ liệu</div>';
            return;
        }

        grid.innerHTML = paginatedCategories.map(category => `
            <div class="category-card">
                <div class="category-card-header" style="border-left-color: ${category.color};">
                    <div class="category-info">
                        <h4>${category.name}</h4>
                        <p class="category-slug">${category.slug}</p>
                    </div>
                    <div class="category-status">
                        <span class="status-badge ${category.status}">
                            <i class="fas ${category.status === 'active' ? 'fa-eye' : 'fa-eye-slash'}"></i>
                        </span>
                    </div>
                </div>
                
                <div class="category-card-body">
                    <p class="category-description">${category.description}</p>
                    
                    <div class="category-stats">
                        <div class="stat-item">
                            <span class="stat-number">${category.postCount}</span>
                            <span class="stat-label">Bài viết</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-date">${this.formatDate(category.createdDate)}</span>
                            <span class="stat-label">Ngày tạo</span>
                        </div>
                    </div>
                </div>
                
                <div class="category-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="window.categoriesManager.viewCategory(${category.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    <button class="btn btn-sm btn-success" onclick="window.categoriesManager.editCategory(${category.id})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.categoriesManager.deleteCategory(${category.id})" title="Xóa">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupPagination() {
        document.getElementById('rowsPerPage').addEventListener('change', (e) => {
            this.rowsPerPage = e.target.value === 'all' ? this.filteredCategories.length : parseInt(e.target.value);
            this.currentPage = 1;
            this.renderCategories();
        });

        document.getElementById('firstPage').addEventListener('click', () => {
            this.goToPage(1);
        });

        document.getElementById('prevPage').addEventListener('click', () => {
            if (this.currentPage > 1) this.goToPage(this.currentPage - 1);
        });

        document.getElementById('nextPage').addEventListener('click', () => {
            const maxPage = Math.ceil(this.filteredCategories.length / this.rowsPerPage);
            if (this.currentPage < maxPage) this.goToPage(this.currentPage + 1);
        });

        document.getElementById('lastPage').addEventListener('click', () => {
            const maxPage = Math.ceil(this.filteredCategories.length / this.rowsPerPage);
            this.goToPage(maxPage);
        });
    }

    updatePagination() {
        const maxPage = Math.ceil(this.filteredCategories.length / this.rowsPerPage);
        const startRecord = (this.currentPage - 1) * this.rowsPerPage + 1;
        const endRecord = Math.min(this.currentPage * this.rowsPerPage, this.filteredCategories.length);

        document.getElementById('paginationInfoBottom').textContent = 
            `Hiển thị ${startRecord}-${endRecord} của ${this.filteredCategories.length} bản ghi`;

        // Update pagination buttons
        document.getElementById('firstPage').disabled = this.currentPage === 1;
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === maxPage || maxPage === 0;
        document.getElementById('lastPage').disabled = this.currentPage === maxPage || maxPage === 0;

        // Generate page numbers
        this.generatePageNumbers(maxPage);
    }

    generatePageNumbers(maxPage) {
        const container = document.getElementById('paginationNumbers');
        const pageNumbers = [];

        if (maxPage <= 7) {
            for (let i = 1; i <= maxPage; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (this.currentPage > 4) pageNumbers.push('...');
            
            const start = Math.max(2, this.currentPage - 2);
            const end = Math.min(maxPage - 1, this.currentPage + 2);
            
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }
            
            if (this.currentPage < maxPage - 3) pageNumbers.push('...');
            if (maxPage > 1) pageNumbers.push(maxPage);
        }

        container.innerHTML = pageNumbers.map(page => {
            if (page === '...') {
                return '<span class="pagination-ellipsis">...</span>';
            }
            return `<button class="pagination-btn ${page === this.currentPage ? 'active' : ''}" onclick="window.categoriesManager.goToPage(${page})">${page}</button>`;
        }).join('');
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderCategories();
    }

    updateStats() {
        const totalCategories = this.categories.length;
        const activeCategories = this.categories.filter(c => c.status === 'active').length;
        const inactiveCategories = totalCategories - activeCategories;

        document.querySelector('.stats-summary .stat-item:nth-child(1) .stat-number').textContent = totalCategories;
        document.querySelector('.stats-summary .stat-item:nth-child(2) .stat-number').textContent = activeCategories;
        document.querySelector('.stats-summary .stat-item:nth-child(3) .stat-number').textContent = inactiveCategories;
    }

    // Modal functions
    openAddCategoryModal() {
        document.getElementById('addEditModalTitle').textContent = 'Thêm Danh Mục Mới';
        document.getElementById('categoryForm').reset();
        const modal = document.getElementById('addEditCategoryModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        document.getElementById('categoryForm').dataset.mode = 'add';
    }

    viewCategory(id) {
        console.log('viewCategory called with id:', id);
        const category = this.categories.find(c => c.id === id);
        if (!category) {
            console.error('Category not found with id:', id);
            return;
        }

        console.log('Found category:', category);

        document.getElementById('modalCategoryName').textContent = category.name;
        document.getElementById('modalCreatedBy').textContent = category.createdBy;
        document.getElementById('modalCreatedDate').textContent = this.formatDate(category.createdDate);
        document.getElementById('modalStatus').textContent = category.status === 'active' ? 'Hiển thị' : 'Tạm ẩn';
        document.getElementById('modalStatus').className = `status-badge ${category.status}`;
        document.getElementById('modalPostCount').textContent = `${category.postCount} bài viết`;
        document.getElementById('modalNameText').textContent = category.name;
        document.getElementById('modalSlugText').textContent = category.slug;
        document.getElementById('modalColorBox').style.backgroundColor = category.color;
        document.getElementById('modalColorText').textContent = category.color;
        document.getElementById('modalOrderText').textContent = category.order;
        document.getElementById('modalPostCountText').textContent = category.postCount;
        document.getElementById('modalDateText').textContent = this.formatDate(category.createdDate);
        document.getElementById('modalDescription').textContent = category.description;

        const modal = document.getElementById('categoryModal');
        modal.style.display = 'flex';
        modal.dataset.categoryId = id;
        setTimeout(() => modal.classList.add('show'), 10);
    }

    editCategory(id) {
        const category = this.categories.find(c => c.id === id);
        if (!category) return;

        document.getElementById('addEditModalTitle').textContent = 'Chỉnh Sửa Danh Mục';
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categorySlug').value = category.slug;
        document.getElementById('categoryDescription').value = category.description;
        document.getElementById('categoryColor').value = category.color;
        document.getElementById('categoryStatus').value = category.status;
        document.getElementById('categoryOrder').value = category.order;

        const modal = document.getElementById('addEditCategoryModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        document.getElementById('categoryForm').dataset.mode = 'edit';
        document.getElementById('categoryForm').dataset.categoryId = id;
    }

    deleteCategory(id) {
        const category = this.categories.find(c => c.id === id);
        if (!category) return;

        document.getElementById('confirmTitle').textContent = 'Xác nhận xóa';
        document.getElementById('confirmMessage').textContent = `Bạn có chắc chắn muốn xóa danh mục "${category.name}"? Hành động này không thể hoàn tác.`;
        const modal = document.getElementById('confirmModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        
        document.getElementById('confirmBtn').onclick = () => {
            this.categories = this.categories.filter(c => c.id !== id);
            this.filterCategories();
            this.updateStats();
            this.closeConfirmModal();
            this.showNotification('Xóa danh mục thành công!', 'success');
        };
    }

    saveCategory() {
        const form = document.getElementById('categoryForm');
        const formData = new FormData(form);
        const mode = form.dataset.mode;
        
        const categoryData = {
            name: formData.get('name'),
            slug: formData.get('slug') || this.generateSlug(formData.get('name')),
            description: formData.get('description'),
            color: formData.get('color'),
            status: formData.get('status'),
            order: parseInt(formData.get('order'))
        };

        if (mode === 'add') {
            categoryData.id = Math.max(...this.categories.map(c => c.id)) + 1;
            categoryData.postCount = 0;
            categoryData.createdDate = new Date().toISOString().split('T')[0];
            categoryData.createdBy = 'Admin';
            
            this.categories.push(categoryData);
            this.showNotification('Thêm danh mục thành công!', 'success');
        } else {
            const id = parseInt(form.dataset.categoryId);
            const index = this.categories.findIndex(c => c.id === id);
            if (index !== -1) {
                this.categories[index] = { ...this.categories[index], ...categoryData };
                this.showNotification('Cập nhật danh mục thành công!', 'success');
            }
        }

        this.closeAddEditCategoryModal();
        this.filterCategories();
        this.updateStats();
    }

    generateSlug(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    generateSlugFromName() {
        const nameField = document.getElementById('categoryName');
        const slugField = document.getElementById('categorySlug');
        
        if (nameField && slugField && nameField.value) {
            slugField.value = this.generateSlug(nameField.value);
        }
    }

    // Helper functions
    formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Bulk actions
    toggleSelectAll(checked) {
        document.querySelectorAll('input[name="selectedCategories"]').forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateBulkActions();
    }

    updateBulkActions() {
        const selected = document.querySelectorAll('input[name="selectedCategories"]:checked').length;
        const bulkAction = document.getElementById('bulkAction');
        const applyBtn = document.getElementById('applyBulkAction');
        
        bulkAction.disabled = selected === 0;
        applyBtn.disabled = selected === 0;
    }

    applyBulkAction() {
        const action = document.getElementById('bulkAction').value;
        const selected = Array.from(document.querySelectorAll('input[name="selectedCategories"]:checked'))
            .map(cb => parseInt(cb.value));

        if (!action || selected.length === 0) return;

        let message = '';
        switch(action) {
            case 'activate':
                selected.forEach(id => {
                    const category = this.categories.find(c => c.id === id);
                    if (category) category.status = 'active';
                });
                message = `Đã kích hoạt ${selected.length} danh mục`;
                break;
            case 'deactivate':
                selected.forEach(id => {
                    const category = this.categories.find(c => c.id === id);
                    if (category) category.status = 'inactive';
                });
                message = `Đã tạm ẩn ${selected.length} danh mục`;
                break;
            case 'delete':
                this.categories = this.categories.filter(c => !selected.includes(c.id));
                message = `Đã xóa ${selected.length} danh mục`;
                break;
        }

        this.filterCategories();
        this.updateStats();
        this.showNotification(message, 'success');
        document.getElementById('selectAll').checked = false;
        this.updateBulkActions();
    }
}

// Modal control functions
function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

function closeAddEditCategoryModal() {
    const modal = document.getElementById('addEditCategoryModal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.categoriesManager = new CategoriesManager();
});