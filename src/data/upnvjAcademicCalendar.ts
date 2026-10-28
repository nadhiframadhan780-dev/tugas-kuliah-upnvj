/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Kalender Akademik Resmi UPN "Veteran" Jakarta TA 2026/2027 (Kampus Bela Negara)
 * Berdasarkan Keputusan Rektor UPN "Veteran" Jakarta Nomor: 919/UN61/HK.03.01/2026, Tanggal 2 Februari 2026
 * Dilengkapi Penjelasan Mudah Dipahami & Panduan Persiapan Praktis Mahasiswa S1 Akuntansi UPNVJ
 */

import { CalendarEvent } from '../types';

export interface UpnvjAcademicEvent extends CalendarEvent {
  category: 'krs' | 'kuliah' | 'ujian' | 'minggu_tenang' | 'libur' | 'wisuda_yudisium' | 'kegiatan_kampus' | 'lainnya';
  semester: 'ganjil' | 'genap';
  explanation: string;
  actionAdvice: string;
  badgeColor: string;
  isOfficialUpnvj: boolean;
}

export const UPNVJ_DECREE_INFO = {
  decreeNumber: '919/UN61/HK.03.01/2026',
  decreeDate: '2 Februari 2026',
  rectorName: 'Prof. Dr. Anter Venus, MA, Comm',
  academicYear: '2026/2027',
  campusIdentity: 'Kampus Bela Negara UPNVJ',
  pdfPath: '/assets/aistudio/document_b73f2e2a.pdf',
};

