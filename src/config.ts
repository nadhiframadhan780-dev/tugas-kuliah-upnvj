/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Konfigurasi Utama Aplikasi "Planner Akuntansi UPNVJ"
 * Semua nama, tagline, URL logo, zona waktu, dan warna merek tersentralisasi di sini.
 */

export interface AppConfig {
  appName: string;
  tagline: string;
  institution: string;
  logoUrl: string;
  fallbackLogoUrl: string;
  monogramText: string;
  defaultTimezone: string;
  supportedTimezones: { id: string; label: string; offset: string }[];
  brandColors: {
    primaryGreen: string;
    primaryTeal: string;
    accentCyan: string;
    bgLight: string;
    surfaceLight: string;
    surfaceDark?: string;
  };
  accountingKeywords: string[];
}

export const APP_CONFIG: AppConfig = {
  appName: 'Planner Akuntansi UPNVJ',
  tagline: 'Jadwal Kuliah & List Tugas Mahasiswa S1 Akuntansi',
  institution: 'Mahasiswa S1 Akuntansi UPNVJ',
  logoUrl: 'https://feb.upnvj.ac.id/wp-content/uploads/2021/01/HMJ-SIA-FEB-1.jpg',
  fallbackLogoUrl: '/assets/aistudio/Jadwal_dan_Daftar_Tugas_Akuntansi_68173d24.png',
  monogramText: 'SA',
  defaultTimezone: 'Asia/Jakarta', // WIB
  supportedTimezones: [
    { id: 'Asia/Jakarta', label: 'WIB (Waktu Indonesia Barat)', offset: 'UTC+7' },
    { id: 'Asia/Makassar', label: 'WITA (Waktu Indonesia Tengah)', offset: 'UTC+8' },
    { id: 'Asia/Jayapura', label: 'WIT (Waktu Indonesia Timur)', offset: 'UTC+9' },
  ],
  brandColors: {
    primaryGreen: '#10B981', // Emerald 500 (hijau terang & segar)
    primaryTeal: '#14B8A6', // Teal 500 (biru tosca cerah)
    accentCyan: '#06B6D4', // Cyan 500 (aksen tosca muda)
    bgLight: '#F0FDFA', // Latar mint terang & bersih
    surfaceLight: '#FFFFFF', // Permukaan kartu putih bersih
  },
  accountingKeywords: [
    'akuntansi', 'keuangan', 'biaya', 'manajemen', 'auditing', 'pajak', 'perpajakan',
    'sistem informasi akuntansi', 'sia', 'anggaran', 'teori akuntansi', 'pasar modal',
    'analisis laporan keuangan', 'etika bisnis', 'akuntansi sektor publik', 'asp',
    'jurnal', 'buku besar', 'neraca', 'laba rugi', 'arus kas', 'ekuitas'
  ]
};
