import React, { useState } from 'react';
import { updateTask, deleteTask } from '../db/db';
import { X, Clock, Target, FileText, Bookmark, Link as LinkIcon, Edit2, Trash2 } from 'lucide-react';

export default function TaskDetailModal({ task, onClose }) {
  const [notes, setNotes] = useState(task.notes || '');
  const [chiTiet, setChiTiet] = useState(task.chi_tiet || '');
  const [quyTac, setQuyTac] = useState(task.quy_tac || '');
  const [lessonsLog, setLessonsLog] = useState(task.lessons_log || []);
  const [newLessonDate, setNewLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLessonNumber, setNewLessonNumber] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  
  // States for Habit Notes
  const [habitNotes, setHabitNotes] = useState(task.habit_notes || []);
  const [searchDate, setSearchDate] = useState('');
  const [newHabitDate, setNewHabitDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState(task.title || '');
  const [status, setStatus] = useState(task.status || 'Chuẩn bị');
  const [startDate, setStartDate] = useState(task.start_date || '');
  const [endDate, setEndDate] = useState(task.end_date || '');
  const [target, setTarget] = useState(task.target || 1);

  const handleSave = async () => {
    await updateTask(task.id, { 
      title, status, start_date: startDate, end_date: endDate, target,
      notes, chi_tiet: chiTiet, quy_tac: quyTac, 
      lessons_log: lessonsLog, habit_notes: habitNotes 
    });
    onClose();
  };

  const handleAddLesson = () => {
    const lessonNum = parseInt(newLessonNumber, 10);
    if (isNaN(lessonNum) || !newLessonContent || !newLessonDate) {
      alert('Vui lòng nhập đầy đủ thông tin: Ngày, Số bài và Nội dung.');
      return;
    }
    
    const newLesson = {
      id: Date.now(),
      lesson_number: lessonNum,
      date: newLessonDate,
      content: newLessonContent
    };
    
    setLessonsLog([...lessonsLog, newLesson].sort((a, b) => a.lesson_number - b.lesson_number));
    setNewLessonNumber('');
    setNewLessonContent('');
  };

  const handleAddHabitNote = () => {
    if (!newHabitDate || !newHabitContent) {
      alert('Vui lòng nhập ngày và nội dung ghi chú.');
      return;
    }
    const newNote = {
      id: Date.now(),
      date: newHabitDate,
      content: newHabitContent
    };
    setHabitNotes([...habitNotes, newNote].sort((a, b) => new Date(b.date) - new Date(a.date)));
    setNewHabitContent('');
  };

  const handleDeleteHabitNote = (id) => {
    if (window.confirm('Xóa ghi chú này?')) {
      setHabitNotes(habitNotes.filter(n => n.id !== id));
    }
  };

  const filteredHabitNotes = searchDate 
    ? habitNotes.filter(n => n.date === searchDate) 
    : habitNotes;

  const handleDeleteLesson = (id) => {
    if (window.confirm('Xóa bài này?')) {
      setLessonsLog(lessonsLog.filter(l => l.id !== id));
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      await deleteTask(task.id);
      onClose();
    }
  };

  const calculateTimeRemaining = (deadline) => {
    if (!deadline) return 'Không thời hạn';
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff < 0) return 'Đã quá hạn';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `Còn ${days} ngày`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `Còn ${hours} giờ`;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ width: '90vw', height: '90vh', maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: 'var(--shadow-lg)', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, marginRight: '1rem' }}>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Tên mục tiêu..."
              style={{ width: '100%', fontSize: '1.5rem', fontWeight: 'bold', backgroundColor: 'transparent', border: 'none', borderBottom: '2px solid transparent', outline: 'none', color: 'var(--text-primary)', padding: '0.25rem 0' }}
              onFocus={e => e.target.style.borderBottom = '2px solid var(--color-primary)'}
              onBlur={e => e.target.style.borderBottom = '2px solid transparent'}
            />
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}><X size={24} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: task.task_type === 'Project' ? '1fr' : '1fr 1fr', gap: '1rem', backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          {task.task_type === 'Project' ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="var(--color-primary)" />
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Kế hoạch:</span>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.25rem', fontSize: '0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>-</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.25rem', fontSize: '0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={16} color="var(--color-success)" />
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Trạng thái:</span>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <option value="Chuẩn bị">Chuẩn bị</option>
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Đã hoàn thành">Đã hoàn thành</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Tổng số bài:</span>
                <input type="number" value={target} onChange={e => setTarget(parseInt(e.target.value) || 0)} style={{ width: '80px', padding: '0.25rem', fontSize: '0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none', textAlign: 'center' }} />
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="var(--color-primary)" />
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Thời hạn:</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-warning)', fontWeight: 'bold' }}>Không áp dụng</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={16} color="var(--color-success)" />
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Trạng thái:</span>
                <span style={{ fontSize: '0.875rem' }}>{task.status || 'To do'}</span>
              </div>
            </>
          )}
        </div>

        {/* Extra Metadata Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              <Bookmark size={14} /> Thông tin chi tiết
            </label>
            <input type="text" value={chiTiet} onChange={e => setChiTiet(e.target.value)} placeholder="Chi tiết..." style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', fontSize: '0.875rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              <LinkIcon size={14} /> Quy tắc
            </label>
            <input type="text" value={quyTac} onChange={e => setQuyTac(e.target.value)} placeholder="Quy tắc..." style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', fontSize: '0.875rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        {task.task_type === 'Habit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                <FileText size={16} /> Nhật ký Thói quen
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lọc ngày:</span>
                <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }} />
                {searchDate && (
                  <button onClick={() => setSearchDate('')} style={{ fontSize: '0.75rem', color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa lọc</button>
                )}
              </div>
            </div>

            {/* Inline Add Habit Note Form */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '130px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ngày</span>
                <input type="date" value={newHabitDate} onChange={e => setNewHabitDate(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nhật ký</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Ghi chú thêm về công việc này..." value={newHabitContent} onChange={e => setNewHabitContent(e.target.value)} style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }} />
                  <button onClick={handleAddHabitNote} className="btn-gold" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Thêm</button>
                </div>
              </div>
            </div>
            
            <div style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', overflowY: 'auto' }}>
              {filteredHabitNotes.length === 0 && (
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '0.5rem', textAlign: 'center' }}>Chưa có nhật ký nào.</div>
              )}
              {filteredHabitNotes.map(note => (
                <div key={note.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--color-primary)', fontSize: '0.85rem', width: '90px', fontWeight: '500' }}>{new Date(note.date).toLocaleDateString('vi-VN')}</span>
                    <span>{note.content}</span>
                  </div>
                  <button onClick={() => handleDeleteHabitNote(note.id)} style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {task.task_type === 'Project' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              <Target size={16} /> Nhật ký
            </label>

            {/* Inline Add Lesson Form */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', backgroundColor: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '120px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ngày</span>
                <input type="date" value={newLessonDate} onChange={e => setNewLessonDate(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '70px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bài số</span>
                <input type="number" placeholder="1, 2..." value={newLessonNumber} onChange={e => setNewLessonNumber(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nội dung bài</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" placeholder="Mô tả..." value={newLessonContent} onChange={e => setNewLessonContent(e.target.value)} style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }} />
                  <button onClick={handleAddLesson} className="btn-gold" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>Thêm</button>
                </div>
              </div>
            </div>
            
            <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              {lessonsLog.length === 0 && (
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '0.5rem' }}>Chưa có bài học nào được ghi nhận.</div>
              )}
              {lessonsLog.map(lesson => (
                <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-main)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', width: '45px' }}>Bài {lesson.lesson_number}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', width: '80px' }}>{new Date(lesson.date).toLocaleDateString('vi-VN')}</span>
                    <span>{lesson.content}</span>
                  </div>
                  <button onClick={() => handleDeleteLesson(lesson.id)} style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
          <button onClick={handleDelete} style={{ padding: '0.5rem 1rem', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', background: 'transparent', border: 'none' }}>
            <Trash2 size={16} /> Xóa mục này
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={onClose} style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Đóng</button>
            <button onClick={handleSave} className="btn-gold">Lưu thay đổi</button>
          </div>
        </div>

      </div>
    </div>
  );
}
