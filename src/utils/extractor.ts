/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modul Ekstraksi Dokumen Otomatis untuk Planner Akuntansi UPNVJ
 * Mendukung PDF, DOCX, XLSX/CSV, dan TXT langsung di browser secara lokal & offline.
 */

import { TaskType, Subtask } from '../types';

export interface ExtractionResult {
  title: string;
  summary: string;
  keyPoints: string[];
  requirements: string[];
  questions: string[];
  detectedCourse?: string;
  detectedType: TaskType;
  suggestedDeadlines: string[]; // Tanggal yang ditemukan dalam teks sebagai saran saja
  isScannedPdf?: boolean;
  rawText: string;
  metadata?: Record<string, unknown>;
  excelDetails?: {
    sheets: string[];
    summary: string;
  };
}

// Kamus kata kunci kop yang harus diabaikan saat menentukan judul
const KOP_PATTERNS = [
  /universitas\s+pembangunan\s+nasional/i,
  /veteran\s+jakarta/i,
  /fakultas\s+ekonomi\s+dan\s+bisnis/i,
  /program\s+studi\s+s1\s+akuntansi/i,
  /program\s+studi\s+akuntansi/i,
  /jurusan\s+akuntansi/i,
  /kementerian\s+pendidikan/i,
  /^nama\s*[:=]/i,
  /^nim\s*[:=]/i,
  /^kelas\s*[:=]/i,
  /^dosen\s*[:=]/i,
  /^mata\s*kuliah\s*[:=]/i,
  /^hari\s*[\/,]\s*tanggal\s*[:=]/i,
  /^waktu\s*[:=]/i,
  /^ruang\s*[:=]/i,
  /^semester\s*[:=]/i,
];

// Kata kunci awal baris penanda judul tugas
const TITLE_START_KEYWORDS = [
  'tugas',
  'soal',
  'kuis',
  'uts',
  'uas',
  'ujian tengah semester',
  'ujian akhir semester',
  'studi kasus',
  'case study',
  'laporan',
  'makalah',
  'praktikum',
  'latihan',
  'ujian',
  'assignment',
  'project',
  'proyek',
];

// Kata kunci aksi penting dalam soal akuntansi
const ACCOUNTING_ACTION_WORDS = [
  'kerjakan',
  'jelaskan',
  'hitunglah',
  'susunlah',
  'buatlah',
  'analisis',
  'identifikasi',
  'jurnal',
  'posting',
  'buku besar',
  'neraca saldo',
  'laporan keuangan',
  'laba rugi',
  'arus kas',
  'rekonsiliasi',
  'penyesuaian',
  'beban',
  'pendapatan',
  'pajak',
  'audit',
  'opini audit',
];

// Kata kunci ketentuan
const REQUIREMENT_WORDS = [
  'wajib',
  'harus',
  'dikumpulkan',
  'paling lambat',
  'maksimal',
  'minimal',
  'format',
  'ketentuan',
  'plagiarisme',
  'font',
  'spasi',
  'margin',
  'halaman',
  'pdf',
  'word',
  'unggah',
  'submit',
  'lms',
  'drive',
  'bobot',
];

/**
 * Membersihkan nama file menjadi judul yang rapi
 */
