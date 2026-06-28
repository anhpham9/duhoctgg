
Cấu trúc chuẩn đề xuất cho useSiteSeo.js theo 2 hàm:
```Bash
import { computed } from 'vue'

const getDefaultSeo = () => ({
  siteName: '',
  siteUrl: '',
  defaultTitle: '',
  defaultDescription: '',
  defaultOgImage: '',
  facebookAppId: ''
})

export const useSiteSeoData = () => {
  const config = useRuntimeConfig()

  // Chỉ chịu trách nhiệm lấy dữ liệu thô + trạng thái async
  return useFetch(`${config.public.apiBase}/public/seo-settings`, {
    key: 'public-seo-settings'
  })
}

export const useSiteSeoComputed = (seoResponseRef) => {
  // Chỉ chịu trách nhiệm map + fallback dữ liệu đã fetch
  return computed(() => {
    const seoData = seoResponseRef.value?.data || {}

    return {
      siteName: seoData.siteName || '',
      siteUrl: seoData.siteUrl || '',
      defaultTitle: seoData.defaultTitle || '',
      defaultDescription: seoData.defaultDescription || '',
      defaultOgImage: seoData.defaultOgImage || '',
      facebookAppId: seoData.facebookAppId || ''
    }
  })
}

// Wrapper để giữ DX gọn và tương thích code cũ
export const useSiteSeo = () => {
  const { data, pending, error, refresh, status } = useSiteSeoData()
  const seo = useSiteSeoComputed(data)

  return {
    seo,
    pending,
    error,
    refresh,
    status
  }
}
```

Cách dùng thống nhất ở page:

```Bash
const { seo: siteSeo, pending: siteSeoPending, error: siteSeoError } = useSiteSeo()

useSeoMeta({
  title: () => siteSeo.value.defaultTitle,
  description: () => siteSeo.value.defaultDescription,
  ogTitle: () => siteSeo.value.defaultTitle,
  ogDescription: () => siteSeo.value.defaultDescription,
  ogImage: () => siteSeo.value.defaultOgImage,
  ogType: 'website'
})

useHead(() => ({
  meta: [
    { property: 'og:url', content: siteSeo.value.siteUrl }
  ]
}))
```

Điểm chuẩn hóa team nhận được:

1. Data layer rõ ràng: useSiteSeoData.
2. Transform layer rõ ràng: useSiteSeoComputed.
3. Vẫn có wrapper useSiteSeo để code ở page ngắn và đồng nhất.

---

Khi nào dùng siteSeoPending

1. Trong lúc request SEO settings chưa xong.
2. Khi bạn gọi refresh để tải lại SEO settings.
3. Khi muốn tránh render/chạy logic phụ thuộc SEO quá sớm.

Dùng như nào

1. Hiển thị loading/skeleton.
2. Tạm ẩn block phụ thuộc dữ liệu SEO.
3. Disable thao tác refresh lặp nhiều lần.

Khi nào dùng siteSeoError

1. API SEO bị lỗi mạng, 500, timeout, hoặc response lỗi.
2. Bạn cần fallback rõ ràng thay vì im lặng.
3. Bạn muốn log lỗi hoặc hiện nút thử lại.

Dùng như nào

1. Hiện cảnh báo nhẹ cho admin/dev (public page có thể không cần hiện lớn).
2. Dùng giá trị mặc định an toàn cho meta.
3. Cho phép bấm refresh để retry.

Ví dụ dùng ở page


```Js
<script setup>
const {
  seo: siteSeo,
  pending: siteSeoPending,
  error: siteSeoError,
  refresh
} = useSiteSeo()

useSeoMeta({
  title: () => siteSeo.value.defaultTitle || 'Du hoc Nhat Ban',
  description: () => siteSeo.value.defaultDescription || 'Thong tin du hoc',
  ogImage: () => siteSeo.value.defaultOgImage || '/default-og.jpg'
})
</script>

<template>
  <div v-if="siteSeoPending">Dang tai cau hinh SEO...</div>

  <div v-else-if="siteSeoError">
    Khong tai duoc SEO settings.
    <button @click="refresh">Thu lai</button>
  </div>

  <div v-else>
    <!-- Noi dung page -->
  </div>
</template>
```

Tóm lại:

1. siteSeoPending để quản lý trạng thái đang tải.
2. siteSeoError để xử lý khi tải thất bại.
3. Dù có fallback meta, vẫn nên dùng 2 biến này để UX rõ ràng và dễ debug hơn.