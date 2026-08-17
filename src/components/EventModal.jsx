import React, { useState } from 'react';
import { X, Calendar, MapPin, User, Star, FileText, Activity } from 'lucide-react';
import { updateTask, addTask, useProjects } from '../db/db';

export default function EventModal({ event, defaultDate, onClose, onSave }) {
  const isNew = !event || !event.id;
  const projects = useProjects();
  const relaxProject = projects?.find(p => p.category === 'Giải trí');
  
  // States based on Event/Relax tab format
  const [title, setTitle] = useState(event?.title || '');
  
  // Formate datetime for datetime-local input
  let defaultDateTime = '';
  if (event?.deadline) {
    defaultDateTime = new Date(event.deadline).toISOString().slice(0, 16);
  } else if (defaultDate) {
    // defaultDate could be a Date object from Calendar
    const d = new Date(defaultDate);
    d.setHours(12, 0, 0, 0); // Default to noon
    defaultDateTime = d.toISOString().slice(0, 16);
  } else {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    defaultDateTime = d.toISOString().slice(0, 16);
  }
  
  const [deadline, setDeadline] = useState(defaultDateTime);
  const [partner, setPartner] = useState(event?.partner || '');
  const [location, setLocation] = useState(event?.location || '');
  const [priority, setPriority] = useState(event?.priority_star || 1);
  const [notes, setNotes] = useState(event?.notes || '');
  const [status, setStatus] = useState(event?.status || 'Sắp tới');

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tên sự kiện!');
      return;
    }
    
    const taskData = {
      title,
      deadline: new Date(deadline).toISOString(),
      partner,
      location,
      priority_star: priority,
      notes,
      status: status === 'Đã tham gia' ? 'Tham gia' : status, // normalize
      task_type: 'Entertainment', // Always mark as Entertainment
    };

    if (isNew) {
      taskData.status = taskData.status || 'Sắp tới';
      taskData.project_id = relaxProject?.id || null;
      await addTask(taskData);
    } else {
      await updateTask(event.id, taskData);
    }
    
    if (onSave) onSave();
    onClose();
  };

  const renderStars = () => {
    return (
      <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={24} 
            fill={star <= priority ? 'var(--color-warning)' : 'transparent'} 
            color={star <= priority ? 'var(--color-warning)' : 'var(--text-secondary)'} 
            onClick={() => setPriority(star)}
            style={{ transition: 'all 0.2s' }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.25rem', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(20, 25, 40, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 10,
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>
            {isNew ? 'Thêm Cuộc Hẹn Mới' : 'Chi Tiết Cuộc Hẹn'}
          </h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '50%',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Tên sự kiện</label>
            <input 
              type="text" 
              className="glass-input" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tên sự kiện..."
              autoFocus
              style={{ fontSize: '1.05rem', fontWeight: 'bold' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} /> Thời gian
              </label>
              <input 
                type="datetime-local" 
                className="glass-input" 
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={16} /> Trạng thái
              </label>
              <select 
                className="glass-input"
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{ 
                  color: (status === 'Tham gia' || status === 'Đã tham gia') ? 'var(--color-success)' : status === 'Lỡ hẹn' ? 'var(--color-danger)' : 'var(--color-warning)',
                  fontWeight: 'bold'
                }}
              >
                <option value="Sắp tới">Sắp tới</option>
                <option value="Tham gia">Tham gia</option>
                <option value="Lỡ hẹn">Lỡ hẹn</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={16} /> Đối tác
              </label>
              <input 
                type="text" 
                className="glass-input" 
                value={partner}
                onChange={e => setPartner(e.target.value)}
                placeholder="Tên người hẹn..."
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} /> Địa điểm
              </label>
              <input 
                type="text" 
                className="glass-input" 
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Địa chỉ..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={16} /> Mức độ ưu tiên
            </label>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', display: 'inline-flex' }}>
              {renderStars()}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} /> Ghi chú
            </label>
            <textarea 
              className="glass-input" 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ghi chú thêm..."
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

        </div>

        {/* Footer */}
        <div style={{ 
          padding: '1.25rem', 
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'rgba(20, 25, 40, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)'
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Hủy
          </button>
          <button 
            onClick={handleSave}
            className="btn-primary"
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Lưu Lại
          </button>
        </div>
      </div>
    </div>
  );
}
