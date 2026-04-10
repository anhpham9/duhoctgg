/**
 * Users Management JavaScript
 * Handles table functionality, filtering, pagination, sorting
 */

// Sample users data (reduced from 30 to 8 entries)
const SAMPLE_USERS = [
    { id: 1, name: 'Nguyễn Văn An', username: 'admin', email: 'admin@duhocnb.com', phone: '0123456789', zalo: '0123456789', facebook: 'facebook.com/admin', role: 'admin', status: 'active', created: '2024-01-15', avatar: 'assets/images/av.png' },
    { id: 2, name: 'Trần Thị Bích', username: 'manager01', email: 'bich.tran@duhocnb.com', phone: '0123456789', zalo: '0123456789', facebook: 'facebook.com/manager01', role: 'manager', status: 'active', created: '2024-01-20', avatar: 'assets/images/av.png' },
    { id: 3, name: 'Lê Văn Cường', username: 'consultant01', email: 'cuong.le@duhocnb.com', phone: '0123456789', zalo: '0123456789', facebook: 'facebook.com/consultant01', role: 'consultant', status: 'active', created: '2024-02-01', avatar: 'assets/images/av.png' },
    { id: 4, name: 'Phạm Thị Dung', username: 'content_writer01', email: 'dung.pham@email.com', phone: '0123456789', zalo: '0123456789', facebook: 'facebook.com/content_writer01', role: 'content_writer', status: 'pending', created: '2024-02-10', avatar: 'assets/images/av.png' },
    { id: 5, name: 'Hoàng Văn Em', username: 'content_writer02', email: 'em.hoang@email.com', phone: '0123456789', zalo: '0123456789', facebook: 'facebook.com/content_writer02', role: 'content_writer', status: 'active', created: '2024-02-15', avatar: 'assets/images/av.png' },
    { id: 6, name: 'Vũ Thị Phương', username: 'consultant02', email: 'phuong.vu@duhocnb.com', phone: '0123456789', zalo: '0123456789', facebook: 'facebook.com/consultant02', role: 'consultant', status: 'inactive', created: '2024-02-20', avatar: 'assets/images/av.png' },
    { id: 7, name: 'Đỗ Văn Giang', username: 'content_writer03', email: 'giang.do@email.com', phone: '0123456789', zalo: '0123456789', facebook: 'facebook.com/content_writer03', role: 'content_writer', status: 'active', created: '2024-03-01', avatar: 'assets/images/av.png' },
    { id: 8, name: 'Ngô Thị Hậu', username: 'manager02', email: 'hau.ngo@duhocnb.com', phone: '0123456789', zalo: '0123456789', facebook: 'facebook.com/manager02', role: 'manager', status: 'active', created: '2024-03-05', avatar: 'assets/images/av.png' }
];

// Table state management
let currentUsers = [...SAMPLE_USERS];
let filteredUsers = [...SAMPLE_USERS];
let currentPage = 1;
let rowsPerPage = 10;
let sortColumn = '';
let sortDirection = 'asc';

// DOM elements
let searchInput, roleFilter, statusFilter, rowsPerPageSelect;
let usersTableBody, paginationInfo, paginationNumbers;
let tableLoading, tableEmpty;
let firstPageBtn, prevPageBtn, nextPageBtn, lastPageBtn;

document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    renderTable();
    
    // Modal event listeners
    const modal = document.getElementById('userDetailModal');
    const closeBtn = document.getElementById('userDetailClose');
    const cancelBtn = document.getElementById('userDetailCancel');
    
    // Close modal events
    closeBtn?.addEventListener('click', closeUserDetailModal);
    cancelBtn?.addEventListener('click', closeUserDetailModal);
    
    // Click outside modal to close
    modal?.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeUserDetailModal();
        }
    });
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal.classList.contains('show')) {
                closeUserDetailModal();
            }
            const deleteModal = document.getElementById('deleteConfirmModal');
            if (deleteModal && deleteModal.classList.contains('show')) {
                closeDeleteConfirmModal();
            }
        }
    });
    
    // Delete confirmation modal event listeners
    const deleteModal = document.getElementById('deleteConfirmModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    cancelDeleteBtn?.addEventListener('click', closeDeleteConfirmModal);
    confirmDeleteBtn?.addEventListener('click', confirmUserDeletion);
    
    // Click outside delete modal to close
    deleteModal?.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            closeDeleteConfirmModal();
        }
    });
});

