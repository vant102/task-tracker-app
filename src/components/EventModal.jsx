import React, { useState } from 'react';
import { X, Calendar, MapPin, User, Star, FileText, Activity, Save } from 'lucide-react';
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
      alert('Vui lòng nhập tên sự kiện');
      return;
    }

    try {
      const taskData = {
        title,
        deadline: new Date(deadline).toISOString(),
        partner,
        location,
        priority_star: priority,
        notes,
        status: status === 'Đã tham gia' ? 'Tham gia' : status,
        updatedAt: new Date().toISOString()
      };

      if (isNew) {
        // If adding from Calendar or Relax tab directly
        const targetProjectId = event?.project_id || relaxProject?.id || 'relax_default';
        await addTask({
          ...taskData,
          project_id: targetProjectId,
          completed: status === 'Tham gia' || status === 'Đã tham gia',
          stage: 'default'
        });
      } else {
        await updateTask(event.id, {
          ...taskData,
          completed: status === 'Tham gia' || status === 'Đã tham gia'
        });
      }

      if (onSave) onSave();
      onClose();
    } catch (err) {
      console.error('Error saving event:', err);
      alert('Đã xảy ra lỗi khi lưu sự kiện: ' + err.message);
    }
  };

  const renderStars = () => {
    return (
      <div style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={20} 
            fill={star <= priority ? 'var(--color-warning)' : 'transparent'} 
            color={star <= priority ? 'var(--color-warning)' : 'var(--text-secondary)'} 
            onClick={() => setPriority(star)}
            style={{ transition: 'transform 0.1s' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div className="modal-content glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.25rem', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(20, 25, 40, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 10,
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          flexShrink: 0
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>
            {isNew ? 'Thêm Cuộc Hẹn Mới' : 'Chi Tiết Cuộc Hẹn'}
          </h2>
          <button 
            onClick={onClose}
            title="Đóng"
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

        {/* Body - Scrollable Container */}
        <div style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.25rem',
          overflowY: 'auto',
          flex: 1,
          maxHeight: 'calc(90vh - 140px)'
        }}>
          
          {/* 1. Tên sự kiện */}
          <div className="event-modal-field">
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Tên sự kiện</label>
            <input 
              type="text" 
              className="glass-input" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tên sự kiện..."
              autoFocus
              style={{ fontSize: '1.05rem', fontWeight: 'bold', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* 2. Thời gian */}
          <div className="event-modal-field">
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} /> Thời gian
            </label>
            <input 
              type="datetime-local" 
              className="glass-input" 
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* 3. Trạng thái */}
          <div className="event-modal-field">
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={16} /> Trạng thái
            </label>
            <select 
              className="glass-input"
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ 
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: '#0f172a',
                color: (status === 'Tham gia' || status === 'Đã tham gia') ? 'var(--color-success)' : status === 'Lỡ hẹn' ? 'var(--color-danger)' : 'var(--color-warning)',
                fontWeight: 'bold'
              }}
            >
              <option value="Sắp tới" style={{ backgroundColor: '#0f172a', color: 'var(--color-warning)' }}>Sắp tới</option>
              <option value="Tham gia" style={{ backgroundColor: '#0f172a', color: 'var(--color-success)' }}>Tham gia</option>
              <option value="Lỡ hẹn" style={{ backgroundColor: '#0f172a', color: 'var(--color-danger)' }}>Lỡ hẹn</option>
            </select>
          </div>

          {/* 4. Đối tác */}
          <div className="event-modal-field">
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={16} /> Đối tác
            </label>
            <input 
              type="text" 
              className="glass-input" 
              value={partner}
              onChange={e => setPartner(e.target.value)}
              placeholder="Tên người hẹn..."
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* 5. Địa điểm */}
          <div className="event-modal-field">
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} /> Địa điểm
            </label>
            <input 
              type="text" 
              className="glass-input" 
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Địa chỉ..."
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {/* 6. Mức độ ưu tiên */}
          <div className="event-modal-field">
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={16} /> Mức độ ưu tiên
            </label>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', height: '44px', width: '100%', boxSizing: 'border-box' }}>
              {renderStars()}
            </div>
          </div>

          {/* 7. Ghi chú */}
          <div className="event-modal-field">
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} /> Ghi chú
            </label>
            <textarea 
              className="glass-input" 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ghi chú thêm..."
              rows={3}
              style={{ resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

        </div>

        {/* Footer - Circular Icon Buttons */}
        <div style={{ 
          padding: '1.1rem 1.5rem', 
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '1.25rem',
          backgroundColor: 'rgba(20, 25, 40, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          flexShrink: 0
        }}>
          <button 
            type="button"
            onClick={onClose}
            title="Hủy"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: 'var(--color-danger)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              padding: 0,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={20} />
          </button>
          <button 
            type="button"
            onClick={handleSave}
            title="Lưu lại"
            className="btn-gold"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 14px rgba(230, 185, 101, 0.45)'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Save size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