export function cleanFilenameToTitle(filename: string): string {
  let cleaned = filename.replace(/\.[a-zA-Z0-9]+$/, ''); // Hapus ekstensi
  // Hapus kata-kata sampah
  cleaned = cleaned.replace(/[-_]+/g, ' ');
  cleaned = cleaned.replace(/\b(final|revisi|rev\d*|v\d+|fix|soal|tugas|draft|copy|salinan|new)\b/gi, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  if (!cleaned) return 'Tugas Akuntansi';

  // Format kapitalisasi awal kata
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .slice(0, 100);
}

/**
 * Memeriksa apakah suatu baris teks merupakan kop institusi/identitas
 */
export function isKopLine(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3) return true;
  return KOP_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Menentukan judul tugas dari teks dokumen
 */
export function extractTitleFromText(rawText: string, filenameFallback: string = ''): string {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // 1. Cari baris yang diawali kata kunci tugas/soal/kuis/uts/uas dll
  for (const line of lines.slice(0, 25)) {
    if (isKopLine(line)) continue;
    const lower = line.toLowerCase();
    for (const kw of TITLE_START_KEYWORDS) {
      if (lower.startsWith(kw) || lower.startsWith(`${kw}:`) || lower.startsWith(`${kw} -`)) {
        if (line.length >= 6 && line.length <= 110) {
          return line.slice(0, 100);
        }
      }
    }
  }

  // 2. Cari baris bermakna pertama yang bukan kop institusi dan memiliki panjang wajar
  for (const line of lines.slice(0, 15)) {
    if (isKopLine(line)) continue;
    // Abaikan jika terlalu pendek atau hanya angka/tanda baca
    if (line.length >= 8 && line.length <= 90 && !/^[0-9\W]+$/.test(line)) {
      // Pastikan bukan sekadar instruksi umum
      if (!line.toLowerCase().startsWith('petunjuk') && !line.toLowerCase().startsWith('catatan')) {
        return line.slice(0, 100);
      }
    }
  }

  // 3. Fallback: nama file yang dibersihkan
  return cleanFilenameToTitle(filenameFallback);
}

/**
 * Ekstraksi ringkasan 2-4 kalimat dengan pembobotan kata kunci akuntansi
 */
export function extractSummary(rawText: string): string {
  const sentences = rawText
    .split(/(?<=[.?!])\s+(?=[A-Z0-9])|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 300 && !isKopLine(s));

  if (sentences.length === 0) {
    return 'Tugas pengerjaan soal dan latihan kasus akuntansi.';
  }

  // Skor tiap kalimat berdasarkan kemunculan kata kunci aksi & akuntansi
  const scored = sentences.map((sentence) => {
    let score = 0;
    const lower = sentence.toLowerCase();

    for (const word of ACCOUNTING_ACTION_WORDS) {
      if (lower.includes(word)) score += 3;
    }
    for (const kw of TITLE_START_KEYWORDS) {
      if (lower.includes(kw)) score += 2;
    }
    // Kalimat di bagian awal memiliki bobot sedikit lebih tinggi
    return { sentence, score };
  });

  // Urutkan berdasarkan skor tertinggi
  scored.sort((a, b) => b.score - a.score);

  const topSentences = scored.slice(0, 3).map((item) => item.sentence);

  return topSentences.join(' ');
}

/**
 * Ekstraksi 3-8 butir yang harus dikerjakan (baris bernomor, soal, pertanyaan)
 */
export function extractKeyPoints(rawText: string): string[] {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim());
  const points: string[] = [];

  const numberPatterns = [
    /^(?:soal\s*)?[0-9]{1,2}[.)]\s+(.+)/i,
    /^(?:pertanyaan\s*)?[0-9]{1,2}[.)]\s+(.+)/i,
    /^[a-z][.)]\s+(.+)/i,
    /^[-*•]\s+(.+)/,
  ];

  for (const line of lines) {
    if (points.length >= 8) break;
    if (isKopLine(line)) continue;

    for (const pattern of numberPatterns) {
      const match = line.match(pattern);
      if (match && match[1] && match[1].length >= 10) {
        const item = line.slice(0, 160);
        if (!points.includes(item)) {
          points.push(item);
        }
        break;
      }
    }
  }

  // Jika tidak ditemukan format angka, cari kalimat dengan kata kerja imperatif
  if (points.length === 0) {
    const actionSentences = rawText
      .split(/(?<=[.?!])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => {
        const lower = s.toLowerCase();
        return (
          s.length >= 15 &&
          s.length <= 160 &&
          !isKopLine(s) &&
          ACCOUNTING_ACTION_WORDS.some((act) => lower.startsWith(act) || lower.includes(` ${act} `))
        );
      });

    for (const s of actionSentences.slice(0, 5)) {
      points.push(s);
    }
  }

  if (points.length === 0) {
    points.push('Pelajari materi dan instruksi soal terlampir secara teliti.');
    points.push('Susun jawaban dan perhitungan akuntansi sesuai format yang ditentukan.');
  }

  return points;
}

/**
 * Ekstraksi ketentuan (format pengumpulan, font, plagiarisme, batas halaman)
 */
export function extractRequirements(rawText: string): string[] {
  const sentences = rawText
    .split(/(?<=[.?!])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 15 && s.length <= 220 && !isKopLine(s));

  const reqs: string[] = [];

  for (const sentence of sentences) {
    if (reqs.length >= 6) break;
    const lower = sentence.toLowerCase();
    const hasRequirementKeyword = REQUIREMENT_WORDS.some((word) => lower.includes(word));
    if (hasRequirementKeyword && !reqs.includes(sentence)) {
      reqs.push(sentence);
    }
  }

  if (reqs.length === 0) {
    reqs.push('Format pengumpulan dokumen rapi dan cantumkan Nama serta NIM.');
    reqs.push('Dilarang melakukan plagiarisme atau kerja sama tidak sah.');
  }

  return reqs;
}

