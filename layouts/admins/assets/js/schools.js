/**
 * Schools Management JavaScript
 * Handles Japanese language schools data, filtering, pagination, sorting, and actions
 */

// Sample schools data
const SAMPLE_SCHOOLS = [
    {
        id: 1,
        name: 'Tokyo Institute of Japanese Language',
        logo: 'assets/images/av.png',
        address: '2-8-1 Nishi-Shinjuku, Shinjuku-ku, Tokyo 160-0023',
        region: 'tokyo',
        type: 'private',
        students: 850,
        tuition: 820000,
        rating: 4.5,
        status: 'active',
        website: 'https://tijl.jp',
        email: 'info@tijl.jp',
        phone: '+81-3-5321-1234',
        description: 'Trường Nhật ngữ Tokyo là một trong những trường hàng đầu tại Tokyo với hơn 30 năm kinh nghiệm đào tạo. Chương trình học được thiết kế chuyên nghiệp từ cơ bản đến nâng cao, phục vụ học viên từ mọi trình độ.',
        established: '1990',
        accreditation: 'JSL Association certified'
    },
    {
        id: 2,
        name: 'Osaka Language Academy',
        logo: 'assets/images/av.png',
        address: '1-5-20 Namba, Chuo-ku, Osaka 542-0076',
        region: 'osaka',
        type: 'private',
        students: 620,
        tuition: 750000,
        rating: 4.2,
        status: 'partner',
        website: 'https://ola-japan.com',
        email: 'admission@ola-japan.com',
        phone: '+81-6-6211-5678',
        description: 'Học viện Nhật ngữ Osaka nổi tiếng với phương pháp giảng dạy hiện đại và môi trường học tập thân thiện. Trường có các khóa học đa dạng phù hợp với nhu cầu sinh viên quốc tế.',
        established: '1985',
        accreditation: 'JCSL certified'
    },
    {
        id: 3,
        name: 'Kyoto International School',
        logo: 'assets/images/av.png',
        address: '456 Higashiyama-ku, Kyoto 605-0074',
        region: 'kyoto',
        type: 'public',
        students: 450,
        tuition: 680000,
        rating: 4.7,
        status: 'active',
        website: 'https://kis-kyoto.edu.jp',
        email: 'info@kis-kyoto.edu.jp',
        phone: '+81-75-561-2345',
        description: 'Trường Quốc tế Kyoto cung cấp giáo dục Nhật ngữ chất lượng cao trong môi trường văn hóa truyền thống. Sinh viên có cơ hội trải nghiệm văn hóa Nhật Bản một cách sâu sắc nhất.',
        established: '1978',
        accreditation: 'Ministry of Education certified'
    },
    {
        id: 4,
        name: 'Fukuoka Japanese Language Center',
        logo: 'assets/images/av.png',
        address: '2-1-10 Hakata-ku, Fukuoka 812-0013',
        region: 'fukuoka',
        type: 'private',
        students: 380,
        tuition: 650000,
        rating: 4.1,
        status: 'active',
        website: 'https://fjlc.ac.jp',
        email: 'contact@fjlc.ac.jp',
        phone: '+81-92-281-7890',
        description: 'Trung tâm Nhật ngữ Fukuoka chuyên đào tạo sinh viên quốc tế với chi phí hợp lý. Thành phố Fukuoka là lựa chọn tuyệt vời cho những ai muốn học tập trong môi trường năng động.',
        established: '1995',
        accreditation: 'JSL Association certified'
    },
    {
        id: 5,
        name: 'Nagoya International Institute',
        logo: 'assets/images/av.png',
        address: '3-15-5 Sakae, Naka-ku, Nagoya 460-0008',
        region: 'nagoya',
        type: 'corporate',
        students: 290,
        tuition: 720000,
        rating: 3.9,
        status: 'partner',
        website: 'https://nii-nagoya.com',
        email: 'info@nii-nagoya.com',
        phone: '+81-52-951-2468',
        description: 'Viện Quốc tế Nagoya cung cấp các khóa học Nhật ngữ tập trung vào thực hành giao tiếp. Trường có mối liên hệ chặt chẽ với các doanh nghiệp địa phương.',
        established: '2000',
        accreditation: 'JCSL certified'
    },
    {
        id: 6,
        name: 'Sendai Study Abroad School',
        logo: 'assets/images/av.png',
        address: '1-8-12 Aoba-ku, Sendai 980-0021',
        region: 'sendai',
        type: 'private',
        students: 320,
        tuition: 600000,
        rating: 4.3,
        status: 'active',
        website: 'https://sss-sendai.jp',
        email: 'admissions@sss-sendai.jp',
        phone: '+81-22-222-1357',
        description: 'Trường Du học Sendai được biết đến với chương trình hỗ trợ toàn diện cho sinh viên quốc tế. Chi phí sinh hoạt tại Sendai thấp hơn so với Tokyo và Osaka.',
        established: '1992',
        accreditation: 'JSL Association certified'
    },
    {
        id: 7,
        name: 'Sapporo Language Institute',
        logo: 'assets/images/av.png',
        address: '5-3-1 Chuo-ku, Sapporo 060-0061',
        region: 'other',
        type: 'private',
        students: 180,
        tuition: 580000,
        rating: 4.0,
        status: 'active',
        website: 'https://sli-sapporo.com',
        email: 'info@sli-sapporo.com',
        phone: '+81-11-521-9876',
        description: 'Viện Ngôn ngữ Sapporo là lựa chọn tuyệt vời cho những ai yêu thích khí hậu mát mẻ. Trường cung cấp giáo dục chất lượng với chi phí hợp lý.',
        established: '1988',
        accreditation: 'JCSL certified'
    },
    {
        id: 8,
        name: 'Hiroshima Peace University',
        logo: 'assets/images/av.png',
        address: '1-2-3 Naka-ku, Hiroshima 730-0011',
        region: 'other',
        type: 'public',
        students: 420,
        tuition: 640000,
        rating: 4.4,
        status: 'partner',
        website: 'https://hpu-hiroshima.ac.jp',
        email: 'international@hpu-hiroshima.ac.jp',
        phone: '+81-82-241-5432',
        description: 'Đại học Hòa bình Hiroshima không chỉ dạy Nhật ngữ mà còn truyền tải thông điệp hòa bình. Sinh viên có cơ hội tìm hiểu về lịch sử và văn hóa Nhật Bản.',
        established: '1975',
        accreditation: 'Ministry of Education certified'
    },
    {
        id: 9,
        name: 'Kobe Maritime Academy',
        logo: 'assets/images/av.png',
        address: '2-4-6 Chuo-ku, Kobe 650-0024',
        region: 'osaka',
        type: 'private',
        students: 350,
        tuition: 700000,
        rating: 3.8,
        status: 'active',
        website: 'https://kma-kobe.jp',
        email: 'info@kma-kobe.jp',
        phone: '+81-78-331-2468',
        description: 'Học viện Hàng hải Kobe chuyên đào tạo Nhật ngữ với focus vào các ngành hàng hải và logistics. Thành phố cảng Kobe mang đến nhiều cơ hội thực tế.',
        established: '1982',
        accreditation: 'JSL Association certified'
    },
    {
        id: 10,
        name: 'Kanazawa Cultural School',
        logo: 'assets/images/av.png',
        address: '3-7-15 Kanazawa-shi, Ishikawa 920-0853',
        region: 'other',
        type: 'private',
        students: 240,
        tuition: 590000,
        rating: 4.2,
        status: 'inactive',
        website: 'https://kcs-kanazawa.edu.jp',
        email: 'contact@kcs-kanazawa.edu.jp',
        phone: '+81-76-223-4567',
        description: 'Trường Văn hóa Kanazawa cung cấp giáo dục Nhật ngữ kết hợp với trải nghiệm văn hóa truyền thống. Hiện tại trường đang tạm dừng hoạt động để nâng cấp cơ sở vật chất.',
        established: '1990',
        accreditation: 'JCSL certified'
    },
    {
        id: 11,
        name: 'Yokohama International University',
        logo: 'assets/images/av.png',
        address: '1-11-1 Minato Mirai, Yokohama 231-0001',
        region: 'tokyo',
        type: 'public',
        students: 650,
        tuition: 780000,
        rating: 4.6,
        status: 'partner',
        website: 'https://yiu-yokohama.ac.jp',
        email: 'admission@yiu-yokohama.ac.jp',
        phone: '+81-45-663-1234',
        description: 'Đại học Quốc tế Yokohama là một trong những trường uy tín nhất vùng Kanto. Chương trình Nhật ngữ được thiết kế để chuẩn bị cho sinh viên theo học các khóa đại học.',
        established: '1965',
        accreditation: 'Ministry of Education certified'
    },
    {
        id: 12,
        name: 'Nara Heritage Institute',
        logo: 'assets/images/av.png',
        address: '2-5-8 Nara-shi, Nara 630-8213',
        region: 'osaka',
        type: 'private',
        students: 280,
        tuition: 620000,
        rating: 4.1,
        status: 'active',
        website: 'https://nhi-nara.jp',
        email: 'info@nhi-nara.jp',
        phone: '+81-742-26-7890',
        description: 'Viện Di sản Nara cung cấp giáo dục Nhật ngữ trong bối cảnh lịch sử văn hóa phong phú. Sinh viên có cơ hội khám phá cố đô Nhật Bản và các di tích lịch sử.',
        established: '1987',
        accreditation: 'JSL Association certified'
    },
    {
        id: 13,
        name: 'Okinawa Tropical Language School',
        logo: 'assets/images/av.png',
        address: '1-3-5 Naha-shi, Okinawa 900-0015',
        region: 'other',
        type: 'private',
        students: 150,
        tuition: 550000,
        rating: 3.9,
        status: 'active',
        website: 'https://otls-okinawa.com',
        email: 'info@otls-okinawa.com',
        phone: '+81-98-869-1234',
        description: 'Trường Ngôn ngữ Nhiệt đới Okinawa mang đến trải nghiệm học tập độc đáo tại hòn đảo xinh đẹp. Khí hậu ấm áp quanh năm và văn hóa đặc sắc của Okinawa.',
        established: '1998',
        accreditation: 'JCSL certified'
    },
    {
        id: 14,
        name: 'Kumamoto Innovation Academy',
        logo: 'assets/images/av.png',
        address: '4-2-7 Chuo-ku, Kumamoto 860-0803',
        region: 'fukuoka',
        type: 'corporate',
        students: 195,
        tuition: 580000,
        rating: 3.7,
        status: 'pending',
        website: 'https://kia-kumamoto.jp',
        email: 'contact@kia-kumamoto.jp',
        phone: '+81-96-354-2468',
        description: 'Học viện Đổi mới Kumamoto tập trung vào công nghệ và đổi mới trong giáo dục Nhật ngữ. Trường đang trong quá trình chờ phê duyệt các chương trình mới.',
        established: '2005',
        accreditation: 'Under review'
    },
    {
        id: 15,
        name: 'Gifu Mountain Institute',
        logo: 'assets/images/av.png',
        address: '2-8-3 Gifu-shi, Gifu 500-8076',
        region: 'nagoya',
        type: 'private',
        students: 220,
        tuition: 570000,
        rating: 4.0,
        status: 'active',
        website: 'https://gmi-gifu.edu.jp',
        email: 'admissions@gmi-gifu.edu.jp',
        phone: '+81-58-265-1357',
        description: 'Viện Núi Gifu cung cấp môi trường học tập yên tĩnh và gần gũi với thiên nhiên. Chi phí sinh hoạt thấp và chất lượng giáo dục cao là điểm mạnh của trường.',
        established: '1983',
        accreditation: 'JSL Association certified'
    },
    {
        id: 16,
        name: 'Shizuoka Coastal Academy',
        logo: 'assets/images/av.png',
        address: '3-1-9 Shizuoka-shi, Shizuoka 420-0853',
        region: 'tokyo',
        type: 'private',
        students: 310,
        tuition: 610000,
        rating: 4.2,
        status: 'partner',
        website: 'https://sca-shizuoka.jp',
        email: 'info@sca-shizuoka.jp',
        phone: '+81-54-251-9876',
        description: 'Học viện Ven biển Shizuoka kết hợp giáo dục Nhật ngữ với các hoạt động thể thao biển. Vị trí đắc địa giữa Tokyo và Osaka, gần núi Phú Sĩ.',
        established: '1991',
        accreditation: 'JCSL certified'
    },
    {
        id: 17,
        name: 'Matsuyama Castle School',
        logo: 'assets/images/av.png',
        address: '1-4-2 Matsuyama-shi, Ehime 790-0001',
        region: 'other',
        type: 'private',
        students: 160,
        tuition: 540000,
        rating: 3.8,
        status: 'active',
        website: 'https://mcs-matsuyama.jp',
        email: 'contact@mcs-matsuyama.jp',
        phone: '+81-89-921-3456',
        description: 'Trường Lâu đài Matsuyama mang đến không gian học tập cổ kính và thanh bình. Thành phố Matsuyama nổi tiếng với suối nước nóng và lịch sử lâu đời.',
        established: '1994',
        accreditation: 'JSL Association certified'
    },
    {
        id: 18,
        name: 'Niigata Snow Country Institute',
        logo: 'assets/images/av.png',
        address: '2-6-4 Chuo-ku, Niigata 950-0088',
        region: 'other',
        type: 'public',
        students: 270,
        tuition: 560000,
        rating: 4.1,
        status: 'active',
        website: 'https://nsci-niigata.ac.jp',
        email: 'info@nsci-niigata.ac.jp',
        phone: '+81-25-243-7890',
        description: 'Viện Xứ sở Tuyết Niigata cung cấp trải nghiệm học tập độc đáo với hoạt động trượt tuyết mùa đông. Vùng Niigata nổi tiếng với gạo và sake chất lượng cao.',
        established: '1986',
        accreditation: 'Ministry of Education certified'
    },
    {
        id: 19,
        name: 'Kagoshima Volcano Academy',
        logo: 'assets/images/av.png',
        address: '1-7-12 Kagoshima-shi, Kagoshima 890-0053',
        region: 'fukuoka',
        type: 'private',
        students: 200,
        tuition: 530000,
        rating: 3.9,
        status: 'active',
        website: 'https://kva-kagoshima.jp',
        email: 'admissions@kva-kagoshima.jp',
        phone: '+81-99-222-4567',
        description: 'Học viện Núi lửa Kagoshima nằm tại cực nam Nhật Bản với khí hậu ấm áp và con người thân thiện. Sinh viên có cơ hội trải nghiệm văn hóa độc đáo vùng Kyushu.',
        established: '1989',
        accreditation: 'JSL Association certified'
    },
    {
        id: 20,
        name: 'Takayama Alpine School',
        logo: 'assets/images/av.png',
        address: '3-5-1 Takayama-shi, Gifu 506-0031',
        region: 'nagoya',
        type: 'private',
        students: 130,
        tuition: 520000,
        rating: 4.3,
        status: 'partner',
        website: 'https://tas-takayama.edu.jp',
        email: 'info@tas-takayama.edu.jp',
        phone: '+81-577-32-1234',
        description: 'Trường Núi cao Takayama tọa lạc trong thành phố cổ xinh đẹp với kiến trúc truyền thống được bảo tồn. Môi trường học tập trong lành và yên bình.',
        established: '1996',
        accreditation: 'JCSL certified'
    },
    {
        id: 21,
        name: 'Hakodate Harbor Institute',
        logo: 'assets/images/av.png',
        address: '2-3-8 Hakodate-shi, Hokkaido 040-0054',
        region: 'other',
        type: 'private',
        students: 175,
        tuition: 550000,
        rating: 4.0,
        status: 'active',
        website: 'https://hhi-hakodate.jp',
        email: 'contact@hhi-hakodate.jp',
        phone: '+81-138-23-5678',
        description: 'Viện Cảng Hakodate mang đến trải nghiệm học tập tại thành phố cảng lịch sử với ảnh hưởng văn hóa quốc tế. Hokkaido nổi tiếng với hải sản tươi ngon.',
        established: '1993',
        accreditation: 'JSL Association certified'
    },
    {
        id: 22,
        name: 'Miyazaki Sunshine Academy',
        logo: 'assets/images/av.png',
        address: '1-9-5 Miyazaki-shi, Miyazaki 880-0805',
        region: 'fukuoka',
        type: 'private',
        students: 210,
        tuition: 540000,
        rating: 3.8,
        status: 'active',
        website: 'https://msa-miyazaki.com',
        email: 'info@msa-miyazaki.com',
        phone: '+81-985-24-7890',
        description: 'Học viện Ánh mặt trời Miyazaki tận hưởng khí hậu ôn hòa quanh năm và bãi biển tuyệt đẹp. Môi trường học tập thoải mái và chi phí sinh hoạt hợp lý.',
        established: '1999',
        accreditation: 'JCSL certified'
    },
    {
        id: 23,
        name: 'Akita Traditional Arts School',
        logo: 'assets/images/av.png',
        address: '4-2-7 Akita-shi, Akita 010-0001',
        region: 'other',
        type: 'public',
        students: 190,
        tuition: 570000,
        rating: 4.2,
        status: 'active',
        website: 'https://atas-akita.ac.jp',
        email: 'admissions@atas-akita.ac.jp',
        phone: '+81-18-833-2468',
        description: 'Trường Nghệ thuật Truyền thống Akita kết hợp giáo dục Nhật ngữ với học tập nghệ thuật dân gian. Vùng Tohoku mang đến trải nghiệm văn hóa sâu sắc.',
        established: '1984',
        accreditation: 'Ministry of Education certified'
    },
    {
        id: 24,
        name: 'Wakayama Temple University',
        logo: 'assets/images/av.png',
        address: '2-1-3 Wakayama-shi, Wakayama 640-8137',
        region: 'osaka',
        type: 'public',
        students: 340,
        tuition: 630000,
        rating: 4.4,
        status: 'partner',
        website: 'https://wtu-wakayama.ac.jp',
        email: 'international@wtu-wakayama.ac.jp',
        phone: '+81-73-422-1357',
        description: 'Đại học Chùa Wakayama có truyền thống lâu đời trong giáo dục Phật giáo và Nhật ngữ. Sinh viên có cơ hội tìm hiểu sâu về triết học và văn hóa Nhật Bản.',
        established: '1970',
        accreditation: 'Ministry of Education certified'
    },
    {
        id: 25,
        name: 'Tottori Sand Dune College',
        logo: 'assets/images/av.png',
        address: '3-4-6 Tottori-shi, Tottori 680-0001',
        region: 'other',
        type: 'private',
        students: 140,
        tuition: 510000,
        rating: 3.7,
        status: 'inactive',
        website: 'https://tsdc-tottori.jp',
        email: 'info@tsdc-tottori.jp',
        phone: '+81-857-26-9876',
        description: 'Cao đẳng Đồi cát Tottori có vị trí độc đáo gần sa mạc cát duy nhất tại Nhật Bản. Hiện tại trường đang tạm dừng hoạt động để cải tổ chương trình giảng dạy.',
        established: '2001',
        accreditation: 'Under review'
    }
];