export const OFFICIAL_UPNVJ_ACADEMIC_EVENTS: UpnvjAcademicEvent[] = [
  // =========================================================================
  // SEMESTER GANJIL 2026/2027
  // =========================================================================
  {
    id: 'upnvj-ganjil-ukt',
    title: 'Batas Akhir Pembayaran UKT Semester Ganjil 2026/2027',
    type: 'krs',
    category: 'krs',
    semester: 'ganjil',
    date: '2026-08-02',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Virtual Account Bank Mitra UPNVJ (BNI, Mandiri, BTN, BSI)',
    badgeColor: '#0284C7', // Biru
    isOfficialUpnvj: true,
    explanation:
      'Batas akhir transfer Uang Kuliah Tunggal (UKT). Pembayaran UKT adalah syarat mutlak agar akun SIAKAD Anda berstatus aktif dan dapat mengisi KRS mata kuliah.',
    actionAdvice:
      'Segera lunasi sebelum pukul 23.59 WIB melalui ATM/Mobile Banking. Simpan bukti transfer dalam format PDF/screenshot untuk arsip pribadi.',
  },
  {
    id: 'upnvj-ganjil-cuti',
    title: 'Batas Akhir Pengajuan Cuti Akademik Semester Ganjil',
    type: 'krs',
    category: 'krs',
    semester: 'ganjil',
    date: '2026-08-03',
    startTime: '08:00',
    endTime: '16:00',
    location: 'Bagian Akademik FEB UPNVJ / SIAKAD',
    badgeColor: '#64748B', // Slate
    isOfficialUpnvj: true,
    explanation:
      'Kesempatan resmi bagi mahasiswa yang ingin istirahat kuliah selama satu semester (karena alasan kesehatan, pekerjaan, atau urusan keluarga). Mahasiswa cuti tidak dihitung dalam batas maksimal masa studi.',
    actionAdvice:
      'Ajukan surat permohonan yang disetujui Dosen Pembimbing Akademik (PA) dan Dekanat FEB sebelum tanggal ini.',
  },
  {
    id: 'upnvj-ganjil-sk-berhenti',
    title: 'Batas Akhir SK Pemberhentian Mahasiswa / Pengunduran Diri',
    type: 'lainnya',
    category: 'lainnya',
    semester: 'ganjil',
    date: '2026-08-08',
    startTime: '08:00',
    endTime: '16:00',
    location: 'Biro Akademik Pusat UPNVJ',
    badgeColor: '#64748B',
    isOfficialUpnvj: true,
    explanation:
      'Batas akhir administratif penerbitan Surat Keputusan pemberhentian atau persetujuan pengunduran diri bagi mahasiswa yang pindah universitas.',
    actionAdvice:
      'Pastikan seluruh tanggungan administrasi, peminjaman buku perpustakaan, dan keuangan sudah selesai.',
  },
  {
    id: 'upnvj-ganjil-krs',
    title: 'Pengisian Kartu Rencana Studi (KRS) Online Semester Ganjil',
    type: 'krs',
    category: 'krs',
    semester: 'ganjil',
    date: '2026-08-03',
    endDate: '2026-08-14',
    startTime: '08:00',
    endTime: '23:59',
    location: 'SIAKAD UPNVJ (siakad.upnvj.ac.id)',
    badgeColor: '#0284C7',
    isOfficialUpnvj: true,
    explanation:
      'Periode penting mahasiswa memilih kelas, dosen, dan paket mata kuliah semester ganjil (20 SKS sesuai jadwal kelas S1 Akuntansi Anda).',
    actionAdvice:
      'Login SIAKAD tepat waktu saat jam server dibuka. Pilih mata kuliah wajib semester berjalan sesuai arahan Dosen PA agar tidak kehabisan kuota kelas.',
  },
  {
    id: 'upnvj-ganjil-pkkmb',
    title: 'PKKMB (Pengenalan Kehidupan Kampus Mahasiswa Baru)',
    type: 'bela_negara',
    category: 'kegiatan_kampus',
    semester: 'ganjil',
    date: '2026-08-10',
    endDate: '2026-08-13',
    startTime: '07:00',
    endTime: '17:00',
    location: 'Kampus UPNVJ Pondok Labu & Gedung FEB',
    badgeColor: '#4F46E5', // Indigo
    isOfficialUpnvj: true,
    explanation:
      'Orientasi resmi mahasiswa baru UPNVJ untuk mengenal budaya akademik, nilai-nilai patriotisme Kampus Bela Negara, serta pengenalan jurusan S1 Akuntansi.',
    actionAdvice:
      'Kenakan seragam ketentuan PKKMB, bawa perlengkapan yang ditugaskan panitia, dan ikuti materi Bela Negara dengan tertib.',
  },
  {
    id: 'upnvj-ganjil-hut-ri',
    title: 'HUT Kemerdekaan RI ke-81 (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'ganjil',
    date: '2026-08-17',
    startTime: '07:00',
    endTime: '23:59',
    location: 'Plaza Belakang Kampus UPNVJ Pondok Labu / Nasional',
    badgeColor: '#EF4444', // Merah
    isOfficialUpnvj: true,
    explanation:
      'Peringatan Hari Kemerdekaan Republik Indonesia ke-81. Tidak ada perkuliahan aktif. Upacara bendera diselenggarakan di kampus.',
    actionAdvice:
      'Gunakan hari ini untuk menghadiri upacara bendera kampus atau istirahat menjelang hari pertama perkuliahan besok.',
  },
  {
    id: 'upnvj-ganjil-pkrs',
    title: 'Perubahan Kartu Rencana Studi (P-KRS)',
    type: 'krs',
    category: 'krs',
    semester: 'ganjil',
    date: '2026-08-24',
    endDate: '2026-08-28',
    startTime: '08:00',
    endTime: '16:00',
    location: 'SIAKAD UPNVJ',
    badgeColor: '#0EA5E9', // Biru cerah
    isOfficialUpnvj: true,
    explanation:
      'Fasilitas revisi KRS resmi (Tambah/Batal mata kuliah). Berguna jika ada jadwal kelas yang bentrok dengan praktikum atau kuota kelas tambahan dibuka prodi.',
    actionAdvice:
      'Segera lakukan penyesuaian kelas jika ada revisi jadwal dari prodi akuntansi. Minta persetujuan Dosen PA.',
  },
  {
    id: 'upnvj-ganjil-pddikti',
    title: 'Pelaporan KRS ke PDDIKTI Kemendikbudristek',
    type: 'krs',
    category: 'krs',
    semester: 'ganjil',
    date: '2026-08-31',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Sistem PDDIKTI Pusat',
    badgeColor: '#0284C7',
    isOfficialUpnvj: true,
    explanation:
      'Batas akhir universitas menyinkronkan data mahasiswa aktif dan KRS ke database nasional PDDIKTI. Pastikan status Anda di SIAKAD tercatat AKTIF.',
    actionAdvice:
      'Cek profil mahasiswa di SIAKAD untuk memastikan seluruh mata kuliah Anda sudah disetujui (Approved) oleh Dosen PA.',
  },
  {
    id: 'upnvj-ganjil-kuliah',
    title: 'Masa Perkuliahan Semester Ganjil 2026/2027 (16 Minggu)',
    type: 'perkuliahan',
    category: 'kuliah',
    semester: 'ganjil',
    date: '2026-08-18',
    endDate: '2026-12-18',
    startTime: '07:30',
    endTime: '18:00',
    location: 'Gedung FEB UPNVJ Pondok Labu / LMS UPNVJ',
    badgeColor: '#059669', // Hijau
    isOfficialUpnvj: true,
    explanation:
      'Periode inti belajar mengajar selama 16 minggu yang terdiri dari 14 minggu kuliah tatap muka & praktikum lab, 1 minggu UTS, dan 1 minggu UAS.',
    actionAdvice:
      'Jaga presensi kehadiran kuliah minimal 75%. Mahasiswa dengan kehadiran di bawah 75% tidak diizinkan mengikuti UAS!',
  },
  {
    id: 'upnvj-ganjil-wisuda-77',
    title: 'Wisuda ke-77 UPN "Veteran" Jakarta (Tentatif)',
    type: 'wisuda',
    category: 'wisuda_yudisium',
    semester: 'ganjil',
    date: '2026-09-13',
    startTime: '07:00',
    endTime: '13:00',
    location: 'Balai Samudera / JCC Plenary Hall Jakarta',
    badgeColor: '#0D9488', // Tosca
    isOfficialUpnvj: true,
    explanation:
      'Upacara wisuda resmi sarjana, diploma, dan pascasarjana lulusan Semester Genap 2025/2026.',
    actionAdvice:
      'Bagi adik tingkat, momen ini tepat untuk memberikan apresiasi dan selamat kepada para kakak tingkat akuntansi yang diwisuda.',
  },
  {
    id: 'upnvj-ganjil-maulid',
    title: 'Maulid Nabi Muhammad SAW (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'ganjil',
    date: '2026-09-25',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation:
      'Hari libur nasional memperingati kelahiran Nabi Muhammad SAW. Tidak ada perkuliahan aktif pada hari ini.',
    actionAdvice:
      'Gunakan hari libur untuk mereview kembali materi kuliah minggu 1-5 sebelum memasuki persiapan UTS bulan depan.',
  },
  {
    id: 'upnvj-ganjil-kesaktian-pancasila',
    title: 'Peringatan Hari Kesaktian Pancasila',
    type: 'bela_negara',
    category: 'kegiatan_kampus',
    semester: 'ganjil',
    date: '2026-10-01',
    startTime: '07:00',
    endTime: '09:00',
    location: 'Lapangan Kampus UPNVJ Pondok Labu',
    badgeColor: '#4F46E5',
    isOfficialUpnvj: true,
    explanation:
      'Hari penting kebangsaan bagi Kampus Bela Negara UPNVJ untuk mengenang dan meneguhkan kembali nilai-nilai luhur Pancasila.',
    actionAdvice:
      'Ikuti upacara atau kegiatan yang dihimbau pimpinan universitas dengan pakaian rapi.',
  },
  {
    id: 'upnvj-ganjil-uts',
    title: 'Ujian Tengah Semester (UTS) Semester Ganjil 2026/2027',
    type: 'uts',
    category: 'ujian',
    semester: 'ganjil',
    date: '2026-10-05',
    endDate: '2026-10-09',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Ruang Ujian FEB UPNVJ Pondok Labu',
    badgeColor: '#D97706', // Amber/Oranye Emas
    isOfficialUpnvj: true,
    explanation:
      'Pekan evaluasi tengah semester (pertemuan ke-8). Menilai pemahaman materi paruh pertama semester untuk seluruh mata kuliah akuntansi.',
    actionAdvice:
      'Wajib membawa Kartu Peserta Ujian (KPU) cetak dari SIAKAD, kartu mahasiswa (KTM), kalkulator standar akuntansi, dan berpakaian kemeja putih rapi.',
  },
  {
    id: 'upnvj-ganjil-input-uts',
    title: 'Batas Akhir Input Nilai UTS oleh Dosen',
    type: 'uts',
    category: 'ujian',
    semester: 'ganjil',
    date: '2026-10-16',
    startTime: '08:00',
    endTime: '23:59',
    location: 'SIAKAD Dosen UPNVJ',
    badgeColor: '#D97706',
    isOfficialUpnvj: true,
    explanation:
      'Batas waktu bagi seluruh dosen pengampu untuk memasukkan nilai UTS ke sistem SIAKAD.',
    actionAdvice:
      'Cek nilai UTS Anda di portal SIAKAD. Jika ada nilai yang belum masuk atau terdapat kekeliruan perhitungan, segera konfirmasi ke dosen pengampu.',
  },
  {
    id: 'upnvj-ganjil-sumpah-pemuda',
    title: 'Hari Sumpah Pemuda',
    type: 'bela_negara',
    category: 'kegiatan_kampus',
    semester: 'ganjil',
    date: '2026-10-28',
    startTime: '08:00',
    endTime: '16:00',
    location: 'Kampus UPNVJ Pondok Labu',
    badgeColor: '#4F46E5',
    isOfficialUpnvj: true,
    explanation:
      'Peringatan Hari Sumpah Pemuda. Mendorong semangat persatuan dan kontribusi mahasiswa akuntansi bagi bangsa.',
    actionAdvice:
      'Refleksikan semangat pemuda dalam menyelesaikan studi dan aktif berorganisasi di HMJA (Himpunan Mahasiswa Jurusan Akuntansi).',
  },
  {
    id: 'upnvj-ganjil-prospektif',
    title: 'Kegiatan Prospektif Mahasiswa Baru FEB UPNVJ',
    type: 'bela_negara',
    category: 'kegiatan_kampus',
    semester: 'ganjil',
    date: '2026-11-28',
    startTime: '08:00',
    endTime: '16:00',
    location: 'Auditorium FEB UPNVJ',
    badgeColor: '#4F46E5',
    isOfficialUpnvj: true,
    explanation:
      'Kegiatan pembinaan karir, prospek masa depan profesi akuntan, auditor, konsultan pajak, dan etika profesional untuk mahasiswa baru.',
    actionAdvice:
      'Ikuti sesi seminar prospek karir untuk memperluas jejaring dan memahami jenjang karir lulusan akuntansi.',
  },
  {
    id: 'upnvj-ganjil-dies-natalis',
    title: 'Dies Natalis ke-49 UPN "Veteran" Jakarta',
    type: 'bela_negara',
    category: 'kegiatan_kampus',
    semester: 'ganjil',
    date: '2026-11-30',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Auditorium Bhinneka Tunggal Ika UPNVJ',
    badgeColor: '#4F46E5',
    isOfficialUpnvj: true,
    explanation:
      'Peringatan Hari Ulang Tahun berdirinya UPN "Veteran" Jakarta ke-49 tahun. Diramaikan dengan orasi ilmiah, pameran inovasi, dan penghargaan prestasi mahasiswa.',
    actionAdvice:
      'Saksikan rangkaian peringatan Dies Natalis dan dukung perwakilan FEB dalam berbagai kompetisi kampus.',
  },
  {
    id: 'upnvj-ganjil-minggu-tenang',
    title: 'Minggu Tenang Semester Ganjil 2026/2027',
    type: 'minggu_tenang',
    category: 'minggu_tenang',
    semester: 'ganjil',
    date: '2026-11-30',
    endDate: '2026-12-04',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Bebas Kuliah Tatap Muka (Belajar Mandiri)',
    badgeColor: '#EAB308', // Kuning cerah
    isOfficialUpnvj: true,
    explanation:
      'Pekan bebas kuliah sebelum UAS dimulai. Kampus menghentikan perkuliahan tatap muka agar mahasiswa fokus belajar mandiri dan menyusun rangkuman materi.',
    actionAdvice:
      'Selesaikan seluruh sisa tugas makalah atau laporan keuangan, buat peta konsep akuntansi, dan jaga stamina fisik agar prima saat UAS minggu depan.',
  },
  {
    id: 'upnvj-ganjil-uas',
    title: 'Ujian Akhir Semester (UAS) Semester Ganjil 2026/2027',
    type: 'uas',
    category: 'ujian',
    semester: 'ganjil',
    date: '2026-12-07',
    endDate: '2026-12-18',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Ruang Ujian FEB Kampus UPNVJ Pondok Labu',
    badgeColor: '#B45309', // Amber tua
    isOfficialUpnvj: true,
    explanation:
      'Pekan penentu kelulusan mata kuliah (pertemuan ke-16). Menguji penguasaan materi dari seluruh semester (terutama pertemuan 9-15).',
    actionAdvice:
      'Pastikan presensi kehadiran Anda >= 75%. Cetak Kartu Ujian (KPU) UAS dari SIAKAD, berpakaian rapi kemeja putih, dan hadir 20 menit sebelum ujian.',
  },
  {
    id: 'upnvj-ganjil-hari-bela-negara',
    title: 'Peringatan Hari Bela Negara Nasional UPNVJ',
    type: 'bela_negara',
    category: 'kegiatan_kampus',
    semester: 'ganjil',
    date: '2026-12-19',
    startTime: '07:30',
    endTime: '12:00',
    location: 'Kampus Bela Negara UPNVJ Pondok Labu',
    badgeColor: '#4F46E5',
    isOfficialUpnvj: true,
    explanation:
      'Peringatan Hari Bela Negara sebagai pilar utama identitas universitas. Kampus menggelar upacara dan dialog kebangsaan.',
    actionAdvice:
      'Maknai nilai Bela Negara dalam integritas profesi akuntan: kejujuran, anti korupsi, dan transparansi laporan keuangan.',
  },
  {
    id: 'upnvj-ganjil-edom',
    title: 'Pengisian EDOM (Evaluasi Dosen oleh Mahasiswa)',
    type: 'perkuliahan',
    category: 'kuliah',
    semester: 'ganjil',
    date: '2026-12-22',
    endDate: '2026-12-31',
    startTime: '08:00',
    endTime: '23:59',
    location: 'SIAKAD UPNVJ',
    badgeColor: '#059669',
    isOfficialUpnvj: true,
    explanation:
      'Pengisian kuesioner evaluasi kinerja mengajar dosen secara anonim. Wajib diisi mahasiswa sebagai syarat membuka akses nilai Kartu Hasil Studi (KHS).',
    actionAdvice:
      'Isi evaluasi dengan jujur dan objektif untuk seluruh mata kuliah yang Anda ambil. Jika tidak mengisi, nilai KHS Anda akan terkunci!',
  },
  {
    id: 'upnvj-ganjil-cuti-natal',
    title: 'Cuti Bersama Hari Raya Natal',
    type: 'libur',
    category: 'libur',
    semester: 'ganjil',
    date: '2026-12-24',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation: 'Hari cuti bersama nasional Hari Raya Natal. Layanan kampus diliburkan.',
    actionAdvice: 'Manfaatkan untuk beristirahat dan berkumpul bersama keluarga.',
  },
  {
    id: 'upnvj-ganjil-natal',
    title: 'Hari Raya Natal (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'ganjil',
    date: '2026-12-25',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation: 'Hari Raya Natal bagi umat Kristiani. Kampus libur penuh.',
    actionAdvice: 'Selamat merayakan bagi rekan mahasiswa dan bapak/ibu dosen yang merayakan!',
  },
  {
    id: 'upnvj-ganjil-input-uas',
    title: 'Batas Akhir Input Nilai UAS oleh Dosen',
    type: 'uas',
    category: 'ujian',
    semester: 'ganjil',
    date: '2026-12-26',
    startTime: '08:00',
    endTime: '23:59',
    location: 'SIAKAD Dosen UPNVJ',
    badgeColor: '#B45309',
    isOfficialUpnvj: true,
    explanation:
      'Batas akhir dosen memasukkan nilai akhir UAS dan akumulasi nilai tugas, kuis, serta praktikum ke SIAKAD.',
    actionAdvice:
      'Pantau portal SIAKAD untuk mengecek nilai huruf mutu (A, A-, B+, B, dll.) dan nilai IPK semester ini.',
  },
  {
    id: 'upnvj-ganjil-skpi',
    title: 'Batas Akhir Input Nilai SKPI s/d Semester Berjalan',
    type: 'lainnya',
    category: 'lainnya',
    semester: 'ganjil',
    date: '2026-12-31',
    startTime: '08:00',
    endTime: '23:59',
    location: 'Portal SKPI UPNVJ',
    badgeColor: '#64748B',
    isOfficialUpnvj: true,
    explanation:
      'Batas upload bukti sertifikat keahlian, prestasi lomba akuntansi, sertifikasi Brevet Pajak/TOEFL, dan kepengurusan organisasi ke portal SKPI.',
    actionAdvice:
      'Segera unggah sertifikat kegiatan semester ini agar poin SKPI Anda bertambah untuk syarat kelulusan sarjana nanti.',
  },
  {
    id: 'upnvj-ganjil-tahun-baru',
    title: 'Tahun Baru Masehi 2027 (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'ganjil',
    date: '2027-01-01',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation: 'Tahun Baru Masehi 2027. Libur nasional.',
    actionAdvice: 'Selamat Tahun Baru 2027! Siapkan target IPK dan prestasi baru di semester genap mendatang.',
  },
  {
    id: 'upnvj-ganjil-mbkm',
    title: 'Pendataan MBKM Semester Ganjil UPNVJ',
    type: 'perkuliahan',
    category: 'kuliah',
    semester: 'ganjil',
    date: '2027-01-02',
    endDate: '2027-01-16',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Sekretariat MBKM UPNVJ / Prodi Akuntansi',
    badgeColor: '#059669',
    isOfficialUpnvj: true,
    explanation:
      'Pendataan dan penyetaraan SKS (konversi nilai) bagi mahasiswa yang mengikuti program Kampus Merdeka (Magang MSIB di KAP/Kantor Pajak, PMM, dll).',
    actionAdvice:
      'Kumpulkan laporan akhir magang dan nilai dari mentor perusahaan ke koordinator MBKM prodi akuntansi.',
  },
  {
    id: 'upnvj-ganjil-isra-miraj',
    title: 'Isra Mi’raj Nabi Muhammad SAW (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'ganjil',
    date: '2027-01-05',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation: 'Hari libur nasional memperingati peristiwa Isra Mi’raj Nabi Muhammad SAW.',
    actionAdvice: 'Hari libur resmi.',
  },
  {
    id: 'upnvj-ganjil-ujian-ta',
    title: 'Batas Akhir Ujian Sidang Tugas Akhir / Skripsi Ganjil',
    type: 'wisuda',
    category: 'wisuda_yudisium',
    semester: 'ganjil',
    date: '2027-01-16',
    startTime: '08:00',
    endTime: '16:00',
    location: 'Ruang Sidang Skripsi FEB UPNVJ',
    badgeColor: '#0D9488',
    isOfficialUpnvj: true,
    explanation:
      'Batas akhir sidang skripsi bagi mahasiswa semester akhir akuntansi agar dapat yudisium pada semester ganjil.',
    actionAdvice:
      'Bagi mahasiswa tingkat akhir, pastikan naskah skripsi telah di-ACC dosen pembimbing 1 dan 2.',
  },
  {
    id: 'upnvj-ganjil-input-skripsi',
    title: 'Batas Akhir Input Nilai Skripsi & Penetapan Kelulusan',
    type: 'wisuda',
    category: 'wisuda_yudisium',
    semester: 'ganjil',
    date: '2027-01-23',
    startTime: '08:00',
    endTime: '23:59',
    location: 'SIAKAD & Dekanat FEB UPNVJ',
    badgeColor: '#0D9488',
    isOfficialUpnvj: true,
    explanation:
      'Batas penginputan nilai revisi sidang skripsi dan penerbitan surat permohonan keputusan yudisium kelulusan.',
    actionAdvice:
      'Selesaikan revisi lembar pengesahan dan upload berkas skripsi ke repositori perpustakaan UPNVJ.',
  },
  {
    id: 'upnvj-ganjil-cek-yudisium',
    title: 'Masa Pengecekan Syarat Yudisium Semester Ganjil',
    type: 'wisuda',
    category: 'wisuda_yudisium',
    semester: 'ganjil',
    date: '2027-01-26',
    endDate: '2027-01-30',
    startTime: '08:00',
    endTime: '16:00',
    location: 'Subbagian Akademik FEB UPNVJ',
    badgeColor: '#0D9488',
    isOfficialUpnvj: true,
    explanation:
      'Pemeriksaan kelengkapan berkas bebas tanggungan perpustakaan, skor TOEFL/Bahasa Inggris, sertifikat SKPI, dan kelulusan 144 SKS.',
    actionAdvice:
      'Verifikasi status bebas perpustakaan dan laboratorium akuntansi di portal kemahasiswaan.',
  },
  {
    id: 'upnvj-ganjil-sk-yudisium',
    title: 'Batas Akhir Penerbitan Keputusan Yudisium Semester Ganjil',
    type: 'wisuda',
    category: 'wisuda_yudisium',
    semester: 'ganjil',
    date: '2027-01-31',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Rektorat UPNVJ',
    badgeColor: '#0D9488',
    isOfficialUpnvj: true,
    explanation:
      'Penerbitan SK Yudisium resmi tanda sah menyandang gelar Sarjana Akuntansi (S.Akun) bagi mahasiswa yang lulus.',
    actionAdvice:
      'Selamat bagi para wisudawan baru! Unduh Surat Keterangan Lulus (SKL) resmi untuk keperluan lamaran kerja.',
  },

  // =========================================================================
  // SEMESTER GENAP 2026/2027
  // =========================================================================
  {
    id: 'upnvj-genap-ukt',
    title: 'Batas Akhir Pembayaran UKT Semester Genap 2026/2027',
    type: 'krs',
    category: 'krs',
    semester: 'genap',
    date: '2027-01-24',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Virtual Account Bank Mitra UPNVJ',
    badgeColor: '#0284C7',
    isOfficialUpnvj: true,
    explanation:
      'Batas akhir pembayaran biaya kuliah UKT untuk Semester Genap 2026/2027 agar status aktif dan portal pengisian KRS genap terbuka.',
    actionAdvice:
      'Lakukan pembayaran via mobile banking/teller bank sebelum tanggal ini. Cek status aktivasi di SIAKAD.',
  },
  {
    id: 'upnvj-genap-krs',
    title: 'Pengisian KRS Online Semester Genap 2026/2027',
    type: 'krs',
    category: 'krs',
    semester: 'genap',
    date: '2027-01-25',
    endDate: '2027-02-05',
    startTime: '08:00',
    endTime: '23:59',
    location: 'SIAKAD UPNVJ',
    badgeColor: '#0284C7',
    isOfficialUpnvj: true,
    explanation:
      'Periode pemilihan mata kuliah semester genap (Semester 2, 4, 6, atau 8). Kuota kelas dibuka serentak.',
    actionAdvice:
      'Ambil paket mata kuliah semester genap sesuai rekomendasi prodi. Konsultasikan jatah SKS berdasarkan IPK semester ganjil Anda.',
  },
  {
    id: 'upnvj-genap-cuti',
    title: 'Batas Akhir Pengajuan Cuti Akademik Semester Genap',
    type: 'krs',
    category: 'krs',
    semester: 'genap',
    date: '2027-02-01',
    startTime: '08:00',
    endTime: '16:00',
    location: 'Akademik FEB UPNVJ',
    badgeColor: '#64748B',
    isOfficialUpnvj: true,
    explanation:
      'Batas akhir mahasiswa mengajukan cuti studi resmi untuk semester genap.',
    actionAdvice: 'Ajukan dokumen ke bagian administrasi akademik FEB.',
  },
  {
    id: 'upnvj-genap-imlek',
    title: 'Tahun Baru Imlek 2578 (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'genap',
    date: '2027-02-06',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation: 'Hari libur nasional Tahun Baru Imlek 2578.',
    actionAdvice: 'Selamat merayakan bagi rekan mahasiswa dan dosen yang merayakan!',
  },
  {
    id: 'upnvj-genap-sk-berhenti',
    title: 'Batas Akhir SK Pemberhentian / Pengunduran Diri Genap',
    type: 'lainnya',
    category: 'lainnya',
    semester: 'genap',
    date: '2027-02-13',
    startTime: '08:00',
    endTime: '16:00',
    location: 'Rektorat UPNVJ',
    badgeColor: '#64748B',
    isOfficialUpnvj: true,
    explanation: 'Batas administratif pemrosesan mahasiswa yang mengundurkan diri semester genap.',
    actionAdvice: 'Administrasi bagian akademik.',
  },
  {
    id: 'upnvj-genap-pkrs',
    title: 'Perubahan Kartu Rencana Studi (P-KRS) Semester Genap',
    type: 'krs',
    category: 'krs',
    semester: 'genap',
    date: '2027-02-15',
    endDate: '2027-02-19',
    startTime: '08:00',
    endTime: '16:00',
    location: 'SIAKAD UPNVJ',
    badgeColor: '#0EA5E9',
    isOfficialUpnvj: true,
    explanation:
      'Masa perbaikan dan penyesuaian jadwal kelas mata kuliah semester genap (Tambah/Batal SKS).',
    actionAdvice:
      'Cek kembali bila ada kelas yang bentrok dengan jadwal praktikum akuntansi di laboratorium.',
  },
  {
    id: 'upnvj-genap-kuliah',
    title: 'Masa Perkuliahan Semester Genap 2026/2027 (16 Minggu)',
    type: 'perkuliahan',
    category: 'kuliah',
    semester: 'genap',
    date: '2027-02-15',
    endDate: '2027-06-25',
    startTime: '07:30',
    endTime: '18:00',
    location: 'Gedung FEB UPNVJ Pondok Labu / LMS UPNVJ',
    badgeColor: '#059669',
    isOfficialUpnvj: true,
    explanation:
      'Periode 16 minggu perkuliahan aktif Semester Genap untuk seluruh program studi Sarjana FEB UPNVJ.',
    actionAdvice:
      'Mulai perkuliahan pertemuan ke-1 dengan disiplin. Catat silabus dan kontrak perkuliahan dosen.',
  },
  {
    id: 'upnvj-genap-pddikti',
    title: 'Pelaporan KRS Semester Genap ke PDDIKTI',
    type: 'krs',
    category: 'krs',
    semester: 'genap',
    date: '2027-02-28',
    startTime: '08:00',
    endTime: '17:00',
    location: 'PDDIKTI Pusat',
    badgeColor: '#0284C7',
    isOfficialUpnvj: true,
    explanation: 'Sinkronisasi data mahasiswa aktif semester genap ke PDDIKTI Kemendikbudristek.',
    actionAdvice: 'Pastikan status KRS Anda sudah disetujui dosen pembimbing akademik.',
  },
  {
    id: 'upnvj-genap-nyepi',
    title: 'Hari Suci Nyepi Tahun Baru Saka 1949 (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'genap',
    date: '2027-03-09',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation: 'Hari libur nasional Hari Suci Nyepi Tahun Baru Saka 1949. Perkuliahan libur.',
    actionAdvice: 'Selamat Hari Raya Nyepi bagi umat Hindu yang merayakan.',
  },
  {
    id: 'upnvj-genap-idul-fitri',
    title: 'Hari Raya Idul Fitri 1448 H (Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'genap',
    date: '2027-03-10',
    endDate: '2027-03-11',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation:
      'Peringatan Hari Raya Idul Fitri 1448 H. Libur perkuliahan dan cuti bersama kampus.',
    actionAdvice:
      'Selamat Hari Raya Idul Fitri 1448 H! Mohon maaf lahir dan batin bagi seluruh civitas akademika.',
  },
  {
    id: 'upnvj-genap-jumat-agung',
    title: 'Wafat Isa Almasih / Jum’at Agung (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'genap',
    date: '2027-03-26',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation: 'Hari libur nasional memperingati Wafat Yesus Kristus (Jum’at Agung).',
    actionAdvice: 'Hari libur resmi.',
  },
  {
    id: 'upnvj-genap-wisuda-78',
    title: 'Wisuda ke-78 UPN "Veteran" Jakarta (Tentatif)',
    type: 'wisuda',
    category: 'wisuda_yudisium',
    semester: 'genap',
    date: '2027-04-10',
    startTime: '07:00',
    endTime: '13:00',
    location: 'Auditorium / Gedung Pertemuan Jakarta',
    badgeColor: '#0D9488',
    isOfficialUpnvj: true,
    explanation: 'Upacara wisuda ke-78 untuk lulusan Semester Ganjil 2026/2027.',
    actionAdvice: 'Selamat bagi para wisudawan UPNVJ!',
  },
  {
    id: 'upnvj-genap-uts',
    title: 'Ujian Tengah Semester (UTS) Semester Genap 2026/2027',
    type: 'uts',
    category: 'ujian',
    semester: 'genap',
    date: '2027-04-12',
    endDate: '2027-04-16',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Ruang Ujian FEB UPNVJ Pondok Labu',
    badgeColor: '#D97706',
    isOfficialUpnvj: true,
    explanation:
      'Pekan Ujian Tengah Semester pertemuan ke-8 untuk seluruh mata kuliah akuntansi semester genap.',
    actionAdvice:
      'Bawa KPU cetak, kartu mahasiswa, kalkulator, dan tiba di ruang ujian 15 menit sebelum waktu dimulai.',
  },
  {
    id: 'upnvj-genap-input-uts',
    title: 'Batas Akhir Input Nilai UTS Genap oleh Dosen',
    type: 'uts',
    category: 'ujian',
    semester: 'genap',
    date: '2027-04-23',
    startTime: '08:00',
    endTime: '23:59',
    location: 'SIAKAD Dosen',
    badgeColor: '#D97706',
    isOfficialUpnvj: true,
    explanation: 'Batas akhir dosen memasukkan nilai UTS semester genap ke SIAKAD.',
    actionAdvice: 'Cek nilai UTS di SIAKAD untuk mengevaluasi progres belajar Anda.',
  },
  {
    id: 'upnvj-genap-buruh',
    title: 'Hari Buruh Internasional (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'genap',
    date: '2027-05-01',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation: 'Hari Buruh Internasional (May Day). Libur nasional.',
    actionAdvice: 'Hari libur resmi.',
  },
  {
    id: 'upnvj-genap-kenaikan-isa',
    title: 'Kenaikan Isa Almasih (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'genap',
    date: '2027-05-06',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation: 'Hari libur nasional Kenaikan Yesus Kristus.',
    actionAdvice: 'Hari libur resmi.',
  },
  {
    id: 'upnvj-genap-idul-adha',
    title: 'Hari Raya Idul Adha 1448 H (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'genap',
    date: '2027-05-17',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation: 'Hari Raya Idul Adha 1448 H dan ibadah kurban.',
    actionAdvice: 'Selamat merayakan Hari Raya Idul Adha bagi umat Islam.',
  },
  {
    id: 'upnvj-genap-waisak',
    title: 'Hari Raya Waisak 2571 (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'genap',
    date: '2027-05-20',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation: 'Hari libur nasional Hari Raya Waisak 2571.',
    actionAdvice: 'Selamat Hari Raya Waisak bagi rekan mahasiswa yang merayakan.',
  },
  {
    id: 'upnvj-genap-pancasila',
    title: 'Hari Lahir Pancasila (Hari Libur Nasional)',
    type: 'bela_negara',
    category: 'kegiatan_kampus',
    semester: 'genap',
    date: '2027-06-01',
    startTime: '08:00',
    endTime: '23:59',
    location: 'Nasional / Kampus UPNVJ',
    badgeColor: '#4F46E5',
    isOfficialUpnvj: true,
    explanation: 'Hari peringatan lahirnya Pancasila sebagai dasar negara Republik Indonesia.',
    actionAdvice: 'Refleksi nilai persatuan dan kebhinnekaan di Kampus Bela Negara.',
  },
  {
    id: 'upnvj-genap-tahun-baru-islam',
    title: 'Tahun Baru Islam 1449 H (Hari Libur Nasional)',
    type: 'libur',
    category: 'libur',
    semester: 'genap',
    date: '2027-06-06',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Nasional',
    badgeColor: '#EF4444',
    isOfficialUpnvj: true,
    explanation: 'Hari libur nasional Tahun Baru Islam 1 Muharram 1449 H.',
    actionAdvice: 'Hari libur resmi.',
  },
  {
    id: 'upnvj-genap-minggu-tenang',
    title: 'Minggu Tenang Semester Genap 2026/2027',
    type: 'minggu_tenang',
    category: 'minggu_tenang',
    semester: 'genap',
    date: '2027-06-07',
    endDate: '2027-06-11',
    startTime: '00:00',
    endTime: '23:59',
    location: 'Bebas Kuliah Tatap Muka (Persiapan UAS)',
    badgeColor: '#EAB308',
    isOfficialUpnvj: true,
    explanation:
      'Periode tenang sebelum UAS semester genap. Tidak ada jadwal kuliah tatap muka.',
    actionAdvice:
      'Fokus belajar mandiri, latihan soal-soal kasus akuntansi, dan pastikan tugas besar sudah terkumpul.',
  },
  {
    id: 'upnvj-genap-uas',
    title: 'Ujian Akhir Semester (UAS) Semester Genap 2026/2027',
    type: 'uas',
    category: 'ujian',
    semester: 'genap',
    date: '2027-06-14',
    endDate: '2027-06-25',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Ruang Ujian FEB Kampus UPNVJ Pondok Labu',
    badgeColor: '#B45309',
    isOfficialUpnvj: true,
    explanation:
      'Pekan Ujian Akhir Semester penentu nilai akhir IPK dan kelulusan mata kuliah Semester Genap.',
    actionAdvice:
      'Wajib membawa KPU cetak, hadir tepat waktu, dan periksa ruangan ujian di portal SIAKAD.',
  },
  {
    id: 'upnvj-genap-edom',
    title: 'Pengisian EDOM Semester Genap',
    type: 'perkuliahan',
    category: 'kuliah',
    semester: 'genap',
    date: '2027-06-20',
    endDate: '2027-06-30',
    startTime: '08:00',
    endTime: '23:59',
    location: 'SIAKAD UPNVJ',
    badgeColor: '#059669',
    isOfficialUpnvj: true,
    explanation:
      'Pengisian kuesioner evaluasi dosen semester genap untuk membuka akses Kartu Hasil Studi (KHS).',
    actionAdvice: 'Isi seluruh butir kuesioner EDOM agar nilai KHS tidak terkunci.',
  },
  {
    id: 'upnvj-genap-input-uas-skpi',
    title: 'Batas Akhir Input Nilai UAS & SKPI Semester Genap',
    type: 'uas',
    category: 'ujian',
    semester: 'genap',
    date: '2027-07-02',
    startTime: '08:00',
    endTime: '23:59',
    location: 'SIAKAD & Portal SKPI',
    badgeColor: '#B45309',
    isOfficialUpnvj: true,
    explanation:
      'Batas penginputan nilai UAS oleh dosen dan upload sertifikat SKPI semester genap.',
    actionAdvice: 'Cek nilai KHS dan nilai IPK semester genap Anda di SIAKAD.',
  },
  {
    id: 'upnvj-genap-ujian-ta',
    title: 'Batas Akhir Ujian Tugas Akhir / Sidang Skripsi Genap',
    type: 'wisuda',
    category: 'wisuda_yudisium',
    semester: 'genap',
    date: '2027-07-10',
    startTime: '08:00',
    endTime: '16:00',
    location: 'Ruang Sidang FEB UPNVJ',
    badgeColor: '#0D9488',
    isOfficialUpnvj: true,
    explanation: 'Batas akhir sidang skripsi bagi mahasiswa akuntansi semester akhir.',
    actionAdvice: 'Persiapkan presentasi slide dan lembar perbaikan skripsi.',
  },
  {
    id: 'upnvj-genap-mbkm',
    title: 'Pendataan MBKM Semester Genap UPNVJ',
    type: 'perkuliahan',
    category: 'kuliah',
    semester: 'genap',
    date: '2027-07-05',
    endDate: '2027-07-23',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Koordinator MBKM FEB UPNVJ',
    badgeColor: '#059669',
    isOfficialUpnvj: true,
    explanation: 'Rekapitulasi nilai dan konversi SKS kegiatan Kampus Merdeka semester genap.',
    actionAdvice: 'Serahkan lembar penilaian magang industri atau mitra MBKM ke prodi.',
  },
  {
    id: 'upnvj-genap-penetapan-kelulusan',
    title: 'Batas Akhir Input Nilai Skripsi & Penetapan Kelulusan',
    type: 'wisuda',
    category: 'wisuda_yudisium',
    semester: 'genap',
    date: '2027-07-24',
    startTime: '08:00',
    endTime: '23:59',
    location: 'FEB UPNVJ',
    badgeColor: '#0D9488',
    isOfficialUpnvj: true,
    explanation: 'Batas penyerahan nilai sidang skripsi dan permohonan yudisium kelulusan sarjana.',
    actionAdvice: 'Selesaikan tanda tangan lembar pengesahan naskah skripsi.',
  },
  {
    id: 'upnvj-genap-cek-yudisium',
    title: 'Masa Pengecekan Syarat Yudisium Semester Genap',
    type: 'wisuda',
    category: 'wisuda_yudisium',
    semester: 'genap',
    date: '2027-07-26',
    endDate: '2027-07-30',
    startTime: '08:00',
    endTime: '16:00',
    location: 'Akademik FEB UPNVJ',
    badgeColor: '#0D9488',
    isOfficialUpnvj: true,
    explanation: 'Pemeriksaan berkas bebas pustaka, sertifikat TOEFL/SKPI, dan transkrip kelulusan.',
    actionAdvice: 'Lengkapi seluruh dokumen yudisium ke bagian akademik.',
  },
  {
    id: 'upnvj-genap-sk-yudisium',
    title: 'Batas Akhir Penerbitan Keputusan Yudisium Semester Genap',
    type: 'wisuda',
    category: 'wisuda_yudisium',
    semester: 'genap',
    date: '2027-07-31',
    startTime: '08:00',
    endTime: '17:00',
    location: 'Rektorat UPNVJ',
    badgeColor: '#0D9488',
    isOfficialUpnvj: true,
    explanation:
      'Penerbitan Surat Keputusan Rektor penetapan kelulusan Sarjana Akuntansi Semester Genap 2026/2027.',
    actionAdvice: 'Resmi menyandang gelar Sarjana Akuntansi (S.Akun). Selamat!',
  },
];

