<template>
    <div>
        <!-- Page Hero with simple props -->
        <PageHero
            :title="heroTitle"
            :subtitle="heroDescription"
            :breadcrumb-text="pageTitle"
        />

        <!-- News Content -->
        <section class="news-section">
            <div class="container">
                <div class="news-content">
                    <!-- Main Content -->
                    <div class="news-main">


                        <!-- Filter Categories -->
                        <!-- <div class="news-filter">
                            <div class="filter-tabs">
                                <button class="filter-btn active" @click="filterNews('all')">Tất cả</button>
                                <button class="filter-btn" @click="filterNews('scholarship')">Học bổng</button>
                                <button class="filter-btn" @click="filterNews('procedure')">Thủ tục</button>
                                <button class="filter-btn" @click="filterNews('experience')">Kinh nghiệm</button>
                                <button class="filter-btn" @click="filterNews('admission')">Tuyển sinh</button>
                            </div>
                            <div class="search-box">
                                <input v-model="searchQuery" type="text" placeholder="Tìm kiếm tin tức..."
                                    class="search-input">
                                <i class="fas fa-search"></i>
                            </div>
                        </div> -->

                        <div v-if="loading" class="news-state">Đang tải tin tức...</div>
                        <div v-else-if="error" class="news-state news-state-error">{{ error }}</div>
                        <template v-else>
                            <!-- Featured Article -->
                            <article class="featured-article" v-if="featuredArticle">
                                <div class="article-image">
                                    <img :src="featuredArticle.image" :alt="featuredArticle.title">
                                    <div class="article-category">{{ featuredArticle.category }}</div>
                                </div>
                                <div class="article-content">
                                    <h2 class="article-title">
                                        <NuxtLink :to="`/news/${featuredArticle.slug}`">{{ featuredArticle.title }}
                                        </NuxtLink>
                                    </h2>
                                    <div class="article-meta">
                                        <span class="article-date"><i class="fas fa-calendar"></i> {{
                                            formatDate(featuredArticle.date) }}</span>
                                        <span class="article-author"><i class="fas fa-user"></i> {{ featuredArticle.author
                                            }}</span>
                                        <span class="article-views"><i class="fas fa-eye"></i> {{ featuredArticle.views }}
                                            lượt xem</span>
                                    </div>
                                    <p class="article-excerpt">{{ featuredArticle.excerpt }}</p>
                                    <NuxtLink :to="`/news/${featuredArticle.slug}`" class="read-more">
                                        Đọc tiếp <i class="fas fa-arrow-right"></i>
                                    </NuxtLink>
                                </div>
                            </article>

                            <!-- News Grid -->
                            <div class="news-grid" v-if="filteredNews.length">
                                <article class="news-card" v-for="article in filteredNews" :key="article.id">
                                    <div class="news-image">
                                        <img :src="article.image" :alt="article.title">
                                        <div class="article-category">{{ article.category }}</div>
                                    </div>
                                    <div class="news-card-content">
                                        <h3 class="article-title">
                                            <NuxtLink :to="`/news/${article.slug}`">{{ article.title }}</NuxtLink>
                                        </h3>
                                        <div class="article-meta">
                                            <span><i class="fas fa-calendar"></i> {{ formatDate(article.date) }}</span>
                                            <span><i class="fas fa-eye"></i> {{ article.views }} lượt xem</span>
                                        </div>
                                        <p class="article-excerpt">{{ article.excerpt }}</p>
                                        <NuxtLink :to="`/news/${article.slug}`" class="read-more">Đọc tiếp <i class="fas fa-arrow-right"></i></NuxtLink>
                                    </div>
                                </article>
                            </div>
                            <div v-else class="news-state">Không có bài viết phù hợp.</div>

                            <!-- Pagination -->
                            <div class="pagination" v-if="totalPages > 1">
                                <button @click="changePage(currentPage - 1)" :disabled="currentPage <= 1" class="page-btn">
                                    <i class="fas fa-chevron-left"></i> Trước
                                </button>

                                <span v-for="page in visiblePages" :key="page">
                                    <button @click="changePage(page)"
                                        :class="['page-btn', { active: page === currentPage }]">
                                        {{ page }}
                                    </button>
                                </span>

                                <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages"
                                    class="page-btn">
                                    Sau <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </template>
                    </div>

                    <!-- Sidebar -->
                    <aside class="news-sidebar">
                        <!-- Search -->
                        <div class="sidebar-widget">
                            <h3>Tìm Kiếm</h3>
                            <form class="search-form" @submit.prevent="searchArticles">
                                <input v-model="searchQuery" type="text" placeholder="Tìm kiếm tin tức...">
                                <button type="submit"><i class="fas fa-search"></i></button>
                            </form>
                        </div>

                        <!-- Categories -->
                        <div class="sidebar-widget">
                            <h3>Danh Mục</h3>
                            <ul class="category-list">
                                <li>
                                    <button type="button" class="category-btn"
                                        :class="{ active: currentCategory === 'all' }" @click="selectCategory('all')">
                                        Tất cả
                                        <span>({{ totalPublishedCount }})</span>
                                    </button>
                                </li>
                                <li v-for="category in categories" :key="category.slug">
                                    <button type="button" class="category-btn"
                                        :class="{ active: currentCategory === category.slug }"
                                        @click="selectCategory(category.slug)">
                                        {{ category.name }}
                                        <span>({{ category.news_count }})</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <!-- Recent Posts -->
                        <div class="sidebar-widget">
                            <h3>Bài Viết Mới</h3>
                            <div class="recent-posts">
                                <div class="recent-post" v-for="post in recentPosts" :key="`recent-${post.id}`">
                                    <div class="recent-post-image">
                                        <img :src="post.image" :alt="post.title">
                                    </div>
                                    <div class="recent-post-content">
                                        <h4 class="article-title">
                                            <NuxtLink :to="`/news/${post.slug}`">{{ post.title }}</NuxtLink>
                                        </h4>
                                        <span class="recent-date">{{ formatDate(post.date) }}</span>
                                    </div>
                                </div>
                                <div v-if="!recentPosts.length" class="recent-date">Chưa có bài viết mới.</div>
                            </div>
                        </div>

                        <!-- Popular Tags -->
                        <div class="sidebar-widget">
                            <h3>Từ Khóa Phổ Biến</h3>
                            <div class="tag-cloud">
                                <span href="#" class="tag">Du học Nhật Bản</span>
                                <span href="#" class="tag">Học bổng</span>
                                <span href="#" class="tag">Visa</span>
                                <span href="#" class="tag">JLPT</span>
                                <span href="#" class="tag">Tokyo</span>
                                <span href="#" class="tag">Osaka</span>
                                <span href="#" class="tag">Trường Nhật ngữ</span>
                                <span href="#" class="tag">Chi phí</span>
                                <span href="#" class="tag">Thủ tục</span>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { formatDate as formatSystemDate } from '~/utils/date'

