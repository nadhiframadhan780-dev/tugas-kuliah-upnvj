/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Jadwal Kuliah Mahasiswa S1 Akuntansi UPNVJ
 * Sesuai Dokumen Resmi SIAKAD FEB UPNVJ (Nadhif Aulia Ramadhan - NIM: 2610112058)
 * Mendukung Grid Mingguan, Geser Hari (Drag-and-Drop / Tombol),
 * Pilihan "Simpan Sementara" vs "Simpan untuk Hari-Hari Selanjutnya",
 * Deteksi Bentrok Otomatis, dan Ekspor Kalender / Cetak.
 */

import React, { useState } from 'react';
import {
  Clock,
  Plus,
  MapPin,
  User,
  AlertTriangle,
  Download,
  Printer,
  Trash2,
  Edit2,
  Calendar,
  X,
  Check,
  ArrowRightLeft,
  RotateCcw,
  FileText,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Course } from '../types';
import { getLocalDateAndTimeParts } from '../utils/time';
import { getOfficialPdfCourses } from '../services/db';

interface ScheduleViewProps {
  courses: Course[];
  onSaveCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onSyncOfficialSchedule?: () => void;
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
  '#2563EB', // Blue
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#DB2777', // Pink
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  courses,
  onSaveCourse,
  onDeleteCourse,
  onSyncOfficialSchedule,
  timezone,
  nowUtc,
}) => {
  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  // Form State for CRUD
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [room, setRoom] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:30');
  const [sks, setSks] = useState(3);
  const [classCode, setClassCode] = useState('B');
  const [semester, setSemester] = useState(1);
  const [color, setColor] = useState(COURSE_COLORS[0]);

  // Reschedule (Geser Hari) Modal State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [courseToReschedule, setCourseToReschedule] = useState<Course | null>(null);
  const [rescheduleTargetDay, setRescheduleTargetDay] = useState(1);
  const [rescheduleStartTime, setRescheduleStartTime] = useState('08:00');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('10:30');
  const [rescheduleNote, setRescheduleNote] = useState('Kuliah Pengganti Minggu Ini');

  // Drag over day highlight state
  const [dragOverDayIndex, setDragOverDayIndex] = useState<number | null>(null);

  // Success Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Helper: get effective day & time considering temporary shift
  const getEffectiveDay = (c: Course): number => {
    return c.temporaryShift?.isShifted ? c.temporaryShift.shiftedDayOfWeek : c.dayOfWeek;
  };

  const getEffectiveStartTime = (c: Course): string => {
    return c.temporaryShift?.isShifted ? c.temporaryShift.shiftedStartTime : c.startTime;
  };

  const getEffectiveEndTime = (c: Course): string => {
    return c.temporaryShift?.isShifted ? c.temporaryShift.shiftedEndTime : c.endTime;
  };

  // Current day index in selected timezone
  const parts = getLocalDateAndTimeParts(nowUtc, timezone);
  const nowDate = new Date(`${parts.dateStr}T00:00:00Z`);
  const todayDayIndex = nowDate.getUTCDay(); // 0 = Minggu, 1 = Senin ...
  const currentMinutes =
    parseInt(parts.timeStr.split(':')[0], 10) * 60 + parseInt(parts.timeStr.split(':')[1], 10);

  // Realtime Active / Next Class Status
  const todayCourses = courses
    .filter((c) => getEffectiveDay(c) === todayDayIndex)
    .sort((a, b) => getEffectiveStartTime(a).localeCompare(getEffectiveStartTime(b)));

  let ongoingCourse: { course: Course; minutesLeft: number } | null = null;
  let nextCourse: { course: Course; minutesUntil: number } | null = null;

  for (const c of todayCourses) {
    const sTime = getEffectiveStartTime(c);
    const eTime = getEffectiveEndTime(c);
    const startMins =
      parseInt(sTime.replace('.', ':').split(':')[0], 10) * 60 +
      parseInt(sTime.replace('.', ':').split(':')[1], 10);
    const endMins =
      parseInt(eTime.replace('.', ':').split(':')[0], 10) * 60 +
      parseInt(eTime.replace('.', ':').split(':')[1], 10);

    if (currentMinutes >= startMins && currentMinutes <= endMins) {
      ongoingCourse = { course: c, minutesLeft: endMins - currentMinutes };
      break;
    } else if (currentMinutes < startMins) {
      if (!nextCourse || startMins < parseInt(getEffectiveStartTime(nextCourse.course).replace('.', ':').split(':')[0], 10) * 60) {
        nextCourse = { course: c, minutesUntil: startMins - currentMinutes };
      }
    }
  }

  // Conflict Detection
  const checkConflict = (
    day: number,
    start: string,
    end: string,
    excludeId?: string
  ): Course | undefined => {
    const s1 =
      parseInt(start.replace('.', ':').split(':')[0], 10) * 60 +
      parseInt(start.replace('.', ':').split(':')[1], 10);
    const e1 =
      parseInt(end.replace('.', ':').split(':')[0], 10) * 60 +
      parseInt(end.replace('.', ':').split(':')[1], 10);

    return courses.find((c) => {
      if (c.id === excludeId) return false;
      if (getEffectiveDay(c) !== day) return false;
      const s2 =
        parseInt(getEffectiveStartTime(c).replace('.', ':').split(':')[0], 10) * 60 +
        parseInt(getEffectiveStartTime(c).replace('.', ':').split(':')[1], 10);
      const e2 =
        parseInt(getEffectiveEndTime(c).replace('.', ':').split(':')[0], 10) * 60 +
        parseInt(getEffectiveEndTime(c).replace('.', ':').split(':')[1], 10);
      return Math.max(s1, s2) < Math.min(e1, e2);
    });
  };

  const openCreateModal = () => {
    setCourseToEdit(null);
    setCode('AKT124');
    setName('');
    setLecturer('');
    setRoom('Kelas Kecil');
    setDayOfWeek(1);
    setStartTime('08:00');
    setEndTime('10:30');
    setSks(3);
    setClassCode('B');
    setSemester(1);
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

  // Open Geser Hari Modal
  const openRescheduleModal = (c: Course, preferredTargetDay?: number) => {
    setCourseToReschedule(c);
    const currentEffDay = getEffectiveDay(c);
    // If user dropped on specific day, use it; otherwise default to next day or same day
    const initTarget = preferredTargetDay !== undefined ? preferredTargetDay : currentEffDay;
    setRescheduleTargetDay(initTarget);
    setRescheduleStartTime(getEffectiveStartTime(c));
    setRescheduleEndTime(getEffectiveEndTime(c));
    setRescheduleNote(c.temporaryShift?.note || 'Kuliah Pengganti Minggu Ini');
    setIsRescheduleModalOpen(true);
  };

  // Action: Simpan Sementara (Kuliah Pengganti / Minggu Ini)
  const handleSaveTemporaryShift = () => {
    if (!courseToReschedule) return;

    const origDay = courseToReschedule.temporaryShift?.originalDayOfWeek || courseToReschedule.dayOfWeek;
    const origStart = courseToReschedule.temporaryShift?.originalStartTime || courseToReschedule.startTime;
    const origEnd = courseToReschedule.temporaryShift?.originalEndTime || courseToReschedule.endTime;

    const updated: Course = {
      ...courseToReschedule,
      temporaryShift: {
        isShifted: true,
        originalDayOfWeek: origDay,
        originalStartTime: origStart,
        originalEndTime: origEnd,
        shiftedDayOfWeek: rescheduleTargetDay,
        shiftedStartTime: rescheduleStartTime,
        shiftedEndTime: rescheduleEndTime,
        note: rescheduleNote.trim() || 'Kuliah Pengganti Sementara',
        shiftedAt: Date.now(),
      },
    };

    onSaveCourse(updated);
    setIsRescheduleModalOpen(false);
    const targetDayName = DAY_NAMES.find((d) => d.index === rescheduleTargetDay)?.name;
    showToast(`⚡ Jadwal "${updated.name}" berhasil digeser SEMENTARA ke hari ${targetDayName}.`);
  };

  // Action: Simpan untuk Hari-Hari Selanjutnya (Permanen)
  const handleSavePermanentShift = () => {
    if (!courseToReschedule) return;

    const updated: Course = {
      ...courseToReschedule,
      dayOfWeek: rescheduleTargetDay,
      startTime: rescheduleStartTime,
      endTime: rescheduleEndTime,
      temporaryShift: undefined, // Bersihkan temporary shift
    };

    onSaveCourse(updated);
    setIsRescheduleModalOpen(false);
    const targetDayName = DAY_NAMES.find((d) => d.index === rescheduleTargetDay)?.name;
    showToast(`✅ Jadwal "${updated.name}" resmi diubah PERMANEN untuk hari ${targetDayName} dan seterusnya.`);
  };

  // Action: Kembalikan ke Jadwal Rutin
  const handleRevertTemporaryShift = (c: Course) => {
    const updated: Course = {
      ...c,
      temporaryShift: undefined,
    };
    onSaveCourse(updated);
    const origDayName = DAY_NAMES.find((d) => d.index === c.dayOfWeek)?.name;
    showToast(`🔄 Jadwal "${c.name}" dikembalikan ke jadwal rutin semula (${origDayName}).`);
  };

  // Sync to official PDF schedule
  const handleSyncToOfficialSchedule = () => {
    if (confirm('Sinkronkan jadwal kembali ke 8 Mata Kuliah resmi KRS SIAKAD UPNVJ (Nadhif Aulia Ramadhan, 20 SKS)?')) {
      if (onSyncOfficialSchedule) {
        onSyncOfficialSchedule();
      } else {
        const official = getOfficialPdfCourses();
        for (const c of official) {
          onSaveCourse(c);
        }
      }
      showToast('🎉 Berhasil menyinkronkan 8 mata kuliah resmi dari PDF KRS UPNVJ!');
    }
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
    showToast(`Mata kuliah "${newCourse.name}" tersimpan.`);
  };

  const conflict = checkConflict(Number(dayOfWeek), startTime, endTime, courseToEdit?.id);
  const rescheduleConflict = courseToReschedule
    ? checkConflict(
        rescheduleTargetDay,
        rescheduleStartTime,
        rescheduleEndTime,
        courseToReschedule.id
      )
    : undefined;

  // Export iCal for schedule
  const handleExportScheduleIcs = () => {
    const ics = [
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
      const effDay = getEffectiveDay(c);
      const effStart = getEffectiveStartTime(c);
      const effEnd = getEffectiveEndTime(c);
      const byDay = dayOffsets[effDay] || 'MO';
      const cleanStart = effStart.replace(/[^0-9]/g, '').padEnd(4, '0') + '00';
      const cleanEnd = effEnd.replace(/[^0-9]/g, '').padEnd(4, '0') + '00';

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
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/20 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Official KRS UPNVJ Header Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-white border-2 border-teal-300 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-teal-600 text-white shadow-2xs">
                KRS Resmi SIAKAD FEB UPNVJ
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200">
                Semester 1 (Ganjil) • 20 SKS Reguler
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              Jadwal Kuliah: Nadhif Aulia Ramadhan
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              NIM: <strong className="text-teal-900">2610112058</strong> • Kelas: <strong>B / 2026</strong> • S1 Akuntansi Fakultas Ekonomi dan Bisnis
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/assets/aistudio/Jadwal_Kuliah_UPNVJ_2610112058_Nadhif_Aulia_Ramadhan_Sem1_b10656a4.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-teal-300 text-teal-800 hover:bg-teal-50 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Buka Dokumen PDF Asli</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              type="button"
              onClick={handleSyncToOfficialSchedule}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sinkronkan Jadwal SIAKAD (PDF)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Grid Mingguan & Pergeseran Hari (Reschedule)
          </h3>
          <p className="text-xs text-slate-500">
            Tarik & geser kartu matkul ke hari lain, atau klik tombol <strong>"Geser Hari"</strong> dengan pilihan <em>Simpan Sementara</em> atau <em>Simpan untuk Hari Selanjutnya</em>.
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
                <h4 className="text-base font-bold text-slate-900">
                  {ongoingCourse.course.name}
                </h4>
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
                <h4 className="text-base font-bold text-slate-900">
                  {nextCourse.course.name}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pukul {getEffectiveStartTime(nextCourse.course)} - {getEffectiveEndTime(nextCourse.course)} WIB • {nextCourse.course.room}
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

      {/* Weekly Grid (Senin - Sabtu) with Drag-and-Drop Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {DAY_NAMES.map((day) => {
          const dayCourses = courses
            .filter((c) => getEffectiveDay(c) === day.index)
            .sort((a, b) => getEffectiveStartTime(a).localeCompare(getEffectiveStartTime(b)));
          const isToday = day.index === todayDayIndex;
          const isDropTarget = dragOverDayIndex === day.index;

          return (
            <div
              key={day.index}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverDayIndex(day.index);
              }}
              onDragLeave={() => {
                setDragOverDayIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverDayIndex(null);
                const courseId = e.dataTransfer.getData('text/plain');
                const droppedCourse = courses.find((c) => c.id === courseId);
                if (droppedCourse) {
                  openRescheduleModal(droppedCourse, day.index);
                }
              }}
              className={`rounded-2xl p-3.5 border transition-all flex flex-col justify-between ${
                isDropTarget
                  ? 'bg-emerald-100/70 border-emerald-500 scale-[1.02] shadow-md ring-2 ring-emerald-400'
                  : isToday
                  ? 'bg-teal-50/80 border-teal-400 shadow-sm'
                  : 'bg-white border-teal-100 shadow-2xs'
              }`}
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-teal-100">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold ${isToday ? 'text-teal-800' : 'text-slate-800'}`}>
                      {day.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      ({dayCourses.length})
                    </span>
                  </div>
                  {isToday && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white">
                      Hari ini
                    </span>
                  )}
                </div>

                {/* Course Cards in this Day */}
                <div className="space-y-2.5 min-h-[140px]">
                  {dayCourses.map((c) => {
                    const isShifted = Boolean(c.temporaryShift?.isShifted);
                    const origDay = c.temporaryShift?.originalDayOfWeek;
                    const origDayName = DAY_NAMES.find((d) => d.index === origDay)?.name;

                    return (
                      <div
                        key={c.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', c.id);
                        }}
                        className={`p-3 rounded-xl border hover:shadow-md transition-all relative group cursor-grab active:cursor-grabbing ${
                          isShifted
                            ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300 shadow-2xs'
                            : 'bg-slate-50/90 border-teal-100 hover:border-teal-300 shadow-2xs'
                        }`}
                        style={{ borderLeftWidth: '4px', borderLeftColor: c.color || '#0D9488' }}
                      >
                        {/* Temporary shift banner if applicable */}
                        {isShifted && (
                          <div className="mb-2 p-1.5 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">Sementara (Asli: {origDayName})</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRevertTemporaryShift(c);
                              }}
                              title="Kembalikan ke jadwal rutin asli"
                              className="p-0.5 text-amber-800 hover:text-amber-950 hover:bg-amber-200/60 rounded cursor-pointer shrink-0"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <span className="text-xs font-bold text-slate-900 leading-snug line-clamp-3 break-words">
                            {c.name}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => openEditModal(c)}
                              title="Edit Matkul"
                              className="p-1 text-slate-400 hover:text-teal-600 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteCourse(c.id)}
                              title="Hapus Matkul"
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-600 mb-2.5">
                          <div className="flex items-center gap-1 font-semibold text-teal-700 tabular-nums">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>
                              {getEffectiveStartTime(c)} - {getEffectiveEndTime(c)}
                            </span>
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

                        {/* Interactive "Geser Hari" button right on card */}
                        <div className="pt-2 border-t border-teal-100/60 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => openRescheduleModal(c)}
                            className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[10px] font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            <ArrowRightLeft className="w-3 h-3 text-teal-600" />
                            <span>Geser Hari Kuliah</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {dayCourses.length === 0 && (
                    <div className="py-10 text-center text-xs text-slate-400 italic border-2 border-dashed border-teal-100/60 rounded-xl">
                      {isDropTarget ? 'Lepaskan untuk pindah ke hari ini!' : 'Tidak ada jadwal'}
                    </div>
                  )}
                </div>
              </div>

              {/* Drag instruction footer on day card */}
              <div className="text-[10px] text-slate-400 text-center pt-2 mt-2 border-t border-slate-100">
                Tarik matkul ke sini untuk geser
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* MODAL GESER HARI PERKULIAHAN (INTERACTIVE RESCHEDULE)           */}
      {/* ============================================================== */}
      {isRescheduleModalOpen && courseToReschedule && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-teal-200 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Geser Hari Perkuliahan
                  </h3>
                  <p className="text-xs text-teal-700">
                    {courseToReschedule.name} ({courseToReschedule.code})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRescheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Conflict warning if detected */}
              {rescheduleConflict && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Peringatan Bentrok Jadwal:</span> Pada hari dan jam tersebut telah terisi mata kuliah <strong>{rescheduleConflict.name}</strong> ({getEffectiveStartTime(rescheduleConflict)} - {getEffectiveEndTime(rescheduleConflict)}).
                  </div>
                </div>
              )}

              {/* Course Info Card */}
              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mata Kuliah:</span>
                  <span className="font-bold text-slate-900">{courseToReschedule.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Dosen Pengampu:</span>
                  <span className="font-semibold text-slate-800">{courseToReschedule.lecturer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Hari Asal:</span>
                  <span className="font-bold text-teal-800">
                    {DAY_NAMES.find((d) => d.index === courseToReschedule.dayOfWeek)?.name} ({courseToReschedule.startTime} - {courseToReschedule.endTime})
                  </span>
                </div>
              </div>

              {/* Day Selector */}
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                  Pilih Hari Baru:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {DAY_NAMES.map((d) => {
                    const isSelected = rescheduleTargetDay === d.index;
                    return (
                      <button
                        key={d.index}
                        type="button"
                        onClick={() => setRescheduleTargetDay(d.index)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-400'
                            : 'bg-white border border-teal-200 text-slate-700 hover:bg-teal-50'
                        }`}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Jam Mulai Baru
                  </label>
                  <input
                    type="time"
                    value={rescheduleStartTime}
                    onChange={(e) => setRescheduleStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-teal-200 bg-white text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Jam Selesai Baru
                  </label>
                  <input
                    type="time"
                    value={rescheduleEndTime}
                    onChange={(e) => setRescheduleEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-teal-200 bg-white text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-400 font-mono"
                  />
                </div>
              </div>

              {/* Notes / Alasan Pergeseran */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Catatan / Alasan Pergeseran (Opsional)
                </label>
                <input
                  type="text"
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder="Contoh: Kuliah pengganti tanggal 30 Okt / Dosen izin"
                  className="w-full px-3 py-2 rounded-xl border border-teal-200 bg-white text-xs text-slate-900 outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              {/* DUA PILIHAN SIMPAN SESUAI SPESIFIKASI USER */}
              <div className="pt-3 border-t border-teal-100 space-y-2.5">
                <div className="text-xs font-bold text-slate-800">
                  Pilih Cara Penyimpanan:
                </div>

                {/* Pilihan 1: Simpan Sementara */}
                <button
                  type="button"
                  onClick={handleSaveTemporaryShift}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/60 hover:from-amber-100 hover:to-orange-100 border border-amber-300 text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-950 group-hover:text-amber-900">
                          1. Simpan Sementara
                        </div>
                        <div className="text-[11px] text-amber-800">
                          Hanya berlaku untuk minggu ini / kuliah pengganti sementara. Jadwal asli tetap terjaga & bisa dikembalikan kapan saja.
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Pilihan 2: Simpan untuk Hari-Hari Selanjutnya */}
                <button
                  type="button"
                  onClick={handleSavePermanentShift}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-teal-300 text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-2xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-teal-950 group-hover:text-teal-900">
                          2. Simpan untuk Hari-Hari Selanjutnya
                        </div>
                        <div className="text-[11px] text-teal-800">
                          Permanen mengubah jadwal rutin mingguan mata kuliah untuk seterusnya di database.
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL CRUD MATA KULIAH BARU / EDIT                             */}
      {/* ============================================================== */}
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
                    placeholder="AKT124103"
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
                    placeholder="Pengantar Akuntansi"
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
                  placeholder="Kelas Kecil / Lab Komputer"
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
                    placeholder="B"
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
