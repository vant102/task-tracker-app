import React, { useState, useEffect } from 'react';
import { architecturalProcess } from '../constants/architecturalProcess';
import { updateProject } from '../db/db';
import { ChevronDown, ChevronUp, CheckCircle, Circle, PlayCircle, Edit2, Check } from 'lucide-react';

export default function ArchitecturalProcess({ project }) {
  const processState = project.process_state || {};
  const processNotes = project.process_notes || {};
  const [openStageId, setOpenStageId] = useState(null);
  
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteContent, setNoteContent] = useState('');

  // Tính toán trạng thái các giai đoạn
  const getStageStatus = (stage) => {
    let totalItems = 0;
    let checkedItems = 0;

    stage.groups.forEach(group => {
      group.items.forEach(item => {
        totalItems++;
        if (processState[item.id]) {
          checkedItems++;
        }
      });
    });

    if (totalItems === 0) return 'Chưa thực hiện';
    if (checkedItems === 0) return 'Chưa thực hiện';
    if (checkedItems === totalItems) return 'Hoàn thành';
    return 'Đang thực hiện';
  };

  // Tự động mở giai đoạn "Đang thực hiện" đầu tiên
  useEffect(() => {
    if (!openStageId) {
      const activeStage = architecturalProcess.find(s => {
        const status = getStageStatus(s);
        return status === 'Đang thực hiện' || status === 'Chưa thực hiện';
      });
      if (activeStage) {
        setOpenStageId(activeStage.id);
      } else {
        // Nếu hoàn thành hết, mở cái cuối cùng
        setOpenStageId(architecturalProcess[architecturalProcess.length - 1].id);
      }
    }
  }, [project.process_state]); // Phụ thuộc vào thay đổi tiến độ

  const toggleCheckbox = async (itemId) => {
    const newState = { ...processState, [itemId]: !processState[itemId] };
    await updateProject(project.id, { process_state: newState });
  };

  const handleSaveNote = async (itemId) => {
    const newNotes = { ...processNotes, [itemId]: noteContent };
    await updateProject(project.id, { process_notes: newNotes });
    setEditingNoteId(null);
  };

  const renderStatusIcon = (status) => {
    switch(status) {
      case 'Hoàn thành': return <CheckCircle size={18} color="var(--color-success)" />;
      case 'Đang thực hiện': return <PlayCircle size={18} color="var(--color-primary)" />;
      default: return <Circle size={18} color="var(--text-secondary)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '2rem' }}>
      {architecturalProcess.map((stage) => {
        const isOpen = openStageId === stage.id;
        const status = getStageStatus(stage);
        
        return (
          <div key={stage.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Accordion Header */}
            <div 
              onClick={() => setOpenStageId(isOpen ? null : stage.id)}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '1.25rem',
                cursor: 'pointer',
                backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                borderBottom: isOpen ? '1px solid var(--border-color)' : 'none',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {renderStatusIcon(status)}
                <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: status === 'Hoàn thành' ? 'var(--text-secondary)' : 'var(--color-primary)' }}>
                  {stage.title}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600',
                  color: status === 'Hoàn thành' ? 'var(--color-success)' : status === 'Đang thực hiện' ? 'var(--color-primary)' : 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-main)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem'
                }}>
                  {status}
                </span>
                {isOpen ? <ChevronUp size={20} color="var(--text-secondary)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
              </div>
            </div>

            {/* Accordion Content */}
            {isOpen && (
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {stage.groups.map((group, gIndex) => (
                  <div key={gIndex} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {group.title}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {group.items.map(item => {
                        const isChecked = !!processState[item.id];
                        const note = processNotes[item.id] || '';

                        return (
                          <div key={item.id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                              <div style={{ paddingTop: '2px' }}>
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={() => toggleCheckbox(item.id)}
                                  style={{ 
                                    width: '18px', height: '18px', 
                                    accentColor: 'var(--color-primary)',
                                    cursor: 'pointer'
                                  }}
                                />
                              </div>
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                <span style={{ 
                                  fontSize: '0.95rem',
                                  color: isChecked ? 'var(--text-secondary)' : 'var(--text-primary)',
                                  textDecoration: isChecked ? 'line-through' : 'none',
                                  lineHeight: '1.4',
                                  cursor: 'pointer'
                                }} onClick={() => toggleCheckbox(item.id)}>
                                  {item.label}
                                </span>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setEditingNoteId(item.id); setNoteContent(note); }}
                                  style={{ background: 'transparent', padding: '0.25rem', color: 'var(--text-secondary)' }}
                                  title="Thêm/Sửa ghi chú"
                                >
                                  <Edit2 size={14} />
                                </button>
                              </div>
                            </div>
                            
                            {/* Note section */}
                            {(note || editingNoteId === item.id) && (
                              <div style={{ marginLeft: '1.875rem' }}>
                                {editingNoteId === item.id ? (
                                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <input 
                                      type="text" 
                                      autoFocus
                                      value={noteContent}
                                      onChange={(e) => setNoteContent(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveNote(item.id);
                                        if (e.key === 'Escape') setEditingNoteId(null);
                                      }}
                                      placeholder="Nhập ghi chú..."
                                      style={{ flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'transparent', color: 'white', outline: 'none' }}
                                    />
                                    <button onClick={() => handleSaveNote(item.id)} style={{ padding: '0.25rem', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-sm)' }}>
                                      <Check size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                                    📝 {note}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
