/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sidebar Navigasi Utama Planner Akuntansi UPNVJ
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  Calendar,
  GraduationCap,
  BarChart3,
  Settings,
  Download,
  Timer,
  HardDrive,
  Plus,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { APP_CONFIG } from '../config';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeTasksCount: number;
  onOpenTaskModal: () => void;
  onOpenQuickAdd: () => void;
  onOpenPomodoro: () => void;
  onOpenSettings: () => void;
  canInstallPwa: boolean;
  onTriggerInstallPwa: () => void;
  customLogoUrl?: string;
  storagePersisted?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeTasksCount,
  onOpenTaskModal,
  onOpenQuickAdd,
  onOpenPomodoro,
  onOpenSettings,
  canInstallPwa,
  onTriggerInstallPwa,
  customLogoUrl,
  storagePersisted = true,
}) => {
  const primaryLogo = customLogoUrl || APP_CONFIG.logoUrl;
  const fallbackLogo = APP_CONFIG.fallbackLogoUrl;

  const [currentLogoSrc, setCurrentLogoSrc] = useState<string>(primaryLogo);
  const [showMonogram, setShowMonogram] = useState<boolean>(false);

  const handleImageError = () => {
    if (currentLogoSrc === primaryLogo) {
      setCurrentLogoSrc(fallbackLogo);
    } else {
      setShowMonogram(true);
    }
  };

  useEffect(() => {
    if (customLogoUrl) {
      setCurrentLogoSrc(customLogoUrl);
      setShowMonogram(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentLogoSrc((prev) => (prev === primaryLogo ? fallbackLogo : prev));
    }, 250);

    return () => clearTimeout(timer);
  }, [primaryLogo, fallbackLogo, customLogoUrl]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Daftar Tugas', icon: CheckSquare, badge: activeTasksCount },
    { id: 'schedule', label: 'Jadwal Kuliah', icon: Clock },
    { id: 'calendar', label: 'Kalender Terpadu', icon: Calendar },
    { id: 'grades', label: 'Nilai & IPK', icon: GraduationCap },
    { id: 'stats', label: 'Statistik & Analisis', icon: BarChart3 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 bg-white border-r border-teal-100 h-screen sticky top-0 z-30 transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-teal-100 bg-gradient-to-b from-teal-50/80 via-emerald-50/40 to-white">
        <div className="flex items-center gap-3.5">
          {/* Logo container: circular white with bright tosca ring */}
          <div className="relative w-12 h-12 shrink-0 rounded-full bg-white ring-2 ring-teal-400 shadow-sm flex items-center justify-center overflow-hidden p-0.5">
            {!showMonogram ? (
              <img
                src={currentLogoSrc}
                alt="Logo S1 Akuntansi UPNVJ"
                referrerPolicy="no-referrer"
                onError={handleImageError}
                className="w-full h-full object-contain rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm tracking-wider">
                {APP_CONFIG.monogramText}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-slate-900 leading-tight truncate">
              {APP_CONFIG.appName}
            </h1>
            {/* Wajib selalu ada kalimat "Mahasiswa S1 Akuntansi UPNVJ" */}
            <p className="text-[11px] font-semibold text-teal-700 leading-tight tracking-tight mt-0.5">
              {APP_CONFIG.institution}
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onOpenTaskModal}
            className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold text-xs shadow-md shadow-teal-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuickAdd}
            title="Quick Add Bahasa Alami"
            className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
          Menu Utama
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-600 hover:bg-teal-50 hover:text-teal-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-white' : 'text-teal-600'}`}
                />
                <span>{item.label}</span>
              </div>

              {typeof item.badge === 'number' && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive ? 'bg-white text-teal-800' : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
          Alat & Utilitas
        </div>

        <button
          type="button"
          onClick={onOpenPomodoro}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-900 transition-colors cursor-pointer"
        >
          <Timer className="w-4 h-4 text-emerald-600" />
          <span>Fokus Pomodoro</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-teal-50 hover:text-teal-900 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>Pengaturan</span>
        </button>
      </nav>

      {/* Footer Area: PWA & Storage */}
      <div className="p-4 border-t border-teal-100 space-y-2.5 bg-teal-50/30">
        {canInstallPwa && (
          <button
            type="button"
            onClick={onTriggerInstallPwa}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5" />
              <span>Pasang Aplikasi (PWA)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <div className="flex items-center gap-1.5" title="Data tersimpan lokal di peramban via IndexedDB">
            <HardDrive className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-medium">Penyimpanan Aman</span>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {storagePersisted ? 'Offline Siap' : 'Lokal'}
          </span>
        </div>
      </div>
    </aside>
  );
};
