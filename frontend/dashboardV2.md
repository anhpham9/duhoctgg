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

---

Đã thực hiện xong cả 2 việc bạn yêu cầu.

1) Thêm migration/seed cho cấu hình quyền mặc định

Seed thêm key quyền mặc định permissions.modules.v1 trong settings: seedSettings.js:116
Seed dùng group security: seedSettings.js:136
Schema gốc cho môi trường mới đã cho phép group security: init_schema.sql:325
Tạo migration riêng để nâng cấp DB hiện tại: 2026-06-30-allow-security-settings-group.sql
2) Thêm backend guard dùng chung theo cấu hình quyền động

Tạo guard checkModuleAccess đọc cấu hình từ settings key permissions.modules.v1, có fallback mặc định an toàn, Superadmin luôn được phép:
permission.middleware.js:5
permission.middleware.js:57
Gắn guard vào các API quan trọng ở app-level:
Users: app.js:168
Settings: app.js:198
Permissions config: app.js:211
Giữ /api/about không chặn toàn cục để không ảnh hưởng public endpoint: app.js:214
Gắn guard chi tiết cho các route admin trong about:
Team members: aboutContent.js:59
Other content (stats/reasons/missions): aboutContent.js:71
About content admin: aboutContent.js:95
Gắn guard cho homepage sections admin:
homepageSections.routes.js:15
Xác thực

Đã pass syntax check các file backend thay đổi.
Đã pass kiểm tra lỗi tĩnh (không có error).
Chưa xác nhận runtime npm run dev lần cuối vì lệnh chạy server từ backend đã bị skip trong phiên này.
Lệnh nên chạy ngay để áp DB (nếu bạn muốn mình cũng có thể chạy giúp)

Áp migration:
psql -d <your_db> -f 2026-06-30-allow-security-settings-group.sql
Seed settings (bao gồm quyền mặc định):
node seedSettings.js

---

Kết quả vừa chạy:

Seed settings thành công.
Smoke test permissions chạy full pass:
Admin GET config: 200
Manager GET config: 403 đúng kỳ vọng
Admin PUT config: 200
Sau khi tạm gỡ quyền Editor ở news, Editor GET news: 403 đúng kỳ vọng
Restore config: 200
Verify restore role Editor trong news: YES
Dọn toàn bộ user tạm: done
Các thay đổi bổ sung để xử lý lỗi 500:

Sửa lưu cấu hình permissions dùng group tương thích DB cũ (mặc định general):
permissions.controller.js:6
Đồng bộ seed key permissions.modules.v1 sang group general:
seedSettings.js:136
Thêm script smoke test E2E và npm script chạy test:
test-permissions-api.js:1
package.json:8
Nguyên nhân gốc đã xác định:

DB hiện tại vẫn có check constraint cũ settings_type_check, nên group security bị reject và làm PUT /permissions/config trả 500.
Sau khi chuyển sang group general, luồng chạy ổn định trên môi trường hiện tại.

---

Kết quả đã làm

Tạo migration runner tự động cho backend
Script runner mới: runMigrations.js:1
Có tracking bảng schema_migrations: runMigrations.js:15
Lọc migration theo tên timestamp .sql: runMigrations.js:11
Sửa path Windows ổn định bằng fileURLToPath: runMigrations.js:9
Thêm npm script migrate: package.json:10
Bổ sung test ma trận quyền cho logic middleware frontend
Script test mới: test-permission-middleware.js:1
Hàm quyết định quyền theo path (cùng logic middleware/composable): test-permission-middleware.js:61
Có test precedence cho /admin/settings/permissions: test-permission-middleware.js:122
Thêm npm script test:permission-middleware: package.json:11
Cập nhật migration để tương thích DB cũ có constraint legacy
Drop cả settings_group_name_check và settings_type_check trước khi add lại:
2026-06-30-allow-security-settings-group.sql:2
Chốt tương thích lưu cấu hình quyền
Cho phép cấu hình group từ env, default general để không vướng DB cũ:
permissions.controller.js:7
Seed permissions.modules.v1 dùng general:
seedSettings.js:116
seedSettings.js:136
Kết quả chạy thực tế

npm run migrate: thành công
Đã apply migration: 2026-06-30-allow-security-settings-group.sql
npm run test:permission-middleware: thành công
Loaded 13 modules
Assertions passed: 140
npm run test:permissions: thành công
GET/PUT permissions config hoạt động đúng
Guard động /api/news phản ánh thay đổi quyền ngay
Restore config và cleanup user tạm đều done

---

1) Thêm một lệnh tổng hợp duy nhất ở root

Đã tạo root script:
package.json:5
Bạn chỉ cần chạy tại root:
npm run verify:permissions-all

Chuỗi thực thi đúng thứ tự:

migrate
seed
test:permissions
test:permission-middleware
Mình cũng bổ sung script seed riêng trong backend để tránh lỗi môi trường khi gọi từ root:
package.json:11

2) Tổng hợp cấu trúc SQL vào init_schema.sql
Mình đã đồng bộ phần schema mới vào file gốc:

Thêm bảng theo dõi migration:
init_schema.sql:18
Chuẩn hóa lại constraint settings để tương thích cả constraint cũ:
init_schema.sql:336
Đổi seed notification_rules sang idempotent:
init_schema.sql:426
Kết quả chạy thực tế

Lệnh root tổng hợp đã chạy pass toàn bộ pipeline.
migrate: No pending migrations
seed: Seeded settings successfully
backend permissions smoke test: pass
frontend permission middleware matrix test: pass (Assertions passed: 140)