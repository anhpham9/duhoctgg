<template>
    <div>
        <PageHero 
            :title="article.category" 
            :subtitle="heroTitle" 
            :breadcrumb-text="staticPage.title" />

        <section class="article-detail-section">
            <div class="container">
                <div v-if="newsPending" class="news-state">Đang tải chi tiết bài viết...</div>
                <div v-else-if="hasLoadError" class="news-state news-state-error">{{ errorMessage }}</div>
                <div v-else-if="!article" class="news-state">Không tìm thấy bài viết.</div>
                <div v-else class="article-detail-content">
                    <article class="article-main">
                        <div class="article-header">
                            <div class="article-category-tag">{{ article.category }}</div>
                            <h1>{{ article.title }}</h1>
                            <div class="article-meta">
                                <div class="meta-info">
                                    <span class="article-date"><i class="fas fa-calendar"></i> {{ formatDate(article.date) }}</span>
                                    <span class="article-author"><i class="fas fa-user"></i> {{ article.author }}</span>
                                    <span class="article-views"><i class="fas fa-eye"></i> {{ formatViews(article.views) }} lượt xem</span>
                                </div>
                                <div class="social-share">
                                    <span>Chia sẻ:</span>
                                    <a :href="facebookShareUrl" target="_blank" rel="noopener noreferrer" class="share-btn facebook"><i class="fab fa-facebook-f"></i></a>
                                    <a :href="twitterShareUrl" target="_blank" rel="noopener noreferrer" class="share-btn twitter"><i class="fab fa-twitter"></i></a>
                                    <button type="button" class="share-btn copy-link" @click="copyCurrentLink"><i class="fas fa-link"></i></button>
                                </div>
                            </div>
                        </div>

                        <div class="article-image">
                            <img :src="article.image" :alt="article.title">
                        </div>

                        <div class="article-content">
                            <div v-if="article.excerpt" class="content-summary">
                                <p><strong>{{ article.excerpt }}</strong></p>
                            </div>
                            <div class="article-body" v-html="article.content || '<p>Nội dung đang được cập nhật.</p>'"></div>
                        </div>

                        <div class="article-tags" v-if="article.category">
                            <h3>Từ khóa:</h3>
                            <div class="tag-list">
                                <NuxtLink :to="`/news?category=${article.categorySlug || ''}`" class="tag">
                                    {{ article.category }}
                                </NuxtLink>
                            </div>
                        </div>

                        <div class="article-navigation">
                            <NuxtLink v-if="navigation.prev" :to="`/news/${navigation.prev.slug}`" class="nav-btn prev">
                                <i class="fas fa-chevron-left"></i>
                                <div>
                                    <span>Bài trước</span>
                                    <h4 class="article-title">
                                        <NuxtLink :to="`/news/${navigation.prev.slug}`">{{ navigation.prev.title }}</NuxtLink>
                                    </h4>
                                </div>
                            </NuxtLink>
                            <div v-else></div>

                            <NuxtLink v-if="navigation.next" :to="`/news/${navigation.next.slug}`" class="nav-btn next">
                                <div>
                                    <span>Bài tiếp</span>
                                    <h4 class="article-title">
                                        <NuxtLink :to="`/news/${navigation.next.slug}`">{{ navigation.next.title }}</NuxtLink>
                                    </h4>
                                </div>
                                <i class="fas fa-chevron-right"></i>
                            </NuxtLink>
                            <div v-else></div>
                        </div>
                    </article>

                    <aside class="article-sidebar">
                        <div class="sidebar-widget">
                            <h3>Thông Tin Nhanh</h3>
                            <div class="quick-info">
                                <div class="info-item">
                                    <i class="fas fa-calendar-alt"></i>
                                    <div>
                                        <span>Ngày đăng</span>
                                        <strong>{{ formatDate(article.date) }}</strong>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-folder-open"></i>
                                    <div>
                                        <span>Danh mục</span>
                                        <strong>{{ article.category }}</strong>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-eye"></i>
                                    <div>
                                        <span>Lượt xem</span>
                                        <strong>{{ formatViews(article.views) }}</strong>
                                    </div>
                                </div>
                            </div>
                            <NuxtLink to="/contact" class="btn btn-primary">Tư Vấn Ngay</NuxtLink>
                        </div>

                        <div class="sidebar-widget">
                            <h3>Bài Viết Liên Quan</h3>
                            <div class="related-posts">
                                <div class="related-post" v-for="post in relatedPosts" :key="`related-${post.id}`">
                                    <div class="related-post-image">
                                        <img :src="post.image" :alt="post.title">
                                    </div>
                                    <div class="related-post-content">
                                        <h4 class="article-title">
                                            <NuxtLink :to="`/news/${post.slug}`">{{ post.title }}</NuxtLink>
                                        </h4>
                                        <span class="related-date">{{ formatDate(post.date) }}</span>
                                    </div>
                                </div>
                                <div v-if="!relatedPosts.length" class="related-date">Chưa có bài viết liên quan.</div>
                            </div>
                        </div>

                        <div class="sidebar-widget">
                            <h3>Danh Mục</h3>
                            <ul class="category-list">
                                <li v-for="category in categories" :key="category.slug">
                                    <NuxtLink :to="`/news?category=${category.slug}`">
                                        {{ category.name }}
                                        <span>({{ category.news_count }})</span>
                                    </NuxtLink>
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { formatDate as formatSystemDate } from '~/utils/date'