// Table state management
let currentSchools = [...SAMPLE_SCHOOLS];
let filteredSchools = [...SAMPLE_SCHOOLS];
let currentPage = 1;
let rowsPerPage = 10;
let sortColumn = '';
let sortDirection = 'asc';
let currentView = 'table'; // 'table' or 'grid'

// DOM elements
let searchInput, regionFilter, typeFilter, statusFilter, minTuitionFilter, maxTuitionFilter;
let schoolsTableBody, schoolsGrid, paginationInfo, paginationNumbers;
let tableLoading, tableEmpty, tableView, gridView;
let firstPageBtn, prevPageBtn, nextPageBtn, lastPageBtn;
let bulkActionSelect, applyBulkActionBtn;

document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    renderData();
    updateStats();
});

function initializeElements() {
    // Filter elements
    searchInput = document.getElementById('searchInput');
    regionFilter = document.getElementById('regionFilter');
    typeFilter = document.getElementById('typeFilter');
    statusFilter = document.getElementById('statusFilter');
    minTuitionFilter = document.getElementById('minTuition');
    maxTuitionFilter = document.getElementById('maxTuition');
    
    // Table elements
    schoolsTableBody = document.getElementById('schoolsTableBody');
    schoolsGrid = document.getElementById('schoolsGrid');
    paginationInfo = document.getElementById('paginationInfo');
    paginationNumbers = document.getElementById('paginationNumbers');
    
    // State elements
    tableLoading = document.getElementById('tableLoading');
    tableEmpty = document.getElementById('tableEmpty');
    tableView = document.getElementById('tableView');
    gridView = document.getElementById('gridView');
    
    // Pagination buttons
    firstPageBtn = document.getElementById('firstPage');
    prevPageBtn = document.getElementById('prevPage');
    nextPageBtn = document.getElementById('nextPage');
    lastPageBtn = document.getElementById('lastPage');
    
    // Bulk actions
    bulkActionSelect = document.getElementById('bulkAction');
    applyBulkActionBtn = document.getElementById('applyBulkAction');
}