const config = useRuntimeConfig()
const { data: staticPageData } = await useFetch(`${config.public.apiBase}/public/static-pages/news`, {
    key: 'public-static-page-news'
})
const staticPage = computed(() => staticPageData.value?.data || {})

const { seo: siteSeo } = useSiteSeo()
const currentPageOgUrl = useAbsolutePageUrl({
    baseUrl: () => siteSeo.value.siteUrl
})

const pageTitle = computed(() => staticPage.value.title || 'Tin Tức')

const heroTitle = computed(() => staticPage.value.hero_title || 'Tin Tức Mới Nhất')

const heroDescription = computed(() => {
    return staticPage.value.hero_description || 'Cập nhật những tin tức mới nhất về du học Nhật Bản'
})

// SEO
useSeoMeta({
    title: () =>
        staticPage.value.meta_title ||
        siteSeo.value.defaultTitle,

    description: () =>
        staticPage.value.meta_description ||
        siteSeo.value.defaultDescription,

    ogTitle: () =>
        staticPage.value.meta_title ||
        siteSeo.value.defaultTitle,

    ogDescription: () =>
        staticPage.value.meta_description ||
        siteSeo.value.defaultDescription,

    ogImage: () => siteSeo.value.defaultOgImage,

    ogType: 'website'
})

useHead(() => ({
    meta: [
        {
            property: 'og:url',
            content: currentPageOgUrl.value
        }
    ]
}))

const newsDescription = computed(() => {
    return newsInfo.value.siteDescription || 'Cập nhật những tin tức mới nhất về du học Nhật Bản'
})

const API_BASE = config.public.apiBase
const DEFAULT_NEWS_IMAGE = '/assets/images/news-1.jpg'

const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const currentCategory = ref('all')
const currentPage = ref(1)
const itemsPerPage = 6

const newsData = ref([])
const featuredArticle = ref(null)
const categories = ref([])
const recentPosts = ref([])
const totalItems = ref(0)
const totalPages = ref(1)

