/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Utilitas Ekspor Kalender (.ics), Google Calendar Link, dan Bagikan ke WhatsApp
 */

import { Task } from '../types';
import { formatFullIndonesianDateTime } from './time';

/**
 * Format timestamp ke format iCal UTC (YYYYMMDDTHHMMSSZ)
 */
function formatIcsDate(utcMs: number): string {
  const d = new Date(utcMs);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Bersihkan string untuk format .ics
 */
function escapeIcsText(text: string): string {
  return (text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate string iCalendar (.ics) untuk satu atau banyak tugas
 */
export function generateIcsCalendar(tasks: Task[]): string {
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planner Akuntansi UPNVJ//NONSGML v1.0//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Tugas Akuntansi UPNVJ',
    'X-WR-TIMEZONE:Asia/Jakarta',
  ];

  for (const task of tasks) {
    if (!task.deadlineAt) continue;

    const startMs = task.deadlineAt - 3600 * 1000; // 1 jam sebelum tenggat
    const endMs = task.deadlineAt;
    const nowMs = Date.now();

    const summary = task.courseName ? `[${task.courseName}] ${task.title}` : task.title;
    const description = [
      task.summary,
      task.keyPoints?.length ? `Yang harus dikerjakan:\n${task.keyPoints.map((p) => `- ${p}`).join('\n')}` : '',
      task.links?.length ? `Link: ${task.links.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:task-${task.id}@planner-akuntansi-upnvj`);
    ics.push(`DTSTAMP:${formatIcsDate(nowMs)}`);
    ics.push(`DTSTART:${formatIcsDate(startMs)}`);
    ics.push(`DTEND:${formatIcsDate(endMs)}`);
    ics.push(`SUMMARY:${escapeIcsText(summary)}`);
    ics.push(`DESCRIPTION:${escapeIcsText(description)}`);
    ics.push(`STATUS:${task.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`);
    ics.push('END:VEVENT');
  }

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

/**
 * Unduh file .ics langsung di browser
 */
export function downloadIcsFile(tasks: Task[], filename: string = 'tugas-akuntansi-upnvj.ics') {
  const icsData = generateIcsCalendar(tasks);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate URL "Tambah ke Google Calendar" untuk sebuah tugas
 */
export function getGoogleCalendarUrl(task: Task): string {
  if (!task.deadlineAt) return '';

  const startIso = formatIcsDate(task.deadlineAt - 3600 * 1000);
  const endIso = formatIcsDate(task.deadlineAt);

  const title = encodeURIComponent(task.courseName ? `[${task.courseName}] ${task.title}` : task.title);
  const details = encodeURIComponent(
    `${task.summary}\n\nTenggat Tugas Mahasiswa S1 Akuntansi UPNVJ.\nCatatan: ${task.notes || '-'}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}`;
}

/**
 * Format pesan teks rapi untuk dibagikan ke WhatsApp / Web Share
 */
export function formatTaskShareMessage(task: Task, tz: string = 'Asia/Jakarta'): string {
  const deadlineFormatted = formatFullIndonesianDateTime(task.deadlineAt, tz);
  const course = task.courseName || 'Mata Kuliah Akuntansi';

  return `📌 *TUGAS AKUNTANSI UPNVJ*
📚 Mata Kuliah: ${course}
📝 Judul: ${task.title}
⏰ Tenggat: ${deadlineFormatted}
🏷️ Jenis: ${task.type} | Prioritas: ${task.priority.toUpperCase()}

${task.summary ? `💡 Ringkasan: ${task.summary}\n` : ''}${
    task.keyPoints?.length
      ? `📋 Yang dikerjakan:\n${task.keyPoints.slice(0, 3).map((p) => `• ${p}`).join('\n')}\n`
      : ''
  }Semangat mengerjakan teman-teman S1 Akuntansi UPNVJ! 🚀`;
}

/**
 * Bagikan tugas ke WhatsApp atau Web Share API
 */
export function shareTaskViaWhatsAppOrWebShare(task: Task, tz: string = 'Asia/Jakarta'): void {
  const text = formatTaskShareMessage(task, tz);

  if (navigator.share) {
    navigator
      .share({
        title: task.title,
        text: text,
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          // Fallback to WhatsApp Web URL
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
        }
      });
  } else {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }
}
