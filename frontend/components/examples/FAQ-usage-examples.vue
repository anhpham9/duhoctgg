<!-- Example: Cách sử dụng FAQ component trong các trang khác nhau -->

<!-- 1. Trang chủ - FAQ về dịch vụ chung -->
<template>
    <div>
        <FAQ 
            title="Câu Hỏi Thường Gặp"
            subtitle="Những thắc mắc phổ biến về dịch vụ du học"
            :faq-data="generalFaqData"
        />
    </div>
</template>

<script setup>
// Dữ liệu FAQ cho trang chủ
const generalFaqData = [
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
    }
]
</script>

<!-- 2. Trang trường học - FAQ về nhập học -->
<template>
    <div>
        <FAQ 
            title="Thông Tin Tuyển Sinh" 
            subtitle="Câu hỏi về quy trình nhập học và yêu cầu"
            :faq-data="schoolFaqData"
        />
    </div>
</template>

<script setup>
const schoolFaqData = [
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
    }
]
</script>

<!-- 3. Trang visa - FAQ về thủ tục -->
<template>
    <div>
        <FAQ 
            title="Thủ Tục Visa Du Học"
            subtitle="Hướng dẫn và câu hỏi về visa du học Nhật Bản"
            :faq-data="visaFaqData"
        />
    </div>
</template>

<script setup>
const visaFaqData = [
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
    }
]
</script>