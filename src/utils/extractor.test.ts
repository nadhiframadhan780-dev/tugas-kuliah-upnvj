import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanFilenameToTitle,
  extractTitleFromText,
  extractKeyPoints,
  detectCourseAndType,
  detectSuggestedDeadlines,
  getSubtaskTemplateForType
} from './extractor';

test('cleanFilenameToTitle merapikan nama file acak menjadi judul yang bersih', () => {
  const result1 = cleanFilenameToTitle('tugas_akuntansi_biaya_final_rev2.docx');
  assert.equal(result1, 'Akuntansi Biaya');

  const result2 = cleanFilenameToTitle('Soal_Auditing_Kasus_1.pdf');
  assert.equal(result2, 'Auditing Kasus 1');
});

test('extractTitleFromText mengabaikan kop institusi UPNVJ dan mendeteksi judul tugas', () => {
  const sampleDocText = `
UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" JAKARTA
FAKULTAS EKONOMI DAN BISNIS
PROGRAM STUDI S1 AKUNTANSI
Nama: Budi Santoso
NIM: 2210115001
Mata Kuliah: Akuntansi Keuangan Menengah 1

Tugas 2: Rekonsiliasi Bank dan Pencatatan Jurnal Penyesuaian
Petunjuk Pengerjaan:
Kerjakan soal berikut pada kertas kerja.
  `;

  const title = extractTitleFromText(sampleDocText, 'tugas2.pdf');
  assert.equal(title, 'Tugas 2: Rekonsiliasi Bank dan Pencatatan Jurnal Penyesuaian');
});

test('extractKeyPoints mengekstrak butir-butir soal bernomor', () => {
  const sampleDocText = `
Instruksi Soal:
1. Buatlah jurnal penyesuaian atas beban penyusutan aktiva tetap.
2. Susunlah neraca saldo setelah penyesuaian per 31 Desember.
3. Hitunglah laba bersih komprehensif tahun berjalan.
  `;

  const points = extractKeyPoints(sampleDocText);
  assert.equal(points.length, 3);
  assert.match(points[0], /Buatlah jurnal penyesuaian/);
  assert.match(points[1], /Susunlah neraca saldo/);
  assert.match(points[2], /Hitunglah laba bersih/);
});

test('detectCourseAndType mendeteksi mata kuliah akuntansi dan jenis tugas', () => {
  const text1 = 'Tugas kelompok analisis laporan keuangan PT Indofood Tbk mata kuliah Akuntansi Manajemen';
  const res1 = detectCourseAndType(text1);
  assert.equal(res1.course, 'Akuntansi Manajemen');
  assert.equal(res1.type, 'Kelompok');

  const text2 = 'Praktikum pemeriksaan bukti transaksi dan opini audit independen';
  const res2 = detectCourseAndType(text2);
  assert.equal(res2.course, 'Auditing');
  assert.equal(res2.type, 'Praktikum');
});

test('detectSuggestedDeadlines mendeteksi tanggal pengumpulan untuk chip saran', () => {
  const text = 'Tugas ini wajib dikumpulkan paling lambat tanggal 28 Oktober 2026 pukul 23.59 melalui LMS.';
  const suggestions = detectSuggestedDeadlines(text);
  assert.ok(suggestions.includes('28 Oktober 2026'));
});

test('getSubtaskTemplateForType menyediakan checklist sesuai jenis tugas', () => {
  const subtasks = getSubtaskTemplateForType('Laporan/Makalah');
  assert.ok(subtasks.length >= 5);
  assert.ok(subtasks.some((s) => s.title.includes('BAB I Pendahuluan')));
  assert.ok(subtasks.some((s) => s.title.includes('Daftar Pustaka')));
});
