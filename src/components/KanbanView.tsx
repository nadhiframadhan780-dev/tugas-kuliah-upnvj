/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kanban Board View untuk Manajemen Alur Tugas Akuntansi
 */

import React from 'react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanViewProps {
  tasks: Task[];
  timezone: string;
  nowUtc: number;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDuplicateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onExtendDeadline: (taskId: string, days: number) => void;
  onStartPomodoro: (task: Task) => void;
  onChangeStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  timezone,
  nowUtc,
  onToggleComplete,
  onEditTask,
  onDuplicateTask,
  onDeleteTask,
  onExtendDeadline,
  onStartPomodoro,
  onChangeStatus,
}) => {
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const columns: {
    id: TaskStatus;
    title: string;
    tasks: Task[];
    color: string;
    badgeBg: string;
  }[] = [
    {
      id: 'pending',
      title: 'Belum Dikerjakan',
      tasks: pendingTasks,
      color: 'border-t-slate-400',
      badgeBg: 'bg-white text-slate-700 border border-slate-200',
    },
    {
      id: 'in_progress',
      title: 'Sedang Dikerjakan',
      tasks: inProgressTasks,
      color: 'border-t-teal-500',
      badgeBg: 'bg-teal-100 text-teal-800 border border-teal-200',
    },
    {
      id: 'completed',
      title: 'Selesai',
      tasks: completedTasks,
      color: 'border-t-emerald-500',
      badgeBg: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {columns.map((col) => (
        <div
          key={col.id}
          className={`bg-white/80 rounded-2xl p-4 border border-teal-100 border-t-4 shadow-sm ${col.color}`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-3.5 px-1">
            <h3 className="text-sm font-bold text-slate-850">
              {col.title}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeBg}`}>
              {col.tasks.length}
            </span>
          </div>

          {/* Cards List */}
          <div className="space-y-3 min-h-[150px]">
            {col.tasks.map((task) => (
              <div key={task.id} className="group relative">
                <TaskCard
                  task={task}
                  timezone={timezone}
                  nowUtc={nowUtc}
                  onToggleComplete={onToggleComplete}
                  onEditTask={onEditTask}
                  onDuplicateTask={onDuplicateTask}
                  onDeleteTask={onDeleteTask}
                  onExtendDeadline={onExtendDeadline}
                  onStartPomodoro={onStartPomodoro}
                />

                {/* Quick Column Shift Selector */}
                <div className="mt-1 flex items-center justify-end gap-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-slate-400">Pindah status:</span>
                  {col.id !== 'pending' && (
                    <button
                      type="button"
                      onClick={() => onChangeStatus(task.id, 'pending')}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white text-slate-600 border border-slate-200 cursor-pointer hover:bg-slate-50"
                    >
                      Belum
                    </button>
                  )}
                  {col.id !== 'in_progress' && (
                    <button
                      type="button"
                      onClick={() => onChangeStatus(task.id, 'in_progress')}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white text-teal-700 border border-teal-200 cursor-pointer hover:bg-teal-50"
                    >
                      Dikerjakan
                    </button>
                  )}
                  {col.id !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => onChangeStatus(task.id, 'completed')}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-50"
                    >
                      Selesai
                    </button>
                  )}
                </div>
              </div>
            ))}

            {col.tasks.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 border-2 border-dashed border-teal-200/80 rounded-2xl bg-teal-50/20">
                Belum ada tugas di kolom ini.
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
