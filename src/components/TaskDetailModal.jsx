import React, { useState } from 'react';
import { updateTask, deleteTask } from '../db/db';
import { X, Clock, Target, FileText, Bookmark, Link as LinkIcon, Edit2, Trash2 } from 'lucide-react';

export default function TaskDetailModal({ task, onClose }) {
  const [notes, setNotes] = useState(task.notes || '');
  const [corePurpose, setCorePurpose] = useState(task.core_purpose || '');
  const [resourceUrl, setResourceUrl] = useState(task.resource_url || '');

  const handleSave = async () => {
    await updateTask(task.id, { notes, core_purpose: corePurpose, resource_url: resourceUrl });
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      await deleteTask(task.id);
      onClose();
    }
  };

  const calculateTimeRemaining = (deadline) => {
    if (!deadline) return 'Không thời hạn';
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff < 0) return 'Đã quá hạn';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `Còn ${days} ngày`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `Còn ${hours} giờ`;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{task.title}</h2>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                {task.task_type === 'Habit' ? 'Thói quen' : 'Dự án'}
              </span>
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Phân loại Tag: {task.category_tag || task.category || 'Chưa phân loại'}</span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}><X size={24} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} color="var(--color-primary)" />
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Thời hạn:</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-warning)', fontWeight: 'bold' }}>{task.task_type === 'Habit' ? 'Không áp dụng' : calculateTimeRemaining(task.deadline)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={16} color="var(--color-success)" />
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Trạng thái:</span>
            <span style={{ fontSize: '0.875rem' }}>{task.status || 'To do'}</span>
          </div>
        </div>

        {/* Extra Metadata Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              <Bookmark size={14} /> Mục đích cốt lõi
            </label>
            <input type="text" value={corePurpose} onChange={e => setCorePurpose(e.target.value)} placeholder="VD: Lấy bằng IELTS" style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', fontSize: '0.875rem' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              <LinkIcon size={14} /> Link Tài liệu/Khóa học
            </label>
            <input type="url" value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} placeholder="https://..." style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', fontSize: '0.875rem' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
            <FileText size={16} /> Ghi chú / Nhật ký
          </label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Ghi chú thêm về công việc này..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <button onClick={handleDelete} style={{ padding: '0.5rem 1rem', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', background: 'transparent', border: 'none' }}>
            <Trash2 size={16} /> Xóa mục này
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={onClose} style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Đóng</button>
            <button onClick={handleSave} className="btn-gold">Lưu thay đổi</button>
          </div>
        </div>

      </div>
    </div>
  );
}
