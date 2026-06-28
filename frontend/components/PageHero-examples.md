# PageHero Component - Usage Examples

## 🎯 Tổng Quan

PageHero là reusable component cho header section của các trang, chỉ khác nội dung bên trong. Component này có thể sử dụng với props hoặc custom slot.

## ✨ Features

- ✅ **Reusable**: Dùng cho tất cả sub-pages
- ✅ **Flexible**: Props hoặc custom slot
- ✅ **Responsive**: Wave animation responsive
- ✅ **SEO Friendly**: Proper breadcrumb structure
- ✅ **Consistent**: Same design across pages

## 📋 Props API

| Prop | Type | Default | Mô tả |
|------|------|---------|--------|
| `title` | String | `''` | Tiêu đề chính |
| `subtitle` | String | `''` | Mô tả phụ |
| `showBreadcrumb` | Boolean | `true` | Hiển thị breadcrumb |
| `breadcrumbText` | String | `''` | Text breadcrumb đơn giản |
| `breadcrumbItems` | Array | `[]` | Breadcrumb phức tạp với links |

## 🔧 Usage Examples

### 1. 📝 Simple Usage (Props Only)
```vue
<template>
  <div>
    <PageHero 
      title="Giới Thiệu Du Học NB"
      subtitle="Đồng hành cùng ước mơ du học Nhật Bản"
      breadcrumb-text="Giới thiệu"
    />
    <!-- Page content -->
  </div>
</template>
```

### 2. 🔗 Advanced Breadcrumb
```vue
<template>
  <PageHero 
    title="Chi Tiết Trường"
    subtitle="Thông tin chi tiết về trường Nhật ngữ"
    :breadcrumb-items="[
      { text: 'Du học', link: '/schools' },
      { text: 'Trường Nhật Ngữ', link: '/schools' },
      { text: 'Tokyo Language School' }
    ]"
  />
</template>
```

### 3. 🎨 Custom Slot (Full Control)
```vue
<template>
  <PageHero>
    <nav class="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <span>/</span>
      <NuxtLink to="/news">Tin tức</NuxtLink>
      <span>/</span>
      <span>{{ newsTitle }}</span>
    </nav>
    
    <h1>{{ newsTitle }}</h1>
    <p>{{ newsDate }} • {{ newsCategory }}</p>
    
    <!-- Custom tags or metadata -->
    <div class="news-tags">
      <span v-for="tag in newsTags" :key="tag" class="tag">
        {{ tag }}
      </span>
    </div>
  </PageHero>
</template>
```

### 4. 📰 News Page Example
```vue
<template>
  <div>
    <PageHero 
      title="Tin Tức Du Học"
      subtitle="Cập nhật thông tin mới nhất về du học Nhật Bản"
      breadcrumb-text="Tin tức"
    />
    <!-- News list content -->
  </div>
</template>
```

### 5. 🏫 Schools Page Example
```vue
<template>
  <div>
    <PageHero 
      title="Trường Nhật Ngữ"
      subtitle="Danh sách các trường Nhật ngữ uy tín tại Nhật Bản"
      :breadcrumb-items="[
        { text: 'Du học', link: '/study-abroad' },
        { text: 'Trường Nhật Ngữ' }
      ]"
    />
    <!-- Schools grid content -->
  </div>
</template>
```

### 6. 📞 Contact Page Example
```vue
<template>
  <div>
    <PageHero 
      title="Liên Hệ Tư Vấn"
      subtitle="Đặt lịch hẹn tư vấn miễn phí với chuyên gia"
      breadcrumb-text="Liên hệ"
    />
    <!-- Contact form content -->
  </div>
</template>
```

### 7. 🔍 No Breadcrumb Example
```vue
<template>
  <PageHero 
    title="Đăng Ký Tư Vấn"
    subtitle="Hoàn thành form để được tư vấn 1-1"
    :show-breadcrumb="false"
  />
</template>
```

## 📱 Page-Specific Customization

### News Detail Page
```vue
<script setup>
// Fetch news data
const { data: news } = await $fetch(`/api/news/${route.params.id}`)
</script>

<template>
  <PageHero>
    <nav class="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <span>/</span>
      <NuxtLink to="/news">Tin tức</NuxtLink>
      <span>/</span>
      <span>{{ news.title }}</span>
    </nav>
    
    <h1>{{ news.title }}</h1>
    <div class="news-meta">
      <span><i class="fas fa-calendar"></i> {{ formatDate(news.createdAt) }}</span>
      <span><i class="fas fa-tag"></i> {{ news.category }}</span>
      <span><i class="fas fa-eye"></i> {{ news.views }} lượt xem</span>
    </div>
  </PageHero>
</template>
```

### School Detail Page
```vue
<script setup>
const { data: school } = await $fetch(`/api/schools/${route.params.id}`)
</script>

<template>
  <PageHero>
    <nav class="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <span>/</span>
      <NuxtLink to="/schools">Trường học</NuxtLink>
      <span>/</span>
      <span>{{ school.name }}</span>
    </nav>
    
    <h1>{{ school.name }}</h1>
    <p>{{ school.location }} • {{ school.established }}</p>
    
    <div class="school-badges">
      <span v-if="school.isPartner" class="badge partner">Đối tác chính thức</span>
      <span v-if="school.hasScholarship" class="badge scholarship">Có học bổng</span>
    </div>
  </PageHero>
</template>
```

## 🎨 Styling Notes

- Component inherit tất cả styles từ `.page-hero` trong global CSS
- Wave animation tự động responsive
- Breadcrumb styles có sẵn
- Custom slot có thể override hoàn toàn

## ⚡ Performance Tips

1. **Static Content**: Sử dụng props cho content tĩnh
2. **Dynamic Content**: Sử dụng slot cho content phức tạp
3. **SEO**: Breadcrumb giúp cải thiện SEO structure
4. **Lazy Loading**: Component tự động lazy load

## 🔄 Migration Guide

### Before (Static HTML in each page):
```vue
<section class="page-hero">
  <div class="container">
    <div class="page-hero-content">
      <!-- Duplicate HTML structure -->
    </div>
  </div>
  <!-- Duplicate SVG wave -->
</section>
```

### After (Reusable Component):
```vue
<PageHero 
  title="Page Title"
  subtitle="Page description"
  breadcrumb-text="Current Page"
/>
```

**Kết quả:** Code giảm 80%, easy maintenance, consistent design! 🎉