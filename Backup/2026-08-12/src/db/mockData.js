import { db } from './db';

export async function injectMockData() {
  const projectCount = await db.projects.count();
  
  if (projectCount === 0) {
    console.log('Bơm dữ liệu giả V3...');
    
    // 1. Tạo 3 Danh mục Dự án
    const MOCK_PROJECTS = [
      { name: 'Đọc sách & Thể thao', category: 'Phát triển bản thân', color: '#3b82f6', status: 'Active' },
      { name: 'Gặp gỡ cuối tuần', category: 'Giải trí', color: '#ec4899', status: 'Active' },
      { 
        name: 'Biệt thự Vườn Củ Chi', category: 'Dự án thiết kế', color: '#10b981', status: 'Active',
        project_id_code: 'DA-2408', client: 'Anh Vượng', location: 'Củ Chi, TP.HCM', 
        start_date: '2026-08-01', end_date: '2026-12-31', style: 'Modern Tropical',
        image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800'
      }
    ];
    
    await db.projects.bulkAdd(MOCK_PROJECTS);
    const projects = await db.projects.toArray();
    
    const pDevId = projects.find(p => p.category === 'Phát triển bản thân').id;
    const designId = projects.find(p => p.category === 'Dự án thiết kế').id;

    // 2. Tạo 26 Công việc phân rã cho Dự án thiết kế
    const DESIGN_PHASES = [
      { phase: '1. Tìm hiểu thông tin', title: 'Tiếp nhận Brief sơ bộ (nhu cầu, ngân sách, phong cách)', status: 'Done', project_id: designId, notes: 'Tạo file note/ghi âm cuộc họp' },
      { phase: '1. Tìm hiểu thông tin', title: 'Khảo sát hiện trạng thực tế (đo đạc, chụp ảnh, video)', status: 'Done', project_id: designId, notes: 'Upload thư mục Media khảo sát' },
      { phase: '1. Tìm hiểu thông tin', title: 'Vẽ lại mặt bằng CAD hiện trạng (As-built drawing)', status: 'Done', project_id: designId, notes: 'File CAD chính xác 100% tỷ lệ' },
      { phase: '1. Tìm hiểu thông tin', title: 'Đánh giá kỹ thuật & Pháp lý khu vực', status: 'Done', project_id: designId, notes: 'Báo cáo đánh giá rủi ro hiện trạng' },
      
      { phase: '2. Tư vấn khách hàng', title: 'Lên phương án mặt bằng công năng sơ bộ (Zoning)', status: 'Doing', project_id: designId, notes: 'Khách hàng chốt mặt bằng' },
      { phase: '2. Tư vấn khách hàng', title: 'Thiết kế Moodboard (định hướng màu sắc, vật liệu)', status: 'To do', project_id: designId, notes: 'Khách hàng chốt phong cách' },
      { phase: '2. Tư vấn khách hàng', title: 'Khái toán sơ bộ mức đầu tư ($/m2)', status: 'To do', project_id: designId, notes: 'Phù hợp ngân sách dự kiến' },
      
      { phase: '3. Tiến hành Hợp đồng', title: 'Soạn thảo hợp đồng & Scope of Work', status: 'To do', project_id: designId, notes: 'Rà soát điều khoản thanh toán' },
      { phase: '3. Tiến hành Hợp đồng', title: 'Ký kết hợp đồng & Nhận tiền tạm ứng đợt 1', status: 'To do', project_id: designId, notes: 'Checkpoint: Không làm tiếp nếu chưa nhận cọc' },
      { phase: '3. Tiến hành Hợp đồng', title: 'Lập Master Schedule & Họp Kick-off nội bộ', status: 'To do', project_id: designId, notes: 'Gắn tag nhân sự phụ trách' },
      
      { phase: '4. Phương án sơ bộ', title: 'Lên mô hình 3D khối cảnh / Không gian nội thất', status: 'To do', project_id: designId, notes: 'File Sketchup/3DsMax/Revit' },
      { phase: '4. Phương án sơ bộ', title: 'Trình bày 3D & Ghi nhận phản hồi lần 1', status: 'To do', project_id: designId, notes: 'Biên bản điều chỉnh thiết kế' },
      { phase: '4. Phương án sơ bộ', title: 'Chỉnh sửa 3D & Chốt phương án cuối cùng', status: 'To do', project_id: designId, notes: 'Sign-off: Khách hàng ký duyệt 3D' },
      { phase: '4. Phương án sơ bộ', title: 'Nhận thanh toán tạm ứng đợt 2', status: 'To do', project_id: designId, notes: 'Kế toán xác nhận' },
      
      { phase: '5. Lập hồ sơ giấy phép', title: 'Thiết lập bản vẽ xin phép xây dựng chuẩn quy định', status: 'To do', project_id: designId, notes: 'KTS/Họa viên thực hiện' },
      { phase: '5. Lập hồ sơ giấy phép', title: 'Nộp hồ sơ tại cơ quan chức năng', status: 'To do', project_id: designId, notes: 'Update mã hồ sơ theo dõi' },
      { phase: '5. Lập hồ sơ giấy phép', title: 'Nhận Giấy phép xây dựng được phê duyệt', status: 'To do', project_id: designId, notes: 'Upload bản scan Giấy phép' },
      
      { phase: '6. Triển khai hồ sơ', title: 'Triển khai chi tiết Kiến trúc (cửa, ốp lát, trần...)', status: 'To do', project_id: designId, notes: 'KTS chủ trì duyệt' },
      { phase: '6. Triển khai hồ sơ', title: 'Thiết kế bản vẽ Kết cấu (móng, cột, dầm, sàn)', status: 'To do', project_id: designId, notes: 'File CAD Kết cấu' },
      { phase: '6. Triển khai hồ sơ', title: 'Thiết kế hệ thống MEP', status: 'To do', project_id: designId, notes: 'File CAD MEP' },
      { phase: '6. Triển khai hồ sơ', title: 'Họp Combine: Kiểm tra va chạm', status: 'To do', project_id: designId, notes: 'Nghiệm thu nội bộ: PM check chéo lỗi' },
      { phase: '6. Triển khai hồ sơ', title: 'Lập bảng bóc tách khối lượng chi tiết (BOQ)', status: 'To do', project_id: designId, notes: 'File Excel Dự toán chuẩn xác' },
      
      { phase: '7. Bàn giao hồ sơ', title: 'In ấn, đóng gáy, đóng dấu giáp lai & Ký xác nhận', status: 'To do', project_id: designId, notes: 'Chuẩn bị 2-3 bộ cứng' },
      { phase: '7. Bàn giao hồ sơ', title: 'Bàn giao hồ sơ cho khách hàng', status: 'To do', project_id: designId, notes: 'Biên bản bàn giao có chữ ký' },
      { phase: '7. Bàn giao hồ sơ', title: 'Nhận thanh toán đợt cuối & Quyết toán', status: 'To do', project_id: designId, notes: 'Hóa đơn, chứng từ hoàn tất' },
      { phase: '7. Bàn giao hồ sơ', title: 'Đánh giá dự án (Lessons Learned) & Lưu trữ Server', status: 'To do', project_id: designId, notes: 'Đóng dự án (Project Closed)' }
    ];

    // 3. Tạo một số Task thói quen & dự án cho Phát triển bản thân
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

    const MOCK_PERSONAL_TASKS = [
      { 
        title: 'Chạy bộ 30 phút buổi sáng', priority: 'High', status: 'To do', importance: 'Important', urgency: 'Not Urgent', 
        project_id: pDevId, task_type: 'Habit', category_tag: 'Sức khỏe', core_purpose: 'Tăng cường thể lực, giảm mỡ',
        frequency: 'Hàng ngày', habit_logs: [yesterday, today] 
      },
      { 
        title: 'Đọc 10 trang sách', priority: 'Medium', status: 'To do', importance: 'Important', urgency: 'Not Urgent', 
        project_id: pDevId, task_type: 'Habit', category_tag: 'Trí tuệ', core_purpose: 'Mở rộng kiến thức chuyên môn',
        frequency: 'Hàng ngày', habit_logs: [yesterday] 
      },
      { 
        title: 'Hoàn thành Khóa học IELTS Online', priority: 'High', status: 'Đang thực hiện', importance: 'Important', urgency: 'Urgent', 
        project_id: pDevId, task_type: 'Project', category_tag: 'Kỹ năng', core_purpose: 'Đạt IELTS 7.0 để du học',
        target: 120, current_progress: 45, unit: 'Bài học', deadline: '2026-10-31', resource_url: 'https://coursera.org'
      },
      { 
        title: 'Tập Gym T2-T4-T6', priority: 'Medium', status: 'To do', importance: 'Important', urgency: 'Not Urgent', 
        project_id: pDevId, task_type: 'Habit', category_tag: 'Sức khỏe', core_purpose: 'Tăng cơ bản',
        frequency: 'T2-T4-T6', habit_logs: [today] 
      }
    ];

    const MOCK_ENTERTAINMENT_TASKS = [
      {
        title: 'Xem phim Deadpool & Wolverine', project_id: projects.find(p => p.category === 'Giải trí').id,
        task_type: 'Entertainment', status: 'Sắp tới', priority_star: 5, partner: 'Nhóm bạn ĐH',
        location: 'CGV Landmark 81', notes: 'Đặt vé online trước', deadline: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString()
      },
      {
        title: 'Ăn tối nhà hàng Pháp', project_id: projects.find(p => p.category === 'Giải trí').id,
        task_type: 'Entertainment', status: 'Đã tham gia', priority_star: 4, partner: 'Đối tác thiết kế',
        location: 'Le Corto', notes: 'Bàn chuyện hợp đồng', deadline: yesterday
      }
    ];

    await db.tasks.bulkAdd([...DESIGN_PHASES, ...MOCK_PERSONAL_TASKS, ...MOCK_ENTERTAINMENT_TASKS]);

    // 4. Bơm 1 log nhật ký cho Dự án thiết kế
    await db.project_logs.add({
      project_id: designId,
      date: new Date().toISOString(),
      content: 'Meeting KH: Chốt bỏ bớt 1 phòng ngủ tầng 2 để làm thông tầng. Yêu cầu update lại bản vẽ Concept.'
    });

    console.log('Bơm dữ liệu thành công!');
  }
}
