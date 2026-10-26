/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Topbar Menempel dengan Jam Realtime Berbahasa Indonesia & Navigasi Cepat
 */

import React, { useEffect, useState } from 'react';
import { Search, Plus, Bell, Menu, Sparkles } from 'lucide-react';
import { formatRealtimeHeaderClock } from '../utils/time';

interface TopbarProps {
  timezone: string;
  onOpenTaskModal: () => void;
  onOpenQuickAdd: () => void;
  onOpenCommandPalette: () => void;
  onToggleMobileMenu: () => void;
  onRequestNotificationPermission?: () => void;
  notificationPermission?: NotificationPermission;
}

export const Topbar: React.FC<TopbarProps> = ({
  timezone,
  onOpenTaskModal,
  onOpenQuickAdd,
  onOpenCommandPalette,
  onToggleMobileMenu,
  onRequestNotificationPermission,
  notificationPermission,
}) => {
  // Realtime clock ticking every second
  const [clockString, setClockString] = useState<string>(() =>
    formatRealtimeHeaderClock(new Date(), timezone)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setClockString(formatRealtimeHeaderClock(new Date(), timezone));
    }, 1000);

    return () => clearInterval(timer);
  }, [timezone]);

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/95 border-b border-teal-100 px-4 sm:px-6 py-3 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Global Search Bar */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Buka menu navigasi"
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-teal-50 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white hover:bg-teal-50/50 border border-teal-200 text-slate-600 text-xs sm:text-sm w-full max-w-xs transition-colors cursor-pointer text-left shadow-2xs"
          >
            <Search className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="truncate">Cari tugas, matkul, jadwal...</span>
            <kbd className="hidden sm:inline-flex ml-auto items-center px-1.5 py-0.5 text-[10px] font-mono text-teal-700 bg-teal-50 border border-teal-200 rounded">
              /
            </kbd>
          </button>
        </div>

        {/* Center: Indonesian Realtime Clock */}
        <div className="hidden lg:flex items-center justify-center shrink-0 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 shadow-2xs">
          <div className="text-xs font-bold text-teal-900 tabular-nums tracking-tight">
            {clockString}
          </div>
        </div>

        {/* Right: Quick Add, Notifications & New Task Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenQuickAdd}
            title="Tambah Cepat Bahasa Alami (e.g. Laporan Auditing besok 23.59)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden md:inline">Quick Add</span>
          </button>

          {/* Notification Button */}
          {onRequestNotificationPermission && notificationPermission !== 'granted' && (
            <button
              type="button"
              onClick={onRequestNotificationPermission}
              title="Aktifkan Notifikasi Pengingat Tugas"
              className="p-2 rounded-xl text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onOpenTaskModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tugas Baru</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>
    </header>
  );
};
