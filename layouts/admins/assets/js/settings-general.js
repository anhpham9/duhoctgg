// General Settings Management System
class GeneralSettingsManager {
    constructor() {
        this.originalSettings = {};
        this.hasUnsavedChanges = false;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupCharacterCounters();
        this.setupToggleSwitches();
        this.checkForChanges();
    }

    loadSettings() {
        // Load current settings (in real app, this would be from API)
        this.originalSettings = {
            siteName: 'Du Học NB',
            siteTagline: 'Dịch Vụ Tư Vấn Du Học Uy Tín',
            siteDescription: 'Chúng tôi cung cấp dịch vụ tư vấn du học Nhật Bản chuyên nghiệp, hỗ trợ toàn diện từ hồ sơ đến visa.',
            siteLanguage: 'vi',
            siteTimezone: 'Asia/Ho_Chi_Minh',
            dateFormat: 'dd/mm/yyyy',
            companyName: 'Công ty TNHH Du Học NB',
            contactEmail: 'info@duhocnb.com',
            contactPhone: '+84 xxx xxx xxx',
            contactHotline: '1900 xxxx',
            companyAddress: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
            businessHours: '8:00 - 17:00 (T2-T6)',
            facebookUrl: '',
            youtubeUrl: '',
            zaloUrl: '',
            telegramUrl: '',
            instagramUrl: '',
            linkedinUrl: '',
            seoTitle: 'Du Học NB - Tư vấn Du học Nhật Bản uy tín',
            seoDescription: 'Dịch vụ tư vấn du học Nhật Bản chuyên nghiệp, hỗ trợ toàn diện từ hồ sơ đến visa. Uy tín - Chất lượng - Hiệu quả.',
            seoKeywords: 'du học nhật bản, tư vấn du học, visa nhật bản, trường nhật bản',
            googleAnalytics: '',
            googleTagManager: '',
            maintenanceMode: false,
            allowRegistration: true,
            emailVerification: true,
            cacheEnabled: true,
            maxFileSize: 10,
            sessionTimeout: 120,
            autoBackup: true,
            backupFrequency: 'daily',
            backupRetention: 30
        };

        this.populateForm();
    }

