import React, { useState } from 'react';
import moment from 'moment';
import { deleteProject, useProjects, useTasks } from '../db/db';
import { Folder, Hash, User, Edit2, Trash2, Calendar, Plus, CheckCircle2, Clock, Sparkles, Search } from 'lucide-react';
import ProjectFormModal from './ProjectFormModal';
import { architecturalProcess } from '../constants/architecturalProcess';

export default function ProjectList({ onProjectSelect, onAddProject, selectedCategories = [], searchQuery: externalSearchQuery = '' }) {
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const projects = useProjects() || [];
  const tasks = useTasks() || [];

  const handleEditProject = (e, project) => {
    e.stopPropagation();
    setEditingProject(project);
  };

  const handleDeleteProject = async (e, id) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa dự án này?")) {
      await deleteProject(id);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const query = searchQuery.toLowerCase();
    const matchSearch = query === '' || 
      p.name?.toLowerCase().includes(query) || 
      p.project_id_code?.toLowerCase().includes(query) || 
      p.client?.toLowerCase().includes(query);
    return matchCategory && matchSearch;
  });

  // Calculate overall metrics for top Bento Widget
  let grandTotalTasks = 0;
  let grandCompletedTasks = 0;
  filteredProjects.forEach(project => {
    if (project.category === 'Dự án thiết kế') {
      const processState = project.process_state || {};
      architecturalProcess.forEach(stage => {
        stage.groups.forEach(group => {
          group.items.forEach(item => {
            grandTotalTasks++;
            if (processState[item.id]) grandCompletedTasks++;
          });
        });
      });
    } else {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      grandTotalTasks += projectTasks.length;
      grandCompletedTasks += projectTasks.filter(t => t.status === 'Done').length;
    }
  });

  const overallProgress = grandTotalTasks === 0 ? 0 : Math.round((grandCompletedTasks / grandTotalTasks) * 100);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Thư viện Dự án</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Collapsible Search Button / Input */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {isSearchExpanded || searchQuery ? (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  backgroundColor: 'var(--bg-main)', 
                  border: '1px solid var(--color-primary)', 
                  borderRadius: '9999px', 
                  padding: '0.25rem 0.75rem',
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '220px'
                }}
              >
                <Search size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Tìm kiếm dự án..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery.trim()) {
                      setIsSearchExpanded(false);
                    }
                  }}
                  style={{ 
                    border: 'none', 
                    outline: 'none', 
                    backgroundColor: 'transparent', 
                    padding: '0.35rem 0.5rem', 
                    fontSize: '0.875rem', 
                    width: '100%', 
                    color: 'var(--text-primary)' 
                  }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => { setSearchQuery(''); setIsSearchExpanded(false); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', padding: '0 0.25rem' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsSearchExpanded(true)}
                title="Tìm kiếm dự án"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.25s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Search size={18} />
              </button>
            )}
          </div>

          <button
            onClick={onAddProject}
            title="Thêm dự án mới"
            className="btn-gold"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0
            }}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Main Project Bento Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '1.5rem',
        overflowY: 'auto',
        paddingRight: '0.5rem',
        flex: 1
      }}>
      {filteredProjects.map(project => {
        let totalTasks = 0;
        let completedTasks = 0;

        if (project.category === 'Dự án thiết kế') {
          const processState = project.process_state || {};
          architecturalProcess.forEach(stage => {
            stage.groups.forEach(group => {
              group.items.forEach(item => {
                totalTasks++;
                if (processState[item.id]) completedTasks++;
              });
            });
          });
        } else {
          const projectTasks = tasks.filter(t => t.project_id === project.id);
          totalTasks = projectTasks.length;
          completedTasks = projectTasks.filter(t => t.status === 'Done').length;
        }

        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        return (
          <div 
            key={project.id} 
            className="card" 
            onClick={() => onProjectSelect && onProjectSelect(project.id)}
            style={{ 
              display: 'flex', flexDirection: 'column', gap: '1rem', 
              borderTop: `4px solid ${project.color || 'var(--color-primary)'}`,
              cursor: 'pointer',
            }}
          >
            {/* Image Box */}
            <div className="project-img-container" style={{ position: 'relative' }}>
              {project.image_url ? (
                <img src={project.image_url} alt={project.name} className="project-img" />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.9))' }}>
                  <Folder size={44} opacity={0.4} />
                </div>
              )}
            </div>
            
            {/* Content Body */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', textAlign: 'center', flex: 1 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'white', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.4', minHeight: '3.2em', width: '100%' }}>
                {project.name}
              </h3>
              
              {project.project_id_code && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#94a3b8' }}>
                  {project.project_id_code}
                </div>
              )}

              {/* Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Trạng thái:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                  {(!project.status || project.status === 'Active') ? 'Đang thực hiện' : project.status}
                </span>
              </div>

              {project.phase_deadline && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Chốt giai đoạn</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{new Date(project.phase_deadline).toLocaleDateString('vi-VN')}</span>
                </div>
              )}

              {project.end_date && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Thời gian kết thúc</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{new Date(project.end_date).toLocaleDateString('vi-VN')}</span>
                </div>
              )}

              {/* Progress Bar */}
              <div style={{ width: '100%', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tiến độ</span>
                  <span style={{ fontWeight: '800', color: project.color || 'var(--color-primary)' }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', backgroundColor: project.color || 'var(--color-primary)', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {filteredProjects.length === 0 && (
        <div className="bento-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <Folder size={48} opacity={0.3} style={{ marginBottom: '1rem' }} />
          <div>Chưa có dự án nào khớp với điều kiện tìm kiếm.</div>
        </div>
      )}
      </div>
      
      {editingProject && (
        <ProjectFormModal 
          editProject={editingProject} 
          onClose={() => setEditingProject(null)} 
        />
      )}
    </div>
  );
}
