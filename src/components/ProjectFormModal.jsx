import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Check, Folder, Calendar, Layers, Building2, MapPin, User, Tag, Save } from 'lucide-react';
import { addProject, updateProject } from '../db/db';

const SCOPE_OPTIONS = ['Quy hoạch', 'Kiến trúc', 'Nội thất', 'Cảnh quan'];
const TYPE_OPTIONS = ['Thiết kế mới', 'Cải tạo', 'Mở rộng', 'Hoàn thiện nội thất'];
const STATUS_OPTIONS = [
  { value: 'Working', label: 'Đang thực hiện', color: 'var(--color-primary)' },
  { value: 'Completed', label: 'Đã hoàn thành', color: 'var(--color-success)' },
  { value: 'Paused', label: 'Tạm dừng', color: 'var(--color-warning)' }
];

export default function ProjectFormModal({ onClose, editProject = null }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dự án thiết kế');
  const [status, setStatus] = useState('Working');
  const [scopes, setScopes] = useState(['Kiến trúc']);
  const [projectType, setProjectType] = useState('Thiết kế mới');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
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
      setClient(editProject.client || '');
      setLocation(editProject.location || '');
      setStyle(editProject.style || '');
      setProjectIdCode(editProject.project_id_code || '');
      setLocalPath(editProject.local_path || editProject.Path || '');
      setImageUrl(editProject.image_url || '');
    } else {
      // Default dates
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
      scope: scopes,
      project_type: projectType,
      start_month: startMonth,
      end_month: endMonth,
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
        
        {/* Body - Scrollable Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ 
            padding: '1.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem',
            overflowY: 'auto',
            flex: 1,
            maxHeight: 'calc(90vh - 140px)'
          }}>
            
            {/* 1. Tên Dự án & Mã Dự án */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                  Tên Dự án *
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  className="glass-input" 
                  style={{ width: '100%', boxSizing: 'border-box', fontWeight: 'bold' }} 
                  placeholder="VD: Biệt thự vườn Huế..." 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                  Mã Dự án
                </label>
                <input 
                  type="text" 
                  value={projectIdCode} 
                  onChange={e => setProjectIdCode(e.target.value)} 
                  className="glass-input" 
                  style={{ width: '100%', boxSizing: 'border-box' }} 
                  placeholder="VD: 2026_001" 
                />
              </div>
            </div>

            {/* 2. Trạng thái dự án (Working / Completed / Paused) */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                Trạng thái dự án
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStatus(opt.value)}
                    style={{
                      padding: '0.55rem 0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease',
                      backgroundColor: status === opt.value ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-main)',
                      border: status === opt.value ? `1px solid ${opt.color}` : '1px solid var(--border-color)',
                      color: status === opt.value ? opt.color : 'var(--text-secondary)'
                    }}
                  >
                    {status === opt.value && <Check size={14} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Phạm vi (Multi-select) */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                <Layers size={15} /> Phạm vi (Có thể chọn nhiều mục)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {SCOPE_OPTIONS.map(option => {
                  const isSelected = scopes.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleScope(option)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: isSelected ? 'rgba(230, 185, 101, 0.2)' : 'rgba(255,255,255,0.04)',
                        border: isSelected ? '1px solid #e6b965' : '1px solid var(--border-color)',
                        color: isSelected ? '#e6b965' : 'var(--text-secondary)'
                      }}
                    >
                      {isSelected && <Check size={13} />}
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Loại hình */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                <Building2 size={15} /> Loại hình
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {TYPE_OPTIONS.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setProjectType(option)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease',
                      backgroundColor: projectType === option ? 'rgba(59, 130, 246, 0.18)' : 'var(--bg-main)',
                      border: projectType === option ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                      color: projectType === option ? 'var(--color-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    {projectType === option && <Check size={14} />}
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Thời gian (Tháng / Năm) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                  <Calendar size={15} /> Tháng bắt đầu
                </label>
                <input 
                  type="month" 
                  value={startMonth} 
                  onChange={e => setStartMonth(e.target.value)} 
                  className="glass-input" 
                  style={{ width: '100%', boxSizing: 'border-box' }} 
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                  <Calendar size={15} /> Tháng kết thúc
                </label>
                <input 
                  type="month" 
                  value={endMonth} 
                  onChange={e => setEndMonth(e.target.value)} 
                  className="glass-input" 
                  style={{ width: '100%', boxSizing: 'border-box' }} 
                />
              </div>
            </div>

            {/* 6. Chủ đầu tư & Địa điểm */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                  <User size={15} /> Chủ đầu tư
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
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                  <MapPin size={15} /> Địa điểm
                </label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  className="glass-input" 
                  style={{ width: '100%', boxSizing: 'border-box' }} 
                  placeholder="VD: TP. Huế, Bình Dương..." 
                />
              </div>
            </div>

            {/* 7. Phong cách kiến trúc */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                <Tag size={15} /> Phong cách kiến trúc
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

            {/* 8. Đường dẫn thư mục máy tính (Local Path) */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                <Folder size={15} /> Đường dẫn thư mục PC (Ổ cứng D:)
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

            {/* 9. Ảnh Bìa (Cover) */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                <ImageIcon size={15} /> Ảnh bìa đại diện (Thumbnail)
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="glass-input" 
                style={{ width: '100%', boxSizing: 'border-box', padding: '0.4rem' }} 
              />
              {imageUrl && (
                <div style={{ marginTop: '0.75rem', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative' }}>
                  <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                  <button 
                    type="button" 
                    onClick={() => setImageUrl('')} 
                    title="Xóa ảnh"
                    style={{ position: 'absolute', top: '0.35rem', right: '0.35rem', background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div style={{ 
            padding: '1rem 1.5rem', 
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
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                padding: 0
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'; }}
            >
              <X size={20} />
            </button>
            <button 
              type="submit" 
              className="btn-gold"
              title={editProject ? 'Lưu thay đổi' : 'Tạo dự án'}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                cursor: 'pointer',
                boxShadow: '0 0 14px rgba(230, 185, 101, 0.45)'
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
