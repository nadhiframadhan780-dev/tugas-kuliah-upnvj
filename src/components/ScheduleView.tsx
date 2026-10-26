/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Jadwal Kuliah Mahasiswa S1 Akuntansi UPNVJ
 * Mendukung Grid Mingguan, Status Realtime Kelas Hari Ini, Deteksi Bentrok & CRUD
 */

import React, { useState } from 'react';
import {
  Clock,
  Plus,
  MapPin,
  User,
  AlertTriangle,
  Download,
  Upload,
  Printer,
  Trash2,
  Edit2,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { Course } from '../types';
import { getLocalDateAndTimeParts } from '../utils/time';

interface ScheduleViewProps {
  courses: Course[];
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  timezone: string;
  nowUtc: number;
}

const DAY_NAMES = [
  { index: 1, name: 'Senin' },
  { index: 2, name: 'Selasa' },
  { index: 3, name: 'Rabu' },
  { index: 4, name: 'Kamis' },
  { index: 5, name: 'Jumat' },
  { index: 6, name: 'Sabtu' },
];

const COURSE_COLORS = [
  '#0D9488', // Teal
  '#059669', // Emerald
  '#0891B2', // Cyan
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#2563EB', // Blue
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  courses,
  onSaveCourse,
  onDeleteCourse,
  timezone,
  nowUtc,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [room, setRoom] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:30');
  const [sks, setSks] = useState(3);
  const [classCode, setClassCode] = useState('S1-AKT-3A');
  const [semester, setSemester] = useState(3);
  const [color, setColor] = useState(COURSE_COLORS[0]);

  // Current day index in selected timezone
  const parts = getLocalDateAndTimeParts(nowUtc, timezone);
  const nowDate = new Date(`${parts.dateStr}T00:00:00Z`);
  const todayDayIndex = nowDate.getUTCDay(); // 0 = Minggu, 1 = Senin ...
  const currentMinutes = parseInt(parts.timeStr.split(':')[0], 10) * 60 + parseInt(parts.timeStr.split(':')[1], 10);

  // Realtime Active / Next Class Status
  const todayCourses = courses
    .filter((c) => c.dayOfWeek === todayDayIndex)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  let ongoingCourse: { course: Course; minutesLeft: number } | null = null;
  let nextCourse: { course: Course; minutesUntil: number } | null = null;

  for (const c of todayCourses) {
    const startMins = parseInt(c.startTime.replace('.', ':').split(':')[0], 10) * 60 + parseInt(c.startTime.replace('.', ':').split(':')[1], 10);
    const endMins = parseInt(c.endTime.replace('.', ':').split(':')[0], 10) * 60 + parseInt(c.endTime.replace('.', ':').split(':')[1], 10);

    if (currentMinutes >= startMins && currentMinutes <= endMins) {
      ongoingCourse = { course: c, minutesLeft: endMins - currentMinutes };
      break;
    } else if (currentMinutes < startMins) {
      if (!nextCourse || startMins < parseInt(nextCourse.course.startTime.replace('.', ':').split(':')[0], 10) * 60) {
        nextCourse = { course: c, minutesUntil: startMins - currentMinutes };
      }
    }
  }

  // Conflict Detection
  const checkConflict = (day: number, start: string, end: string, excludeId?: string): Course | undefined => {
    const s1 = parseInt(start.replace('.', ':').split(':')[0], 10) * 60 + parseInt(start.replace('.', ':').split(':')[1], 10);
    const e1 = parseInt(end.replace('.', ':').split(':')[0], 10) * 60 + parseInt(end.replace('.', ':').split(':')[1], 10);

    return courses.find((c) => {
      if (c.id === excludeId) return false;
      if (c.dayOfWeek !== day) return false;
      const s2 = parseInt(c.startTime.replace('.', ':').split(':')[0], 10) * 60 + parseInt(c.startTime.replace('.', ':').split(':')[1], 10);
      const e2 = parseInt(c.endTime.replace('.', ':').split(':')[0], 10) * 60 + parseInt(c.endTime.replace('.', ':').split(':')[1], 10);
      return Math.max(s1, s2) < Math.min(e1, e2);
    });
  };

  const openCreateModal = () => {
    setCourseToEdit(null);
    setCode('AKT');
    setName('');
    setLecturer('');
    setRoom('FEB Gedung Soetomo');
    setDayOfWeek(1);
    setStartTime('08:00');
    setEndTime('10:30');
    setSks(3);
    setClassCode('S1-AKT-3A');
    setSemester(3);
    setColor(COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)]);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setCourseToEdit(c);
    setCode(c.code);
    setName(c.name);
    setLecturer(c.lecturer);
    setRoom(c.room);
    setDayOfWeek(c.dayOfWeek);
    setStartTime(c.startTime);
    setEndTime(c.endTime);
    setSks(c.sks);
    setClassCode(c.classCode);
    setSemester(c.semester);
    setColor(c.color || COURSE_COLORS[0]);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCourse: Course = {
      id: courseToEdit?.id || `course-${Date.now()}`,
      code: code.trim(),
      name: name.trim(),
      lecturer: lecturer.trim(),
      room: room.trim(),
      dayOfWeek: Number(dayOfWeek),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      sks: Number(sks),
      classCode: classCode.trim(),
      semester: Number(semester),
      color,
    };

    onSaveCourse(newCourse);
    setIsModalOpen(false);
  };

  const conflict = checkConflict(Number(dayOfWeek), startTime, endTime, courseToEdit?.id);

  // Export iCal for schedule
  const handleExportScheduleIcs = () => {
    let ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Planner Akuntansi UPNVJ//Schedule//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Jadwal Kuliah Akuntansi UPNVJ',
    ];

    const dayOffsets: Record<number, string> = {
      1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA',
    };

    for (const c of courses) {
      const byDay = dayOffsets[c.dayOfWeek] || 'MO';
      const cleanStart = c.startTime.replace(/[^0-9]/g, '').padEnd(4, '0') + '00';
      const cleanEnd = c.endTime.replace(/[^0-9]/g, '').padEnd(4, '0') + '00';

      ics.push('BEGIN:VEVENT');
      ics.push(`UID:course-${c.id}@planner-akuntansi-upnvj`);
      ics.push(`SUMMARY:${c.name} (${c.code})`);
      ics.push(`DESCRIPTION:Dosen: ${c.lecturer}\\nKelas: ${c.classCode} (${c.sks} SKS)`);
      ics.push(`LOCATION:${c.room}`);
      ics.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`);
      ics.push(`DTSTART;TZID=Asia/Jakarta:20261026T${cleanStart}`);
      ics.push(`DTEND;TZID=Asia/Jakarta:20261026T${cleanEnd}`);
      ics.push('END:VEVENT');
    }

    ics.push('END:VCALENDAR');
    const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jadwal-kuliah-akuntansi-upnvj.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
            Jadwal Kuliah S1 Akuntansi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Semester Gasal / Genap • Deteksi bentrok otomatis • Ekspor kalender & cetak
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportScheduleIcs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-teal-200 text-slate-700 text-xs font-semibold hover:bg-teal-50 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Ekspor .ICS</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-teal-200 text-slate-700 text-xs font-semibold hover:bg-teal-50 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak / PDF</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/25 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Mata Kuliah</span>
          </button>
        </div>
      </div>

      {/* Realtime Hari Ini Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sedang Berlangsung */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border border-emerald-200 flex items-center justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Kuliah Sedang Berlangsung</span>
            </div>
            {ongoingCourse ? (
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {ongoingCourse.course.name}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {ongoingCourse.course.room} • {ongoingCourse.course.lecturer}
                </p>
                <p className="text-xs font-semibold text-emerald-700 mt-1">
                  Sisa waktu kelas: {ongoingCourse.minutesLeft} menit lagi
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Tidak ada perkuliahan yang sedang berlangsung saat ini.
              </p>
            )}
          </div>
        </div>

        {/* Kuliah Berikutnya */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-white border border-teal-200 flex items-center justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Kuliah Berikutnya Hari Ini</span>
            </div>
            {nextCourse ? (
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {nextCourse.course.name}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pukul {nextCourse.course.startTime} - {nextCourse.course.endTime} WIB • {nextCourse.course.room}
                </p>
                <p className="text-xs font-semibold text-teal-700 mt-1">
                  Dimulai dalam {Math.floor(nextCourse.minutesUntil / 60)} jam {nextCourse.minutesUntil % 60} menit
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                {todayDayIndex === 0 ? 'Hari ini hari Minggu (libur).' : 'Semua perkuliahan hari ini telah selesai.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Grid (Senin - Sabtu) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {DAY_NAMES.map((day) => {
          const dayCourses = courses
            .filter((c) => c.dayOfWeek === day.index)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
          const isToday = day.index === todayDayIndex;

          return (
            <div
              key={day.index}
              className={`rounded-2xl p-3.5 border transition-all ${
                isToday
                  ? 'bg-teal-50/80 border-teal-400 shadow-sm'
                  : 'bg-white border-teal-100 shadow-2xs'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-teal-100">
                <span className={`text-sm font-bold ${isToday ? 'text-teal-800' : 'text-slate-800'}`}>
                  {day.name}
                </span>
                {isToday && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white">
                    Hari ini
                  </span>
                )}
              </div>

              {/* Course Cards in this Day */}
              <div className="space-y-2.5 min-h-[120px]">
                {dayCourses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-50/80 border border-teal-100 hover:shadow-xs transition-shadow relative group"
                    style={{ borderLeftWidth: '4px', borderLeftColor: c.color || '#0D9488' }}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span className="text-xs font-bold text-slate-900 leading-snug line-clamp-3 break-words">
                        {c.name}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="p-1 text-slate-400 hover:text-teal-600 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCourse(c.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1 font-semibold text-teal-700 tabular-nums">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{c.startTime} - {c.endTime}</span>
                        <span className="text-[10px] text-slate-400">({c.sks} SKS)</span>
                      </div>
                      <div className="flex items-center gap-1 truncate text-slate-500">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{c.room}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate text-slate-500">
                        <User className="w-3 h-3 shrink-0" />
                        <span className="truncate">{c.lecturer}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {dayCourses.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    Tidak ada jadwal
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal CRUD Mata Kuliah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-teal-100">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {courseToEdit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              {conflict && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Peringatan Bentrok Jadwal:</span> Waktu yang Anda pilih bentrok dengan mata kuliah <strong>{conflict.name}</strong> ({conflict.startTime} - {conflict.endTime}).
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Kode Matkul
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="AKT201"
                    className="w-full px-3 py-1.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Nama Mata Kuliah *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Akuntansi Keuangan Menengah 1"
                    className="w-full px-3 py-1.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Dosen Pengampu
                </label>
                <input
                  type="text"
                  value={lecturer}
                  onChange={(e) => setLecturer(e.target.value)}
                  placeholder="Nama Lengkap Dosen & Gelar"
                  className="w-full px-3 py-1.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Ruang Kuliah / Link Kelas Online
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Gedung Soetomo FEB 301 / Zoom"
                  className="w-full px-3 py-1.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Hari
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                  >
                    {DAY_NAMES.map((d) => (
                      <option key={d.index} value={d.index}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    SKS
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={sks}
                    onChange={(e) => setSks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="S1-AKT-3A"
                    className="w-full px-3 py-1.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Warna Penanda
                  </label>
                  <div className="flex items-center gap-1 pt-1">
                    {COURSE_COLORS.slice(0, 5).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${color === c ? 'scale-125 ring-2 ring-teal-500' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-teal-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/25 cursor-pointer"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
