# 🌟 HỆ THỐNG WORKLIFE & WORKLIFE ARCH - TÀI LIỆU QUẢN TRỊ & VẬN HÀNH TOÀN TẬP

> **Tác giả / Chủ sở hữu:** Nguyễn Văn Thắng (vant102@gmail.com)  
> **Phiên bản hệ thống:** 2.0 (Dual Hosting & Two-Way Sync Edition)  
> **Ngày phát hành:** 17/08/2026  

---

## 📑 MỤC LỤC
1. [Bảng Tổng Hợp Toàn Bộ Các Liên Kết Quản Trị & Giải Thích Chức Năng](#1-bảng-tổng-hợp-toàn-bộ-các-liên-kết-quản-trị--giải-thích-chức-năng)
2. [Cấu Trúc Hệ Thống & Phân Tách 2 Phiên Bản Ứng Dụng](#2-cấu-trúc-hệ-thống--phân-tách-2-phiên-bản-ứng-dụng)
3. [Hướng Dẫn Vận Hành Bản Cá Nhân (allin-nvt.web.app)](#3-hướng-dẫn-vận-hành-bản-cá-nhân-allin-nvtwebapp)
4. [Hướng Dẫn Đồng Bộ 2 Chiều (Cloud Firestore ↔ File Excel Máy Tính)](#4-hướng-dẫn-đồng-bộ-2-chiều-cloud-firestore--file-excel-máy-tính)
5. [Hướng Dẫn Quản Lý Album Ảnh Phối Cảnh & Bản Vẽ (Present Gallery)](#5-hướng-dẫn-quản-lý-album-ảnh-phối-cảnh--bản-vẽ-present-gallery)
6. [Hướng Dẫn Vận Hành Bản Chia Sẻ / Cộng Đồng (worklife-arch.web.app)](#6-hướng-dẫn-vận-hành-bản-chia-sẻ--cộng-đồng-worklife-archwebapp)
7. [Các Lệnh Phím Tắt & File Vận Hành Nhanh Trên Máy Tính](#7-các-lệnh-phím-tắt--file-vận-hành-nhanh-trên-máy-tính)

---

## 1. BẢNG TỔNG HỢP TOÀN BỘ CÁC LIÊN KẾT QUẢN TRỊ & GIẢI THÍCH CHỨC NĂNG

| Nhóm | Tên Liên Kết | Đường Dẫn URL / Thư Mục | Ý Nghĩa & Vai Trò Trong Hệ Thống |
| :--- | :--- | :--- | :--- |
| **Ứng Dụng Web** | **Bản Cá Nhân (Đầy Đủ)** | [https://allin-nvt.web.app](https://allin-nvt.web.app) | **App làm việc chính của cá nhân anh/chị:** Có 2 tab con (`Working` / `All`), đồng bộ 2 chiều với Excel, xem album ảnh phối cảnh Present, mở thư mục ổ đĩa PC. |
| **Ứng Dụng Web** | **Bản Chia Sẻ (Public)** | [https://worklife-arch.web.app](https://worklife-arch.web.app) | **App dành cho cộng sự / người dùng khác:** Gọn gàng với 1 trang duy nhất, không can thiệp ổ đĩa máy tính, không chứa nút đồng bộ Excel. |
| **Google Drive** | **File Excel Đồng Bộ Cục Bộ** | `H:\My Drive\Worklife_NVT\Worklife_Sync.xlsx` | **Bảng tính trung tâm trên máy tính:** Chứa toàn bộ danh mục 13 cột thông tin dự án, kết nối đường dẫn thư mục `D:\Working\...` phục vụ đồng bộ. |
| **Google Drive** | **Lối Tắt Mở Sheet Online** | `H:\My Drive\Worklife_NVT\Worklife_Sync.url` | Phím tắt 1-click trên máy tính giúp mở ngay lập tức bảng tính Google Sheets trực tuyến trên trình duyệt. |
| **Google Sheets** | **Trang Bảng Tính Online** | [Google Sheets Link](https://docs.google.com/spreadsheets/d/1Nhk9Ai2b9tlAGwmznYmqQ_siVDmf7AIqXfBvXJ0X4Z0/edit) | Trang tính Google Drive gốc chứa danh sách dự án, có thể chỉnh sửa trực tuyến từ xa. |
| **Mã Nguồn Git** | **Kho Lưu Trữ GitHub** | [https://github.com/vant102/task-tracker-app](https://github.com/vant102/task-tracker-app) | Nơi lưu trữ và sao lưu toàn bộ mã nguồn frontend React, CSS và kịch bản Python của dự án. |
| **Firebase Cloud** | **Tổng Quan Dự Án** | [Firebase Console Overview](https://console.firebase.google.com/project/task-manager-app-578f5/overview) | Bảng điều khiển trung tâm của Google Cloud Firebase quản lý tài nguyên, chi phí và trạng thái hệ thống. |
| **Firebase Cloud** | **Quản Lý Tên Miền / Hosting** | [Firebase Hosting Sites](https://console.firebase.google.com/project/task-manager-app-578f5/hosting/sites) | Quản lý triển khai (deploy), quản lý 2 domain `allin-nvt` và `worklife-arch`, xem lịch sử phát hành. |
| **Firebase Cloud** | **Cơ Sở Dữ Liệu Firestore** | [Cloud Firestore Database](https://console.firebase.google.com/project/task-manager-app-578f5/firestore) | Cơ sở dữ liệu đám mây NoSQL lưu trữ realtime tất cả dự án, công việc, thói quen, mục tiêu, nhật ký họp. |
| **Firebase Cloud** | **Quản Trị Người Dùng & Auth** | [Firebase Authentication](https://console.firebase.google.com/project/task-manager-app-578f5/authentication/users) | Quản lý danh sách email được phép đăng nhập (`vant102@gmail.com`) và cấu hình Authorized Domains. |

---

## 2. CẤU TRÚC HỆ THỐNG & PHÂN TÁCH 2 PHIÊN BẢN ỨNG DỤNG

```
                             ┌────────────────────────────────────────────────────────┐
                             │       GOOGLE CLOUD FIREBASE (task-manager-app-578f5)   │
                             │  - Firestore Realtime Database                         │
                             │  - Google Identity Authentication                      │
                             └──────────────────────────┬─────────────────────────────┘
                                                        │
                      ┌─────────────────────────────────┴─────────────────────────────────┐
                      ▼                                                                   ▼
       ┌───────────────────────────────┐                                   ┌───────────────────────────────┐
       │   https://allin-nvt.web.app   │                                   │  https://worklife-arch.web.app │
       │     (BẢN CÁ NHÂN ĐẦY ĐỦ)      │                                   │    (BẢN CHIA SẺ CỘNG ĐỒNG)    │
       ├───────────────────────────────┤                                   ├───────────────────────────────┤
       │ • 2 Tab: Working / All        │                                   │ • 1 Trang duy nhất            │
       │ • Đồng bộ 2 chiều Excel       │                                   │ • Quản lý tiến độ cơ bản      │
       │ • Xem album Present Gallery   │                                   │ • An toàn, không can thiệp PC │
       │ • Nút mở thư mục Explorer     │                                   │ • Dành cho cộng sự/khách xem  │
       └──────────────┬────────────────┘                                   └───────────────────────────────┘
                      │
                      ▼
       ┌────────────────────────────────────────────────────────┐
       │             MÁY TÍNH CÁ NHÂN (LOCAL PC)                 │
       │  • File Excel: H:\My Drive\Worklife_NVT\Worklife_Sync  │
       │  • Ảnh dự án: D:\Working\{Year}\{Project}\Present\     │
       │  • Local Server: Python port 8081 (Start_Server.bat)   │
       └────────────────────────────────────────────────────────┘
```

---

## 3. HƯỚNG DẪN VẬN HÀNH BẢN CÁ NHÂN (`allin-nvt.web.app`)

### 3.1. Tab con `Working` (Dự án đang thực hiện):
* Dành riêng cho các công trình đang triển khai thiết kế.
* Mỗi dự án có thanh tiến độ tổng thể, nhãn hạn chốt giai đoạn (`DD/MM/YYYY • HH:mm`).
* Bấm vào từng dự án để vào **Bảng Quy trình 7 Giai đoạn Kiến trúc**:
  1. Giai đoạn 1: Tiếp nhận thông tin & Nhiệm vụ thiết kế
  2. Giai đoạn 2: Lên ý tưởng & Phương án sơ bộ (Concept)
  3. Giai đoạn 3: Thiết kế cơ sở & Phối cảnh 3D
  4. Giai đoạn 4: Thiết kế kỹ thuật thi công (KTTK)
  5. Giai đoạn 5: Dự toán & Khối lượng
  6. Giai đoạn 6: Bàn giao hồ sơ thiết kế
  7. Giai đoạn 7: Giám sát tác giả & Hoàn công

### 3.2. Tab con `All` (Kho Thư viện dự án):
* Hiển thị toàn bộ kho tàng dự án của anh/chị (Đang làm, Hoàn thành, Tạm dừng).
* **Bộ lọc đa chiều tiện dụng:**
  * **Lọc theo Năm:** Nhập số năm (ví dụ `2012`, `2025`, `2026`) $\rightarrow$ App tự động lọc các dự án có thời gian bắt đầu/kết thúc tương ứng.
  * **Lọc theo Trạng thái:** Tất cả / Đang thực hiện / Hoàn thành / Tạm dừng.
  * **Lọc theo Phạm vi:** Quy hoạch / Kiến trúc / Nội thất / Cảnh quan.
  * **Lọc theo Loại hình:** Thiết kế mới / Cải tạo / Mở rộng / Hoàn thiện nội thất.
  * **Tìm kiếm:** Gõ tên, mã ID, tên chủ đầu tư, địa điểm hoặc phong cách kiến trúc.

### 3.3. Chuyển đổi trạng thái 2 chiều linh hoạt:
* Trong chi tiết dự án, anh/chị có thể bấm chuyển đổi qua lại bất kỳ lúc nào:
  * 🔵 `Working` (Đang làm) $\leftrightarrow$ 🟢 `Completed` (Hoàn thành) $\leftrightarrow$ 🟡 `Paused` (Tạm dừng).
* Khi một dự án cũ được khởi động lại $\rightarrow$ Chỉ cần bấm `Working` là dự án tự động quay trở lại tab Working với đầy đủ 7 giai đoạn trước đó!

---

## 4. HƯỚNG DẪN ĐỒNG BỘ 2 CHIỀU (CLOUD FIRESTORE ↔ FILE EXCEL MÁY TÍNH)

### Chiều 1: Từ Web App về File Excel (`H:\My Drive\Worklife_NVT\Worklife_Sync.xlsx`)
1. Khi anh/chị tạo mới hoặc chỉnh sửa dự án trên Web App.
2. Bấm nút **`🔄 Đồng bộ Excel`** trên thanh công cụ góc trên bên phải.
3. **Kết quả:**
   * Nếu đang mở trên máy tính có chạy `Start_Server.bat`: Hệ thống tự động ghi thẳng vào file `H:\My Drive\Worklife_NVT\Worklife_Sync.xlsx`.
   * Nếu mở trên iPad/Điện thoại: Trình duyệt tự động xuất và tải về file `Worklife_Sync.xlsx` mới nhất.

### Chiều 2: Từ File Excel lên Web App
1. Anh/chị mở file `Worklife_Sync.xlsx` bằng Microsoft Excel trên máy tính để nhập hàng loạt dự án mới (kèm cột `Path` dẫn đến ổ `D:\Working\...`).
2. Lưu file Excel lại.
3. Trên Web App, bấm nút **`📥 Tải lên (Upload)`** bên cạnh nút Đồng bộ và chọn file `Worklife_Sync.xlsx`.
4. **Kết quả:** Toàn bộ dự án từ Excel lập tức được nạp lên Cloud Firestore và hiển thị tức thì trên cả iPad và Điện thoại.

---

## 5. HƯỚNG DẪN QUẢN LÝ ALBUM ẢNH PHỐI CẢNH & BẢN VẼ (PRESENT GALLERY)

### 5.1. Cấu trúc lưu trữ ảnh trên máy tính:
Mỗi dự án trên ổ đĩa `D:\Working\` nên có cấu trúc thư mục như sau:
```
D:\Working\2026\2026-01_ nha Ngoai\
├── Thumb.jpg            (Ảnh bìa đại diện của dự án)
├── Present\             (Thư mục chứa toàn bộ ảnh phối cảnh 3D & bản vẽ)
│   ├── 01_MatTien.jpg
│   ├── 02_PhongKhach.jpg
│   ├── 03_PhongNgu.jpg
│   └── 04_SanVuon.jpg
└── HoSoBanVe\           (Các file CAD, SketchUp, 3ds Max...)
```

### 5.2. Đồng bộ album ảnh lên Web:
1. Click đúp vào file **`Sync_Data.bat`** trong thư mục dự án trên máy tính.
2. Script Python sẽ tự động:
   * Quét các thư mục `Present/`.
   * Nén ảnh chất lượng cao (giảm từ 20MB xuống ~200KB siêu nét).
   * Tạo tệp chỉ mục `manifest.json`.
3. Bấm vào chi tiết dự án trên Web App $\rightarrow$ chọn tab **`Phối cảnh & Bản vẽ (Present Gallery)`** $\rightarrow$ Anh/chị sẽ có một album ảnh tuyệt đẹp, có thể phóng to toàn màn hình (Lightbox) và vuốt chuyển ảnh mượt mà trên iPad.
4. **Nút "📂 Mở Thư Mục PC":** Bấm nút này trên máy tính để Windows Explorer tự động bật ngay thư mục gốc của dự án trên ổ `D:\`.

---

## 6. HƯỚNG DẪN VẬN HÀNH BẢN CHIA SẺ / CỘNG ĐỒNG (`worklife-arch.web.app`)

* **Mục đích sử dụng:** Dành cho cộng sự, đối tác hoặc người dùng khác cùng xem danh mục dự án mà không ảnh hưởng tới dữ liệu cá nhân hay ổ cứng máy tính của anh/chị.
* **Giao diện:** Thiết kế **1 trang duy nhất**, trực quan, hiện đại.
* **Bảo mật:** Không chứa nút đồng bộ file Excel, không kích hoạt tính năng can thiệp hệ thống máy tính cá nhân.

---

## 7. CÁC LỆNH PHÍM TẮT & FILE VẬN HÀNH NHANH TRÊN MÁY TÍNH

Trong thư mục `D:\Working\Project Antigravity\Github app\`:

1. ⚡ **`Sync_Data.bat`**: Chạy đồng bộ danh mục Google Sheet và nén ảnh phối cảnh từ ổ `D:\` lên web.
2. 🌐 **`Start_Server.bat`**: Bật máy chủ kết nối cục bộ (Port 8081) để kích hoạt tính năng mở thư mục Windows Explorer và đồng bộ 2 chiều tự động.
3. 🛠️ **`npm run dev`**: Chạy máy chủ phát triển cục bộ (`http://localhost:5173`) khi muốn thử nghiệm lập trình offline.
4. 🚀 **`npx firebase-tools deploy --only hosting`**: Lệnh đẩy bản cập nhật mới nhất lên cả 2 website Firebase Hosting.

---

🎉 **Chúc anh/chị có những trải nghiệm quản lý công việc và dự án kiến trúc thật hiệu quả và thăng hoa cùng WorkLife!**
