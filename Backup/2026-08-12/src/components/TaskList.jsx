import React, { useState } from 'react';
import { useTasks, updateTask, deleteTask } from '../db/db';
import { CheckCircle2, Clock, AlertCircle, Trash2, Check, Edit2 } from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';

export default function TaskList() {
  const tasks = useTasks() || [];
  const [selectedTask, setSelectedTask] = useState(null);

  const handleComplete = async (id) => {
    await updateTask(id, { status: 'Done' });
  };

  const handleDelete = async (id) => {
    if(window.confirm('Bạn có chắc muốn xóa công việc này?')) {
      await deleteTask(id);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done': return <CheckCircle2 size={16} color="var(--color-success)" />;
      case 'Doing': return <Clock size={16} color="var(--color-warning)" />;
      default: return <AlertCircle size={16} color="var(--color-primary)" />;
    }
  };

  const getPriorityBadge = (priority) => {
    let bgColor, color;
    switch (priority) {
      case 'High': bgColor = '#fee2e2'; color = 'var(--color-danger)'; break;
      case 'Medium': bgColor = '#dbeafe'; color = 'var(--color-primary)'; break;
      case 'Low': bgColor = '#f3f4f6'; color = 'var(--text-secondary)'; break;
      default: return <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>-</span>;
    }
    return (
      <span style={{ backgroundColor: bgColor, color: color, padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '600' }}>
        {priority}
      </span>
    );
  };

  return (
    <div className="card" style={{ padding: '0' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Tất cả công việc</h3>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Tên công việc</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Trạng thái</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Ưu tiên</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Hạn chót</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: '500', fontSize: '0.875rem' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>{task.title}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {getStatusIcon(task.status)}
                    {task.status}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>{getPriorityBadge(task.priority)}</td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : '-'}
                </td>
                <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button onClick={() => setSelectedTask(task)} style={{ color: 'var(--color-primary)' }} title="Chi tiết">
                    <Edit2 size={18} />
                  </button>
                  {task.status !== 'Done' && (
                    <button onClick={() => handleComplete(task.id)} style={{ color: 'var(--color-success)' }} title="Hoàn thành">
                      <Check size={18} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(task.id)} style={{ color: 'var(--color-danger)' }} title="Xóa">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Chưa có công việc nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