function initializeElements() {
    // Filter elements
    searchInput = document.getElementById('searchInput');
    roleFilter = document.getElementById('roleFilter');
    statusFilter = document.getElementById('statusFilter');
    rowsPerPageSelect = document.getElementById('rowsPerPage');
    
    // Table elements
    usersTableBody = document.getElementById('usersTableBody');
    paginationInfo = document.getElementById('paginationInfo');
    paginationNumbers = document.getElementById('paginationNumbers');
    
    // State elements
    tableLoading = document.getElementById('tableLoading');
    tableEmpty = document.getElementById('tableEmpty');
    
    // Pagination buttons
    firstPageBtn = document.getElementById('firstPage');
    prevPageBtn = document.getElementById('prevPage');
    nextPageBtn = document.getElementById('nextPage');
    lastPageBtn = document.getElementById('lastPage');
}

function initializeEventListeners() {
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', debounceSearch);
    }
    
    // Filter selects
    if (roleFilter) {
        roleFilter.addEventListener('change', applyFilters);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    // Rows per page
    if (rowsPerPageSelect) {
        rowsPerPageSelect.addEventListener('change', handleRowsPerPageChange);
    }
    
    // Clear filters
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }
    
    // Sortable headers
    const sortableHeaders = document.querySelectorAll('th.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => handleSort(header));
    });
    
    // Pagination buttons
    if (firstPageBtn) firstPageBtn.addEventListener('click', () => goToPage(1));
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
    if (lastPageBtn) lastPageBtn.addEventListener('click', () => goToPage(getTotalPages()));
}

// Search with debounce
const debounceSearch = debounce(() => {
    applyFilters();
}, 300);

function applyFilters() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const roleValue = roleFilter?.value || '';
    const statusValue = statusFilter?.value || '';
    
    filteredUsers = currentUsers.filter(user => {
        const matchesSearch = !searchTerm || 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.username.toLowerCase().includes(searchTerm) ||
            user.phone.toLowerCase().includes(searchTerm) ||
            user.zalo.toLowerCase().includes(searchTerm) ||
            user.facebook.toLowerCase().includes(searchTerm);
            
        const matchesRole = !roleValue || user.role === roleValue;
        const matchesStatus = !statusValue || user.status === statusValue;
        
        return matchesSearch && matchesRole && matchesStatus;
    });
    
    currentPage = 1; // Reset to first page
    renderTable();
}

function handleRowsPerPageChange() {
    const value = rowsPerPageSelect.value;
    rowsPerPage = value === 'all' ? filteredUsers.length : parseInt(value);
    currentPage = 1;
    renderTable();
}

function clearAllFilters() {
    if (searchInput) searchInput.value = '';
    if (roleFilter) roleFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    
    filteredUsers = [...currentUsers];
    currentPage = 1;
    renderTable();
    
    // Show notification if available
    if (typeof showNotification === 'function') {
        showNotification('Đã xóa tất cả bộ lọc', 'success');
    }
}

function handleSort(header) {
    const column = header.dataset.sort;
    
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    // Update header classes
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    header.classList.add(`sort-${sortDirection}`);
    
    // Sort the filtered data
    filteredUsers.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        // Handle different data types
        if (column === 'id') {
            aVal = parseInt(aVal);
            bVal = parseInt(bVal);
        } else if (column === 'created') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        } else {
            aVal = aVal.toString().toLowerCase();
            bVal = bVal.toString().toLowerCase();
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    renderTable();
}

function getTotalPages() {
    if (rowsPerPage === filteredUsers.length) return 1;
    return Math.ceil(filteredUsers.length / rowsPerPage);
}

