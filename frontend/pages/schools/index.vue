<template>
    <div class="schools-container">
        <!-- Page Hero with advanced breadcrumb -->
        <PageHero title="Danh sách trường Nhật Ngữ" subtitle="Danh sách các trường Nhật ngữ hàng đầu tại Nhật Bản"
            :breadcrumb-items="[
                { text: 'Trường Nhật Ngữ' }
            ]" />

        <!-- Schools List Section -->
        <section class="schools-section">
            <div class="container">
                <!-- <div class="section-header text-center">
                    <h2>Các Trường Nhật Ngữ Uy Tín</h2>
                    <p>Danh sách 5 trường nhật ngữ hàng đầu được Du Học NB khuyến nghị</p>
                </div> -->

                <!-- Filter và Search -->
                <div class="schools-filter">
                    <div class="filter-tabs">
                        <button class="filter-btn active" data-location="all">Tất cả</button>
                        <button class="filter-btn" data-location="tokyo">Tokyo</button>
                        <button class="filter-btn" data-location="osaka">Osaka</button>
                        <button class="filter-btn" data-location="kyoto">Kyoto</button>
                    </div>
                    <div class="search-box">
                        <input type="text" placeholder="Tìm kiếm trường..." class="search-input">
                        <i class="fas fa-search"></i>
                    </div>
                </div>

                <!-- Schools Grid -->
                <div class="schools-grid">
                    <div class="school-card" v-for="school in schools" :key="school.id"
                        :data-location="school.location">
                        <div class="school-image">
                            <img :src="school.image" :alt="school.name">
                            <div class="school-badge" :class="school.badgeType">{{ school.badge }}</div>
                            <div class="school-rating">
                                <div class="stars">
                                    <i v-for="i in 5" :key="i"
                                        :class="i <= school.rating ? 'fas fa-star' : 'far fa-star'"></i>
                                </div>
                                <span>{{ school.rating }}</span>
                            </div>
                        </div>
                        <div class="school-content">
                            <div class="school-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>{{ school.fullLocation }}</span>
                            </div>
                            <h3>{{ school.name }}</h3>
                            <p class="school-description">{{ school.description }}</p>

                            <div class="school-highlights">
                                <div class="highlight-item" v-for="highlight in school.highlights"
                                    :key="highlight.label">
                                    <i :class="highlight.icon"></i>
                                    <div>
                                        <span>{{ highlight.label }}</span>
                                        <strong>{{ highlight.value }}</strong>
                                    </div>
                                </div>
                            </div>

                            <div class="school-features">
                                <span v-for="feature in school.features" :key="feature" class="feature-tag">
                                    {{ feature }}
                                </span>
                            </div>

                            <div class="school-pricing">
                                <div class="price">
                                    <span class="price-label">Học phí/năm</span>
                                    <span class="price-amount">{{ school.tuition }}</span>
                                </div>
                                <div class="school-actions">
                                    <NuxtLink :to="`/schools/${school.slug}`" class="btn btn-primary">Chi Tiết
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Comparison Section -->
                <div class="comparison-section">
                    <h3>So Sánh Nhanh</h3>
                    <div class="comparison-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Trường</th>
                                    <th>Vị trí</th>
                                    <th>Học phí/năm</th>
                                    <th>Sĩ số lớp</th>
                                    <th>Tỷ lệ thành công</th>
                                    <th>Đặc điểm</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>ISI Language School</td>
                                    <td>Tokyo</td>
                                    <td>780,000¥</td>
                                    <td>15-20</td>
                                    <td>95%</td>
                                    <td>Tỷ lệ cao, chất lượng tốt</td>
                                </tr>
                                <tr>
                                    <td>Human Academy</td>
                                    <td>Osaka</td>
                                    <td>720,000¥</td>
                                    <td>18-22</td>
                                    <td>92%</td>
                                    <td>JLPT, văn hóa</td>
                                </tr>
                                <tr>
                                    <td>Kyoto Institute</td>
                                    <td>Kyoto</td>
                                    <td>650,000¥</td>
                                    <td>12-18</td>
                                    <td>88%</td>
                                    <td>Văn hóa truyền thống</td>
                                </tr>
                                <tr>
                                    <td>Intercultural Institute</td>
                                    <td>Tokyo</td>
                                    <td>850,000¥</td>
                                    <td>10-15</td>
                                    <td>94%</td>
                                    <td>Quốc tế, linh hoạt</td>
                                </tr>
                                <tr>
                                    <td>Osaka YMCA</td>
                                    <td>Osaka</td>
                                    <td>580,000¥</td>
                                    <td>20-25</td>
                                    <td>85%</td>
                                    <td>Học phí hợp lý</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref } from 'vue'

