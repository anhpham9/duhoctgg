<template>
    <div class="about-container">
        <!-- Page Hero Section -->
        <PageHero title="Giới Thiệu Du Học NB" subtitle="Đồng hành cùng ước mơ du học Nhật Bản của bạn"
            breadcrumb-text="Giới thiệu" />

        <!-- About Company Section -->
        <section class="about-company">
            <div class="container">
                <div class="section-header">
                    <h2>VỀ CHÚNG TÔI</h2>
                    <p>Chuyên gia tư vấn du học Nhật Bản hàng đầu Việt Nam</p>
                </div>
                <div class="about-content">
                    <div class="about-text">

                        <div class="about-description">
                            <p>
                                <strong>Du Học NB</strong> được thành lập từ năm 2020 với sứ mệnh giúp các bạn trẻ Việt
                                Nam
                                thực hiện ước mơ du học tại đất nước mặt trời mọc. Với đội ngũ chuyên gia giàu kinh
                                nghiệm
                                và mạng lưới đối tác rộng khắp, chúng tôi đã đồng hành thành công cùng hàng nghìn học
                                sinh
                                trên con đường chinh phục tri thức tại Nhật Bản.
                            </p>

                            <p>
                                Chúng tôi hiểu rằng mỗi học sinh đều có những mong muốn, khả năng và hoàn cảnh khác
                                nhau.
                                Vì vậy, chúng tôi cam kết cung cấp dịch vụ tư vấn cá nhân hóa, từ khâu chọn trường,
                                chuẩn bị hồ sơ cho đến hỗ trợ cuộc sống tại Nhật Bản.
                            </p>

                            <p>
                                Với phương châm <em>"Uy tín - Chất lượng - Tận tâm"</em>, Du Học NB không chỉ là
                                nơi cung cấp dịch vụ mà còn là người bạn đồng hành đáng tin cậy của các bạn trẻ
                                trên hành trình khám phá và phát triển bản thân tại xứ sở anh đào.
                            </p>
                        </div>
                    </div>

                    <div class="about-image">
                        <img src="/assets/images/students-group.webp" alt="Du Học NB Office">
                    </div>
                </div>
            </div>
        </section>

        <!-- Vision & Mission Section -->
        <section class="vision-mission">
            <div class="container">
                <div class="vision-mission-grid">
                    <article
                        v-for="mission in missions"
                        :key="mission.id"
                        class="about-mission-card"
                        :class="{ 'list-card': mission.type === 'list' }"
                    >
                        <div class="vm-icon">
                            <i :class="mission.icon || 'fas fa-circle-info'"></i>
                        </div>
                        <h3>{{ mission.title }}</h3>

                        <p v-if="mission.type === 'paragraph'">
                            {{ mission.description }}
                        </p>

                        <ul v-else>
                            <li v-for="(item, index) in parseMissionList(mission.description)" :key="`${mission.id}-${index}`">
                                <strong>{{ item.key }}:</strong> {{ item.value }}
                            </li>
                        </ul>
                    </article>
                </div>
            </div>
        </section>

        <!-- Company Stats Section -->
        <section ref="companyStats" class="company-stats">
            <div class="container">
                <div class="section-header">
                    <h2>THÀNH TÍCH ẤN TƯỢNG</h2>
                    <p>Những con số minh chứng cho chất lượng dịch vụ của chúng tôi</p>
                </div>

                <div class="stats-grid">
                    <div v-for="stat in stats" :key="stat.id" class="stat-item">
                        <div class="stat-icon">
                            <i :class="stat.icon || 'fas fa-chart-line'"></i>
                        </div>
                        <div class="stat-number" :data-target="Number(stat.number) || 0">0</div>
                        <div class="stat-label">{{ stat.label }}</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Why Choose Us Section -->
        <section class="why-choose-us">
            <div class="container">
                <div class="section-header">
                    <h2>TẠI SAO CHỌN DU HỌC NB?</h2>
                    <p>Những lý do để bạn tin tương và lựa chọn chúng tôi</p>
                </div>

                <div class="reasons-grid">
                    <div v-for="reason in reasons" :key="reason.id" class="reason-card">
                        <div class="reason-icon">
                            <i :class="reason.icon || 'fas fa-circle-check'"></i>
                        </div>
                        <h3>{{ reason.title }}</h3>
                        <p>{{ reason.description }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Our Team Section -->
        <section class="our-team">
            <div class="container">
                <div class="section-header">
                    <h2>ĐỘI NGŨ CHUYÊN GIA</h2>
                    <p>Những người đồng hành tận tâm với ước mơ du học của bạn</p>
                </div>

                <div class="team-grid">
                    <div v-for="member in teamMembers" :key="member.id" class="team-member">
                        <div class="member-photo">
                            <img :src="member.photo_url || '/assets/images/students-group.webp'" :alt="member.name">
                        </div>
                        <div class="member-info">
                            <h3>{{ member.name }}</h3>
                            <p class="member-position">{{ member.position }}</p>
                            <p class="member-description">{{ member.description }}</p>
                            <div v-if="hasAnySocial(member.social_links)" class="member-social">
                                <a v-if="member.social_links.facebook" :href="member.social_links.facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                    <i class="fab fa-facebook"></i>
                                </a>
                                <a v-if="member.social_links.tiktok" :href="member.social_links.tiktok" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                                    <i class="fab fa-tiktok"></i>
                                </a>
                                <a v-if="member.social_links.email" :href="`mailto:${member.social_links.email}`" aria-label="Email">
                                    <i class="fas fa-envelope"></i>
                                </a>
                            </div>
                            <p v-else class="member-social-empty">Thông tin liên hệ đang được cập nhật.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Company History Section -->
        <section class="company-history">
            <div class="container">
                <div class="section-header">
                    <h2>LỊCH SỬ PHÁT TRIỂN</h2>
                    <p>Những cột mốc quan trọng trong hành trình phát triển của Du Học NB</p>
                </div>

                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-year">2020</div>
                        <div class="timeline-content">
                            <h3>Thành Lập Công Ty</h3>
                            <p>Du Học NB được thành lập với đội ngũ 5 nhân viên và văn phòng đầu tiên tại TP.HCM.</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <div class="timeline-year">2021</div>
                        <div class="timeline-content">
                            <h3>Mở Rộng Hoạt Động</h3>
                            <p>Ký kết hợp tác với 50+ trường Nhật ngữ và gửi đi các lứa học sinh đầu tiên.</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <div class="timeline-year">2022</div>
                        <div class="timeline-content">
                            <h3>Đạt Mốc 500 Học Sinh</h3>
                            <p>Đạt mốc 500 học sinh du học thành công với tỷ lệ visa 97%. Mở chi nhánh tại Hà Nội.</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <div class="timeline-year">2023</div>
                        <div class="timeline-content">
                            <h3>Mở Rộng Dịch Vụ</h3>
                            <p>Ra mắt thêm dịch vụ tư vấn học bổng và hỗ trợ việc làm tại Nhật Bản.</p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <div class="timeline-year">2024</div>
                        <div class="timeline-content">
                            <h3>Cột Mốc 1000 Học Sinh</h3>
                            <p>Đạt mốc 1000+ học sinh thành công. Nhận giải thưởng "Công ty tư vấn du học uy tín 2024".
                            </p>
                        </div>
                    </div>

                    <div class="timeline-item">
                        <div class="timeline-year">2026</div>
                        <div class="timeline-content">
                            <h3>Hiện Tại</h3>
                            <p>Đã hỗ trợ 2500+ học sinh du học thành công với đội ngũ 30+ nhân viên chuyên nghiệp.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const fallbackMissions = [
    {
        id: 'fallback-vision',
        icon: 'fas fa-eye',
        title: 'TẦM NHÌN',
        type: 'paragraph',
        description: 'Trở thành công ty tư vấn du học Nhật Bản uy tín hàng đầu Việt Nam, góp phần nâng cao chất lượng nguồn nhân lực Việt Nam thông qua giáo dục chất lượng cao tại Nhật Bản.'
    },
    {
        id: 'fallback-mission',
        icon: 'fas fa-bullseye',
        title: 'SỨ MỆNH',
        type: 'paragraph',
        description: 'Cung cấp dịch vụ tư vấn du học chuyên nghiệp, đồng hành cùng học sinh từ khâu chuẩn bị hồ sơ đến khi định cư thành công tại Nhật Bản với chi phí hợp lý và lộ trình rõ ràng.'
    },
    {
        id: 'fallback-values',
        icon: 'fas fa-heart',
        title: 'GIÁ TRỊ CỐT LÕI',
        type: 'list',
        description: JSON.stringify([
            { key: 'Uy tín', value: 'Minh bạch trong mọi giao dịch' },
            { key: 'Chất lượng', value: 'Dịch vụ chuyên nghiệp hàng đầu' },
            { key: 'Tận tâm', value: 'Đặt lợi ích học sinh lên hàng đầu' },
            { key: 'Đổi mới', value: 'Không ngừng cải tiến dịch vụ' }
        ])
    }
]

const fallbackStats = [
    { id: 'fallback-stat-1', icon: 'fas fa-users', number: 2500, label: 'Học sinh thành công' },
    { id: 'fallback-stat-2', icon: 'fas fa-handshake', number: 150, label: 'Trường đối tác' },
    { id: 'fallback-stat-3', icon: 'fas fa-percentage', number: 98, label: 'Tỷ lệ visa thành công (%)' },
    { id: 'fallback-stat-4', icon: 'fas fa-business-time', number: 6, label: 'Năm kinh nghiệm' }
]

const fallbackReasons = [
    {
        id: 'fallback-reason-1',
        icon: 'fas fa-certificate',
        title: 'Được Chứng Nhận',
        description: 'Được cấp phép hoạt động hợp pháp bởi các cơ quan chức năng và là đại diện chính thức của nhiều trường danh tiếng tại Nhật Bản.'
    },
    {
        id: 'fallback-reason-2',
        icon: 'fas fa-user-tie',
        title: 'Đội Ngũ Chuyên Nghiệp',
        description: 'Tư vấn viên có trình độ cao, từng du học tại Nhật Bản và hiểu rõ văn hóa, học bổng, cơ hội việc làm.'
    },
    {
        id: 'fallback-reason-3',
        icon: 'fas fa-handshake',
        title: 'Cam Kết Rõ Ràng',
        description: 'Ký hợp đồng minh bạch, hỗ trợ trọn đời cho học sinh và đồng hành xuyên suốt quá trình du học.'
    },
    {
        id: 'fallback-reason-4',
        icon: 'fas fa-dollar-sign',
        title: 'Chi Phí Hợp Lý',
        description: 'Mức phí tư vấn cạnh tranh, minh bạch và tối ưu theo từng lộ trình hồ sơ.'
    },
    {
        id: 'fallback-reason-5',
        icon: 'fas fa-clock',
        title: 'Tiến Độ Nhanh Chóng',
        description: 'Quy trình xử lý hồ sơ nhanh, cập nhật thường xuyên cho học sinh và phụ huynh.'
    },
    {
        id: 'fallback-reason-6',
        icon: 'fas fa-life-ring',
        title: 'Hỗ Trợ Toàn Diện',
        description: 'Hỗ trợ từ chọn trường, làm hồ sơ, xin visa đến ổn định cuộc sống và việc làm tại Nhật.'
    }
]

const fallbackTeamMembers = [
    {
        id: 'fallback-member-1',
        name: 'Nguyễn Văn A',
        position: 'CEO & Founder',
        description: '10+ năm kinh nghiệm trong lĩnh vực tư vấn du học. Cử nhân Đại học Waseda, Nhật Bản.',
        photo_url: '/assets/images/news-2.jpg',
        social_links: {}
    },
    {
        id: 'fallback-member-2',
        name: 'Trần Thị B',
        position: 'Giám đốc Tư vấn',
        description: 'Chuyên gia tư vấn với 8 năm kinh nghiệm. Thạc sĩ Đại học Tokyo, chuyên ngành Giáo dục.',
        photo_url: '/assets/images/news-3.jpg',
        social_links: {}
    },
    {
        id: 'fallback-member-3',
        name: 'Lê Văn C',
        position: 'Trưởng phòng Visa',
        description: 'Chuyên gia xử lý hồ sơ visa với tỷ lệ thành công cao. Cử nhân Đại học Keio, chuyên ngành Luật.',
        photo_url: '/assets/images/school-1.jpg',
        social_links: {}
    },
    {
        id: 'fallback-member-4',
        name: 'Phạm Thị D',
        position: 'Tư vấn viên Senior',
        description: 'Tư vấn viên giàu kinh nghiệm, đã hỗ trợ hàng trăm học sinh thành công. Thạc sĩ Đại học Osaka.',
        photo_url: '/assets/images/school-2.jpg',
        social_links: {}
    }
]

const fetchPublicCollection = async (path, fallback, transform = (rows) => rows) => {
    try {
        const response = await $fetch(`${API_BASE}${path}`)
        const rows = Array.isArray(response?.data) ? response.data : []
        return rows.length ? transform(rows) : fallback
    } catch {
        return fallback
    }
}

const normalizeSocialLinks = (socialLinks) => {
    if (socialLinks && typeof socialLinks === 'object' && !Array.isArray(socialLinks)) {
        return {
            facebook: String(socialLinks.facebook || '').trim(),
            tiktok: String(socialLinks.tiktok || '').trim(),
            email: String(socialLinks.email || '').trim()
        }
    }

    return { facebook: '', tiktok: '', email: '' }
}

const [missions, stats, reasons, teamMembers] = await Promise.all([
    fetchPublicCollection('/public/about/missions', fallbackMissions),
    fetchPublicCollection('/public/about/stats', fallbackStats),
    fetchPublicCollection('/public/about/reasons', fallbackReasons),
    fetchPublicCollection('/public/about/team-members', fallbackTeamMembers, (rows) => rows.map((member) => ({
        ...member,
        social_links: normalizeSocialLinks(member.social_links)
    })))
])

const parseMissionList = (description) => {
    if (!description) return []

    try {
        const parsed = typeof description === 'string' ? JSON.parse(description) : description
        return Array.isArray(parsed)
            ? parsed.filter((item) => item && (item.key || item.value))
            : []
    } catch {
        return []
    }
}

const hasAnySocial = (socialLinks = {}) => {
    return Boolean(socialLinks.facebook || socialLinks.tiktok || socialLinks.email)
}

const companyStats = ref(null)

const animateValue = (element, start, end, duration) => {
    const startTime = performance.now()

    const step = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1)
        const currentValue = Math.floor(progress * (end - start) + start)
        element.textContent = currentValue

        if (progress < 1) {
            window.requestAnimationFrame(step)
        } else {
            element.textContent = end
        }
    }

    window.requestAnimationFrame(step)
}

