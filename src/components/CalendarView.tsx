/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kalender Terpadu Planner Akuntansi UPNVJ (Jadwal Kuliah + Tenggat Tugas + Acara Khusus)
 */

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  BookOpen,
  Award,
  X,
} from 'lucide-react';
import { Task, Course, CalendarEvent } from '../types';
import { formatFullIndonesianDateTime } from '../utils/time';

interface CalendarViewProps {
  tasks: Task[];
  courses: Course[];
  events: CalendarEvent[];
  onSaveEvent: (event: CalendarEvent) => void;
  timezone: string;
  nowUtc: number;
}

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

  // Build calendar grid days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: { dayNum: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dNum = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, dNum);
    calendarDays.push({
      dayNum: dNum,
      dateStr: prevMonthDate.toISOString().split('T')[0],
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
    calendarDays.push({
      dayNum: i,
      dateStr: nextMonthDate.toISOString().split('T')[0],
      isCurrentMonth: false,
    });
  }

  // Items on selected date
  const selectedDayDate = new Date(`${selectedDateStr}T00:00:00Z`);
  const selectedDayOfWeek = selectedDayDate.getUTCDay();

  const dayCourses = courses.filter((c) => c.dayOfWeek === selectedDayOfWeek);

  const dayTasks = tasks.filter((t) => {
    if (!t.deadlineAt || t.deletedAt) return false;
    const dStr = new Date(t.deadlineAt).toISOString().split('T')[0];
    return dStr === selectedDateStr;
  });

  const dayEvents = events.filter((e) => e.date === selectedDateStr);

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
    });

    setIsAddEventOpen(false);
    setEventTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
            Kalender Akademik Terpadu
          </h2>
          <p className="text-xs text-teal-700 mt-0.5">
            Sinkronisasi jadwal kuliah, tenggat tugas, ujian (UTS/UAS), dan seminar akuntansi
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEventDate(selectedDateStr);
            setIsAddEventOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Acara / Ujian</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Calendar Grid (2 Cols on desktop) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-4 sm:p-5 border border-teal-100 shadow-sm">
          {/* Month Controller */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-600" />
              <span>{monthNames[month]} {year}</span>
            </h3>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Bulan sebelumnya"
                className="p-1.5 rounded-xl border border-teal-200 text-slate-600 hover:bg-teal-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 rounded-xl border border-teal-200 text-xs font-bold text-teal-800 hover:bg-teal-50 cursor-pointer shadow-2xs"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Bulan berikutnya"
                className="p-1.5 rounded-xl border border-teal-200 text-slate-600 hover:bg-teal-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
            {daysOfWeek.map((d, i) => (
              <div key={i} className={`py-1 ${i === 0 ? 'text-rose-500 font-extrabold' : ''}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Date Cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDateStr;
              const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

              // Check tasks on this date
              const tasksOnDay = tasks.filter((t) => {
                if (!t.deadlineAt || t.deletedAt) return false;
                return new Date(t.deadlineAt).toISOString().split('T')[0] === cell.dateStr;
              });

              // Check events on this date
              const eventsOnDay = events.filter((e) => e.date === cell.dateStr);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[72px] sm:min-h-[84px] p-1.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-teal-500 bg-teal-50/90 ring-2 ring-teal-400/30 shadow-xs'
                      : cell.isCurrentMonth
                      ? 'border-teal-100/70 hover:bg-teal-50/40 bg-white'
                      : 'border-transparent text-slate-300 bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-300'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Indicator dots */}
                    <div className="flex items-center gap-1">
                      {tasksOnDay.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shadow-2xs" title={`${tasksOnDay.length} tugas`} />
                      )}
                      {eventsOnDay.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shadow-2xs" title={`${eventsOnDay.length} acara/ujian`} />
                      )}
                    </div>
                  </div>

                  {/* Micro list preview */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {tasksOnDay.slice(0, 1).map((t) => (
                      <div
                        key={t.id}
                        className="text-[9px] px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 truncate font-semibold"
                      >
                        {t.title}
                      </div>
                    ))}
                    {eventsOnDay.slice(0, 1).map((e) => (
                      <div
                        key={e.id}
                        className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 truncate font-semibold"
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Panel */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm space-y-4">
          <div className="border-b border-teal-100 pb-3">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
              Agenda Tanggal Terpilih
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {new Intl.DateTimeFormat('id-ID', {
                timeZone: timezone,
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(new Date(`${selectedDateStr}T12:00:00Z`))}
            </h3>
          </div>

          {/* Section: Kuliah Rutin di Hari Ini */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>Jadwal Kuliah ({dayCourses.length})</span>
            </h4>
            <div className="space-y-2">
              {dayCourses.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 text-xs shadow-2xs"
                >
                  <p className="font-bold text-slate-900">{c.name}</p>
                  <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                    {c.startTime} - {c.endTime} WIB • {c.room}
                  </p>
                </div>
              ))}
              {dayCourses.length === 0 && (
                <p className="text-xs text-slate-400 italic">Tidak ada perkuliahan rutin.</p>
              )}
            </div>
          </div>

          {/* Section: Tenggat Tugas */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>Tenggat Tugas ({dayTasks.length})</span>
            </h4>
            <div className="space-y-2">
              {dayTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs shadow-2xs"
                >
                  <p className="font-bold text-slate-900">{t.title}</p>
                  <p className="text-[11px] text-rose-700 font-semibold mt-0.5">
                    {formatFullIndonesianDateTime(t.deadlineAt, timezone)}
                  </p>
                </div>
              ))}
              {dayTasks.length === 0 && (
                <p className="text-xs text-slate-400 italic">Tidak ada tenggat tugas di tanggal ini.</p>
              )}
            </div>
          </div>

          {/* Section: Acara Khusus / Ujian */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Acara & Ujian ({dayEvents.length})</span>
            </h4>
            <div className="space-y-2">
              {dayEvents.map((e) => (
                <div
                  key={e.id}
                  className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs shadow-2xs"
                >
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-200 text-amber-900 mr-1.5">
                    {e.type}
                  </span>
                  <span className="font-bold text-slate-900">{e.title}</span>
                  <p className="text-[11px] text-amber-800 mt-1">
                    {e.startTime} - {e.endTime} • {e.location}
                  </p>
                </div>
              ))}
              {dayEvents.length === 0 && (
                <p className="text-xs text-slate-400 italic">Tidak ada ujian atau acara khusus.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-teal-100">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Tambah Acara / Ujian Akademik
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEventOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewEvent} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Nama Acara / Ujian *
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Contoh: UTS Akuntansi Keuangan Menengah 1"
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Jenis
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as unknown as typeof eventType)}
                    className="w-full px-2 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="uts">UTS (Ujian Tengah Semester)</option>
                    <option value="uas">UAS (Ujian Akhir Semester)</option>
                    <option value="presentasi">Presentasi</option>
                    <option value="seminar">Seminar / Workshop</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Lokasi / Ruang
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Gedung Soetomo FEB Ruang 301"
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="pt-3 border-t border-teal-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/25 cursor-pointer"
                >
                  Simpan Acara
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
