# Báo cáo Tổng kết Dự án: WorkLife (Hệ thống Quản lý Công việc)

Tài liệu này tóm tắt toàn bộ các kỹ thuật, giải pháp giao diện (UI/UX), và cấu trúc triển khai của dự án **WorkLife**. Bạn có thể sử dụng bộ tài liệu này như một "bản thiết kế mẫu" (blueprint) để áp dụng cho các dự án web thử nghiệm khác trong tương lai.

---

## 1. Tổng quan (Overview)

- **Tên ứng dụng:** WorkLife (trước đây là Task Manager / Second Brain).
- **Mục tiêu:** Xây dựng một hệ thống theo dõi dự án chuyên nghiệp dành riêng cho Kiến trúc sư, kết hợp quản lý phát triển cá nhân (Skills/Relax/Plan).
- **Công nghệ cốt lõi (Tech Stack):**
  - Khung giao diện: **React (JS/JSX)**.
  - Công cụ Build: **Vite**.
  - Cơ sở dữ liệu & Xác thực: **Firebase** (Firestore Database & Google Auth).
  - Styling: **CSS thuần (Vanilla CSS)**.
- **Link Live (Dùng trên Mobile/PC):** [https://task-manager-app-578f5.web.app](https://task-manager-app-578f5.web.app)

---

## 2. Các Giải Pháp Kỹ Thuật & UI/UX Đã Triển Khai

### 2.1. Thiết kế Giao diện Hiện đại (Glassmorphism & Gradient)
- **Glassmorphism:** Sử dụng nền trong suốt kết hợp làm mờ bối cảnh (`backdrop-filter: blur(16px)`) kết hợp với màu nền tĩnh `rgba(30, 41, 59, 0.7)`. Điều này tạo ra cảm giác các bảng điều khiển đang "nổi" trên màn hình.
- **Background Animation:** Các thẻ `<div className="shape">` (hình tròn mờ màu xanh dương, tím, lục) chuyển động chậm trôi nổi ở lớp dưới cùng (z-index âm) nhờ tính năng `@keyframes` của CSS.
- **Typography Gradient:** Logo "WorkLife" được xử lý bằng kỹ thuật dải màu (gradient) cắt vào chữ, chuyển tiếp mượt mà từ Xanh dương (`#3b82f6` - đại diện cho Work) sang Cam gạch (`#f08967` - đại diện cho Life).

### 2.2. Kỹ thuật Responsive (Khớp mọi thiết bị PC - iPad - iPhone)
Để ứng dụng hoàn hảo trên mọi kích cỡ, hệ thống áp dụng các giải pháp sau:
- **Tăng tỷ lệ hiển thị toàn cục:** Sử dụng `html { font-size: 150%; }` để phóng to toàn bộ các đơn vị `rem` (font chữ, padding, margin), giúp ứng dụng trông đầy đặn trên màn hình PC.
- **Giải phóng giới hạn chiều cao (Mobile/Tablet):** Trên PC, giao diện dùng khung cố định `100vh` với cuộn nội bộ (`overflow-y: auto`). Tuy nhiên, ở điểm neo `@media (max-width: 1300px)` (dành cho Tablet & Mobile):
  - Khung viền cứng được gỡ bỏ (`height: auto`, `border-radius: 0`).
  - Giao diện dạng lưới phức tạp (Grid) tự động bẻ thành giao diện cuộn dọc (Column Flex).
- **Sửa lỗi "Kẹt cuộn trang" trên iOS (iPhone/iPad):** Đã mở khóa tính năng cuộn gốc của trình duyệt (`overflow-y: auto !important` cho thẻ `body` và `overflow: visible` cho nội dung), khắc phục triệt để tình trạng nội dung dài bị khuất mà không vuốt được trên Safari/Chrome của iPhone.

### 2.3. Tối ưu Trải nghiệm Nhập liệu (Form & Data)
- **Rút gọn Nhãn (Label):** Các trường thông tin dài được gọt giũa ("Địa điểm công trình" -> "Địa điểm") và gom vào chung 1 bảng Grid (4 hàng x 2 cột) để giảm tải thị giác.
- **Đồng bộ Dữ liệu Cũ/Mới (Legacy Data):** Xử lý triệt để lỗi bất đồng bộ trạng thái. Thay vì lưu mã gốc "Active", hệ thống ghi đè và lưu thẳng chuỗi tiếng Việt "Đang thực hiện". Đồng thời, thêm cơ chế thông minh vào UI: nếu đọc trúng tệp cũ có mã "Active", ứng dụng sẽ tự động "dịch" ra "Đang thực hiện" mà không gây lỗi.

---

## 3. Cấu Trúc Triển Khai & Môi Trường (Deployment)

### 3.1. Chạy mã nguồn trên máy tính (Local)
Dự án được khởi chạy trên Terminal bằng PowerShell của Windows. Do Windows có cơ chế bảo mật (Execution Policy), lệnh khởi động chuẩn là:
```powershell
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```
*(Mở ra ở cổng `http://localhost:5173/` để xem trước thay đổi theo thời gian thực)*.

### 3.2. Quá trình Đóng gói (Build)
Khi code hoàn thiện, Vite sẽ dịch toàn bộ mã React ra dạng HTML/CSS/JS thuần, thu gọn dung lượng tối đa. Lệnh sử dụng:
```powershell
powershell -ExecutionPolicy Bypass -Command "npm run build"
```
*(Sản phẩm đầu ra nằm ở thư mục `/dist`)*.

### 3.3. Đưa lên Internet (Deploy)
Dự án được cấu hình đồng bộ ở 2 nền tảng để tăng tính ổn định:
1. **GitHub:** Kho lưu trữ mã nguồn ([vant102/task-tracker-app](https://github.com/vant102/task-tracker-app)). Cứ mỗi lần lệnh `git push` được chạy, mã mới sẽ được cất giữ an toàn.
2. **Netlify:** Được nối thẳng với GitHub. Khi Github có code mới, Netlify cũng sẽ ngầm tự động build và làm mới trang.
3. **Firebase Hosting:** Sử dụng Firebase CLI để triển khai trực tiếp nhánh mã mới nhất lên URL chính thức:
```powershell
powershell -ExecutionPolicy Bypass -Command "npx firebase-tools deploy --only hosting"
```

> [!TIP]
> Nhờ hệ thống lệnh tích hợp, quy trình "Lưu Code -> Đóng gói -> Đẩy lên Github -> Đưa lên Firebase" diễn ra hoàn toàn tự động phía sau màn hình chỉ bằng 1 thao tác duy nhất. Bạn chỉ việc ngồi đợi khoảng 30s và F5 trình duyệt.

---

Tài liệu này đóng gói đủ mọi "vũ khí" bí mật của WorkLife. Nếu dự án tới bạn cần một tính năng tương tự, chỉ việc mở tài liệu này ra đối chiếu!
