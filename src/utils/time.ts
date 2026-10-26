/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modul Waktu Realtime & Ketepatan Hari/Tanggal Planner Akuntansi UPNVJ
 * Menghitung waktu secara deterministik berdasarkan zona waktu Indonesia (WIB/WITA/WIT).
 */

import { DeadlineUrgency } from '../types';

export const TIMEZONE_OFFSETS: Record<string, { offsetHours: number; abbr: string; isoOffset: string }> = {
  'Asia/Jakarta': { offsetHours: 7, abbr: 'WIB', isoOffset: '+07:00' },
  'Asia/Makassar': { offsetHours: 8, abbr: 'WITA', isoOffset: '+08:00' },
  'Asia/Jayapura': { offsetHours: 9, abbr: 'WIT', isoOffset: '+09:00' },
};

/**
 * Mendapatkan singkatan zona waktu (WIB, WITA, WIT)
 */
export function getTimezoneAbbreviation(tz: string = 'Asia/Jakarta'): string {
  return TIMEZONE_OFFSETS[tz]?.abbr || 'WIB';
}

/**
 * Mendapatkan offset ISO string (mis. +07:00)
 */
export function getTimezoneIsoOffset(tz: string = 'Asia/Jakarta'): string {
  return TIMEZONE_OFFSETS[tz]?.isoOffset || '+07:00';
}

/**
 * Mengubah input tanggal lokal (YYYY-MM-DD) dan jam (HH:mm) pada zona waktu terpilih
 * menjadi Timestamp UTC (epoch ms). Ini menjamin nilai UTC tidak bergeser walau zona
 * waktu sistem komputer pengguna berbeda.
 */
export function createUtcTimestamp(
  dateStr: string,
  timeStr: string = '23:59',
  tz: string = 'Asia/Jakarta'
): number {
  if (!dateStr) return 0;
  const normalizedTime = timeStr.trim().length === 5 ? `${timeStr.trim()}:00` : timeStr.trim();
  const offset = getTimezoneIsoOffset(tz);
  const isoString = `${dateStr}T${normalizedTime}${offset}`;
  const parsed = Date.parse(isoString);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Mendapatkan tanggal YYYY-MM-DD dan HH:mm dari timestamp UTC pada zona waktu tertentu
 */
export function getLocalDateAndTimeParts(
  utcTimestamp: number,
  tz: string = 'Asia/Jakarta'
): { dateStr: string; timeStr: string } {
  if (!utcTimestamp) return { dateStr: '', timeStr: '23:59' };
  const d = new Date(utcTimestamp);
  
  // Format parts via Intl
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  let year = '';
  let month = '';
  let day = '';
  let hour = '00';
  let minute = '00';

  for (const part of parts) {
    if (part.type === 'year') year = part.value;
    if (part.type === 'month') month = part.value;
    if (part.type === 'day') day = part.value;
    if (part.type === 'hour') hour = part.value;
    if (part.type === 'minute') minute = part.value;
  }

  return {
    dateStr: `${year}-${month}-${day}`,
    timeStr: `${hour}:${minute}`,
  };
}

/**
 * Format tanggal dan jam lengkap berbahasa Indonesia dengan nama hari otomatis dihitung:
 * Misal: "Rabu, 28 Oktober 2026, 23.59 WIB"
 */
export function formatFullIndonesianDateTime(
  utcTimestamp: number,
  tz: string = 'Asia/Jakarta',
  includeSeconds: boolean = false
): string {
  if (!utcTimestamp) return '-';
  const d = new Date(utcTimestamp);
  const abbr = getTimezoneAbbreviation(tz);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  if (includeSeconds) {
    options.second = '2-digit';
  }

  const formatted = new Intl.DateTimeFormat('id-ID', options).format(d);
  // Ubah tanda titik dua jam menjadi titik sesuai konvensi bahasa Indonesia atau pertahankan titik
  return `${formatted.replace(':', '.')} ${abbr}`;
}

/**
 * Format jam realtime untuk Header:
 * "Minggu, 25 Oktober 2026, 14.05.32 WIB"
 */
export function formatRealtimeHeaderClock(
  dateObj: Date = new Date(),
  tz: string = 'Asia/Jakarta'
): string {
  const abbr = getTimezoneAbbreviation(tz);
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return `${formatter.format(dateObj).replace(/:/g, '.')} ${abbr}`;
}

/**
 * Menghitung hitung mundur (countdown) realtime dan menentukan tingkat urgensi
 */
export function formatLiveCountdown(
  deadlineUtc: number,
  nowUtc: number = Date.now()
): { text: string; urgency: DeadlineUrgency; diffMs: number; isOverdue: boolean } {
  if (!deadlineUtc) {
    return { text: 'Tanpa tenggat', urgency: 'aman', diffMs: 0, isOverdue: false };
  }

  const diffMs = deadlineUtc - nowUtc;

  // Lewat tenggat (Terlambat)
  if (diffMs < 0) {
    const overdueMs = Math.abs(diffMs);
    const hours = Math.floor(overdueMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    let text = 'Terlambat';
    if (days >= 1) {
      const remainingHours = hours % 24;
      text = remainingHours > 0 ? `Terlambat ${days} hari ${remainingHours} jam` : `Terlambat ${days} hari`;
    } else if (hours >= 1) {
      const mins = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));
      text = mins > 0 ? `Terlambat ${hours} jam ${mins} mnt` : `Terlambat ${hours} jam`;
    } else {
      const mins = Math.max(1, Math.floor(overdueMs / (1000 * 60)));
      text = `Terlambat ${mins} menit`;
    }

    return { text, urgency: 'terlambat', diffMs, isOverdue: true };
  }

  // Masih ada waktu
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  const hoursRemaining = totalHours % 24;
  const minutesRemaining = totalMinutes % 60;
  const secondsRemaining = totalSeconds % 60;

  // < 3 jam = Kritis (merah berdenyut)
  if (totalHours < 3) {
    let text = '';
    if (totalHours >= 1) {
      text = `${totalHours} jam ${minutesRemaining} mnt lagi`;
    } else if (totalMinutes >= 1) {
      text = `${totalMinutes} mnt ${secondsRemaining} dtk lagi`;
    } else {
      text = `${secondsRemaining} detik lagi`;
    }
    return { text, urgency: 'kritis', diffMs, isOverdue: false };
  }

  // < 24 jam = Mendesak (oranye)
  if (totalHours < 24) {
    const text = minutesRemaining > 0 ? `${totalHours} jam ${minutesRemaining} mnt lagi` : `${totalHours} jam lagi`;
    return { text, urgency: 'mendesak', diffMs, isOverdue: false };
  }

  // <= 3 hari (72 jam) = Waspada (amber)
  if (days <= 3) {
    const text = hoursRemaining > 0 ? `${days} hari ${hoursRemaining} jam lagi` : `${days} hari lagi`;
    return { text, urgency: 'waspada', diffMs, isOverdue: false };
  }

  // > 3 hari = Aman (hijau)
  const text = hoursRemaining > 0 ? `${days} hari ${hoursRemaining} jam lagi` : `${days} hari lagi`;
  return { text, urgency: 'aman', diffMs, isOverdue: false };
}

