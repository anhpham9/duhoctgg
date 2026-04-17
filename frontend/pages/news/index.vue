<template>
    <div>
        <!-- Page Hero with simple props -->
        <PageHero title="Tin Tức Du Học" subtitle="Cập nhật thông tin mới nhất về du học Nhật Bản"
            breadcrumb-text="Tin tức" />

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

                        <!-- Featured Article -->
                        <article class="featured-article" v-if="featuredArticle">
                            <div class="article-image">
                                <img :src="featuredArticle.image" :alt="featuredArticle.title">
                                <div class="article-category">{{ featuredArticle.category }}</div>
                            </div>
                            <div class="article-content">
                                <h2>
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
                                <p>{{ featuredArticle.excerpt }}</p>
                                <NuxtLink :to="`/news/${featuredArticle.slug}`" class="read-more">
                                    Đọc tiếp <i class="fas fa-arrow-right"></i>
                                </NuxtLink>
                            </div>
                        </article>

                        <!-- News Grid -->
                        <div class="news-grid">
                            <article class="news-card" v-for="article in filteredNews" :key="article.id">
                                <div class="news-image">
                                    <img :src="article.image" :alt="article.title">
                                    <div class="article-category">{{ article.category }}</div>
                                </div>
                                <div class="news-card-content">
                                    <h3>
                                        <NuxtLink :to="`/news/${article.slug}`">{{ article.title }}</NuxtLink>
                                    </h3>
                                    <div class="article-meta">
                                        <span><i class="fas fa-calendar"></i> {{ formatDate(article.date) }}</span>
                                        <span><i class="fas fa-eye"></i> {{ article.views }} lượt xem</span>
                                    </div>
                                    <p>{{ article.excerpt }}</p>
                                    <NuxtLink :to="`/news/${article.slug}`" class="read-more">Đọc tiếp</NuxtLink>
                                </div>
                            </article>
                        </div>

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
                                <li><a href="#">Tin Nổi Bật <span>(12)</span></a></li>
                                <li><a href="#">Học Bổng <span>(28)</span></a></li>
                                <li><a href="#">Thủ Tục Visa <span>(15)</span></a></li>
                                <li><a href="#">Kinh Nghiệm <span>(22)</span></a></li>
                                <li><a href="#">Tuyển Sinh <span>(18)</span></a></li>
                                <li><a href="#">Cẩm Nang <span>(25)</span></a></li>
                                <li><a href="#">Chi Phí <span>(10)</span></a></li>
                            </ul>
                        </div>

                        <!-- Recent Posts -->
                        <div class="sidebar-widget">
                            <h3>Bài Viết Mới</h3>
                            <div class="recent-posts">
                                <div class="recent-post">
                                    <div class="recent-post-image">
                                        <img src="/assets/images/recent-1.jpg" alt="Bài viết mới">
                                    </div>
                                    <div class="recent-post-content">
                                        <h4><a href="news-detail.html">Học Bổng JASSO 2024 - Hỗ Trợ 80,000
                                                Yên/Tháng</a></h4>
                                        <span class="recent-date">15/03/2024</span>
                                    </div>
                                </div>
                                <div class="recent-post">
                                    <div class="recent-post-image">
                                        <img src="/assets/images/recent-2.jpg" alt="Bài viết mới">
                                    </div>
                                    <div class="recent-post-content">
                                        <h4><a href="#">Các Ngành Học Hot Tại Nhật Bản Năm 2024</a></h4>
                                        <span class="recent-date">14/03/2024</span>
                                    </div>
                                </div>
                                <div class="recent-post">
                                    <div class="recent-post-image">
                                        <img src="/assets/images/recent-3.jpg" alt="Bài viết mới">
                                    </div>
                                    <div class="recent-post-content">
                                        <h4><a href="#">Kinh Nghiệm Thi JLPT N3 Từ Cơ Bản</a></h4>
                                        <span class="recent-date">13/03/2024</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Popular Tags -->
                        <div class="sidebar-widget">
                            <h3>Từ Khóa Phổ Biến</h3>
                            <div class="tag-cloud">
                                <a href="#" class="tag">Du học Nhật Bản</a>
                                <a href="#" class="tag">Học bổng</a>
                                <a href="#" class="tag">Visa</a>
                                <a href="#" class="tag">JLPT</a>
                                <a href="#" class="tag">Tokyo</a>
                                <a href="#" class="tag">Osaka</a>
                                <a href="#" class="tag">Trường Nhật ngữ</a>
                                <a href="#" class="tag">Chi phí</a>
                                <a href="#" class="tag">Thủ tục</a>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Reactive data
const searchQuery = ref('')
const currentCategory = ref('all')
const currentPage = ref(1)
const itemsPerPage = 6

