// ========================================
// VALIDATION COMPOSABLE 
// ========================================
// Reusable validation utilities for forms

import { reactive, ref, computed } from 'vue'

export const useValidation = () => {
    // ========================================
    // EMAIL VALIDATION
    // ========================================
    
    const validateEmail = (email) => {
        if (!email || !email.trim()) {
            return { isValid: false, message: 'Email là bắt buộc' }
        }
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        const isValid = emailRegex.test(email.trim())
        
        return {
            isValid,
            message: isValid ? '' : 'Địa chỉ email không hợp lệ'
        }
    }
    
    // ========================================
    // PHONE VALIDATION
    // ========================================
    
    // Normalize phone number for comparison
    const normalizePhoneNumber = (phone) => {
        if (!phone) return ''
        
        // Remove all spaces and special characters
        let normalized = phone.replace(/[\s\-\(\)]/g, '')
        
        // Convert to standard format (0xxxxxxxxx)
        if (normalized.startsWith('+84')) {
            normalized = '0' + normalized.substring(3)
        } else if (normalized.startsWith('84') && normalized.length === 11) {
            normalized = '0' + normalized.substring(2)
        }
        
        return normalized
    }
    
    const validateVietnamesePhone = (phone) => {
        if (!phone || !phone.trim()) {
            return { isValid: true, message: '' } // Phone is optional
        }
        
        // Check Vietnam phone number format
        const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/
        const isValid = phoneRegex.test(phone.trim())
        
        return {
            isValid,
            message: isValid ? '' : 'Số điện thoại không đúng định dạng Việt Nam'
        }
    }
    
    // Check phone duplicate against list of users
    const checkPhoneDuplicate = async (phone, existingUsers, excludeUserId = null) => {
        if (!phone || !phone.trim()) {
            return { isValid: true, message: '' }
        }
        
        try {
            const normalizedPhone = normalizePhoneNumber(phone)
            const isDuplicate = existingUsers.some(user => {
                const userPhone = normalizePhoneNumber(user.phone)
                return userPhone === normalizedPhone && user.id !== excludeUserId
            })
            
            return {
                isValid: !isDuplicate,
                message: isDuplicate ? 'Số điện thoại này đã được đăng ký' : ''
            }
        } catch (error) {
            console.error('Error checking phone duplicate:', error)
            return { isValid: false, message: 'Lỗi khi kiểm tra số điện thoại' }
        }
    }
    
    // Full phone validation (format + duplicate check)
    const validatePhone = async (phone, existingUsers = [], excludeUserId = null) => {
        // First check format
        const formatCheck = validateVietnamesePhone(phone)
        if (!formatCheck.isValid) {
            return formatCheck
        }
        
        // If format is valid and phone exists, check for duplicates
        if (phone && phone.trim() && existingUsers.length > 0) {
            return await checkPhoneDuplicate(phone, existingUsers, excludeUserId)
        }
        
        return { isValid: true, message: '' }
    }
    
    // ========================================
    // PASSWORD VALIDATION
    // ========================================
    
    const createPasswordStrength = () => reactive({
        hasMinLength: false,
        hasLettersAndNumbers: false,
        hasMixedCase: false
    })
    
    const validatePasswordStrength = (password, strengthObj = null) => {
        if (!password) {
            return { isValid: false, message: 'Mật khẩu là bắt buộc' }
        }
        
        // Create strength object if not provided
        const strength = strengthObj || createPasswordStrength()
        
        // Check minimum length (8 characters or more)
        strength.hasMinLength = password.length >= 8
        
        // Check letters and numbers
        const hasLetter = /[a-zA-Z]/.test(password)
        const hasNumber = /[0-9]/.test(password)
        strength.hasLettersAndNumbers = hasLetter && hasNumber
        
        // Check mixed case (uppercase and lowercase)
        const hasUppercase = /[A-Z]/.test(password)
        const hasLowercase = /[a-z]/.test(password)
        strength.hasMixedCase = hasUppercase && hasLowercase
        
        // Validation messages
        if (!strength.hasMinLength) {
            return { isValid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự', strength }
        }
        if (!strength.hasLettersAndNumbers) {
            return { isValid: false, message: 'Mật khẩu phải có chữ và số', strength }
        }
        if (!strength.hasMixedCase) {
            return { isValid: false, message: 'Mật khẩu phải có chữ hoa và thường', strength }
        }
        
        return { isValid: true, message: '', strength }
    }
    
    const validatePasswordConfirmation = (password, confirmPassword) => {
        if (!confirmPassword) {
            return { isValid: false, message: 'Xác nhận mật khẩu là bắt buộc' }
        }
        
        const isMatch = password === confirmPassword
        return {
            isValid: isMatch,
            message: isMatch ? '' : 'Mật khẩu xác nhận không trùng khớp'
        }
    }
    
    // Get password strength percentage for progress bar
    const getPasswordStrengthPercentage = (strength) => {
        const validChecks = [
            strength.hasMinLength,
            strength.hasLettersAndNumbers,
            strength.hasMixedCase
        ].filter(Boolean).length
        
        return (validChecks / 3) * 100
    }
    
    // Get password strength text
    const getPasswordStrengthText = (strength) => {
        const validChecks = [
            strength.hasMinLength,
            strength.hasLettersAndNumbers,
            strength.hasMixedCase
        ].filter(Boolean).length
        
        if (validChecks === 0 || validChecks === 1) return 'Yếu'
        if (validChecks === 2) return 'Trung bình'
        return 'Mạnh'
    }
    
    // Get password strength CSS class
    const getPasswordStrengthClass = (strength) => {
        const validChecks = [
            strength.hasMinLength,
            strength.hasLettersAndNumbers,
            strength.hasMixedCase
        ].filter(Boolean).length
        
        if (validChecks === 0 || validChecks === 1) return 'strength-weak'
        if (validChecks === 2) return 'strength-medium'
        return 'strength-strong'
    }
    
    // ========================================
    // USERNAME VALIDATION
    // ========================================
    
    const validateUsername = (username) => {
        if (!username || !username.trim()) {
            return { isValid: false, message: 'Tên đăng nhập là bắt buộc' }
        }
        
        if (username.length < 3) {
            return { isValid: false, message: 'Tên đăng nhập phải ít nhất 3 ký tự' }
        }
        
        // Optional: Check for valid characters (letters, numbers, underscore, dash)
        const usernameRegex = /^[a-zA-Z0-9_-]+$/
        if (!usernameRegex.test(username)) {
            return { isValid: false, message: 'Tên đăng nhập chỉ được chứa chữ, số, gạch dưới và gạch ngang' }
        }
        
        return { isValid: true, message: '' }
    }
    
    // ========================================
    // GENERAL VALIDATION
    // ========================================
    
    const validateRequired = (value, fieldName) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return { isValid: false, message: `${fieldName} là bắt buộc` }
        }
        return { isValid: true, message: '' }
    }
    
    const validateMinLength = (value, minLength, fieldName) => {
        if (!value || value.length < minLength) {
            return { isValid: false, message: `${fieldName} phải có ít nhất ${minLength} ký tự` }
        }
        return { isValid: true, message: '' }
    }
    
    const validateMaxLength = (value, maxLength, fieldName) => {
        if (value && value.length > maxLength) {
            return { isValid: false, message: `${fieldName} không được quá ${maxLength} ký tự` }
        }
        return { isValid: true, message: '' }
    }
    
    // ========================================
    // BACKEND ERROR PARSING
    // ========================================
    
    const parseBackendValidationError = (errorResponse) => {
        // Try to parse JSON if it's a string
        let parsedError = errorResponse
        if (typeof errorResponse === 'string') {
            try {
                parsedError = JSON.parse(errorResponse)
            } catch (e) {
                // If not JSON, treat as plain error message
                parsedError = { message: errorResponse }
            }
        }
        
        // Handle different error response formats from backend
        if (parsedError.errors) {
            // Format: { errors: { field: "message" } }
            return parsedError.errors
        } else if (parsedError.details && Array.isArray(parsedError.details)) {
            // Format: { details: [{ field, message }] }
            const fieldErrors = {}
            parsedError.details.forEach(detail => {
                if (detail.field) {
                    fieldErrors[detail.field] = detail.message
                }
            })
            return fieldErrors
        } else if (parsedError.message) {
            // Handle specific backend error messages
            const message = parsedError.message
            
            // Map specific backend messages to field errors
            if (message === 'Username already exists') {
                return { username: 'Tên đăng nhập đã tồn tại' }
            }
            if (message === 'Email already exists') {
                return { email: 'Địa chỉ email đã được đăng ký' }
            }
            if (message === 'Phone already exists') {
                return { phone: 'Số điện thoại đã được đăng ký' }
            }
            if (message === 'Invalid role_id') {
                return { role_id: 'Quyền không hợp lệ' }
            }
            if (message === 'User not found') {
                return { _general: 'Không tìm thấy người dùng' }
            }
            
            // Handle compound validation message
            if (message === 'All fields are required (name, username, email, password, role_id)') {
                return { _general: 'Tất cả các trường là bắt buộc (họ tên, tên đăng nhập, email, mật khẩu, quyền)' }
            }
            
            // Handle permission errors
            if (message.includes('Access denied') || message.includes('cannot create') || 
                message.includes('cannot update') || message.includes('cannot modify')) {
                return { _general: message }
            }
            
            // Generic message - check if it contains field-specific info
            const lowerMessage = message.toLowerCase()
            if (lowerMessage.includes('username') && (lowerMessage.includes('already') || lowerMessage.includes('exists'))) {
                return { username: 'Tên đăng nhập đã tồn tại' }
            }
            if (lowerMessage.includes('email') && (lowerMessage.includes('already') || lowerMessage.includes('exists'))) {
                return { email: 'Địa chỉ email đã được đăng ký' }
            }
            if (lowerMessage.includes('phone') && (lowerMessage.includes('already') || lowerMessage.includes('exists'))) {
                return { phone: 'Số điện thoại đã được đăng ký' }
            }
            
            // Fallback to general error
            return { _general: message }
        } else {
            // General error message
            return { _general: parsedError.message || 'Có lỗi xảy ra' }
        }
    }
    
    // ========================================
    // RETURN PUBLIC API
    // ========================================
    
    return {
        // Email validation
        validateEmail,
        
        // Phone validation
        validateVietnamesePhone,
        validatePhone,
        checkPhoneDuplicate,
        normalizePhoneNumber,
        
        // Password validation
        createPasswordStrength,
        validatePasswordStrength,
        validatePasswordConfirmation,
        getPasswordStrengthPercentage,
        getPasswordStrengthText,
        getPasswordStrengthClass,
        
        // Username validation
        validateUsername,
        
        // General validation
        validateRequired,
        validateMinLength,
        validateMaxLength,
        
        // Utility
        parseBackendValidationError
    }
}