<template>
    <div class="school-detail-container">
        <!-- School Hero Section -->
        <section class="school-hero">
            <div class="container">
                <div class="school-hero-content">
                    <nav class="breadcrumb">
                        <a href="/">Trang chủ</a>
                        <span>/</span>
                        <a href="/schools">Trường Nhật Ngữ</a>
                        <span>/</span>
                        <span>{{ schoolData.name }}</span>
                    </nav>

                    <div class="school-hero-main">
                        <div class="school-info-header">
                            <div class="school-badge featured">Nổi Bật</div>
                            <div class="school-rating">
                                <div class="stars">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                </div>
                                <span>5.0</span>
                                <small>(148 đánh giá)</small>
                            </div>
                        </div>

                        <h1 class="editable-h1" data-editable="true" data-id="school-title">ISI Language School Tokyo
                        </h1>
                        <div class="school-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span class="editable-paragraph" data-editable="true" data-id="school-location">Shibuya,
                                Tokyo,
                                Nhật Bản</span>
                        </div>

                        <p class="school-hero-desc editable-paragraph" data-editable="true" data-id="hero-description">
                            Trường nhật ngữ hàng đầu tại Tokyo với chất lượng giảng dạy xuất sắc và tỷ lệ đỗ đại học
                            cao.
                            Được thành lập từ năm 1984, ISI đã đào tạo hàng nghìn sinh viên quốc tế thành công.
                        </p>

                        <div class="school-key-stats">
                            <div class="stat-item">
                                <span class="stat-number">780,000¥</span>
                                <span class="stat-label">Học phí/năm</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">95%</span>
                                <span class="stat-label">Tỷ lệ đỗ đại học</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number1">15~20</span>
                                <span class="stat-label">Sĩ số lớp</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">40+</span>
                                <span class="stat-label">Quốc gia</span>
                            </div>
                        </div>

                        <div class="school-hero-actions">
                            <a href="#contact" class="btn btn-primary">Tư Vấn Miễn Phí</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- About School Section -->
        <section class="about-school">
            <div class="container">
                <div class="school-detail-content">
                    <!-- Main Content -->
                    <div class="school-detail-main">
                        <!-- About School -->
                        <div class="content-block dynamic-component" data-component-type="about" data-editable="true"
                            data-id="about-section">
                            <div class="section-header">
                                <h2 class="editable-h2">Về ISI Language School Tokyo</h2>
                            </div>

                            <div class="content-section" data-layout="two-column">
                                <div class="content-card">
                                    <div class="editable-section" data-type="paragraph">
                                        <p class="editable-paragraph">
                                            ISI Language School được thành lập năm 1984, là một trong những trường nhật
                                            ngữ
                                            uy tín nhất tại Tokyo.
                                            Với hơn 40 năm kinh nghiệm, trường đã đào tạo thành công hàng nghìn sinh
                                            viên từ
                                            khắp nơi trên thế giới.
                                        </p>
                                        <p class="editable-paragraph">
                                            Trường có 4 cơ sở tại Tokyo (Takadanobaba, Ikebukuro, Harajuku, và Shibuya)
                                            với
                                            đầy đủ trang thiết bị hiện đại
                                            và đội ngũ giáo viên giàu kinh nghiệm.
                                        </p>
                                    </div>
                                </div>
                                <div class="editable-image">
                                    <img src="/assets/images/school-1.jpg" alt="ISI Language School Building">
                                    <div class="image-caption">Cơ sở Shibuya của ISI Language School</div>
                                </div>
                            </div>

                            <div class="quote-box editable-quote" data-style="highlighted" data-editable="true"
                                data-id="mission-quote">
                                <blockquote>
                                    "Sứ mệnh của chúng tôi là giúp sinh viên quốc tế không chỉ thành thạo tiếng Nhật mà
                                    còn
                                    hiểu sâu về văn hóa Nhật Bản,
                                    tạo nền tảng vững chắc cho tương lai học tập và nghề nghiệp tại Nhật."
                                </blockquote>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <aside class="school-detail-sidebar">
                        <!-- Contact Info -->
                        <div class="sidebar-widget">
                            <h3>Thông Tin Liên Hệ</h3>
                            <div class="contact-details">
                                <div class="contact-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <div>
                                        <strong>Địa chỉ</strong>
                                        <span>1-30-18 Takadanobaba, Shinjuku-ku, Tokyo</span>
                                    </div>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-phone"></i>
                                    <div>
                                        <strong>Điện thoại</strong>
                                        <span>+81-3-5332-3531</span>
                                    </div>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-envelope"></i>
                                    <div>
                                        <strong>Email</strong>
                                        <span>info@isi-education.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Related Schools -->
                        <div class="sidebar-widget">
                            <h3>Trường Liên Quan</h3>
                            <div class="related-schools">
                                <div class="related-school">
                                    <div class="school-thumb">
                                        <img src="/assets/images/school-2.jpg" alt="Human Academy">
                                    </div>
                                    <div class="school-info">
                                        <h4><a href="school-detail-2.html">Human Academy</a></h4>
                                        <div class="school-rating">
                                            <div class="stars">
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star-half-alt"></i>
                                            </div>
                                            <span>4.5</span>
                                        </div>
                                        <div class="school-price">720,000¥/năm</div>
                                    </div>
                                </div>

                                <div class="related-school">
                                    <div class="school-thumb">
                                        <img src="/assets/images/school-4.jpg" alt="Intercultural Institute">
                                    </div>
                                    <div class="school-info">
                                        <h4><a href="school-detail-4.html">Intercultural Institute</a></h4>
                                        <div class="school-rating">
                                            <div class="stars">
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star"></i>
                                                <i class="fas fa-star-half-alt"></i>
                                            </div>
                                            <span>4.6</span>
                                        </div>
                                        <div class="school-price">850,000¥/năm</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>

        <!-- Programs & Courses Section -->
        <section class="programs">
            <div class="container">
                <div class="section-header">
                    <h2 class="editable-h2">Chương Trình Học</h2>
                    <p>Các khóa học chuyên nghiệp tại ISI Language School Tokyo</p>
                </div>

                <div class="content-grid">
                    <div class="course-item">
                        <div class="course-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <h3>Khóa Chuẩn Bị Đại Học</h3>
                        <div class="course-details">
                            <p>Khóa học 1.5-2 năm chuẩn bị cho kỳ thi EJU và thi đầu vào các trường đại học Nhật Bản.
                            </p>
                            <div class="course-info">
                                <span class="info-item"><i class="fas fa-clock"></i> 18-24 tháng</span>
                                <span class="info-item"><i class="fas fa-yen-sign"></i> 780,000¥/năm</span>
                                <span class="info-item"><i class="fas fa-medal"></i> Tỷ lệ đỗ 95%</span>
                            </div>
                        </div>
                    </div>

                    <div class="course-item">
                        <div class="course-icon">
                            <i class="fas fa-certificate"></i>
                        </div>
                        <h3>Khóa Luyện Thi JLPT</h3>
                        <div class="course-details">
                            <p>Chương trình chuyên sâu luyện thi các cấp độ JLPT N5-N1 với phương pháp hiệu quả.</p>
                            <div class="course-info">
                                <span class="info-item"><i class="fas fa-clock"></i> 3-6 tháng</span>
                                <span class="info-item"><i class="fas fa-yen-sign"></i> 180,000¥/khóa</span>
                                <span class="info-item"><i class="fas fa-star"></i> N1-N5</span>
                            </div>
                        </div>
                    </div>

                    <div class="course-item">
                        <div class="course-icon">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <h3>Tiếng Nhật Thương Mại</h3>
                        <div class="course-details">
                            <p>Khóa học tiếng Nhật cho môi trường công sở và kỹ năng giao tiếp kinh doanh.</p>
                            <div class="course-info">
                                <span class="info-item"><i class="fas fa-clock"></i> 6-12 tháng</span>
                                <span class="info-item"><i class="fas fa-yen-sign"></i> 720,000¥/năm</span>
                                <span class="info-item"><i class="fas fa-handshake"></i> Hỗ trợ việc làm</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Admission Requirements Section -->
        <section class="admission-requirements">
            <div class="container">
                <div class="section-header">
                    <h2 class="editable-h2">Điều Kiện Tuyển Sinh</h2>
                    <p>Các yêu cầu cần thiết để đăng ký khóa học tại ISI Language School</p>
                </div>

                <div class="content-grid">
                    <div class="requirement-card">
                        <div class="req-icon">
                            <i class="fas fa-user-graduate"></i>
                        </div>
                        <h3>Học Vấn</h3>
                        <ul>
                            <li>Tốt nghiệp trung học phổ thông (12 năm)</li>
                            <li>Hoặc tương đương theo quy định của bộ giáo dục Nhật Bản</li>
                            <li>Có chứng chỉ học tập hợp lệ</li>
                        </ul>
                    </div>

                    <div class="requirement-card">
                        <div class="req-icon">
                            <i class="fas fa-language"></i>
                        </div>
                        <h3>Trình Độ Tiếng Nhật</h3>
                        <ul>
                            <li>Có bằng JLPT N5 hoặc tương đương</li>
                            <li>Hoặc đã học tiếng Nhật ít nhất 150 giờ</li>
                            <li>Có thể hiểu Hiragana và Katakana cơ bản</li>
                        </ul>
                    </div>

                    <div class="requirement-card">
                        <div class="req-icon">
                            <i class="fas fa-money-check-alt"></i>
                        </div>
                        <h3>Tài Chính</h3>
                        <ul>
                            <li>Chứng minh tài chính: 2,000,000 yên/năm</li>
                            <li>Sổ tiết kiệm của bản thân hoặc người bảo lãnh</li>
                            <li>Giấy tờ chứng minh nguồn thu nhập</li>
                        </ul>
                    </div>

                    <div class="requirement-card">
                        <div class="req-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <h3>Giấy Tờ</h3>
                        <ul>
                            <li>Hộ chiếu còn hạn (trên 6 tháng)</li>
                            <li>Bằng tốt nghiệp có công chứng</li>
                            <li>Sơ yếu lý lịch và động cơ học tập</li>
                        </ul>
                    </div>

                    <div class="requirement-card">
                        <div class="req-icon">
                            <i class="fas fa-heartbeat"></i>
                        </div>
                        <h3>Sức Khỏe</h3>
                        <ul>
                            <li>Khám sức khỏe định kỳ</li>
                            <li>Bảo hiểm y tế đầy đủ</li>
                            <li>Chăm sóc y tế khi cần thiết</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Facilities Section -->
        <section class="facilities">
            <div class="container">
                <div class="section-header">
                    <h2 class="editable-h2">Cơ Sở Vật Chất & Dịch Vụ</h2>
                    <p>Môi trường học tập hiện đại và đầy đủ tiện nghi</p>
                </div>

                <div class="content-grid">
                    <div class="facility-card">
                        <div class="facility-icon">
                            <i class="fas fa-chalkboard-teacher"></i>
                        </div>
                        <h3>Phòng Học Hiện Đại</h3>
                        <p>20+ phòng học được trang bị máy chiếu, bảng thông minh và hệ thống âm thanh chất lượng cao.
                        </p>
                    </div>

                    <div class="facility-card">
                        <div class="facility-icon">
                            <i class="fas fa-book"></i>
                        </div>
                        <h3>Thư Viện Đầy Đủ</h3>
                        <p>Hơn 5,000 đầu sách tiếng Nhật, tài liệu học tập và không gian học nhóm yên tĩnh.</p>
                    </div>

                    <div class="facility-card">
                        <div class="facility-icon">
                            <i class="fas fa-wifi"></i>
                        </div>
                        <h3>Wifi Miễn Phí</h3>
                        <p>Internet tốc độ cao được cung cấp miễn phí trong toàn bộ khuôn viên trường.</p>
                    </div>

                    <div class="facility-card">
                        <div class="facility-icon">
                            <i class="fas fa-coffee"></i>
                        </div>
                        <h3>Khu Vực Thư Giãn</h3>
                        <p>Cafeteria và không gian nghỉ ngơi thoải mái cho sinh viên giữa các giờ học.</p>
                    </div>

                    <div class="facility-card">
                        <div class="facility-icon">
                            <i class="fas fa-headphones-alt"></i>
                        </div>
                        <h3>Phòng Tự Học</h3>
                        <p>Phòng luyện nghe với thiết bị âm thanh chuyên nghiệp và tài liệu đa phương tiện.</p>
                    </div>

                    <div class="facility-card">
                        <div class="facility-icon">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <h3>Tư Vấn Sinh Viên</h3>
                        <p>Dịch vụ tư vấn học tập và hỗ trợ sinh hoạt miễn phí cho tất cả sinh viên.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Testimonials Section -->
        <section class="testimonials">
            <div class="container">
                <div class="section-header">
                    <h2 class="editable-h2">Cảm Nhận Của Sinh Viên</h2>
                    <p>Những trải nghiệm thực tế từ sinh viên đã và đang học tập tại ISI Language School</p>
                </div>

                <div class="content-grid">
                    <div class="testimonial-card">
                        <div class="testimonial-content">
                            <div class="stars">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                            <p>"ISI thực sự là lựa chọn tuyệt vời! Giáo viên rất tận tâm, lớp học nhỏ nên được chú ý
                                nhiều.
                                Cơ sở vật chất hiện đại, thư viện đầy đủ tài liệu."</p>
                        </div>
                        <div class="student-info">
                            <img src="/assets/images/school-1.jpg" alt="Nguyễn Minh Anh">
                            <div class="student-details">
                                <h4>Nguyễn Minh Anh</h4>
                                <span>Việt Nam | Khóa 2022</span>
                            </div>
                        </div>
                    </div>

                    <div class="testimonial-card">
                        <div class="testimonial-content">
                            <div class="stars">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                            <p>"Môi trường học tập rất tốt, bạn bè đến từ nhiều quốc gia khác nhau.
                                Nhờ ISI mà em có thể đậu vào trường đại học mơ ước."</p>
                        </div>
                        <div class="student-info">
                            <img src="/assets/images/school-2.jpg" alt="Trần Văn Đức">
                            <div class="student-details">
                                <h4>Trần Văn Đức</h4>
                                <span>Việt Nam | Khóa 2021</span>
                            </div>
                        </div>
                    </div>

                    <div class="testimonial-card">
                        <div class="testimonial-content">
                            <div class="stars">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                            </div>
                            <p>"Chương trình học rất bài bản, từ cơ bản đến nâng cao.
                                Đặc biệt là khóa luyện thi JLPT rất hiệu quả, em đã đậu N2."</p>
                        </div>
                        <div class="student-info">
                            <img src="/assets/images/school-3.jpg" alt="Lê Thị Hoa">
                            <div class="student-details">
                                <h4>Lê Thị Hoa</h4>
                                <span>Việt Nam | Khóa 2023</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <FAQ title="Câu Hỏi Thường Gặp" :subtitle="`Thắc mắc về trường ${schoolData.name}`" :faq-data="myFaqData" />
    </div>
