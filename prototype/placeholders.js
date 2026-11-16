// Every piece of real clinic information still missing. Not part of the website: build.mjs reads it
// to write PLACEHOLDERS.md and to check that every data-ph / {ph:...} in the pages is listed here.
const PLACEHOLDERS = {
  DOCTOR_NAME_WITH_VIETNAMESE_DIACRITICS: { label: "Name in Vietnamese", need: "Tên bác sĩ viết đủ dấu tiếng Việt, nếu muốn (hiện dùng “Van H Nguyen” như bản tiếng Anh)", where: "Bản tiếng Việt", configOnly: true },
  PATIENT_REVIEW_1:            { label: "Patient review 1", need: "Đánh giá thật của bệnh nhân kèm tên hiển thị, có sự đồng ý của họ", where: "Mục Đánh giá" },
  PATIENT_REVIEW_2:            { label: "Patient review 2", need: "Đánh giá thật thứ 2", where: "Mục Đánh giá" },
  PATIENT_REVIEW_3:            { label: "Patient review 3", need: "Đánh giá thật thứ 3", where: "Mục Đánh giá" },
  BEFORE_AFTER_CASE_1:         { label: "Before/after photos 1", need: "Cặp ảnh trước/sau điều trị (răng giả), có đồng ý bằng văn bản của bệnh nhân", where: "Mục Nụ cười bệnh nhân (đang tạm ẩn)" },
  BEFORE_AFTER_CASE_2:         { label: "Before/after photos 2", need: "Cặp ảnh trước/sau (mão răng)", where: "Mục Nụ cười bệnh nhân (đang tạm ẩn)" },
  BEFORE_AFTER_CASE_3:         { label: "Before/after photos 3", need: "Cặp ảnh trước/sau (implant)", where: "Mục Nụ cười bệnh nhân (đang tạm ẩn)" },
  GOOGLE_REVIEWS_LINK:        { label: "Reviews link", need: "Link trang đánh giá Google của phòng khám", where: "Nút “Read more reviews”, “Leave a review”" },
  OPENDENTAL_API_KEYS:         { label: "OpenDental API keys", need: "Developer Key (đăng ký với OpenDental) và Customer Key (phòng khám dán vào Setup > Advanced Setup > API trong OpenDental). Xem server/README.md", where: "Cấu hình server (đặt lịch online)", configOnly: true },
  OPENDENTAL_PROV_AND_OP:      { label: "ProvNum / OpNum", need: "Số ProvNum của bác sĩ và OpNum của ghế (operatory) nhận lịch hẹn đặt online, xem trong OpenDental", where: "Cấu hình server (đặt lịch online)", configOnly: true },
  AFTER_HOURS_EMERGENCY:       { label: "After-hours help", need: "Khi phòng khám đóng cửa, bệnh nhân cấp cứu gọi đâu (lời nhắn tổng đài, số trực, hay hướng dẫn đến phòng cấp cứu)", where: "Trang Cấp cứu nha khoa" },
  PRIVACY_CONTACT:             { label: "Privacy officer", need: "Tên và chức danh người phụ trách quyền riêng tư (HIPAA) và dân quyền (Section 1557) của phòng khám", where: "Trang Notice of Privacy Practices, Nondiscrimination" },
  LEGAL_EFFECTIVE_DATE:        { label: "Effective date", need: "Ngày bắt đầu áp dụng các trang chính sách (sau khi luật sư duyệt)", where: "Các trang Privacy & legal" },
  SOCIAL_MEDIA_LINKS:          { label: "Social links", need: "Link Facebook, Instagram (nếu có)", where: "Footer" }
};
