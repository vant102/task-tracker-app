import React, { useState } from 'react';
import { updateTask, addTask, useProjectTasks } from '../db/db';
import { ArrowLeft, CheckCircle, Target, Flame, Edit2, Plus, Clock, Play } from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';

export default function PersonalProjectDetail({ projectId, project, onBack, hideBackBtn }) {
  const [selectedTask, setSelectedTask] = useState(null);
  
  const tasks = useProjectTasks(projectId) || [];

  const habits = tasks.filter(t => t.task_type === 'Habit');
  const miniProjects = tasks.filter(t => t.task_type === 'Project' || !t.task_type);

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'Chuẩn bị':
      case 'To do':
        return <Clock size={18} color="var(--color-warning)" title="Chuẩn bị" />;
      case 'Đang thực hiện':
      case 'Doing':
        return <Play size={18} color="var(--color-primary)" title="Đang thực hiện" />;
      case 'Đã hoàn thành':
      case 'Hoàn thành':
      case 'Done':
        return <CheckCircle size={18} color="var(--color-success)" title="Đã hoàn thành" />;
      default:
        return <Clock size={18} color="var(--color-warning)" title="Chuẩn bị" />;
    }
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', minWidth: 0, width: '100%' }}>
      
      {/* Header */}
      <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Phát triển bản thân</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', minWidth: 0, width: '100%' }}>    
        {/* Habit Tracker Section */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Flame size={20} color="var(--color-warning)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Mục tiêu lập lại</h3>
            </div>
            <button 
              className="btn-gold" 
              onClick={handleAddHabit}
              title="Thêm Thói quen"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                flexShrink: 0
              }}
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div style={{ overflowX: 'auto', margin: '0 -1.25rem' }}>
            <table className="skills-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
              <colgroup>
                <col className="col-name" />
                <col className="col-detail" />
                <col className="col-rule" />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  {/* Info columns */}
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '600', backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>Thói quen</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500', backgroundColor: 'var(--bg-main)' }}>Chi tiết</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500', backgroundColor: 'var(--bg-main)', borderRight: '1px solid rgba(255,255,255,0.15)' }}>Quy tắc</th>
                  {/* 7 day columns */}
                  {last7Days.map((date) => {
                    const d = new Date(date);
                    return (
                      <th key={date} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: '500', backgroundColor: 'var(--bg-main)' }}>
                        <div>{d.toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
                        <div>{d.getDate()}/{d.getMonth() + 1}</div>
                      </th>
                    );
                  })}
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '500', backgroundColor: 'var(--bg-main)' }}>Streak</th>
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => {
                  const logs = habit.habit_logs || [];
                  const streak = logs.length;
                  
                  return (
                    <tr key={habit.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-main)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      {/* Info columns */}
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '0.92rem', wordBreak: 'break-word', whiteSpace: 'pre-wrap', marginBottom: '0.4rem' }}>
                          {habit.title}
                        </div>
                        <button 
                          type="button"
                          onClick={() => setSelectedTask(habit)}
                          title="Chỉnh sửa thói quen"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#e6b965',
                            background: 'linear-gradient(135deg, rgba(230, 185, 101, 0.18) 0%, rgba(178, 142, 65, 0.28) 100%)',
                            border: '1px solid rgba(230, 185, 101, 0.45)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            padding: 0
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(230, 185, 101, 0.35) 0%, rgba(178, 142, 65, 0.45) 100%)';
                            e.currentTarget.style.transform = 'scale(1.08)';
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(230, 185, 101, 0.18) 0%, rgba(178, 142, 65, 0.28) 100%)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Edit2 size={13} strokeWidth={2.2} />
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {habit.chi_tiet || <span style={{ opacity: 0.4 }}>Chưa có chi tiết...</span>}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                        {habit.quy_tac || <span style={{ opacity: 0.4 }}>Chưa có quy tắc...</span>}
                      </td>
                      {/* 7 day checkboxes */}
                      {last7Days.map(date => {
                        const isChecked = logs.includes(date);
                        return (
                          <td key={date} style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <button
                              onClick={() => handleHabitCheck(habit.id, date, logs)}
                              style={{
                                width: '22px', height: '22px', borderRadius: '4px',
                                backgroundColor: isChecked ? 'var(--color-success)' : 'var(--bg-main)',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                border: 'none', cursor: 'pointer'
                              }}
                            >
                              {isChecked && <CheckCircle size={13} color="white" />}
                            </button>
                          </td>
                        );
                      })}
                      <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-warning)' }}>
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
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Target size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Mục tiêu có thời hạn</h3>
            </div>
            <button 
              className="btn-gold" 
              onClick={handleAddProject}
              title="Thêm Mục tiêu mới"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                flexShrink: 0
              }}
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div style={{ overflowX: 'auto', margin: '0 -1.25rem' }}>
            <table className="skills-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
              <colgroup>
                <col className="col-name" />
                <col className="col-detail" />
                <col className="col-rule" />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '600', backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>Mục tiêu</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500', backgroundColor: 'var(--bg-main)' }}>Chi tiết</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500', backgroundColor: 'var(--bg-main)', borderRight: '1px solid rgba(255,255,255,0.15)' }}>Quy tắc</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500', backgroundColor: 'var(--bg-main)', textAlign: 'center', whiteSpace: 'nowrap' }}>Trạng thái</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500', backgroundColor: 'var(--bg-main)', whiteSpace: 'nowrap' }}>Kế hoạch</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500', backgroundColor: 'var(--bg-main)', textAlign: 'center', whiteSpace: 'nowrap' }}>Tới phần</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500', backgroundColor: 'var(--bg-main)', textAlign: 'center', whiteSpace: 'nowrap' }}>Tổng số</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '500', backgroundColor: 'var(--bg-main)', textAlign: 'center', whiteSpace: 'nowrap' }}>Tiến độ</th>
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
                    <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-main)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '0.92rem', wordBreak: 'break-word', whiteSpace: 'pre-wrap', marginBottom: '0.4rem' }}>
                          {task.title}
                        </div>
                        <button 
                          type="button"
                          onClick={() => setSelectedTask(task)}
                          title="Chỉnh sửa mục tiêu"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#e6b965',
                            background: 'linear-gradient(135deg, rgba(230, 185, 101, 0.18) 0%, rgba(178, 142, 65, 0.28) 100%)',
                            border: '1px solid rgba(230, 185, 101, 0.45)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            padding: 0
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(230, 185, 101, 0.35) 0%, rgba(178, 142, 65, 0.45) 100%)';
                            e.currentTarget.style.transform = 'scale(1.08)';
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(230, 185, 101, 0.18) 0%, rgba(178, 142, 65, 0.28) 100%)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <Edit2 size={13} strokeWidth={2.2} />
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                        {task.chi_tiet || <span style={{ opacity: 0.4 }}>Chưa có chi tiết...</span>}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                        {task.quy_tac || <span style={{ opacity: 0.4 }}>Chưa có quy tắc...</span>}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title={`Trạng thái: ${task.status || 'Chuẩn bị'}`}>
                          {renderStatusIcon(task.status)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', backgroundColor: isLocked ? 'var(--bg-main)' : 'transparent' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: isLocked ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                          <span>{task.start_date ? new Date(task.start_date).toLocaleDateString('vi-VN') : '---'}</span>
                          <span>{task.end_date ? new Date(task.end_date).toLocaleDateString('vi-VN') : '---'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        {completedCount}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                        {task.target || 1}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 'bold', color: percent === 100 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {percent}%
                      </td>
                    </tr>
                  );
                })}
                {miniProjects.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
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