/**
 * Menghitung label kalender relatif (Hari ini, Besok, Lusa, Kemarin)
 * berdasarkan tanggal kalender riil di zona waktu tertentu, bukan sekadar kelipatan 24 jam.
 */
export function getRelativeCalendarDay(
  targetTimestamp: number,
  tz: string = 'Asia/Jakarta',
  nowUtc: number = Date.now()
): string {
  const targetParts = getLocalDateAndTimeParts(targetTimestamp, tz);
  const nowParts = getLocalDateAndTimeParts(nowUtc, tz);

  const targetDateOnly = new Date(`${targetParts.dateStr}T00:00:00Z`).getTime();
  const nowDateOnly = new Date(`${nowParts.dateStr}T00:00:00Z`).getTime();

  const diffDays = Math.round((targetDateOnly - nowDateOnly) / (24 * 3600 * 1000));

  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Besok';
  if (diffDays === 2) return 'Lusa';
  if (diffDays === -1) return 'Kemarin';
  if (diffDays > 2 && diffDays <= 7) return `${diffDays} hari lagi`;
  if (diffDays < -1) return `${Math.abs(diffDays)} hari lalu`;

  // Tampilkan nama hari jika lebih jauh
  const d = new Date(targetTimestamp);
  return new Intl.DateTimeFormat('id-ID', { timeZone: tz, weekday: 'long' }).format(d);
}

/**
 * Menghasilkan pratinjau teks tenggat yang akurat saat pengguna menginput tanggal & jam:
 * Contoh: "Rabu, 28 Oktober 2026, pukul 23.59 WIB (3 hari 9 jam lagi)"
 */
export function getDeadlinePreview(
  dateStr: string,
  timeStr: string = '23:59',
  tz: string = 'Asia/Jakarta',
  nowUtc: number = Date.now()
): { formatted: string; isPast: boolean; countdownText: string; urgency: DeadlineUrgency; utcTimestamp: number } {
  if (!dateStr) {
    return {
      formatted: 'Pilih tanggal dan jam tenggat',
      isPast: false,
      countdownText: '',
      urgency: 'aman',
      utcTimestamp: 0,
    };
  }

  const utcTimestamp = createUtcTimestamp(dateStr, timeStr, tz);
  const d = new Date(utcTimestamp);
  const abbr = getTimezoneAbbreviation(tz);

  const dayAndDate = new Intl.DateTimeFormat('id-ID', {
    timeZone: tz,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);

  const timeFormatted = timeStr.replace(':', '.');
  const countdown = formatLiveCountdown(utcTimestamp, nowUtc);

  const formatted = `${dayAndDate}, pukul ${timeFormatted} ${abbr} (${countdown.text})`;

  return {
    formatted,
    isPast: countdown.isOverdue,
    countdownText: countdown.text,
    urgency: countdown.urgency,
    utcTimestamp,
  };
}

/**
 * Menghitung tanggal cepat untuk chip pintasan (Hari ini, Besok, Lusa, +3 hari, Minggu depan)
 */
export function getQuickChipDate(
  chip: 'hari_ini' | 'besok' | 'lusa' | 'tiga_hari' | 'minggu_depan',
  tz: string = 'Asia/Jakarta',
  nowUtc: number = Date.now()
): { dateStr: string; timeStr: string } {
  const current = getLocalDateAndTimeParts(nowUtc, tz);
  const baseDate = new Date(`${current.dateStr}T00:00:00Z`);

  let daysToAdd = 0;
  if (chip === 'hari_ini') daysToAdd = 0;
  else if (chip === 'besok') daysToAdd = 1;
  else if (chip === 'lusa') daysToAdd = 2;
  else if (chip === 'tiga_hari') daysToAdd = 3;
  else if (chip === 'minggu_depan') daysToAdd = 7;

  const targetDate = new Date(baseDate.getTime() + daysToAdd * 24 * 3600 * 1000);
  const yyyy = targetDate.getUTCFullYear();
  const mm = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getUTCDate()).padStart(2, '0');

  return {
    dateStr: `${yyyy}-${mm}-${dd}`,
    timeStr: '23:59',
  };
}