const normalizeNewsItem = (item = {}) => ({
    id: item.id,
    slug: item.slug,
    title: item.title || 'Bài viết không có tiêu đề',
    excerpt: item.excerpt || 'Nội dung đang được cập nhật.',
    image: item.thumbnail_url || DEFAULT_NEWS_IMAGE,
    category: item.category_name || 'Tin tức',
    categorySlug: item.category_slug || 'all',
    author: item.author_name || 'Ban biên tập',
    date: item.published_at || item.created_at || null,
    views: Number(item.view_count || 0)
})

const filteredNews = computed(() => {
    if (!featuredArticle.value) return newsData.value
    return newsData.value.filter((item) => item.id !== featuredArticle.value.id)
})

const totalPublishedCount = computed(() => {
    if (!categories.value.length) return totalItems.value
    return categories.value.reduce((sum, item) => sum + Number(item.news_count || 0), 0)
})

const popularTags = computed(() => {
    return categories.value
        .filter((item) => Number(item.news_count || 0) > 0)
        .slice(0, 9)
        .map((item) => ({
            name: item.name,
            slug: item.slug
        }))
})

const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    return pages
})

const fetchNews = async () => {
    loading.value = true
    error.value = ''

    try {
        const params = new URLSearchParams({
            page: String(currentPage.value),
            limit: String(itemsPerPage),
            search: searchQuery.value.trim()
        })

        if (currentCategory.value !== 'all') {
            params.set('category', currentCategory.value)
        }

        const response = await fetch(`${API_BASE}/public/news?${params.toString()}`)
        const payload = await response.json()

        if (!response.ok || !payload.success) {
            throw new Error(payload.message || `HTTP ${response.status}`)
        }

        const mappedData = (payload.data || []).map(normalizeNewsItem)
        const featured = payload.featured ? normalizeNewsItem(payload.featured) : null

        featuredArticle.value = featured
        newsData.value = mappedData
        categories.value = payload.categories || []
        recentPosts.value = (payload.recent || []).map(normalizeNewsItem)
        totalItems.value = Number(payload.pagination?.total || mappedData.length)
        totalPages.value = Math.max(1, Number(payload.pagination?.totalPages || 1))
    } catch (err) {
        newsData.value = []
        featuredArticle.value = null
        categories.value = []
        recentPosts.value = []
        totalItems.value = 0
        totalPages.value = 1
        error.value = err.message || 'Không thể tải tin tức lúc này.'
    } finally {
        loading.value = false
    }
}

const searchArticles = async () => {
    currentPage.value = 1
    await fetchNews()
}

const selectCategory = async (slug) => {
    currentCategory.value = slug
    currentPage.value = 1
    await fetchNews()
}

const changePage = async (page) => {
    if (page < 1 || page > totalPages.value) return

    currentPage.value = page
    await fetchNews()
    document.querySelector('.news-section')?.scrollIntoView({ behavior: 'smooth' })
}

const formatDate = (dateString) => {
    if (!dateString) return '--/--/----'

    const formatted = formatSystemDate(dateString)
    return formatted === '-' ? '--/--/----' : formatted.split(' ').pop()
}

onMounted(async () => {
    await fetchNews()
})

</script>

<style scoped>
/* ==================
news page style
===================== */


/* News Page Styles */
.news-section {
    padding: 80px 0;
    background: #fff;
}

.news-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
}

.news-state {
    padding: 24px;
    border-radius: 12px;
    background: #f8f9fa;
    color: #444;
    text-align: center;
    margin-bottom: 24px;
    font-weight: 500;
}

.news-state-error {
    background: #fdecea;
    color: #b42318;
}

/* Featured Article */
.featured-article {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    margin-bottom: 40px;
}

.featured-article .article-image {
    position: relative;
    height: 300px;
    overflow: hidden;
}

.featured-article .article-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.article-category {
    position: absolute;
    top: 20px;
    left: 20px;
    background: #d32f2f;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

.article-title > a {
    display: -webkit-box !important;
    
    -webkit-box-orient: vertical;
    overflow: hidden;
}

h2.article-title > a {
    -webkit-line-clamp: 2;
}

h3.article-title > a, h4.article-title > a {
    -webkit-line-clamp: 3;
}

.featured-article .article-content {
    padding: 30px;
}

.featured-article .article-content {
    padding: 30px;
}

.featured-article h2 a {
    color: #333;
    text-decoration: none;
    font-size: 1.6rem;
    line-height: 1.4;
    margin-bottom: 15px;
}

.featured-article h2 a:hover {
    color: #d32f2f;
}

.article-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
    font-size: 0.9rem;
    color: #666;
}

.article-meta span i {
    margin-right: 5px;
    color: #d32f2f;
}

