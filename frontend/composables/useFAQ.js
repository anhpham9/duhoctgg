// FAQ Composable for managing FAQ data and interactions
import { ref, reactive } from 'vue'

export const useFAQ = () => {
    // FAQ data presets for different pages
    const faqPresets = {
        general: [
            {
                question: "Dịch vụ du học của bạn bao gồm những gì?",
                answer: "Chúng tôi cung cấp dịch vụ tư vấn chọn trường, hỗ trợ làm hồ sơ, xin visa, và hỗ trợ an cư sau khi đến Nhật Bản."
            },
            {
                question: "Chi phí dịch vụ tư vấn là bao nhiêu?",
                answer: "Chúng tôi có nhiều gói dịch vụ khác nhau. Tư vấn ban đầu hoàn toàn miễn phí. Chi phí cụ thể sẽ được báo giá sau khi tư vấn chi tiết."
            },
            {
                question: "Thời gian xử lý hồ sơ mất bao lâu?",
                answer: "Thời gian xử lý thông thường từ 2-3 tháng tùy thuộc vào loại visa và tính phức tạp của hồ sơ."
            },
            {
                question: "Có cần biết tiếng Nhật trước không?",
                answer: "Không bắt buộc nhưng nên có kiến thức cơ bản. Chúng tôi có khóa học tiếng Nhật chuẩn bị trước khi đi."
            }
        ],
        
        school: [
            {
                question: "Điều kiện đầu vào của trường là gì?",
                answer: "Học sinh cần có bằng tốt nghiệp THPT, chứng chỉ tiếng Nhật từ N5 trở lên hoặc tương đương 150 giờ học."
            },
            {
                question: "Học phí một năm là bao nhiêu?",
                answer: "Học phí dao động từ 650,000 - 800,000 yen/năm tùy theo từng trường và chương trình học."
            },
            {
                question: "Có được làm thêm không?",
                answer: "Sinh viên có thể xin phép làm thêm tối đa 28 giờ/tuần với mức lương trung bình 900-1200 yen/giờ."
            },
            {
                question: "Thời gian học bao lâu?",
                answer: "Khóa học tiếng Nhật thường từ 6 tháng đến 2 năm, tùy thuộc vào mục tiêu và trình độ của học sinh."
            }
        ],
        
        visa: [
            {
                question: "Hồ sơ xin visa cần những gì?",
                answer: "Cần có COE (Certificate of Eligibility), passport, ảnh, đơn xin visa, chứng minh tài chính và các giấy tờ liên quan."
            },
            {
                question: "Thời gian xử lý visa là bao lâu?",
                answer: "Sau khi có COE, thời gian xử lý visa thường từ 3-5 ngày làm việc."
            },
            {
                question: "Tỷ lệ đậu visa như thế nào?",
                answer: "Với hồ sơ đầy đủ và hợp lệ, tỷ lệ đậu visa thường trên 95%."
            },
            {
                question: "Chi phí làm visa bao nhiêu?",
                answer: "Lệ phí visa là 320,000 VND cho visa đơn, chưa bao gồm các chi phí dịch vụ hỗ trợ."
            }
        ]
    }

    // Get FAQ data by type
    const getFAQData = (type = 'general') => {
        return faqPresets[type] || faqPresets.general
    }

    // Legacy function for vanilla JS (backward compatibility)
    const toggleFAQ = (clickedItem, faqItems) => {
        const isActive = clickedItem.classList.contains('active')
        
        // Close other open items
        faqItems.forEach(item => {
            if (item !== clickedItem) {
                item.classList.remove('active')
                
                const answer = item.querySelector('.faq-answer')
                if (answer) {
                    answer.style.height = answer.scrollHeight + "px"
                    requestAnimationFrame(() => {
                        answer.style.height = "0px"
                    })
                }
                
                const icon = item.querySelector('.faq-icon')
                if (icon) {
                    icon.classList.remove('fa-minus')
                    icon.classList.add('fa-plus')
                }
            }
        })
        
        // Toggle current item
        if (isActive) {
            // Currently open - close it
            clickedItem.classList.remove('active')
            const answer = clickedItem.querySelector('.faq-answer')
            if (answer) {
                answer.style.height = answer.scrollHeight + "px"
                requestAnimationFrame(() => {
                    answer.style.height = "0px"
                })
            }
            
            const icon = clickedItem.querySelector('.faq-icon')
            if (icon) {
                icon.classList.remove('fa-minus')
                icon.classList.add('fa-plus')
            }
        } else {
            // Currently closed - open it
            clickedItem.classList.add('active')
            const answer = clickedItem.querySelector('.faq-answer')
            if (answer) {
                answer.style.height = answer.scrollHeight + "px"
            }
            
            const icon = clickedItem.querySelector('.faq-icon')
            if (icon) {
                icon.classList.remove('fa-plus')
                icon.classList.add('fa-minus')
            }
        }
    }

    // Create custom FAQ data structure
    const createFAQData = (faqItems) => {
        return faqItems.map(item => ({
            question: item.question || item.q,
            answer: item.answer || item.a
        }))
    }

    return {
        faqPresets,
        getFAQData,
        toggleFAQ,
        createFAQData
    }
}