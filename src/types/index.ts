/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Definisi Tipe Data Inti Planner Akuntansi UPNVJ
 */

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived';

export type TaskType =
  | 'Individu'
  | 'Kelompok'
  | 'Kuis'
  | 'UTS'
  | 'UAS'
  | 'Praktikum'
  | 'Studi Kasus'
  | 'Laporan/Makalah'
  | 'Presentasi'
  | 'Lainnya';

export type TaskPriority = 'rendah' | 'sedang' | 'tinggi' | 'kritis';

export type DeadlineUrgency = 'aman' | 'waspada' | 'mendesak' | 'kritis' | 'terlambat';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string; // Untuk tugas kelompok
}

export interface Attachment {
  id: string;
  name: string;
  mime: string;
  size: number;
  dataUrl?: string; // Base64 / Blob URL untuk unduh/buka lokal
  extractedText?: string;
  isOriginalQuestionDoc?: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  nim?: string;
  role?: string;
}

export interface Task {
  id: string;
  title: string;
  summary: string; // Ringkasan 2-4 kalimat
  keyPoints: string[]; // Yang harus dikerjakan / poin instruksi
  requirements: string[]; // Ketentuan format, jumlah halaman, dll
  questions: string[]; // Daftar butir soal spesifik
  courseId?: string; // ID Mata kuliah relasi
  courseName?: string; // Denormalized course name
  type: TaskType;
  priority: TaskPriority;
  deadlineAt: number; // Timestamp UTC (epoch ms)
  deadlineTz: string; // 'Asia/Jakarta', dll
  status: TaskStatus;
  completedAt?: number; // Timestamp UTC saat ditandai selesai
  onTime?: boolean; // Tepat waktu atau terlambat saat diselesaikan
  subtasks: Subtask[];
  attachments: Attachment[];
  links: string[]; // Link LMS, Google Drive, email pengumpulan
  notes: string;
  reminders: number[]; // Menit sebelum tenggat (e.g. 4320 [H-3], 1440 [H-1], 180 [3 jam], 60 [1 jam], 30)
  tags: string[];
  recurrence?: 'none' | 'weekly';
  isGroupTask?: boolean;
  groupMembers?: GroupMember[];
  deletedAt?: number; // Jika ada di tempat sampah
  createdAt: number;
  updatedAt: number;
}

export interface Course {
  id: string;
  code: string; // e.g. "AKT201"
  name: string; // e.g. "Akuntansi Keuangan Menengah 1"
  lecturer: string; // Nama Dosen
  room: string; // Ruang kuliah atau link Zoom/Meet
  dayOfWeek: number; // 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu, 0 = Minggu
  startTime: string; // "08.00" atau "08:00"
  endTime: string; // "10.30" atau "10:30"
  sks: number; // 2, 3, atau 4 SKS
  classCode: string; // e.g. "Kelas A", "S1-AKT-3A"
  semester: number; // Semester 1 - 8
  color: string; // HEX color untuk badge & kalender
}

export interface CalendarEvent {
  id: string;
  title: string;
  courseId?: string;
  type: 'uts' | 'uas' | 'presentasi' | 'seminar' | 'lainnya';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  notes?: string;
}

export interface GradeItem {
  id: string;
  courseId: string;
  componentName: string; // e.g. "Tugas & Kuis", "UTS", "UAS", "Praktikum"
  weightPercent: number; // Bobot % (mis. 20, 30, 40)
  score: number; // Nilai 0 - 100
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  timestamp: number;
}

export interface AppSettings {
  timezone: string; // 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura'
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  enableConfetti: boolean;
  enableNotifications: boolean;
  customLogoUrl?: string;
  aiApiKey?: string;
  aiEnabled: boolean;
  userName: string;
  hasCompletedOnboarding: boolean;
  lastBackupDate?: number;
}

export interface TaskFilterOptions {
  tab: 'semua' | 'aktif' | 'hari_ini' | 'minggu_ini' | 'terlambat' | 'selesai';
  search: string;
  courseId: string;
  priority: string;
  type: string;
  sortBy: 'deadline' | 'priority' | 'course' | 'created';
  sortOrder: 'asc' | 'desc';
  groupBy: 'none' | 'day' | 'course';
  viewMode: 'list' | 'kanban' | 'calendar';
}
