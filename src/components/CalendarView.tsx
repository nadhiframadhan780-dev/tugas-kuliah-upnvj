/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kalender Akademik Terpadu Mahasiswa S1 Akuntansi UPNVJ
 * Berdasarkan SK Rektor No. 919/UN61/HK.03.01/2026 (Kampus Bela Negara)
 * Terintegrasi dengan Jadwal Kuliah, Tenggat Tugas, & Panduan Alur Semester Mudah Dipahami
 */

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  BookOpen,
  Award,
  X,
  FileText,
  ExternalLink,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info,
  Filter,
  ArrowRight,
  Eye,
  Check,
} from 'lucide-react';
import { Task, Course, CalendarEvent } from '../types';
import { formatFullIndonesianDateTime } from '../utils/time';
import {
  OFFICIAL_UPNVJ_ACADEMIC_EVENTS,
  UPNVJ_DECREE_INFO,
  isDateInEventRange,
  getUpnvjEventsForDate,
  getCurrentAcademicSemester,
  getSemesterTimelineSteps,
  UpnvjAcademicEvent,
} from '../data/upnvjAcademicCalendar';

interface CalendarViewProps {
  tasks: Task[];
  courses: Course[];
  events: CalendarEvent[];
  onSaveEvent: (event: CalendarEvent) => void;
  timezone: string;
  nowUtc: number;
}

