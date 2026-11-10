# Website nha khoa — Excelcare Dental (Dr. Van H Nguyen, DMD)

Website cho người lớn tuổi, có 3 ngôn ngữ (English mặc định, Tiếng Việt, Español). Hiện có **prototype giao diện** và **API đặt lịch vào OpenDental** (`server/`, xem [server/README.md](server/README.md)). Website thật và Staff Portal là bước tiếp theo.

## Xem prototype

- Mở thẳng `prototype/index.html` bằng Chrome/Edge, hoặc
- `npm run proto:serve` rồi mở http://localhost:4321

Nút **Thu gọn** ở góc trên bên trái ẩn thanh công cụ prototype (chỉ còn một dòng mỏng) để xem website gần giống bản thật; bấm **Mở rộng** để hiện lại. Trạng thái được nhớ khi tải lại trang.

Link mở thẳng một màn hình: `#vi`, `#es`, `#phone`, `#schedule`, `#new-patients`, `#staff`, `#staff-app`, `#staff-submissions`, `#how-it-works`, `#placeholders`.

Mọi trang của website đều có địa chỉ riêng, nút Back/Forward của trình duyệt hoạt động:

| Nhóm | Địa chỉ |
|---|---|
| Dịch vụ (6) | `#services/checkups`, `#services/fillings-crowns`, `#services/dentures`, `#services/implants`, `#services/gum-care`, `#services/emergency` |
| Bác sĩ | `#about` |
| Kiến thức nha khoa (3) | `#tips/denture-care`, `#tips/dry-mouth`, `#tips/implants-guide` |
| Chính sách (4) | `#privacy`, `#privacy-practices`, `#accessibility`, `#nondiscrimination` |

Nội dung các trang này nằm trong `prototype/src/35-docs-en.js`, `36-docs-vi.js`, `37-docs-es.js` (danh sách trang ở `34-docs-meta.js`). Các link ra ngoài (gọi điện, Google Maps, Google Reviews, mạng xã hội) vẫn chỉ hiện thông báo, sẽ gắn sau.

Dữ liệu trong prototype chỉ nằm trong trang (hoặc trong OpenDental giả lập khi chạy `proto:serve`), không gửi đi đâu. Đừng nhập thông tin bệnh nhân thật.

## Sửa và kiểm tra

- Mã nguồn nằm ở `prototype/src/` (CSS, HTML, 3 file dịch, JS). `npm run proto:build` ghép tất cả thành `prototype/index.html` và sinh lại `PLACEHOLDERS.md`.
- `npm install` một lần, sau đó `npm run proto:test` chạy 126 bài kiểm tra chức năng bằng jsdom (đổi ngôn ngữ, Staff Portal, form, tờ lịch đặt hẹn, 14 trang nội dung, nút Back, Google Sheet giả lập, FAQ…).
- `npm run api:test` chạy 16 bài kiểm tra cho API đặt lịch với OpenDental giả lập. Cần Node 24 trở lên (chạy thẳng TypeScript).
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
2. **Google Workspace là nơi lưu dữ liệu website**: Google Sheet “Clinic Operations” (Hours, Special dates, Website notice, New patients). Excel tải thẳng từ Sheet; Google Docs dùng cho bản tóm tắt bệnh nhân mới.
3. **Lịch hẹn chỉ nằm trong OpenDental**: trang Đặt lịch gọi API riêng (`server/booking`), API gọi OpenDental API để lấy giờ trống, tìm/tạo bệnh nhân và tạo lịch hẹn. Không dùng Google Calendar.
4. **Staff Portal** đăng nhập bằng tài khoản Google của phòng khám. Nhân viên đổi giờ, ngày nghỉ, thông báo mà không cần động vào code.
5. **3 ngôn ngữ**: EN ở `/`, VI ở `/vi/`, ES ở `/es/`. Câu nào thiếu bản dịch thì hiện tiếng Anh.
6. **Placeholder** dạng `INPUT_INFO_ABOUT_<...>_HERE`, theo dõi trong [PLACEHOLDERS.md](PLACEHOLDERS.md).
7. **Email/SMS nhắc lịch** để sau, cắm vào qua adapter.

## Thiết kế

Theo skill UI/UX Pro Max (các nhóm Dental Practice, Senior Care, Medical Clinic):

- Màu xanh dương dịu, trắng, vàng “nụ cười”.
- Chữ nội dung 20px, tương phản theo chuẩn WCAG AAA.
- Nút Schedule màu cam đậm: nút vàng trên nền trắng khó thấy với mắt người lớn tuổi.
- Ưu đãi **Online New Patient Special** ($89 khám tổng quát + chụp X-quang toàn hàm, cho bệnh nhân không có bảo hiểm) nằm ngay dưới dải giờ/địa chỉ/điện thoại ở trang chủ và đầu trang New Patients, nút dẫn tới trang Đặt lịch.
- Có mục đánh giá, bảo hiểm & thanh toán. Mục ảnh trước/sau đang tạm ẩn (bỏ thuộc tính `hidden` ở `#gallery` để hiện lại).
- Trang Đặt lịch là tờ lịch tháng: bệnh nhân chọn ngày còn giờ trống, chọn giờ, rồi điền họ, tên, ngày sinh, số điện thoại. Mỗi lượt khám mặc định 60 phút, cho đặt trước 8 tuần.
- Mục thanh toán dùng logo chính thức: Visa, Mastercard, American Express (Wikimedia Commons), Cherry, CareCredit (lấy từ website của hãng). File nằm ở `prototype/src/assets/`.
- Animation nhẹ, tự tắt khi người dùng bật “giảm chuyển động”.
- Nút tròn **hỗ trợ dễ đọc** ở góc dưới bên trái (giống nút UserWay trên 4lakesdental.com nhưng tự làm, không tải script bên ngoài): tăng tương phản / nền tối, làm nổi liên kết, chữ to hơn (đồng bộ với A / A+ / A++), giãn chữ, giãn dòng, dừng chuyển động, ẩn hình ảnh, phông chữ dễ đọc, con trỏ chuột lớn, giảm màu / trắng đen. Lựa chọn được lưu trên máy. Mã nguồn: `15-a11y.css`, `42-app-a11y.js`.

Lưu ý: Google Workspace phải là bản trả phí và ký BAA với Google trước khi nhận dữ liệu bệnh nhân thật (HIPAA).
