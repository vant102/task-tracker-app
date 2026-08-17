import React, { useState } from 'react';
import { deleteProject, useProjects, useTasks } from '../db/db';
import { Folder, Hash, User, Edit2, Trash2, Calendar, Plus, CheckCircle2, Clock, Sparkles, Search, Filter, Layers, Building2, MapPin, Tag, ArrowRight, Play, Check, PauseCircle } from 'lucide-react';
import ProjectFormModal from './ProjectFormModal';
import { architecturalProcess } from '../constants/architecturalProcess';

const SCOPE_OPTIONS = ['Quy hoạch', 'Kiến trúc', 'Nội thất', 'Cảnh quan'];
const TYPE_OPTIONS = ['Thiết kế mới', 'Cải tạo', 'Mở rộng', 'Hoàn thiện nội thất'];
const STATUS_FILTER_OPTIONS = ['Tất cả', 'Đang thực hiện', 'Hoàn thành', 'Tạm dừng'];

export default function ProjectList({ onProjectSelect, onAddProject, selectedCategories = [], searchQuery: externalSearchQuery = '' }) {
  const [subTab, setSubTab] = useState('working'); // 'working' | 'all'
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Tất cả');
  const [selectedScopeFilter, setSelectedScopeFilter] = useState('Tất cả');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('Tất cả');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState('');

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

  // Helper to normalize project status
  const getProjectStatus = (p) => {
    if (p.status === 'Completed' || p.status === 'Hoàn thành' || p.completed === true) return 'Hoàn thành';
    if (p.status === 'Paused' || p.status === 'Tạm dừng') return 'Tạm dừng';
    return 'Đang thực hiện'; // Default to Working
  };

  // Extract all available years from projects
  const availableYears = Array.from(new Set(
    projects.map(p => {
      if (p.start_month) return p.start_month.split('-')[0];
      if (p.Nam) return String(p.Nam);
      if (p.project_id_code && p.project_id_code.includes('_')) return p.project_id_code.split('_')[0];
      if (p.createdAt) return new Date(p.createdAt).getFullYear().toString();
      return '2026';
    })
  )).filter(Boolean).sort((a, b) => b.localeCompare(a));

  // Count projects for tab badges
  const workingCount = projects.filter(p => getProjectStatus(p) === 'Đang thực hiện').length;
  const allCount = projects.length;

  // Filter projects according to active subTab and multi-dimensional filters
  const filteredProjects = projects.filter(p => {
    const pStatus = getProjectStatus(p);
    
    // SubTab filter
    if (subTab === 'working' && pStatus !== 'Đang thực hiện') {
      return false;
    }

    // Category filter
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category || 'Dự án thiết kế');
    if (!matchCategory) return false;

    // Search query filter
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchName = p.name?.toLowerCase().includes(query);
      const matchCode = p.project_id_code?.toLowerCase().includes(query);
      const matchClient = p.client?.toLowerCase().includes(query);
      const matchLocation = p.location?.toLowerCase().includes(query);
      const matchStyle = p.style?.toLowerCase().includes(query);
      if (!matchName && !matchCode && !matchClient && !matchLocation && !matchStyle) return false;
    }

    // Additional filters for All Projects view
    if (subTab === 'all') {
      // Year filter
      if (selectedYear !== 'All') {
        const pYear = p.start_month ? p.start_month.split('-')[0] : (p.Nam || (p.project_id_code ? p.project_id_code.split('_')[0] : ''));
        if (pYear !== selectedYear) return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'Tất cả') {
        if (pStatus !== selectedStatusFilter) return false;
      }

      // Scope filter
      if (selectedScopeFilter !== 'Tất cả') {
        const pScopes = Array.isArray(p.scope) ? p.scope : (p.scope ? [p.scope] : []);
        if (!pScopes.includes(selectedScopeFilter)) return false;
      }

      // Type filter
      if (selectedTypeFilter !== 'Tất cả') {
        if (p.project_type !== selectedTypeFilter) return false;
      }
    }

    return true;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
      
      {/* Top Header & Sub-Tab Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Sub-Tabs: Working vs All Projects */}
        <div style={{ 
          display: 'inline-flex', 
          background: 'rgba(15, 23, 42, 0.65)', 
          padding: '4px', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)',
          gap: '4px'
        }}>
          <button
            onClick={() => setSubTab('working')}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: subTab === 'working' ? '700' : '500',
              color: subTab === 'working' ? '#e6b965' : 'var(--text-secondary)',
              background: subTab === 'working' ? 'linear-gradient(135deg, rgba(230, 185, 101, 0.15) 0%, rgba(178, 142, 65, 0.25) 100%)' : 'transparent',
              border: subTab === 'working' ? '1px solid rgba(230, 185, 101, 0.35)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Play size={14} fill={subTab === 'working' ? '#e6b965' : 'transparent'} />
            Đang thực hiện
            <span style={{ 
              fontSize: '0.75rem', 
              background: subTab === 'working' ? 'rgba(230, 185, 101, 0.25)' : 'rgba(255,255,255,0.08)', 
              padding: '0.1rem 0.45rem', 
              borderRadius: '10px' 
            }}>
              {workingCount}
            </span>
          </button>

          <button
            onClick={() => setSubTab('all')}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: subTab === 'all' ? '700' : '500',
              color: subTab === 'all' ? 'var(--color-primary)' : 'var(--text-secondary)',
              background: subTab === 'all' ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
              border: subTab === 'all' ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Folder size={14} />
            Tất cả Dự án (All Projects)
            <span style={{ 
              fontSize: '0.75rem', 
              background: subTab === 'all' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.08)', 
              padding: '0.1rem 0.45rem', 
              borderRadius: '10px' 
            }}>
              {allCount}
            </span>
          </button>
        </div>

        {/* Right Controls: Search & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'var(--bg-main)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '9999px', 
            padding: '0.3rem 0.85rem',
            width: '220px'
          }}>
            <Search size={15} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm dự án..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                border: 'none', 
                outline: 'none', 
                backgroundColor: 'transparent', 
                padding: '0.2rem 0.4rem', 
                fontSize: '0.85rem', 
                width: '100%', 
                color: 'var(--text-primary)' 
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
              >
                ✕
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
              flexShrink: 0,
              boxShadow: '0 0 12px rgba(230, 185, 101, 0.4)'
            }}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Filter Bar for "All Projects" view */}
      {subTab === 'all' && (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.6rem', 
          padding: '0.85rem 1rem', 
          backgroundColor: 'rgba(15, 23, 42, 0.5)', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-color)',
          marginBottom: '1.25rem',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 'bold', marginRight: '0.4rem' }}>
            <Filter size={14} /> Bộ lọc:
          </div>

          {/* 1. Năm */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Năm:</span>
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(e.target.value)}
              className="glass-input" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              <option value="All">Tất cả năm</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* 2. Trạng thái */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Trạng thái:</span>
            <select 
              value={selectedStatusFilter} 
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="glass-input" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              {STATUS_FILTER_OPTIONS.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 3. Phạm vi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Phạm vi:</span>
            <select 
              value={selectedScopeFilter} 
              onChange={e => setSelectedScopeFilter(e.target.value)}
              className="glass-input" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              <option value="Tất cả">Tất cả phạm vi</option>
              {SCOPE_OPTIONS.map(sc => (
                <option key={sc} value={sc}>{sc}</option>
              ))}
            </select>
          </div>

          {/* 4. Loại hình */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Loại hình:</span>
            <select 
              value={selectedTypeFilter} 
              onChange={e => setSelectedTypeFilter(e.target.value)}
              className="glass-input" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px' }}
            >
              <option value="Tất cả">Tất cả loại hình</option>
              {TYPE_OPTIONS.map(tp => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
          </div>

          {/* Reset Filters button if any filter applied */}
          {(selectedYear !== 'All' || selectedStatusFilter !== 'Tất cả' || selectedScopeFilter !== 'Tất cả' || selectedTypeFilter !== 'Tất cả') && (
            <button
              onClick={() => {
                setSelectedYear('All');
                setSelectedStatusFilter('Tất cả');
                setSelectedScopeFilter('Tất cả');
                setSelectedTypeFilter('Tất cả');
              }}
              style={{ 
                fontSize: '0.75rem', 
                color: 'var(--color-danger)', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                textDecoration: 'underline',
                marginLeft: 'auto'
              }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Main Project Bento Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.25rem',
        overflowY: 'auto',
        paddingRight: '0.25rem',
        flex: 1
      }}>
      {filteredProjects.map(project => {
        const pStatus = getProjectStatus(project);
        let totalTasks = 0;
        let completedTasks = 0;

        if (project.category === 'Dự án thiết kế' || !project.category) {
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
        const scopes = Array.isArray(project.scope) ? project.scope : (project.scope ? [project.scope] : []);

        return (
          <div 
            key={project.id} 
            className="card" 
            onClick={() => onProjectSelect && onProjectSelect(project.id)}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.85rem', 
              borderTop: `4px solid ${
                pStatus === 'Hoàn thành' ? 'var(--color-success)' :
                pStatus === 'Tạm dừng' ? 'var(--color-warning)' : 'var(--color-primary)'
              }`,
              cursor: 'pointer',
              padding: '1.1rem',
              position: 'relative',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.4)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Image & Quick Action Header */}
            <div className="project-img-container" style={{ position: 'relative', height: '140px' }}>
              {project.image_url ? (
                <img src={project.image_url} alt={project.name} className="project-img" />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.9))' }}>
                  <Folder size={44} opacity={0.4} />
                </div>
              )}

              {/* Status Badge Over Image */}
              <div style={{ 
                position: 'absolute', 
                top: '0.5rem', 
                left: '0.5rem',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(6px)',
                padding: '0.2rem 0.55rem',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: pStatus === 'Hoàn thành' ? 'var(--color-success)' : pStatus === 'Tạm dừng' ? 'var(--color-warning)' : 'var(--color-primary)',
                border: `1px solid ${pStatus === 'Hoàn thành' ? 'rgba(16, 185, 129, 0.3)' : pStatus === 'Tạm dừng' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
              }}>
                {pStatus === 'Hoàn thành' ? <Check size={11} /> : pStatus === 'Tạm dừng' ? <PauseCircle size={11} /> : <Play size={11} />}
                {pStatus}
              </div>

              {/* Edit Button Over Image */}
              <button
                type="button"
                onClick={(e) => handleEditProject(e, project)}
                title="Chỉnh sửa dự án"
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(230, 185, 101, 0.45)',
                  color: '#e6b965',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <Edit2 size={13} />
              </button>
            </div>
            
            {/* Content Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              
              {/* Project Title & Code */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'white', lineHeight: '1.35', margin: 0 }}>
                    {project.name}
                  </h3>
                  {project.project_id_code && (
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      {project.project_id_code}
                    </span>
                  )}
                </div>
              </div>

              {/* Scopes & Type Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.1rem' }}>
                {project.project_type && (
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-primary)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                    {project.project_type}
                  </span>
                )}
                {scopes.map(sc => (
                  <span key={sc} style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', backgroundColor: 'rgba(230, 185, 101, 0.12)', color: '#e6b965', border: '1px solid rgba(230, 185, 101, 0.25)' }}>
                    {sc}
                  </span>
                ))}
              </div>

              {/* Metadata details: Client, Location, Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {project.client && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <User size={13} opacity={0.6} /> <span>{project.client}</span>
                  </div>
                )}
                {project.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={13} opacity={0.6} /> <span>{project.location}</span>
                  </div>
                )}
                {(project.start_month || project.end_month) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} opacity={0.6} />
                    <span>
                      {project.start_month ? project.start_month.split('-').reverse().join('/') : '---'}
                      {' → '}
                      {project.end_month ? project.end_month.split('-').reverse().join('/') : 'Hiện tại'}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar (For Working Projects) */}
              <div style={{ width: '100%', marginTop: 'auto', paddingTop: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tiến độ thiết kế</span>
                  <span style={{ fontWeight: '800', color: pStatus === 'Hoàn thành' ? 'var(--color-success)' : 'var(--color-primary)' }}>
                    {progress}%
                  </span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', height: '5px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${progress}%`, 
                    height: '100%', 
                    backgroundColor: pStatus === 'Hoàn thành' ? 'var(--color-success)' : 'var(--color-primary)', 
                    transition: 'width 0.4s ease' 
                  }}></div>
                </div>
              </div>

            </div>
          </div>
        );
      })}
      
      {filteredProjects.length === 0 && (
        <div className="bento-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-secondary)' }}>
          <Folder size={48} opacity={0.3} style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '1rem', fontWeight: '500' }}>
            {subTab === 'working' ? 'Hiện không có dự án nào đang thực hiện.' : 'Chưa có dự án nào khớp với điều kiện tìm kiếm.'}
          </div>
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
