import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OFFICIAL_UPNVJ_ACADEMIC_EVENTS,
  UPNVJ_DECREE_INFO,
  isDateInEventRange,
  getUpnvjEventsForDate,
  getCurrentAcademicSemester,
  getSemesterTimelineSteps,
} from '../data/upnvjAcademicCalendar';

test('UPNVJ_DECREE_INFO memuat data SK Rektor resmi nomor 919/UN61/HK.03.01/2026', () => {
  assert.equal(UPNVJ_DECREE_INFO.decreeNumber, '919/UN61/HK.03.01/2026');
  assert.equal(UPNVJ_DECREE_INFO.academicYear, '2026/2027');
  assert.ok(UPNVJ_DECREE_INFO.pdfPath.includes('document_b73f2e2a.pdf'));
});

test('OFFICIAL_UPNVJ_ACADEMIC_EVENTS memuat seluruh agenda akademik semester ganjil dan genap', () => {
  assert.ok(OFFICIAL_UPNVJ_ACADEMIC_EVENTS.length >= 40);

  // Cek agenda penting Semester Ganjil 2026/2027
  const uktGanjil = OFFICIAL_UPNVJ_ACADEMIC_EVENTS.find((e) => e.id === 'upnvj-ganjil-ukt');
  assert.ok(uktGanjil);
  assert.equal(uktGanjil?.date, '2026-08-02');
  assert.ok(uktGanjil?.explanation.length > 20);
  assert.ok(uktGanjil?.actionAdvice.length > 20);

  const utsGanjil = OFFICIAL_UPNVJ_ACADEMIC_EVENTS.find((e) => e.id === 'upnvj-ganjil-uts');
  assert.ok(utsGanjil);
  assert.equal(utsGanjil?.date, '2026-10-05');
  assert.equal(utsGanjil?.endDate, '2026-10-09');

  const uasGanjil = OFFICIAL_UPNVJ_ACADEMIC_EVENTS.find((e) => e.id === 'upnvj-ganjil-uas');
  assert.ok(uasGanjil);
  assert.equal(uasGanjil?.date, '2026-12-07');
  assert.equal(uasGanjil?.endDate, '2026-12-18');

  const mingguTenangGanjil = OFFICIAL_UPNVJ_ACADEMIC_EVENTS.find((e) => e.id === 'upnvj-ganjil-minggu-tenang');
  assert.ok(mingguTenangGanjil);
  assert.equal(mingguTenangGanjil?.date, '2026-11-30');
  assert.equal(mingguTenangGanjil?.endDate, '2026-12-04');

  // Cek agenda penting Semester Genap 2026/2027
  const uktGenap = OFFICIAL_UPNVJ_ACADEMIC_EVENTS.find((e) => e.id === 'upnvj-genap-ukt');
  assert.ok(uktGenap);
  assert.equal(uktGenap?.date, '2027-01-24');

  const utsGenap = OFFICIAL_UPNVJ_ACADEMIC_EVENTS.find((e) => e.id === 'upnvj-genap-uts');
  assert.ok(utsGenap);
  assert.equal(utsGenap?.date, '2027-04-12');
  assert.equal(utsGenap?.endDate, '2027-04-16');

  const uasGenap = OFFICIAL_UPNVJ_ACADEMIC_EVENTS.find((e) => e.id === 'upnvj-genap-uas');
  assert.ok(uasGenap);
  assert.equal(uasGenap?.date, '2027-06-14');
  assert.equal(uasGenap?.endDate, '2027-06-25');
});

test('isDateInEventRange dan getUpnvjEventsForDate mendeteksi agenda single date dan multi-day range', () => {
  // Tanggal dalam rentang UTS Ganjil (5-9 Okt 2026)
  const eventsOn7Oct = getUpnvjEventsForDate('2026-10-07');
  assert.ok(eventsOn7Oct.some((e) => e.id === 'upnvj-ganjil-uts'));

  // Tanggal single: HUT RI ke-81 (17 Agustus 2026)
  const eventsOn17Aug = getUpnvjEventsForDate('2026-08-17');
  assert.ok(eventsOn17Aug.some((e) => e.id === 'upnvj-ganjil-hut-ri'));
});

test('getCurrentAcademicSemester menentukan semester ganjil / genap dengan benar', () => {
  // Oktober 2026 -> Ganjil
  const semOkt2026 = getCurrentAcademicSemester(new Date(2026, 9, 15));
  assert.equal(semOkt2026, 'ganjil');

  // April 2027 -> Genap
  const semApr2027 = getCurrentAcademicSemester(new Date(2027, 3, 15));
  assert.equal(semApr2027, 'genap');
});

test('getSemesterTimelineSteps menghasilkan 8 tahapan alur semester dengan penjelasan & tips', () => {
  const stepsGanjil = getSemesterTimelineSteps('ganjil', '2026-10-06');
  assert.equal(stepsGanjil.length, 8);
  assert.equal(stepsGanjil[0].title, 'Pembayaran UKT & Registrasi');
  assert.equal(stepsGanjil[0].status, 'passed'); // 2 Agustus sudah lewat pada 6 Oktober
  assert.equal(stepsGanjil[3].title, 'Ujian Tengah Semester (UTS)');
  assert.equal(stepsGanjil[3].status, 'current'); // 6 Oktober adalah masa UTS

  const stepsGenap = getSemesterTimelineSteps('genap', '2027-01-10');
  assert.equal(stepsGenap.length, 8);
  assert.equal(stepsGenap[1].title, 'Pengisian KRS Online Genap');
  assert.ok(stepsGenap[1].tips.length > 10);
});
