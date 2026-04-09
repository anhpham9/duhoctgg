/**
 * Common JavaScript Functions - Reusable Components
 * Sử dụng chung cho tất cả các trang admin
 */

// ========================================
// MODAL SYSTEM
// ========================================

class ModalManager {
    constructor() {
        this.currentModal = null;
        this.init();
    }

    init() {
        // Tạo styles cho modal nếu chưa có
        this.injectModalStyles();
        
        // Listen for escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    }

    injectModalStyles() {
        if (document.getElementById('modal-styles')) return;

        const styles = `
            <style id="modal-styles">
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(3px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 100000;
                    opacity: 0;
                    animation: fadeIn 0.3s ease-out forwards;
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    min-width: 400px;
                    max-width: 90vw;
                    max-height: 90vh;
                    overflow: hidden;
                    animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .modal-header {
                    padding: 24px 24px 16px 24px;
                    border-bottom: 1px solid #eee;
                }

                .modal-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #333;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .modal-body {
                    padding: 20px 24px;
                }

                .modal-message {
                    color: #666;
                    line-height: 1.6;
                    margin: 0;
                }

                .modal-footer {
                    padding: 16px 24px 24px 24px;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                .modal-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 80px;
                }

                .modal-btn-cancel {
                    background: #f8f9fa;
                    color: #666;
                    border: 1px solid #ddd;
                }

                .modal-btn-cancel:hover {
                    background: #e9ecef;
                    color: #333;
                }

                .modal-btn-danger {
                    background: #dc3545;
                    color: white;
                }

                .modal-btn-danger:hover {
                    background: #c82333;
                    transform: translateY(-1px);
                }

                .modal-btn-primary {
                    background: #007bff;
                    color: white;
                }

                .modal-btn-primary:hover {
                    background: #0056b3;
                    transform: translateY(-1px);
                }

                .modal-icon {
                    font-size: 1.2rem;
                }

                .modal-icon.danger {
                    color: #dc3545;
                }

                .modal-icon.warning {
                    color: #ffc107;
                }

                .modal-icon.info {
                    color: #007bff;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideIn {
                    from { transform: scale(0.9) translateY(-20px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }

                @media (max-width: 480px) {
                    .modal-content {
                        min-width: auto;
                        margin: 20px;
                    }
                    
                    .modal-footer {
                        flex-direction: column-reverse;
                    }
                    
                    .modal-btn {
                        width: 100%;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    showModal(options) {
        const {
            title = 'Xác nhận',
            message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
            icon = 'fas fa-question-circle',
            iconType = 'info',
            confirmText = 'Xác nhận',
            cancelText = 'Hủy',
            confirmType = 'primary',
            onConfirm = () => {},
            onCancel = () => {}
        } = options;

        // Remove existing modal
        if (this.currentModal) {
            this.closeModal();
        }

        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="commonModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">
                            <i class="${icon} modal-icon ${iconType}"></i>
                            ${title}
                        </h3>
                    </div>
                    <div class="modal-body">
                        <p class="modal-message">${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn modal-btn-cancel" id="modalCancel">
                            ${cancelText}
                        </button>
                        <button class="modal-btn modal-btn-${confirmType}" id="modalConfirm">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.currentModal = document.getElementById('commonModal');

        // Add event listeners
        document.getElementById('modalCancel').addEventListener('click', () => {
            this.closeModal();
            onCancel();
        });

        document.getElementById('modalConfirm').addEventListener('click', () => {
            this.closeModal();
            onConfirm();
        });

        // Close on overlay click
        this.currentModal.addEventListener('click', (e) => {
            if (e.target === this.currentModal) {
                this.closeModal();
                onCancel();
            }
        });
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.style.animation = 'fadeIn 0.2s ease-out reverse';
            setTimeout(() => {
                if (this.currentModal && this.currentModal.parentNode) {
                    this.currentModal.remove();
                }
                this.currentModal = null;
            }, 200);
        }
    }
}

// ========================================
// LOGOUT FUNCTIONALITY
// ========================================
class LogoutManager {
    constructor() {
        this.modalManager = new ModalManager();
        this.init();
    }

    init() {
        this.bindLogoutButtons();
    }

    bindLogoutButtons() {
        // Bind to all logout buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.logout-btn, [data-logout]')) {
                e.preventDefault();
                this.showLogoutModal();
            }
        });
    }

    showLogoutModal() {
        this.modalManager.showModal({
            title: 'Đăng xuất',
            message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
            icon: 'fas fa-sign-out-alt',
            iconType: 'danger',
            confirmText: 'Đăng xuất',
            cancelText: 'Hủy',
            confirmType: 'danger',
            onConfirm: () => {
                this.performLogout();
            },
            onCancel: () => {
                console.log('Logout cancelled');
            }
        });
    }

    performLogout() {
        // Show loading state
        CommonUtils.showLoadingSpinner();

        // Simulate logout process
        setTimeout(() => {
            // Hide loading
            CommonUtils.hideLoadingSpinner();

            // Show success notification
            if (window.notificationsManager) {
                window.notificationsManager.showToast('Đăng xuất thành công!', 'success');
            }

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }, 800);
    }
}

// ========================================
// COMMON UTILITIES
// ========================================
const CommonUtils = {
    // Format numbers with comma
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Loading Spinner Management
    showLoadingSpinner() {
        // Remove existing spinner first
        this.hideLoadingSpinner();
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-container">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="loading-text">
                    Đang tải dữ liệu<span class="loading-dots"></span>
                </p>
            </div>
        `;
        document.body.appendChild(spinner);
    },

    hideLoadingSpinner() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    },

    // Show confirmation modal
    confirm(options) {
        const modal = new ModalManager();
        return new Promise((resolve) => {
            modal.showModal({
                ...options,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    },

    // Show info modal
    alert(title, message, icon = 'fas fa-info-circle') {
        const modal = new ModalManager();
        modal.showModal({
            title,
            message,
            icon,
            confirmText: 'OK',
            onConfirm: () => {},
            onCancel: () => {}
        });
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize logout manager
    window.logoutManager = new LogoutManager();
    window.modalManager = new ModalManager();
    
    // Make utilities globally available
    window.CommonUtils = CommonUtils;
    
    console.log('Common utilities initialized');
});