    populateForm() {
        Object.keys(this.originalSettings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.originalSettings[key];
                } else {
                    element.value = this.originalSettings[key];
                }
            }
        });
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.showResetConfirmation();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.resetForm();
        });

        // Backup buttons
        document.getElementById('createBackupBtn').addEventListener('click', () => {
            this.createBackup();
        });

        document.getElementById('downloadBackupBtn').addEventListener('click', () => {
            this.downloadBackup();
        });

        document.getElementById('restoreBackupBtn').addEventListener('click', () => {
            this.showRestoreConfirmation();
        });

        // File input preview
        document.getElementById('siteLogo').addEventListener('change', (e) => {
            this.handleLogoUpload(e);
        });

        // Form change detection
        document.getElementById('settingsForm').addEventListener('input', () => {
            this.hasUnsavedChanges = true;
            this.updateUI();
        });

        document.getElementById('settingsForm').addEventListener('change', () => {
            this.hasUnsavedChanges = true; 
            this.updateUI();
        });

        // Prevent navigation with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    setupCharacterCounters() {
        const counters = [
            { element: 'seoTitle', maxLength: 60 },
            { element: 'seoDescription', maxLength: 160 }
        ];

        counters.forEach(counter => {
            const element = document.getElementById(counter.element);
            const counterElement = element.parentNode.querySelector('.char-count');
            
            const updateCounter = () => {
                const currentLength = element.value.length;
                counterElement.textContent = `${currentLength}/${counter.maxLength} ký tự`;
                
                if (currentLength > counter.maxLength * 0.9) {
                    counterElement.style.color = '#f44336';
                } else if (currentLength > counter.maxLength * 0.7) {
                    counterElement.style.color = '#ff9800';
                } else {
                    counterElement.style.color = '#4caf50';
                }
            };

            element.addEventListener('input', updateCounter);
            updateCounter(); // Initial count
        });
    }

    setupToggleSwitches() {
        const toggles = [
            'maintenanceMode',
            'allowRegistration', 
            'emailVerification',
            'cacheEnabled',
            'autoBackup'
        ];

        toggles.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                toggle.addEventListener('change', () => {
                    this.hasUnsavedChanges = true;
                    this.updateUI();
                    
                    // Special handling for maintenance mode
                    if (toggleId === 'maintenanceMode' && toggle.checked) {
                        this.showMaintenanceWarning();
                    }
                });
            }
        });
    }

    checkForChanges() {
        const formData = new FormData(document.getElementById('settingsForm'));
        const currentSettings = {};

        formData.forEach((value, key) => {
            const element = document.getElementById(key);
            if (element && element.type === 'checkbox') {
                currentSettings[key] = element.checked;
            } else {
                currentSettings[key] = value;
            }
        });

        // Check if any values have changed
        this.hasUnsavedChanges = Object.keys(currentSettings).some(key => {
            return currentSettings[key] !== this.originalSettings[key];
        });

        this.updateUI();
    }

    updateUI() {
        const saveBtn = document.getElementById('saveBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (this.hasUnsavedChanges) {
            saveBtn.classList.add('pulse');
            resetBtn.disabled = false;
            document.title = '• Cài Đặt Chung - Du Học NB Admin';
        } else {
            saveBtn.classList.remove('pulse');
            resetBtn.disabled = true;
            document.title = 'Cài Đặt Chung - Du Học NB Admin';
        }
    }

    async saveSettings() {
        try {
            this.showLoadingState(true);
            
            // Collect form data
            const formData = new FormData(document.getElementById('settingsForm'));
            const settings = {};

            formData.forEach((value, key) => {
                const element = document.getElementById(key);
                if (element && element.type === 'checkbox') {
                    settings[key] = element.checked;
                } else {
                    settings[key] = value;
                }
            });

            // Validate settings
            if (!this.validateSettings(settings)) {
                return;
            }

            // In real app, send to API
            await this.simulateApiCall();

            // Update original settings
            this.originalSettings = { ...settings };
            this.hasUnsavedChanges = false;
            this.updateUI();

            this.showNotification('Đã lưu cài đặt thành công!', 'success');

        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Có lỗi xảy ra khi lưu cài đặt!', 'error');
        } finally {
            this.showLoadingState(false);
        }
    }

    validateSettings(settings) {
        const errors = [];

        // Required fields
        if (!settings.siteName?.trim()) {
            errors.push('Tên website là bắt buộc');
        }

        if (!settings.contactEmail?.trim()) {
            errors.push('Email liên hệ là bắt buộc');
        } else if (!this.isValidEmail(settings.contactEmail)) {
            errors.push('Email liên hệ không hợp lệ');
        }

        // URL validation
        const urlFields = ['facebookUrl', 'youtubeUrl', 'telegramUrl', 'instagramUrl', 'linkedinUrl'];
        urlFields.forEach(field => {
            if (settings[field] && !this.isValidUrl(settings[field])) {
                errors.push(`URL ${field} không hợp lệ`);
            }
        });

        // Number validation
        if (settings.maxFileSize < 1 || settings.maxFileSize > 100) {
            errors.push('Kích thước file phải từ 1-100 MB');
        }

        if (settings.sessionTimeout < 15 || settings.sessionTimeout > 1440) {
            errors.push('Thời gian phiên phải từ 15-1440 phút');
        }

        if (errors.length > 0) {
            this.showNotification(errors.join('\n'), 'error');
            return false;
        }

        return true;
    }

    resetForm() {
        if (this.hasUnsavedChanges) {
            this.showResetConfirmation();
        } else {
            this.populateForm();
        }
    }

    showResetConfirmation() {
        this.showConfirmModal(
            'Khôi phục cài đặt',
            'Bạn có chắc chắn muốn khôi phục tất cả cài đặt về giá trị mặc định? Hành động này không thể hoàn tác.',
            () => {
                this.resetToDefaults();
            }
        );
    }

    resetToDefaults() {
        this.populateForm();
        this.hasUnsavedChanges = false;
        this.updateUI();
        this.showNotification('Đã khôi phục cài đặt mặc định', 'info');
    }

    showMaintenanceWarning() {
        this.showConfirmModal(
            'Chế độ bảo trì',
            'Khi bật chế độ bảo trì, website sẽ không thể truy cập bởi khách hàng. Bạn có chắc chắn muốn tiếp tục?',
            () => {
                // Keep maintenance mode enabled
            },
            () => {
                // Disable maintenance mode
                document.getElementById('maintenanceMode').checked = false;
            }
        );
    }

    async createBackup() {
        try {
            this.showLoadingState(true, 'Đang tạo bản sao lưu...');
            
            await this.simulateApiCall(3000); // Simulate longer backup process
            
            // Update last backup time
            document.getElementById('lastBackup').textContent = this.formatDateTime(new Date());
            
            this.showNotification('Đã tạo bản sao lưu thành công!', 'success');
            
        } catch (error) {
            console.error('Error creating backup:', error);
            this.showNotification('Có lỗi xảy ra khi tạo bản sao lưu!', 'error');
        } finally {
            this.showLoadingState(false);
        }
    }

    downloadBackup() {
        // In real app, this would download actual backup file
        const blob = new Blob(['Backup data'], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${this.formatDate(new Date())}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Đang tải xuống bản sao lưu...', 'info');
    }

    showRestoreConfirmation() {
        this.showConfirmModal(
            'Khôi phục dữ liệu',
            'Khôi phục sẽ ghi đè tất cả dữ liệu hiện tại. Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?',
            () => {
                this.createFileInput();
            }
        );
    }

    createFileInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip,.sql,.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.restoreFromFile(file);
            }
        };
        input.click();
    }

    async restoreFromFile(file) {
        try {
            this.showLoadingState(true, 'Đang khôi phục dữ liệu...');
            
            await this.simulateApiCall(5000); // Simulate restore process
            
            this.showNotification('Đã khôi phục dữ liệu thành công!', 'success');
            
            // Reload page after restore
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (error) {
            console.error('Error restoring backup:', error);
            this.showNotification('Có lỗi xảy ra khi khôi phục dữ liệu!', 'error');
        } finally {
            this.showLoadingState(false);
        }
    }

    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                this.showNotification('Kích thước logo không được vượt quá 2MB', 'warning');
                event.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                // In real app, would show preview and upload to server
                this.showNotification('Đã chọn logo thành công', 'success');
            };
            reader.readAsDataURL(file);
        }
    }

    showLoadingState(loading, message = 'Đang xử lý...') {
        const saveBtn = document.getElementById('saveBtn');
        const form = document.getElementById('settingsForm');
        
        if (loading) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
            form.style.opacity = '0.6';
        } else {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu cài đặt';
            form.style.opacity = '1';
        }
    }

    showConfirmModal(title, message, onConfirm, onCancel) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        
        const modal = document.getElementById('confirmModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
        
        const confirmBtn = document.getElementById('confirmBtn');
        confirmBtn.onclick = () => {
            this.closeConfirmModal();
            if (onConfirm) onConfirm();
        };
        
        // Store cancel callback if provided
        modal.dataset.onCancel = onCancel ? 'true' : 'false';
        if (onCancel) {
            modal.onCancelCallback = onCancel;
        }
    }

    closeConfirmModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            
            // Call cancel callback if exists
            if (modal.dataset.onCancel === 'true' && modal.onCancelCallback) {
                modal.onCancelCallback();
                modal.onCancelCallback = null;
            }
        }, 300);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Utility functions
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    formatDateTime(date) {
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDate(date) {
        return date.toLocaleDateString('vi-VN').split('/').join('-');
    }

    async simulateApiCall(delay = 1500) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}

// Modal control functions
function closeConfirmModal() {
    if (window.settingsManager) {
        window.settingsManager.closeConfirmModal();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new GeneralSettingsManager();
    
    // Add pulse animation CSS
    const style = document.createElement('style');
    style.textContent = `
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
            100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
        }
    `;
    document.head.appendChild(style);
});