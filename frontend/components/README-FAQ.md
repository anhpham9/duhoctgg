# FAQ Component - Hướng Dẫn Sử Dụng

## 🎯 Tổng Quan

FAQ Component là một component tái sử dụng để hiển thị phần Câu hỏi thường gặp với hiệu ứng accordion mượt mà. Component này được convert từ logic JavaScript vanilla sang Vue 3 Composition API.

## ✨ Tính Năng

- ✅ **Reusable**: Sử dụng lại ở nhiều trang khác nhau
- ✅ **Smooth Animation**: Hiệu ứng mở/đóng mượt mà
- ✅ **Auto Height**: Tự động tính toán chiều cao nội dung
- ✅ **Icon Toggle**: Icon thay đổi khi mở/đóng
- ✅ **Responsive**: Tương thích mobile
- ✅ **Customizable**: Có thể tùy chỉnh title, subtitle và data
- ✅ **SEO Friendly**: Hỗ trợ SSR và meta tags

## 📦 Import và Sử Dụng Cơ Bản

### 1. Import Component
```vue
<template>
  <FAQ 
    title="Câu Hỏi Thường Gặp"
    subtitle="Những thắc mắc phổ biến"
    :faq-data="myFaqData"
  />
</template>

<script setup>
// Auto-import trong Nuxt - không cần import manual
// import FAQ from '~/components/FAQ.vue'

const myFaqData = [
  {
    question: "Câu hỏi 1?",
    answer: "Trả lời chi tiết cho câu hỏi 1..."
  },
  {
    question: "Câu hỏi 2?", 
    answer: "Trả lời chi tiết cho câu hỏi 2..."
  }
]
</script>
```

### 2. Sử Dụng với Composable
```vue
<script setup>
import { useFAQ } from '~/composables/useFAQ'

const { getFAQData } = useFAQ()

// Sử dụng data có sẵn
const generalFaq = getFAQData('general')   // FAQ chung
const schoolFaq = getFAQData('school')     // FAQ trường học  
const visaFaq = getFAQData('visa')         // FAQ visa
</script>
```

## 🔧 Props API

| Prop | Type | Default | Required | Mô tả |
|------|------|---------|----------|--------|
| `title` | String | `'Câu Hỏi Thường Gặp'` | ❌ | Tiêu đề chính |
| `subtitle` | String | `'Các câu hỏi phổ biến...'` | ❌ | Mô tả phụ |
| `faqData` | Array | - | ✅ | Mảng dữ liệu FAQ |

### Cấu trúc `faqData`
```js
const faqData = [
  {
    question: "Câu hỏi?",    // Bắt buộc
    answer: "Trả lời..."     // Bắt buộc
  }
]
```

## 📋 Các Ví Dụ Sử Dụng

### 1. Trang Chủ - FAQ Tổng Quát
```vue
<FAQ 
  title="Câu Hỏi Thường Gặp"
  subtitle="Những thắc mắc về dịch vụ du học"
  :faq-data="generalFaqData"
/>
```

### 2. Trang Trường - FAQ Chuyên Biệt
```vue
<FAQ 
  title="Thông Tin Tuyển Sinh"
  subtitle="Câu hỏi về nhập học và yêu cầu"  
  :faq-data="schoolFaqData"
/>
```

### 3. Multiple FAQs trên 1 trang
```vue
<template>
  <div>
    <!-- FAQ Section 1 -->
    <FAQ 
      title="Dịch Vụ Tư Vấn"
      :faq-data="serviceFaq"
    />
    
    <!-- FAQ Section 2 -->
    <FAQ 
      title="Thủ Tục Pháp Lý"
      :faq-data="legalFaq"
    />
  </div>
</template>
```

## 🎨 Customization

### 1. Override CSS
```vue
<style>
/* Custom màu chủ đạo */
.faq-question {
  background: #2196f3 !important;
}

/* Custom animation duration */
.faq-answer {
  transition: height 0.5s ease !important;
}
</style>
```

### 2. Thêm Class CSS
```vue
<FAQ 
  class="my-custom-faq"
  :faq-data="data"
/>
```

## 🔄 Migration từ HTML/JS cũ

### Trước (HTML + JS):
```html
<div class="faq-item">
  <div class="faq-question">
    <h4>Câu hỏi?</h4>
    <i class="fas fa-plus faq-icon"></i>
  </div>
  <div class="faq-answer">
    <p>Trả lời...</p>
  </div>
</div>

<script>
// Logic jQuery/Vanilla JS phức tạp...
</script>
```

### Sau (Vue Component):
```vue
<FAQ :faq-data="[
  { question: 'Câu hỏi?', answer: 'Trả lời...' }
]" />
```

## 🚀 Performance Tips

1. **Lazy Loading**: Component tự động lazy load
2. **Data Splitting**: Chia nhỏ FAQ data theo trang
3. **Caching**: Sử dụng composable để cache data

```js
// ✅ Good - Data theo từng trang
const aboutPageFaq = getFAQData('about')

// ❌ Avoid - Load tất cả FAQ cùng lúc
const allFaqData = [...generalFaq, ...schoolFaq, ...visaFaq]
```

## 🐛 Troubleshooting

### 1. FAQ không mở/đóng
- ✅ Kiểm tra `faqData` có đúng format
- ✅ Kiểm tra CSS height animation
- ✅ Kiểm tra console có lỗi JS

### 2. Animation không smooth
- ✅ Thêm CSS `overflow: hidden`
- ✅ Kiểm tra `transition` property
- ✅ Đảm bảo height được tính đúng

### 3. Icons không đổi
- ✅ Import Font Awesome
- ✅ Kiểm tra class `fa-plus` và `fa-minus`

## 📝 Best Practices

1. **Data Structure**: Luôn validate FAQ data
2. **SEO**: Sử dụng proper heading tags
3. **Accessibility**: Thêm aria-labels
4. **Performance**: Lazy load cho FAQ dài
5. **Mobile**: Test trên mobile devices

## 🎯 Next Steps

- [ ] Thêm search trong FAQ
- [ ] Thêm category filtering  
- [ ] Integration với CMS
- [ ] A/B testing cho UX

---

💡 **Tip**: Để xem demo đầy đủ, truy cập `/faq-demo` hoặc chạy `npm run dev` và test thử!