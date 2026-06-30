Những gì đã hoàn thành

Nâng cấp API dashboard lên chuẩn V2:
dashboard.controller.js
Đã bổ sung:

role: id, name
permissions: contacts, schools, news, system
visibleWidgets theo role
kpis có trend (delta, deltaPercent, direction)
alerts
sla
lists.todoToday
vẫn giữ các khối cũ để tương thích: overview, charts, lists, breakdowns
Mở route dashboard:
dashboard.routes.js
Gắn route vào app:
app.js
Nâng UI Dashboard để hiển thị dữ liệu V2:
index.vue
Đã bổ sung hiển thị:

Vai trò hiện tại
KPI đọc từ kpis + trend text
Cảnh báo hệ thống
Việc cần làm hôm nay
Giữ lại phần biểu đồ, liên hệ gần đây, top trường, thống kê tổng quan
Thêm CSS cho các block V2:
dashboard.css
Đã thêm style cho:

role line
alerts/todo cards
severity badge
priority badge
responsive cho khối V2
Các logic mới quan trọng đã có trong backend

Cảnh báo SLA liên hệ quá 24h/48h
Cảnh báo backup gần nhất thất bại (nếu có dữ liệu backup_records)
Cảnh báo tài khoản bị khóa
Todo tự sinh theo vai trò:
liên hệ cần xử lý
tin nháp cần rà soát
trường pending cần duyệt
KPI biến động theo kỳ trước
Kiểm tra chất lượng

Đã chạy kiểm tra lỗi cho:
dashboard.controller.js
index.vue
dashboard.css
Kết quả: không có lỗi.
Lưu ý

Workspace hiện có sẵn thay đổi ngoài phạm vi dashboard ở follow.md và tuts_git.md, mình không chỉnh các thay đổi đó.




---


Những gì đã triển khai

Scope filter ở backend (my/team/all)
Cập nhật dashboard.controller.js
Đã thêm:

Nhận query scope cùng period ở endpoint /api/dashboard/overview
Chuẩn hóa scope theo role (không cho chọn scope không hợp lệ)
Tính scopeUserIds theo role:
my: chỉ user hiện tại
team: theo nhóm role map
all: không giới hạn
Áp filter scope vào:
contacts overview/trend/recent/overdue
news overview/recent
so sánh kỳ trước (previous contacts/news)
Trả thêm metadata cho frontend:
viewer.id
scope.selected
scope.options
Scope selector ở frontend
Cập nhật index.vue
Đã thêm:

Dropdown chọn phạm vi dữ liệu ngay dưới thông tin role
Gọi API kèm scope:
/dashboard/overview?period=...&scope=...
Đồng bộ lại scope theo response backend (trường hợp backend normalize)
Drag-drop widget layout theo user
Cập nhật index.vue
Cập nhật style dashboard.css
Đã thêm:

Kéo thả sắp xếp trong từng group widget:
stats
v2 (alerts/todo)
main (chart/recent/quick/topSchools/websiteStats)
Lưu layout theo user vào localStorage:
key dạng dashboard-v2-layout-<viewerId>
Tự restore layout khi vào dashboard
Validate layout trước khi áp dụng (fallback về default nếu dữ liệu cũ lỗi)
Kết quả kiểm tra

Không có lỗi ở:
dashboard.controller.js
index.vue
dashboard.css
Cách test nhanh

Vào dashboard với role Admin/Manager/Consultant để thấy scope options khác nhau.
Đổi scope giữa my, team, all và kiểm tra số liệu thay đổi.
Kéo thả vài card trong từng vùng, F5 lại trang để xác nhận layout được lưu theo user.
Đăng nhập user khác để thấy layout riêng của user đó.