let observer = null

const setupStatsAnimation = () => {
    if (!companyStats.value) return

    observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number[data-target]')

                statNumbers.forEach((el) => {
                    const target = parseInt(el.getAttribute('data-target') || '0', 10)
                    if (!Number.isNaN(target)) {
                        animateValue(el, 0, target, 2000)
                    }
                })

                observer?.unobserve(entry.target)
            }
        })
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    })

    observer.observe(companyStats.value)
}

onMounted(() => {
    setupStatsAnimation()
})

onBeforeUnmount(() => {
    if (observer) {
        observer.disconnect()
    }
})
</script>
<style scoped>
/* About Company Section */
.about-company {
    padding: 80px 0;
    background: #fff;
}

.about-company .about-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
}

.about-text {
    position: relative;
}

.about-company .section-header {
    margin-bottom: 40px;
}

.about-description {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.about-description p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #666;
}

.about-description p strong {
    color: #d32f2f;
    font-weight: 600;
}

.about-description em {
    color: #d32f2f;
    font-style: italic;
    font-weight: 500;
}

.about-image {
    position: relative;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.about-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Vision & Mission Section */
.vision-mission {
    padding: 80px 0;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.vision-mission-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 40px;
    margin-top: 50px;
}

.vision-card,
.mission-card,
.values-card,
.about-mission-card {
    background: white;
    padding: 40px 30px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    /* position: relative; */
    border-top: 4px solid #e53e3e;
    overflow: hidden;
}

.vision-card:hover,
.mission-card:hover,
.values-card:hover,
.about-mission-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(211, 47, 47, 0.2);
}

