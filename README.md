# Website nha khoa — Excelcare Dental (Dr. Van H Nguyen, DMD)

Website cho người lớn tuổi, có 3 ngôn ngữ (English mặc định, Tiếng Việt, Español), chạy tại **https://excelcaredental.com** (GitHub Pages). Kèm **API đặt lịch vào OpenDental** (`server/`, xem [server/README.md](server/README.md)), chưa được host.

## Deploy

Mỗi lần push lên `main`, GitHub Actions ([.github/workflows/pages.yml](.github/workflows/pages.yml)) build, chạy `proto:test`, rồi đăng `prototype/index.html` lên GitHub Pages. Tên miền `excelcaredental.com` trỏ về GitHub Pages (DNS ở DigitalSpace; giữ nguyên các bản ghi email Google).

GitHub Pages chỉ phục vụ file tĩnh, nên API đặt lịch không chạy ở đó. Khi trang Đặt lịch không gọi được API, website hiện số điện thoại thay cho tờ lịch, không bao giờ hiện giờ trống giả.

## Xem trên máy

- Mở thẳng `prototype/index.html` bằng Chrome/Edge (trang Đặt lịch sẽ hiện số điện thoại vì không có API), hoặc
- `npm run proto:serve` rồi mở http://localhost:4321 (có API đặt lịch chạy với OpenDental giả lập)

Link mở thẳng: `#vi`, `#es`, `#schedule`, `#new-patients`.

Mọi trang của website đều có địa chỉ riêng, nút Back/Forward của trình duyệt hoạt động:

| Nhóm | Địa chỉ |
|---|---|
| Dịch vụ (6) | `#services/checkups`, `#services/fillings-crowns`, `#services/dentures`, `#services/implants`, `#services/gum-care`, `#services/emergency` |
| Bác sĩ | `#about` |
| Kiến thức nha khoa (3) | `#tips/denture-care`, `#tips/dry-mouth`, `#tips/implants-guide` |
| Chính sách (4) | `#privacy`, `#privacy-practices`, `#accessibility`, `#nondiscrimination` |

Nội dung các trang này nằm trong `prototype/src/35-docs-en.js`, `36-docs-vi.js`, `37-docs-es.js` (danh sách trang ở `34-docs-meta.js`). Nút gọi điện và Google Maps dùng thông tin đã xác nhận. Google Reviews và mạng xã hội được tạm ẩn, theo dõi trong [PLACEHOLDERS.md](PLACEHOLDERS.md).

## Đổi giờ, ngày nghỉ, thông báo

Sửa trong `prototype/src/40-app-core.js` rồi push:

- `CLINIC_HOURS`: giờ mở cửa hằng tuần.
- `CLINIC_DATES`: ngày nghỉ lễ hoặc giờ đặc biệt (có ví dụ ngay trong file). Chỉ thêm ngày phòng khám đã xác nhận.
- `CLINIC_NOTICE`: dải thông báo đầu trang, hoặc `null` để ẩn.

Thông tin phòng khám (tên, điện thoại, địa chỉ, email, link Google Maps) nằm ở `prototype/src/33-clinic.js`.

## Sửa và kiểm tra

- Mã nguồn nằm ở `prototype/src/` (CSS, HTML, 3 file dịch, JS). `npm run proto:build` ghép tất cả thành `prototype/index.html` và sinh lại `PLACEHOLDERS.md` từ `prototype/placeholders.js` (danh sách này không nằm trong website). Lệnh build báo lỗi nếu trang còn chữ "prototype", "demo", "Staff Portal" hay token `INPUT_INFO_ABOUT_`.
- `npm install` một lần, sau đó `npm run proto:test` chạy các bài kiểm tra chức năng bằng jsdom (đổi ngôn ngữ, đặt hẹn qua API, trang Đặt lịch khi không có API, 14 trang nội dung, nút Back, FAQ, menu hỗ trợ dễ đọc…).
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