// Schools data
const schools = ref([
    {
        id: 1,
        slug: 'isi-language-school-tokyo',
        name: 'ISI Language School Tokyo',
        location: 'tokyo',
        fullLocation: 'Tokyo, Nhật Bản',
        description: 'Trường nhật ngữ hàng đầu tại Tokyo với chất lượng giảng dạy xuất sắc và tỷ lệ đỗ đại học cao.',
        image: '/assets/images/school-1.jpg',
        badge: 'Nổi Bật',
        badgeType: 'featured',
        rating: 5.0,
        tuition: '780,000 Yên',
        highlights: [
            { icon: 'fas fa-users', label: 'Sĩ số lớp', value: '15-20 học sinh' },
            { icon: 'fas fa-graduation-cap', label: 'Tỷ lệ đỗ đại học', value: '95%' },
            { icon: 'fas fa-calendar-alt', label: 'Thời gian học', value: '6 tháng - 2 năm' }
        ],
        features: ['JLPT N1-N5', 'EJU Support', 'Hỗ trợ visa', 'Ký túc xá']
    },
    {
        id: 2,
        slug: 'human-academy-japanese-language',
        name: 'Human Academy Japanese Language School',
        location: 'osaka',
        fullLocation: 'Osaka, Nhật Bản',
        description: 'Trường nhật ngữ với hệ thống giảng dạy hiện đại, đặc biệt mạnh về chuẩn bị thi JLPT và EJU.',
        image: '/assets/images/school-2.jpg',
        badge: 'Phổ Biến',
        badgeType: 'popular',
        rating: 4.5,
        tuition: '720,000 Yên',
        highlights: [
            { icon: 'fas fa-users', label: 'Sĩ số lớp', value: '18-22 học sinh' },
            { icon: 'fas fa-graduation-cap', label: 'Tỷ lệ đỗ JLPT', value: '92%' },
            { icon: 'fas fa-calendar-alt', label: 'Thời gian học', value: '3 tháng - 2 năm' }
        ],
        features: ['JLPT Focused', 'Văn hóa Nhật', 'Part-time job', 'Homestay']
    },
    {
        id: 3,
        slug: 'kyoto-institute-culture-language',
        name: 'Kyoto Institute of Culture and Language',
        location: 'kyoto',
        fullLocation: 'Kyoto, Nhật Bản',
        description: 'Trường nhật ngữ tại cố đô Kyoto, chuyên về giáo dục văn hóa và ngôn ngữ.',
        image: '/assets/images/school-3.jpg',
        badge: 'Văn Hóa',
        badgeType: 'cultural',
        rating: 4.2,
        tuition: '650,000 Yên',
        highlights: [
            { icon: 'fas fa-users', label: 'Sĩ số lớp', value: '12-18 học sinh' },
            { icon: 'fas fa-graduation-cap', label: 'Tỷ lệ hoàn thành', value: '88%' },
            { icon: 'fas fa-calendar-alt', label: 'Thời gian học', value: '6 tháng - 1.5 năm' }
        ],
        features: ['Văn hóa truyền thống', 'Tea ceremony', 'Calligraphy', 'Temple visits']
    },
    {
        id: 4,
        slug: 'kyoto-institute-culture-language-2',
        name: 'Kyoto Institute of Culture and Language',
        location: 'kyoto',
        fullLocation: 'Kyoto, Nhật Bản',
        description: 'Trường nhật ngữ tại cố đô Kyoto, chuyên về giáo dục văn hóa và ngôn ngữ.',
        image: '/assets/images/school-4.jpg',
        badge: 'Quốc Tế',
        badgeType: 'international',
        rating: 4.2,
        tuition: '650,000 Yên',
        highlights: [
            { icon: 'fas fa-users', label: 'Sĩ số lớp', value: '12-18 học sinh' },
            { icon: 'fas fa-graduation-cap', label: 'Tỷ lệ hoàn thành', value: '88%' },
            { icon: 'fas fa-calendar-alt', label: 'Thời gian học', value: '6 tháng - 1.5 năm' }
        ],
        features: ['Văn hóa truyền thống', 'Tea ceremony', 'Calligraphy', 'Temple visits']
    }
])
</script>
<style scoped>
/* ========== JAPANESE SCHOOLS PAGE ========== */

/* Schools Section */
.schools-section {
    padding: 80px 0;
    background: #fff;
}

/* Filter and Search */
.schools-filter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 40px 0 50px;
    gap: 20px;
}

.filter-tabs {
    display: flex;
    gap: 10px;
}

.filter-btn {
    padding: 10px 20px;
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 25px;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
}

.filter-btn:hover,
.filter-btn.active {
    background: #d32f2f;
    border-color: #d32f2f;
    color: white;
}

.search-box {
    position: relative;
    max-width: 300px;
}

.search-input {
    width: 100%;
    padding: 10px 40px 10px 15px;
    border: 2px solid #e9ecef;
    border-radius: 25px;
    outline: none;
    transition: all 0.3s ease;
}

.search-input:focus {
    border-color: #d32f2f;
}

.search-box i {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

/* Schools Grid */
.schools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 30px;
    margin-bottom: 60px;
}