.vm-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 25px;
    position: relative;
}

.vm-icon::before {
    content: '';
    position: absolute;
    width: 95px;
    height: 95px;
    border: 2px solid rgba(211, 47, 47, 0.2);
    border-radius: 50%;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }

    100% {
        transform: scale(1.1);
        opacity: 0;
    }
}

.vm-icon i {
    font-size: 2rem;
    color: white;
}

.vision-card h3,
.mission-card h3,
.values-card h3,
.about-mission-card h3 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 20px;
    font-weight: 700;
}

.vision-card p,
.mission-card p,
.about-mission-card p {
    color: #666;
    line-height: 1.7;
    font-size: 1rem;
    margin: 0;
}

.values-card ul,
.about-mission-card.list-card ul {
    list-style: none;
    text-align: left;
    margin: 0;
    padding: 0;
}

.values-card ul li,
.about-mission-card.list-card ul li {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 10px;
    transition: all 0.3s ease;
}

.values-card ul li:hover,
.about-mission-card.list-card ul li:hover {
    background: #fff5f5;
    transform: translateX(5px);
}

.values-card ul li:before,
.about-mission-card.list-card ul li:before {
    content: '✓';
    width: 25px;
    height: 25px;
    background: #d32f2f;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.8rem;
    flex-shrink: 0;
    margin-top: 2px;
}

