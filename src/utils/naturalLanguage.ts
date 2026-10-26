/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Parser Bahasa Alami (Natural Language Quick Add) untuk Tugas Akuntansi
 * Contoh: "Laporan Auditing besok 23.59", "Kuis Perpajakan lusa 14.00", "Tugas SIA Jumat depan 17.00"
 */

import { TaskType } from '../types';
import { detectCourseAndType } from './extractor';
import { getLocalDateAndTimeParts, getQuickChipDate } from './time';

export interface ParsedQuickTask {
  rawInput: string;
  title: string;
  courseName?: string;
  type: TaskType;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
}

export function parseNaturalLanguageTask(
  input: string,
  tz: string = 'Asia/Jakarta',
  nowUtc: number = Date.now()
): ParsedQuickTask {
  const trimmed = input.trim();
  if (!trimmed) {
    const today = getQuickChipDate('hari_ini', tz, nowUtc);
    return {
      rawInput: input,
      title: 'Tugas Baru',
      type: 'Individu',
      dateStr: today.dateStr,
      timeStr: '23:59',
    };
  }

  let textWorking = trimmed;
  let detectedDateStr = '';
  let detectedTimeStr = '23:59';

  // 1. Ekstrak Jam (mis. 23.59, 23:59, 14.30, pukul 10.00, jam 8 malam)
  const timeRegex = /(?:pukul|jam)?\s*([0-1]?[0-9]|2[0-3])[:.]([0-5][0-9])/i;
  const timeMatch = textWorking.match(timeRegex);
  if (timeMatch) {
    const hour = String(timeMatch[1]).padStart(2, '0');
    const minute = String(timeMatch[2]).padStart(2, '0');
    detectedTimeStr = `${hour}:${minute}`;
    textWorking = textWorking.replace(timeMatch[0], ' ');
  }

  // 2. Ekstrak Relatif Hari (hari ini, besok, lusa, minggu depan, 3 hari lagi)
  const lower = textWorking.toLowerCase();
  if (lower.includes('hari ini')) {
    detectedDateStr = getQuickChipDate('hari_ini', tz, nowUtc).dateStr;
    textWorking = textWorking.replace(/hari\s+ini/gi, ' ');
  } else if (lower.includes('besok')) {
    detectedDateStr = getQuickChipDate('besok', tz, nowUtc).dateStr;
    textWorking = textWorking.replace(/besok/gi, ' ');
  } else if (lower.includes('lusa')) {
    detectedDateStr = getQuickChipDate('lusa', tz, nowUtc).dateStr;
    textWorking = textWorking.replace(/lusa/gi, ' ');
  } else if (lower.includes('minggu depan')) {
    detectedDateStr = getQuickChipDate('minggu_depan', tz, nowUtc).dateStr;
    textWorking = textWorking.replace(/minggu\s+depan/gi, ' ');
  } else if (lower.includes('3 hari lagi') || lower.includes('+3 hari')) {
    detectedDateStr = getQuickChipDate('tiga_hari', tz, nowUtc).dateStr;
    textWorking = textWorking.replace(/(?:3\s+hari\s+lagi|\+3\s+hari)/gi, ' ');
  }

  // Jika belum terdeteksi hari relatif, cari nama hari tertentu (Senin, Selasa, dll)
  if (!detectedDateStr) {
    const dayNames = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    for (let i = 0; i < dayNames.length; i++) {
      const dayName = dayNames[i];
      if (lower.includes(dayName)) {
        // Cari hari berikutnya yang sesuai
        const curParts = getLocalDateAndTimeParts(nowUtc, tz);
        const curDate = new Date(`${curParts.dateStr}T00:00:00Z`);
        const curDayIndex = curDate.getUTCDay(); // 0 is Sunday, 1 is Monday ...
        let diffDays = (i - curDayIndex + 7) % 7;
        if (diffDays === 0) diffDays = 7; // Hari ini di minggu depan jika disebut nama harinya

        const target = new Date(curDate.getTime() + diffDays * 24 * 3600 * 1000);
        const yyyy = target.getUTCFullYear();
        const mm = String(target.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(target.getUTCDate()).padStart(2, '0');
        detectedDateStr = `${yyyy}-${mm}-${dd}`;
        textWorking = textWorking.replace(new RegExp(dayName, 'gi'), ' ');
        break;
      }
    }
  }

  // Jika tetap tidak ada indikasi tanggal, default ke besok
  if (!detectedDateStr) {
    detectedDateStr = getQuickChipDate('besok', tz, nowUtc).dateStr;
  }

  // 3. Deteksi Mata Kuliah dan Jenis Tugas
  const { course, type } = detectCourseAndType(trimmed);

  // 4. Bersihkan Judul Tugas
  let cleanedTitle = textWorking
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[-–:,.]+/, '')
    .trim();

  if (cleanedTitle.length < 3) {
    cleanedTitle = `${type} ${course || 'Akuntansi'}`;
  }

  // Format kapitalisasi rapi
  cleanedTitle = cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1);

  return {
    rawInput: input,
    title: cleanedTitle,
    courseName: course,
    type,
    dateStr: detectedDateStr,
    timeStr: detectedTimeStr,
  };
}
