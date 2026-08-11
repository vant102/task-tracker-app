import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { addProject, updateProject } from '../db/db';

export default function ProjectFormModal({ onClose, editProject = null }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dự án thiết kế');
  const [imageUrl, setImageUrl] = useState('');
  const [client, setClient] = useState('');
  const [projectIdCode, setProjectIdCode] = useState('');

  useEffect(() => {
    if (editProject) {
      setName(editProject.name || '');
      setCategory(editProject.category || 'Dự án thiết kế');
      setImageUrl(editProject.image_url || '');
      setClient(editProject.client || '');
      setProjectIdCode(editProject.project_id_code || '');
    }
  }, [editProject]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data = {
      name,
      category,
      image_url: imageUrl,
      client,
      project_id_code: projectIdCode,
      color: 'var(--color-primary)'
    };

    if (editProject) {
      await updateProject(editProject.id, data);
    } else {
      await addProject(data);
    }
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '95%', maxWidth: '500px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-secondary)' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'white' }}>
          {editProject ? 'Chỉnh sửa Dự án' : 'Tạo Dự án mới'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tên Dự án *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="glass-input" style={{ width: '100%' }} placeholder="Nhập tên dự án..." />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Phân loại</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="glass-input" style={{ width: '100%' }}>
              <option value="Dự án thiết kế">Dự án thiết kế</option>
              <option value="Phát triển bản thân">Phát triển bản thân</option>
              <option value="Giải trí">Giải trí</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Mã Dự án</label>
              <input type="text" value={projectIdCode} onChange={e => setProjectIdCode(e.target.value)} className="glass-input" style={{ width: '100%' }} placeholder="VD: DA-2408" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Chủ đầu tư</label>
              <input type="text" value={client} onChange={e => setClient(e.target.value)} className="glass-input" style={{ width: '100%' }} placeholder="VD: Anh Vượng" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ảnh Cover (Tải lên từ thiết bị)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={20} color="var(--text-secondary)" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="glass-input" 
                style={{ width: '100%', padding: '0.4rem' }} 
              />
            </div>
            {imageUrl && (
              <div style={{ marginTop: '1rem', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative' }}>
                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                <button 
                  type="button" 
                  onClick={() => setImageUrl('')} 
                  style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', padding: '0.25rem', cursor: 'pointer', border: 'none' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>Hủy</button>
            <button type="submit" className="btn-gold">
              {editProject ? 'Lưu thay đổi' : 'Tạo dự án'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