function initializeEventListeners() {
    // Search and filters
    if (searchInput) searchInput.addEventListener('input', debounceSearch);
    if (regionFilter) regionFilter.addEventListener('change', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (minTuitionFilter) minTuitionFilter.addEventListener('input', debounceSearch);
    if (maxTuitionFilter) maxTuitionFilter.addEventListener('input', debounceSearch);
    
    // Rows per page
    const rowsPerPageSelect = document.getElementById('rowsPerPage');
    if (rowsPerPageSelect) {
        rowsPerPageSelect.addEventListener('change', handleRowsPerPageChange);
    }
    
    // Clear filters
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }
    
    // Sortable headers
    const sortableHeaders = document.querySelectorAll('th.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => handleSort(header));
    });
    
    // View toggle buttons
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => handleViewChange(btn));
    });
    
    // Pagination buttons
    if (firstPageBtn) firstPageBtn.addEventListener('click', () => goToPage(1));
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
    if (lastPageBtn) lastPageBtn.addEventListener('click', () => goToPage(getTotalPages()));
    
    // Bulk actions
    if (applyBulkActionBtn) {
        applyBulkActionBtn.addEventListener('click', handleBulkAction);
    }
    
    // Add and export buttons
    const addSchoolBtn = document.getElementById('addSchoolBtn');
    if (addSchoolBtn) {
        addSchoolBtn.addEventListener('click', handleAddSchool);
    }
    
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
}

