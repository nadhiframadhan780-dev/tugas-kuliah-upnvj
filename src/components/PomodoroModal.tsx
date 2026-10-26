/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Timer Fokus Pomodoro Mahasiswa Akuntansi UPNVJ
 */

import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X, CheckCircle, Sparkles } from 'lucide-react';
import { Task, PomodoroSession } from '../types';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  initialTask?: Task | null;
  onSessionComplete: (session: PomodoroSession) => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  tasks,
  initialTask,
  onSessionComplete,
}) => {
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTask?.id || '');

  useEffect(() => {
    if (initialTask) {
      setSelectedTaskId(initialTask.id);
    }
  }, [initialTask]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play chime or alert
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      } catch {}

      const activeTask = tasks.find((t) => t.id === selectedTaskId);
      onSessionComplete({
        id: `pomo-${Date.now()}`,
        taskId: selectedTaskId || undefined,
        taskTitle: activeTask?.title,
        durationMinutes,
        timestamp: Date.now(),
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, durationMinutes, selectedTaskId, tasks, onSessionComplete]);

  if (!isOpen) return null;

  const handleSelectDuration = (mins: number) => {
    setIsRunning(false);
    setDurationMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(durationMinutes * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = ((durationMinutes * 60 - secondsLeft) / (durationMinutes * 60)) * 100;
  const activeTasks = tasks.filter((t) => t.status !== 'completed' && !t.deletedAt);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-teal-200 text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
            <Timer className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Timer Fokus Pomodoro
          </h3>
        </div>
        <p className="text-xs text-teal-700 mb-5">
          Tingkatkan konsentrasi dalam menyelesaikan laporan & latihan akuntansi
        </p>

        {/* Duration Selectors */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => handleSelectDuration(25)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              durationMinutes === 25
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            25 Menit (Standar)
          </button>
          <button
            type="button"
            onClick={() => handleSelectDuration(50)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              durationMinutes === 50
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            50 Menit (Deep Work)
          </button>
          <button
            type="button"
            onClick={() => handleSelectDuration(5)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              durationMinutes === 5
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            5 Menit (Istirahat)
          </button>
        </div>

        {/* Circular Display */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              strokeWidth="6"
              className="text-teal-100 stroke-current fill-none"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              strokeWidth="6"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * progressPercent) / 100}
              strokeLinecap="round"
              className="text-teal-500 stroke-current fill-none transition-all duration-500"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[11px] font-bold text-teal-700 mt-1 uppercase tracking-wider">
              {isRunning ? 'Sedang Fokus' : 'Siap Mulai'}
            </span>
          </div>
        </div>

        {/* Task Link Selector */}
        <div className="mb-6 text-left">
          <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
            Tautkan ke Tugas (Opsional):
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 bg-white text-xs text-slate-800 outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all shadow-xs"
          >
            <option value="">-- Fokus Umum (Tanpa Tautan Tugas) --</option>
            {activeTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.courseName ? `[${t.courseName}] ` : ''}{t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 cursor-pointer transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-teal-500/25 active:scale-95 transition-all cursor-pointer"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>Mulai Fokus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