type CalendarFilter =
  | 'semua'
  | 'upnvj_resmi'
  | 'ujian'
  | 'minggu_tenang'
  | 'krs'
  | 'kuliah_saya'
  | 'tugas'
  | 'libur';

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  courses,
  events,
  onSaveEvent,
  timezone,
  nowUtc,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date(nowUtc));
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    () => new Date(nowUtc).toISOString().split('T')[0]
  );
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CalendarFilter>('semua');
  const [semesterView, setSemesterView] = useState<'ganjil' | 'genap'>(() =>
    getCurrentAcademicSemester(new Date(nowUtc))
  );

  // New Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'uts' | 'uas' | 'presentasi' | 'seminar' | 'lainnya'>('uts');
  const [eventDate, setEventDate] = useState(selectedDateStr);
  const [eventStartTime, setEventStartTime] = useState('08:00');
  const [eventEndTime, setEventEndTime] = useState('10:00');
  const [eventLocation, setEventLocation] = useState('FEB Kampus UPNVJ Pondok Labu');

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Switch month directly when toggling semester
  const handleJumpToSemester = (sem: 'ganjil' | 'genap') => {
    setSemesterView(sem);
    if (sem === 'ganjil') {
      // Oct 2026 (Mid Ganjil with UTS)
      setCurrentDate(new Date(2026, 9, 1));
      setSelectedDateStr('2026-10-05');
    } else {
      // April 2027 (Mid Genap with UTS)
      setCurrentDate(new Date(2027, 3, 1));
      setSelectedDateStr('2027-04-12');
    }
  };

  // Build calendar grid days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: { dayNum: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dNum = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, dNum);
    const mStr = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(dNum).padStart(2, '0');
    calendarDays.push({
      dayNum: dNum,
      dateStr: `${prevMonthDate.getFullYear()}-${mStr}-${dStr}`,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    calendarDays.push({
      dayNum: d,
      dateStr: `${year}-${mStr}-${dStr}`,
      isCurrentMonth: true,
    });
  }

  // Trailing days to fill 35 or 42 cells
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextMonthDate = new Date(year, month + 1, i);
    const mStr = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(i).padStart(2, '0');
    calendarDays.push({
      dayNum: i,
      dateStr: `${nextMonthDate.getFullYear()}-${mStr}-${dStr}`,
      isCurrentMonth: false,
    });
  }

  // Combine user-added events with official UPNVJ dataset to avoid duplicate display
  const allEventsMap = useMemo(() => {
    const map = new Map<string, CalendarEvent>();
    // First, seed official events
    for (const ev of OFFICIAL_UPNVJ_ACADEMIC_EVENTS) {
      map.set(ev.id, ev);
    }
    // Then add/override user events
    for (const ev of events) {
      map.set(ev.id, ev);
    }
    return Array.from(map.values());
  }, [events]);

  // Selected date parsed
  const selectedDayDate = new Date(`${selectedDateStr}T12:00:00Z`);
  const selectedDayOfWeek = selectedDayDate.getUTCDay();

  // Routine courses on selected day
  const dayCourses = courses.filter((c) => {
    if (activeFilter === 'upnvj_resmi' || activeFilter === 'ujian' || activeFilter === 'libur') {
      return false;
    }
    return c.dayOfWeek === selectedDayOfWeek;
  });

  // Tasks on selected date
  const dayTasks = tasks.filter((t) => {
    if (!t.deadlineAt || t.deletedAt) return false;
    if (activeFilter === 'upnvj_resmi' || activeFilter === 'kuliah_saya' || activeFilter === 'libur') {
      return false;
    }
    const dStr = new Date(t.deadlineAt).toISOString().split('T')[0];
    return dStr === selectedDateStr;
  });

  // Official & custom events on selected date
  const dayEvents = useMemo(() => {
    return allEventsMap.filter((e) => {
      // Check date range
      const inRange = isDateInEventRange(selectedDateStr, e as UpnvjAcademicEvent);
      if (!inRange) return false;

      // Filter check
      if (activeFilter === 'kuliah_saya' || activeFilter === 'tugas') return false;
      if (activeFilter === 'ujian' && e.type !== 'uts' && e.type !== 'uas') return false;
      if (activeFilter === 'minggu_tenang' && e.type !== 'minggu_tenang') return false;
      if (activeFilter === 'krs' && e.type !== 'krs') return false;
      if (activeFilter === 'libur' && e.type !== 'libur') return false;
      if (activeFilter === 'upnvj_resmi' && !e.isOfficialUpnvj) return false;

      return true;
    });
  }, [allEventsMap, selectedDateStr, activeFilter]);

  // Timeline steps for active semester
  const timelineSteps = useMemo(() => {
    return getSemesterTimelineSteps(semesterView, selectedDateStr);
  }, [semesterView, selectedDateStr]);

  const handleSaveNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    onSaveEvent({
      id: `ev-${Date.now()}`,
      title: eventTitle.trim(),
      type: eventType,
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      location: eventLocation.trim(),
      isOfficialUpnvj: false,
    });

    setIsAddEventOpen(false);
    setEventTitle('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner: SK Rektor UPNVJ & Action Controls */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-teal-900/10 relative overflow-hidden">
        {/* Subtle background ornamentation */}
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 pointer-events-none flex items-center justify-center">
          <CalendarIcon className="w-96 h-96 -mr-16" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold border border-white/25 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>SK Rektor No. {UPNVJ_DECREE_INFO.decreeNumber}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-100 text-[11px] font-semibold">
                Tahun Akademik {UPNVJ_DECREE_INFO.academicYear}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Kalender Akademik Terpadu UPN "Veteran" Jakarta
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              Jadwal resmi perkuliahan, pengisian KRS, pekan UTS & UAS, minggu tenang, dan hari libur nasional sesuai kalender rektorat. Lengkap dengan penjelasan mudah & tips persiapan sukses mahasiswa S1 Akuntansi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Original PDF Button */}
            <button
              type="button"
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-teal-50 text-teal-900 text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-102"
              title="Buka dokumen PDF Keputusan Rektor Kalender Akademik UPNVJ"
            >
              <FileText className="w-4 h-4 text-teal-700" />
              <span>Lihat PDF Asli SK Rektor</span>
            </button>

            {/* Toggle Timeline Guide */}
            <button
              type="button"
              onClick={() => setShowTimeline(!showTimeline)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                showTimeline
                  ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-md'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/30 backdrop-blur-sm'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>{showTimeline ? 'Tutup Alur Semester' : 'Alur Tahapan Semester'}</span>
            </button>

            {/* Add Custom Event */}
            <button
              type="button"
              onClick={() => {
                setEventDate(selectedDateStr);
                setIsAddEventOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold shadow-md transition-all cursor-pointer hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>+ Acara Pribadi</span>
            </button>
          </div>
        </div>

        {/* Semester Tab Switcher in Banner */}
        <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-200">Pilih Semester:</span>
            <div className="flex items-center p-1 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => handleJumpToSemester('ganjil')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  semesterView === 'ganjil'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                Semester Ganjil 2026/2027
              </button>
              <button
                type="button"
                onClick={() => handleJumpToSemester('genap')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  semesterView === 'genap'
                    ? 'bg-white text-teal-900 shadow-sm'
                    : 'text-teal-200 hover:text-white'
                }`}
              >
                Semester Genap 2026/2027
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-teal-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
            <span>
              Kalender aktif:{' '}
              <strong className="text-white">
                {semesterView === 'ganjil' ? 'Agustus 2026 - Januari 2027' : 'Februari 2027 - Juli 2027'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Alur Tahapan Semester (Timeline Panduan Cepat Mahasiswa) */}
      {showTimeline && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-teal-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-100 text-teal-800 font-bold">
                <BookOpen className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Panduan Alur Semester {semesterView === 'ganjil' ? 'Ganjil' : 'Genap'} 2026/2027 (Mudah Dipahami)
                </h3>
                <p className="text-xs text-teal-700">
                  Urutan 8 langkah penting yang harus dijalani mahasiswa dari awal bayar UKT hingga cetak KHS.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTimeline(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {timelineSteps.map((step) => {
              const statusStyles = {
                passed: {
                  badge: 'bg-slate-100 text-slate-600 border-slate-200',
                  label: 'Selesai / Lewat',
                  border: 'border-slate-200',
                  icon: <Check className="w-3.5 h-3.5 text-slate-500" />,
                },
                current: {
                  badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold animate-pulse',
                  label: 'Sedang Berlangsung',
                  border: 'border-2 border-emerald-500 bg-emerald-50/40 shadow-xs',
                  icon: <Clock className="w-3.5 h-3.5 text-emerald-600" />,
                },
                upcoming: {
                  badge: 'bg-teal-50 text-teal-800 border-teal-200 font-medium',
                  label: 'Akan Datang',
                  border: 'border-teal-100 hover:border-teal-300',
                  icon: <ArrowRight className="w-3.5 h-3.5 text-teal-600" />,
                },
              }[step.status];

              return (
                <div
                  key={step.stepNumber}
                  className={`p-4 rounded-2xl border bg-white flex flex-col justify-between transition-all ${statusStyles.border}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-black flex items-center justify-center">
                        {step.stepNumber}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${statusStyles.badge}`}>
                        {statusStyles.icon}
                        <span>{statusStyles.label}</span>
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {step.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-teal-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{step.period}</span>
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <div className="p-2 rounded-xl bg-teal-50/70 border border-teal-100/70 text-[11px] text-teal-900 leading-snug">
                      <strong className="text-teal-800">💡 Tips Mahasiswa:</strong> {step.tips}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Filter Chips: Kategori Agenda */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Saring:
        </span>
        {[
          { id: 'semua', label: 'Semua Agenda' },
          { id: 'upnvj_resmi', label: 'Kalender UPNVJ Resmi' },
          { id: 'ujian', label: 'UTS & UAS' },
          { id: 'minggu_tenang', label: 'Minggu Tenang' },
          { id: 'krs', label: 'KRS & Registrasi' },
          { id: 'kuliah_saya', label: 'Jadwal Kuliah Saya' },
          { id: 'tugas', label: 'Tenggat Tugas' },
          { id: 'libur', label: 'Hari Libur Nasional' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id as CalendarFilter)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === f.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xs'
                : 'bg-white hover:bg-teal-50 text-slate-700 border border-teal-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 4. Main Calendar Layout: Grid (2 Cols) + Detail Agenda Panel (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-4 sm:p-6 border border-teal-100 shadow-sm space-y-4">
          {/* Month Controller */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                <CalendarIcon className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {monthNames[month]} {year}
                </h3>
                <span className="text-[11px] font-semibold text-teal-700">
                  {semesterView === 'ganjil' ? 'Semester Ganjil TA 2026/2027' : 'Semester Genap TA 2026/2027'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Bulan sebelumnya"
                className="p-2 rounded-xl border border-teal-200 text-slate-600 hover:bg-teal-50 cursor-pointer transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date(nowUtc))}
                className="px-3.5 py-1.5 rounded-xl border border-teal-200 text-xs font-bold text-teal-800 hover:bg-teal-50 cursor-pointer shadow-2xs transition-colors"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Bulan berikutnya"
                className="p-2 rounded-xl border border-teal-200 text-slate-600 hover:bg-teal-50 cursor-pointer transition-colors shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400">
            {daysOfWeek.map((d, i) => (
              <div key={i} className={`py-1.5 ${i === 0 ? 'text-rose-500 font-extrabold' : ''}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Date Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDateStr;
              const isToday = cell.dateStr === new Date(nowUtc).toISOString().split('T')[0];

              // Filtered tasks on this date
              const tasksOnDay = tasks.filter((t) => {
                if (!t.deadlineAt || t.deletedAt) return false;
                if (activeFilter === 'upnvj_resmi' || activeFilter === 'kuliah_saya' || activeFilter === 'libur') return false;
                return new Date(t.deadlineAt).toISOString().split('T')[0] === cell.dateStr;
              });

              // Official UPNVJ events on this date
              const upnvjEventsOnDay = OFFICIAL_UPNVJ_ACADEMIC_EVENTS.filter((e) => {
                if (activeFilter === 'kuliah_saya' || activeFilter === 'tugas') return false;
                if (activeFilter === 'ujian' && e.type !== 'uts' && e.type !== 'uas') return false;
                if (activeFilter === 'minggu_tenang' && e.type !== 'minggu_tenang') return false;
                if (activeFilter === 'krs' && e.type !== 'krs') return false;
                if (activeFilter === 'libur' && e.type !== 'libur') return false;
                return isDateInEventRange(cell.dateStr, e);
              });

              // Major event pill to display in cell
              const majorEvent = upnvjEventsOnDay[0];

              // Background styling for special ranges (UTS, UAS, Minggu Tenang)
              const isUtsRange = upnvjEventsOnDay.some((e) => e.type === 'uts');
              const isUasRange = upnvjEventsOnDay.some((e) => e.type === 'uas');
              const isMingguTenang = upnvjEventsOnDay.some((e) => e.type === 'minggu_tenang');
              const isHoliday = upnvjEventsOnDay.some((e) => e.type === 'libur');

              let rangeBg = 'bg-white';
              if (isUtsRange) rangeBg = 'bg-amber-50/80 border-amber-200';
              else if (isUasRange) rangeBg = 'bg-orange-50/80 border-orange-200';
              else if (isMingguTenang) rangeBg = 'bg-yellow-50/80 border-yellow-200';
              else if (isHoliday) rangeBg = 'bg-rose-50/60 border-rose-200';

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[82px] sm:min-h-[92px] p-1.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-teal-600 bg-teal-50 ring-2 ring-teal-400/40 shadow-sm scale-101 z-10'
                      : cell.isCurrentMonth
                      ? `${rangeBg} border-teal-100/80 hover:bg-teal-50/50`
                      : 'border-transparent text-slate-300 bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs font-black'
                          : cell.isCurrentMonth
                          ? isHoliday
                            ? 'text-rose-600 font-extrabold'
                            : 'text-slate-800'
                          : 'text-slate-300'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Indicator dots */}
                    <div className="flex items-center gap-1">
                      {upnvjEventsOnDay.length > 0 && (
                        <span
                          className={`w-2 h-2 rounded-full shadow-2xs ${
                            isUtsRange || isUasRange
                              ? 'bg-amber-500'
                              : isMingguTenang
                              ? 'bg-yellow-500'
                              : isHoliday
                              ? 'bg-rose-500'
                              : 'bg-teal-500'
                          }`}
                          title={`${upnvjEventsOnDay.length} agenda akademik UPNVJ`}
                        />
                      )}
                      {tasksOnDay.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shadow-2xs" title={`${tasksOnDay.length} tugas`} />
                      )}
                    </div>
                  </div>

                  {/* Micro label pill */}
                  <div className="space-y-0.5 mt-1 overflow-hidden w-full">
                    {majorEvent && (
                      <div
                        className={`text-[9px] px-1.5 py-0.5 rounded-md truncate font-bold border ${
                          majorEvent.type === 'uts'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : majorEvent.type === 'uas'
                            ? 'bg-orange-100 text-orange-900 border-orange-300'
                            : majorEvent.type === 'minggu_tenang'
                            ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                            : majorEvent.type === 'libur'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : majorEvent.type === 'krs'
                            ? 'bg-sky-100 text-sky-900 border-sky-300'
                            : 'bg-teal-100 text-teal-900 border-teal-200'
                        }`}
                        title={majorEvent.title}
                      >
                        {majorEvent.type === 'uts'
                          ? 'UTS'
                          : majorEvent.type === 'uas'
                          ? 'UAS'
                          : majorEvent.type === 'minggu_tenang'
                          ? 'Mng. Tenang'
                          : majorEvent.type === 'libur'
                          ? 'Libur'
                          : majorEvent.title}
                      </div>
                    )}

                    {tasksOnDay.slice(0, 1).map((t) => (
                      <div
                        key={t.id}
                        className="text-[9px] px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 truncate font-semibold"
                      >
                        {t.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Color Legend Footer matching PDF */}
          <div className="pt-3 border-t border-teal-100 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-600">
            <span className="font-bold text-teal-900">Keterangan Warna Kalender:</span>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-sky-200 border border-sky-400" />
                <span>Pengisian KRS</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-200 border border-emerald-400" />
                <span>Perkuliahan</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-200 border border-amber-400" />
                <span>UTS</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-yellow-200 border border-yellow-400" />
                <span>Minggu Tenang</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-orange-200 border border-orange-400" />
                <span>UAS</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-200 border border-rose-400" />
                <span>Libur / Cuti</span>
              </span>
            </div>
          </div>
        </div>

        {/* 5. Detail Panel Tanggal Terpilih (Right Column) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-200 shadow-sm space-y-4">
          <div className="border-b border-teal-100 pb-3">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>Agenda Tanggal Terpilih</span>
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {new Intl.DateTimeFormat('id-ID', {
                timeZone: timezone,
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date(`${selectedDateStr}T12:00:00Z`))}
            </h3>
          </div>

          {/* Section A: Agenda Resmi Kalender Akademik UPNVJ (Lengkap dengan Penjelasan Mudah) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Kalender Akademik UPNVJ ({dayEvents.length})</span>
              </h4>
              <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                SK Rektor 2026
              </span>
            </div>

            {dayEvents.length > 0 ? (
              <div className="space-y-3">
                {dayEvents.map((ev) => {
                  const eventInfo = ev as UpnvjAcademicEvent;
                  const isUts = ev.type === 'uts';
                  const isUas = ev.type === 'uas';
                  const isMingguTenang = ev.type === 'minggu_tenang';
                  const isLibur = ev.type === 'libur';

                  return (
                    <div
                      key={ev.id}
                      className={`p-4 rounded-2xl border space-y-2.5 transition-all shadow-2xs ${
                        isUts
                          ? 'bg-amber-50/70 border-amber-300'
                          : isUas
                          ? 'bg-orange-50/70 border-orange-300'
                          : isMingguTenang
                          ? 'bg-yellow-50/70 border-yellow-300'
                          : isLibur
                          ? 'bg-rose-50/70 border-rose-300'
                          : 'bg-teal-50/60 border-teal-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                              isUts
                                ? 'bg-amber-200 text-amber-900 border-amber-300'
                                : isUas
                                ? 'bg-orange-200 text-orange-900 border-orange-300'
                                : isMingguTenang
                                ? 'bg-yellow-200 text-yellow-900 border-yellow-300'
                                : isLibur
                                ? 'bg-rose-200 text-rose-900 border-rose-300'
                                : 'bg-teal-200 text-teal-900 border-teal-300'
                            }`}
                          >
                            {ev.type}
                          </span>
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm mt-1.5 leading-snug">
                            {ev.title}
                          </h5>
                          {ev.location && (
                            <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                              📍 {ev.location}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Penjelasan Mudah Dipahami (User Request Highlight) */}
                      {eventInfo.explanation && (
                        <div className="p-3 rounded-xl bg-white border border-teal-100 space-y-1 shadow-2xs">
                          <p className="text-[11px] font-bold text-teal-900 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>Arti Bagi Mahasiswa Akuntansi:</span>
                          </p>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {eventInfo.explanation}
                          </p>
                        </div>
                      )}

                      {/* Tips Persiapan Mahasiswa */}
                      {eventInfo.actionAdvice && (
                        <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-emerald-900 block font-bold">Apa yang Harus Dipersiapkan?</strong>
                            <span>{eventInfo.actionAdvice}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400 italic">
                Tidak ada agenda akademik khusus UPNVJ pada tanggal ini.
              </div>
            )}
          </div>

          {/* Section B: Jadwal Kuliah Rutin Hari Ini */}
          <div className="pt-3 border-t border-teal-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>Jadwal Perkuliahan Rutin ({dayCourses.length})</span>
              </span>
              <span className="text-[10px] text-teal-700 font-semibold">20 SKS KRS</span>
            </h4>

            <div className="space-y-2">
              {dayCourses.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white text-teal-800 border border-teal-200">
                      {c.sks} SKS
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-700 font-medium mt-1">
                    ⏰ {c.startTime} - {c.endTime} WIB • 📍 {c.room}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Dosen: {c.lecturer}
                  </p>
                </div>
              ))}
              {dayCourses.length === 0 && (
                <p className="text-xs text-slate-400 italic p-2 bg-slate-50 rounded-xl text-center">
                  Tidak ada jadwal mata kuliah rutin di hari ini.
                </p>
              )}
            </div>
          </div>

          {/* Section C: Tenggat Tugas Mahasiswa */}
          <div className="pt-3 border-t border-teal-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>Tenggat Tugas Akuntansi ({dayTasks.length})</span>
            </h4>

            <div className="space-y-2">
              {dayTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs shadow-2xs"
                >
                  <p className="font-bold text-slate-900">{t.title}</p>
                  <p className="text-[11px] text-rose-700 font-semibold mt-0.5">
                    Tenggat: {formatFullIndonesianDateTime(t.deadlineAt, timezone)}
                  </p>
                </div>
              ))}
              {dayTasks.length === 0 && (
                <p className="text-xs text-slate-400 italic p-2 bg-slate-50 rounded-xl text-center">
                  Tidak ada tenggat tugas di tanggal ini. Aman!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Modal Tampilan PDF SK Rektor Kalender Akademik Resmi UPNVJ */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-teal-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-teal-100 flex items-center justify-between bg-gradient-to-r from-teal-50 via-emerald-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-600 text-white shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Dokumen Resmi SK Rektor: Kalender Akademik UPNVJ 2026/2027
                  </h3>
                  <p className="text-xs text-teal-700">
                    Nomor: {UPNVJ_DECREE_INFO.decreeNumber} • Kampus Bela Negara
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={UPNVJ_DECREE_INFO.pdfPath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                  <span>Buka Tab Baru</span>
                </a>

                <a
                  href={UPNVJ_DECREE_INFO.pdfPath}
                  download="Kalender_Akademik_UPNVJ_2026_2027.pdf"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="flex-1 p-3 bg-slate-100">
              <iframe
                src={UPNVJ_DECREE_INFO.pdfPath}
                className="w-full h-full rounded-2xl border border-teal-200 bg-white shadow-inner"
                title="Kalender Akademik Resmi UPNVJ 2026/2027"
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal Tambah Acara / Ujian Pribadi */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-teal-200">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tambah Agenda / Acara Pribadi
                </h3>
                <p className="text-xs text-teal-700">
                  Simpan jadwal kuis khusus, presentasi kelompok, atau seminar
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEventOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewEvent} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1 block">
                  Nama Agenda / Acara *
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Contoh: Diskusi Kelompok Audit Bab 5"
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1 block">
                    Kategori
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as unknown as typeof eventType)}
                    className="w-full px-2 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400 outline-none"
                  >
                    <option value="uts">UTS</option>
                    <option value="uas">UAS</option>
                    <option value="presentasi">Presentasi</option>
                    <option value="seminar">Seminar / Webinar</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1 block">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1 block">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 mb-1 block">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 mb-1 block">
                  Lokasi / Ruang
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Gedung FEB UPNVJ / Google Meet"
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-teal-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md cursor-pointer hover:from-emerald-600 hover:to-teal-700"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
