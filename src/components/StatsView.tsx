/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Statistik & Analisis Produktivitas Mahasiswa Akuntansi UPNVJ
 */

import React from 'react';
import {
  Flame,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PieChart,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { Task } from '../types';
import { calculateTaskStats } from '../utils/stats';

interface StatsViewProps {
  tasks: Task[];
  nowUtc: number;
}

export const StatsView: React.FC<StatsViewProps> = ({ tasks, nowUtc }) => {
  const stats = calculateTaskStats(tasks, nowUtc);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
          Statistik & Analisis Produktivitas
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pantau konsistensi penyelesaian tugas, ketepatan waktu, dan distribusi beban perkuliahan
        </p>
      </div>

      {/* Top Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* On-Time Streak */}
        <div className="p-4 rounded-3xl bg-white border border-amber-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-400/30">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">
              Streak Tepat Waktu
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {stats.onTimeStreak} <span className="text-xs font-medium text-amber-600">tugas</span>
            </div>
          </div>
        </div>

        {/* On-Time Percentage */}
        <div className="p-4 rounded-3xl bg-white border border-emerald-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">
              Rasio Tepat Waktu
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {stats.onTimePercent}%
            </div>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="p-4 rounded-3xl bg-white border border-teal-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">
              Tugas Aktif
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {stats.active} <span className="text-xs font-medium text-slate-500">tugas</span>
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="p-4 rounded-3xl bg-white border border-cyan-200 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-cyan-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">
              Tugas Selesai
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {stats.completed} <span className="text-xs font-medium text-slate-500">tugas</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Week Activity Heatmap */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Peta Panas Kesibukan Akademik (4 Minggu Terakhir)
            </h3>
          </div>
          <span className="text-xs text-slate-400">28 Hari Kalender</span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-1.5 pt-2">
          {stats.heatmap28Days.map((item, idx) => {
            const hasActivity = item.count > 0 || item.completedCount > 0;
            let bgClass = 'bg-teal-50/50 text-slate-600 border border-teal-100';
            if (item.completedCount >= 2) bgClass = 'bg-emerald-500 text-white font-black shadow-xs';
            else if (item.completedCount === 1) bgClass = 'bg-emerald-400 text-white font-bold';
            else if (item.count >= 2) bgClass = 'bg-amber-400 text-white font-bold';
            else if (item.count === 1) bgClass = 'bg-teal-400 text-white font-bold';

            return (
              <div
                key={idx}
                title={`${item.dateStr}: ${item.count} tenggat, ${item.completedCount} selesai`}
                className={`h-10 rounded-xl flex flex-col items-center justify-center p-1 text-[10px] font-bold transition-transform hover:scale-110 cursor-pointer ${bgClass}`}
              >
                <span>{item.dateStr.slice(8)}</span>
                {hasActivity && (
                  <span className="text-[8px] opacity-90 leading-none">
                    {item.completedCount > 0 ? `✓${item.completedCount}` : item.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-teal-100 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-teal-50 border border-teal-200" />
            <span>Tidak ada aktivitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-teal-400 text-white" />
            <span>Ada tenggat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 text-white" />
            <span>Tugas selesai</span>
          </div>
        </div>
      </div>

      {/* Course Workload Distribution */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Distribusi Beban Tugas per Mata Kuliah
          </h3>
        </div>

        <div className="space-y-3">
          {stats.courseWorkload.map((cw, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  {cw.courseName}
                </span>
                <span className="font-bold text-teal-700 tabular-nums">
                  {cw.count} tugas ({cw.percentage}%)
                </span>
              </div>
              <div className="w-full bg-teal-50 h-3 rounded-full overflow-hidden border border-teal-100">
                <div
                  className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${cw.percentage}%` }}
                />
              </div>
            </div>
          ))}

          {stats.courseWorkload.length === 0 && (
            <p className="text-xs text-slate-400 italic">Belum ada tugas tercatat untuk dianalisis.</p>
          )}
        </div>
      </div>
    </div>
  );
};
