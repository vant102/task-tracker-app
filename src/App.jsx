import React, { useState } from 'react';
import { LogOut, Search } from 'lucide-react';
import './index.css';
import TaskForm from './components/TaskForm';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import CalendarView from './components/CalendarView';
import PersonalProjectDetail from './components/PersonalProjectDetail';
import EntertainmentDashboard from './components/EntertainmentDashboard';
import LoginScreen from './components/LoginScreen';
import ProjectFormModal from './components/ProjectFormModal';
import { useAuth } from './contexts/AuthContext';
import { useProjects, addProject } from './db/db';

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
            <h1 style={{ 
              background: 'linear-gradient(90deg, var(--color-primary) 35%, #f08967 75%, #ea580c 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              display: 'inline-block', 
              margin: 0,
              fontSize: '2rem',
              fontWeight: '800',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>WorkLife</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="User Avatar" 
                  title={currentUser.email}
                  style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: '2px solid rgba(240, 137, 103, 0.8)', 
                    boxShadow: '0 0 12px rgba(240, 137, 103, 0.4)',
                    cursor: 'pointer'
                  }} 
                />
              ) : (
                <div 
                  title={currentUser.email}
                  style={{ 
                    width: '38px', 
                    height: '38px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #f08967 0%, #ea580c 100%)', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 'bold', 
                    fontSize: '1rem',
                    boxShadow: '0 0 12px rgba(240, 137, 103, 0.4)',
                    cursor: 'pointer'
                  }}
                >
                  {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              
              <button 
                onClick={logout} 
                title="Thoát tài khoản"
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '50%', 
                  color: 'var(--color-danger)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: 'rgba(239, 68, 68, 0.12)', 
                  border: '1px solid rgba(239, 68, 68, 0.25)', 
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                  e.currentTarget.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
          
          {/* Liquid Navigation Bar #2 */}
          <nav className="nav-liquid-bar">
            <button
              className={`nav-liquid-item ${activeTab === 'projects' || activeTab === 'projectDetail' ? 'active' : ''}`}
              onClick={() => { setActiveTab('projects'); setSelectedProjectId(null); }}
            >
              <div className="nav-liquid-icon-container">
                <img src="/Work.svg" alt="Work" className="nav-liquid-icon" />
              </div>
              <span className="nav-liquid-text">Work</span>
            </button>

            <button
              className={`nav-liquid-item ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <div className="nav-liquid-icon-container">
                <img src="/Skills.svg" alt="Skills" className="nav-liquid-icon" />
              </div>
              <span className="nav-liquid-text">Skills</span>
            </button>

            <button
              className={`nav-liquid-item ${activeTab === 'entertainment' ? 'active' : ''}`}
              onClick={() => setActiveTab('entertainment')}
            >
              <div className="nav-liquid-icon-container">
                <img src="/Relax.svg" alt="Relax" className="nav-liquid-icon" />
              </div>
              <span className="nav-liquid-text">Relax</span>
            </button>

            <button
              className={`nav-liquid-item ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              <div className="nav-liquid-icon-container">
                <img src="/Plan.svg" alt="Plan" className="nav-liquid-icon" />
              </div>
              <span className="nav-liquid-text">Plan</span>
            </button>
          </nav>
        </header>

        {/* Main Content */}
        <main className="main-content">
        
        {activeTab === 'projects' && (
          <ProjectList 
            selectedCategories={['Dự án thiết kế']}
            searchQuery={searchQuery}
            onAddProject={() => setIsAddingProject(true)}
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

        {activeTab === 'personal' && <PersonalProjectDetailWrapper />}
        {activeTab === 'entertainment' && <EntertainmentDashboardWrapper />}
        {activeTab === 'calendar' && <CalendarView />}

        {isFormOpen && <TaskForm onClose={() => setIsFormOpen(false)} />}
        {isAddingProject && <ProjectFormModal onClose={() => setIsAddingProject(false)} />}
      </main>
    </div>
    </>
  );
}

// Auto-init "Phát triển bản thân" project if not exists
function PersonalProjectDetailWrapper() {
  const projects = useProjects();
  const project = projects?.find(p => p.category === 'Phát triển bản thân');

  React.useEffect(() => {
    if (projects !== null && !project) {
      addProject({ name: 'Phát triển bản thân', category: 'Phát triển bản thân', color: 'var(--color-primary)' });
    }
  }, [projects, project]);

  if (!project) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Đang khởi tạo...</div>;
  return <PersonalProjectDetail projectId={project.id} project={project} onBack={() => {}} hideBackBtn={true} />;
}

// Auto-init "Giải trí" project if not exists
function EntertainmentDashboardWrapper() {
  const projects = useProjects();
  const project = projects?.find(p => p.category === 'Giải trí');

  React.useEffect(() => {
    if (projects !== null && !project) {
      addProject({ name: 'Giải trí', category: 'Giải trí', color: 'var(--color-purple)' });
    }
  }, [projects, project]);

  if (!project) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Đang khởi tạo...</div>;
  return <EntertainmentDashboard projectId={project.id} project={project} />;
}

export default App;