/* School Card */
.school-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border: 1px solid #f0f0f0;
}

.school-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

/* School Image */
.school-image {
    position: relative;
    height: 220px;
    overflow: hidden;
}

.school-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
}

.school-card:hover .school-image img {
    transform: scale(1.05);
}

/* School Badges */
.school-badge {
    position: absolute;
    top: 15px;
    left: 15px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.school-badge.featured {
    background: linear-gradient(135deg, #ff6b6b, #ff5252);
    color: white;
}

.school-badge.popular {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    color: white;
}

.school-badge.cultural {
    background: linear-gradient(135deg, #43e97b, #38f9d7);
    color: white;
}

.school-badge.international {
    background: linear-gradient(135deg, #fa709a, #fee140);
    color: white;
}

.school-badge.affordable {
    background: linear-gradient(135deg, #a8edea, #fed6e3);
    color: #333;
}

/* School Rating */
.school-rating {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.stars {
    display: flex;
    gap: 2px;
}

.stars i {
    font-size: 0.8rem;
    color: #ffd700;
}

.school-rating span {
    font-weight: 700;
    font-size: 0.9rem;
}

/* School Content */
.school-content {
    padding: 25px;
}

.school-location {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    color: #666;
    font-size: 0.9rem;
}

.school-location i {
    color: #d32f2f;
}

.school-content h3 {
    color: #333;
    font-size: 1.4rem;
    margin-bottom: 12px;
    font-weight: 700;
    line-height: 1.3;
}

.school-description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
    font-size: 0.95rem;
}

/* School Highlights */
.school-highlights {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
}

.highlight-item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.highlight-item i {
    width: 35px;
    height: 35px;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.highlight-item div span {
    display: block;
    color: #999;
    font-size: 0.8rem;
    margin-bottom: 2px;
}

.highlight-item div strong {
    color: #333;
    font-size: 0.9rem;
    font-weight: 600;
}

/* School Features */
.school-features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
}

.feature-tag {
    padding: 5px 12px;
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 500;
}

/* School Pricing */
.school-pricing {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.price {
    display: flex;
    flex-direction: column;
}

.price-label {
    color: #999;
    font-size: 0.8rem;
    margin-bottom: 4px;
}

.price-amount {
    color: #d32f2f;
    font-size: 1.2rem;
    font-weight: 700;
}

.school-actions {
    display: flex;
    gap: 10px;
}

/* Comparison Section */
.comparison-section {
    margin-top: 60px;
    padding: 40px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.comparison-section h3 {
    color: #333;
    font-size: 1.5rem;
    margin-bottom: 30px;
    text-align: center;
}

.comparison-table {
    overflow-x: auto;
}

.comparison-table table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.comparison-table th,
.comparison-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
}

.comparison-table th {
    background: #f8f9fa;
    color: #333;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.comparison-table td {
    color: #666;
}

.comparison-table tr:hover {
    background: #fafafa;
}

@media (max-width: 1024px) {
    /* Japanese Schools - Tablet */
    .schools-filter {
        flex-direction: column;
        gap: 15px;
    }

    .filter-tabs {
        justify-content: center;
    }

    .schools-grid {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 25px;
    }

    .school-highlights {
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        padding: 18px;
    }

    .highlight-item div span,
    .highlight-item div strong {
        font-size: 0.85rem;
    }

    .school-content h3 {
        font-size: 1.2rem;
    }

    .school-description {
        font-size: 0.9rem;
    }

    .comparison-section {
        padding: 30px 20px;
    }

    .comparison-table th,
    .comparison-table td {
        padding: 10px 12px;
        font-size: 0.85rem;
    }
}

@media (max-width: 768px) {
    /* Japanese Schools - Mobile */
    .schools-filter {
        flex-direction: column;
        align-items: stretch;
        gap: 20px;
    }

    .filter-tabs {
        justify-content: center;
        flex-wrap: wrap;
    }

    .filter-btn {
        padding: 8px 16px;
        font-size: 0.85rem;
    }

    .search-box {
        max-width: 100%;
    }

    .schools-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .school-card {
        margin: 0 10px;
    }

    .school-highlights {
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 15px;
    }

    .highlight-item {
        justify-content: center;
        text-align: center;
        flex-direction: row;
        gap: 8px;
    }

    .highlight-item i {
        margin-bottom: 5px;
    }

    .school-features {
        justify-content: center;
    }

    .feature-tag {
        font-size: 0.75rem;
        padding: 4px 10px;
    }

    .school-pricing {
        flex-direction: column;
        gap: 15px;
        align-items: center;
    }

    .school-actions {
        justify-content: center;
    }

    .comparison-section {
        padding: 20px 15px;
        margin: 40px 10px 0;
    }

    .comparison-table {
        font-size: 0.8rem;
    }

    .comparison-table th,
    .comparison-table td {
        padding: 8px 6px;
        font-size: 0.75rem;
    }
}

@media (max-width: 480px) {
    
}
</style>