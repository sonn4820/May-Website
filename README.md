# Website nha khoa — Dr. Van Hong Nguyen

Website cho người lớn tuổi, có 3 ngôn ngữ (English mặc định, Tiếng Việt, Español). Hiện mới có **prototype giao diện**; hệ thống nội bộ (website thật, API, Staff Portal) là bước tiếp theo.

## Xem prototype

- Mở thẳng `prototype/index.html` bằng Chrome/Edge, hoặc
- `npm run proto:serve` rồi mở http://localhost:4321

Link mở thẳng một màn hình: `#vi`, `#es`, `#phone`, `#schedule`, `#new-patients`, `#staff`, `#staff-app`, `#staff-submissions`, `#how-it-works`, `#placeholders`.

Dữ liệu trong prototype chỉ nằm trong trang, không gửi đi đâu. Đừng nhập thông tin bệnh nhân thật.

## Sửa và kiểm tra

- Mã nguồn nằm ở `prototype/src/` (CSS, HTML, 3 file dịch, JS). `npm run proto:build` ghép tất cả thành `prototype/index.html` và sinh lại `PLACEHOLDERS.md`.
- `npm install` một lần, sau đó `npm run proto:test` chạy 67 bài kiểm tra chức năng bằng jsdom (đổi ngôn ngữ, Staff Portal, form, Google Sheet giả lập, FAQ…).
- `npm run proto:motion` mở Chrome/Edge chạy ngầm và đo xem animation có chạy dần đều thật không. Script đo các thao tác: cuộn khi bấm menu, hiện dần khi cuộn tới, dropdown, chuyển trang, FAQ.

## Animation

Lấy cảm hứng từ dentex-vik-studio.webflow.io. Toàn bộ nằm trong `prototype/src/14-motion.css`:

- Nội dung mờ dần hiện ra và trượt vào khi cuộn tới (1 giây).
- Nút được tô màu loang dần khi rê chuột.
- Mũi tên trong link kéo dài ra khi rê chuột.
- Bấm menu thì trang cuộn mượt xuống đúng mục.
- Chuyển trang thì trang cũ mờ đi, trang mới hiện lên.
- FAQ và các ô điền thêm mở ra, thu lại theo chiều cao.

Nếu máy tính tắt “Animation effects” (Windows) hoặc bật “Reduce motion” (macOS/iOS), website thật chỉ giữ hiệu ứng mờ dần và bỏ phần di chuyển, để người dễ chóng mặt xem thoải mái. Trong prototype, nút **Animation: Đầy đủ / Theo cài đặt máy** cho phép xem cả hai chế độ.

## Quyết định chính

1. **Một dự án, một lần deploy**: Astro + TypeScript cho website, API nội bộ và Staff Portal, chạy trong 1 Docker container. API vẫn tách riêng trong code để sau này chuyển sang server khác được.
2. **Google Workspace là nơi lưu dữ liệu**: Google Sheet “Clinic Operations” (Hours, Special dates, Website notice, Appointment requests, New patients). Excel tải thẳng từ Sheet; Google Docs dùng cho bản tóm tắt bệnh nhân mới.
3. **Staff Portal** đăng nhập bằng tài khoản Google của phòng khám. Nhân viên đổi giờ, ngày nghỉ, thông báo mà không cần động vào code.
4. **3 ngôn ngữ**: EN ở `/`, VI ở `/vi/`, ES ở `/es/`. Câu nào thiếu bản dịch thì hiện tiếng Anh.
5. **Placeholder** dạng `INPUT_INFO_ABOUT_<...>_HERE`, theo dõi trong [PLACEHOLDERS.md](PLACEHOLDERS.md).
6. **Dịch vụ bên ngoài** (đặt lịch online, email/SMS) để sau, cắm vào qua adapter.

## Thiết kế

Theo skill UI/UX Pro Max (các nhóm Dental Practice, Senior Care, Medical Clinic):

- Màu xanh dương dịu, trắng, vàng “nụ cười”.
- Chữ nội dung 20px, tương phản theo chuẩn WCAG AAA.
- Nút Schedule màu cam đậm: nút vàng trên nền trắng khó thấy với mắt người lớn tuổi.
- Có mục ảnh trước/sau, đánh giá, bảo hiểm.
- Animation nhẹ, tự tắt khi người dùng bật “giảm chuyển động”.

Lưu ý: Google Workspace phải là bản trả phí và ký BAA với Google trước khi nhận dữ liệu bệnh nhân thật (HIPAA).
