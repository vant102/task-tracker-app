import React, { useState } from 'react';
import { deleteProject, useProjects, useTasks } from '../db/db';
import { Folder, Hash, User, Edit2, Trash2, Calendar } from 'lucide-react';
import ProjectFormModal from './ProjectFormModal';
import { architecturalProcess } from '../constants/architecturalProcess';

export default function ProjectList({ onProjectSelect, selectedCategories = [], searchQuery = '' }) {
  const [editingProject, setEditingProject] = useState(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
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
          onClick={() => setIsAddingProject(true)}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '500' }}
        >
          + Thêm Dự án mới
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
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white' }}>{project.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', backgroundColor: 'var(--bg-main)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
                  {project.category}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={(e) => handleEditProject(e, project)} style={{ cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', background: 'transparent', border: 'none' }} title="Sửa dự án">
                  <Edit2 size={16} />
                </button>
                <button onClick={(e) => handleDeleteProject(e, project.id)} style={{ cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', background: 'transparent', border: 'none' }} title="Xóa dự án">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {(project.project_id_code || project.client) && (
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                {project.project_id_code && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Hash size={12}/> {project.project_id_code}</span>}
                {project.client && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><User size={12}/> {project.client}</span>}
              </div>
            )}
            
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Trạng thái: <strong>{project.status}</strong>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span>Tiến độ</span>
                <span style={{ fontWeight: 'bold' }}>{progress}%</span>
              </div>
              <div style={{ width: '100%', backgroundColor: 'var(--bg-main)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: project.color, transition: 'width 0.3s ease' }}></div>
              </div>
              
              {project.end_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  <Calendar size={12} /> Thời gian kết thúc: {new Date(project.end_date).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
              {completedTasks} / {totalTasks} công việc hoàn thành
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
      
      {isAddingProject && (
        <ProjectFormModal 
          onClose={() => setIsAddingProject(false)} 
        />
      )}
    </div>
  );
}
