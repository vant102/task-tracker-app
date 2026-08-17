# 📋 Trạng Thái Dự Án: Second Brain (Task Tracker)

*Tài liệu này dùng để cung cấp ngữ cảnh (context) cho các phiên làm việc tiếp theo với AI.*

## 1. Thông Tin Chung
- **Tên dự án:** Second Brain (Quản lý Công việc & Dự án Kiến trúc)
- **Đường dẫn Live:** [https://task-nvt.netlify.app/](https://task-nvt.netlify.app/)
- **Thư mục làm việc (Local):** `D:\Working\Project Antigravity\Task Tracker`
- **Kho chứa (Repository):** GitHub (Liên kết tự động với Netlify)

## 2. Công Nghệ Sử Dụng (Tech Stack)
- **Frontend:** React (Vite)
- **Giao diện (UI):** Vanilla CSS kết hợp phong cách Glassmorphism (Kính mờ). Phối màu xanh ngọc bích tối và vàng gold sang trọng.
- **Backend & Database:** Google Firebase (Authentication & Firestore).
- **Thư viện nổi bật:** `react-big-calendar` (Lịch), `date-fns` / `moment` (Xử lý thời gian).

## 3. Trạng Thái Hiện Tại (Đã Hoàn Thành)
Dự án đã trải qua 3 giai đoạn chính và đang hoạt động ổn định 100%:
- **Giai đoạn 1 (UI/UX):** Giao diện đáp ứng (Responsive) hoàn chỉnh trên cả PC, Tablet và Mobile. Nút bấm trên thiết bị di động (<=1024px) được thiết kế dạng thanh cuộn ngang để không bị đè lên nội dung khi xoay ngang màn hình.
- **Giai đoạn 2 (Cloud DB):** Đã gỡ bỏ toàn bộ IndexedDB (Dexie cục bộ). Đã tích hợp Firebase Firestore để lưu trữ đám mây. Dữ liệu được cô lập tuyệt đối theo `userId` (Người nào đăng nhập chỉ thấy dữ liệu của người đó). Đăng nhập thông qua tài khoản Google (Popup).
- **Giai đoạn 3 (Deployment):** Đẩy mã nguồn lên GitHub nhánh `main`. Triển khai thành công lên Netlify với tính năng tự động cập nhật (CI/CD) mỗi khi có thay đổi trên GitHub.
- **Các chỉnh sửa tùy biến (Customization):**
  - Màu ô "Hôm nay" trong Lịch: Nền `#4d6d9b`, chữ `#e6b965` (Vàng).

## 4. Cấu Trúc Mã Nguồn Chính
- `src/firebase.js`: Cấu hình Firebase (FirebaseApp, Auth, Firestore).
- `src/contexts/AuthContext.jsx`: Quản lý trạng thái Đăng nhập/Đăng xuất toàn cầu.
- `src/hooks/useFirestoreQuery.js`: Hook tùy chỉnh để kết nối và đồng bộ dữ liệu theo thời gian thực (Real-time) từ Firestore.
- `src/index.css`: Chứa toàn bộ CSS toàn cục (Background, Glassmorphism, Breakpoint di động là `max-width: 1024px`).
- `src/components/...`: Các chức năng chính như `Dashboard`, `EisenhowerBoard`, `EntertainmentDashboard`, `CalendarView`.

## 5. Hướng Phát Triển Tương Lai (Gợi ý)
- Chế độ Sáng/Tối (Light/Dark mode toggle).
- Biểu đồ thống kê tiến độ công việc hàng tuần/tháng.
- Hệ thống thông báo (Push Notifications / Email Reminders).
- Chia sẻ dự án (Collaboration) cho nhiều người dùng.

---
*Ghi chú cho AI trong phiên chat mới: Hãy đọc kỹ file này để hiểu kiến trúc của dự án trước khi đề xuất bất kỳ sửa đổi nào.*
