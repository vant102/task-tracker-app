import React, { useState, useRef } from 'react';
import { deleteProject, addProject, updateProject, useProjects, useTasks } from '../db/db';
import { Folder, Hash, User, MapPin, Calendar, Plus, CheckCircle2, Clock, Sparkles, Search, Filter, Layers, Building2, Tag, Play, Check, Pause, RefreshCw, Download, Upload, FileSpreadsheet } from 'lucide-react';
import ProjectFormModal from './ProjectFormModal';
import { architecturalProcess } from '../constants/architecturalProcess';
import * as XLSX from 'xlsx';

const SCOPE_OPTIONS = ['Quy hoạch', 'Kiến trúc', 'Nội thất', 'Cảnh quan'];
const TYPE_OPTIONS = ['Thiết kế mới', 'Cải tạo', 'Mở rộng', 'Hoàn thiện nội thất'];
const STATUS_FILTER_OPTIONS = ['Tất cả', 'Đang thực hiện', 'Hoàn thành', 'Tạm dừng'];

export default function ProjectList({ onProjectSelect, onAddProject, selectedCategories = [], searchQuery: externalSearchQuery = '' }) {
  // Check if running on the shared community link (worklife-arch.web.app or worklife-vt.web.app)
  const isLegacyWorklife = typeof window !== 'undefined' && (
    window.location.hostname.includes('worklife-arch') || 
    window.location.hostname.includes('worklife-vt')
  );

  const [subTab, setSubTab] = useState(isLegacyWorklife ? 'all' : 'working'); // 'working' | 'all'
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [yearQuery, setYearQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Tất cả');
  const [selectedScopeFilter, setSelectedScopeFilter] = useState('Tất cả');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('Tất cả');
  const [syncStatus, setSyncStatus] = useState(null);
  const fileInputRef = useRef(null);

  const projects = useProjects() || [];
  const tasks = useTasks() || [];

  // Helper to normalize project status
  const getProjectStatus = (p) => {
    if (p.status === 'Completed' || p.status === 'Hoàn thành' || p.completed === true) return 'Hoàn thành';
    if (p.status === 'Paused' || p.status === 'Tạm dừng') return 'Tạm dừng';
    return 'Đang thực hiện'; // Default to Working
  };

  // Count projects for tab badges
  const workingCount = projects.filter(p => getProjectStatus(p) === 'Đang thực hiện').length;
  const allCount = projects.length;

  // 2-Way Sync Handler: Web App <-> Excel (Worklife_Sync.xlsx)
  const handleTwoWaySync = async () => {
    setSyncStatus('Đang đồng bộ...');
    try {
      // 1. Try local server first (if running on PC)
      const res = await fetch('http://localhost:8081/sync-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSyncStatus('✅ Đã đồng bộ vào Excel!');
        setTimeout(() => setSyncStatus(null), 4000);
        alert(`✅ ĐỒNG BỘ 2 CHIỀU THÀNH CÔNG!\n\nĐã ghi nhận ${projects.length} dự án vào file:\nH:\\My Drive\\Worklife_NVT\\Worklife_Sync.xlsx`);
        return;
      }
    } catch (err) {
      console.log("Local server offline, fallback to client-side XLSX export:", err);
    }

    // 2. Fallback: Export Excel directly from browser
    try {
      const rows = projects.map(p => {
        const scopes = Array.isArray(p.scope) ? p.scope.join(', ') : (p.scope || '');
        const pStatus = getProjectStatus(p);
        return {
          "ID": p.project_id_code || p.ID || p.id || '',
          "Tên Dự Án": p.name || '',
          "Trạng Thái": pStatus === 'Hoàn thành' ? 'Completed' : (pStatus === 'Tạm dừng' ? 'Paused' : 'Working'),
          "Phạm Vi": scopes,
          "Loại Hình": p.project_type || '',
          "Bắt Đầu": p.start_month || '',
          "Kết Thúc": p.end_month || '',
          "Chốt Giai Đoạn": p.phase_deadline || '',
          "Chủ Đầu Tư": p.client || '',
          "Địa Điểm": p.location || '',
          "Phong Cách": p.style || '',
          "Path": p.local_path || p.Path || '',
          "IsOnline": true
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "All_Projects");
      XLSX.writeFile(workbook, "Worklife_Sync.xlsx");

      setSyncStatus('✅ Đã xuất file Excel!');
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (e) {
      console.error("Lỗi xuất Excel:", e);
      setSyncStatus('❌ Lỗi xuất file');
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  // Import Excel into Cloud Firestore
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSyncStatus('Đang đọc file Excel...');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames.includes('All_Projects') ? 'All_Projects' : workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const importedRows = XLSX.utils.sheet_to_json(sheet);

      let addedCount = 0;
      let updatedCount = 0;

      for (const row of importedRows) {
        const idCode = String(row['ID'] || row['Mã'] || '').trim();
        const name = String(row['Tên Dự Án'] || row['Ten Du An'] || '').trim();
        if (!name) continue;

        const scopeRaw = String(row['Phạm Vi'] || row['Phạm vi'] || 'Kiến trúc');
        const scopes = scopeRaw.split(',').map(s => s.trim()).filter(Boolean);

        const projectData = {
          name,
          project_id_code: idCode,
          status: String(row['Trạng Thái'] || row['Status'] || 'Working').trim(),
          scope: scopes.length > 0 ? scopes : ['Kiến trúc'],
          project_type: String(row['Loại Hình'] || row['Type'] || 'Thiết kế mới').trim(),
          start_month: String(row['Bắt Đầu'] || row['Start'] || '').trim(),
          end_month: String(row['Kết Thúc'] || row['End'] || '').trim(),
          phase_deadline: row['Chốt Giai Đoạn'] ? String(row['Chốt Giai Đoạn']).trim() : null,
          client: String(row['Chủ Đầu Tư'] || row['Client'] || '').trim(),
          location: String(row['Địa Điểm'] || row['Location'] || '').trim(),
          style: String(row['Phong Cách'] || row['Style'] || '').trim(),
          local_path: String(row['Path'] || '').trim(),
          category: 'Dự án thiết kế',
          completed: String(row['Trạng Thái']).toLowerCase().includes('complete') || String(row['Trạng Thái']).toLowerCase().includes('hoàn thành'),
          updatedAt: new Date().toISOString()
        };

        const existing = projects.find(p => (idCode && p.project_id_code === idCode) || (p.name === name));
        if (existing) {
          await updateProject(existing.id, projectData);
          updatedCount++;
        } else {
          await addProject(projectData);
          addedCount++;
        }
      }

      setSyncStatus('✅ Nhập Excel thành công!');
      setTimeout(() => setSyncStatus(null), 4000);
      alert(`✅ ĐÃ ĐỒNG BỘ DỮ LIỆU TỪ EXCEL LÊN CLOUD!\n\n- Dự án mới tạo: ${addedCount}\n- Dự án đã cập nhật: ${updatedCount}`);
    } catch (err) {
      console.error("Lỗi khi nhập Excel:", err);
      alert("Lỗi khi đọc file Excel: " + err.message);
    } finally {
      e.target.value = '';
    }
  };

  // Filter projects according to active subTab and multi-dimensional filters
  const filteredProjects = projects.filter(p => {
    const pStatus = getProjectStatus(p);
    
    // SubTab filter: If on legacy worklife, show all. If on allin-nvt and subTab === 'working', filter working.
    if (!isLegacyWorklife && subTab === 'working' && pStatus !== 'Đang thực hiện') {
      return false;
    }

    // Category filter
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category || 'Dự án thiết kế');
    if (!matchCategory) return false;

    // Search query filter (Name, ID, Client, Location, Style)
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchName = p.name?.toLowerCase().includes(query);
      const matchCode = p.project_id_code?.toLowerCase().includes(query);
      const matchClient = p.client?.toLowerCase().includes(query);
      const matchLocation = p.location?.toLowerCase().includes(query);
      const matchStyle = p.style?.toLowerCase().includes(query);
      if (!matchName && !matchCode && !matchClient && !matchLocation && !matchStyle) return false;
    }

    // Additional filters (available when in 'all' subtab or on legacy single-page view)
    if (subTab === 'all' || isLegacyWorklife) {
      // 1. Year input filter (YYYY e.g. 2012, 2026) matching start_month and end_month range
      if (yearQuery.trim()) {
        const targetYear = parseInt(yearQuery.trim(), 10);
        if (!isNaN(targetYear)) {
          const startY = p.start_month ? parseInt(p.start_month.split('-')[0], 10) : (p.start_date ? new Date(p.start_date).getFullYear() : null);
          const endY = p.end_month ? parseInt(p.end_month.split('-')[0], 10) : (p.end_date ? new Date(p.end_date).getFullYear() : null);
          const rawYear = p.Nam ? parseInt(p.Nam, 10) : null;
          const codeYear = (p.project_id_code && p.project_id_code.includes('_')) ? parseInt(p.project_id_code.split('_')[0], 10) : null;

          let matchYear = false;
          if (startY && endY) {
            matchYear = targetYear >= Math.min(startY, endY) && targetYear <= Math.max(startY, endY);
          } else if (startY) {
            matchYear = targetYear === startY;
          } else if (endY) {
            matchYear = targetYear === endY;
          } else if (rawYear) {
            matchYear = targetYear === rawYear;
          } else if (codeYear) {
            matchYear = targetYear === codeYear;
          }

          if (!matchYear) return false;
        }
      }

      // 2. Status filter
      if (selectedStatusFilter !== 'Tất cả') {
        if (pStatus !== selectedStatusFilter) return false;
      }

      // 3. Scope filter
      if (selectedScopeFilter !== 'Tất cả') {
        const pScopes = Array.isArray(p.scope) ? p.scope : (p.scope ? [p.scope] : []);
        if (!pScopes.includes(selectedScopeFilter)) return false;
      }

      // 4. Type filter
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
        
        {/* Left Side: Sub-Tabs (Only shown on allin-nvt / new app; hidden on legacy worklife-vt) */}
        {!isLegacyWorklife ? (
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
                padding: '0.45rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: subTab === 'working' ? '700' : '500',
                color: subTab === 'working' ? '#e6b965' : 'var(--text-secondary)',
                background: subTab === 'working' ? 'linear-gradient(135deg, rgba(230, 185, 101, 0.15) 0%, rgba(178, 142, 65, 0.25) 100%)' : 'transparent',
                border: subTab === 'working' ? '1px solid rgba(230, 185, 101, 0.35)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Play size={14} fill={subTab === 'working' ? '#e6b965' : 'transparent'} />
              Working
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
                padding: '0.45rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: subTab === 'all' ? '700' : '500',
                color: subTab === 'all' ? 'var(--color-primary)' : 'var(--text-secondary)',
                background: subTab === 'all' ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
                border: subTab === 'all' ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Folder size={14} />
              All
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
        ) : (
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Folder size={20} color="var(--color-primary)" /> Danh Sách Dự Án ({allCount})
          </div>
        )}

        {/* Right Controls: Search, 2-Way Sync (on allin-nvt), Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
          {/* Search Box */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'var(--bg-main)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '9999px', 
            padding: '0.3rem 0.85rem',
            width: '200px'
          }}>
            <Search size={15} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
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

          {/* 2-Way Excel Sync Buttons (Active on allin-nvt; Hidden on worklife-vt) */}
          {!isLegacyWorklife && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept=".xlsx,.xls" 
                style={{ display: 'none' }} 
                onChange={handleImportExcel} 
              />
              
              <button
                onClick={handleTwoWaySync}
                title="Đồng bộ 2 chiều: Ghi nhận danh sách dự án từ Web App vào file Excel Worklife_Sync.xlsx"
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#10b981',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.25)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)'}
              >
                <RefreshCw size={14} /> Đồng bộ Excel
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                title="Nhập dữ liệu dự án từ file Excel vào Web App"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <Upload size={15} />
              </button>
            </div>
          )}

          {syncStatus && (
            <span style={{ fontSize: '0.78rem', color: '#e6b965', fontWeight: '500' }}>
              {syncStatus}
            </span>
          )}

          {/* Add Project Button */}
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

      {/* Filter Bar (Shown on All subtab, or always on legacy worklife-vt) */}
      {(subTab === 'all' || isLegacyWorklife) && (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 'bold', marginRight: '0.3rem' }}>
            <Filter size={14} /> Bộ lọc:
          </div>

          {/* 1. Nhập Số Năm (YYYY ví dụ 2012, 2026) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Năm:</span>
            <input 
              type="number" 
              placeholder="VD: 2026" 
              value={yearQuery} 
              onChange={e => setYearQuery(e.target.value)}
              className="glass-input" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderRadius: '6px', width: '90px' }} 
            />
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

          {/* Reset Filters button */}
          {(yearQuery || selectedStatusFilter !== 'Tất cả' || selectedScopeFilter !== 'Tất cả' || selectedTypeFilter !== 'Tất cả') && (
            <button
              onClick={() => {
                setYearQuery('');
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', 
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
                pStatus === 'Hoàn thành' ? '#10b981' :
                pStatus === 'Tạm dừng' ? '#f59e0b' : 'var(--color-primary)'
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
            {/* Image Box */}
            <div className="project-img-container" style={{ position: 'relative', height: '140px' }}>
              {project.image_url ? (
                <img src={project.image_url} alt={project.name} className="project-img" />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.9))' }}>
                  <Folder size={44} opacity={0.4} />
                </div>
              )}

              {/* Status Indicator Icon (My Progress Board style) */}
              <div 
                title={`Trạng thái: ${pStatus}`}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(6px)',
                  border: `1px solid ${
                    pStatus === 'Hoàn thành' ? 'rgba(16, 185, 129, 0.45)' :
                    pStatus === 'Tạm dừng' ? 'rgba(245, 158, 11, 0.45)' : 'rgba(59, 130, 246, 0.45)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                {pStatus === 'Hoàn thành' ? (
                  <Check size={16} strokeWidth={3} color="#10b981" />
                ) : pStatus === 'Tạm dừng' ? (
                  <Pause size={14} fill="#f59e0b" color="#f59e0b" />
                ) : (
                  <Play size={14} fill="#3b82f6" color="#3b82f6" />
                )}
              </div>
            </div>
            
            {/* Content Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', flex: 1 }}>
              
              {/* 1.1: Tên Dự án (2 dòng chừa sẵn đều nhau) */}
              <h3 style={{ 
                fontSize: '1.05rem', 
                fontWeight: '700', 
                color: 'white', 
                lineHeight: '1.4', 
                margin: 0,
                minHeight: '2.8em',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {project.name}
              </h3>

              {/* 1.2: Mã ID, Chủ đầu tư, Địa điểm - Mỗi mục 1 hàng độc lập */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {/* Hàng 1: Mã ID */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#94a3b8', fontWeight: '500' }}>Mã ID:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                    {project.project_id_code || project.ID || '---'}
                  </span>
                </div>

                {/* Hàng 2: Tên chủ đầu tư */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#94a3b8', fontWeight: '500' }}>Chủ đầu tư:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.client || '---'}
                  </span>
                </div>

                {/* Hàng 3: Địa điểm */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#94a3b8', fontWeight: '500' }}>Địa điểm:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.location || '---'}
                  </span>
                </div>
              </div>

              {/* 1.3: Với dự án Đang thực hiện -> Có thêm 2 dòng: Chốt giai đoạn & Ngày/Giờ */}
              {pStatus === 'Đang thực hiện' && project.phase_deadline && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.15rem', 
                  backgroundColor: 'rgba(15, 23, 42, 0.45)', 
                  padding: '0.4rem 0.6rem', 
                  borderRadius: '6px', 
                  border: '1px solid rgba(230, 185, 101, 0.25)',
                  marginTop: '0.2rem'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#e6b965', fontWeight: '600' }}>
                    Chốt giai đoạn:
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                    {(() => {
                      try {
                        const d = new Date(project.phase_deadline);
                        const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        const hh = String(d.getHours()).padStart(2, '0');
                        const min = String(d.getMinutes()).padStart(2, '0');
                        if (hh !== '00' || min !== '00') {
                          return `${dateStr} • ${hh}:${min}`;
                        }
                        return dateStr;
                      } catch (e) {
                        return project.phase_deadline;
                      }
                    })()}
                  </span>
                </div>
              )}

              {/* Scopes & Type Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.15rem' }}>
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

              {/* Progress Bar */}
              <div style={{ width: '100%', marginTop: 'auto', paddingTop: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tiến độ</span>
                  <span style={{ fontWeight: '800', color: pStatus === 'Hoàn thành' ? '#10b981' : pStatus === 'Tạm dừng' ? '#f59e0b' : 'var(--color-primary)' }}>
                    {progress}%
                  </span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', height: '5px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${progress}%`, 
                    height: '100%', 
                    backgroundColor: pStatus === 'Hoàn thành' ? '#10b981' : pStatus === 'Tạm dừng' ? '#f59e0b' : 'var(--color-primary)', 
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
