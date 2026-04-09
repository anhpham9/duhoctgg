/**
 * Notifications.js - Xử lý animation và effects cho notification system
 * Tích hợp với dashboard01.js để quản lý notifications
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // NOTIFICATION BELL ANIMATION
    // ========================================
    
    const notificationBtn = document.getElementById('notificationToggle');
    const notificationCount = document.getElementById('notificationCount');
    
    // Function to update notification bell animation
    function updateNotificationBell() {
        if (!notificationBtn) return;
        
        const unreadCount = getUnreadNotificationCount();
        
        if (unreadCount > 0) {
            // Add animation class khi có thông báo chưa đọc
            notificationBtn.classList.add('has-unread');
        } else {
            // Remove animation class khi không có thông báo chưa đọc
            notificationBtn.classList.remove('has-unread');
        }
    }
    
    // Function to get current unread notification count
    function getUnreadNotificationCount() {
        if (!notificationCount) return 0;
        const count = parseInt(notificationCount.textContent) || 0;
        return count;
    }
    
    // Monitor notification count changes
    function observeNotificationCount() {
        if (!notificationCount) return;
        
        // MutationObserver để theo dõi thay đổi trong notification count
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    updateNotificationBell();
                }
            });
        });
        
        // Observe changes in notification count element
        observer.observe(notificationCount, {
            childList: true,
            characterData: true,
            subtree: true
        });
        
        // Initial update
        updateNotificationBell();
    }
    
    // ========================================
    // INTEGRATION WITH DASHBOARD01.JS
    // ========================================
    
    // Extend existing notificationsManager nếu có sẵn
    if (window.notificationsManager) {
        
        // Override addNotification function để trigger animation
        const originalAddNotification = window.notificationsManager.addNotification;
        window.notificationsManager.addNotification = function(message, type = 'info') {
            // Call original function
            const result = originalAddNotification.call(this, message, type);
            
            // Update bell animation
            setTimeout(() => {
                updateNotificationBell();
            }, 100);
            
            return result;
        };
        
        // Override markAllAsRead function để remove animation
        const originalMarkAllAsRead = window.notificationsManager.markAllAsRead;
        window.notificationsManager.markAllAsRead = function() {
            // Call original function
            const result = originalMarkAllAsRead.call(this);
            
            // Update bell animation
            setTimeout(() => {
                updateNotificationBell();
            }, 100);
            
            return result;
        };
    }
    
    // ========================================
    // MANUAL NOTIFICATION MANAGEMENT
    // ========================================
    
    // Function để manually set notification count và trigger animation
    function setNotificationCount(count) {
        if (notificationCount) {
            notificationCount.textContent = count;
            if (count > 0) {
                notificationCount.style.display = 'inline-block';
            } else {
                notificationCount.style.display = 'none';
            }
            
            updateNotificationBell();
        }
    }
    
    // Function để manually add một notification
    function addNotificationWithAnimation(message, type = 'info') {
        // Nếu có notificationsManager, sử dụng nó
        if (window.notificationsManager) {
            window.notificationsManager.addNotification(message, type);
        } else {
            // Fallback manual implementation
            const currentCount = getUnreadNotificationCount();
            setNotificationCount(currentCount + 1);
        }
    }
    
    // Function để manually clear all notifications
    function clearAllNotificationsWithAnimation() {
        // Nếu có notificationsManager, sử dụng nó
        if (window.notificationsManager) {
            window.notificationsManager.markAllAsRead();
        } else {
            // Fallback manual implementation
            setNotificationCount(0);
        }
    }
    
    // ========================================
    // NOTIFICATION HISTORY & EFFECTS
    // ========================================
    
    // Enhanced notification với sound effect (optional)
    function playNotificationSound() {
        // Tạo subtle notification sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            // Sound not supported, không làm gì
        }
    }
    
    // Function để trigger notification với full effects
    function triggerNotificationWithEffects(message, type = 'info', playSound = false) {
        addNotificationWithAnimation(message, type);
        
        if (playSound) {
            playNotificationSound();
        }
        
        // Temporary visual feedback
        if (notificationBtn) {
            notificationBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                notificationBtn.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    // ========================================
    // PUBLIC API
    // ========================================
    
    // Export functions globally
    window.NotificationAnimations = {
        updateBell: updateNotificationBell,
        setCount: setNotificationCount,
        addNotification: addNotificationWithAnimation,
        clearAll: clearAllNotificationsWithAnimation,
        triggerWithEffects: triggerNotificationWithEffects,
        getUnreadCount: getUnreadNotificationCount
    };
    
    // ========================================
    // INITIALIZATION
    // ========================================
    
    // Start observing notification count changes
    observeNotificationCount();
    
    // Initial update sau khi DOM load
    setTimeout(() => {
        updateNotificationBell();
    }, 500);
    
    console.log('Notification animations initialized');
    
});