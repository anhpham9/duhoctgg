<template>
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Du Học NB</h3>
                    <p>Đồng hành cùng bạn trên hành trình chinh phục ước mơ du học.</p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-tiktok"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Dịch vụ</h4>
                    <ul>
                        <li><a href="#">Tư vấn chọn trường</a></li>
                        <li><a href="#">Hỗ trợ hồ sơ</a></li>
                        <li><a href="#">Visa & Thủ tục</a></li>
                        <li><a href="#">Hỗ trợ lưu trú</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Liên hệ</h4>
                    <ul>
                        <li><i class="fas fa-phone"></i> +84 123 456 789</li>
                        <li><i class="fas fa-envelope"></i> info@duhocnb.com</li>
                        <li><i class="fas fa-map-marker-alt"></i> 123 Đường ABC, Q1, HCM</li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 Du Học NB. All rights reserved.</p>
            </div>
        </div>
    </footer>
</template>

<script setup>

</script>

<style scoped>
/* Footer */
.footer {
    /* background: #d32f2f; */
    color: white;
    padding: 180px 0 20px;
    background-image:
        linear-gradient(rgba(211, 47, 47, 0.8), rgba(211, 47, 47, 0.8)),
        url('/footer-bg.jpg');

    background-size: cover;
    /* ảnh phủ full chiều rộng */
    background-position: bottom;
    /* căn giữa ảnh */
    background-repeat: no-repeat;
    /* không lặp ảnh */

    width: 100%;
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
    margin-bottom: 40px;
}

.footer-section h3,
.footer-section h4 {
    margin-bottom: 20px;
    color: #ffeb3b;
}

.footer-section ul {
    list-style: none;
}

.footer-section ul li {
    margin-bottom: 10px;
}

.footer-section ul li a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-section ul li a:hover {
    color: #ffeb3b;
}

.social-links {
    display: flex;
    gap: 15px;
    margin-top: 20px;
}

.social-links a {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s ease;
}

.social-links a:hover {
    background: #ffeb3b;
    color: #d32f2f;
}

.footer-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-bottom p {
    color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 1024px) {
    
    /* Footer */
    .footer-content {
        grid-template-columns: 1fr 1fr;
        gap: 30px;
    }

    .footer-section:nth-child(1) {
        grid-column: 1 / -1;
    }

    .footer-section:nth-child(3) {
        text-align: right;
    }
}

@media (max-width: 768px) {

    .footer {
        padding: 300px 0 15px;
    }
}

@media (max-width: 480px) {
    .footer-content {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .footer-section:nth-child(3) {
        text-align: left;
    }
}
</style>