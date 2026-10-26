/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Bottom Navigation untuk Tampilan Ponsel / Mobile
 */

import React from 'react';
import { LayoutDashboard, CheckSquare, Clock, Plus, MoreHorizontal } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenTaskModal: () => void;
  onOpenMobileMenu: () => void;
  activeTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenTaskModal,
  onOpenMobileMenu,
  activeTasksCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-teal-100 px-3 py-1.5 transition-colors shadow-lg">
      <div className="flex items-center justify-around">
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === 'dashboard'
              ? 'text-teal-700 font-bold'
              : 'text-slate-500 hover:text-teal-600'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('tasks')}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === 'tasks'
              ? 'text-teal-700 font-bold'
              : 'text-slate-500 hover:text-teal-600'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Tugas</span>
          {activeTasksCount > 0 && (
            <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] flex items-center justify-center font-bold shadow-xs">
              {activeTasksCount > 9 ? '9+' : activeTasksCount}
            </span>
          )}
        </button>

        {/* Central Floating Action Button */}
        <div className="relative -top-3">
          <button
            type="button"
            onClick={onOpenTaskModal}
            aria-label="Tambah tugas baru"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 active:scale-95 transition-transform cursor-pointer ring-4 ring-white"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSelectTab('schedule')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === 'schedule'
              ? 'text-teal-700 font-bold'
              : 'text-slate-500 hover:text-teal-600'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>Jadwal</span>
        </button>

        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Menu lainnya"
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-medium text-slate-500 hover:text-teal-600 cursor-pointer"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>Lainnya</span>
        </button>
      </div>
    </nav>
  );
};