// Search with debounce
const debounceSearch = debounce(() => {
    applyFilters();
}, 300);

function applyFilters() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const regionValue = regionFilter?.value || '';
    const typeValue = typeFilter?.value || '';
    const statusValue = statusFilter?.value || '';
    const minTuition = parseInt(minTuitionFilter?.value) || 0;
    const maxTuition = parseInt(maxTuitionFilter?.value) || Infinity;
    
    filteredSchools = currentSchools.filter(school => {
        const matchesSearch = !searchTerm || 
            school.name.toLowerCase().includes(searchTerm) ||
            school.address.toLowerCase().includes(searchTerm) ||
            school.description.toLowerCase().includes(searchTerm);
            
        const matchesRegion = !regionValue || school.region === regionValue;
        const matchesType = !typeValue || school.type === typeValue;
        const matchesStatus = !statusValue || school.status === statusValue;
        const matchesTuition = school.tuition >= minTuition && school.tuition <= maxTuition;
        
        return matchesSearch && matchesRegion && matchesType && 
               matchesStatus && matchesTuition;
    });
    
    currentPage = 1; // Reset to first page
    renderData();
    updateStats();
}

function handleRowsPerPageChange() {
    const rowsPerPageSelect = document.getElementById('rowsPerPage');
    const value = rowsPerPageSelect.value;
    rowsPerPage = value === 'all' ? filteredSchools.length : parseInt(value);
    currentPage = 1;
    renderData();
}

