import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, CheckSquare, Layers, Users, Calendar, AlertCircle, Menu, Settings, Search, Target, Coffee, LogOut } from 'lucide-react';
import './index.css';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import CalendarView from './components/CalendarView';
import PersonalProjectDetail from './components/PersonalProjectDetail';
import EntertainmentDashboard from './components/EntertainmentDashboard';
import LoginScreen from './components/LoginScreen';
import ProjectFormModal from './components/ProjectFormModal';
import { useAuth } from './contexts/AuthContext';
// import { injectMockData } from './db/mockData'; // Disable mock data for Firebase

function App() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <>
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="app-container glass-panel">
        {/* Header - Top Navigation */}
        <header className="header-main">
          <div className="title-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1>Task Manager</h1>
              <button 
                onClick={() => setIsAddingProject(true)}
                style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '500' }}
              >
                + Thêm Dự án mới
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{currentUser.email}</span>
              <button onClick={logout} style={{ color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                <LogOut size={16} /> Thoát
              </button>
            </div>
          </div>
          
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'projects' || activeTab === 'projectDetail' ? 'active' : ''}`}
              onClick={() => { setActiveTab('projects'); setSelectedProjectId(null); }}
            >
              Dự án thiết kế
            </button>
            <button 
              className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              Phát triển bản thân
            </button>
            <button 
              className={`tab-btn ${activeTab === 'entertainment' ? 'active' : ''}`}
              onClick={() => setActiveTab('entertainment')}
            >
              Giải trí
            </button>
            <button 
              className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              Lịch
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', minWidth: '250px', justifyContent: 'flex-end' }}>
            {activeTab === 'projects' && (
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-main)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', padding: '0 0.5rem' }}>
                <Search size={16} color="var(--text-secondary)" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm dự án..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', padding: '0.5rem', fontSize: '0.875rem', width: '200px', color: 'var(--text-primary)' }}
                />
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
        
        
        {activeTab === 'projects' && (
          <ProjectList 
            selectedCategories={['Dự án thiết kế']}
            searchQuery={searchQuery}
            onProjectSelect={(id) => {
              setSelectedProjectId(id);
              setActiveTab('projectDetail');
            }} 
          />
        )}
        {activeTab === 'projectDetail' && (
          <ProjectDetail 
            projectId={selectedProjectId} 
            onBack={() => {
              setSelectedProjectId(null);
              setActiveTab('projects');
            }} 
          />
        )}

        {/* Cấu trúc mới đi thẳng vào trang */}
        {activeTab === 'personal' && <PersonalProjectDetailWrapper />}
        {activeTab === 'entertainment' && <EntertainmentDashboard />}

        {activeTab === 'calendar' && <CalendarView />}

        {isFormOpen && <TaskForm onClose={() => setIsFormOpen(false)} />}
        {isAddingProject && <ProjectFormModal onClose={() => setIsAddingProject(false)} />}
      </main>
    </div>
    </>
  );
}


// Wrapper to dynamically pass the personal project ID
import { useProjects } from './db/db';
function PersonalProjectDetailWrapper() {
  const projects = useProjects();
  const project = projects?.find(p => p.category === 'Phát triển bản thân');
  if (!project) return <div style={{ padding: '2rem', textAlign: 'center' }}>Không tìm thấy dự án Phát triển bản thân</div>;
  return <PersonalProjectDetail projectId={project.id} project={project} onBack={() => {}} hideBackBtn={true} />;
}

export default App;
