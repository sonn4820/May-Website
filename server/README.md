# API đặt lịch online (OpenDental)

Trang Đặt lịch giữ nguyên giao diện tờ lịch tháng của prototype. Phía sau là API riêng, gọi thẳng vào OpenDental:

```
Bệnh nhân ──► Trang Đặt lịch ──► /api/booking (server/booking) ──► OpenDental API ──► eConnector ở phòng khám ──► OpenDental
```

Lịch hẹn chỉ nằm trong OpenDental. Website không lưu bản sao, không dùng Google Calendar.

## Endpoint

| Endpoint | Việc | Gọi OpenDental |
|---|---|---|
| `GET /api/booking/availability` | Giờ trống từ ngày mai đến 8 tuần sau, theo từng ngày | `GET /appointments/Slots` (cache 60 giây) |
| `POST /api/booking` | Đặt 1 giờ | `GET /appointments/Slots` (kiểm tra lại), `GET /patients/Simple`, `POST /patients` nếu cần, `POST /appointments` |

`POST /api/booking` nhận JSON:

```json
{ "date": "2026-11-10", "time": "09:00", "firstName": "Ana", "lastName": "Tran", "birthdate": "1950-03-04",
  "phone": "555-123-4567", "email": "", "newPatient": true, "reason": "Checkup", "lang": "vi" }
```

Trả về `201` khi đặt được, `400` kèm lỗi từng ô, `409` khi giờ vừa có người đặt, `429` khi một máy gửi quá 5 lần trong 10 phút, `503` khi OpenDental không trả lời (trang sẽ hiện "Xin vui lòng gọi điện").

## Cách đặt lịch hoạt động

- **Giờ trống**: OpenDental trả về các khoảng trống trong lịch của bác sĩ (theo ProvNum + OpNum). API chia thành giờ bắt đầu cách nhau 60 phút, mỗi giờ phải đủ chỗ cho cả lượt khám. Ngày nghỉ, ngày lễ, giờ đã có hẹn tự biến mất vì OpenDental không còn chỗ trống.
- **Độ dài lượt khám**: mặc định 60 phút (`Pattern` 12 ô × 5 phút). Mây đổi độ dài từng lịch hẹn ngay trong OpenDental như bình thường. Muốn đổi mặc định thì sửa `BOOKING_VISIT_MINUTES`.
- **Tìm bệnh nhân**: tìm theo họ + tên + ngày sinh (cách OpenDental khuyên dùng). Khớp đúng 1 người thì dùng hồ sơ đó. Không khớp hoặc khớp nhiều người thì tạo hồ sơ mới, và ghi chú trong lịch hẹn nhắc nhân viên kiểm tra để gộp (Merge) nếu trùng.
- **Ghi chú lịch hẹn**: "Booked on the website", bệnh nhân mới hay cũ, ngôn ngữ gọi lại, lý do khám.
- **Hai người cùng bấm 1 giờ**: người đến trước được, người sau nhận `409` và chọn giờ khác. Trước khi tạo lịch hẹn, API luôn hỏi lại OpenDental xem giờ đó còn trống không.
- **Chống spam**: ô ẩn (honeypot), giới hạn 5 lần đặt mỗi 10 phút trên mỗi địa chỉ IP, kiểm tra dữ liệu ở server.
- **Bảo mật**: khoá API chỉ nằm ở server. Không ghi log nội dung form. Lỗi từ OpenDental (có thể chứa tên bệnh nhân) không bao giờ gửi ra trình duyệt.

## Cấu hình (biến môi trường)

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `BOOKING_MODE` | `mock` | `opendental` để gọi OpenDental thật |
| `OPENDENTAL_DEVELOPER_KEY` | | Khoá của nhà phát triển (bên làm website) |
| `OPENDENTAL_CUSTOMER_KEY` | | Khoá của phòng khám |
| `OPENDENTAL_PROV_NUM` | | ProvNum của bác sĩ (trong danh sách Providers của OpenDental) |
| `OPENDENTAL_OP_NUM` | | OpNum của ghế nhận lịch hẹn online (trong danh sách Operatories) |
| `OPENDENTAL_CLINIC_NUM` | | Chỉ cần nếu OpenDental bật Clinics |
| `OPENDENTAL_APPT_TYPE_NUM` | | Tuỳ chọn: loại lịch hẹn (màu, thủ thuật kèm theo) |
| `OPENDENTAL_BASE_URL` | `https://api.opendental.com/api/v1/` | Chế độ Remote |
| `OPENDENTAL_MIN_INTERVAL_MS` | `1000` | Khoảng cách tối thiểu giữa 2 lần gọi (OpenDental giới hạn tốc độ) |
| `BOOKING_VISIT_MINUTES` | `60` | Độ dài mặc định một lượt khám |
| `BOOKING_STEP_MINUTES` | `60` | Giờ bắt đầu cách nhau bao nhiêu phút |
| `BOOKING_WEEKS` | `8` | Cho đặt trước tối đa bao nhiêu tuần |
| `CLINIC_TIMEZONE` | `America/Chicago` | Múi giờ Grayslake, IL |

Thiếu khoá, ProvNum hoặc OpNum khi `BOOKING_MODE=opendental` thì server báo lỗi ngay lúc khởi động.

## Việc cần làm để chạy thật

1. **Đăng ký Developer Key**: gửi email tới vendor.relations@opendental.com (tên công ty, email/địa chỉ nhận hoá đơn, mô tả ứng dụng, danh sách quyền: Appointments đọc + tạo, Patients đọc + tạo). OpenDental xử lý trong 1–3 ngày làm việc.
2. **Chi phí**: tạo lịch hẹn và bệnh nhân cần gói API **$30/tháng cho mỗi địa điểm** (gói chỉ đọc miễn phí không đủ). Bên giữ Developer Key trả tiền cho OpenDental.
3. **Phòng khám**: bật API trong OpenDental (Setup > Advanced Setup > API, dán Customer Key, tích Enabled). eConnector phải luôn chạy, vì OpenDental chuyển yêu cầu về máy chủ ở phòng khám qua eConnector. Máy chủ tắt thì trang Đặt lịch báo "xin gọi điện".
4. **Lịch của bác sĩ trong OpenDental**: giờ trống tính theo Schedule của bác sĩ trong OpenDental, không theo giờ mở cửa trên website. Khi đổi giờ hoặc nghỉ lễ, nhớ sửa cả trong OpenDental (Staff Portal chỉ đổi phần hiển thị trên website).
5. **HIPAA**: OpenDental yêu cầu bên làm API ký BAA với phòng khám.
6. **Thử trên cơ sở dữ liệu test của OpenDental** trước khi bật cho phòng khám thật (OpenDental có test database và khoá test công khai trên trang API Developer Setup).

## Chạy và kiểm tra

```bash
npm run api:test        # 16 bài kiểm tra với OpenDental giả lập
npm run proto:serve     # prototype + API ở http://localhost:4321 (mặc định OpenDental giả lập)
```

Node 24 chạy thẳng file TypeScript, không cần build. Khi dựng website Astro, mỗi endpoint chỉ cần gọi `handlers.availability(request)` / `handlers.book(request, ip)` từ `createBookingFromEnv()`.

Tài liệu OpenDental: [Appointments](https://www.opendental.com/site/apiappointments.html) · [Patients](https://www.opendental.com/site/apipatients.html) · [Developer Setup](https://www.opendental.com/site/apisetup.html) · [Remote/Local/Service](https://www.opendental.com/site/apilocal.html) · [Giá](https://www.opendental.com/site/apipermissions.html)
