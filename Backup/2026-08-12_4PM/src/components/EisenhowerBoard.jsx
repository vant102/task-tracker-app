import React from 'react';
import { useTasks, updateTask } from '../db/db';
import TaskDetailModal from './TaskDetailModal';

export default function EisenhowerBoard() {
  const [selectedTask, setSelectedTask] = React.useState(null);
  const tasks = useTasks() || [];

  const getTasksByQuadrant = (importance, urgency) => {
    return tasks.filter(t => t.importance === importance && t.urgency === urgency);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', height: '100%' }}>
      
      {/* Do First (Important & Urgent) */}
      <Quadrant 
        title="Làm ngay (Do First)" 
        description="Quan trọng & Khẩn cấp" 
        tasks={getTasksByQuadrant(true, true)} 
        color="#ef4444" 
        bgColor="#fee2e2" 
      />

      {/* Schedule (Important & Not Urgent) */}
      <Quadrant 
        title="Lên lịch (Schedule)" 
        description="Quan trọng & Không khẩn cấp" 
        tasks={getTasksByQuadrant(true, false)} 
        color="#3b82f6" 
        bgColor="#dbeafe" 
      />

      {/* Delegate (Not Important & Urgent) */}
      <Quadrant 
        title="Giao việc (Delegate)" 
        description="Không quan trọng & Khẩn cấp" 
        tasks={getTasksByQuadrant(false, true)} 
        color="#f59e0b" 
        bgColor="#fef3c7" 
      />

      {/* Eliminate (Not Important & Not Urgent) */}
      <Quadrant 
        title="Loại bỏ (Eliminate)" 
        description="Không quan trọng & Không khẩn cấp" 
        tasks={getTasksByQuadrant(false, false)} 
        color="#6b7280" 
        bgColor="#f3f4f6" 
      />

    </div>
  );
}

function Quadrant({ title, description, tasks, color, bgColor }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid ${color}` }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{title}</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{description}</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1 }}>
        {tasks.map(task => (
          <div key={task.id} style={{ backgroundColor: bgColor, padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{task.title}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Trạng thái: {task.status}</span>
          </div>
        ))}
        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Trống
          </div>
        )}
      </div>
    </div>
  );
}
