import React, { useState } from 'react';
import moment from 'moment';
import { deleteProject, useProjects, useTasks } from '../db/db';
import { Folder, Hash, User, Edit2, Trash2, Calendar } from 'lucide-react';
import ProjectFormModal from './ProjectFormModal';
import { architecturalProcess } from '../constants/architecturalProcess';

export default function ProjectList({ onProjectSelect, onAddProject, selectedCategories = [], searchQuery = '' }) {
  const [editingProject, setEditingProject] = useState(null);
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

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Thư viện Dự án</h2>
        <button
          onClick={onAddProject}
          style={{ padding: '0.4rem 1rem', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}
        >
          + Dự án
        </button>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '1.5rem',
        overflowY: 'auto',
        paddingRight: '0.5rem'
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
              borderTop: `4px solid ${project.color}`,
              cursor: 'pointer', transition: 'transform 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="project-img-container">
              {project.image_url ? (
                <img src={project.image_url} alt={project.name} className="project-img" />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
                  <Folder size={48} opacity={0.5} />
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center', flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {project.name}
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                {project.project_id_code && <span>{project.project_id_code}</span>}
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={(e) => { e.stopPropagation(); handleEditProject(e, project); }} style={{ cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.15rem', background: 'transparent', border: 'none' }} title="Sửa dự án">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(e, project.id); }} style={{ cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.15rem', background: 'transparent', border: 'none' }} title="Xóa dự án">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Trạng thái:</span>
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                  {(!project.status || project.status === 'Active') ? 'Đang thực hiện' : project.status}
                </span>
              </div>

              {project.phase_deadline && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Chốt giai đoạn</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{new Date(project.phase_deadline).toLocaleDateString('vi-VN')}</span>
                </div>
              )}

              {project.end_date && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Thời gian kết thúc</span>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{new Date(project.end_date).toLocaleDateString('vi-VN')}</span>
                </div>
              )}

              <div style={{ width: '100%', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {completedTasks} / {totalTasks} hoàn thành
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span>Tiến độ</span>
                  <span style={{ fontWeight: 'bold' }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'var(--bg-main)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', backgroundColor: project.color || 'var(--color-primary)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {projects.length === 0 && (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Chưa có dự án nào.
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
