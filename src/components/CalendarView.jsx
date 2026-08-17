import React, { useState } from 'react';
import { useTasks, useProjects } from '../db/db';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Clock, Sparkles, AlertCircle, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import '../index.css';
import EventModal from './EventModal';

moment.locale('vi');
const localizer = momentLocalizer(moment);

const CustomToolbar = (toolbar) => {
  const goToBack = () => { toolbar.onNavigate('PREV'); };
  const goToNext = () => { toolbar.onNavigate('NEXT'); };
  const goToCurrent = () => { toolbar.onNavigate('TODAY'); };
  
  const label = () => {
    const date = moment(toolbar.date);
    return <span>{date.format('MMMM')} <b>{date.format('YYYY')}</b></span>;
  };

  return (
    <div className="rbc-toolbar custom-toolbar" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '0.5rem', position: 'relative', zIndex: 100 }}>
      <div style={{ display: 'flex', gap: '0.6rem' }}>
        <button type="button" onClick={goToBack} title="Trước">
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <button type="button" onClick={goToCurrent} title="Hôm nay">
          <CalendarIcon size={18} strokeWidth={2.2} />
        </button>
        <button type="button" onClick={goToNext} title="Sau">
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>
      
      <div className="rbc-toolbar-label" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-primary)', textAlign: 'center', flex: 1, minWidth: '120px', fontFamily: 'Space Grotesk, sans-serif' }}>
        {label()}
      </div>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => toolbar.onView('month')} className={toolbar.view === 'month' ? 'rbc-active' : ''} title="Tháng">
          <LayoutGrid size={18} strokeWidth={2.2} />
        </button>
        <button type="button" onClick={() => toolbar.onView('agenda')} className={toolbar.view === 'agenda' ? 'rbc-active' : ''} title="Lịch trình">
          <List size={18} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};

export default function CalendarView() {
  const tasks = useTasks() || [];
  const projects = useProjects() || [];
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  // Convert tasks to BigCalendar events
  const taskEvents = tasks
    .filter(task => task.deadline && moment(task.deadline).isValid())
    .map(task => ({
      id: task.id,
      title: task.title,
      start: moment(task.deadline).toDate(),
      end: moment(task.deadline).add(1, 'hour').toDate(),
      allDay: false,
      priority: task.priority,
      status: task.status,
      type: 'task'
    }));

  // Convert project phase deadlines to BigCalendar events
  const projectEvents = projects
    .filter(p => p.phase_deadline && moment(p.phase_deadline).isValid())
    .map(p => {
      const deadline = moment(p.phase_deadline);
      deadline.set({ hour: 8, minute: 0, second: 0, millisecond: 0 });
      return {
        id: p.id + '_phase',
        title: p.name,
        start: deadline.toDate(),
        end: deadline.toDate(),
        allDay: false,
        status: p.status,
        type: 'project'
      };
    });

  const events = [...taskEvents, ...projectEvents];

  // Today's events count
  const todayEvents = events.filter(e => moment(e.start).isSame(moment(), 'day'));

  const eventStyleGetter = (event, start, end, isSelected) => {
    if (currentView === 'agenda') return {};

    let background = 'linear-gradient(135deg, #fdf6dc 0%, #dec281 50%, #b28e41 100%)';
    let border = '1px solid #7a5c24';
    let color = '#3e2723';
    let textShadow = '0 1px 0 rgba(255,255,255,0.4)';

    if (event.type === 'task') {
      if (event.status === 'Đã tham gia' || event.status === 'Done') {
        background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        border = '1px solid #047857';
        color = 'white';
        textShadow = '0 1px 2px rgba(0,0,0,0.5)';
      } else if (event.status === 'Lỡ hẹn') {
        background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        border = '1px solid #b91c1c';
        color = 'white';
        textShadow = '0 1px 2px rgba(0,0,0,0.5)';
      }
    } else if (event.type === 'project') {
      if (moment(event.end).isBefore(moment(), 'day')) {
        background = 'linear-gradient(135deg, #64748b 0%, #475569 100%)';
        border = '1px solid #334155';
        color = '#f8fafc';
      }
    }

    return {
      style: {
        background,
        border,
        color,
        borderRadius: '9999px',
        opacity: 0.95,
        display: 'block',
        fontWeight: '700',
        padding: '3px 10px',
        boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
        textShadow,
        textAlign: 'center',
        fontSize: '0.82rem'
      }
    };
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedEvent(null);
    setSelectedDate(slotInfo.start);
    setShowEventModal(true);
  };

  const handleSelectEvent = (event) => {
    // Chỉ cho phép sửa nếu đó là task (sự kiện), không cho sửa phase của project trực tiếp ở đây
    if (event.type === 'task') {
      const fullTask = tasks.find(t => t.id === event.id);
      setSelectedEvent(fullTask);
      setSelectedDate(null);
      setShowEventModal(true);
    }
  };

  const handleDrillDown = (date, view) => {
    setSelectedEvent(null);
    setSelectedDate(date);
    setShowEventModal(true);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      


      {/* Main Calendar Bento Panel */}
      <div className="card" style={{ height: '70vh', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
        <Calendar
          localizer={localizer}
          events={events}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          view={currentView}
          onView={(newView) => setCurrentView(newView)}
          views={['month', 'agenda']}
          formats={{
            agendaDateFormat: 'YY/MM/DD',
            agendaTimeFormat: 'HH:mm',
            timeGutterFormat: 'HH:mm'
          }}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          selectable={true}
          longPressThreshold={10}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onDrillDown={handleDrillDown}
          components={{
            toolbar: CustomToolbar,
            agenda: {
              time: ({ event }) => (
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '1rem', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <span style={{ marginBottom: '0.25rem' }}>{moment(event.start).format('YY/MM/DD')}</span>
                  <span>{moment(event.start).format('HH:mm')}</span>
                </div>
              )
            }
          }}
        />
      </div>

      {showEventModal && (
        <EventModal 
          event={selectedEvent}
          defaultDate={selectedDate}
          onClose={() => setShowEventModal(false)}
        />
      )}
    </div>
  );
}