function clearAllFilters() {
    if (searchInput) searchInput.value = '';
    if (regionFilter) regionFilter.value = '';
    if (typeFilter) typeFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    if (minTuitionFilter) minTuitionFilter.value = '';
    if (maxTuitionFilter) maxTuitionFilter.value = '';
    
    filteredSchools = [...currentSchools];
    currentPage = 1;
    renderData();
    updateStats();
    
    showNotification('Đã xóa tất cả bộ lọc', 'success');
}

function handleViewChange(btn) {
    const view = btn.dataset.view;
    currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Show/hide views
    if (view === 'table') {
        tableView.style.display = 'block';
        gridView.style.display = 'none';
    } else {
        tableView.style.display = 'none';
        gridView.style.display = 'block';
    }
    
    renderData();
}

function handleSort(header) {
    const column = header.dataset.sort;
    
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    // Update header classes
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    header.classList.add(`sort-${sortDirection}`);
    
    // Sort the filtered data
    filteredSchools.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        // Handle different data types
        if (['id', 'students', 'tuition', 'rating'].includes(column)) {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        } else {
            aVal = aVal.toString().toLowerCase();
            bVal = bVal.toString().toLowerCase();
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    renderData();
}

function getTotalPages() {
    if (rowsPerPage === filteredSchools.length) return 1;
    return Math.ceil(filteredSchools.length / rowsPerPage);
}

function renderData() {
    showLoading(true);
    
    setTimeout(() => {
        if (filteredSchools.length === 0) {
            showEmptyState();
            return;
        }
        
        if (currentView === 'table') {
            populateTable();
        } else {
            populateGrid();
        }
        updatePagination();
        showLoading(false);
    }, 300);
}

function populateTable() {
    if (!schoolsTableBody) return;
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = rowsPerPage === filteredSchools.length ? 
        filteredSchools.length : 
        Math.min(startIndex + rowsPerPage, filteredSchools.length);
    
    const pageSchools = filteredSchools.slice(startIndex, endIndex);
    
    schoolsTableBody.innerHTML = pageSchools.map(school => `
        <tr data-school-id="${school.id}">
            <td>
                <input type="checkbox" class="school-checkbox" value="${school.id}">
            </td>
            <td>${school.id}</td>
            <td>
                <img src="${school.logo}" alt="${school.name}" class="school-logo" 
                     onerror="this.src='assets/images/av.png'">
            </td>
            <td>
                <div class="school-info-cell">
                    <div class="school-name">${school.name}</div>
                    <div class="school-address">${school.address}</div>
                </div>
            </td>
            <td>
                <span class="region-badge ${school.region}">${getRegionText(school.region)}</span>
            </td>
            <td>
                <span class="type-badge ${school.type}">${getTypeText(school.type)}</span>
            </td>
            <td class="students-count">${formatNumber(school.students)}</td>
            <td class="tuition-amount">${formatNumber(school.tuition)}</td>
            <td>
                <div class="rating-display">
                    <div class="rating-stars">${renderStars(school.rating)}</div>
                    <span class="rating-score">${school.rating}</span>
                </div>
            </td>
            <td>
                <span class="status-badge ${school.status}">${getStatusText(school.status)}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewSchool(${school.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editSchool(${school.id})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn website" onclick="openWebsite('${school.website}')" title="Website">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteSchool(${school.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners for checkboxes
    const checkboxes = document.querySelectorAll('.school-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectAllState);
    });
}

function populateGrid() {
    if (!schoolsGrid) return;
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = rowsPerPage === filteredSchools.length ? 
        filteredSchools.length : 
        Math.min(startIndex + rowsPerPage, filteredSchools.length);
    
    const pageSchools = filteredSchools.slice(startIndex, endIndex);
    
    schoolsGrid.innerHTML = pageSchools.map(school => `
        <div class="school-card" data-school-id="${school.id}" onclick="viewSchool(${school.id})">
            <div class="card-header">
                <img src="${school.logo}" alt="${school.name}" class="card-logo" 
                     onerror="this.src='assets/images/av.png'">
                <div class="card-title-area">
                    <h4 class="card-title">${school.name}</h4>
                    <div class="card-region">${getRegionText(school.region)}</div>
                </div>
                <input type="checkbox" class="school-checkbox" value="${school.id}" onclick="event.stopPropagation()">
            </div>
            <div class="card-body">
                <div class="card-address">${school.address}</div>
                <div class="card-stats">
                    <div class="card-stat">
                        <div class="card-stat-number">${formatNumber(school.students)}</div>
                        <div class="card-stat-label">Học sinh</div>
                    </div>
                    <div class="card-stat">
                        <div class="card-stat-number">${formatNumber(school.tuition)}¥</div>
                        <div class="card-stat-label">Học phí</div>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <div class="card-badges">
                    <span class="type-badge ${school.type}">${getTypeText(school.type)}</span>
                    <span class="status-badge ${school.status}">${getStatusText(school.status)}</span>
                </div>
                <div class="card-actions">
                    <button class="action-btn edit" onclick="event.stopPropagation(); editSchool(${school.id})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn website" onclick="event.stopPropagation(); openWebsite('${school.website}')" title="Website">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for checkboxes
    const checkboxes = document.querySelectorAll('.school-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectAllState);
    });
}

function updatePagination() {
    const totalPages = getTotalPages();
    const startIndex = (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(currentPage * rowsPerPage, filteredSchools.length);
    
    // Update pagination info
    if (paginationInfo) {
        paginationInfo.textContent = `Hiển thị ${startIndex}-${endIndex} của ${filteredSchools.length} bản ghi`;
    }
    
    const paginationInfoBottom = document.getElementById('paginationInfoBottom');
    if (paginationInfoBottom) {
        paginationInfoBottom.textContent = `Hiển thị ${startIndex}-${endIndex} của ${filteredSchools.length} bản ghi`;
    }
    
    // Update pagination buttons state
    if (firstPageBtn) firstPageBtn.disabled = currentPage === 1;
    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
    if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages;
    
    // Render page numbers
    renderPaginationNumbers(totalPages);
}

function renderPaginationNumbers(totalPages) {
    if (!paginationNumbers) return;
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    let paginationHTML = '';
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">${i}</button>
        `;
    }
    
    paginationNumbers.innerHTML = paginationHTML;
}

function goToPage(page) {
    const totalPages = getTotalPages();
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderData();
}

function showLoading(show) {
    if (tableLoading) {
        tableLoading.style.display = show ? 'block' : 'none';
    }
    if (tableView) {
        tableView.style.display = show ? 'none' : (currentView === 'table' ? 'block' : 'none');
    }
    if (gridView) {
        gridView.style.display = show ? 'none' : (currentView === 'grid' ? 'block' : 'none');
    }
    if (tableEmpty) {
        tableEmpty.style.display = 'none';
    }
}

function showEmptyState() {
    if (tableLoading) tableLoading.style.display = 'none';
    if (tableEmpty) tableEmpty.style.display = 'block';
    if (tableView) tableView.style.display = 'none';
    if (gridView) gridView.style.display = 'none';
    if (paginationInfo) {
        paginationInfo.textContent = 'Hiển thị 0-0 của 0 bản ghi';
    }
}

function handleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const schoolCheckboxes = document.querySelectorAll('.school-checkbox');
    
    schoolCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateBulkActionButtons();
}

function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const schoolCheckboxes = document.querySelectorAll('.school-checkbox');
    const checkedBoxes = document.querySelectorAll('.school-checkbox:checked');
    
    if (checkedBoxes.length === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedBoxes.length === schoolCheckboxes.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
    }
    
    updateBulkActionButtons();
}

function updateBulkActionButtons() {
    const checkedBoxes = document.querySelectorAll('.school-checkbox:checked');
    const hasSelection = checkedBoxes.length > 0;
    
    if (bulkActionSelect) bulkActionSelect.disabled = !hasSelection;
    if (applyBulkActionBtn) applyBulkActionBtn.disabled = !hasSelection;
}

function updateStats() {
    const statItems = document.querySelectorAll('.stat-item');
    if (statItems.length >= 3) {
        const totalCount = currentSchools.length;
        const activeCount = currentSchools.filter(s => s.status === 'active').length;
        const partnerCount = currentSchools.filter(s => s.status === 'partner').length;
        
        statItems[0].querySelector('.stat-number').textContent = totalCount;
        statItems[1].querySelector('.stat-number').textContent = activeCount;
        statItems[2].querySelector('.stat-number').textContent = partnerCount;
    }
}

// Utility functions
function getRegionText(region) {
    const regionTexts = {
        'tokyo': 'Tokyo',
        'osaka': 'Osaka',
        'kyoto': 'Kyoto',
        'fukuoka': 'Fukuoka',
        'nagoya': 'Nagoya',
        'sendai': 'Sendai',
        'other': 'Khác'
    };
    return regionTexts[region] || region;
}

function getTypeText(type) {
    const typeTexts = {
        'public': 'Công lập',
        'private': 'Tư thục',
        'corporate': 'Doanh nghiệp'
    };
    return typeTexts[type] || type;
}

function getStatusText(status) {
    const statusTexts = {
        'active': 'Hoạt động',
        'inactive': 'Tạm dừng',
        'partner': 'Đối tác',
        'pending': 'Chờ duyệt'
    };
    return statusTexts[status] || status;
}

function formatNumber(num) {
    return new Intl.NumberFormat('ja-JP').format(num);
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star rating-star"></i>';
    }
    
    // Half star
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt rating-star"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star rating-star empty"></i>';
    }
    
    return starsHTML;
}

// Action handlers
function viewSchool(schoolId) {
    const school = filteredSchools.find(s => s.id === schoolId) || 
                  currentSchools.find(s => s.id === schoolId);
    
    if (school) {
        showSchoolModal(school);
    }
}

function showSchoolModal(school) {
    const modal = document.getElementById('schoolModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalLogo = document.getElementById('modalLogo');
    const modalName = document.getElementById('modalName');
    const modalAddress = document.getElementById('modalAddress');
    const modalType = document.getElementById('modalType');
    const modalStatus = document.getElementById('modalStatus');
    const modalRegion = document.getElementById('modalRegion');
    const modalStudents = document.getElementById('modalStudents');
    const modalTuition = document.getElementById('modalTuition');
    const modalRating = document.getElementById('modalRating');
    const modalWebsite = document.getElementById('modalWebsite');
    const modalEmail = document.getElementById('modalEmail');
    const modalPhone = document.getElementById('modalPhone');
    const modalDescription = document.getElementById('modalDescription');
    
    if (modalTitle) modalTitle.textContent = `${school.name} - Chi tiết`;
    if (modalLogo) {
        modalLogo.src = school.logo;
        modalLogo.alt = school.name;
    }
    if (modalName) modalName.textContent = school.name;
    if (modalAddress) modalAddress.textContent = school.address;
    if (modalType) {
        modalType.textContent = getTypeText(school.type);
        modalType.className = `type-badge ${school.type}`;
    }
    if (modalStatus) {
        modalStatus.textContent = getStatusText(school.status);
        modalStatus.className = `status-badge ${school.status}`;
    }
    if (modalRegion) modalRegion.textContent = getRegionText(school.region);
    if (modalStudents) modalStudents.textContent = formatNumber(school.students) + ' sinh viên';
    if (modalTuition) modalTuition.textContent = formatNumber(school.tuition) + ' ¥/năm';
    if (modalRating) {
        modalRating.innerHTML = `
            <div class="rating-stars">${renderStars(school.rating)}</div>
            <span class="rating-score">${school.rating}/5</span>
        `;
    }
    if (modalWebsite) {
        modalWebsite.href = school.website;
        modalWebsite.textContent = school.website;
    }
    if (modalEmail) modalEmail.textContent = school.email;
    if (modalPhone) modalPhone.textContent = school.phone;
    if (modalDescription) modalDescription.textContent = school.description;
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Store current school ID for actions
    modal.dataset.schoolId = school.id;
}

function closeSchoolModal() {
    const modal = document.getElementById('schoolModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function editSchoolFromModal() {
    const modal = document.getElementById('schoolModal');
    const schoolId = parseInt(modal.dataset.schoolId);
    if (schoolId) {
        editSchool(schoolId);
        closeSchoolModal();
    }
}

function viewWebsiteFromModal() {
    const modal = document.getElementById('schoolModal');
    const schoolId = parseInt(modal.dataset.schoolId);
    const school = currentSchools.find(s => s.id === schoolId);
    if (school && school.website) {
        window.open(school.website, '_blank');
    }
}

function editSchool(schoolId) {
    const school = currentSchools.find(s => s.id === schoolId);
    if (school) {
        showNotification(`Chỉnh sửa trường: ${school.name}`, 'info');
        // In real app: open edit modal or navigate to edit page
    }
}

function openWebsite(url) {
    if (url && url !== '#') {
        window.open(url, '_blank');
    } else {
        showNotification('Website không khả dụng', 'warning');
    }
}

function deleteSchool(schoolId) {
    const school = currentSchools.find(s => s.id === schoolId);
    if (school && confirm(`Bạn có chắc muốn xóa trường "${school.name}"?`)) {
        currentSchools = currentSchools.filter(s => s.id !== schoolId);
        applyFilters();
        updateStats();
        showNotification(`Đã xóa trường: ${school.name}`, 'success');
    }
}

function handleBulkAction() {
    const selectedIds = Array.from(document.querySelectorAll('.school-checkbox:checked'))
                            .map(cb => parseInt(cb.value));
    const action = bulkActionSelect.value;
    
    if (!action || selectedIds.length === 0) return;
    
    if (confirm(`Áp dụng hành động "${bulkActionSelect.options[bulkActionSelect.selectedIndex].text}" cho ${selectedIds.length} trường?`)) {
        selectedIds.forEach(id => {
            const school = currentSchools.find(s => s.id === id);
            if (school) {
                switch (action) {
                    case 'activate':
                        school.status = 'active';
                        break;
                    case 'deactivate':
                        school.status = 'inactive';
                        break;
                    case 'mark-partner':
                        school.status = 'partner';
                        break;
                    case 'delete':
                        currentSchools = currentSchools.filter(s => s.id !== id);
                        break;
                }
            }
        });
        
        // Reset filters and UI
        bulkActionSelect.value = '';
        document.getElementById('selectAll').checked = false;
        applyFilters();
        updateStats();
        updateBulkActionButtons();
        
        showNotification(`Đã áp dụng hành động cho ${selectedIds.length} trường`, 'success');
    }
}

function handleAddSchool() {
    showNotification('Chức năng thêm trường mới đang được phát triển', 'info');
    // In real app: open add school modal or navigate to add page
}

function handleExport() {
    showNotification('Đang xuất dữ liệu Excel...', 'info');
    // In real app: export schools data to Excel file
    setTimeout(() => {
        showNotification('Xuất Excel thành công!', 'success');
    }, 2000);
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}