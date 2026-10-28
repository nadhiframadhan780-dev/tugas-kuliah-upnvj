/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kartu Tugas dengan Tombol Selesai Lingkaran Besar, Hitung Mundur Realtime & Aksi Cepat
 */

import React, { useState } from 'react';
import {
  Check,
  Clock,
  Paperclip,
  Share2,
  Calendar,
  MoreVertical,
  Timer,
  Copy,
  Trash2,
  CalendarPlus,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Task, DeadlineUrgency } from '../types';
import { formatFullIndonesianDateTime, formatLiveCountdown } from '../utils/time';
import { shareTaskViaWhatsAppOrWebShare, getGoogleCalendarUrl } from '../utils/ics';

interface TaskCardProps {
  task: Task;
  timezone: string;
  nowUtc: number;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDuplicateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onExtendDeadline: (taskId: string, days: number) => void;
  onStartPomodoro: (task: Task) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  timezone,
  nowUtc,
  onToggleComplete,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
  onExtendDeadline,
  onStartPomodoro,
  onToggleSubtask,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const isCompleted = task.status === 'completed';
  const countdown = formatLiveCountdown(task.deadlineAt, nowUtc);
  const deadlineFormatted = formatFullIndonesianDateTime(task.deadlineAt, timezone);

  // Status badge styling
  const getUrgencyStyles = (urgency: DeadlineUrgency, completed: boolean) => {
    if (completed) {
      return {
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        border: 'border-l-4 border-l-emerald-500',
        ring: '',
      };
    }
    switch (urgency) {
      case 'terlambat':
        return {
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          border: 'border-l-4 border-l-rose-500',
          ring: 'ring-1 ring-rose-400/40',
        };
      case 'kritis':
        return {
          badge: 'bg-red-100 text-red-800 border-red-300 animate-pulse',
          border: 'border-l-4 border-l-red-600',
          ring: 'ring-2 ring-red-500/50',
        };
      case 'mendesak':
        return {
          badge: 'bg-orange-50 text-orange-800 border-orange-200',
          border: 'border-l-4 border-l-orange-500',
          ring: '',
        };
      case 'waspada':
        return {
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          border: 'border-l-4 border-l-amber-500',
          ring: '',
        };
      case 'aman':
      default:
        return {
          badge: 'bg-teal-50 text-teal-800 border-teal-200',
          border: 'border-l-4 border-l-teal-500',
          ring: '',
        };
    }
  };

  const urgencyStyles = getUrgencyStyles(countdown.urgency, isCompleted);

