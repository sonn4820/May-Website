# Thông tin cần bổ sung

File này tự sinh từ `prototype/src/33-placeholders.js` mỗi lần chạy `npm run proto:build`. Đừng sửa tay.
Khi có thông tin thật, thay token tương ứng. Bản production sẽ bị chặn nếu còn `INPUT_INFO_ABOUT_`.

| Token | Cần gì | Dùng ở đâu |
|---|---|---|
| `INPUT_INFO_ABOUT_DOCTOR_NAME_WITH_VIETNAMESE_DIACRITICS_HERE` | Tên bác sĩ viết đủ dấu tiếng Việt, nếu muốn (hiện dùng “Van H Nguyen” như bản tiếng Anh) | Bản tiếng Việt |
| `INPUT_INFO_ABOUT_PATIENT_REVIEW_1_HERE` | Đánh giá thật của bệnh nhân kèm tên hiển thị, có sự đồng ý của họ | Mục Đánh giá |
| `INPUT_INFO_ABOUT_PATIENT_REVIEW_2_HERE` | Đánh giá thật thứ 2 | Mục Đánh giá |
| `INPUT_INFO_ABOUT_PATIENT_REVIEW_3_HERE` | Đánh giá thật thứ 3 | Mục Đánh giá |
| `INPUT_INFO_ABOUT_BEFORE_AFTER_CASE_1_HERE` | Cặp ảnh trước/sau điều trị (răng giả), có đồng ý bằng văn bản của bệnh nhân | Mục Nụ cười bệnh nhân (đang tạm ẩn) |
| `INPUT_INFO_ABOUT_BEFORE_AFTER_CASE_2_HERE` | Cặp ảnh trước/sau (mão răng) | Mục Nụ cười bệnh nhân (đang tạm ẩn) |
| `INPUT_INFO_ABOUT_BEFORE_AFTER_CASE_3_HERE` | Cặp ảnh trước/sau (implant) | Mục Nụ cười bệnh nhân (đang tạm ẩn) |
| `INPUT_INFO_ABOUT_GOOGLE_REVIEWS_LINK_HERE` | Link trang đánh giá Google của phòng khám | Nút “Read more reviews”, “Leave a review” |
| `INPUT_INFO_ABOUT_OPENDENTAL_API_KEYS_HERE` | Developer Key (đăng ký với OpenDental) và Customer Key (phòng khám dán vào Setup > Advanced Setup > API trong OpenDental). Xem server/README.md | Cấu hình server (đặt lịch online) |
| `INPUT_INFO_ABOUT_OPENDENTAL_PROV_AND_OP_HERE` | Số ProvNum của bác sĩ và OpNum của ghế (operatory) nhận lịch hẹn đặt online, xem trong OpenDental | Cấu hình server (đặt lịch online) |
| `INPUT_INFO_ABOUT_AFTER_HOURS_EMERGENCY_HERE` | Khi phòng khám đóng cửa, bệnh nhân cấp cứu gọi đâu (lời nhắn tổng đài, số trực, hay hướng dẫn đến phòng cấp cứu) | Trang Cấp cứu nha khoa |
| `INPUT_INFO_ABOUT_PRIVACY_CONTACT_HERE` | Tên và chức danh người phụ trách quyền riêng tư (HIPAA) và dân quyền (Section 1557) của phòng khám | Trang Notice of Privacy Practices, Nondiscrimination |
| `INPUT_INFO_ABOUT_LEGAL_EFFECTIVE_DATE_HERE` | Ngày bắt đầu áp dụng các trang chính sách (sau khi luật sư duyệt) | Các trang Privacy & legal |
| `INPUT_INFO_ABOUT_SOCIAL_MEDIA_LINKS_HERE` | Link Facebook, Instagram (nếu có) | Footer |
| `INPUT_INFO_ABOUT_STAFF_GOOGLE_EMAIL_HERE` | Danh sách email Google Workspace của nhân viên được vào Staff Portal | Staff Portal |
| `INPUT_INFO_ABOUT_GOOGLE_SHEET_LINK_HERE` | Google Sheet “Clinic Operations” (mình sẽ tạo mẫu sẵn các tab) | Staff Portal, cấu hình server |
| `INPUT_INFO_ABOUT_GOOGLE_DRIVE_FOLDER_HERE` | Thư mục Google Drive chứa Google Docs tóm tắt bệnh nhân | Staff Portal, cấu hình server |
| `INPUT_INFO_ABOUT_DOMAIN_NAME_HERE` | Tên miền của website | Cấu hình server, SEO |
