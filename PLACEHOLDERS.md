# Thông tin cần bổ sung

File này tự sinh từ `prototype/src/33-placeholders.js` mỗi lần chạy `npm run proto:build`. Đừng sửa tay.
Khi có thông tin thật, thay token tương ứng. Bản production sẽ bị chặn nếu còn `INPUT_INFO_ABOUT_`.

| Token | Cần gì | Dùng ở đâu |
|---|---|---|
| `INPUT_INFO_ABOUT_CLINIC_NAME_HERE` | Tên chính thức của phòng khám | Header, footer, tiêu đề trang |
| `INPUT_INFO_ABOUT_LOGO_HERE` | Logo (SVG hoặc PNG nền trong suốt) | Header, footer, biểu tượng tab trình duyệt |
| `INPUT_INFO_ABOUT_CLINIC_PHONE_HERE` | Số điện thoại phòng khám | Header, các nút Call, trang Đặt lịch, footer |
| `INPUT_INFO_ABOUT_CLINIC_ADDRESS_HERE` | Địa chỉ đầy đủ (số nhà, đường, suite, thành phố, bang, ZIP) | Thanh trên cùng, mục Địa chỉ, bản đồ, footer |
| `INPUT_INFO_ABOUT_CLINIC_EMAIL_HERE` | Email liên hệ công khai | Footer |
| `INPUT_INFO_ABOUT_CLINIC_TIMEZONE_HERE` | Múi giờ của phòng khám, ví dụ America/Chicago. Dùng để tính “Đang mở cửa” | Chỉ trong file cấu hình |
| `INPUT_INFO_ABOUT_GOOGLE_MAPS_LINK_HERE` | Link Google Maps của phòng khám | Nút Chỉ đường, bản đồ |
| `INPUT_INFO_ABOUT_PARKING_AND_WHEELCHAIR_ACCESS_HERE` | Thông tin bãi đỗ xe, lối xe lăn, thang máy | Mục Giờ mở cửa & địa chỉ |
| `INPUT_INFO_ABOUT_HERO_PHOTO_HERE` | Ảnh lớn đầu trang (bác sĩ với bệnh nhân, hoặc phòng khám) | Đầu trang chủ |
| `INPUT_INFO_ABOUT_DOCTOR_PHOTO_HERE` | Ảnh chân dung bác sĩ | Mục Gặp bác sĩ |
| `INPUT_INFO_ABOUT_DOCTOR_DEGREE_HERE` | Học vị: DDS hay DMD | Mục Gặp bác sĩ |
| `INPUT_INFO_ABOUT_DOCTOR_BIO_HERE` | Tiểu sử ngắn 3–5 câu (cần bản EN, VI, ES) | Mục Gặp bác sĩ |
| `INPUT_INFO_ABOUT_DOCTOR_EDUCATION_HERE` | Trường đã học, năm tốt nghiệp | Mục Gặp bác sĩ |
| `INPUT_INFO_ABOUT_DOCTOR_YEARS_OF_EXPERIENCE_HERE` | Số năm kinh nghiệm | Mục Gặp bác sĩ |
| `INPUT_INFO_ABOUT_LANGUAGES_SPOKEN_HERE` | Các ngôn ngữ bác sĩ và nhân viên nói được | Mục Gặp bác sĩ |
| `INPUT_INFO_ABOUT_DOCTOR_NAME_WITH_VIETNAMESE_DIACRITICS_HERE` | Tên bác sĩ viết đủ dấu tiếng Việt (hiện tạm dùng “Van Hong Nguyen”) | Bản tiếng Việt |
| `INPUT_INFO_ABOUT_DOCTOR_SPANISH_TITLE_HERE` | Danh xưng trong tiếng Tây Ban Nha: “Dr.” hay “Dra.” (tiếng Tây Ban Nha phân biệt giới tính) | Bản tiếng Tây Ban Nha |
| `INPUT_INFO_ABOUT_PATIENT_REVIEW_1_HERE` | Đánh giá thật của bệnh nhân kèm tên hiển thị, có sự đồng ý của họ | Mục Đánh giá |
| `INPUT_INFO_ABOUT_PATIENT_REVIEW_2_HERE` | Đánh giá thật thứ 2 | Mục Đánh giá |
| `INPUT_INFO_ABOUT_PATIENT_REVIEW_3_HERE` | Đánh giá thật thứ 3 | Mục Đánh giá |
| `INPUT_INFO_ABOUT_BEFORE_AFTER_CASE_1_HERE` | Cặp ảnh trước/sau điều trị (răng giả), có đồng ý bằng văn bản của bệnh nhân | Mục Nụ cười bệnh nhân |
| `INPUT_INFO_ABOUT_BEFORE_AFTER_CASE_2_HERE` | Cặp ảnh trước/sau (mão răng) | Mục Nụ cười bệnh nhân |
| `INPUT_INFO_ABOUT_BEFORE_AFTER_CASE_3_HERE` | Cặp ảnh trước/sau (implant) | Mục Nụ cười bệnh nhân |
| `INPUT_INFO_ABOUT_PROFESSIONAL_MEMBERSHIPS_HERE` | Hiệp hội nghề nghiệp, ví dụ ADA hoặc hội nha khoa của bang | Mục Gặp bác sĩ |
| `INPUT_INFO_ABOUT_GOOGLE_REVIEWS_LINK_HERE` | Link trang đánh giá Google của phòng khám | Nút “Read more reviews”, “Leave a review” |
| `INPUT_INFO_ABOUT_ACCEPTED_INSURANCE_HERE` | Danh sách bảo hiểm phòng khám nhận (kể cả Medicare Advantage / Medicaid nếu có) | Mục Bảo hiểm & thanh toán |
| `INPUT_INFO_ABOUT_PAYMENT_OPTIONS_HERE` | Hình thức thanh toán, trả góp, gói thành viên | Mục Bảo hiểm & thanh toán |
| `INPUT_INFO_ABOUT_SOCIAL_MEDIA_LINKS_HERE` | Link Facebook, Instagram (nếu có) | Footer |
| `INPUT_INFO_ABOUT_STAFF_GOOGLE_EMAIL_HERE` | Danh sách email Google Workspace của nhân viên được vào Staff Portal | Staff Portal |
| `INPUT_INFO_ABOUT_GOOGLE_SHEET_LINK_HERE` | Google Sheet “Clinic Operations” (mình sẽ tạo mẫu sẵn các tab) | Staff Portal, cấu hình server |
| `INPUT_INFO_ABOUT_GOOGLE_DRIVE_FOLDER_HERE` | Thư mục Google Drive chứa Google Docs tóm tắt bệnh nhân | Staff Portal, cấu hình server |
| `INPUT_INFO_ABOUT_DOMAIN_NAME_HERE` | Tên miền của website | Cấu hình server, SEO |
