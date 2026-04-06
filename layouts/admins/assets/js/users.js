/**
 * Users Management JavaScript
 * Handles table functionality, filtering, pagination, sorting
 */

// Sample users data
const SAMPLE_USERS = [
    { id: 1, name: 'Nguyễn Văn An', username: 'admin', email: 'admin@duhocnb.com', role: 'admin', status: 'active', created: '2024-01-15', avatar: 'assets/images/av.png' },
    { id: 2, name: 'Trần Thị Bích', username: 'manager01', email: 'bich.tran@duhocnb.com', role: 'manager', status: 'active', created: '2024-01-20', avatar: 'assets/images/av.png' },
    { id: 3, name: 'Lê Văn Cường', username: 'staff01', email: 'cuong.le@duhocnb.com', role: 'staff', status: 'active', created: '2024-02-01', avatar: 'assets/images/av.png' },
    { id: 4, name: 'Phạm Thị Dung', username: 'student01', email: 'dung.pham@email.com', role: 'student', status: 'pending', created: '2024-02-10', avatar: 'assets/images/av.png' },
    { id: 5, name: 'Hoàng Văn Em', username: 'student02', email: 'em.hoang@email.com', role: 'student', status: 'active', created: '2024-02-15', avatar: 'assets/images/av.png' },
    { id: 6, name: 'Vũ Thị Phương', username: 'staff02', email: 'phuong.vu@duhocnb.com', role: 'staff', status: 'inactive', created: '2024-02-20', avatar: 'assets/images/av.png' },
    { id: 7, name: 'Đỗ Văn Giang', username: 'student03', email: 'giang.do@email.com', role: 'student', status: 'active', created: '2024-03-01', avatar: 'assets/images/av.png' },
    { id: 8, name: 'Ngô Thị Hậu', username: 'manager02', email: 'hau.ngo@duhocnb.com', role: 'manager', status: 'active', created: '2024-03-05', avatar: 'assets/images/av.png' },
    { id: 9, name: 'Bùi Văn Ích', username: 'student04', email: 'ich.bui@email.com', role: 'student', status: 'pending', created: '2024-03-10', avatar: 'assets/images/av.png' },
    { id: 10, name: 'Tô Thị Kim', username: 'staff03', email: 'kim.to@duhocnb.com', role: 'staff', status: 'active', created: '2024-03-15', avatar: 'assets/images/av.png' },
    { id: 11, name: 'Lý Văn Long', username: 'student05', email: 'long.ly@email.com', role: 'student', status: 'active', created: '2024-03-20', avatar: 'assets/images/av.png' },
    { id: 12, name: 'Mai Thị Minh', username: 'student06', email: 'minh.mai@email.com', role: 'student', status: 'inactive', created: '2024-03-25', avatar: 'assets/images/av.png' },
    { id: 13, name: 'Chu Văn Nam', username: 'student07', email: 'nam.chu@email.com', role: 'student', status: 'active', created: '2024-04-01', avatar: 'assets/images/av.png' },
    { id: 14, name: 'Đinh Thị Oanh', username: 'staff04', email: 'oanh.dinh@duhocnb.com', role: 'staff', status: 'active', created: '2024-04-05', avatar: 'assets/images/av.png' },
    { id: 15, name: 'Hà Văn Phúc', username: 'student08', email: 'phuc.ha@email.com', role: 'student', status: 'pending', created: '2024-04-05', avatar: 'assets/images/av.png' },
    { id: 16, name: 'Trịnh Thị Quỳnh', username: 'manager03', email: 'quynh.trinh@duhocnb.com', role: 'manager', status: 'active', created: '2024-01-10', avatar: 'assets/images/av.png' },
    { id: 17, name: 'Đặng Văn Rạng', username: 'student09', email: 'rang.dang@email.com', role: 'student', status: 'active', created: '2024-01-25', avatar: 'assets/images/av.png' },
    { id: 18, name: 'Cao Thị Sen', username: 'staff05', email: 'sen.cao@duhocnb.com', role: 'staff', status: 'inactive', created: '2024-02-05', avatar: 'assets/images/av.png' },
    { id: 19, name: 'Phan Văn Tài', username: 'student10', email: 'tai.phan@email.com', role: 'student', status: 'active', created: '2024-02-18', avatar: 'assets/images/av.png' },
    { id: 20, name: 'Võ Thị Uyên', username: 'student11', email: 'uyen.vo@email.com', role: 'student', status: 'pending', created: '2024-03-08', avatar: 'assets/images/av.png' },
    { id: 21, name: 'Lưu Văn Việt', username: 'student12', email: 'viet.luu@email.com', role: 'student', status: 'active', created: '2024-03-18', avatar: 'assets/images/av.png' },
    { id: 22, name: 'Dương Thị Xuân', username: 'staff06', email: 'xuan.duong@duhocnb.com', role: 'staff', status: 'active', created: '2024-03-28', avatar: 'assets/images/av.png' },
    { id: 23, name: 'Kiều Văn Yên', username: 'student13', email: 'yen.kieu@email.com', role: 'student', status: 'active', created: '2024-04-02', avatar: 'assets/images/av.png' },
    { id: 24, name: 'Thái Thị Zung', username: 'student14', email: 'zung.thai@email.com', role: 'student', status: 'inactive', created: '2024-04-04', avatar: 'assets/images/av.png' },
    { id: 25, name: 'Huỳnh Văn Anh', username: 'student15', email: 'anh.huynh@email.com', role: 'student', status: 'pending', created: '2024-04-06', avatar: 'assets/images/av.png' },
    { id: 26, name: 'Lại Thị Bảo', username: 'manager04', email: 'bao.lai@duhocnb.com', role: 'manager', status: 'active', created: '2024-01-08', avatar: 'assets/images/av.png' },
    { id: 27, name: 'Ông Văn Công', username: 'staff07', email: 'cong.ong@duhocnb.com', role: 'staff', status: 'active', created: '2024-01-30', avatar: 'assets/images/av.png' },
    { id: 28, name: 'Tôn Thị Đào', username: 'student16', email: 'dao.ton@email.com', role: 'student', status: 'active', created: '2024-02-12', avatar: 'assets/images/av.png' },
    { id: 29, name: 'Lâm Văn Ế', username: 'student17', email: 'e.lam@email.com', role: 'student', status: 'inactive', created: '2024-02-22', avatar: 'assets/images/av.png' },
    { id: 30, name: 'Ứng Thị Phượng', username: 'staff08', email: 'phuong.ung@duhocnb.com', role: 'staff', status: 'active', created: '2024-03-12', avatar: 'assets/images/av.png' }
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
    
    // Add user button
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', handleAddUser);
    }
    
    // Export button  
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
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
            user.username.toLowerCase().includes(searchTerm);
            
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
    
    showNotification('Đã xóa tất cả bộ lọc', 'success');
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
    showLoading(true);
    
    setTimeout(() => {
        if (filteredUsers.length === 0) {
            showEmptyState();
            return;
        }
        
        populateTable();
        updatePagination();
        showLoading(false);
    }, 500); // Simulate loading delay
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
        'staff': 'Staff',
        'student': 'Học sinh'
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

