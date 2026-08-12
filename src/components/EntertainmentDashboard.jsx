import React, { useState } from 'react';
import { addTask, updateTask, deleteTask, useProjectTasks } from '../db/db';
import { Star, Trash2, Plus } from 'lucide-react';

export default function EntertainmentDashboard({ projectId, project }) {
  const tasks = useProjectTasks(projectId) || [];

  const handleAddTask = async () => {
    const title = window.prompt('Nhập tên sự kiện/cuộc hẹn:');
    if (!title) return;
    await addTask({
      title,
      project_id: projectId,
      task_type: 'Entertainment',
      status: 'Sắp tới',
      priority_star: 3,
      deadline: new Date().toISOString()
    });
  };

  const handleUpdate = async (id, field, value) => {
    await updateTask(id, { [field]: value });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      await deleteTask(id);
    }
  };

  const renderStars = (taskId, currentStars) => {
    return (
      <div style={{ display: 'flex', gap: '2px', cursor: 'pointer' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={16} 
            fill={star <= currentStars ? 'var(--color-warning)' : 'transparent'} 
            color={star <= currentStars ? 'var(--color-warning)' : 'var(--text-secondary)'} 
            onClick={() => handleUpdate(taskId, 'priority_star', star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Quản lý Giải trí & Cuộc hẹn</h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Theo dõi lịch trình cá nhân</span>
        </div>
        <button onClick={handleAddTask} className="btn-gold">
          <Plus size={16} /> Thêm việc
        </button>
      </div>

      <div className="card" style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem' }}>Tên sự kiện</th>
              <th style={{ padding: '1rem' }}>Thời gian</th>
              <th style={{ padding: '1rem' }}>Đối tác</th>
              <th style={{ padding: '1rem' }}>Địa điểm</th>
              <th style={{ padding: '1rem', width: '100px' }}>Ưu tiên</th>
              <th style={{ padding: '1rem' }}>Ghi chú</th>
              <th style={{ padding: '1rem', width: '140px' }}>Trạng thái</th>
              <th style={{ padding: '1rem', width: '60px', textAlign: 'center' }}>Xóa</th>
            </tr>
          </thead>
          <tbody>
            {tasks?.map(task => (
              <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-main)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <input type="text" defaultValue={task.title} onBlur={e => handleUpdate(task.id, 'title', e.target.value)} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontWeight: '500' }} />
                </td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <input type="datetime-local" defaultValue={task.deadline ? new Date(task.deadline).toISOString().slice(0,16) : ''} onChange={e => handleUpdate(task.id, 'deadline', new Date(e.target.value).toISOString())} style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none', color: 'var(--text-secondary)', padding: '0.25rem' }} />
                </td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <input type="text" defaultValue={task.partner || ''} onBlur={e => handleUpdate(task.id, 'partner', e.target.value)} placeholder="Tên người hẹn..." style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }} />
                </td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <input type="text" defaultValue={task.location || ''} onBlur={e => handleUpdate(task.id, 'location', e.target.value)} placeholder="Địa chỉ..." style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)' }} />
                </td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  {renderStars(task.id, task.priority_star || 1)}
                </td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <input type="text" defaultValue={task.notes || ''} onBlur={e => handleUpdate(task.id, 'notes', e.target.value)} placeholder="Ghi chú thêm..." style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'var(--text-secondary)' }} />
                </td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <select 
                    value={task.status || 'Sắp tới'} 
                    onChange={e => handleUpdate(task.id, 'status', e.target.value)}
                    style={{ 
                      width: '100%', padding: '0.25rem 0.5rem', borderRadius: '4px', outline: 'none', border: 'none', fontWeight: '500',
                      backgroundColor: task.status === 'Đã tham gia' ? 'rgba(16, 185, 129, 0.2)' : task.status === 'Lỡ hẹn' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: task.status === 'Đã tham gia' ? 'var(--color-success)' : task.status === 'Lỡ hẹn' ? 'var(--color-danger)' : 'var(--color-warning)'
                    }}
                  >
                    <option value="Sắp tới">Sắp tới</option>
                    <option value="Đã tham gia">Đã tham gia</option>
                    <option value="Lỡ hẹn">Lỡ hẹn</option>
                  </select>
                </td>
                <td style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                  <button onClick={() => handleDelete(task.id)} style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-danger)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {(!tasks || tasks.length === 0) && (
              <tr>
                <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có sự kiện giải trí nào. Bấm "Thêm sự kiện" để bắt đầu.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
