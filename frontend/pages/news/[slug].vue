<template>
    <div>
        <!-- Page Hero with simple props -->
        <!-- <PageHero title="Tin Tức Du Học" subtitle="Cập nhật thông tin mới nhất về du học Nhật Bản"
            breadcrumb-text="Tin tức" /> -->
        <PageHero>
            <nav class="breadcrumb">
                <NuxtLink to="/">Trang chủ</NuxtLink>
                <span>/</span>
                <NuxtLink to="/news">Tin tức</NuxtLink>
                <span>/</span>
                <span>Chi tiết</span>
            </nav>

            <h1>Chi tiết bài viết</h1>
            <p>Học Bổng Toàn Phần Du Học Nhật Bản 2024</p>

        </PageHero>

        <!-- Article Detail Section -->
        <section class="article-detail-section">
            <div class="container">
                <div class="article-detail-content">
                    <!-- Main Article -->
                    <article class="article-main">
                        <div class="article-header">
                            <div class="article-category-tag">Tin Nổi Bật</div>
                            <h1>Học Bổng Toàn Phần Du Học Nhật Bản 2024 - Cơ Hội Vàng Cho Sinh Viên Việt Nam</h1>
                            <div class="article-meta">
                                <div class="meta-info">
                                    <span class="article-date"><i class="fas fa-calendar"></i> 15/03/2024</span>
                                    <span class="article-author"><i class="fas fa-user"></i> Admin</span>
                                    <span class="article-views"><i class="fas fa-eye"></i> 1,250 lượt xem</span>
                                </div>
                                <div class="social-share">
                                    <span>Chia sẻ:</span>
                                    <a href="#" class="share-btn facebook"><i class="fab fa-facebook-f"></i></a>
                                    <a href="#" class="share-btn tiktok"><i class="fab fa-tiktok"></i></a>
                                    <a href="#" class="share-btn twitter"><i class="fab fa-twitter"></i></a>
                                    <a href="#" class="share-btn copy-link"><i class="fas fa-link"></i></a>
                                </div>
                            </div>
                        </div>

                        <div class="article-image">
                            <img src="/assets/images/news-2.jpg" alt="Học bổng du học Nhật Bản 2024">
                        </div>

                        <div class="article-content">
                            <div class="content-summary">
                                <p><strong>Chính phủ Nhật Bản vừa công bố chương trình học bổng MEXT 2024 dành cho sinh
                                        viên
                                        quốc tế, bao gồm cả sinh viên Việt Nam. Đây là cơ hội tuyệt vời để theo đuổi ước
                                        mơ
                                        du học tại đất nước mặt trời mọc với chi phí hoàn toàn miễn phí.</strong></p>
                            </div>

                            <h2>Thông Tin Chung Về Học Bổng MEXT 2024</h2>
                            <p>Học bổng Chính phủ Nhật Bản (MEXT - Ministry of Education, Culture, Sports, Science and
                                Technology) là một trong những chương trình học bổng uy tín và được săn đón nhiều nhất
                                trên
                                thế giới. Chương trình này được thiết lập từ năm 1954 với mục đích thu hút những sinh
                                viên
                                xuất sắc từ các quốc gia trên thế giới đến học tập tại Nhật Bản.</p>

                            <p>Năm 2024, chương trình học bổng MEXT tiếp tục mở rộng quy mô và nâng cao chất lượng, mang
                                đến
                                cơ hội học tập tuyệt vời cho các sinh viên quốc tế, đặc biệt là sinh viên Việt Nam.</p>

                            <h2>Các Loại Học Bổng MEXT 2024</h2>

                            <h3>1. Học Bổng Nghiên Cứu Sinh (Research Students)</h3>
                            <ul>
                                <li><strong>Thời gian:</strong> 18-24 tháng (bao gồm 6 tháng học tiếng Nhật và 12-18
                                    tháng
                                    nghiên cứu)</li>
                                <li><strong>Đối tượng:</strong> Ứng viên đã tốt nghiệp đại học, muốn theo học thạc sĩ
                                    hoặc
                                    tiến sĩ</li>
                                <li><strong>Hỗ trợ:</strong> 147,000 Yên/tháng + học phí + vé máy bay khứ hồi</li>
                            </ul>

                            <h3>2. Học Bổng Sinh Viên Đại Học (Undergraduate Students)</h3>
                            <ul>
                                <li><strong>Thời gian:</strong> 5 năm (1 năm học tiếng Nhật + 4 năm đại học)</li>
                                <li><strong>Đối tượng:</strong> Học sinh đã tốt nghiệp THPT</li>
                                <li><strong>Hỗ trợ:</strong> 117,000 Yên/tháng + học phí + vé máy bay khứ hồi</li>
                            </ul>

                            <h3>3. Học Bổng Cao Đẳng Kỹ Thuật (College of Technology)</h3>
                            <ul>
                                <li><strong>Thời gian:</strong> 4 năm (1 năm học tiếng Nhật + 3 năm cao đẳng kỹ thuật)
                                </li>
                                <li><strong>Đối tượng:</strong> Học sinh đã hoàn thành lớp 11</li>
                                <li><strong>Hỗ trợ:</strong> 117,000 Yên/tháng + học phí + vé máy bay khứ hồi</li>
                            </ul>

                            <div class="quote-box">
                                <blockquote>
                                    "Học bổng MEXT không chỉ hỗ trợ tài chính mà còn mở ra cơ hội tiếp cận với nền giáo
                                    dục
                                    tiên tiến, văn hóa độc đáo và môi trường nghiên cứu hàng đầu thế giới tại Nhật Bản."
                                </blockquote>
                            </div>

                            <h2>Điều Kiện Xét Tuyển</h2>

                            <h3>Điều Kiện Chung:</h3>
                            <ul>
                                <li>Có quốc tịch Việt Nam</li>
                                <li>Tuổi dưới 35 (đối với nghiên cứu sinh), dưới 25 (đối với sinh viên đại học)</li>
                                <li>Có sức khỏe tốt</li>
                                <li>Không được nhận học bổng khác từ chính phủ Nhật Bản</li>
                                <li>Cam kết trở về Việt Nam sau khi hoàn thành chương trình</li>
                            </ul>

                            <h3>Điều Kiện Học Vấn:</h3>
                            <ul>
                                <li><strong>Nghiên cứu sinh:</strong> Tốt nghiệp đại học với GPA từ 3.0/4.0 trở lên</li>
                                <li><strong>Sinh viên đại học:</strong> Tốt nghiệp THPT với điểm trung bình từ 8.0/10
                                    trở
                                    lên</li>
                                <li><strong>Cao đẳng kỹ thuật:</strong> Hoàn thành lớp 11 với kết quả học tập tốt</li>
                            </ul>

                            <h2>Quy Trình Đăng Ký</h2>

                            <div class="process-steps">
                                <div class="process-step">
                                    <div class="process-step-number">1</div>
                                    <div class="process-step-content">
                                        <h4>Chuẩn Bị Hồ Sơ</h4>
                                        <p>Thu thập và chuẩn bị đầy đủ các tài liệu theo yêu cầu</p>
                                    </div>
                                </div>
                                <div class="process-step">
                                    <div class="process-step-number">2</div>
                                    <div class="process-step-content">
                                        <h4>Nộp Hồ Sơ</h4>
                                        <p>Nộp hồ sơ tại Đại sứ quán Nhật Bản tại Việt Nam</p>
                                    </div>
                                </div>
                                <div class="process-step">
                                    <div class="process-step-number">3</div>
                                    <div class="process-step-content">
                                        <h4>Thi Sơ Tuyển</h4>
                                        <p>Tham gia kỳ thi sơ tuyển tại Việt Nam</p>
                                    </div>
                                </div>
                                <div class="process-step">
                                    <div class="process-step-number">4</div>
                                    <div class="process-step-content">
                                        <h4>Xét Tuyển Cuối</h4>
                                        <p>Chờ kết quả xét tuyển từ Bộ Giáo dục Nhật Bản</p>
                                    </div>
                                </div>
                            </div>

                            <h2>Hồ Sơ Cần Thiết</h2>
                            <ul>
                                <li>Đơn xin học bổng (theo mẫu)</li>
                                <li>Bản sao học bạ/bảng điểm đại học có công chứng</li>
                                <li>Bản sao bằng tốt nghiệp có công chứng</li>
                                <li>Thư giới thiệu từ giáo viên/giảng viên</li>
                                <li>Kế hoạch học tập và nghiên cứu</li>
                                <li>Chứng chỉ năng lực tiếng Nhật (nếu có)</li>
                                <li>Chứng chỉ năng lực tiếng Anh (TOEFL/IELTS)</li>
                                <li>Giấy khám sức khỏe</li>
                                <li>Ảnh 4x6 (6 tấm)</li>
                            </ul>

                            <h2>Lịch Trình Quan Trọng</h2>
                            <div class="timeline">
                                <div class="timeline-item">
                                    <div class="timeline-date">Tháng 4-5/2024</div>
                                    <div class="timeline-content">Công bố thông tin và Công bố thông tin và mở đăng ký
                                    </div>
                                </div>
                                <div class="timeline-item">
                                    <div class="timeline-date">Tháng 6/2024</div>
                                    <div class="timeline-content">Hạn chót nộp hồ sơ</div>
                                </div>
                                <div class="timeline-item">
                                    <div class="timeline-date">Tháng 7-8/2024</div>
                                    <div class="timeline-content">Thi sơ tuyển tại Việt Nam</div>
                                </div>
                                <div class="timeline-item">
                                    <div class="timeline-date">Tháng 10-11/2024</div>
                                    <div class="timeline-content">Công bố kết quả</div>
                                </div>
                                <div class="timeline-item">
                                    <div class="timeline-date">Tháng 4/2025</div>
                                    <div class="timeline-content">Bắt đầu chương trình học</div>
                                </div>
                            </div>

                            <h2>Lời Khuyên Cho Ứng Viên</h2>
                            <div class="tips-box">
                                <div class="tip-item">
                                    <i class="fas fa-lightbulb"></i>
                                    <p><strong>Chuẩn bị sớm:</strong> Bắt đầu chuẩn bị hồ sơ từ 6 tháng trước khi nộp để
                                        đảm
                                        bảo chất lượng tốt nhất.</p>
                                </div>
                                <div class="tip-item">
                                    <i class="fas fa-book-open"></i>
                                    <p><strong>Học tiếng Nhật:</strong> Dù không bắt buộc, việc có kiến thức tiếng Nhật
                                        cơ
                                        bản sẽ tăng cơ hội được chọn.</p>
                                </div>
                                <div class="tip-item">
                                    <i class="fas fa-users"></i>
                                    <p><strong>Tham khảo kinh nghiệm:</strong> Trao đổi với những người đã từng nhận học
                                        bổng để có thêm kinh nghiệm.</p>
                                </div>
                            </div>

                            <p>Học bổng MEXT 2024 là cơ hội không thể bỏ lỡ đối với những sinh viên Việt Nam có ước mơ
                                du
                                học tại Nhật Bản. Với sự hỗ trợ toàn diện về tài chính và cơ hội tiếp cận nền giáo dục
                                hàng
                                đầu thế giới, chương trình này sẽ mở ra những chân trời mới cho tương lai của bạn.</p>
                        </div>

                        <!-- Article Tags -->
                        <div class="article-tags">
                            <h3>Từ khóa:</h3>
                            <div class="tag-list">
                                <a href="#" class="tag">Học bổng MEXT</a>
                                <a href="#" class="tag">Du học Nhật Bản</a>
                                <a href="#" class="tag">Học bổng toàn phần</a>
                                <a href="#" class="tag">Chính phủ Nhật Bản</a>
                                <a href="#" class="tag">2024</a>
                            </div>
                        </div>

                        <!-- Navigation -->
                        <div class="article-navigation">
                            <a href="news.html" class="nav-btn prev">
                                <i class="fas fa-chevron-left"></i>
                                <div>
                                    <span>Bài trước</span>
                                    <h4>Top 10 Trường Đại Học Nhật Bản Dễ Xin Học Bổng Nhất</h4>
                                </div>
                            </a>
                            <a href="news.html" class="nav-btn next">
                                <div>
                                    <span>Bài tiếp</span>
                                    <h4>Hướng Dẫn Làm Hồ Sơ Xin Visa Du Học Nhật Bản</h4>
                                </div>
                                <i class="fas fa-chevron-right"></i>
                            </a>
                        </div>
                    </article>

                    <!-- Sidebar -->
                    <aside class="article-sidebar">
                        <!-- Quick Info -->
                        <div class="sidebar-widget">
                            <h3>Thông Tin Nhanh</h3>
                            <div class="quick-info">
                                <div class="info-item">
                                    <i class="fas fa-calendar-alt"></i>
                                    <div>
                                        <span>Hạn nộp hồ sơ</span>
                                        <strong>Tháng 6/2024</strong>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-money-bill-wave"></i>
                                    <div>
                                        <span>Học bổng</span>
                                        <strong>117,000-147,000 Yên/tháng</strong>
                                    </div>
                                </div>
                                <div class="info-item">
                                    <i class="fas fa-graduation-cap"></i>
                                    <div>
                                        <span>Bậc học</span>
                                        <strong>Đại học, Thạc sĩ, Tiến sĩ</strong>
                                    </div>
                                </div>
                            </div>
                            <a href="contact.html" class="btn btn-primary">Tư Vấn Ngay</a>
                        </div>

                        <!-- Recent Posts -->
                        <div class="sidebar-widget">
                            <h3>Bài Viết Liên Quan</h3>
                            <div class="related-posts">
                                <div class="related-post">
                                    <div class="related-post-image">
                                        <img src="/assets/images/news-2.jpg" alt="Bài viết liên quan">
                                    </div>
                                    <div class="related-post-content">
                                        <h4><a href="#">Top 10 Trường Đại Học Nhật Bản Dễ Xin Học Bổng Nhất 2024</a>
                                        </h4>
                                        <span class="related-date">12/03/2024</span>
                                    </div>
                                </div>
                                <div class="related-post">
                                    <div class="related-post-image">
                                        <img src="/assets/images/news-2.jpg" alt="Bài viết liên quan">
                                    </div>
                                    <div class="related-post-content">
                                        <h4><a href="#">Hướng Dẫn Làm Hồ Sơ Xin Visa Du Học Nhật Bản 2024</a></h4>
                                        <span class="related-date">10/03/2024</span>
                                    </div>
                                </div>
                                <div class="related-post">
                                    <div class="related-post-image">
                                        <img src="/assets/images/news-2.jpg" alt="Bài viết liên quan">
                                    </div>
                                    <div class="related-post-content">
                                        <h4><a href="#">Chi Phí Du Học Nhật Bản 2024 - Phân Tích Chi Tiết</a></h4>
                                        <span class="related-date">08/03/2024</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Categories -->
                        <div class="sidebar-widget">
                            <h3>Danh Mục</h3>
                            <ul class="category-list">
                                <li><a href="#">Học Bổng <span>(28)</span></a></li>
                                <li><a href="#">Thủ Tục Visa <span>(15)</span></a></li>
                                <li><a href="#">Kinh Nghiệm <span>(22)</span></a></li>
                                <li><a href="#">Tuyển Sinh <span>(18)</span></a></li>
                                <li><a href="#">Chi Phí <span>(10)</span></a></li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'default'
})
</script>

<style scoped>
/* Article Detail Page Styles */
.article-detail-section {
    padding: 80px 0;
    background: #fff;
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

.article-content>p {
    /* color: #fff; */
    line-height: 1.7;
    margin-bottom: 15px;
    font-size: 1rem;
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