/**
 * Memeriksa apakah suatu tanggal berada di dalam rentang waktu suatu agenda akademik
 */
export function isDateInEventRange(dateStr: string, event: UpnvjAcademicEvent): boolean {
  if (!event.endDate) {
    return event.date === dateStr;
  }
  return dateStr >= event.date && dateStr <= event.endDate;
}

/**
 * Mendapatkan seluruh agenda akademik UPNVJ pada tanggal tertentu (YYYY-MM-DD)
 */
export function getUpnvjEventsForDate(dateStr: string): UpnvjAcademicEvent[] {
  return OFFICIAL_UPNVJ_ACADEMIC_EVENTS.filter((ev) => isDateInEventRange(dateStr, ev));
}

/**
 * Mendapatkan seluruh agenda akademik untuk bulan dan tahun tertentu
 */
export function getUpnvjEventsForMonth(year: number, monthIndex: number): UpnvjAcademicEvent[] {
  const mStr = String(monthIndex + 1).padStart(2, '0');
  const monthPrefix = `${year}-${mStr}`;

  return OFFICIAL_UPNVJ_ACADEMIC_EVENTS.filter((ev) => {
    if (ev.date.startsWith(monthPrefix)) return true;
    if (ev.endDate && ev.endDate.startsWith(monthPrefix)) return true;
    if (ev.endDate && ev.date < `${monthPrefix}-01` && ev.endDate > `${monthPrefix}-28`) return true;
    return false;
  });
}

