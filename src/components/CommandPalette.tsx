/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Command Palette (Ctrl+K / /) untuk Akses Cepat Semua Fitur & Pencarian Global
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Timer,
  Clock,
  Calendar,
  GraduationCap,
  Settings,
  CheckSquare,
  X,
  ArrowRight,
} from 'lucide-react';
import { Task, Course } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  courses: Course[];
  onSelectTab: (tab: string) => void;
  onOpenTaskModal: () => void;
  onOpenPomodoro: () => void;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
  onSelectTask: (task: Task) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  courses,
  onSelectTab,
  onOpenTaskModal,
  onOpenPomodoro,
  onOpenQuickAdd,
  onOpenSettings,
  onSelectTask,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTasks = query.trim()
    ? tasks.filter(
        (t) =>
          !t.deletedAt &&
          (t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.courseName?.toLowerCase().includes(query.toLowerCase()) ||
            t.summary?.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const filteredCourses = query.trim()
    ? courses.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.code.toLowerCase().includes(query.toLowerCase()) ||
          c.lecturer.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const actions = [
    {
      id: 'new-task',
      label: 'Tambah Tugas Baru',
      icon: Plus,
      handler: () => {
        onClose();
        onOpenTaskModal();
      },
    },
    {
      id: 'quick-add',
      label: 'Tambah Cepat (Bahasa Alami)',
      icon: Plus,
      handler: () => {
        onClose();
        onOpenQuickAdd();
      },
    },
    {
      id: 'pomodoro',
      label: 'Buka Timer Fokus Pomodoro',
      icon: Timer,
      handler: () => {
        onClose();
        onOpenPomodoro();
      },
    },
    {
      id: 'schedule',
      label: 'Lihat Jadwal Kuliah',
      icon: Clock,
      handler: () => {
        onClose();
        onSelectTab('schedule');
      },
    },
    {
      id: 'calendar',
      label: 'Lihat Kalender Terpadu',
      icon: Calendar,
      handler: () => {
        onClose();
        onSelectTab('calendar');
      },
    },
    {
      id: 'grades',
      label: 'Buka Pencatat Nilai & IPK',
      icon: GraduationCap,
      handler: () => {
        onClose();
        onSelectTab('grades');
      },
    },
    {
      id: 'settings',
      label: 'Buka Pengaturan',
      icon: Settings,
      handler: () => {
        onClose();
        onOpenSettings();
      },
    },
  ];

  const filteredActions = query.trim()
    ? actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : actions;

  return (
    <div
      className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-teal-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-teal-100 bg-teal-50/30">
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tugas, mata kuliah, atau ketik tindakan..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-80 overflow-y-auto p-2.5 space-y-3">
          {/* Matched Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                Tugas ({filteredTasks.length})
              </div>
              <div className="space-y-1">
                {filteredTasks.slice(0, 5).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectTask(task);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-teal-50 text-xs text-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="font-semibold truncate">{task.title}</span>
                    </div>
                    {task.courseName && (
                      <span className="text-[10px] text-teal-700 font-medium shrink-0 ml-2">
                        {task.courseName}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Courses */}
          {filteredCourses.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-800">
                Mata Kuliah ({filteredCourses.length})
              </div>
              <div className="space-y-1">
                {filteredCourses.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectTab('schedule');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-teal-50 text-xs text-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold truncate">{c.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                      {c.startTime} - {c.endTime}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Commands */}
          <div>
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-800">
              Aksi Cepat
            </div>
            <div className="space-y-1">
              {filteredActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={action.handler}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-teal-50 text-xs text-slate-700 hover:text-teal-900 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-teal-600" />
                      <span className="font-medium">{action.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 bg-teal-50/50 border-t border-teal-100 text-[11px] text-teal-800/80 flex items-center justify-between font-medium">
          <span>Pintasan: N = Tugas Baru • / = Cari • ESC = Tutup</span>
          <span className="font-mono text-[10px] text-teal-600">Planner Akuntansi</span>
        </div>
      </div>
    </div>
  );
};
