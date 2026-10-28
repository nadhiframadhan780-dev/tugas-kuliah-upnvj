/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lapisan Data (Repository Pattern) & IndexedDB Planner Akuntansi UPNVJ
 * Menjamin semua data tugas, jadwal, dan lampiran tersimpan aman di perangkat pengguna.
 */

import { Task, Course, CalendarEvent, GradeItem, PomodoroSession, AppSettings } from '../types';
import { createUtcTimestamp } from '../utils/time';

const DB_NAME = 'planner_akuntansi_upnvj_db';
const DB_VERSION = 2;

export const DEFAULT_SETTINGS: AppSettings = {
  timezone: 'Asia/Jakarta',
  theme: 'light',
  highContrast: false,
  enableConfetti: true,
  enableNotifications: false,
  aiEnabled: false,
  userName: 'Nadhif Aulia Ramadhan',
  userNim: '2610112058',
  userMajor: 'S1 Akuntansi - Kelas B/2026',
  hasCompletedOnboarding: true,
};

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    // Request persistent storage if supported
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      navigator.storage.persist().then((persisted) => {
        if (persisted) {
          console.log('IndexedDB persistent storage disetujui peramban.');
        }
      }).catch(() => {});
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('status', 'status', { unique: false });
        taskStore.createIndex('deadlineAt', 'deadlineAt', { unique: false });
        taskStore.createIndex('courseId', 'courseId', { unique: false });
        taskStore.createIndex('deletedAt', 'deletedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('courses')) {
        const courseStore = db.createObjectStore('courses', { keyPath: 'id' });
        courseStore.createIndex('dayOfWeek', 'dayOfWeek', { unique: false });
      }

      if (!db.objectStoreNames.contains('events')) {
        const eventStore = db.createObjectStore('events', { keyPath: 'id' });
        eventStore.createIndex('date', 'date', { unique: false });
      }

      if (!db.objectStoreNames.contains('grades')) {
        const gradeStore = db.createObjectStore('grades', { keyPath: 'id' });
        gradeStore.createIndex('courseId', 'courseId', { unique: false });
      }

      if (!db.objectStoreNames.contains('pomodoro')) {
        const pomoStore = db.createObjectStore('pomodoro', { keyPath: 'id' });
        pomoStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

// -------------------------------------------------------------
// Generic IndexedDB Helper
// -------------------------------------------------------------
async function getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
  const db = await getDatabase();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

// -------------------------------------------------------------
// Task Repository
// -------------------------------------------------------------
export const taskRepository = {
  async getAll(): Promise<Task[]> {
    const store = await getStore('tasks', 'readonly');
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async getById(id: string): Promise<Task | null> {
    const store = await getStore('tasks', 'readonly');
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  },

  async save(task: Task): Promise<void> {
    const store = await getStore('tasks', 'readwrite');
    return new Promise((resolve, reject) => {
      const updated = { ...task, updatedAt: Date.now() };
      const req = store.put(updated);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveMany(tasks: Task[]): Promise<void> {
    const db = await getDatabase();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    for (const task of tasks) {
      store.put({ ...task, updatedAt: Date.now() });
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async delete(id: string): Promise<void> {
    const store = await getStore('tasks', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async moveToTrash(id: string): Promise<void> {
    const task = await this.getById(id);
    if (task) {
      task.deletedAt = Date.now();
      await this.save(task);
    }
  },

  async restoreFromTrash(id: string): Promise<void> {
    const task = await this.getById(id);
    if (task) {
      delete task.deletedAt;
      await this.save(task);
    }
  },

  async emptyTrash(): Promise<void> {
    const all = await this.getAll();
    const db = await getDatabase();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    for (const t of all) {
      if (t.deletedAt) {
        store.delete(t.id);
      }
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
};

// -------------------------------------------------------------
// Course Repository
// -------------------------------------------------------------
export const courseRepository = {
  async getAll(): Promise<Course[]> {
    const store = await getStore('courses', 'readonly');
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async save(course: Course): Promise<void> {
    const store = await getStore('courses', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put(course);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveMany(courses: Course[]): Promise<void> {
    const db = await getDatabase();
    const tx = db.transaction('courses', 'readwrite');
    const store = tx.objectStore('courses');
    for (const c of courses) {
      store.put(c);
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async delete(id: string): Promise<void> {
    const store = await getStore('courses', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
};

// -------------------------------------------------------------
// Calendar Event Repository
// -------------------------------------------------------------
export const eventRepository = {
  async getAll(): Promise<CalendarEvent[]> {
    const store = await getStore('events', 'readonly');
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async save(event: CalendarEvent): Promise<void> {
    const store = await getStore('events', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put(event);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async delete(id: string): Promise<void> {
    const store = await getStore('events', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
};

// -------------------------------------------------------------
// Grade Repository
// -------------------------------------------------------------
export const gradeRepository = {
  async getAll(): Promise<GradeItem[]> {
    const store = await getStore('grades', 'readonly');
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async save(grade: GradeItem): Promise<void> {
    const store = await getStore('grades', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put(grade);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async saveMany(grades: GradeItem[]): Promise<void> {
    const db = await getDatabase();
    const tx = db.transaction('grades', 'readwrite');
    const store = tx.objectStore('grades');
    for (const g of grades) {
      store.put(g);
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async delete(id: string): Promise<void> {
    const store = await getStore('grades', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
};

// -------------------------------------------------------------
// Pomodoro Repository
// -------------------------------------------------------------
export const pomodoroRepository = {
  async getAll(): Promise<PomodoroSession[]> {
    const store = await getStore('pomodoro', 'readonly');
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async save(session: PomodoroSession): Promise<void> {
    const store = await getStore('pomodoro', 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put(session);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
};

// -------------------------------------------------------------
// Settings Repository
// -------------------------------------------------------------
export const settingsRepository = {
  async get(): Promise<AppSettings> {
    try {
      const store = await getStore('settings', 'readonly');
      return new Promise((resolve) => {
        const req = store.get('app_settings');
        req.onsuccess = () => {
          if (req.result && req.result.value) {
            resolve({ ...DEFAULT_SETTINGS, ...req.result.value });
          } else {
            // Coba ambil dari localStorage sebagai fallback migrasi
            try {
              const local = localStorage.getItem('planner_akuntansi_settings');
              if (local) {
                const parsed = JSON.parse(local);
                resolve({ ...DEFAULT_SETTINGS, ...parsed });
                return;
              }
            } catch {}
            resolve(DEFAULT_SETTINGS);
          }
        };
        req.onerror = () => resolve(DEFAULT_SETTINGS);
      });
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async save(settings: AppSettings): Promise<void> {
    try {
      const store = await getStore('settings', 'readwrite');
      await new Promise<void>((resolve, reject) => {
        const req = store.put({ key: 'app_settings', value: settings });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {}
    // Simpan juga preferensi penting ke localStorage
    try {
      localStorage.setItem('planner_akuntansi_settings', JSON.stringify(settings));
    } catch {}
  },
};

// -------------------------------------------------------------
// Seed Data: Contoh Mata Kuliah & Tugas Akuntansi UPNVJ
// -------------------------------------------------------------
export function getOfficialPdfCourses(): Course[] {
  return [
    {
      id: 'course-upn-1',
      code: 'AKT124103',
      name: 'Pengantar Ilmu Ekonomi',
      lecturer: 'Khusnul Khatimah. S.P., M.Si.',
      room: 'Kelas Kecil',
      dayOfWeek: 1, // Senin
      startTime: '09:40',
      endTime: '12:10',
      sks: 3,
      classCode: 'C',
      semester: 1,
      color: '#0D9488', // Teal
    },
    {
      id: 'course-upn-2',
      code: 'MKW124104',
      name: 'Pendidikan Bela Negara',
      lecturer: 'Agus Kusmana, SE, MM, CHCSA',
      room: 'Kelas Kecil',
      dayOfWeek: 2, // Selasa
      startTime: '07:10',
      endTime: '08:50',
      sks: 2,
      classCode: 'E',
      semester: 1,
      color: '#059669', // Emerald
    },
    {
      id: 'course-upn-3',
      code: 'AKT124104',
      name: 'Bahasa Inggris Ekonomi dan Bisnis',
      lecturer: 'Kania Mayastika, Ph.D',
      room: 'Kelas Kecil',
      dayOfWeek: 2, // Selasa
      startTime: '13:00',
      endTime: '15:30',
      sks: 3,
      classCode: 'B',
      semester: 1,
      color: '#0891B2', // Cyan
    },
    {
      id: 'course-upn-4',
      code: 'AKT124105',
      name: 'Pengantar Manajemen dan Bisnis',
      lecturer: 'Agus Kusmana, SE, MM, CHCSA',
      room: 'Kelas Kecil',
      dayOfWeek: 2, // Selasa
      startTime: '15:30',
      endTime: '18:00',
      sks: 3,
      classCode: 'B',
      semester: 1,
      color: '#2563EB', // Blue
    },
    {
      id: 'course-upn-5',
      code: 'MKW124107',
      name: 'Kewarganegaraan',
      lecturer: 'Hairunnisa BR. Sagala, S.Sos., MA',
      room: 'Kelas Kecil',
      dayOfWeek: 3, // Rabu
      startTime: '07:10',
      endTime: '08:50',
      sks: 2,
      classCode: 'E',
      semester: 1,
      color: '#D97706', // Amber
    },
    {
      id: 'course-upn-6',
      code: 'MKW124101',
      name: 'Agama',
      lecturer: 'Dr. Badruddin, S.Pd.I., M.Pd',
      room: 'Kelas Kecil',
      dayOfWeek: 5, // Jumat
      startTime: '07:10',
      endTime: '08:50',
      sks: 2,
      classCode: 'E',
      semester: 1,
      color: '#7C3AED', // Violet
    },
    {
      id: 'course-upn-7',
      code: 'AKT124102',
      name: 'Praktikum Pengantar Akuntansi',
      lecturer: 'Ranti Nugraheni, S.Si.M, Ak',
      room: 'Kelas Kecil',
      dayOfWeek: 5, // Jumat
      startTime: '13:00',
      endTime: '14:40',
      sks: 2,
      classCode: 'B',
      semester: 1,
      color: '#0D9488', // Teal
    },
    {
      id: 'course-upn-8',
      code: 'AKT124101',
      name: 'Pengantar Akuntansi',
      lecturer: 'Prof. Dr. Amrie Firmansyah, SE., M.Ak., ME',
      room: 'Kelas Kecil',
      dayOfWeek: 5, // Jumat
      startTime: '15:30',
      endTime: '18:00',
      sks: 3,
      classCode: 'B',
      semester: 1,
      color: '#059669', // Emerald
    },
  ];
}

export function getSampleAccountingCourses(): Course[] {
  return getOfficialPdfCourses();
}

export function getSampleAccountingTasks(nowUtc: number = Date.now()): Task[] {
  const oneDay = 24 * 3600 * 1000;

  return [
    {
      id: 'task-sample-1',
      title: 'Tugas 3: Rekonsiliasi Bank dan Laporan Kas',
      summary:
        'Pengerjaan rekonsiliasi saldo bank 4 kolom dan 8 kolom beserta pembuatan jurnal penyesuaian untuk kas yang belum tercatat per 31 Oktober.',
      keyPoints: [
        'Hitung setoran dalam perjalanan (deposit in transit) dan cek yang masih beredar (outstanding checks).',
        'Analisis biaya administrasi bank dan pendapatan jasa giro yang belum dibukukan.',
        'Susun jurnal penyesuaian akun Kas di Bank pada buku besar.',
      ],
      requirements: [
        'Ditulis tangan pada kertas folio bergaris atau diketik di lembar kerja Excel terformat.',
        'Kumpulkan via Google Classroom paling lambat pukul 23.59 WIB.',
      ],
      questions: [
        'Susun rekonsiliasi bank per 31 Oktober.',
        'Buatlah ayat jurnal penyesuaian yang diperlukan.',
      ],
      courseId: 'course-1',
      courseName: 'Akuntansi Keuangan Menengah 1',
      type: 'Individu',
      priority: 'tinggi',
      deadlineAt: nowUtc + 2 * oneDay + 5 * 3600 * 1000, // ~2 hari lagi (Waspada)
      deadlineTz: 'Asia/Jakarta',
      status: 'pending',
      subtasks: [
        { id: 'st-1', title: 'Unduh laporan mutasi rekening koran', completed: true },
        { id: 'st-2', title: 'Pencocokan saldo buku perusahaan vs bank', completed: false },
        { id: 'st-3', title: 'Penyusunan format rekonsiliasi 4 kolom', completed: false },
        { id: 'st-4', title: 'Membuat jurnal koreksi & penyesuaian', completed: false },
      ],
      attachments: [],
      links: ['https://elearning.upnvj.ac.id'],
      notes: 'Gunakan saldo adjusted balance method.',
      reminders: [1440, 180, 60],
      tags: ['Kas', 'Rekonsiliasi', 'Jurnal'],
      createdAt: nowUtc - oneDay,
      updatedAt: nowUtc - oneDay,
    },
    {
      id: 'task-sample-2',
      title: 'Studi Kasus Alokasi Biaya Overhead Pabrik (BOP)',
      summary:
        'Analisis pembebanan BOP sesungguhnya vs BOP yang dibebankan pada PT Manufaktur Logam Prima dengan metode langsung dan bertahap.',
      keyPoints: [
        'Hitung tarif BOP per jam mesin dan jam kerja langsung.',
        'Identifikasi selisih lebih (overapplied) atau selisih kurang (underapplied) BOP.',
        'Rekomendasikan perlakuan akuntansi terhadap selisih biaya akhir tahun.',
      ],
      requirements: [
        'Format laporan PDF maksimal 8 halaman.',
        'Cantumkan perhitungan tabel alokasi departemen pembantu ke departemen produksi.',
      ],
      questions: [
        'Berapakah tarif pembebanan BOP Departemen Perakitan?',
        'Hitung varians selisih anggaran dan selisih kapasitas.',
      ],
      courseId: 'course-2',
      courseName: 'Akuntansi Biaya',
      type: 'Studi Kasus',
      priority: 'sedang',
      deadlineAt: nowUtc + 5 * oneDay, // ~5 hari lagi (Aman)
      deadlineTz: 'Asia/Jakarta',
      status: 'pending',
      subtasks: [
        { id: 'st-5', title: 'Membaca soal kasus PT Manufaktur Logam Prima', completed: true },
        { id: 'st-6', title: 'Membuat tabel alokasi metode bertahap (step method)', completed: true },
        { id: 'st-7', title: 'Analisis varians BOP', completed: false },
      ],
      attachments: [],
      links: [],
      notes: 'Buku acuan: Mulyadi - Akuntansi Biaya Edisi 5.',
      reminders: [1440, 60],
      tags: ['BOP', 'Cost Accounting'],
      createdAt: nowUtc - 2 * oneDay,
      updatedAt: nowUtc - 2 * oneDay,
    },
    {
      id: 'task-sample-3',
      title: 'Kuis Bab Audit Sampling & Bukti Pemeriksaan',
      summary:
        'Kuis interaktif mengenai penentuan ukuran sampel, risiko sampling, dan prosedur vouching bukti transaksi penjualan.',
      keyPoints: [
        'Pelajari materi Standard Profesional Akuntan Publik (SPAP) SA 500 dan SA 530.',
        'Fokus pada perbedaan statistical sampling vs non-statistical sampling.',
      ],
      requirements: ['Waktu kuis 60 menit melalui sistem e-Learning UPNVJ.'],
      questions: ['Pilihan ganda dan studi kasus singkat 5 butir.'],
      courseId: 'course-3',
      courseName: 'Auditing 1',
      type: 'Kuis',
      priority: 'kritis',
      deadlineAt: nowUtc + 18 * 3600 * 1000, // 18 jam lagi (< 24 jam = Mendesak)
      deadlineTz: 'Asia/Jakarta',
      status: 'pending',
      subtasks: [
        { id: 'st-8', title: 'Review slide materi SA 530 Audit Sampling', completed: true },
        { id: 'st-9', title: 'Latihan soal sampling risiko alfa dan beta', completed: false },
      ],
      attachments: [],
      links: ['https://elearning.upnvj.ac.id'],
      notes: 'Dilarang membuka buku/catatan selama kuis.',
      reminders: [180, 60, 30],
      tags: ['Audit', 'Kuis'],
      createdAt: nowUtc - 3 * oneDay,
      updatedAt: nowUtc - 3 * oneDay,
    },
    {
      id: 'task-sample-4',
      title: 'Perhitungan PPh Pasal 21 Karyawan Tetap & Tidak Tetap',
      summary:
        'Penyusunan kertas kerja perhitungan pajak penghasilan PPh 21 menggunakan tarif progresif UU HPP dan skema TER (Tarif Efektif Rata-Rata).',
      keyPoints: [
        'Hitung penghasilan bruto, biaya jabatan, dan iuran pensiun.',
        'Terapkan PTKP (TK/0, K/1, K/2, K/3) sesuai status kawin.',
        'Tentukan PPh Pasal 21 terutang masa bulanan dan masa Desember.',
      ],
      requirements: ['Format Excel (.xlsx) dengan formula otomatis.'],
      questions: ['Hitung PPh 21 untuk 5 karyawan dengan status berbeda.'],
      courseId: 'course-4',
      courseName: 'Perpajakan 1',
      type: 'Praktikum',
      priority: 'sedang',
      deadlineAt: nowUtc - 2 * 3600 * 1000, // 2 jam lalu (Terlambat untuk uji visual)
      deadlineTz: 'Asia/Jakarta',
      status: 'pending',
      subtasks: [
        { id: 'st-10', title: 'Input data master karyawan ke spreadsheet', completed: true },
        { id: 'st-11', title: 'Penerapan rumus tabel TER PPh 21', completed: false },
      ],
      attachments: [],
      links: [],
      notes: 'Sesuaikan dengan PMK 168 Tahun 2023.',
      reminders: [60],
      tags: ['Pajak', 'PPh21', 'TER'],
      createdAt: nowUtc - 4 * oneDay,
      updatedAt: nowUtc - 4 * oneDay,
    },
    {
      id: 'task-sample-5',
      title: 'Diagram Alir Data (DFD) Siklus Pendapatan SIA',
      summary:
        'Pembuatan Context Diagram dan DFD Level 0 serta Level 1 untuk sistem informasi penjualan kredit dan penerimaan kas.',
      keyPoints: [
        'Gambarkan entitas eksternal: Pelanggan, Bank, Bagian Kredit, dan Gudang.',
        'Spesifikasikan data store (master file piutang, jurnal penjualan, pesanan penjualan).',
      ],
      requirements: ['Gunakan simbol diagram standar Gane & Sarson atau Yourdon.'],
      questions: ['Buat DFD siklus pendapatan dari pemesanan hingga penagihan.'],
      courseId: 'course-5',
      courseName: 'Sistem Informasi Akuntansi',
      type: 'Laporan/Makalah',
      priority: 'rendah',
      deadlineAt: nowUtc - oneDay,
      deadlineTz: 'Asia/Jakarta',
      status: 'completed',
      completedAt: nowUtc - oneDay - 3600 * 1000,
      onTime: true,
      subtasks: [
        { id: 'st-12', title: 'Identifikasi alur bisnis penjualan', completed: true },
        { id: 'st-13', title: 'Menggambar diagram konteks', completed: true },
        { id: 'st-14', title: 'Export diagram ke PDF', completed: true },
      ],
      attachments: [],
      links: [],
      notes: 'Selesai tepat waktu sebelum tenggat.',
      reminders: [],
      tags: ['SIA', 'DFD', 'Diagram'],
      createdAt: nowUtc - 5 * oneDay,
      updatedAt: nowUtc - oneDay,
    },
  ];
}

export function getSampleGrades(): GradeItem[] {
  return [
    { id: 'g-1', courseId: 'course-1', componentName: 'Tugas & Kuis', weightPercent: 20, score: 88 },
    { id: 'g-2', courseId: 'course-1', componentName: 'Praktikum', weightPercent: 20, score: 92 },
    { id: 'g-3', courseId: 'course-1', componentName: 'UTS', weightPercent: 30, score: 84 },
    { id: 'g-4', courseId: 'course-1', componentName: 'UAS', weightPercent: 30, score: 86 },

    { id: 'g-5', courseId: 'course-2', componentName: 'Tugas Individu', weightPercent: 15, score: 85 },
    { id: 'g-6', courseId: 'course-2', componentName: 'Studi Kasus', weightPercent: 25, score: 90 },
    { id: 'g-7', courseId: 'course-2', componentName: 'UTS', weightPercent: 30, score: 80 },
    { id: 'g-8', courseId: 'course-2', componentName: 'UAS', weightPercent: 30, score: 87 },

    { id: 'g-9', courseId: 'course-3', componentName: 'Kuis & Partisipasi', weightPercent: 20, score: 95 },
    { id: 'g-10', courseId: 'course-3', componentName: 'Kertas Kerja Audit', weightPercent: 30, score: 88 },
    { id: 'g-11', courseId: 'course-3', componentName: 'UTS', weightPercent: 25, score: 82 },
    { id: 'g-12', courseId: 'course-3', componentName: 'UAS', weightPercent: 25, score: 85 },
  ];
}

/**
 * Inisialisasi awal database dengan data sampel bila database kosong
 */
export async function initializeDatabaseWithSampleIfEmpty(): Promise<void> {
  const tasks = await taskRepository.getAll();
  const courses = await courseRepository.getAll();

  const isOldSample = courses.some((c) => c.code === 'AKT201' || c.name.includes('Menengah 1'));
  if (courses.length === 0 || isOldSample) {
    const officialCourses = getOfficialPdfCourses();
    await courseRepository.saveMany(officialCourses);
  }

  if (tasks.length === 0) {
    const sampleTasks = getSampleAccountingTasks();
    await taskRepository.saveMany(sampleTasks);
    const sampleGrades = getSampleGrades();
    await gradeRepository.saveMany(sampleGrades);
  }
}