/**
 * Mendapatkan semester akademik aktif berdasarkan tanggal
 */
export function getCurrentAcademicSemester(date: Date = new Date()): 'ganjil' | 'genap' {
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // 1 - 12

  // Ganjil 2026/2027: Agustus 2026 s/d Januari 2027
  if ((y === 2026 && m >= 8) || (y === 2027 && m === 1)) {
    return 'ganjil';
  }
  // Genap 2026/2027: Februari 2027 s/d Juli 2027
  return 'genap';
}

/**
 * Ringkasan alur tahapan semester (Timeline Panduan Cepat Mahasiswa)
 */
export interface SemesterTimelineStep {
  stepNumber: number;
  title: string;
  period: string;
  description: string;
  tips: string;
  status: 'passed' | 'current' | 'upcoming';
  category: 'krs' | 'kuliah' | 'ujian' | 'minggu_tenang' | 'evaluasi';
}

export function getSemesterTimelineSteps(
  semester: 'ganjil' | 'genap' = 'ganjil',
  currentDateStr: string = new Date().toISOString().split('T')[0]
): SemesterTimelineStep[] {
  if (semester === 'ganjil') {
    const rawSteps = [
      {
        stepNumber: 1,
        title: 'Pembayaran UKT & Registrasi',
        period: 'Hingga 2 Agustus 2026',
        startDate: '2026-08-01',
        endDate: '2026-08-02',
        description: 'Bayar Uang Kuliah Tunggal via Virtual Account Bank Mitra agar akun SIAKAD aktif.',
        tips: 'Simpan bukti transfer dan pastikan status mahasiswa aktif di portal.',
        category: 'krs' as const,
      },
      {
        stepNumber: 2,
        title: 'Pengisian KRS Online & Bimbingan PA',
        period: '3 - 14 Agustus 2026',
        startDate: '2026-08-03',
        endDate: '2026-08-14',
        description: 'Pilih paket 20 SKS kelas S1 Akuntansi Anda di portal SIAKAD UPNVJ.',
        tips: 'Pilih mata kuliah wajib semester berjalan dan minta persetujuan Dosen PA.',
        category: 'krs' as const,
      },
      {
        stepNumber: 3,
        title: 'Kuliah Pertemuan 1 - 7 (Paruh Pertama)',
        period: '18 Agustus - 2 Oktober 2026',
        startDate: '2026-08-18',
        endDate: '2026-10-02',
        description: 'Masa perkuliahan teori, praktikum lab, tugas kasus, dan kuis mingguan.',
        tips: 'Jaga absensi kehadiran dan kerjakan tugas mingguan tepat waktu.',
        category: 'kuliah' as const,
      },
      {
        stepNumber: 4,
        title: 'Ujian Tengah Semester (UTS)',
        period: '5 - 9 Oktober 2026',
        startDate: '2026-10-05',
        endDate: '2026-10-09',
        description: 'Pekan ujian tengah semester (pertemuan ke-8) di ruang kuliah FEB UPNVJ.',
        tips: 'Cetak Kartu Ujian (KPU) di SIAKAD, pakai kemeja putih rapi, dan bawa kalkulator.',
        category: 'ujian' as const,
      },
      {
        stepNumber: 5,
        title: 'Kuliah Pertemuan 9 - 15 (Paruh Kedua)',
        period: '12 Oktober - 27 November 2026',
        startDate: '2026-10-12',
        endDate: '2026-11-27',
        description: 'Kelanjutan materi lanjutan, tugas besar kelompok, dan laporan praktikum.',
        tips: 'Pantau nilai UTS yang diinput dosen dan selesaikan tugas-tugas akhir kelompok.',
        category: 'kuliah' as const,
      },
      {
        stepNumber: 6,
        title: 'Minggu Tenang (Persiapan UAS)',
        period: '30 November - 4 Desember 2026',
        startDate: '2026-11-30',
        endDate: '2026-12-04',
        description: 'Bebas kuliah tatap muka 1 minggu penuh untuk belajar mandiri.',
        tips: 'Rangkum materi 9-15, pelajari latihan soal tahun lalu, dan jaga kesehatan.',
        category: 'minggu_tenang' as const,
      },
      {
        stepNumber: 7,
        title: 'Ujian Akhir Semester (UAS)',
        period: '7 - 18 Desember 2026',
        startDate: '2026-12-07',
        endDate: '2026-12-18',
        description: 'Pekan ujian akhir penentu nilai kelulusan mata kuliah dan IPK semester ganjil.',
        tips: 'Hadir 20 menit lebih awal, bawa KPU cetak, dan cek ruangan ujian di SIAKAD.',
        category: 'ujian' as const,
      },
      {
        stepNumber: 8,
        title: 'Isi EDOM & Lihat KHS Nilai Akhir',
        period: '22 - 31 Desember 2026',
        startDate: '2026-12-22',
        endDate: '2026-12-31',
        description: 'Isi kuesioner evaluasi dosen di SIAKAD untuk membuka lembar KHS nilai akhir.',
        tips: 'Wajib isi EDOM agar nilai KHS tidak terkunci! Pantau nilai huruf mutu (A, B, C).',
        category: 'evaluasi' as const,
      },
    ];

    return rawSteps.map((s) => {
      let status: 'passed' | 'current' | 'upcoming' = 'upcoming';
      if (currentDateStr > s.endDate) {
        status = 'passed';
      } else if (currentDateStr >= s.startDate && currentDateStr <= s.endDate) {
        status = 'current';
      }
      return {
        stepNumber: s.stepNumber,
        title: s.title,
        period: s.period,
        description: s.description,
        tips: s.tips,
        status,
        category: s.category,
      };
    });
  }

  // Semester Genap
  const rawStepsGenap = [
    {
      stepNumber: 1,
      title: 'Pembayaran UKT Genap',
      period: 'Hingga 24 Januari 2027',
      startDate: '2027-01-01',
      endDate: '2027-01-24',
      description: 'Transfer UKT semester genap via virtual account bank mitra.',
      tips: 'Lakukan sebelum batas akhir agar portal KRS semester genap aktif.',
      category: 'krs' as const,
    },
    {
      stepNumber: 2,
      title: 'Pengisian KRS Online Genap',
      period: '25 Januari - 5 Februari 2027',
      startDate: '2027-01-25',
      endDate: '2027-02-05',
      description: 'Pilih mata kuliah semester genap sesuai perolehan IPK ganjil.',
      tips: 'Konsultasi Dosen PA untuk pengambilan SKS maksimal.',
      category: 'krs' as const,
    },
    {
      stepNumber: 3,
      title: 'Kuliah Pertemuan 1 - 7 Genap',
      period: '15 Februari - 9 April 2027',
      startDate: '2027-02-15',
      endDate: '2027-04-09',
      description: 'Masa aktif kuliah paruh pertama semester genap.',
      tips: 'Jaga kehadiran dan keaktifan diskusi di kelas.',
      category: 'kuliah' as const,
    },
    {
      stepNumber: 4,
      title: 'Ujian Tengah Semester (UTS) Genap',
      period: '12 - 16 April 2027',
      startDate: '2027-04-12',
      endDate: '2027-04-16',
      description: 'Pekan UTS genap pertemuan ke-8 di kampus.',
      tips: 'Bawa KPU cetak dan perlengkapan ujian.',
      category: 'ujian' as const,
    },
    {
      stepNumber: 5,
      title: 'Kuliah Pertemuan 9 - 15 Genap',
      period: '19 April - 4 Juni 2027',
      startDate: '2027-04-19',
      endDate: '2027-06-04',
      description: 'Kuliah paruh kedua dan penuntasan tugas praktikum.',
      tips: 'Selesaikan laporan keuangan dan makalah kelompok.',
      category: 'kuliah' as const,
    },
    {
      stepNumber: 6,
      title: 'Minggu Tenang Semester Genap',
      period: '7 - 11 Juni 2027',
      startDate: '2027-06-07',
      endDate: '2027-06-11',
      description: 'Bebas perkuliahan untuk persiapan UAS genap.',
      tips: 'Rangkum materi dan istirahat cukup.',
      category: 'minggu_tenang' as const,
    },
    {
      stepNumber: 7,
      title: 'Ujian Akhir Semester (UAS) Genap',
      period: '14 - 25 Juni 2027',
      startDate: '2027-06-14',
      endDate: '2027-06-25',
      description: 'Pekan UAS genap penentu nilai akhir kenaikan semester.',
      tips: 'Fokus dan teliti dalam perhitungan akuntansi.',
      category: 'ujian' as const,
    },
    {
      stepNumber: 8,
      title: 'Isi EDOM & KHS Genap',
      period: '20 - 30 Juni 2027',
      startDate: '2027-06-20',
      endDate: '2027-06-30',
      description: 'Pengisian evaluasi dosen dan penerbitan nilai KHS genap.',
      tips: 'Isi EDOM untuk melihat IPK semester dan IPK kumulatif.',
      category: 'evaluasi' as const,
    },
  ];

  return rawStepsGenap.map((s) => {
    let status: 'passed' | 'current' | 'upcoming' = 'upcoming';
    if (currentDateStr > s.endDate) {
      status = 'passed';
    } else if (currentDateStr >= s.startDate && currentDateStr <= s.endDate) {
      status = 'current';
    }
    return {
      stepNumber: s.stepNumber,
      title: s.title,
      period: s.period,
      description: s.description,
      tips: s.tips,
      status,
      category: s.category,
    };
  });
}