definePageMeta({
    layout: 'default'
})

const config = useRuntimeConfig()
const route = useRoute()
const API_BASE = config.public.apiBase
const DEFAULT_NEWS_IMAGE = '/assets/images/news-1.jpg'

const { data: staticPageData } = await useFetch(`${config.public.apiBase}/public/static-pages/news`, {
    key: 'public-static-page-news'
})

const { data: newsDetailData, pending: newsPending, error: newsError } = await useFetch(
    () => `${API_BASE}/public/news/${String(route.params.slug || '')}`,
    {
        key: () => `public-news-detail-${String(route.params.slug || '')}`
    }
)

const staticPage = computed(() => staticPageData.value?.data || {})

const normalizeNewsItem = (item = {}) => ({
    id: item.id,
    slug: item.slug,
    title: item.title || 'Bài viết không có tiêu đề',
    excerpt: item.excerpt || '',
    content: item.content || '',
    image: item.thumbnail_url || DEFAULT_NEWS_IMAGE,
    category: item.category_name || 'Tin tức',
    categorySlug: item.category_slug || '',
    author: item.author_name || 'Ban biên tập',
    date: item.published_at || item.created_at || null,
    views: Number(item.view_count || 0),
    metaTitle: item.meta_title || '',
    metaDescription: item.meta_description || ''
})

const payload = computed(() => {
    if (!newsDetailData.value || newsDetailData.value.success === false) return null
    return newsDetailData.value
})

const trackedArticleId = ref(null)
const liveViewCount = ref(null)

const article = computed(() => {
    if (!payload.value?.data) return null

    const normalizedArticle = normalizeNewsItem(payload.value.data)

    if (trackedArticleId.value === normalizedArticle.id && liveViewCount.value !== null) {
        return {
            ...normalizedArticle,
            views: liveViewCount.value
        }
    }

    return normalizedArticle
})

const relatedPosts = computed(() => {
    return (payload.value?.related || []).map(normalizeNewsItem)
})

const categories = computed(() => payload.value?.categories || [])
const navigation = computed(() => payload.value?.navigation || { prev: null, next: null })

const hasLoadError = computed(() => {
    if (newsError.value) return true
    return Boolean(newsDetailData.value && newsDetailData.value.success === false)
})

const errorMessage = computed(() => {
    return newsDetailData.value?.message || 'Không thể tải chi tiết bài viết'
})

const pageTitle = computed(() => 'Chi tiết tin tức' + (article.value?.title ? ` : ${article.value.title}` : ''))

const heroTitle = computed(() => {
    return article.value?.title || 'Chi tiết tin tức'
})

const heroDescription = computed(() => {
    return article.value?.excerpt || 'Cập nhật thông tin mới nhất về du học Nhật Bản'
})

const currentUrl = computed(() => {
    const base = (config.public.siteUrl || '').replace(/\/$/, '')
    const path = `/news/${article.value?.slug || String(route.params.slug || '')}`
    return base ? `${base}${path}` : path
})

