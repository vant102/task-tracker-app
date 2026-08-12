import React, { useState } from 'react';
import { updateProject, updateTask, addProjectLog, updateProjectLog, deleteProjectLog, useProjects, useProjectTasks, useProjectLogs } from '../db/db';
import { ArrowLeft, Clock, Send, Play, Pause, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import PersonalProjectDetail from './PersonalProjectDetail';
import ArchitecturalProcess from './ArchitecturalProcess';

export default function ProjectDetail({ projectId, onBack }) {
  const projects = useProjects();
  const project = projects?.find(p => p.id === projectId);
  const tasks = useProjectTasks(projectId) || [];
  const logs = useProjectLogs(projectId) || [];
  
  const [newLog, setNewLog] = useState('');
  const [editingLogId, setEditingLogId] = useState(null);
  const [editLogContent, setEditLogContent] = useState('');
  
  // Tab state for Design Projects
  const [activeSubTab, setActiveSubTab] = useState('process'); // 'process' or 'tasks'

  if (!project) return <div>Đang tải dữ liệu dự án...</div>;

  const cycleStatus = async (taskId, currentStatus) => {
    let newStatus = 'To do';
    if (currentStatus === 'To do') newStatus = 'Doing';
    else if (currentStatus === 'Doing') newStatus = 'Paused';
    else if (currentStatus === 'Paused') newStatus = 'Done';
    else if (currentStatus === 'Done') newStatus = 'To do';
    
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
    await updateProjectLog(id, { content: editLogContent });
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

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'To do': return <Clock size={16} color="var(--text-secondary)" />;
      case 'Doing': return <Play size={16} color="var(--color-primary)" />;
      case 'Paused': return <Pause size={16} color="var(--color-warning)" />;
      case 'Done': return <CheckCircle size={16} color="var(--color-success)" />;
      default: return <Clock size={16} color="var(--text-secondary)" />;
    }
  };

  if (project.category === 'Dự án thiết kế') {
    const groupedTasks = tasks.reduce((acc, task) => {
      const phase = task.phase || 'Khác';
      if (!acc[phase]) acc[phase] = [];
      acc[phase].push(task);
      return acc;
    }, {});
    const sortedPhases = Object.keys(groupedTasks).sort();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button onClick={onBack} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{project.name}</h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Danh mục: {project.category}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveSubTab('process')}
            style={{ 
              padding: '0.75rem 1rem', 
              fontWeight: 'bold',
              fontSize: '0.875rem',
              color: activeSubTab === 'process' ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: activeSubTab === 'process' ? '2px solid var(--color-primary)' : '2px solid transparent',
              backgroundColor: 'transparent'
            }}
          >
            Quy trình Thiết kế
          </button>
          <button 
            onClick={() => setActiveSubTab('tasks')}
            style={{ 
              padding: '0.75rem 1rem', 
              fontWeight: 'bold',
              fontSize: '0.875rem',
              color: activeSubTab === 'tasks' ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: activeSubTab === 'tasks' ? '2px solid var(--color-primary)' : '2px solid transparent',
              backgroundColor: 'transparent'
            }}
          >
            Công việc phát sinh
          </button>
        </div>

        <div className="responsive-project-container">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
            
            {/* Project Metadata */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.875rem' }}>
              <div className="project-meta-grid-top">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Mã ID</label>
                  <input type="text" defaultValue={project.project_id_code || ''} onBlur={(e) => handleUpdateProjectMeta('project_id_code', e.target.value)} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-primary)', backgroundColor: 'var(--bg-main)' }} placeholder="VD: DA-2401" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Chủ đầu tư</label>
                  <input type="text" defaultValue={project.client || ''} onBlur={(e) => handleUpdateProjectMeta('client', e.target.value)} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-primary)', backgroundColor: 'var(--bg-main)' }} placeholder="Tên khách hàng" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Địa điểm công trình</label>
                  <input type="text" defaultValue={project.location || ''} onBlur={(e) => handleUpdateProjectMeta('location', e.target.value)} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-primary)', backgroundColor: 'var(--bg-main)' }} placeholder="Địa chỉ..." />
                </div>
              </div>
              <div className="project-meta-grid-bottom">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Chốt giai đoạn</label>
                  <input type="date" defaultValue={project.phase_deadline || ''} onChange={(e) => handleUpdateProjectMeta('phase_deadline', e.target.value)} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-primary)', backgroundColor: 'var(--bg-main)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Phong cách thiết kế</label>
                  <input type="text" defaultValue={project.style || ''} onBlur={(e) => handleUpdateProjectMeta('style', e.target.value)} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-primary)', backgroundColor: 'var(--bg-main)' }} placeholder="VD: Modern Tropical" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Thời gian bắt đầu</label>
                  <input type="date" defaultValue={project.start_date || ''} onChange={(e) => handleUpdateProjectMeta('start_date', e.target.value)} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-primary)', backgroundColor: 'var(--bg-main)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Thời gian kết thúc</label>
                  <input type="date" defaultValue={project.end_date || ''} onChange={(e) => handleUpdateProjectMeta('end_date', e.target.value)} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-primary)', backgroundColor: 'var(--bg-main)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Trạng thái</label>
                  <select defaultValue={project.status || 'Đang thực hiện'} onChange={(e) => handleUpdateProjectMeta('status', e.target.value)} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'var(--text-primary)', backgroundColor: 'var(--bg-main)', cursor: 'pointer' }}>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Tạm dừng">Tạm dừng</option>
                    <option value="Hoàn thiện">Hoàn thiện</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main Content Area based on Tab */}
            {activeSubTab === 'process' ? (
              <ArchitecturalProcess project={project} />
            ) : (
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Phần phát sinh</h3>
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
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>Nhật ký & Quyết định</h3>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
              {logs.map(log => (
                <div key={log.id} style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      <Clock size={12} />
                      <span>{new Date(log.date).toLocaleString('vi-VN')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setEditingLogId(log.id); setEditLogContent(log.content); }} style={{ color: 'var(--text-secondary)', background: 'transparent', padding: '0.25rem' }}>
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDeleteLog(log.id)} style={{ color: 'var(--text-secondary)', background: 'transparent', padding: '0.25rem' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {editingLogId === log.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <textarea 
                        value={editLogContent} 
                        onChange={(e) => setEditLogContent(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-primary)', backgroundColor: 'transparent', color: 'white', minHeight: '60px', outline: 'none' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingLogId(null)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'transparent', color: 'var(--text-secondary)' }}>Hủy</button>
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
                style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', color: 'white' }}
              />
              <button type="submit" className="btn-gold" style={{ padding: '0 1rem' }}>
                <Send size={18} />
              </button>
            </form>
          </div>

        </div>
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
        <button onClick={onBack} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{project.name}</h2>
      </div>
      <p style={{ color: 'var(--text-secondary)' }}>Đây là Dự án: {project.category}. Giao diện chi tiết đang được phát triển.</p>
    </div>
  );
}