.values-card ul li strong,
.about-mission-card.list-card ul li strong {
    color: #d32f2f;
    font-weight: 600;
}

/* Company Stats Section */
.company-stats {
    padding: 80px 0;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    color: white;
    position: relative;
    overflow: hidden;
}

.company-stats::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="20" cy="80" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
    opacity: 0.7;
}

.company-stats .container {
    position: relative;
    z-index: 2;
}

.company-stats .section-header h2,
.company-stats .section-header p {
    color: white;
}

.company-stats .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 40px;
    /* margin-top: 50px; */
}

.company-stats .stat-item {
    text-align: center;
    padding: 40px 30px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    position: relative;
}

.company-stats .stat-item:hover {
    transform: translateY(-10px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.company-stats .stat-icon {
    width: 70px;
    height: 70px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.company-stats .stat-icon i {
    font-size: 1.8rem;
    color: #ffeb3b;
}

.company-stats .stat-number {
    font-size: 3rem;
    font-weight: 700;
    color: #ffeb3b;
    margin-bottom: 10px;
    display: block;
    line-height: 1;
}

.company-stats .stat-label {
    font-size: 1.1rem;
    font-weight: 500;
    opacity: 0.9;
}

/* Why Choose Us Section */
.why-choose-us {
    padding: 80px 0;
    background: #fff;
}

.reasons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
}

.reason-card {
    background: white;
    padding: 40px 30px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border: 1px solid #f0f0f0;
    position: relative;
}

.reason-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(211, 47, 47, 0.15);
    border-color: #d32f2f;
}

.reason-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 25px;
    position: relative;
    box-shadow: 0 8px 25px rgba(211, 47, 47, 0.3);
}

