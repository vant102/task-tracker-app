import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Check, Folder, Calendar, Layers, Building2, MapPin, User, Tag, Save, Activity } from 'lucide-react';
import { addProject, updateProject } from '../db/db';

const SCOPE_OPTIONS = ['Quy hoạch', 'Kiến trúc', 'Nội thất', 'Cảnh quan'];
const TYPE_OPTIONS = ['Thiết kế mới', 'Cải tạo', 'Mở rộng', 'Hoàn thiện nội thất'];
const STATUS_OPTIONS = [
  { value: 'Working', label: 'Đang thực hiện (Working)', color: '#3b82f6' },
  { value: 'Completed', label: 'Đã hoàn thành (Completed)', color: '#10b981' },
  { value: 'Paused', label: 'Tạm dừng (Paused)', color: '#f59e0b' }
];

export default function ProjectFormModal({ onClose, editProject = null }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dự án thiết kế');
  const [status, setStatus] = useState('Working');
  const [scopes, setScopes] = useState(['Kiến trúc']);
  const [projectType, setProjectType] = useState('Thiết kế mới');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [phaseDeadline, setPhaseDeadline] = useState('');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [style, setStyle] = useState('');
  const [projectIdCode, setProjectIdCode] = useState('');
  const [localPath, setLocalPath] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (editProject) {
      setName(editProject.name || '');
      setCategory(editProject.category || 'Dự án thiết kế');
      setStatus(editProject.status || (editProject.completed ? 'Completed' : 'Working'));
      setScopes(Array.isArray(editProject.scope) ? editProject.scope : (editProject.scope ? [editProject.scope] : ['Kiến trúc']));
      setProjectType(editProject.project_type || 'Thiết kế mới');
      setStartMonth(editProject.start_month || '');
      setEndMonth(editProject.end_month || '');
      setPhaseDeadline(editProject.phase_deadline ? editProject.phase_deadline.slice(0, 10) : '');
      setClient(editProject.client || '');
      setLocation(editProject.location || '');
      setStyle(editProject.style || '');
      setProjectIdCode(editProject.project_id_code || '');
      setLocalPath(editProject.local_path || editProject.Path || '');
      setImageUrl(editProject.image_url || '');
    } else {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setStartMonth(currentMonth);
    }
  }, [editProject]);

  const toggleScope = (option) => {
    if (scopes.includes(option)) {
      if (scopes.length > 1) {
        setScopes(scopes.filter(s => s !== option));
      }
    } else {
      setScopes([...scopes, option]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert("Kích thước ảnh quá lớn (vượt quá 800KB). Vui lòng chọn ảnh nhỏ hơn để lưu trên Cloud.");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Vui lòng nhập tên dự án!");
      return;
    }

    const data = {
      name,
      category,
      status,
      completed: status === 'Completed',
      scope: scopes,
      project_type: projectType,
      start_month: startMonth,
      end_month: endMonth,
      phase_deadline: phaseDeadline || null,
      client,
      location,
      style,
      project_id_code: projectIdCode,
      local_path: localPath,
      image_url: imageUrl,
      color: 'var(--color-primary)',
      updatedAt: new Date().toISOString()
    };

    try {
      if (editProject) {
        await updateProject(editProject.id, data);
      } else {
        await addProject(data);
      }
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu dự án:", error);
      alert("Đã xảy ra lỗi khi lưu dự án: " + error.message);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      backgroundColor: 'rgba(0,0,0,0.75)', 
      backdropFilter: 'blur(8px)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div className="card glass-panel" style={{ 
        width: '100%', 
        maxWidth: '560px', 
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        padding: 0,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(20, 25, 40, 0.95)',
          backdropFilter: 'blur(10px)',
          flexShrink: 0
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>
            {editProject ? 'Chỉnh Sửa Dự Án' : 'Tạo Dự Án Mới'}
          </h2>
          <button 
            type="button"
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
        
        {/* Body - 1 Row Per Menu Full Width with Scroll */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ 
            padding: '1.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.35rem',
            overflowY: 'auto',
            flex: 1,
            maxHeight: 'calc(90vh - 140px)'
          }}>
            
            {/* 1. Tên Dự án (1 hàng riêng) */}
            <div className="form-group-row">
              <label style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                Tên Dự án *
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                className="glass-input" 
                style={{ width: '100%', boxSizing: 'border-box', fontWeight: 'bold', fontSize: '1.05rem' }} 
                placeholder="Nhập tên dự án..." 
                autoFocus
              />
            </div>

            {/* 2. Mã Dự án (1 hàng riêng) */}
            <div className="form-group-row">
              <label style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                Mã Dự án (ID)
              </label>
              <input 
                type="text" 
                value={projectIdCode} 
                onChange={e => setProjectIdCode(e.target.value)} 
                className="glass-input" 
                style={{ width: '100%', boxSizing: 'border-box' }} 
                placeholder="VD: 2026_001, 2025_002..." 
              />
            </div>

            {/* 3. Trạng thái dự án (1 hàng riêng, mỗi lựa chọn 1 hàng) */}
            <div className="form-group-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                <Activity size={16} /> Trạng thái dự án
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {STATUS_OPTIONS.map(opt => {
                  const isSelected = status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      style={{
                        padding: '0.65rem 0.9rem',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                        backgroundColor: isSelected ? 'rgba(15, 23, 42, 0.9)' : 'var(--bg-main)',
                        border: isSelected ? `2px solid ${opt.color}` : '1px solid var(--border-color)',
                        color: isSelected ? opt.color : 'var(--text-secondary)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          backgroundColor: opt.color,
                          display: 'inline-block' 
                        }} />
                        {opt.label}
                      </div>
                      {isSelected && <Check size={16} color={opt.color} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Phạm vi (1 hàng riêng, mỗi lựa chọn 1 hàng riêng biệt) */}
            <div className="form-group-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                <Layers size={16} /> Phạm vi (Có thể chọn nhiều mục)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {SCOPE_OPTIONS.map(option => {
                  const isSelected = scopes.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleScope(option)}
                      style={{
                        padding: '0.65rem 0.9rem',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                        backgroundColor: isSelected ? 'rgba(230, 185, 101, 0.15)' : 'var(--bg-main)',
                        border: isSelected ? '2px solid #e6b965' : '1px solid var(--border-color)',
                        color: isSelected ? '#e6b965' : 'var(--text-secondary)'
                      }}
                    >
                      <span>{option}</span>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: isSelected ? '1px solid #e6b965' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? '#e6b965' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isSelected && <Check size={14} color="#0f172a" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Loại hình (1 hàng riêng, mỗi lựa chọn 1 hàng riêng biệt) */}
            <div className="form-group-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                <Building2 size={16} /> Loại hình
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {TYPE_OPTIONS.map(option => {
                  const isSelected = projectType === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setProjectType(option)}
                      style={{
                        padding: '0.65rem 0.9rem',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.18)' : 'var(--bg-main)',
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                        color: isSelected ? 'var(--color-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      <span>{option}</span>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Tháng bắt đầu (1 hàng riêng) */}
            <div className="form-group-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                <Calendar size={16} /> Tháng bắt đầu (Tháng/Năm)
              </label>
              <input 
                type="month" 
                value={startMonth} 
                onChange={e => setStartMonth(e.target.value)} 
                className="glass-input" 
                style={{ width: '100%', boxSizing: 'border-box' }} 
              />
            </div>

            {/* 7. Tháng kết thúc (1 hàng riêng) */}
            <div className="form-group-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                <Calendar size={16} /> Tháng kết thúc (Tháng/Năm)
              </label>
              <input 
                type="month" 
                value={endMonth} 
                onChange={e => setEndMonth(e.target.value)} 
                className="glass-input" 
                style={{ width: '100%', boxSizing: 'border-box' }} 
              />
            </div>

            {/* 8. Chốt giai đoạn (1 hàng riêng - Dành cho dự án đang thực hiện) */}
            <div className="form-group-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                <Calendar size={16} /> Chốt giai đoạn (Hạn chót ngày/tháng/năm)
              </label>
              <input 
                type="date" 
                value={phaseDeadline} 
                onChange={e => setPhaseDeadline(e.target.value)} 
                className="glass-input" 
                style={{ width: '100%', boxSizing: 'border-box' }} 
              />
            </div>

            {/* 9. Chủ đầu tư (1 hàng riêng) */}
            <div className="form-group-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                <User size={16} /> Tên chủ đầu tư
              </label>
              <input 
                type="text" 
                value={client} 
                onChange={e => setClient(e.target.value)} 
                className="glass-input" 
                style={{ width: '100%', boxSizing: 'border-box' }} 
                placeholder="VD: Anh Vượng, Bác Ba..." 
              />
            </div>

            {/* 10. Địa điểm (1 hàng riêng) */}
            <div className="form-group-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                <MapPin size={16} /> Địa điểm công trình
              </label>
              <input 
                type="text" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                className="glass-input" 
                style={{ width: '100%', boxSizing: 'border-box' }} 
                placeholder="VD: TP. Huế, Bình Dương, Đà Nẵng..." 
              />
            </div>

            {/* 11. Phong cách kiến trúc (1 hàng riêng) */}
            <div className="form-group-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                <Tag size={16} /> Phong cách kiến trúc
              </label>
              <input 
                type="text" 
                value={style} 
                onChange={e => setStyle(e.target.value)} 
                className="glass-input" 
                style={{ width: '100%', boxSizing: 'border-box' }} 
                placeholder="VD: Hiện đại, Tân cổ điển, Indochine, Tối giản..." 
              />
            </div>

            {/* 12. Đường dẫn thư mục PC (1 hàng riêng) */}
            <div className="form-group-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                <Folder size={16} /> Đường dẫn thư mục máy tính (Ổ cứng D:)
              </label>
              <input 
                type="text" 
                value={localPath} 
                onChange={e => setLocalPath(e.target.value)} 
                className="glass-input" 
                style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '0.82rem' }} 
                placeholder="VD: D:\Working\2026\2026-01_ nha Ngoai" 
              />
            </div>

            {/* 13. Ảnh Bìa Thumbnail (1 hàng riêng) */}
            <div className="form-group-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
                <ImageIcon size={16} /> Ảnh bìa đại diện (Thumbnail)
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="glass-input" 
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.4rem' }} 
              />
              {imageUrl && (
                <div style={{ marginTop: '0.75rem', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative' }}>
                  <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                  <button 
                    type="button" 
                    onClick={() => setImageUrl('')} 
                    title="Xóa ảnh"
                    style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'rgba(0,0,0,0.65)', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Footer - Circular Red Cancel / Gold Save buttons */}
          <div style={{ 
            padding: '1.1rem 1.5rem', 
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '1.25rem',
            backgroundColor: 'rgba(20, 25, 40, 0.95)',
            backdropFilter: 'blur(10px)',
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
              type="submit" 
              className="btn-gold"
              title={editProject ? 'Lưu thay đổi' : 'Tạo dự án'}
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
        </form>
      </div>
    </div>
  );
}
