# HỒ SƠ BÀN GIAO & TRẠNG THÁI DỰ ÁN (PROJECT HANDOFF)

Tài liệu này ghi lại toàn bộ trạng thái hiện tại của hệ thống Second Brain để chuẩn bị cho phiên làm việc (New Chat) tiếp theo. Agent tiếp nhận hãy đọc kỹ tài liệu này để nắm bắt ngữ cảnh.

## 1. Thông tin chung
- **Tên dự án:** Second Brain (Task Tracker)
- **Kiến trúc hiện tại:** V7 (Glassmorphism + Horizontal Top Nav)
- **Tech Stack:** React (Vite), Dexie.js (IndexedDB), CSS thuần (không dùng Tailwind).
- **Thư mục làm việc chính:** `D:\Working\Project Antigravity\Task Tracker`

## 2. Các thay đổi đã hoàn thành (Tính đến cuối Giai đoạn 12)
Ứng dụng vừa trải qua đợt đại phẫu giao diện toàn diện:

- **Giao diện Glassmorphism:** Chuyển đổi toàn bộ giao diện sang nền mờ kính (backdrop-filter) với ảnh nền động (animated blurred circles). Code CSS được định nghĩa tại `src/index.css`.
- **Top Navigation (V7):** Đã xóa bỏ Sidebar, chuyển các điều hướng (Dự án Thiết kế, Phát triển bản thân, Giải trí, Eisenhower, Lịch) lên Header nằm ngang phía trên (tại `src/App.jsx`).
- **Project Image Cards:** Các dự án thiết kế (`src/components/ProjectList.jsx`) đã được hiển thị dưới dạng thẻ (Cards) với Ảnh Đại Diện (Cover Image) lớn ở phía trên.
- **Form Nhập liệu chuẩn:** Xây dựng `src/components/ProjectFormModal.jsx` thay thế cho lệnh `prompt` đơn giản, cho phép người dùng khai báo Tên dự án, Phân loại, Mã dự án, Chủ đầu tư và URL Ảnh bìa.
- **Tính năng Giải trí (Excel-like Grid):** `src/components/EntertainmentDashboard.jsx` hoạt động như một bảng tính (inline-editing) với các tính năng sửa trực tiếp trên từng ô (Tên, ngày, địa điểm, ghi chú, đánh giá sao, trạng thái). Đã sửa lỗi không tải lại bảng khi thêm mới (thêm dependency id vào useLiveQuery).

## 3. Cấu trúc Thư mục Quan trọng
- `src/App.jsx`: Bộ định tuyến và layout chính của toàn app (Chứa Background shapes, Glass container và Top Nav).
- `src/index.css`: Toàn bộ CSS lõi (hiệu ứng, class, variables, scrollbar).
- `src/db/db.js`: Khởi tạo Dexie, quản lý version và các hàm thao tác DB (`addProject`, `updateProject`, `deleteProject`, v.v.).
- `src/db/mockData.js`: Dữ liệu mẫu ban đầu để reset hệ thống.
- `src/components/ProjectList.jsx`: Nơi hiển thị thẻ Dự án Thiết kế.
- `src/components/PersonalProjectDetail.jsx`: Nơi hiển thị Quản lý Mục tiêu / Thói quen (Phát triển bản thân).
- `src/components/EntertainmentDashboard.jsx`: Bảng theo dõi Giải trí & Cuộc hẹn.

## 4. Ghi chú cho Agent tiếp theo
- **Phong cách Thiết kế:** User cực kỳ coi trọng tính thẩm mỹ, hiệu ứng mượt mà và giao diện Kính Mờ (Glassmorphism). Bất kỳ Component nào thêm mới đều phải dùng class `card`, `glass-panel` hoặc `glass-input` trong `index.css`.
- **Thói quen User:** User thích inline-editing (sửa trực tiếp trên bảng như Excel) với các tính năng đơn giản (Habit tracker, Entertainment), và thích form modal bài bản với các tính năng lớn (Projects).
- **Hệ thống 3 Trụ Cột:** Không thay đổi 3 tab cốt lõi: Dự án Thiết kế, Phát triển bản thân, Giải trí. 
- **Công việc tiếp theo:** User có đề cập *"còn một số điểm tôi cần bạn thực hiện nữa, nhưng để mai thôi"*. Agent hãy hỏi User yêu cầu mới là gì và tiếp tục phát triển trên bộ base V7 vững chắc này.

---
*Ngày cập nhật: 09/08/2026*
