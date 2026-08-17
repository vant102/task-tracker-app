import React, { useState } from 'react';
import { addTask, updateTask, deleteTask, useProjectTasks } from '../db/db';
import { Star, Trash2, Plus } from 'lucide-react';
import EventModal from './EventModal';

export default function EntertainmentDashboard({ projectId, project }) {
  const tasks = useProjectTasks(projectId) || [];
  const [showEventModal, setShowEventModal] = useState(false);

  const handleAddTask = () => {
    setShowEventModal(true);
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
      {/* Header */}
      <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Giải trí - Cuộc hẹn</h2>
        <button 
          className="btn-gold" 
          onClick={handleAddTask}
          title="Thêm sự kiện"
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

      <div className="card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        <div style={{ overflowX: 'auto', margin: '0 -1.25rem' }}>
          <table style={{ width: '100%', minWidth: '1250px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '90px' }} />
            <col style={{ width: '250px' }} />
            <col style={{ width: '160px' }} />
            <col style={{ width: '160px' }} />
            <col style={{ width: '120px' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '160px' }} />
            <col style={{ width: '60px' }} />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.5rem 0.5rem 0.5rem 1.25rem', position: 'sticky', left: 0, zIndex: 10, backgroundColor: 'rgba(20, 25, 40, 1)', borderRight: '1px solid var(--border-color)' }}>Sự kiện</th>
              <th style={{ padding: '1rem' }}>Thời gian</th>
              <th style={{ padding: '1rem' }}>Đối tác</th>
              <th style={{ padding: '1rem' }}>Địa điểm</th>
              <th style={{ padding: '1rem', width: '100px' }}>Ưu tiên</th>
              <th style={{ padding: '1rem' }}>Ghi chú</th>
              <th style={{ padding: '1rem', width: '160px' }}>Trạng thái</th>
              <th style={{ padding: '1rem', width: '60px', textAlign: 'center' }}>Xóa</th>
            </tr>
          </thead>
          <tbody>
            {tasks?.map(task => (
              <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-main)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '0.5rem 0.5rem 0.5rem 1.25rem', verticalAlign: 'top', position: 'sticky', left: 0, zIndex: 2, backgroundColor: 'rgba(20, 25, 40, 1)', borderRight: '1px solid var(--border-color)' }}>
                  <textarea defaultValue={task.title} onBlur={e => handleUpdate(task.id, 'title', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontWeight: '500', resize: 'none', overflow: 'hidden', minHeight: '3.2em', lineHeight: '1.5', padding: 0 }} />
                </td>
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <input type="datetime-local" defaultValue={task.deadline ? new Date(task.deadline).toISOString().slice(0,16) : ''} onChange={e => handleUpdate(task.id, 'deadline', new Date(e.target.value).toISOString())} style={{ width: '100%', boxSizing: 'border-box', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', outline: 'none', color: 'var(--text-secondary)', padding: '0.25rem', fontFamily: 'inherit' }} />
                </td>
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <textarea defaultValue={task.partner || ''} onBlur={e => handleUpdate(task.id, 'partner', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} placeholder="Tên người hẹn..." style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', resize: 'none', overflow: 'hidden', minHeight: '3.2em', lineHeight: '1.5' }} />
                </td>
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <textarea defaultValue={task.location || ''} onBlur={e => handleUpdate(task.id, 'location', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} placeholder="Địa chỉ..." style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', resize: 'none', overflow: 'hidden', minHeight: '3.2em', lineHeight: '1.5' }} />
                </td>
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  {renderStars(task.id, task.priority_star || 1)}
                </td>
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <textarea defaultValue={task.notes || ''} onBlur={e => handleUpdate(task.id, 'notes', e.target.value)} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} placeholder="Ghi chú thêm..." style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'var(--text-secondary)', resize: 'none', overflow: 'hidden', minHeight: '3.2em', lineHeight: '1.5' }} />
                </td>
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <select 
                    value={task.status === 'Đã tham gia' ? 'Tham gia' : (task.status || 'Sắp tới')} 
                    onChange={e => handleUpdate(task.id, 'status', e.target.value)}
                    style={{ 
                      width: '100%', padding: '0.4rem 0.5rem', borderRadius: '4px', outline: 'none', border: 'none', fontWeight: '500',
                      backgroundColor: (task.status === 'Tham gia' || task.status === 'Đã tham gia') ? 'rgba(16, 185, 129, 0.2)' : task.status === 'Lỡ hẹn' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: (task.status === 'Tham gia' || task.status === 'Đã tham gia') ? 'var(--color-success)' : task.status === 'Lỡ hẹn' ? 'var(--color-danger)' : 'var(--color-warning)',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="Sắp tới">Sắp tới</option>
                    <option value="Tham gia">Tham gia</option>
                    <option value="Lỡ hẹn">Lỡ hẹn</option>
                  </select>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'top' }}>
                  <button onClick={() => handleDelete(task.id)} style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-danger)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
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
      
      {showEventModal && (
        <EventModal 
          event={null}
          onClose={() => setShowEventModal(false)}
        />
      )}
    </div>
  );
}