</template>

<script setup>
import "~/assets/css/school-detail.css";
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNotification } from '~/composables/useNotification'

import { useFAQ } from '~/composables/useFAQ'

const { getFAQData } = useFAQ()
const myFaqData = getFAQData('school') // or 'school', 'visa'

const route = useRoute()
const { showSuccess, showError } = useNotification()

// Consultation form
const consultationForm = ref({
    name: '',
    email: '',
    phone: '',
    program: '',
    message: ''
})

// Mock school data - In real app, fetch from API
const schoolsDatabase = {
    'isi-language-school-tokyo': {
        id: 1,
        name: 'ISI Language School Tokyo',
        location: 'Tokyo, Nhật Bản',
        rating: 5.0,
        students: '800+',
        established: '1985',
        badge: 'Nổi Bật',
        badgeType: 'featured',
        isAccredited: true,
        fullDescription: 'ISI Language School Tokyo là một trong những trường Nhật ngữ hàng đầu tại Tokyo, được thành lập từ năm 1985. Trường có uy tín cao về chất lượng giảng dạy và tỷ lệ đỗ đại học. Với đội ngũ giáo viên giàu kinh nghiệm và chương trình học được thiết kế khoa học, ISI đã đào tạo thành công hàng nghìn sinh viên quốc tế.',
        keyFeatures: [
            'Tỷ lệ đỗ đại học 95% - cao nhất trong khu vực',
            'Giáo viên 100% có bằng cấp chuyên ngành và kinh nghiệm 5+ năm',
            'Chương trình học được thiết kế riêng cho từng trình độ',
            'Hỗ trợ đầy đủ thủ tục visa và tìm chỗ ở',
            'Hoạt động văn hóa và giao lưu quốc tế phong phú',
            'Thư viện và phòng tự học hiện đại, mở cửa 24/7'
        ],
        statistics: [
            { icon: 'fas fa-users', value: '800+', label: 'Học sinh quốc tế' },
            { icon: 'fas fa-graduation-cap', value: '95%', label: 'Tỷ lệ đỗ đại học' },
            { icon: 'fas fa-globe', value: '40+', label: 'Quốc gia' },
            { icon: 'fas fa-award', value: '35+', label: 'Năm kinh nghiệm' }
        ],
        programs: [
            {
                name: 'Khóa Nhật Ngữ Cơ Bản',
                description: 'Dành cho người mới bắt đầu, từ N5 lên N4',
                duration: '6 tháng',
                fee: '390,000 Yên',
                level: 'N5-N4',
                icon: 'fas fa-book-open'
            },
            {
                name: 'Khóa Chuẩn Bị Đại Học',
                description: 'Chuẩn bị thi EJU và thi vào đại học',
                duration: '1-2 năm',
                fee: '780,000 Yên/năm',
                level: 'N3-N1',
                icon: 'fas fa-university'
            },
            {
                name: 'Khóa Nhật Ngữ Thương Mại',
                description: 'Tiếng Nhật cho môi trường công sở',
                duration: '9 tháng',
                fee: '585,000 Yên',
                level: 'N2-N1',
                icon: 'fas fa-briefcase'
            }
        ],
        gallery: [
            '/assets/images/school-1.jpg',
            '/assets/images/school-gallery-1.jpg',
            '/assets/images/school-gallery-2.jpg',
            '/assets/images/school-gallery-3.jpg',
            '/assets/images/school-gallery-4.jpg',
            '/assets/images/school-gallery-5.jpg'
        ],
        contact: {
            address: '〒169-0073 Tokyo, Shinjuku City, Hyakunincho, 2 Chome−1−10',
            phone: '+81-3-5337-7001',
            email: 'info@isi-education.com',
            website: 'https://www.isi-education.com'
        }
    },
    'human-academy-japanese-language': {
        id: 2,
        name: 'Human Academy Japanese Language School',
        location: 'Osaka, Nhật Bản',
        rating: 4.5,
        students: '600+',
        established: '1992',
        badge: 'Phổ Biến',
        badgeType: 'popular',
        isAccredited: true,
        fullDescription: 'Human Academy Japanese Language School là trường Nhật ngữ uy tín với hệ thống giáo dục hiện đại và phương pháp giảng dạy sáng tạo. Trường đặc biệt nổi tiếng về việc chuẩn bị cho kỳ thi JLPT và tạo môi trường học tập đa văn hóa.',
        keyFeatures: [
            'Phương pháp giảng dạy tương tác và thực hành cao',
            'Tỷ lệ đỗ JLPT 92% cho các cấp độ',
            'Hoạt động văn hóa và du lịch học tập đa dạng',
            'Hỗ trợ tìm việc làm thêm và thực tập',
            'Chương trình trao đổi với học sinh Nhật Bản',
            'Cơ sở vật chất hiện đại với phòng multimedia'
        ],
        statistics: [
            { icon: 'fas fa-users', value: '600+', label: 'Học sinh' },
            { icon: 'fas fa-certificate', value: '92%', label: 'Tỷ lệ đỗ JLPT' },
            { icon: 'fas fa-globe', value: '35+', label: 'Quốc gia' },
            { icon: 'fas fa-building', value: '3', label: 'Cơ sở' }
        ],
        programs: [
            {
                name: 'Khóa JLPT Intensive',
                description: 'Luyện thi JLPT từ N5 đến N1',
                duration: '3-12 tháng',
                fee: '180,000 Yên/3 tháng',
                level: 'N5-N1',
                icon: 'fas fa-trophy'
            },
            {
                name: 'Khóa Giao Tiếp Nhật Ngữ',
                description: 'Tập trung vào kỹ năng nói và giao tiếp',
                duration: '6 tháng',
                fee: '360,000 Yên',
                level: 'N4-N2',
                icon: 'fas fa-comments'
            }
        ],
        gallery: [
            '/assets/images/school-2.jpg',
            '/assets/images/school-gallery-6.jpg',
            '/assets/images/school-gallery-7.jpg'
        ],
        contact: {
            address: '〒542-0012 Osaka, Chuo Ward, Tanimachi, 9 Chome−5−15',
            phone: '+81-6-6765-0811',
            email: 'osaka@human.ac.jp',
            website: 'https://www.human.ac.jp'
        }
    }
}