/**
 * Deteksi mata kuliah dan jenis tugas dari isi dokumen
 */
export function detectCourseAndType(rawText: string): { course?: string; type: TaskType } {
  const lower = rawText.toLowerCase();

  // Deteksi Jenis Tugas
  let type: TaskType = 'Individu';
  if (lower.includes('kelompok') || lower.includes('group') || lower.includes('tim')) {
    type = 'Kelompok';
  } else if (lower.includes('uts') || lower.includes('ujian tengah semester')) {
    type = 'UTS';
  } else if (lower.includes('uas') || lower.includes('ujian akhir semester')) {
    type = 'UAS';
  } else if (lower.includes('kuis') || lower.includes('quiz')) {
    type = 'Kuis';
  } else if (lower.includes('praktikum') || lower.includes('lab')) {
    type = 'Praktikum';
  } else if (lower.includes('studi kasus') || lower.includes('case study')) {
    type = 'Studi Kasus';
  } else if (lower.includes('makalah') || lower.includes('laporan')) {
    type = 'Laporan/Makalah';
  } else if (lower.includes('presentasi') || lower.includes('ppt') || lower.includes('slide')) {
    type = 'Presentasi';
  }

  // Deteksi Mata Kuliah Akuntansi & UPNVJ Semester 1
  const courseKeywords: Record<string, string> = {
    'praktikum pengantar akuntansi': 'Praktikum Pengantar Akuntansi',
    'pengantar akuntansi': 'Pengantar Akuntansi',
    'pengantar ilmu ekonomi': 'Pengantar Ilmu Ekonomi',
    'ilmu ekonomi': 'Pengantar Ilmu Ekonomi',
    'ekonomi mikro': 'Pengantar Ilmu Ekonomi',
    'ekonomi makro': 'Pengantar Ilmu Ekonomi',
    'bela negara': 'Pendidikan Bela Negara',
    'pendidikan bela negara': 'Pendidikan Bela Negara',
    'bahasa inggris ekonomi': 'Bahasa Inggris Ekonomi dan Bisnis',
    'bahasa inggris': 'Bahasa Inggris Ekonomi dan Bisnis',
    'english for business': 'Bahasa Inggris Ekonomi dan Bisnis',
    'pengantar manajemen': 'Pengantar Manajemen dan Bisnis',
    'manajemen dan bisnis': 'Pengantar Manajemen dan Bisnis',
    'kewarganegaraan': 'Kewarganegaraan',
    'pkn': 'Kewarganegaraan',
    'agama': 'Agama',
    'pendidikan agama': 'Agama',
    'akuntansi keuangan': 'Akuntansi Keuangan',
    'akuntansi biaya': 'Akuntansi Biaya',
    'akuntansi manajemen': 'Akuntansi Manajemen',
    'auditing': 'Auditing',
    'audit': 'Auditing',
    'pajak': 'Perpajakan',
    'perpajakan': 'Perpajakan',
    'sistem informasi akuntansi': 'Sistem Informasi Akuntansi (SIA)',
    'sia': 'Sistem Informasi Akuntansi (SIA)',
    'teori akuntansi': 'Teori Akuntansi',
    'akuntansi sektor publik': 'Akuntansi Sektor Publik',
    'analisis laporan keuangan': 'Analisis Laporan Keuangan',
    'etika bisnis': 'Etika Bisnis & Profesi Akuntan',
  };

  let detectedCourse: string | undefined;
  for (const [key, courseName] of Object.entries(courseKeywords)) {
    if (lower.includes(key)) {
      detectedCourse = courseName;
      break;
    }
  }

  return { course: detectedCourse, type };
}

/**
 * Deteksi tanggal yang tertulis di dalam dokumen untuk dijadikan SARAN CHIP saja.
 * (Tidak boleh mengisi tenggat secara otomatis sesuai permintaan user).
 */
export function detectSuggestedDeadlines(rawText: string): string[] {
  const suggestions: string[] = [];

  // Pola tanggal Indonesia: mis. "28 Oktober 2026", "28-10-2026", "28/10/2026"
  const dateRegex = /\b(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})\b/gi;
  let match;
  while ((match = dateRegex.exec(rawText)) !== null) {
    if (!suggestions.includes(match[0])) {
      suggestions.push(match[0]);
    }
    if (suggestions.length >= 3) break;
  }

  return suggestions;
}

