/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal Quick Add Tugas dengan Parser Bahasa Alami
 */

import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, BookOpen, X, Check } from 'lucide-react';
import { Task, Course } from '../types';
import { parseNaturalLanguageTask } from '../utils/naturalLanguage';
import { createUtcTimestamp, formatFullIndonesianDateTime } from '../utils/time';
import { getSubtaskTemplateForType } from '../utils/extractor';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Task) => void;
  courses: Course[];
  timezone: string;
  nowUtc: number;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  courses,
  timezone,
  nowUtc,
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const parsed = parseNaturalLanguageTask(inputText, timezone, nowUtc);
  const matchedCourse = courses.find((c) =>
    parsed.courseName ? c.name.toLowerCase().includes(parsed.courseName.toLowerCase()) : false
  );

  const previewUtc = createUtcTimestamp(parsed.dateStr, parsed.timeStr, timezone);
  const formattedPreview = formatFullIndonesianDateTime(previewUtc, timezone);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsed.title.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: parsed.title,
      summary: `Tugas ${parsed.type} ditambahkan melalui Quick Add.`,
      keyPoints: ['Kerjakan soal dan instruksi sesuai ketentuan.'],
      requirements: ['Kumpulkan tepat waktu melalui LMS atau media yang disepakati.'],
      questions: [],
      courseId: matchedCourse?.id,
      courseName: matchedCourse?.name || parsed.courseName,
      type: parsed.type,
      priority: 'sedang',
      deadlineAt: previewUtc,
      deadlineTz: timezone,
      status: 'pending',
      subtasks: getSubtaskTemplateForType(parsed.type),
      attachments: [],
      links: [],
      notes: '',
      reminders: [1440, 180, 60],
      tags: [parsed.type],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSaveTask(newTask);
    setInputText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-teal-200 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Tambah Cepat Bahasa Alami
            </h3>
            <p className="text-xs text-teal-700">
              Ketik tugas dalam kalimat santai sehari-hari
            </p>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4 mt-4">
          <div>
            <input
              type="text"
              autoFocus
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Contoh: Laporan Auditing besok 23.59"
              className="w-full px-4 py-3 rounded-xl border border-teal-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all shadow-xs"
            />
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 px-1">
              <span className="font-semibold text-slate-600">Coba:</span>
              <button
                type="button"
                onClick={() => setInputText('Laporan Auditing besok 23.59')}
                className="underline hover:text-teal-700 cursor-pointer font-medium"
              >
                Laporan Auditing besok 23.59
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setInputText('Kuis Perpajakan lusa 14.00')}
                className="underline hover:text-teal-700 cursor-pointer font-medium"
              >
                Kuis Perpajakan lusa 14.00
              </button>
            </div>
          </div>

          {/* Breakdown Preview */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 via-emerald-50/50 to-white border border-teal-200 space-y-2.5 text-xs shadow-xs">
            <span className="font-bold text-teal-900 uppercase tracking-wider text-[10px] block mb-1">
              Hasil Analisis Otomatis:
            </span>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">Judul Tugas:</span>
              <span className="font-bold text-slate-800">{parsed.title}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">Mata Kuliah:</span>
              <span className="font-bold text-teal-800">
                {matchedCourse ? matchedCourse.name : parsed.courseName || 'Akuntansi Umum'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">Jenis Tugas:</span>
              <span className="font-semibold text-slate-800">{parsed.type}</span>
            </div>

            <div className="flex items-center justify-between border-t border-teal-200/60 pt-2.5">
              <span className="text-slate-600 font-medium">Tenggat Terdeteksi:</span>
              <span className="font-extrabold text-teal-700 tabular-nums">
                {formattedPreview}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!parsed.title.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Konfirmasi & Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
