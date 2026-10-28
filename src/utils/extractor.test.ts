import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanFilenameToTitle,
  extractTitleFromText,
  extractKeyPoints,
  extractSummary,
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

  const text3 = 'Tugas Individu Esai Nilai-Nilai Bela Negara di Lingkungan Kampus UPNVJ';
  const res3 = detectCourseAndType(text3);
  assert.equal(res3.course, 'Pendidikan Bela Negara');
  assert.equal(res3.type, 'Individu');

  const text4 = 'Praktikum pengantar akuntansi jurnal penyesuaian worksheet';
  const res4 = detectCourseAndType(text4);
  assert.equal(res4.course, 'Praktikum Pengantar Akuntansi');
  assert.equal(res4.type, 'Praktikum');
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

test('extractSummary mempertahankan seluruh uraian soal berkas tanpa dipotong 2-4 kalimat', () => {
  const sampleFullAssignment = `
UNIVERSITAS PEMBANGUNAN NASIONAL "VETERAN" JAKARTA
FAKULTAS EKONOMI DAN BISNIS
PROGRAM STUDI S1 AKUNTANSI

Soal Kasus Rekonsiliasi Bank PT Veteran Jaya:
Pada tanggal 31 Oktober 2026, saldo rekening kas menurut buku PT Veteran Jaya adalah Rp 45.200.000.
Sedangkan saldo menurut rekening koran dari Bank Mandiri menunjukkan angka Rp 54.800.000.
Setelah dilakukan pemeriksaan, ditemukan beberapa hal berikut:
1. Setoran dalam perjalanan (deposit in transit) tanggal 31 Oktober sebesar Rp 8.500.000 belum tercatat di bank.
2. Cek yang masih beredar (outstanding checks) berjumlah Rp 12.300.000 dengan rincian cek nomor 401 dan 405.
3. Bank telah menagih wesel tagih senilai Rp 6.000.000 ditambah bunga Rp 200.000 dengan biaya penagihan Rp 50.000.
4. Cek dari pelanggan PT Maju sebesar Rp 2.500.000 dikembalikan bank karena tidak ada dananya (NSF check).
5. Biaya administrasi bank untuk bulan Oktober sebesar Rp 75.000 belum dicatat perusahaan.
6. Perusahaan salah mencatat pembayaran utang yang seharusnya Rp 1.820.000 dicatat Rp 1.280.000.

Diminta:
a. Buatlah laporan rekonsiliasi saldo bank dan saldo buku untuk menunjukkan saldo kas yang benar.
b. Buatlah seluruh ayat jurnal penyesuaian yang diperlukan per 31 Oktober 2026.
  `;

  const summary = extractSummary(sampleFullAssignment);
  // Verifikasi bahwa seluruh poin 1 sampai 6 dan instruksi a-b tetap utuh
  assert.ok(summary.includes('Soal Kasus Rekonsiliasi Bank PT Veteran Jaya:'));
  assert.ok(summary.includes('1. Setoran dalam perjalanan'));
  assert.ok(summary.includes('6. Perusahaan salah mencatat'));
  assert.ok(summary.includes('a. Buatlah laporan rekonsiliasi'));
  assert.ok(summary.includes('b. Buatlah seluruh ayat jurnal penyesuaian'));
  // Kop UPNVJ harus disaring
  assert.ok(!summary.includes('PROGRAM STUDI S1 AKUNTANSI'));
});