// Get school data based on slug
const schoolData = computed(() => {
    return schoolsDatabase[route.params.slug]
})

// Submit consultation form
const submitConsultation = () => {
    if (!consultationForm.value.name || !consultationForm.value.email || !consultationForm.value.phone) {
        showError('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
    }

    showSuccess('Cảm ơn bạn! Chúng tôi sẽ liên hệ tư vấn trong thời gian sớm nhất.')

    // Reset form
    Object.keys(consultationForm.value).forEach(key => {
        consultationForm.value[key] = ''
    })

    console.log('Consultation request:', {
        school: schoolData.value?.name,
        ...consultationForm.value
    })
}

// Set page title
useHead({
    title: computed(() => schoolData.value ? `${schoolData.value.name} - Du Học NB` : 'Chi tiết trường - Du Học NB')
})
</script>

<style scoped>
/* .school-quick-info {
    display: flex;
    gap: 30px;
    margin-top: 20px;
    flex-wrap: wrap;
    color: rgba(255, 255, 255, 0.9);
}

.school-quick-info span {
    display: flex;
    align-items: center;
    gap: 8px;
}

.school-overview {
    padding: 80px 0;
}

.overview-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 60px;
    align-items: start;
}

.overview-content h2 {
    margin-bottom: 25px;
    color: #333;
}

.overview-content p {
    line-height: 1.8;
    margin-bottom: 30px;
    color: #666;
}

.school-features-detailed ul {
    list-style: none;
    padding: 0;
}

.school-features-detailed li {
    display: flex;
    align-items: start;
    gap: 15px;
    margin-bottom: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
}

.school-features-detailed i {
    color: #4caf50;
    margin-top: 2px;
}

.overview-image {
    position: relative;
}

.overview-image img {
    width: 100%;
    border-radius: 15px;
}

.school-badges {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.badge {
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    color: white;
}

.badge.featured {
    background: #ff6b35;
}

.badge.popular {
    background: #4caf50;
}

.badge.accredited {
    background: #2196f3;
}

.school-stats {
    background: #f8f9fa;
    padding: 60px 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
}

.stat-item {
    background: white;
    padding: 30px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    width: 60px;
    height: 60px;
    background: #d32f2f;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: white;
    font-size: 24px;
}

.stat-number {
    font-size: 36px;
    font-weight: 700;
    color: #333;
    margin-bottom: 5px;
}

.stat-label {
    color: #666;
    font-size: 16px;
}

.school-programs {
    padding: 80px 0;
}

.programs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    margin-top: 40px;
}

.program-card {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.program-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #d32f2f, #ff6b35);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 25px;
    color: white;
    font-size: 30px;
}

.program-card h3 {
    margin-bottom: 15px;
    color: #333;
}

.program-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    font-size: 14px;
    color: #666;
}

.school-gallery {
    background: #f8f9fa;
    padding: 80px 0;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 40px;
}

.gallery-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 10px;
}

.school-contact {
    padding: 80px 0;
}

.contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
}

.contact-details {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.contact-item {
    display: flex;
    gap: 20px;
    align-items: start;
}

.contact-item i {
    width: 40px;
    height: 40px;
    background: #d32f2f;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.contact-form {
    background: #f8f9fa;
    padding: 40px;
    border-radius: 15px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 15px;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 16px;
}

.form-group textarea {
    height: 120px;
    resize: vertical;
}

.btn {
    width: 100%;
    padding: 15px;
    background: #d32f2f;
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background 0.3s ease;
}

.btn:hover {
    background: #b71c1c;
}

.loading-state {
    padding: 100px 0;
    text-align: center;
}

.loading-content i {
    font-size: 48px;
    color: #d32f2f;
    margin-bottom: 20px;
}

@media (max-width: 768px) {

    .overview-grid,
    .contact-grid {
        grid-template-columns: 1fr;
        gap: 40px;
    }

    .school-quick-info {
        flex-direction: column;
        gap: 15px;
    }

    .programs-grid,
    .gallery-grid {
        grid-template-columns: 1fr;
    }
} */
</style>