// Sample news data
const newsData = ref([
    {
        id: 1,
        slug: 'hoc-bong-mext-2024',
        title: 'Học Bổng Toàn Phần Du Học Nhật Bản 2024 - Cơ Hội Vàng Cho Sinh Viên Việt Nam',
        excerpt: 'Chính phủ Nhật Bản vừa công bố chương trình học bổng MEXT 2024 dành cho sinh viên quốc tế. Đây là cơ hội tuyệt vời để theo đuổi ước mơ du học với chi phí hoàn toàn miễn phí.',
        image: '/assets/images/news-1.jpg',
        category: 'Học bổng',
        categorySlug: 'scholarship',
        author: 'Admin',
        date: '2024-03-15',
        views: 1250,
        featured: true
    },
    {
        id: 2,
        slug: 'top-10-truong-dai-hoc-nhat-ban',
        title: 'Top 10 Trường Đại Học Nhật Bản Dễ Xin Học Bổng Nhất 2024',
        excerpt: 'Danh sách 10 trường đại học hàng đầu tại Nhật Bản có tỷ lệ cấp học bổng cao nhất cho sinh viên quốc tế với các ngành học phổ biến.',
        image: '/assets/images/news-2.jpg',
        category: 'Học bổng',
        categorySlug: 'scholarship',
        author: 'Tư vấn viên',
        date: '2024-03-12',
        views: 890
    },
    {
        id: 3,
        slug: 'huong-dan-lam-ho-so-visa',
        title: 'Hướng Dẫn Làm Hồ Sơ Xin Visa Du Học Nhật Bản 2024',
        excerpt: 'Quy trình làm visa du học Nhật Bản từ A-Z với những lưu ý quan trọng để tăng tỷ lệ thành công lên 95%.',
        image: '/assets/images/news-3.jpg',
        category: 'Thủ tục',
        categorySlug: 'procedure',
        author: 'Chuyên gia Visa',
        date: '2024-03-10',
        views: 1120
    },
    {
        id: 4,
        slug: 'cuoc-song-du-hoc-sinh-tokyo',
        title: 'Cuộc Sống Du Học Sinh Việt Nam Tại Tokyo - Chia Sẻ Thực Tế',
        excerpt: 'Những trải nghiệm thực tế về cuộc sống, học tập và làm thêm của du học sinh Việt Nam tại Tokyo với chi phí cụ thể.',
        image: '/assets/images/news-4.jpg',
        category: 'Kinh nghiệm',
        categorySlug: 'experience',
        author: 'Du học sinh',
        date: '2024-03-08',
        views: 750
    },
    {
        id: 5,
        slug: 'truong-nhat-ngu-tokyo-tuyen-sinh',
        title: 'Các Trường Nhật Ngữ Uy Tín Tại Tokyo - Thông Tin Tuyển Sinh 2024',
        excerpt: 'Cập nhật thông tin tuyển sinh mới nhất của các trường Nhật ngữ hàng đầu tại Tokyo với học phí và điều kiện nhập học.',
        image: '/assets/images/news-5.jpg',
        category: 'Tuyển sinh',
        categorySlug: 'admission',
        author: 'Tư vấn viên',
        date: '2024-03-05',
        views: 980
    },
    {
        id: 6,
        slug: 'kinh-nghiem-thi-jlpt-n1',
        title: 'Bí Quyết Thi JLPT N1 Thành Công Từ Những Du Học Sinh Đạt Điểm Cao',
        excerpt: 'Chia sẻ phương pháp học và chiến lược thi JLPT N1 từ những du học sinh đạt điểm cao, giúp bạn chuẩn bị hiệu quả.',
        image: '/assets/images/news-6.jpg',
        category: 'Kinh nghiệm',
        categorySlug: 'experience',
        author: 'Du học sinh',
        date: '2024-03-03',
        views: 650
    }
])

// Featured article
const featuredArticle = computed(() => {
    return newsData.value.find(article => article.featured)
})

// Filtered and paginated news
const filteredNews = computed(() => {
    let filtered = newsData.value.filter(article => !article.featured)

    // Filter by category
    if (currentCategory.value !== 'all') {
        filtered = filtered.filter(article => article.categorySlug === currentCategory.value)
    }

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(article =>
            article.title.toLowerCase().includes(query) ||
            article.excerpt.toLowerCase().includes(query)
        )
    }

    // Paginate
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filtered.slice(start, end)
})

// Pagination
const totalItems = computed(() => {
    let filtered = newsData.value.filter(article => !article.featured)

    if (currentCategory.value !== 'all') {
        filtered = filtered.filter(article => article.categorySlug === currentCategory.value)
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(article =>
            article.title.toLowerCase().includes(query) ||
            article.excerpt.toLowerCase().includes(query)
        )
    }

    return filtered.length
})

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

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

// Methods
const filterNews = (category) => {
    currentCategory.value = category
    currentPage.value = 1

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'))
    event.target.classList.add('active')
}

const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        // Scroll to top of news section
        document.querySelector('.news-section').scrollIntoView({ behavior: 'smooth' })
    }
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

// Watch search query and reset page
watch(searchQuery, () => {
    currentPage.value = 1
})

// SEO
useHead({
    title: 'Tin Tức Du Học Nhật Bản - Du Học NB',
    meta: [
        {
            name: 'description',
            content: 'Cập nhật tin tức mới nhất về du học Nhật Bản, học bổng, thủ tục visa, kinh nghiệm du học sinh và thông tin tuyển sinh các trường.'
        }
    ]
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

.featured-article .article-content {
    padding: 30px;
}

.featured-article h2 a {
    color: #333;
    text-decoration: none;
    font-size: 1.6rem;
    line-height: 1.4;
    margin-bottom: 15px;
    display: block;
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
    display: block;
}

.news-card-content h3 a:hover {
    color: #d32f2f;
}

.news-card-content .article-meta {
    margin-bottom: 12px;
    gap: 15px;
}

.news-card-content p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
    font-size: 0.95rem;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    gap: 10px;
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
    margin-bottom: 8px;
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