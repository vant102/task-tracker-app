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
    await addTask({
      title,
      project_id: projectId,
      task_type: 'Habit',
      category_tag: 'Chưa phân loại',
      frequency: 'Hàng ngày',
      habit_logs: []
    });
  };

  const handleAddProject = async () => {
    const title = window.prompt('Nhập tên mục tiêu/dự án mới:');
    if (!title) return;
    await addTask({
      title,
      project_id: projectId,
      task_type: 'Project',
      status: 'Đang thực hiện',
      target: 100,
      current_progress: 0,
      unit: '%'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', padding: '0 1rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        {!hideBackBtn && (
          <button onClick={onBack} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{project.name}</h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Danh mục: {project.category}</span>
        </div>
      </div>

        <div className="responsive-grid-half">    
        {/* Habit Tracker Section */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Flame size={20} color="var(--color-warning)" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Habit Tracker (7 Ngày Qua)</h3>
            </div>
            <button className="btn-gold" onClick={handleAddHabit}>
              <Plus size={14} /> Thêm Thói quen
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem', fontWeight: '500' }}>Tên Thói quen</th>
                  {last7Days.map(date => {
                    const d = new Date(date);
                    return (
                      <th key={date} style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '500' }}>
                        <div>{d.toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
                        <div>{d.getDate()}/{d.getMonth() + 1}</div>
                      </th>
                    );
                  })}
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: '500' }}>Streak</th>
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => {
                  const logs = habit.habit_logs || [];
                  const streak = logs.length;
                  
                  return (
                    <tr key={habit.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td 
                        onClick={() => setSelectedTask(habit)}
                        style={{ padding: '1rem 0.75rem', fontWeight: '500', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        title="Click để xem chi tiết"
                      >
                        {habit.title} <Edit2 size={12} color="var(--text-secondary)" />
                      </td>
                      {last7Days.map(date => {
                        const isChecked = logs.includes(date);
                        return (
                          <td key={date} style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleHabitCheck(habit.id, date, logs)}
                              style={{ 
                                width: '24px', height: '24px', borderRadius: '4px',
                                backgroundColor: isChecked ? 'var(--color-success)' : 'var(--bg-main)',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >
                              {isChecked && <CheckCircle size={14} color="white" />}
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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {miniProjects.map(task => {
              const current = task.current_progress || 0;
              const target = task.target || 100;
              const unit = task.unit || '%';
              const percent = Math.min(100, Math.round((current / target) * 100));
              const isDone = task.status === 'Hoàn thành';

              return (
                <div key={task.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 
                        onClick={() => setSelectedTask(task)} 
                        style={{ fontWeight: 'bold', fontSize: '1.125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)' }}
                      >
                        {task.title} <Edit2 size={14} color="var(--text-secondary)" />
                      </h4>
                      {task.category_tag && <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', backgroundColor: 'var(--bg-main)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem', display: 'inline-block' }}>{task.category_tag}</span>}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        defaultValue={current}
                        id={`progress-${task.id}`}
                        style={{ width: '60px', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>/ {target} {unit}</span>
                      <button 
                        className="btn-gold"
                        onClick={() => {
                          const val = parseInt(document.getElementById(`progress-${task.id}`).value) || 0;
                          handleUpdateProgress(task.id, val, target);
                        }}
                      >
                        Cập nhật
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: isDone ? 'var(--color-success)' : 'var(--color-primary)', transition: 'width 0.3s ease' }}></div>
                  </div>
                </div>
              );
            })}
            {miniProjects.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Chưa có mục tiêu nào.
              </div>
            )}
          </div>
        </div>

      </div>

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