const facebookShareUrl = computed(() => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl.value)}`)
const twitterShareUrl = computed(() => `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl.value)}&text=${encodeURIComponent(article.value?.title || '')}`)

const copyCurrentLink = async () => {
    if (!import.meta.client) return

    try {
        await navigator.clipboard.writeText(currentUrl.value)
    } catch {
        // Silently ignore clipboard errors to avoid interrupting reading flow.
    }
}

const formatDate = (value) => {
    if (!value) return '-'

    const formatted = formatSystemDate(value)
    return formatted === '-' ? '-' : formatted.split(' ').pop()
}

const formatViews = (value) => {
    return Number(value || 0).toLocaleString('vi-VN')
}

watch(
    () => payload.value?.data?.id,
    async (articleId) => {
        if (!import.meta.client || !articleId) return

        if (trackedArticleId.value === articleId) return

        const baseViewCount = Number(payload.value?.data?.view_count || 0)
        trackedArticleId.value = articleId
        liveViewCount.value = baseViewCount

        try {
            const response = await fetch(`${API_BASE}/public/news/${articleId}/view`, {
                method: 'POST'
            })

            const result = await response.json()

            if (response.ok && result.success) {
                liveViewCount.value = baseViewCount + 1
            }
        } catch {
            liveViewCount.value = baseViewCount
        }
    },
    { immediate: true }
)

useHead(() => {
    const metaTitle = 'Chi tiết tin tức' + (article.value?.metaTitle ? ` : ${article.value?.metaTitle}` : pageTitle.value)
    const metaDescription = article.value?.metaDescription || heroDescription.value

    return {
        title: metaTitle,
        meta: [
            { name: 'description', content: metaDescription },
            { property: 'og:title', content: metaTitle },
            { property: 'og:description', content: metaDescription },
            { property: 'og:url', content: currentUrl.value }
        ]
    }
})
</script>

<style scoped>
/* Article Detail Page Styles */
.article-detail-section {
    padding: 80px 0;
    background: #fff;
}

.news-state {
    padding: 2rem;
    text-align: center;
    color: #666;
    background: #f8f9fa;
    border-radius: 12px;
}

.news-state-error {
    color: #b71c1c;
}

.article-detail-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
}

/* Article Main */
.article-main {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.article-header {
    padding: 40px 40px 20px;
}

.article-category-tag {
    display: inline-block;
    background: #d32f2f;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 20px;
}

.article-header h1 {
    font-size: 2.2rem;
    color: #333;
    line-height: 1.3;
    margin-bottom: 20px;
    font-weight: 700;
}

.article-header .article-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.meta-info {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
}

.meta-info span {
    color: #666;
    font-size: 0.95rem;
}

.meta-info i {
    color: #d32f2f;
    margin-right: 5px;
}

.social-share {
    display: flex;
    align-items: center;
    gap: 10px;
}

.social-share span {
    color: #666;
    font-size: 0.9rem;
}

.share-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    text-decoration: none;
    color: white;
    transition: all 0.3s ease;
    border: none;
}

.share-btn.facebook {
    background: #3b5998;
}

.share-btn.twitter {
    background: #1da1f2;
}

.share-btn.tiktok {
    background: #69C9D0;
}

.share-btn.copy-link {
    background: #666;
}

.share-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Article Image */
.article-main .article-image {
    height: 400px;
    overflow: hidden;
}

.article-main .article-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.article-content {
    padding: 40px;
}

.article-body :deep(p) {
    color: #666;
    line-height: 1.7;
    margin-bottom: 15px;
    font-size: 1rem;
}

.article-body :deep(h2) {
    color: #333;
    font-size: 1.5rem;
    margin: 30px 0 15px;
    font-weight: 700;
}

.article-body :deep(h3) {
    color: #333;
    font-size: 1.3rem;
    margin: 25px 0 12px;
    font-weight: 600;
}

.article-body :deep(ul),
.article-body :deep(ol) {
    margin: 15px 0 15px 20px;
}

.article-body :deep(li) {
    color: #666;
    line-height: 1.6;
    margin-bottom: 8px;
}

.article-body :deep(blockquote) {
    margin: 20px 0;
    padding: 15px 20px;
    background: #f8f9fa;
    border-left: 4px solid #d32f2f;
    border-radius: 0 8px 8px 0;
    font-style: italic;
    color: #333;
}

.article-body :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
    margin: 15px 0;
}

.article-content>p {
    /* color: #fff; */
    line-height: 1.7;
    margin-bottom: 15px;
    font-size: 1rem;
}

.article-title > a {
    display: -webkit-box !important;
    
    -webkit-box-orient: vertical;
    overflow: hidden;
}

h4.article-title > a {
    line-clamp: 2;
    -webkit-line-clamp: 2;
}

.content-summary {
    background: #f8f9fa;
    padding: 20px;
    border-left: 4px solid #d32f2f;
    margin-bottom: 30px;
    border-radius: 0 8px 8px 0;
}

.content-summary p {
    margin: 0;
    font-size: 1.1rem;
    line-height: 1.6;
    color: #333;
}

.article-content strong {
    color: #333;
    font-weight: 600;
}

.article-content h3 {
    color: #333;
    font-size: 1.3rem;
    margin: 25px 0 12px;
    font-weight: 600;
    line-height: 1.4;
}

.article-content ul,
.article-content ol {
    margin: 15px 0 15px 20px;
}

.article-content li {
    color: #666;
    line-height: 1.6;
    margin-bottom: 8px;
}

.quote-box,
.editable-quote {
    margin: 30px 0;
    padding: 30px;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-left: 5px solid #d32f2f;
    border-radius: 0 10px 10px 0;
    position: relative;
}

.quote-box blockquote,
.editable-quote blockquote {
    margin: 0;
    font-size: 1.2rem;
    font-style: italic;
    color: #333;
    line-height: 1.6;
    position: relative;
}

.quote-box blockquote:before {
    content: '"';
    font-size: 3rem;
    color: #d32f2f;
    position: absolute;
    top: -10px;
    left: -15px;
    font-family: serif;
}

.process-steps {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin: 30px 0;
}

.process-step {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    padding: 25px;
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.process-step-number {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    border: 2px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    box-shadow: 0 8px 25px rgba(211, 47, 47, 0.3);
}

.process-step-content p {
    color: #666;
    margin: 0;
    font-size: 0.95rem;
}

.timeline {
    position: relative;
    margin: 30px 0;
    padding-left: 30px;
}

.timeline:before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #d32f2f;
}

.article-content .timeline-item {
    position: relative;
    margin-bottom: 30px;
}

.article-content .timeline-item:before {
    content: '';
    position: absolute;
    left: -23px;
    top: 5px;
    width: 12px;
    height: 12px;
    background: #d32f2f;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 2px #d32f2f;
}

.article-content.timeline-content {
    color: #666;
}

.tips-box {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 25px;
    margin: 30px 0;
    position: relative;
}

.tip-item,
.editable-tip {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 20px;
    position: relative;
}

.tip-item i {
    color: #d32f2f;
    font-size: 1.2rem;
    margin-top: 3px;
    flex-shrink: 0;
}

.article-content p {
    margin: 0;
    line-height: 1.6;
    color: #666;
    font-size: 1rem;
}

.article-tags {
    padding: 30px 40px 20px;
    border-top: 1px solid #f0f0f0;
}

.article-tags h3 {
    color: #333;
    font-size: 1.2rem;
    margin-bottom: 15px;
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.article-navigation {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 30px 40px 40px;
    border-top: 1px solid #f0f0f0;
}

.nav-btn {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    text-decoration: none;
    color: #333;
    transition: all 0.3s ease;
}

.nav-btn.prev {
    justify-content: flex-start;
}

.nav-btn i {
    font-size: 1.2rem;
    color: #d32f2f;
}

.nav-btn span {
    font-size: 0.9rem;
    opacity: 0.8;
}

.nav-btn h4 {
    font-size: 1rem;
    margin: 5px 0 0;
    line-height: 1.4;
}

.nav-btn.next {
    justify-content: flex-end;
}

.article-sidebar {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.quick-info {
    margin-bottom: 20px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;
}

.info-item i {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.info-item div span {
    display: block;
    color: #999;
    font-size: 0.9rem;
}

.info-item div strong {
    color: #333;
    font-size: 1rem;
    font-weight: 600;
}

.related-posts {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.related-post {
    display: flex;
    gap: 15px;
}

.related-post-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.related-post-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.related-post-content h4 a {
    color: #333;
    text-decoration: none;
    font-size: 1rem;
    line-height: 1.3;
    display: block;
    margin-bottom: 8px;
}

.related-date {
    color: #999;
    font-size: 0.85rem;
}

.sidebar-widget {
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.sidebar-widget h3 {
    color: #333;
    font-size: 1.3rem;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 3px solid #d32f2f;
    font-weight: 600;
}

/* Category List */
.category-list {
    list-style: none;
}

.category-list li {
    border-bottom: 1px solid #f0f0f0;
}

.category-list li:last-child {
    border-bottom: none;
}

.category-list a {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    color: #666;
    text-decoration: none;
    transition: color 0.3s ease;
}

.category-list a:hover {
    color: #d32f2f;
    padding-left: 10px;
}

.category-list span {
    color: #999;
    font-size: 0.9rem;
}

@media (max-width: 1024px) {
    /* ===================
    news detail style
    ===================== */
    .article-detail-content {
        grid-template-columns: 1fr;
        gap: 30px;
    }

    .article-header {
        padding: 30px 30px 15px;
    }

    .article-header h1 {
        font-size: 1.8rem;
    }

    .article-content {
        padding: 20px;
    }

    .editable-quote blockquote,
    .quote-box blockquote {
        font-size: 1.1rem;
        padding-left: 20px;
    }

    .process-steps {
        gap: 15px;
    }

    .process-step {
        padding: 20px;
        gap: 12px;
    }

    .step-content p {
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .tips-box,
    .editable-tips {
        padding: 20px;
    }

    .article-navigation {
        grid-template-columns: 1fr;
        gap: 15px;
    }
}

@media (max-width: 768px) {
    /* ===================
    news detail style 
    ===================== */
    .article-detail-section {
        padding: 60px 0;
    }

    .article-detail-content {
        gap: 25px;
    }

    .article-header {
        padding: 25px 20px 15px;
    }

    .article-header h1 {
        font-size: 1.5rem;
        line-height: 1.4;
    }

    .article-header .article-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .meta-info {
        flex-direction: column;
        gap: 10px;
    }

    .social-share {
        gap: 8px;
    }

    .share-btn {
        width: 30px;
        height: 30px;
    }

    .article-main .article-image {
        height: 250px;
    }

    .article-content {
        padding: 25px 20px;
    }

    .content-summary {
        padding: 15px;
    }

    .content-summary p {
        font-size: 1rem;
    }

    .article-content h2,
    .editable-h2 {
        font-size: 1.4rem;
        margin: 25px 0 12px;
    }

    .article-content h3,
    .editable-h3 {
        font-size: 1.2rem;
        margin: 20px 0 10px;
    }

    .quote-box,
    .editable-quote {
        padding: 20px;
        margin: 25px 0;
    }

    .tips-box,
    .editable-tips {
        padding: 15px;
        margin: 20px 0;
    }

    .tip-item,
    .editable-tip {
        gap: 12px;
        margin-bottom: 15px;
    }

    .process-steps {
        grid-template-columns: 1fr;
        gap: 20px;
        margin: 25px 0;
    }

    .process-step {
        gap: 10px;
        text-align: center;
        align-items: center;
    }

    .article-content .timeline:before {
        left: 12px;
    }

    .article-content .timeline-item:before {
        left: -25px;
    }

    .tip-item i {
        font-size: 1.1rem;
    }

    .article-tags {
        padding: 25px 20px 15px;
    }

    .article-tags h3 {
        font-size: 1.1rem;
        margin-bottom: 12px;
    }

    .tag-list {
        gap: 8px;
    }

    .article-tags .tag {
        font-size: 0.85rem;
    }

    .article-navigation {
        padding: 25px 20px 30px;
        gap: 12px;
    }

    .nav-btn {
        padding: 15px;
        gap: 12px;
    }

    .nav-btn span {
        font-size: 0.85rem;
    }

    .nav-btn h4 {
        font-size: 0.95rem;
    }

    .info-item {
        padding: 12px 0;
    }

    .info-item i {
        width: 35px;
        height: 35px;
    }

    .related-post {
        gap: 12px;
    }

    .related-post-image {
        width: 70px;
        height: 70px;
    }

    .related-post-content h4 a {
        font-size: 0.95rem;
    }
}

@media (max-width: 480px) {
    
}
</style>