/**
 * Template subtugas otomatis per jenis tugas
 */
export function getSubtaskTemplateForType(type: TaskType): Subtask[] {
  const titles = (() => {
    switch (type) {
      case 'Laporan/Makalah':
        return [
          'Cover & Halaman Judul',
          'BAB I Pendahuluan & Latar Belakang',
          'BAB II Landasan Teori Akuntansi',
          'BAB III Pembahasan & Analisis Kasus',
          'BAB IV Kesimpulan & Saran',
          'Daftar Pustaka & Lampiran',
          'Cek Plagiarisme & Format Akhir',
        ];
      case 'Kelompok':
        return [
          'Pembagian peran & sub-topik tim',
          'Pengumpulan draft masing-masing anggota',
          'Diskusi sinkronisasi & telaah bersama',
          'Penyusunan laporan gabungan',
          'Finalisasi & pengumpulan ketua kelompok',
        ];
      case 'Praktikum':
        return [
          'Pencatatan transaksi ke jurnal umum',
          'Posting buku besar (Ledger)',
          'Penyusunan neraca saldo percobaan',
          'Jurnal penyesuaian (Adjusting entries)',
          'Penyusunan Kertas Kerja (Worksheet)',
          'Laporan Keuangan (Laba Rugi, Ekuitas, Neraca)',
        ];
      case 'Studi Kasus':
        return [
          'Membaca dan mengidentifikasi isu utama kasus',
          'Analisis rasio & data finansial',
          'Penyusunan alternatif solusi akuntansi',
          'Rekomendasi tindakan & kesimpulan',
        ];
      case 'Presentasi':
        return [
          'Ringkasan poin utama bahan kuliah',
          'Desain slide presentasi',
          'Latihan penyampaian & pembagian waktu',
        ];
      case 'Kuis':
      case 'UTS':
      case 'UAS':
        return [
          'Review materi & latihan soal tahun lalu',
          'Mempersiapkan alat tulis & kalkulator',
          'Mengerjakan ujian sesuai batas waktu',
        ];
      default:
        return [
          'Membaca instruksi dan materi soal',
          'Mengerjakan jawaban & perhitungan',
          'Review dan periksa kembali hasil akhir',
        ];
    }
  })();

  return titles.map((title, idx) => ({
    id: `sub_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    completed: false,
  }));
}

// -------------------------------------------------------------
// Pemuatan Library CDN Lazy-Load (pdfjs, mammoth, SheetJS xlsx)
// -------------------------------------------------------------

async function loadScript(url: string, globalName: string): Promise<unknown> {
  if ((window as unknown as Record<string, unknown>)[globalName]) {
    return (window as unknown as Record<string, unknown>)[globalName];
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      resolve((window as unknown as Record<string, unknown>)[globalName]);
    };
    script.onerror = () => {
      reject(new Error(`Gagal memuat script dari CDN: ${url}`));
    };
    document.head.appendChild(script);
  });
}

/**
 * Jalankan OCR pada gambar (File / Blob / HTMLCanvasElement / URL)
 * Menggunakan Tesseract.js yang dimuat on-demand via CDN
 */
export async function runOcrOnImageOrCanvas(
  imageSource: File | Blob | HTMLCanvasElement | string,
  onProgress?: (percent: number, status: string) => void
): Promise<string> {
  onProgress?.(30, 'Memuat modul OCR Tesseract...');

  const Tesseract = (await loadScript(
    'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
    'Tesseract'
  )) as any;

  if (!Tesseract || !Tesseract.createWorker) {
    throw new Error('Modul OCR tidak berhasil dimuat dari CDN.');
  }

  onProgress?.(45, 'Inisialisasi engine OCR (Bahasa Indonesia & Inggris)...');

  let worker: any = null;
  try {
    worker = await Tesseract.createWorker(['ind', 'eng'], 1, {
      logger: (m: any) => {
        if (m && m.status === 'recognizing text') {
          const p = Math.round((m.progress || 0) * 100);
          onProgress?.(50 + Math.floor(p * 0.4), `Membaca teks dari gambar (${p}%)...`);
        }
      },
    });

    onProgress?.(60, 'Mengekstrak karakter tulisan dari gambar...');
    const result = await worker.recognize(imageSource);
    await worker.terminate();
    worker = null;

    return result?.data?.text || '';
  } catch (err) {
    if (worker) {
      try {
        await worker.terminate();
      } catch {}
    }
    // Fallback cepat: coba dengan kamus 'eng' jika 'ind' gagal diunduh
    try {
      onProgress?.(65, 'Mencoba kembali pengenalan teks dasar...');
      const fallbackWorker = await Tesseract.createWorker('eng');
      const ret = await fallbackWorker.recognize(imageSource);
      await fallbackWorker.terminate();
      return ret?.data?.text || '';
    } catch (fbErr) {
      console.warn('OCR error:', fbErr);
      throw new Error('Gagal mengenali teks dari gambar.');
    }
  }
}

/**
 * Ekstraksi file PDF menggunakan pdfjs-dist
 * Mendukung teks digital maupun OCR canvas otomatis bila PDF berupa scan gambar
 */
async function parsePdfFile(
  file: File,
  onProgress?: (percent: number, status: string) => void
): Promise<{ text: string; isScanned: boolean }> {
  // Load pdfjs from CDN
  const pdfjsLib = (await loadScript(
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
    'pdfjsLib'
  )) as {
    GlobalWorkerOptions: { workerSrc: string };
    getDocument: (params: { data: Uint8Array }) => {
      promise: Promise<{
        numPages: number;
        getPage: (n: number) => Promise<{
          getViewport: (params: { scale: number }) => { width: number; height: number };
          render: (params: { canvasContext: CanvasRenderingContext2D | null; viewport: any }) => {
            promise: Promise<void>;
          };
          getTextContent: () => Promise<{ items: { str: string }[] }>;
        }>;
      }>;
    };
  };

  if (!pdfjsLib) throw new Error('PDF library tidak tersedia');

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;

  const totalPages = Math.min(pdf.numPages, 30); // Maksimal 30 halaman pertama
  let fullText = '';

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    fullText += `${pageText}\n\n`;
  }

  // Jika teks digital sangat sedikit (< 50 karakter), PDF adalah hasil scan/foto halaman!
  if (fullText.trim().length < 50 && typeof document !== 'undefined') {
    onProgress?.(45, 'PDF terdeteksi scan foto/gambar, menjalankan OCR halaman...');
    let ocrCombinedText = '';
    const pagesToOcr = Math.min(pdf.numPages, 3); // OCR hingga 3 halaman pertama
    for (let pNum = 1; pNum <= pagesToOcr; pNum++) {
      onProgress?.(
        45 + Math.floor((pNum / pagesToOcr) * 35),
        `Menjalankan OCR halaman ${pNum} dari ${pagesToOcr}...`
      );
      try {
        const page = await pdf.getPage(pNum);
        const viewport = page.getViewport({ scale: 1.6 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const pageOcr = await runOcrOnImageOrCanvas(canvas, onProgress);
          ocrCombinedText += `\n[Halaman ${pNum}]\n` + pageOcr + '\n';
        }
      } catch (err) {
        console.warn(`OCR gagal pada halaman PDF ${pNum}:`, err);
      }
    }

    if (ocrCombinedText.trim().length > 0) {
      return { text: ocrCombinedText, isScanned: true };
    }
    return { text: fullText, isScanned: true };
  }

  return { text: fullText, isScanned: false };
}

/**
 * Ekstraksi file Word DOCX menggunakan mammoth.js
 */
async function parseDocxFile(file: File): Promise<string> {
  const mammoth = (await loadScript(
    'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js',
    'mammoth'
  )) as {
    extractRawText: (params: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
  };

  if (!mammoth) throw new Error('DOCX library tidak tersedia');

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Ekstraksi file Excel / CSV menggunakan SheetJS (xlsx)
 */
async function parseExcelFile(
  file: File
): Promise<{ text: string; excelDetails: { sheets: string[]; summary: string } }> {
  const XLSX = (await loadScript(
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
    'XLSX'
  )) as {
    read: (
      data: ArrayBuffer,
      opts: { type: string }
    ) => {
      SheetNames: string[];
      Sheets: Record<string, unknown>;
    };
    utils: {
      sheet_to_json: (sheet: unknown, opts: { header: number }) => unknown[][];
    };
  };

  if (!XLSX) throw new Error('Excel library tidak tersedia');

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames || [];

  let fullText = `File Excel: ${file.name}\n`;
  fullText += `Terdiri dari ${sheetNames.length} sheet: ${sheetNames.join(', ')}\n\n`;

  const sheetSummaries: string[] = [];

  for (const name of sheetNames) {
    const sheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
    const rowCount = data.length;
    const headerRow = data[0] || [];
    const headers = headerRow
      .map((h) => String(h || '').trim())
      .filter((h) => h.length > 0)
      .slice(0, 8);

    const sheetDesc = `Sheet "${name}": ${rowCount} baris, kolom [${headers.join(', ')}]`;
    sheetSummaries.push(sheetDesc);
    fullText += `${sheetDesc}\n`;

    // Ambil sampel data teks untuk analisis kata kunci
    for (const row of data.slice(0, 15)) {
      const rowText = row
        .map((cell) => String(cell || ''))
        .filter((c) => c.length > 0)
        .join(' | ');
      fullText += `${rowText}\n`;
    }
    fullText += '\n';
  }

  return {
    text: fullText,
    excelDetails: {
      sheets: sheetNames,
      summary: sheetSummaries.join('; '),
    },
  };
}

/**
 * Fungsi utama ekstraksi dokumen dari File object
 */
export async function extractDocumentContent(
  file: File,
  onProgress?: (percent: number, status: string) => void
): Promise<ExtractionResult> {
  const filename = file.name;
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  onProgress?.(20, 'Membaca file dokumen...');

  let rawText = '';
  let isScannedPdf = false;
  let excelDetails: { sheets: string[]; summary: string } | undefined;

  try {
    if (ext === 'pdf') {
      onProgress?.(40, 'Mengekstrak teks halaman PDF...');
      const pdfRes = await parsePdfFile(file);
      rawText = pdfRes.text;
      isScannedPdf = pdfRes.isScanned;
    } else if (ext === 'docx') {
      onProgress?.(40, 'Mengekstrak teks dokumen Word...');
      rawText = await parseDocxFile(file);
    } else if (ext === 'doc') {
      // File .doc lama
      throw new Error(
        'Format .doc lama tidak mendukung ekstraksi otomatis di peramban. Silakan simpan ulang file sebagai .docx atau .pdf, lalu unggah kembali.'
      );
    } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
      onProgress?.(40, 'Mengekstrak tabel lembar kerja Excel/CSV...');
      const xlsxRes = await parseExcelFile(file);
      rawText = xlsxRes.text;
      excelDetails = xlsxRes.excelDetails;
    } else if (['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext)) {
      onProgress?.(35, 'Menjalankan OCR gambar soal tugas...');
      rawText = await runOcrOnImageOrCanvas(file, onProgress);
      isScannedPdf = false;
    } else if (['txt', 'md'].includes(ext)) {
      onProgress?.(40, 'Membaca berkas teks...');
      rawText = await file.text();
    } else {
      throw new Error(`Format file .${ext} belum didukung untuk ekstraksi teks.`);
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('Extraction fallback notice:', errorMsg);
    // Jika gagal membaca library (mis. offline tanpa cache library), fallback ke nama file
    rawText = '';
  }

  onProgress?.(75, 'Menganalisis judul, soal, dan ketentuan...');

  // Analisis heuristik
  const title = rawText ? extractTitleFromText(rawText, filename) : cleanFilenameToTitle(filename);
  let summary = '';
  if (excelDetails) {
    summary = `File spreadsheet berisi ${excelDetails.sheets.length} sheet: ${excelDetails.sheets.join(', ')}. ${excelDetails.summary}`;
  } else if (rawText) {
    summary = extractSummary(rawText);
  } else {
    summary = `Tugas pengerjaan berkas ${filename}.`;
  }

  const keyPoints = rawText ? extractKeyPoints(rawText) : ['Pelajari instruksi file soal yang dilampirkan.'];
  const requirements = rawText ? extractRequirements(rawText) : ['Kumpulkan tepat waktu sesuai instruksi dosen.'];
  const courseAndType = detectCourseAndType(rawText || filename);
  const suggestedDeadlines = rawText ? detectSuggestedDeadlines(rawText) : [];

  onProgress?.(100, 'Selesai mengekstrak data!');

  return {
    title,
    summary,
    keyPoints,
    requirements,
    questions: keyPoints,
    detectedCourse: courseAndType.course,
    detectedType: courseAndType.type,
    suggestedDeadlines,
    isScannedPdf,
    rawText,
    excelDetails,
  };
}
