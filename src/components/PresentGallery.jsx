import React, { useState, useEffect } from 'react';
import { Folder, Image as ImageIcon, ChevronLeft, ChevronRight, X, ExternalLink, Download, Eye, AlertCircle } from 'lucide-react';

export default function PresentGallery({ project }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [openFolderStatus, setOpenFolderStatus] = useState(null);

  const localPath = project.local_path || project.Path || '';
  const projectId = project.project_id_code || project.ID || project.id;

  useEffect(() => {
    // Try to load images from project.present_images or fetch manifest / assets
    if (project.present_images && Array.isArray(project.present_images) && project.present_images.length > 0) {
      setImages(project.present_images);
    } else {
      // Check if there are local assets or try fetching manifest for this project ID
      setLoading(true);
      fetch(`/assets/${projectId}/Present/manifest.json`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('No online manifest');
        })
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const fullUrls = data.map(filename => `/assets/${projectId}/Present/${filename}`);
            setImages(fullUrls);
          }
          setLoading(false);
        })
        .catch(() => {
          // If online manifest not found, try querying local backend server if running
          fetch(`http://localhost:8081/get_present_images?path=${encodeURIComponent(localPath)}`)
            .then(res => {
              if (res.ok) return res.json();
              throw new Error('Local server not running');
            })
            .then(data => {
              if (Array.isArray(data) && data.length > 0) {
                const localUrls = data.map(filename => `http://localhost:8081/present_file/${encodeURIComponent(localPath)}/${encodeURIComponent(filename)}`);
                setImages(localUrls);
              }
              setLoading(false);
            })
            .catch(() => {
              // Fallback to project thumbnail or sample
              if (project.image_url) {
                setImages([project.image_url]);
              } else {
                setImages([]);
              }
              setLoading(false);
            });
        });
    }
  }, [project, projectId, localPath]);

  const handleOpenFolder = async () => {
    if (!localPath) {
      alert('Dự án này chưa được thiết lập đường dẫn thư mục máy tính (Local Path).');
      return;
    }

    try {
      setOpenFolderStatus('Đang mở thư mục...');
      const res = await fetch(`http://localhost:8081/open-folder?path=${encodeURIComponent(localPath)}`, {
        method: 'GET',
        mode: 'cors'
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOpenFolderStatus('✅ Đã mở thư mục trên Windows Explorer');
        setTimeout(() => setOpenFolderStatus(null), 4000);
      } else {
        throw new Error(data.message || 'Lỗi từ máy chủ');
      }
    } catch (err) {
      console.warn('Cannot open local folder via server.py:', err);
      setOpenFolderStatus('⚠️ Máy chủ cục bộ chưa bật hoặc bạn đang dùng thiết bị ngoài.');
      setTimeout(() => setOpenFolderStatus(null), 5000);
      alert(`Đường dẫn thư mục máy tính của dự án:\n${localPath}\n\n(Lưu ý: Để mở trực tiếp bằng 1-click từ trình duyệt, vui lòng bật file Start_Dashboard.bat trên máy tính).`);
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setSelectedImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      
      {/* Top Banner: Local Path & Open Folder Action */}
      <div className="card" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '1rem', 
        flexWrap: 'wrap',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid var(--border-color)',
        padding: '1rem 1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(59, 130, 246, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-primary)',
            flexShrink: 0
          }}>
            <Folder size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0, overflow: 'hidden' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              Thư mục dự án trên máy tính (Local Disk)
            </span>
            <span style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-primary)', 
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }} title={localPath}>
              {localPath || '(Chưa cấu hình đường dẫn thư mục)'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {openFolderStatus && (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-warning)' }}>
              {openFolderStatus}
            </span>
          )}
          <button
            type="button"
            onClick={handleOpenFolder}
            className="btn-gold"
            title="Mở thư mục trên máy tính Windows Explorer"
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Folder size={16} /> Mở Thư Mục PC
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
              Bộ sưu tập Phối cảnh & Bản vẽ (Present Gallery)
            </h3>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {images.length} hình ảnh
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Đang tải hình ảnh phối cảnh...
          </div>
        ) : images.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '1rem',
            marginTop: '0.5rem'
          }}>
            {images.map((imgSrc, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                style={{
                  position: 'relative',
                  height: '160px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  transition: 'all 0.25s ease'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.5)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img 
                  src={imgSrc} 
                  alt={`Phối cảnh ${idx + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  loading="lazy"
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  padding: '0.6rem'
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '1'}
                onMouseOut={e => e.currentTarget.style.opacity = '0'}
                >
                  <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: '500' }}>
                    #{idx + 1}
                  </span>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Eye size={14} color="white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <ImageIcon size={44} opacity={0.3} style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.92rem', marginBottom: '0.4rem' }}>Chưa có ảnh phối cảnh nào được đồng bộ cho dự án này.</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Hãy đặt các ảnh thiết kế vào thư mục <code>Present/</code> của dự án trên máy tính và chạy script đồng bộ.
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Image Viewer */}
      {selectedImageIndex !== null && (
        <div 
          onClick={() => setSelectedImageIndex(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(10px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            title="Đóng xem ảnh"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10001
            }}
          >
            <X size={22} />
          </button>

          {/* Prev Button */}
          <button
            onClick={handlePrevImage}
            title="Ảnh trước"
            style={{
              position: 'absolute',
              left: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10001
            }}
          >
            <ChevronLeft size={26} />
          </button>

          {/* Main Large Image */}
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '85vh', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '0.75rem' 
            }}
          >
            <img 
              src={images[selectedImageIndex]} 
              alt="Phối cảnh phóng to" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '80vh', 
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
              }} 
            />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '500' }}>
              Ảnh {selectedImageIndex + 1} / {images.length}
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextImage}
            title="Ảnh tiếp theo"
            style={{
              position: 'absolute',
              right: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10001
            }}
          >
            <ChevronRight size={26} />
          </button>
        </div>
      )}

    </div>
  );
}