.featured-article p {
    color: #666;
    line-height: 1.7;
    margin-bottom: 20px;
}

.read-more {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #d32f2f;
    text-decoration: none;
    font-weight: 500;
    transition: gap 0.3s ease;
}

.read-more:hover {
    gap: 12px;
}

/* News Grid */
.news-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-bottom: 40px;
}

.news-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.news-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.news-image {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.news-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.news-card:hover .news-image img {
    transform: scale(1.05);
}

.news-card-content {
    padding: 25px;
}

.news-card-content h3 a {
    color: #333;
    text-decoration: none;
    font-size: 1.2rem;
    line-height: 1.4;
    margin-bottom: 12px;
}

.news-card-content h3 a:hover {
    color: #d32f2f;
}

.news-card-content .article-meta {
    margin-bottom: 12px;
    gap: 15px;
}

.news-card-content p.article-excerpt {
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
    font-size: 0.95rem;
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.page-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    color: #666;
    background: #fff;
    padding: 0 12px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled),
.page-btn.active {
    background: #d32f2f;
    border-color: #d32f2f;
    color: #fff;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    color: #666;
    text-decoration: none;
    transition: all 0.3s ease;
}

.page-link:hover,
.page-link.active {
    background: #d32f2f;
    border-color: #d32f2f;
    color: white;
}

/* Sidebar */
.news-sidebar {
    display: flex;
    flex-direction: column;
    gap: 30px;
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

/* Search Form */
.search-form {
    display: flex;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
}

.search-form input {
    flex: 1;
    padding: 12px 15px;
    border: none;
    outline: none;
    font-size: 1rem;
}

.search-form button {
    padding: 12px 15px;
    background: #d32f2f;
    border: none;
    color: white;
    cursor: pointer;
    transition: background 0.3s ease;
}

.search-form button:hover {
    background: #b71c1c;
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

.category-btn {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    color: #666;
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: color 0.3s ease, padding-left 0.3s ease;
}

.category-btn:hover,
.category-btn.active {
    color: #d32f2f;
    padding-left: 10px;
}

.category-list span {
    color: #999;
    font-size: 0.9rem;
}

/* Recent Posts */
.recent-posts {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.recent-post {
    display: flex;
    gap: 15px;
}

.recent-post-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.recent-post-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.recent-post-content h4 a {
    color: #333;
    text-decoration: none;
    font-size: 1rem;
    line-height: 1.3;
    display: block;
    /* margin-bottom: 8px; */
}

.recent-post-content h4 a:hover {
    color: #d32f2f;
}

.recent-date {
    color: #999;
    font-size: 0.85rem;
}

/* Tag Cloud */
.tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.tag {
    padding: 6px 12px;
    background: #f8f9fa;
    color: #666;
    text-decoration: none;
    border-radius: 20px;
    font-size: 0.9rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.tag:hover {
    background: #d32f2f;
    color: white;
}

.article-content h2 {
    color: #333;
    font-size: 1.6rem;
    margin: 30px 0 15px;
    font-weight: 600;
    line-height: 1.4;
}

@media (max-width: 1024px) {
    /* ===================
    news style
    ===================== */
    .news-content {
        grid-template-columns: 1fr;
        gap: 30px;
    }

    .featured-article .article-image {
        height: 250px;
    }

    .featured-article h2 a {
        font-size: 1.4rem;
    }

    .news-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 25px;
    }

    .sidebar-widget {
        padding: 25px;
    }
}

@media (max-width: 768px) {
    /* ===================
    news style 
    ===================== */
    .news-section {
        padding: 60px 0;
    }

    .featured-article .article-image {
        height: 200px;
    }

    .featured-article .article-content {
        padding: 25px 20px;
    }

    .article-content h2 {
        font-size: 1.4rem;
        margin: 25px 0 12px;
    }

    .featured-article h2 a {
        font-size: 1.3rem;
    }

    .article-meta {
        flex-wrap: wrap;
    }

    .news-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .news-image {
        height: 180px;
    }

    .news-card-content {
        padding: 20px;
    }

    .news-card-content h3 a {
        font-size: 1.1rem;
    }

    .pagination {
        gap: 8px;
    }

    .page-link {
        width: 35px;
        height: 35px;
    }

    .sidebar-widget {
        padding: 20px;
    }

    .sidebar-widget h3 {
        font-size: 1.2rem;
        margin-bottom: 15px;
    }

    .recent-post {
        gap: 12px;
    }

    .recent-post-image {
        width: 70px;
        height: 70px;
    }
}

@media (max-width: 480px) {
    
}
</style>