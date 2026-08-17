import React, { useState, useEffect } from 'react';
import { updateProject, deleteProject, updateTask, addProjectLog, updateProjectLog, deleteProjectLog, useProjects, useProjectTasks, useProjectLogs } from '../db/db';
import { ArrowLeft, Clock, Send, Play, Pause, CheckCircle, Edit2, Trash2, Image as ImageIcon, Layers, Building2, MapPin, User, Calendar, Tag, Check, PauseCircle } from 'lucide-react';
import PersonalProjectDetail from './PersonalProjectDetail';
import ArchitecturalProcess from './ArchitecturalProcess';
import PresentGallery from './PresentGallery';
import ProjectFormModal from './ProjectFormModal';

const STATUS_OPTIONS = [
  { value: 'Working', label: 'Đang thực hiện', color: 'var(--color-primary)' },
  { value: 'Completed', label: 'Hoàn thành', color: 'var(--color-success)' },
  { value: 'Paused', label: 'Tạm dừng', color: 'var(--color-warning)' }
];

export default function ProjectDetail({ projectId, onBack }) {
  const projects = useProjects();
  const project = projects?.find(p => p.id === projectId);
  const tasks = useProjectTasks(projectId) || [];
  const rawLogs = useProjectLogs(projectId) || [];
  const logs = [...rawLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const [newLog, setNewLog] = useState('');
  const [editingLogId, setEditingLogId] = useState(null);
  const [editLogContent, setEditLogContent] = useState('');
  const [editLogDate, setEditLogDate] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Tab state for Design Projects: 'process' | 'tasks' | 'present'
  const [activeSubTab, setActiveSubTab] = useState('process');

  useEffect(() => {
    if (project?.name) {
      setNameInput(project.name);
    }
  }, [project?.name]);

  if (!project) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tải dữ liệu dự án...</div>;

  const currentStatus = project.status || (project.completed ? 'Completed' : 'Working');

  const handleStatusChange = async (newStatus) => {
    await updateProject(projectId, { 
      status: newStatus,
      completed: newStatus === 'Completed'
    });
  };

  const cycleStatus = async (taskId, cStatus) => {
    let newStatus = 'To do';
    if (cStatus === 'To do') newStatus = 'Doing';
    else if (cStatus === 'Doing') newStatus = 'Paused';
    else if (cStatus === 'Paused') newStatus = 'Done';
    else if (cStatus === 'Done') newStatus = 'To do';
    
    await updateTask(taskId, { status: newStatus });
  };

  const handleUpdateNotes = async (taskId, notes) => {
    await updateTask(taskId, { notes });
  };

  const handleUpdateDeadline = async (taskId, dateStr) => {
    await updateTask(taskId, { deadline: dateStr ? new Date(dateStr).toISOString() : null });
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLog.trim()) return;
    await addProjectLog({ project_id: projectId, content: newLog });
    setNewLog('');
  };

  const handleEditLog = async (id) => {
    if (!editLogContent.trim()) return;
    const updateData = { content: editLogContent };
    if (editLogDate) {
      updateData.date = new Date(editLogDate).toISOString();
    }
    await updateProjectLog(id, updateData);
    setEditingLogId(null);
  };

  const handleDeleteLog = async (id) => {
    if (confirm('Bạn có chắc muốn xóa nhật ký này?')) {
      await deleteProjectLog(id);
    }
  };

  const handleUpdateProjectMeta = async (field, value) => {
    await updateProject(projectId, { [field]: value });
  };

  const handleDeleteCurrentProject = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa dự án này? Dữ liệu dự án sẽ bị xóa hoàn toàn.')) {
      await deleteProject(projectId);
      onBack();
    }
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'To do': return <Clock size={16} color="var(--text-secondary)" />;
      case 'Doing': return <Play size={16} color="var(--color-primary)" />;
      case 'Paused': return <Pause size={16} color="var(--color-warning)" />;
      case 'Done': return <CheckCircle size={16} color="var(--color-success)" />;
      default: return <Clock size={16} color="var(--text-secondary)" />;
    }
  };

  if (project.category === 'Dự án thiết kế' || !project.category) {
    const groupedTasks = tasks.reduce((acc, task) => {
      const phase = task.phase || 'Khác';
      if (!acc[phase]) acc[phase] = [];
      acc[phase].push(task);
      return acc;
    }, {});
    const sortedPhases = Object.keys(groupedTasks).sort();
    const scopes = Array.isArray(project.scope) ? project.scope : (project.scope ? [project.scope] : []);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', minWidth: 0, width: '100%' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
          <button onClick={onBack} title="Quay lại danh sách" style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={20} color="var(--text-primary)" />
          </button>
          
          {/* Editable Project Title & Header Actions */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
              {isEditingName ? (
                <input 
                  type="text" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={async () => {
                    setIsEditingName(false);
                    if (nameInput.trim() && nameInput !== project.name) {
                      await handleUpdateProjectMeta('name', nameInput.trim());
                    }
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') {
                      setIsEditingName(false);
                      if (nameInput.trim() && nameInput !== project.name) {
                        await handleUpdateProjectMeta('name', nameInput.trim());
                      }
                    }
                  }}
                  autoFocus
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--color-primary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.2rem 0.5rem',
                    outline: 'none',
                    width: '100%',
                    maxWidth: '400px'
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 
                    onClick={() => setIsEditingName(true)}
                    style={{ fontSize: '1.35rem', fontWeight: 'bold', margin: 0, cursor: 'pointer', color: 'var(--text-primary)' }}
                    title="Nhấn để sửa tên dự án"
                  >
                    {project.name}
                  </h2>
                  {project.project_id_code && (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {project.project_id_code}
                    </span>
                  )}
                </div>
              )}

              <button 
                onClick={() => setIsEditModalOpen(true)} 
                title="Chỉnh sửa toàn bộ thông tin dự án"
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  color: '#e6b965', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: 'linear-gradient(135deg, rgba(230, 185, 101, 0.18) 0%, rgba(178, 142, 65, 0.28) 100%)',
                  border: '1px solid rgba(230, 185, 101, 0.45)', 
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <Edit2 size={14} />
              </button>

              <button 
                onClick={handleDeleteCurrentProject} 
                title="Xóa dự án này"
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  color: 'var(--color-danger)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: 'rgba(239, 68, 68, 0.12)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Quick 2-Way Status Selector in Header */}
            <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              {STATUS_OPTIONS.map(opt => {
                const isSelected = currentStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleStatusChange(opt.value)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? '700' : '500',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.2s ease',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      border: isSelected ? `1px solid ${opt.color}` : '1px solid transparent',
                      color: isSelected ? opt.color : 'var(--text-secondary)'
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* Tab Navigation: Process / Tasks / Present Gallery */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
          <button 
            onClick={() => setActiveSubTab('process')}
            style={{ 
              padding: '0.65rem 1.1rem', 
              fontWeight: '700',
              fontSize: '0.88rem',
              color: activeSubTab === 'process' ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: activeSubTab === 'process' ? '2px solid var(--color-primary)' : '2px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Quy trình 7 Giai đoạn
          </button>
          
          <button 
            onClick={() => setActiveSubTab('tasks')}
            style={{ 
              padding: '0.65rem 1.1rem', 
              fontWeight: '700',
              fontSize: '0.88rem',
              color: activeSubTab === 'tasks' ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: activeSubTab === 'tasks' ? '2px solid var(--color-primary)' : '2px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Công việc phát sinh
          </button>

          <button 
            onClick={() => setActiveSubTab('present')}
            style={{ 
              padding: '0.65rem 1.1rem', 
              fontWeight: '700',
              fontSize: '0.88rem',
              color: activeSubTab === 'present' ? '#e6b965' : 'var(--text-secondary)',
              borderBottom: activeSubTab === 'present' ? '2px solid #e6b965' : '2px solid transparent',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <ImageIcon size={15} />
            Phối cảnh & Bản vẽ (Present Gallery)
          </button>
        </div>

        {/* View Content depending on active sub-tab */}
        {activeSubTab === 'present' ? (
          <PresentGallery project={project} />
        ) : (
          <div className="responsive-project-container">
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
              
              {/* Project Metadata Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem', padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  
                  {/* Phạm vi & Loại hình */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Layers size={14} /> Phạm vi & Loại hình
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {project.project_type && (
                        <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.18)', color: 'var(--color-primary)' }}>
                          {project.project_type}
                        </span>
                      )}
                      {scopes.map(sc => (
                        <span key={sc} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(230, 185, 101, 0.15)', color: '#e6b965' }}>
                          {sc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Chủ đầu tư & Địa điểm */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={14} /> Chủ đầu tư & Địa điểm
                    </span>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      {project.client || '---'} {project.location ? `• ${project.location}` : ''}
                    </div>
                  </div>

                  {/* Thời gian */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> Thời gian thực hiện
                    </span>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      {project.start_month ? project.start_month.split('-').reverse().join('/') : '---'}
                      {' → '}
                      {project.end_month ? project.end_month.split('-').reverse().join('/') : 'Hiện tại'}
                    </div>
                  </div>

                  {/* Phong cách */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Tag size={14} /> Phong cách kiến trúc
                    </span>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                      {project.style || '---'}
                    </div>
                  </div>

                </div>
              </div>

              {/* Main Content Area based on Tab */}
              {activeSubTab === 'process' ? (
                <ArchitecturalProcess project={project} />
              ) : (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>Phần phát sinh</h3>
                    <button onClick={async () => {
                      const nextOrder = tasks.length + 1;
                      const todayStr = new Date().toLocaleDateString('vi-VN');
                      await import('../db/db').then(m => m.addTask({
                        title: '',
                        project_id: projectId,
                        task_type: 'SubTask',
                        status: `STT ${nextOrder} - ${todayStr}`,
                        phase: 'Công việc phát sinh',
                        deadline: null
                      }));
                    }} className="btn-gold" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                      + Thêm
                    </button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.75rem', width: '120px', textAlign: 'center' }}>STT & Ngày</th>
                        <th style={{ padding: '0.75rem', width: '250px' }}>Hạng mục công việc chi tiết</th>
                        <th style={{ padding: '0.75rem', width: '120px' }}>Thời hạn</th>
                        <th style={{ padding: '0.75rem' }}>Ghi chú / Đầu ra (Outputs)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPhases.map(phase => (
                        <React.Fragment key={phase}>
                          <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <td colSpan={4} style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--color-primary)', borderBottom: '1px solid var(--border-color)' }}>{phase}</td>
                          </tr>
                          {groupedTasks[phase].map(task => (
                            <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: task.status === 'Done' ? 'var(--bg-main)' : 'transparent', transition: 'background-color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = task.status === 'Done' ? 'var(--bg-main)' : 'transparent'}>
                              <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                {task.status?.startsWith('STT') ? task.status : (
                                  <button onClick={() => cycleStatus(task.id, task.status)} style={{ padding: '0.25rem', borderRadius: '4px', backgroundColor: 'transparent' }}>
                                    {renderStatusIcon(task.status)}
                                  </button>
                                )}
                              </td>
                              <td style={{ padding: '0.5rem', fontWeight: '500', color: task.status === 'Done' ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: task.status === 'Done' ? 'line-through' : 'none' }}>
                                <input type="text" defaultValue={task.title || ''} onBlur={(e) => updateTask(task.id, { title: e.target.value })} placeholder="Tên công việc..." style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', color: 'inherit', fontWeight: 'inherit', textDecoration: 'inherit' }} />
                              </td>
                              <td style={{ padding: '0.5rem' }}>
                                <input type="date" defaultValue={task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''} onChange={(e) => handleUpdateDeadline(task.id, e.target.value)} style={{ padding: '0.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'transparent', outline: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', width: '100px' }} />
                              </td>
                              <td style={{ padding: '0.5rem' }}>
                                <input type="text" defaultValue={task.notes || ''} onBlur={(e) => handleUpdateNotes(task.id, e.target.value)} placeholder="Ghi chú thêm..." style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'transparent', outline: 'none', fontSize: '0.875rem', color: 'white' }} />
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                      {tasks.length === 0 && (
                        <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Chưa có công việc phát sinh nào.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Nhật ký Dự án (Meeting Logs) */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', maxHeight: 'calc(100vh - 250px)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0 }}>Nhật ký & Quyết định</h3>
              
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
                {logs.map(log => (
                  <div key={log.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        <Clock size={12} />
                        <span>{new Date(log.date).toLocaleString('vi-VN')}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { 
                          setEditingLogId(log.id); 
                          setEditLogContent(log.content); 
                          if (log.date) {
                            const d = new Date(log.date);
                            const tzOffset = d.getTimezoneOffset() * 60000;
                            setEditLogDate(new Date(d.getTime() - tzOffset).toISOString().slice(0, 16));
                          } else {
                            setEditLogDate('');
                          }
                        }} style={{ color: 'var(--text-secondary)', background: 'transparent', padding: '0.25rem', cursor: 'pointer', border: 'none' }}>
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDeleteLog(log.id)} style={{ color: 'var(--text-secondary)', background: 'transparent', padding: '0.25rem', cursor: 'pointer', border: 'none' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {editingLogId === log.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input 
                          type="datetime-local" 
                          value={editLogDate} 
                          onChange={(e) => setEditLogDate(e.target.value)}
                          style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'white', outline: 'none', fontSize: '0.75rem', width: 'fit-content' }}
                        />
                        <textarea 
                          value={editLogContent} 
                          onChange={(e) => setEditLogContent(e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-primary)', backgroundColor: 'transparent', color: 'white', minHeight: '60px', outline: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => setEditingLogId(null)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', border: 'none' }}>Hủy</button>
                          <button onClick={() => handleEditLog(log.id)} className="btn-gold" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Lưu</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.875rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{log.content}</div>
                    )}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginTop: '2rem' }}>
                    Chưa có nhật ký nào.
                  </div>
                )}
              </div>

              <form onSubmit={handleAddLog} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <input 
                  type="text" 
                  value={newLog}
                  onChange={(e) => setNewLog(e.target.value)}
                  placeholder="Ghi lại các chốt biên bản họp..."
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'white', backgroundColor: 'rgba(0,0,0,0.2)' }}
                />
                <button type="submit" className="btn-gold" style={{ padding: '0 1rem' }}>
                  <Send size={18} />
                </button>
              </form>
            </div>

          </div>
        )}

        {isEditModalOpen && (
          <ProjectFormModal
            editProject={project}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}
      </div>
    );
  }

  // Nếu là Dự án Phát triển bản thân
  if (project.category === 'Phát triển bản thân') {
    return <PersonalProjectDetail projectId={projectId} project={project} onBack={onBack} />;
  }

  // Giao diện mặc định cho các dự án khác
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <button onClick={onBack} style={{ padding: '0.5rem', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-sm)' }}>
          <ArrowLeft size={20} color="white" />
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{project.name}</h2>
      </div>
      <p style={{ color: 'var(--text-secondary)' }}>Đây là Dự án: {project.category}. Giao diện chi tiết đang được phát triển.</p>
    </div>
  );
}