  // Subtasks completion count
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div
      className={`relative bg-white rounded-2xl p-4 sm:p-5 border border-teal-100 shadow-[0_4px_20px_rgba(20,184,166,0.06)] hover:shadow-md hover:border-teal-300 transition-all ${
        urgencyStyles.border
      } ${urgencyStyles.ring} ${isCompleted ? 'opacity-85' : ''}`}
    >
      <div className="flex items-start gap-3.5">
        {/* Tombol SELESAI: Lingkaran Besar di Kiri */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          aria-label={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
          className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer mt-0.5 ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm scale-105'
              : 'border-slate-300 hover:border-teal-500 hover:bg-teal-50 text-transparent'
          }`}
        >
          <Check className={`w-4 h-4 stroke-[3] ${isCompleted ? 'opacity-100' : 'hover:text-teal-600'}`} />
        </button>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Badges & Menu */}
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {task.courseName && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-teal-100/90 text-teal-900 border border-teal-200">
                  {task.courseName}
                </span>
              )}
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-700">
                {task.type}
              </span>
              {task.isGroupTask && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                  <Users className="w-2.5 h-2.5" />
                  <span>Kelompok</span>
                </span>
              )}
              {task.priority === 'kritis' && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 uppercase border border-rose-200">
                  Kritis
                </span>
              )}
            </div>

            {/* Quick Actions & Delete */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Hapus tugas "${task.title}" yang tidak penting?`)) {
                    onDeleteTask(task.id);
                  }
                }}
                title="Hapus tugas yang tidak penting"
                className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  aria-label="Aksi tugas"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

              {showMenu && (
                <div
                  onMouseLeave={() => setShowMenu(false)}
                  className="absolute right-0 top-6 w-48 bg-white rounded-2xl shadow-xl border border-teal-100 py-1.5 z-20 text-xs font-medium space-y-0.5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEditTask(task);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-teal-50 text-slate-700 cursor-pointer"
                  >
                    Edit Detail Tugas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onStartPomodoro(task);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-teal-50 text-slate-700 cursor-pointer"
                  >
                    <Timer className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mulai Pomodoro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onExtendDeadline(task.id, 1);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-teal-50 text-slate-700 cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-teal-600" />
                    <span>Perpanjang +1 Hari</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onExtendDeadline(task.id, 3);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-teal-50 text-slate-700 cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-teal-600" />
                    <span>Perpanjang +3 Hari</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      shareTaskViaWhatsAppOrWebShare(task, timezone);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-teal-50 text-slate-700 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bagikan ke WhatsApp</span>
                  </button>
                  {task.deadlineAt && (
                    <a
                      href={getGoogleCalendarUrl(task)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMenu(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-teal-50 text-slate-700"
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tambah ke Google Cal</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDuplicateTask(task);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-teal-50 text-slate-700 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Duplikat Tugas</span>
                  </button>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDeleteTask(task.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-rose-50 text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus ke Tong Sampah</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Title */}
          <h2
            onClick={() => onEditTask(task)}
            className={`text-sm sm:text-base font-bold text-slate-900 leading-snug cursor-pointer hover:text-teal-700 transition-colors ${
              isCompleted ? 'line-through text-slate-400' : ''
            }`}
          >
            {task.title}
          </h2>

          {/* Summary Preview if available */}
          {task.summary && (
            <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
              {task.summary}
            </p>
          )}

          {/* Deadline & Realtime Countdown Row */}
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap text-xs">
            {/* Full Indonesian Deadline */}
            <div className="flex items-center gap-1.5 text-slate-600 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>{deadlineFormatted}</span>
            </div>

            {/* Countdown Badge with Urgency Color */}
            <div
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border tabular-nums ${
                urgencyStyles.badge
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Selesai {task.onTime ? '(Tepat Waktu)' : '(Terlambat)'}</span>
                </>
              ) : (
                <span>{countdown.text}</span>
              )}
            </div>
          </div>

          {/* Subtask & Attachments Bar */}
          {(totalSubtasks > 0 || task.attachments?.length > 0) && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              {totalSubtasks > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="flex items-center gap-1.5 hover:text-teal-600 cursor-pointer"
                >
                  <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.round((completedSubtasks / totalSubtasks) * 100)}%` }}
                    />
                  </div>
                  <span className="font-semibold text-[11px] text-teal-800">
                    {completedSubtasks}/{totalSubtasks} subtugas
                  </span>
                  {showSubtasks ? <ChevronUp className="w-3 h-3 text-teal-600" /> : <ChevronDown className="w-3 h-3 text-teal-600" />}
                </button>
              ) : (
                <div />
              )}

              {task.attachments?.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-teal-700 font-medium" title={`${task.attachments.length} file lampiran`}>
                  <Paperclip className="w-3.5 h-3.5 text-teal-600" />
                  <span>{task.attachments.length} berkas</span>
                </div>
              )}
            </div>
          )}

          {/* Subtasks Accordion Checklist */}
          {showSubtasks && task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-2.5 space-y-1.5 pl-2 border-l-2 border-teal-300">
              {task.subtasks.map((sub) => (
                <label
                  key={sub.id}
                  className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={sub.completed}
                    onChange={() => onToggleSubtask && onToggleSubtask(task.id, sub.id)}
                    className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span className={sub.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                    {sub.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