.reason-icon::after {
    content: '';
    position: absolute;
    width: 100px;
    height: 100px;
    border: 2px solid rgba(211, 47, 47, 0.2);
    border-radius: 50%;
    animation: rotate 3s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.reason-icon i {
    font-size: 2rem;
    color: white;
    position: relative;
    z-index: 2;
}

.reason-card h3 {
    font-size: 1.3rem;
    color: #333;
    margin-bottom: 15px;
    font-weight: 600;
}

.reason-card p {
    color: #666;
    line-height: 1.7;
    margin: 0;
    font-size: 1rem;
}

/* Our Team Section */
.our-team {
    padding: 80px 0;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 40px;
    margin-top: 50px;
}

.team-member {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    text-align: center;
    position: relative;
}

.team-member:hover {
    transform: translateY(-15px);
    box-shadow: 0 25px 50px rgba(211, 47, 47, 0.2);
}

.member-photo {
    position: relative;
    height: 300px;
    overflow: hidden;
}

.member-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
}

.team-member:hover .member-photo img {
    transform: scale(1.1);
}

.member-photo::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(211, 47, 47, 0.2), rgba(183, 28, 28, 0.2));
    opacity: 0;
    transition: all 0.3s ease;
}

.team-member:hover .member-photo::after {
    opacity: 1;
}

