import React, { useState } from 'react';
import { addTask, useProjects } from '../db/db';

export default function TaskForm({ onClose }) {
  const projects = useProjects() || [];
  
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [importance, setImportance] = useState(true);
  const [urgency, setUrgency] = useState(true);
  const [deadline, setDeadline] = useState('');

  // Auto-select first project when projects load
  React.useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !projectId) {
      alert('Vui lòng nhập tên công việc và chọn dự án!');
      return;
    }

    await addTask({
      title,
      priority,
      importance,
      urgency,
      project_id: Number(projectId),
      deadline: deadline ? new Date(deadline).toISOString() : null,
      status: 'To do'
    });
    
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ width: '95%', maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Thêm công việc mới</h2>
          <button onClick={onClose} style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Tên công việc *</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Lên kế hoạch tuần..."
              required
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Dự án *</label>
              <select 
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
                required
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Mức ưu tiên</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
              >
                <option value="High">Cao (High)</option>
                <option value="Medium">Trung bình (Medium)</option>
                <option value="Low">Thấp (Low)</option>
              </select>
            </div>
          </div>
            
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Hạn chót</label>
            <input 
              type="date" 
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Phân loại Ma trận Eisenhower</label>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={importance} onChange={(e) => setImportance(e.target.checked)} />
                Quan trọng (Important)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={urgency} onChange={(e) => setUrgency(e.target.checked)} />
                Khẩn cấp (Urgent)
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Hủy</button>
            <button type="submit" className="btn-gold">
              Thêm công việc
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