Nếu máy tính tắt “Animation effects” (Windows) hoặc bật “Reduce motion” (macOS/iOS), website chỉ giữ hiệu ứng mờ dần và bỏ phần di chuyển, để người dễ chóng mặt xem thoải mái.

## Quyết định chính

1. **Website tĩnh trên GitHub Pages**: một file `index.html` tự chứa (CSS, JS, ảnh nhúng sẵn). API đặt lịch tách riêng trong `server/`, cần host ở chỗ khác (ví dụ một server Node) rồi cho trang gọi tới.
2. **Lịch hẹn chỉ nằm trong OpenDental**: trang Đặt lịch gọi API riêng (`server/booking`), API gọi OpenDental API để lấy giờ trống, tìm/tạo bệnh nhân và tạo lịch hẹn. Không dùng Google Calendar. Không có API thì trang hiện số điện thoại.
3. **Giờ, ngày nghỉ, thông báo nằm trong code** (`40-app-core.js`). Staff Portal (nhân viên tự sửa, đăng nhập bằng Google) để sau.
4. **3 ngôn ngữ**: English mặc định, nút đổi sang Tiếng Việt / Español; lựa chọn được nhớ trên máy. Câu nào thiếu bản dịch thì hiện tiếng Anh.
5. **Thông tin còn thiếu** được ẩn khỏi website và theo dõi trong [PLACEHOLDERS.md](PLACEHOLDERS.md).
6. **Email/SMS nhắc lịch** để sau, cắm vào qua adapter.

## Thiết kế

Theo skill UI/UX Pro Max (các nhóm Dental Practice, Senior Care, Medical Clinic):

- Màu xanh dương dịu, trắng, vàng “nụ cười”.
- Chữ nội dung 20px, tương phản theo chuẩn WCAG AAA.
- Nút Schedule màu cam đậm: nút vàng trên nền trắng khó thấy với mắt người lớn tuổi.
- Ưu đãi **Online New Patient Special** ($89 khám tổng quát + chụp X-quang toàn hàm, cho bệnh nhân không có bảo hiểm) nằm ngay dưới dải giờ/địa chỉ/điện thoại ở trang chủ và đầu trang New Patients, nút dẫn tới trang Đặt lịch.
- Có mục bảo hiểm & thanh toán. Mục đánh giá và ảnh trước/sau đang tạm ẩn cho đến khi có nội dung thật.
- Trang Đặt lịch là tờ lịch tháng: bệnh nhân chọn ngày còn giờ trống, chọn giờ, rồi điền họ, tên, ngày sinh, số điện thoại. Mỗi lượt khám mặc định 60 phút, cho đặt trước 8 tuần.
- Mục thanh toán dùng logo chính thức: Visa, Mastercard, American Express (Wikimedia Commons), Cherry, CareCredit (lấy từ website của hãng). File nằm ở `prototype/src/assets/`.
- Ảnh lớn đầu trang chủ là ảnh stock miễn phí của Kaboompics (Karolina Grabowska) trên Pexels (giấy phép Pexels, dùng thương mại được, không bắt buộc ghi nguồn): https://www.pexels.com/photo/6627527/
- Animation nhẹ, tự tắt khi người dùng bật “giảm chuyển động”.
- Nút tròn **hỗ trợ dễ đọc** ở góc dưới bên trái (giống nút UserWay trên 4lakesdental.com nhưng tự làm, không tải script bên ngoài): tăng tương phản / nền tối, làm nổi liên kết, chữ to hơn (đồng bộ với A / A+ / A++), giãn chữ, giãn dòng, dừng chuyển động, ẩn hình ảnh, phông chữ dễ đọc, con trỏ chuột lớn, giảm màu / trắng đen. Lựa chọn được lưu trên máy. Mã nguồn: `15-a11y.css`, `42-app-a11y.js`.

Lưu ý: Google Workspace phải là bản trả phí và ký BAA với Google trước khi nhận dữ liệu bệnh nhân thật (HIPAA).