.member-info {
    padding: 30px 25px;
    position: relative;
}

.member-info h3 {
    font-size: 1.4rem;
    color: #333;
    margin-bottom: 8px;
    font-weight: 700;
}

.member-position {
    color: #d32f2f;
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.member-description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
    font-size: 0.95rem;
}

.member-social {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.member-social-empty {
    margin: 0;
    color: #9aa0a6;
    font-size: 0.9rem;
}

.member-social a {
    width: 40px;
    height: 40px;
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    transition: all 0.3s ease;
    text-decoration: none;
}

.member-social a:hover {
    background: #d32f2f;
    border-color: #d32f2f;
    color: white;
    transform: translateY(-3px);
}

/* Company History Section */
.company-history {
    padding: 80px 0;
    background: #fff;
    position: relative;
}

.company-history .timeline {
    position: relative;
    margin: 50px auto 0px;
    max-width: 1000px;
    padding-left: 0;
}

.company-history .timeline::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    transform: translateX(-50%);
    border-radius: 2px;
}

.company-history .timeline-item {
    position: relative;
    margin-bottom: 80px;
    display: flex;
    align-items: center;
}

.company-history .timeline-item:before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background: #d32f2f;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 2px #d32f2f;
}

.company-history .timeline-content {
    color: #666;
}

.company-history .timeline-item:nth-child(odd) {
    justify-content: flex-start;
}

.company-history .timeline-item:nth-child(even) {
    justify-content: flex-end;
}

.company-history .timeline-item:nth-last-child(1) {
    margin-bottom: 0;
}

.company-history .timeline-item:nth-child(odd) .timeline-content {
    margin-left: calc(50% + 40px);
    text-align: left;
}

.company-history .timeline-item:nth-child(even) .timeline-content {
    margin-right: calc(50% + 40px);
    text-align: right;
}

.company-history .timeline-year {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    border: 5px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1.2rem;
    box-shadow: 0 8px 25px rgba(211, 47, 47, 0.3);
    z-index: 3;
}

.company-history .timeline-content {
    background: white;
    padding: 30px;
    border-radius: 15px;
    max-width: 400px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    position: relative;
    transition: all 0.3s ease;
}

.company-history .timeline-item:nth-child(odd) .timeline-content::before {
    content: '';
    position: absolute;
    left: -15px;
    top: 30px;
    width: 0;
    height: 0;
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    border-right: 15px solid white;
}

.company-history .timeline-item:nth-child(even) .timeline-content::before {
    content: '';
    position: absolute;
    right: -15px;
    top: 30px;
    width: 0;
    height: 0;
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    border-left: 15px solid white;
}

.company-history .timeline-content:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(211, 47, 47, 0.15);
}

.company-history .timeline-content h3 {
    font-size: 1.3rem;
    color: #d32f2f;
    margin-bottom: 10px;
    font-weight: 700;
}

.company-history .timeline-content p {
    color: #666;
    line-height: 1.6;
    margin: 0;
    font-size: 1rem;
}

