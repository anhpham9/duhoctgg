<template>
    <div class="content-container">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-info">
                <h1 class="page-title">
                    <i class="fas fa-tachometer-alt"></i>
                    Dashboard
                </h1>
                <p class="page-description">Tổng quan hệ thống quản lý Du Học Nhật Bản</p>
            </div>
        </div>

        <!-- Content Sections -->
        <div class="content-sections">
            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <i class="fas fa-phone"></i>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-number">12</h3>
                        <p class="stat-label">Liên hệ hôm nay</p>
                        <span class="stat-change positive">
                            <i class="fas fa-arrow-up"></i>
                            +3 so với hôm qua
                        </span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-university"></i>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-number">5</h3>
                        <p class="stat-label">Trường đối tác</p>
                        <span class="stat-change neutral">
                            <i class="fas fa-check"></i>
                            Hoàn chỉnh
                        </span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-number">7</h3>
                        <p class="stat-label">Chưa liên hệ</p>
                        <span class="stat-change neutral">
                            <i class="fas fa-exclamation-triangle"></i>
                            Cần xử lý
                        </span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon info">
                        <i class="fas fa-newspaper"></i>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-number">24</h3>
                        <p class="stat-label">Bài viết tuần này</p>
                        <span class="stat-change positive">
                            <i class="fas fa-arrow-up"></i>
                            +8 so với tuần trước
                        </span>
                    </div>
                </div>
            </div>

            <!-- Main Dashboard Grid -->
            <div class="dashboard-grid">
                <!-- Chart Section -->
                <div class="dashboard-card chart-card">
                    <div class="card-header">
                        <h3 class="card-title">Thống kê liên hệ tư vấn theo tuần</h3>
                        <div class="card-actions">
                            <label for="periodSelect" hidden></label>
                            <select id="periodSelect" class="period-select">
                                <option value="week">7 ngày qua</option>
                                <option value="month">30 ngày qua</option>
                                <option value="quarter">3 tháng qua</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="chart-placeholder">
                            <div class="chart-bars">
                                <div class="chart-bar" style="height: 45%;" data-value="9">
                                    <span class="bar-label">9</span>
                                </div>
                                <div class="chart-bar" style="height: 60%;" data-value="12">
                                    <span class="bar-label">12</span>
                                </div>
                                <div class="chart-bar" style="height: 30%;" data-value="6">
                                    <span class="bar-label">6</span>
                                </div>
                                <div class="chart-bar" style="height: 80%;" data-value="16">
                                    <span class="bar-label">16</span>
                                </div>
                                <div class="chart-bar" style="height: 70%;" data-value="14">
                                    <span class="bar-label">14</span>
                                </div>
                                <div class="chart-bar" style="height: 55%;" data-value="11">
                                    <span class="bar-label">11</span>
                                </div>
                                <div class="chart-bar" style="height: 90%;" data-value="18">
                                    <span class="bar-label">18</span>
                                </div>
                            </div>
                            <div class="chart-labels">
                                <span>T2</span><span>T3</span><span>T4</span><span>T5</span>
                                <span>T6</span><span>T7</span><span>CN</span>
                            </div>
                        </div>
                        <div class="chart-legend">
                            <div class="legend-item">
                                <span class="legend-color primary"></span>
                                <span>Liên hệ mới</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color success"></span>
                                <span>Đã xử lý</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Liên hệ tư vấn gần đây</h3>
                        <a href="contacts.html" class="view-all-btn">Xem tất cả</a>
                    </div>
                    <div class="card-content">
                        <div class="activity-list">
                            <div class="activity-item">
                                <div class="activity-content">
                                    <p><strong>Nguyễn Văn A</strong> - 0987654321</p>
                                    <p>example@email.com</p>
                                    <p class="activity-details">Quan tâm du học Đại học Tokyo</p>
                                    <span class="activity-time">2 phút trước</span>
                                </div>
                                <div class="activity-status new">
                                    <i class="fas fa-circle"></i>
                                </div>
                            </div>

                            <div class="activity-item">
                                <div class="activity-content">
                                    <p><strong>Trần Thị B</strong> - 0912345678</p>
                                    <p>example@email.com</p>
                                    <p class="activity-details">Đã liên hệ và tư vấn</p>
                                    <span class="activity-time">15 phút trước</span>
                                </div>
                                <div class="activity-status completed">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                            </div>

                            <div class="activity-item">
                                <div class="activity-content">
                                    <p><strong>Lê Văn C</strong> - 0976543210</p>
                                    <p>example@email.com</p>
                                    <p class="activity-details">Hỏi về học phí và thủ tục</p>
                                    <span class="activity-time">1 giờ trước</span>
                                </div>
                                <div class="activity-status pending">
                                    <i class="fas fa-clock"></i>
                                </div>
                            </div>

                            <div class="activity-item">
                                <div class="activity-content">
                                    <p><strong>Phạm Thị D</strong> - phamd@email.com</p>
                                    <p>example@email.com</p>
                                    <p class="activity-details">Gửi email tư vấn trường tiếng Nhật</p>
                                    <span class="activity-time">2 giờ trước</span>
                                </div>
                                <div class="activity-status completed">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Thao tác nhanh</h3>
                    </div>
                    <div class="card-content">
                        <div class="quick-actions">
                            <a href="contacts.html" class="quick-action-btn priority">
                                <i class="fas fa-phone"></i>
                                <span>Liên hệ mới</span>
                                <span class="badge">7</span>
                            </a>
                            <a href="schools.html" class="quick-action-btn">
                                <i class="fas fa-university"></i>
                                <span>Quản lý trường</span>
                            </a>
                            <a href="news.html" class="quick-action-btn">
                                <i class="fas fa-newspaper"></i>
                                <span>Đăng tin tức</span>
                            </a>
                            <a href="settings-seo.html" class="quick-action-btn">
                                <i class="fas fa-search"></i>
                                <span>Cài đặt SEO</span>
                            </a>
                            <a href="homepage-content.html" class="quick-action-btn">
                                <i class="fas fa-edit"></i>
                                <span>Sửa nội dung</span>
                            </a>
                            <a href="settings-backup.html" class="quick-action-btn">
                                <i class="fas fa-download"></i>
                                <span>Sao lưu</span>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Top Schools -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">5 Trường đối tác</h3>
                        <a href="schools.html" class="view-all-btn">Quản lý</a>
                    </div>
                    <div class="card-content">
                        <div class="school-list">
                            <div class="school-item">
                                <div class="school-rank top">1</div>
                                <div class="school-info">
                                    <h4>Đại học Tokyo</h4>
                                    <p>Tokyo, Nhật Bản</p>
                                    <span class="school-type">Đại học công lập</span>
                                </div>
                                <div class="school-stats">
                                    <span class="interest-count">45 quan tâm</span>
                                </div>
                            </div>

                            <div class="school-item">
                                <div class="school-rank">2</div>
                                <div class="school-info">
                                    <h4>Trường Nhật ngữ Waseda</h4>
                                    <p>Tokyo, Nhật Bản</p>
                                    <span class="school-type">Trường tiếng Nhật</span>
                                </div>
                                <div class="school-stats">
                                    <span class="interest-count">32 quan tâm</span>
                                </div>
                            </div>

                            <div class="school-item">
                                <div class="school-rank">3</div>
                                <div class="school-info">
                                    <h4>Cao đẳng Osaka</h4>
                                    <p>Osaka, Nhật Bản</p>
                                    <span class="school-type">Cao đẳng chuyên nghiệp</span>
                                </div>
                                <div class="school-stats">
                                    <span class="interest-count">28 quan tâm</span>
                                </div>
                            </div>

                            <div class="school-item">
                                <div class="school-rank">4</div>
                                <div class="school-info">
                                    <h4>Học viện tiếng Nhật KAI</h4>
                                    <p>Tokyo, Nhật Bản</p>
                                    <span class="school-type">Trường tiếng Nhật</span>
                                </div>
                                <div class="school-stats">
                                    <span class="interest-count">19 quan tâm</span>
                                </div>
                            </div>

                            <div class="school-item">
                                <div class="school-rank">5</div>
                                <div class="school-info">
                                    <h4>Đại học Kyoto</h4>
                                    <p>Kyoto, Nhật Bản</p>
                                    <span class="school-type">Đại học quốc lập</span>
                                </div>
                                <div class="school-stats">
                                    <span class="interest-count">15 quan tâm</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Website Stats -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Thống kê website</h3>
                        <a href="#" class="view-all-btn">Chi tiết</a>
                    </div>
                    <div class="card-content">
                        <div class="website-stats">
                            <div class="stat-row">
                                <div class="stat-label">
                                    <i class="fas fa-eye"></i>
                                    <span>Lượt xem hôm nay</span>
                                </div>
                                <div class="stat-value">1,247</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-label">
                                    <i class="fas fa-users"></i>
                                    <span>Người dùng duy nhất</span>
                                </div>
                                <div class="stat-value">892</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-label">
                                    <i class="fas fa-clock"></i>
                                    <span>Thời gian trung bình</span>
                                </div>
                                <div class="stat-value">3:42</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-label">
                                    <i class="fas fa-mobile-alt"></i>
                                    <span>Truy cập mobile</span>
                                </div>
                                <div class="stat-value">68%</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-label">
                                    <i class="fas fa-star"></i>
                                    <span>Trang phổ biến nhất</span>
                                </div>
                                <div class="stat-value">Trang chủ</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import "~/assets/css/admin/dashboard.css";
definePageMeta({
    layout: "admin",
    middleware: ["auth"],  // Sử dụng auth middleware thật
    ssr: false
});
</script>