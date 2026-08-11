import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useTasks } from '../db/db';

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#6b7280'
};

export default function Dashboard() {
  const tasks = useTasks() || [];

  // Calculate KPIs
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'Doing').length;
  const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'Done').length;

  // Prepare data for Status Pie Chart
  const statusData = [
    { name: 'To do', value: tasks.filter(t => t.status === 'To do').length, color: COLORS.primary },
    { name: 'Đang làm', value: inProgressTasks, color: COLORS.warning },
    { name: 'Hoàn thành', value: completedTasks, color: COLORS.success }
  ].filter(item => item.value > 0);

  // Prepare data for Priority Pie Chart
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'High').length, color: COLORS.danger },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'Medium').length, color: COLORS.primary },
    { name: 'Low', value: tasks.filter(t => t.priority === 'Low').length, color: COLORS.text }
  ].filter(item => item.value > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <KpiCard title="Tổng công việc" value={totalTasks} color={COLORS.primary} />
        <KpiCard title="Hoàn thành" value={completedTasks} color={COLORS.success} />
        <KpiCard title="Đang làm" value={inProgressTasks} color={COLORS.warning} />
        <KpiCard title="Quá hạn" value={overdueTasks} color={COLORS.danger} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Status Chart */}
        <div className="card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>Trạng thái công việc</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Chart */}
        <div className="card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>Mức độ ưu tiên</h3>
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, color }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: `4px solid ${color}` }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{title}</span>
      <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