@media (max-width: 1024px) {
    /* ===================
    about
    ===================== */
    
    .about-company .about-content {
        grid-template-columns: 550px 1fr;
        gap: 20px;
    }

    .vision-mission-grid {
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .values-card {
        grid-column: 1 / -1;
    }

    .company-stats .stats-grid {
        grid-template-columns: 1fr 1fr;
        gap: 25px;
    }

    .reasons-grid {
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .team-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 30px;
    }

    .company-history .timeline-item {
        margin-bottom: 20px;
    }

    .company-history .timeline-item:nth-child(odd) .timeline-content {
        margin-left: calc(50% + 30px);
    }

    .company-history .timeline-item:nth-child(even) .timeline-content {
        margin-right: calc(50% + 30px);
    }
}

@media (max-width: 768px) {
    

    .about-company .about-content {
        grid-template-columns: 1fr;
        gap: 30px;
    }

    .about-description {
        text-align: center;
    }

    .vision-mission-grid {
        gap: 10px;
    }

    .vision-card,
    .mission-card,
    .values-card {
        padding: 30px 20px;
    }

    .company-stats .stat-item {
        padding: 30px 20px;
    }

    .company-stats .stat-number {
        font-size: 2.5rem;
    }

    .member-photo {
        height: 250px;
    }

    .member-info {
        padding: 25px 20px;
    }

    .company-history .timeline {
        padding-left: 30px;
        max-width: 100%;
    }

    .company-history .timeline::before {
        left: 15px;
        transform: none;
    }

    .company-history .timeline {
        padding-left: 25px;
        margin: 25px 0;
    }

    .company-history .timeline:before {
        left: 12px;
    }

    .company-history .timeline-item {
        margin-bottom: 40px;
        justify-content: flex-start !important;
    }

    .company-history .timeline-item:before {
        left: -11px;
        width: 10px;
        height: 10px;
    }

    .company-history .timeline-item:nth-child(odd) .timeline-content,
    .company-history .timeline-item:nth-child(even) .timeline-content {
        margin-left: 75px;
        margin-right: 0;
        text-align: left;
        max-width: calc(100% - 70px);
    }

    .company-history .timeline-item:nth-child(odd) .timeline-content::before,
    .company-history .timeline-item:nth-child(even) .timeline-content::before {
        left: -15px;
        right: auto;
        border-left: none;
        border-right: 15px solid white;
        border-top: 15px solid transparent;
        border-bottom: 15px solid transparent;
    }

    .company-history .timeline-year {
        left: 0px;
        transform: none;
        width: 80px;
        height: 80px;
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .about-company,
    .vision-mission,
    .company-stats,
    .why-choose-us,
    .our-team,
    .company-history {
        padding: 60px 0;
    }

    .vision-mission-grid {
        grid-template-columns: 1fr;
    }

    .vision-card,
    .mission-card,
    .values-card {
        padding: 25px 15px;
    }

    .vm-icon {
        width: 60px;
        height: 60px;
    }

    .vm-icon i {
        font-size: 1.5rem;
    }

    .company-stats .stats-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .company-stats .stat-item {
        padding: 25px 15px;
    }

    .company-stats .stat-number {
        font-size: 2rem;
    }

    .reasons-grid {
        grid-template-columns: 1fr;
    }

    .reason-card {
        padding: 25px 15px;
    }

    .reason-icon {
        width: 60px;
        height: 60px;
    }

    .reason-icon::after {
        width: 80px;
        height: 80px;
    }

    .reason-icon i {
        font-size: 1.5rem;
    }

    .team-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .member-photo {
        height: 200px;
    }

    .member-info {
        padding: 20px 15px;
    }

    .company-history .timeline-year {
        width: 60px;
        height: 60px;
        font-size: 0.9rem;
    }

    .company-history .timeline-item:nth-child(odd) .timeline-content,
    .company-history .timeline-item:nth-child(even) .timeline-content {
        padding: 20px;
        margin-left: 50px;
    }
}
</style>