function renderTable() {
    if (filteredUsers.length === 0) {
        showEmptyState();
        return;
    }
    
    populateTable();
    updatePagination();
    showLoading(false);
}

function populateTable() {
    if (!usersTableBody) return;
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = rowsPerPage === filteredUsers.length ? 
        filteredUsers.length : 
        Math.min(startIndex + rowsPerPage, filteredUsers.length);
    
    const pageUsers = filteredUsers.slice(startIndex, endIndex);
    
    usersTableBody.innerHTML = pageUsers.map(user => `
        <tr data-user-id="${user.id}">
            <td>
                <input type="checkbox" class="user-checkbox" value="${user.id}">
            </td>
            <td>${user.id}</td>
            <td>
                <img src="${user.avatar}" alt="${user.name}" class="user-avatar" 
                     onerror="this.src='assets/images/av.png'">
            </td>
            <td>
                <div class="user-info">
                    <div class="user-details">
                        <h4>${user.name}</h4>
                    </div>
                </div>
            </td>
            <td class="username-cell">${user.username}</td>
            <td>${user.email}</td>
            <td>
                <span class="role-badge ${user.role}">${getRoleText(user.role)}</span>
            </td>
            <td>
                <span class="status-badge ${user.status}">${getStatusText(user.status)}</span>
            </td>
            <td class="date-cell">${formatDate(user.created)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewUser(${user.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editUser(${user.id})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteUser(${user.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners for checkboxes
    const checkboxes = document.querySelectorAll('.user-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectAllState);
    });
}

function updatePagination() {
    const totalPages = getTotalPages();
    const startIndex = (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(currentPage * rowsPerPage, filteredUsers.length);
    
    // Update pagination info
    if (paginationInfo) {
        paginationInfo.textContent = `Hiển thị ${startIndex}-${endIndex} của ${filteredUsers.length} bản ghi`;
    }
    
    // Update pagination buttons state
    if (firstPageBtn) firstPageBtn.disabled = currentPage === 1;
    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
    if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages;
    
    // Render page numbers
    renderPaginationNumbers(totalPages);
}

function renderPaginationNumbers(totalPages) {
    if (!paginationNumbers) return;
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    let paginationHTML = '';
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">${i}</button>
        `;
    }
    
    paginationNumbers.innerHTML = paginationHTML;
}

function goToPage(page) {
    const totalPages = getTotalPages();
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderTable();
}

function showLoading(show) {
    if (tableLoading) {
        tableLoading.style.display = show ? 'block' : 'none';
    }
    if (usersTableBody && usersTableBody.parentElement.parentElement) {
        usersTableBody.parentElement.parentElement.style.display = show ? 'none' : 'block';
    }
    if (tableEmpty) {
        tableEmpty.style.display = 'none';
    }
}

function showEmptyState() {
    if (tableLoading) tableLoading.style.display = 'none';
    if (tableEmpty) tableEmpty.style.display = 'block';
    if (usersTableBody && usersTableBody.parentElement.parentElement) {
        usersTableBody.parentElement.parentElement.style.display = 'none';
    }
    if (paginationInfo) {
        paginationInfo.textContent = 'Hiển thị 0-0 của 0 bản ghi';
    }
}

function handleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    
    userCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    const checkedBoxes = document.querySelectorAll('.user-checkbox:checked');
    
    if (checkedBoxes.length === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedBoxes.length === userCheckboxes.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
    }
}

// Utility functions
function getRoleText(role) {
    const roleTexts = {
        'admin': 'Admin',
        'manager': 'Manager', 
        'content_writer': 'Viết tin tức',
        'consultant': 'Tư vấn viên'
    };
    return roleTexts[role] || role;
}

