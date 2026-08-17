import React, { useState } from 'react';
import { updateTask, addTask, useProjectTasks } from '../db/db';
import { ArrowLeft, CheckCircle, Target, Flame, Edit2, Plus } from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';

export default function PersonalProjectDetail({ projectId, project, onBack, hideBackBtn }) {
  const [selectedTask, setSelectedTask] = useState(null);
  
  const tasks = useProjectTasks(projectId) || [];

  const habits = tasks.filter(t => t.task_type === 'Habit');
  const miniProjects = tasks.filter(t => t.task_type === 'Project' || !t.task_type);

  // Helper function to handle daily habit check
  const handleHabitCheck = async (taskId, dateStr, currentLogs = []) => {
    let newLogs = [...currentLogs];
    if (newLogs.includes(dateStr)) {
      newLogs = newLogs.filter(d => d !== dateStr); // Uncheck
    } else {
      newLogs.push(dateStr); // Check
    }
    await updateTask(taskId, { habit_logs: newLogs });
  };

  // Get last 7 days array (format: 'YYYY-MM-DD')
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const handleUpdateProgress = async (taskId, newProgress, target) => {
    let status = 'Đang thực hiện';
    if (newProgress >= target) {
      status = 'Hoàn thành';
    }
    await updateTask(taskId, { current_progress: newProgress, status });
  };

  const handleAddHabit = async () => {
    const title = window.prompt('Nhập tên thói quen mới:');
    if (!title) return;
    const chiTiet = window.prompt('Chi tiết (VD: Đạp xe, Học bài...):') || '';
    const quyTac = window.prompt('Quy tắc (VD: 30p mỗi ngày, 5h sáng...):') || '';
    await addTask({
      title,
      project_id: projectId,
      task_type: 'Habit',
      chi_tiet: chiTiet,
      quy_tac: quyTac,
      category_tag: 'Chưa phân loại',
      frequency: 'Hàng ngày',
      habit_logs: []
    });
  };

  const handleAddProject = async () => {
    const title = window.prompt('Nhập tên mục tiêu/dự án mới:');
    if (!title) return;
    const targetStr = window.prompt('Tổng số bài/buổi:', '100');
    const target = parseInt(targetStr, 10) || 100;
    
    await addTask({
      title,
      project_id: projectId,
      task_type: 'Project',
      status: 'Chuẩn bị',
      target: target,
      lessons_log: [],
      start_date: '',
      end_date: '',
      chi_tiet: ''
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', padding: '0 1rem' }}>
      
      {/* Header */}
      <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Phát triển bản thân</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>    
        {/* Habit Tracker Section */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Flame size={20} color="var(--color-warning)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Mục tiêu lập lại (7 Ngày Qua)</h3>
            </div>
            <button className="btn-gold" onClick={handleAddHabit}>
              <Plus size={14} /> Thêm Thói quen
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
                  {/* Info columns */}
                  <th style={{ padding: '0.75rem', fontWeight: '500', minWidth: '140px' }}>Tên Thói quen</th>
                  <th style={{ padding: '0.75rem', fontWeight: '500', minWidth: '120px' }}>Chi tiết</th>
                  <th style={{ padding: '0.75rem', fontWeight: '500', minWidth: '130px', borderRight: '1px solid rgba(255,255,255,0.15)' }}>Quy tắc</th>
                  {/* 7 day columns */}
                  {last7Days.map((date, idx) => {
                    const d = new Date(date);
                    return (
                      <th key={date} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: '500', width: '70px' }}>
                        <div>{d.toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
                        <div>{d.getDate()}/{d.getMonth() + 1}</div>
                      </th>
                    );
                  })}
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '500', width: '60px' }}>Streak</th>
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => {
                  const logs = habit.habit_logs || [];
                  const streak = logs.length;
                  
                  return (
                    <tr key={habit.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {/* Info columns */}
                      <td
                        onClick={() => setSelectedTask(habit)}
                        style={{ padding: '0.75rem', fontWeight: '500', color: 'var(--text-primary)', cursor: 'pointer', minWidth: '140px' }}
                        title="Click để xem chi tiết"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {habit.title} <Edit2 size={11} color="var(--text-secondary)" />
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', minWidth: '120px' }}>
                        <div
                          onClick={() => setSelectedTask(habit)}
                          style={{ width: '100%', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', cursor: 'pointer' }}
                          title="Click để chỉnh sửa"
                        >
                          {habit.chi_tiet || <span style={{ opacity: 0.5 }}>Chưa có chi tiết...</span>}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', minWidth: '130px', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                        <div
                          onClick={() => setSelectedTask(habit)}
                          style={{ width: '100%', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', cursor: 'pointer' }}
                          title="Click để chỉnh sửa"
                        >
                          {habit.quy_tac || <span style={{ opacity: 0.5 }}>Chưa có quy tắc...</span>}
                        </div>
                      </td>
                      {/* 7 day checkboxes */}
                      {last7Days.map(date => {
                        const isChecked = logs.includes(date);
                        return (
                          <td key={date} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', width: '70px' }}>
                            <button
                              onClick={() => handleHabitCheck(habit.id, date, logs)}
                              style={{
                                width: '22px', height: '22px', borderRadius: '4px',
                                backgroundColor: isChecked ? 'var(--color-success)' : 'var(--bg-main)',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >
                              {isChecked && <CheckCircle size={13} color="white" />}
                            </button>
                          </td>
                        );
                      })}
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-warning)', width: '60px' }}>
                        {streak} 🔥
                      </td>
                    </tr>
                  );
                })}
                {habits.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Chưa có thói quen nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mini Projects Section */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Target size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Mục tiêu có thời hạn (Projects)</h3>
            </div>
            <button className="btn-gold" onClick={handleAddProject}>
              <Plus size={14} /> Thêm Mục tiêu
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem', fontWeight: '500', minWidth: '140px', whiteSpace: 'nowrap' }}>Tên mục tiêu</th>
                  <th style={{ padding: '0.75rem', fontWeight: '500', width: '50%', minWidth: '120px' }}>Chi tiết</th>
                  <th style={{ padding: '0.75rem', fontWeight: '500', width: '50%', minWidth: '120px' }}>Quy tắc</th>
                  <th style={{ padding: '0.75rem', fontWeight: '500', minWidth: '110px', whiteSpace: 'nowrap' }}>Trạng thái</th>
                  <th style={{ padding: '0.75rem', fontWeight: '500', minWidth: '110px', whiteSpace: 'nowrap' }}>Kế hoạch</th>
                  <th style={{ padding: '0.75rem', fontWeight: '500', textAlign: 'center', width: '70px', whiteSpace: 'nowrap' }}>Tới phần</th>
                  <th style={{ padding: '0.75rem', fontWeight: '500', textAlign: 'center', width: '70px', whiteSpace: 'nowrap' }}>Tổng số</th>
                  <th style={{ padding: '0.75rem', fontWeight: '500', textAlign: 'center', width: '70px', whiteSpace: 'nowrap' }}>Tiến độ</th>
                </tr>
              </thead>
              <tbody>
                {miniProjects.map(task => {
                  const completedCount = task.lessons_log && task.lessons_log.length > 0 
                    ? Math.max(...task.lessons_log.map(l => l.lesson_number)) 
                    : 0;
                  const target = task.target || 1;
                  const percent = Math.min(100, Math.round((completedCount / target) * 100));
                  const isLocked = task.status === 'Chuẩn bị' || task.status === 'Đã hoàn thành' || task.status === 'Hoàn thành';

                  return (
                    <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td
                        onClick={() => setSelectedTask(task)}
                        style={{ padding: '0.75rem', fontWeight: '500', color: 'var(--text-primary)', cursor: 'pointer' }}
                        title="Click để xem chi tiết"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {task.title} <Edit2 size={11} color="var(--text-secondary)" />
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div
                          onClick={() => setSelectedTask(task)}
                          style={{ width: '100%', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', cursor: 'pointer' }}
                          title="Click để chỉnh sửa"
                        >
                          {task.chi_tiet || <span style={{ opacity: 0.5 }}>Chưa có chi tiết...</span>}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                        <div
                          onClick={() => setSelectedTask(task)}
                          style={{ width: '100%', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', cursor: 'pointer' }}
                          title="Click để chỉnh sửa"
                        >
                          {task.quy_tac || <span style={{ opacity: 0.5 }}>Chưa có quy tắc...</span>}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <select 
                          value={task.status || 'Chuẩn bị'}
                          onChange={(e) => updateTask(task.id, { status: e.target.value })}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                          <option value="Chuẩn bị">Chuẩn bị</option>
                          <option value="Đang thực hiện">Đang thực hiện</option>
                          <option value="Đã hoàn thành">Đã hoàn thành</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.5rem', backgroundColor: isLocked ? 'var(--bg-main)' : 'transparent' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <input 
                            type="date" 
                            value={task.start_date || ''}
                            disabled={isLocked}
                            onChange={(e) => updateTask(task.id, { start_date: e.target.value })}
                            style={{ padding: '0.2rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: isLocked ? 'rgba(255,255,255,0.05)' : 'transparent', color: isLocked ? 'var(--text-secondary)' : 'var(--text-primary)', outline: 'none' }}
                          />
                          <input 
                            type="date" 
                            value={task.end_date || ''}
                            disabled={isLocked}
                            onChange={(e) => updateTask(task.id, { end_date: e.target.value })}
                            style={{ padding: '0.2rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: isLocked ? 'rgba(255,255,255,0.05)' : 'transparent', color: isLocked ? 'var(--text-secondary)' : 'var(--text-primary)', outline: 'none' }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
                        <span onClick={() => setSelectedTask(task)} style={{ cursor: 'pointer', color: 'var(--color-primary)' }} title="Nhấp để thêm nhật ký">
                          {completedCount}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <input 
                          type="number" 
                          defaultValue={task.target || 0}
                          onBlur={(e) => updateTask(task.id, { target: parseInt(e.target.value, 10) || 1 })}
                          style={{ width: '50px', padding: '0.25rem', textAlign: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: percent === 100 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {percent}%
                      </td>
                    </tr>
                  );
                })}
                {miniProjects.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Chưa có mục tiêu nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>

      </div>

      </div>

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
