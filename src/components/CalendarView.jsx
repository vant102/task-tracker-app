import React, { useState } from 'react';
import { useTasks } from '../db/db';
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

  // Convert tasks to BigCalendar events
  const events = tasks
    .filter(task => task.deadline) // Only tasks with a deadline
    .map(task => ({
      id: task.id,
      title: task.title,
      start: new Date(task.deadline),
      end: new Date(task.deadline), // For simple tasks, start and end can be the same day
      allDay: true,
      priority: task.priority,
      status: task.status
    }));

  const eventStyleGetter = (event, start, end, isSelected) => {
    return {
      style: {
        background: 'linear-gradient(to bottom, #fdf6dc, #dec281, #b28e41)',
        border: '1px solid #7a5c24',
        color: '#3e2723',
        borderRadius: '9999px',
        opacity: 0.9,
        display: 'block',
        fontWeight: '600',
        padding: '2px 8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        textShadow: '0 1px 0 rgba(255,255,255,0.4)',
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