function getStatusText(status) {
    const statusTexts = {
        'active': 'Đang hoạt động',
        'inactive': 'Tạm khóa',
        'pending': 'Chờ duyệt'
    };
    return statusTexts[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit'
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// User Detail Modal Management
function viewUser(userId) {
    const user = SAMPLE_USERS.find(u => u.id === parseInt(userId));
    if (!user) {
        console.error('User not found:', userId);
        return;
    }
    
    openUserDetailModal(user);
}

function openUserDetailModal(user) {
    const modal = document.getElementById('userDetailModal');
    const loading = document.getElementById('userDetailLoading');
    const content = document.getElementById('userDetailContent');
    
    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Show loading
    loading.style.display = 'block';
    content.style.display = 'none';
    
    // Simulate loading delay (remove in production)
    setTimeout(() => {
        populateUserDetail(user);
        loading.style.display = 'none';
        content.style.display = 'block';
    }, 500);
}

function populateUserDetail(user) {
    // Populate avatar
    const avatar = document.getElementById('detailAvatar');
    avatar.src = user.avatar;
    avatar.alt = user.name;
    avatar.onerror = function() { this.src = 'assets/images/av.png'; };
    
    // Populate basic info
    document.getElementById('detailId').textContent = user.id;
    document.getElementById('detailName').textContent = user.name;
    document.getElementById('detailUsername').textContent = user.username;
    document.getElementById('detailEmail').textContent = user.email;
    
    // Check if phone, zalo, facebook fields exist before populating
    const phoneElement = document.getElementById('detailPhone');
    if (phoneElement) phoneElement.textContent = user.phone || '';
    
    const zaloElement = document.getElementById('detailZalo');
    if (zaloElement) zaloElement.textContent = user.zalo || '';
    
    const facebookElement = document.getElementById('detailFacebook');
    if (facebookElement) facebookElement.textContent = user.facebook || '';
    
    // Populate role with styling
    const roleElement = document.getElementById('detailRole');
    roleElement.textContent = getRoleText(user.role);
    roleElement.className = `role-badge ${user.role}`;
    
    // Populate status with styling
    const statusElement = document.getElementById('detailStatus');
    statusElement.textContent = getStatusText(user.status);
    statusElement.className = `status-badge ${user.status}`;
    
    // Populate created date
    document.getElementById('detailCreated').textContent = formatDate(user.created);
    
    // Setup edit button
    const editButton = document.getElementById('userDetailEdit');
    editButton.onclick = () => {
        closeUserDetailModal();
        editUser(user.id);
    };
}

function closeUserDetailModal() {
    const modal = document.getElementById('userDetailModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Delete Confirmation Modal Management
let userToDelete = null;

function deleteUser(userId) {
    const user = SAMPLE_USERS.find(u => u.id === parseInt(userId));
    if (!user) {
        console.error('User not found:', userId);
        return;
    }
    
    openDeleteConfirmModal(user);
}

function openDeleteConfirmModal(user) {
    userToDelete = user;
    const modal = document.getElementById('deleteConfirmModal');
    const userNameElement = document.getElementById('deleteUserName');
    
    // Set user name in modal
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
    
    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function confirmUserDeletion() {
    if (!userToDelete) return;
    
    // Remove user from arrays
    const userIndex = currentUsers.findIndex(u => u.id === userToDelete.id);
    if (userIndex > -1) {
        currentUsers.splice(userIndex, 1);
    }
    
    const filteredIndex = filteredUsers.findIndex(u => u.id === userToDelete.id);
    if (filteredIndex > -1) {
        filteredUsers.splice(filteredIndex, 1);
    }
    
    // Show success notification if available
    if (typeof showToast === 'function') {
        showToast(`Đã xóa người dùng "${userToDelete.name}" thành công`, 'success');
    } else if (typeof showNotification === 'function') {
        showNotification(`Đã xóa người dùng "${userToDelete.name}" thành công`, 'success');
    }
    
    console.log(`User deleted: ${userToDelete.id}`);
    
    // Close modal and refresh table
    closeDeleteConfirmModal();
    renderTable();
    
    // Clear reference
    userToDelete = null;
}

function closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    userToDelete = null;
}

function editUser(userId) {
    console.log('Edit user:', userId);
    // Implementation for edit user functionality
}