// Action handlers
function viewUser(userId) {
    const user = filteredUsers.find(u => u.id === userId);
    if (user) {
        showNotification(`Xem chi tiết người dùng: ${user.name}`, 'info');
        // In real app: navigate to user detail page
    }
}

function editUser(userId) {
    const user = filteredUsers.find(u => u.id === userId);
    if (user) {
        showNotification(`Chỉnh sửa người dùng: ${user.name}`, 'info');
        // In real app: open edit modal or navigate to edit page
    }
}

function deleteUser(userId) {
    const user = filteredUsers.find(u => u.id === userId);
    if (user && confirm(`Bạn có chắc muốn xóa người dùng "${user.name}"?`)) {
        // Remove from data
        currentUsers = currentUsers.filter(u => u.id !== userId);
        applyFilters(); // Re-apply filters and re-render
        showNotification(`Đã xóa người dùng: ${user.name}`, 'success');
    }
}

function handleAddUser() {
    showNotification('Chức năng thêm người dùng đang được phát triển', 'info');
    // In real app: open add user modal or navigate to add page
}

function handleExport() {
    showNotification('Đang xuất dữ liệu Excel...', 'info');
    // In real app: export table data to Excel file
    setTimeout(() => {
        showNotification('Xuất Excel thành công!', 'success');
    }, 2000);
}

// Debounce utility (use the one from dashboard.js if available)
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