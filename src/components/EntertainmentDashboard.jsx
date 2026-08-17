import React, { useState } from 'react';
import { deleteTask, useProjectTasks } from '../db/db';
import { Star, Trash2, Plus, Edit2 } from 'lucide-react';
import EventModal from './EventModal';

export default function EntertainmentDashboard({ projectId, project }) {
  const tasks = useProjectTasks(projectId) || [];
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleAddTask = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedEvent(task);
    setShowEventModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      await deleteTask(id);
    }
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
              <col style={{ width: '180px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '220px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '60px' }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-main)' }}>Sự kiện</th>
                <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-main)' }}>Thời gian</th>
                <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-main)' }}>Đối tác</th>
                <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-main)' }}>Địa điểm</th>
                <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-main)' }}>Ưu tiên</th>
                <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-main)' }}>Ghi chú</th>
                <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-main)' }}>Trạng thái</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', backgroundColor: 'var(--bg-main)' }}>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {tasks?.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-main)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top' }}>
                    <div 
                      onClick={() => handleEditTask(task)}
                      style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '0.92rem', wordBreak: 'break-word', cursor: 'pointer', marginBottom: '0.4rem' }}
                      title="Click để chỉnh sửa"
                    >
                      {task.title}
                    </div>
                    <button 
                      onClick={() => handleEditTask(task)}
                      title="Chỉnh sửa chi tiết"
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
                  <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top' }}>
                    {task.deadline ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                          {new Date(task.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#e6b965', fontWeight: '600' }}>
                          {new Date(task.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ) : (
                      <span style={{ opacity: 0.4 }}>---</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top', fontSize: '0.85rem' }}>
                    {task.partner || <span style={{ opacity: 0.4 }}>---</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top', fontSize: '0.85rem' }}>
                    {task.location || <span style={{ opacity: 0.4 }}>---</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={15} 
                          fill={star <= (task.priority_star || 1) ? 'var(--color-warning)' : 'transparent'} 
                          color={star <= (task.priority_star || 1) ? 'var(--color-warning)' : 'var(--text-secondary)'} 
                        />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {task.notes || <span style={{ opacity: 0.4 }}>---</span>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', verticalAlign: 'top' }}>
                    <span 
                      className="badge-pill"
                      style={{
                        backgroundColor: (task.status === 'Tham gia' || task.status === 'Đã tham gia') ? 'rgba(16, 185, 129, 0.18)' : task.status === 'Lỡ hẹn' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(245, 158, 11, 0.18)',
                        color: (task.status === 'Tham gia' || task.status === 'Đã tham gia') ? 'var(--color-success)' : task.status === 'Lỡ hẹn' ? 'var(--color-danger)' : 'var(--color-warning)',
                        border: `1px solid ${(task.status === 'Tham gia' || task.status === 'Đã tham gia') ? 'rgba(16, 185, 129, 0.35)' : task.status === 'Lỡ hẹn' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`
                      }}
                    >
                      {task.status || 'Sắp tới'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', verticalAlign: 'top' }}>
                    <button onClick={() => handleDelete(task.id)} title="Xóa sự kiện" style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem' }} onMouseOver={e => e.currentTarget.style.color = 'var(--color-danger)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
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
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}
