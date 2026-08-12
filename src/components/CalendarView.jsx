import React, { useState } from 'react';
import { useTasks, useProjects } from '../db/db';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import TaskDetailModal from './TaskDetailModal';
import '../index.css';

moment.locale('vi');
const localizer = momentLocalizer(moment);

export default function CalendarView() {
  const tasks = useTasks() || [];
  const projects = useProjects() || [];

  // Convert tasks to BigCalendar events
  const taskEvents = tasks
    .filter(task => task.deadline && moment(task.deadline).isValid()) // Only tasks with a valid deadline
    .map(task => ({
      id: task.id,
      title: task.title,
      start: task.deadline ? moment(task.deadline).toDate() : new Date(),
      end: task.deadline ? moment(task.deadline).toDate() : new Date(), // For simple tasks, start and end can be the same day
      allDay: true,
      priority: task.priority,
      status: task.status,
      type: 'task'
    }));

  // Convert project phase deadlines to BigCalendar events
  const projectEvents = projects
    .filter(p => p.phase_deadline && moment(p.phase_deadline).isValid())
    .map(p => ({
      id: p.id + '_phase',
      title: p.name,
      start: moment(p.phase_deadline).toDate(),
      end: moment(p.phase_deadline).toDate(),
      allDay: true,
      status: p.status,
      type: 'project'
    }));

  const events = [...taskEvents, ...projectEvents];

  const eventStyleGetter = (event, start, end, isSelected) => {
    let background = 'linear-gradient(to bottom, #fdf6dc, #dec281, #b28e41)';
    let border = '1px solid #7a5c24';
    let color = '#3e2723';
    let textShadow = '0 1px 0 rgba(255,255,255,0.4)';

    if (event.type === 'task') {
      if (event.status === 'Đã tham gia') {
        background = 'linear-gradient(to bottom, #d4fc79, #96e6a1)';
        border = '1px solid #4caf50';
      } else if (event.status === 'Lỡ hẹn') {
        background = 'linear-gradient(to bottom, #ff9966, #ff5e62)';
        border = '1px solid #d32f2f';
        color = 'white';
        textShadow = '0 1px 2px rgba(0,0,0,0.5)';
      }
    } else if (event.type === 'project') {
      if (moment(event.end).isBefore(moment(), 'day')) {
        background = 'linear-gradient(to bottom, #e0e0e0, #9e9e9e)';
        border = '1px solid #757575';
        color = '#212121';
      }
    }

    return {
      style: {
        background,
        border,
        color,
        borderRadius: '9999px',
        opacity: 0.9,
        display: 'block',
        fontWeight: '600',
        padding: '2px 8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        textShadow,
        textAlign: 'center'
      }
    };
  };

  return (
    <div className="card" style={{ height: '70vh', padding: '1rem' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        messages={{
          next: "Tiếp",
          previous: "Trước",
          today: "Hôm nay",
          month: "Tháng",
          week: "Tuần",
          day: "Ngày",
          agenda: "Lịch trình"
        }}
      />
    </div>
  );
}
