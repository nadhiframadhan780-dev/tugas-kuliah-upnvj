import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createUtcTimestamp,
  formatFullIndonesianDateTime,
  formatLiveCountdown,
  getRelativeCalendarDay,
  getDeadlinePreview,
  getLocalDateAndTimeParts
} from './time';

test('createUtcTimestamp konversi YYYY-MM-DD dan HH:mm ke UTC epoch tepat tanpa dipengaruhi host', () => {
  // 2026-10-28 23:59 WIB (+07:00) -> UTC adalah 2026-10-28 16:59:00 UTC
  const ts = createUtcTimestamp('2026-10-28', '23:59', 'Asia/Jakarta');
  const d = new Date(ts);
  assert.equal(d.getUTCFullYear(), 2026);
  assert.equal(d.getUTCMonth(), 9); // October is month 9 (0-indexed)
  assert.equal(d.getUTCDate(), 28);
  assert.equal(d.getUTCHours(), 16);
  assert.equal(d.getUTCMinutes(), 59);
});

test('Ceklis penerimaan: 1 Januari 2027 tampil sebagai hari "Jumat"', () => {
  const ts = createUtcTimestamp('2027-01-01', '23:59', 'Asia/Jakarta');
  const formatted = formatFullIndonesianDateTime(ts, 'Asia/Jakarta');
  assert.match(formatted, /Jumat/);
  assert.match(formatted, /1 Januari 2027/);
  assert.match(formatted, /WIB/);
});

test('formatLiveCountdown menentukan status urgensi secara akurat', () => {
  const baseNow = 1761600000000; // arbitrary reference time

  // Lewat tenggat (terlambat)
  const overdue = formatLiveCountdown(baseNow - 2 * 3600 * 1000, baseNow);
  assert.equal(overdue.urgency, 'terlambat');
  assert.equal(overdue.isOverdue, true);
  assert.match(overdue.text, /Terlambat 2 jam/);

  // Kritis: 2 jam lagi (< 3 jam)
  const critical = formatLiveCountdown(baseNow + 2 * 3600 * 1000, baseNow);
  assert.equal(critical.urgency, 'kritis');
  assert.equal(critical.isOverdue, false);

  // Mendesak: 10 jam lagi (< 24 jam)
  const urgent = formatLiveCountdown(baseNow + 10 * 3600 * 1000, baseNow);
  assert.equal(urgent.urgency, 'mendesak');

  // Waspada: 2 hari lagi (<= 3 hari)
  const warning = formatLiveCountdown(baseNow + 48 * 3600 * 1000, baseNow);
  assert.equal(warning.urgency, 'waspada');

  // Aman: 5 hari lagi (> 3 hari)
  const safe = formatLiveCountdown(baseNow + 120 * 3600 * 1000, baseNow);
  assert.equal(safe.urgency, 'aman');
});

test('getRelativeCalendarDay menghitung Hari ini, Besok, Lusa berdasarkan tanggal kalender riil', () => {
  const nowUtc = createUtcTimestamp('2026-10-25', '12:00', 'Asia/Jakarta');

  const todayTs = createUtcTimestamp('2026-10-25', '23:59', 'Asia/Jakarta');
  assert.equal(getRelativeCalendarDay(todayTs, 'Asia/Jakarta', nowUtc), 'Hari ini');

  const tomorrowTs = createUtcTimestamp('2026-10-26', '23:59', 'Asia/Jakarta');
  assert.equal(getRelativeCalendarDay(tomorrowTs, 'Asia/Jakarta', nowUtc), 'Besok');

  const dayAfterTs = createUtcTimestamp('2026-10-27', '23:59', 'Asia/Jakarta');
  assert.equal(getRelativeCalendarDay(dayAfterTs, 'Asia/Jakarta', nowUtc), 'Lusa');
});

test('getDeadlinePreview menghasilkan teks pratinjau lengkap berbahasa Indonesia', () => {
  const nowUtc = createUtcTimestamp('2026-10-25', '10:00', 'Asia/Jakarta');
  const preview = getDeadlinePreview('2026-10-28', '23:59', 'Asia/Jakarta', nowUtc);
  
  assert.match(preview.formatted, /Rabu/);
  assert.match(preview.formatted, /28 Oktober 2026/);
  assert.match(preview.formatted, /23\.59 WIB/);
  assert.equal(preview.isPast, false);
});
