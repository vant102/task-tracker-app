import React, { useState, useEffect } from 'react';
import { Play, Square, Timer } from 'lucide-react';
import { db } from '../db/db';

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Lưu phiên làm việc vào DB
      db.pomodoro_sessions.add({
        start_time: new Date().toISOString(),
        duration: 25,
        task_id: null
      });
      alert('Tuyệt vời! Bạn đã hoàn thành 1 phiên Pomodoro (25 phút)!');
      setTimeLeft(25 * 60);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          backgroundColor: 'var(--color-primary)', color: 'white',
          borderRadius: '50%', width: '3.5rem', height: '3.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 999
        }}
      >
        <Timer size={24} />
      </button>
    );
  }

  return (
    <div className="card" style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem',
      boxShadow: 'var(--shadow-lg)', zIndex: 999
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontWeight: 'bold' }}>Pomodoro Timer</h3>
        <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-secondary)' }}>&times;</button>
      </div>
      
      <div style={{ fontSize: '3rem', fontWeight: 'bold', textAlign: 'center', color: 'var(--text-primary)' }}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button onClick={toggleTimer} className="btn-gold">
          {isRunning ? <Square size={20}/> : <Play size={20}/>}
        </button>
        <button onClick={resetTimer} style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}>
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}
