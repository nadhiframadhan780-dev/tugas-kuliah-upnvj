/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal Pengaturan Aplikasi Planner Akuntansi UPNVJ
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Globe,
  Palette,
  Bell,
  HardDrive,
  Download,
  Upload,
  Sparkles,
  ShieldCheck,
  Check,
  Image,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { AppSettings, Task, Course, CalendarEvent, GradeItem } from '../types';
import { APP_CONFIG } from '../config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  tasks: Task[];
  courses: Course[];
  events: CalendarEvent[];
  grades: GradeItem[];
  onRestoreData: (data: { tasks: Task[]; courses: Course[]; events: CalendarEvent[]; grades: GradeItem[] }) => void;
  onResetSampleData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  tasks,
  courses,
  events,
  grades,
  onRestoreData,
  onResetSampleData,
}) => {
  const [activeTab, setActiveTab] = useState<'umum' | 'tampilan' | 'cadangan' | 'ai' | 'tentang'>('umum');

  const [timezone, setTimezone] = useState(settings.timezone);
  const [theme, setTheme] = useState(settings.theme);
  const [highContrast, setHighContrast] = useState(settings.highContrast);
  const [enableConfetti, setEnableConfetti] = useState(settings.enableConfetti);
  const [enableNotifications, setEnableNotifications] = useState(settings.enableNotifications);
  const [userName, setUserName] = useState(settings.userName);
  const [customLogoUrl, setCustomLogoUrl] = useState(settings.customLogoUrl || '');

  // AI settings
  const [aiEnabled, setAiEnabled] = useState(settings.aiEnabled);
  const [aiApiKey, setAiApiKey] = useState(settings.aiApiKey || '');

  const [backupStatusMessage, setBackupStatusMessage] = useState('');
  const restoreFileRef = useRef<HTMLInputElement>(null);
  const logoUploadRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: AppSettings = {
      ...settings,
      timezone,
      theme,
      highContrast,
      enableConfetti,
      enableNotifications,
      userName: userName.trim() || 'Mahasiswa Akuntansi',
      customLogoUrl: customLogoUrl || undefined,
      aiEnabled,
      aiApiKey: aiApiKey.trim() || undefined,
    };

    onSaveSettings(updated);
    onClose();
  };

  // Export Data JSON
  const handleExportBackup = () => {
    const backupData = {
      app: 'Planner Akuntansi UPNVJ',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks,
      courses,
      events,
      grades,
      settings: {
        ...settings,
        lastBackupDate: Date.now(),
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-planner-akuntansi-upnvj-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setBackupStatusMessage('✓ Cadangan data berhasil diunduh.');
  };

  // Import / Restore Data JSON
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          if (parsed && Array.isArray(parsed.tasks) && Array.isArray(parsed.courses)) {
            onRestoreData({
              tasks: parsed.tasks,
              courses: parsed.courses,
              events: parsed.events || [],
              grades: parsed.grades || [],
            });
            setBackupStatusMessage('✓ Data berhasil dipulihkan!');
          } else {
            setBackupStatusMessage('Format file cadangan tidak valid.');
          }
        } catch {
          setBackupStatusMessage('Gagal membaca file JSON cadangan.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Custom Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCustomLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-teal-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-teal-100 flex items-center justify-between bg-teal-50/40">
          <h3 className="text-base font-bold text-slate-900">
            Pengaturan Aplikasi
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-teal-100 px-6 gap-4 text-xs font-semibold overflow-x-auto bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('umum')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'umum'
                ? 'border-teal-600 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Umum & Zona Waktu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tampilan')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'tampilan'
                ? 'border-teal-600 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tampilan & Logo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cadangan')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'cadangan'
                ? 'border-teal-600 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cadangan & Pulihkan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'ai'
                ? 'border-teal-600 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Mode AI (Opsional)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tentang')}
            className={`py-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'tentang'
                ? 'border-teal-600 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tentang & Privasi
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'umum' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1 block">
                  Nama Panggilan Mahasiswa
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 bg-white text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-teal-600" />
                  <span>Zona Waktu Indonesia</span>
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 bg-white text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-teal-400 outline-none"
                >
                  {APP_CONFIG.supportedTimezones.map((tz) => (
                    <option key={tz.id} value={tz.id}>
                      {tz.label} ({tz.offset})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Default: Asia/Jakarta (WIB). Semua tenggat tersimpan dalam UTC epoch ms sehingga konsisten jika Anda bepergian.
                </p>
              </div>

              <div className="pt-2 border-t border-teal-100 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableNotifications}
                    onChange={(e) => setEnableNotifications(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-teal-300"
                  />
                  <div className="text-xs text-slate-800">
                    <span className="font-bold">Notifikasi Pengingat Tenggat</span>
                    <p className="text-[11px] text-slate-500">
                      Kirim pengingat H-3, H-1, 3 jam, 1 jam, dan 30 menit saat aplikasi terbuka.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableConfetti}
                    onChange={(e) => setEnableConfetti(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-teal-300"
                  />
                  <div className="text-xs text-slate-800">
                    <span className="font-bold">Efek Confetti saat Tugas Selesai</span>
                    <p className="text-[11px] text-slate-500">
                      Tampilkan animasi perayaan kecil saat Anda menandai tugas selesai.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'tampilan' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-teal-600" />
                  <span>Tema Tampilan</span>
                </label>
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 font-bold" />
                    <span className="text-xs font-bold text-teal-900">Tema Terang Aktif (Hijau & Biru Tosca Terang)</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-teal-200 text-teal-900 border border-teal-300">Aktif</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => setHighContrast(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-teal-300"
                  />
                  <div className="text-xs text-slate-800">
                    <span className="font-bold">Mode Kontras Tinggi</span>
                    <p className="text-[11px] text-slate-500">
                      Pertebal border dan kontras teks untuk kemudahan membaca.
                    </p>
                  </div>
                </label>
              </div>

              {/* Ganti Logo Aplikasi */}
              <div className="pt-3 border-t border-teal-100">
                <label className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-teal-600" />
                  <span>Kustomisasi Logo Aplikasi</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Unggah gambar logo untuk mengubah logo di header & tab peramban secara dinamis.
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={logoUploadRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoUploadRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl border border-teal-200 bg-white text-xs font-semibold hover:bg-teal-50 text-teal-800 cursor-pointer transition-colors"
                  >
                    Pilih Gambar Logo
                  </button>
                  {customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomLogoUrl('')}
                      className="text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      Kembalikan ke Logo Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cadangan' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200">
                <div className="flex items-center gap-2 mb-1">
                  <HardDrive className="w-5 h-5 text-teal-600" />
                  <h4 className="text-sm font-bold text-teal-900">
                    Semua Data Tersimpan di Perangkat Anda (IndexedDB)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Karena tidak menggunakan server pihak ketiga, disarankan untuk mengunduh cadangan berkala agar data tugas, jadwal, dan nilai Anda tidak hilang saat membersihkan peramban.
                </p>
              </div>

              {backupStatusMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  {backupStatusMessage}
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-sm shadow-teal-500/20 cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Cadangan JSON</span>
                </button>

                <input
                  type="file"
                  ref={restoreFileRef}
                  onChange={handleRestoreFile}
                  accept=".json"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => restoreFileRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-teal-200 bg-white text-slate-700 text-xs font-bold hover:bg-teal-50 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Pulihkan dari File JSON</span>
                </button>
              </div>

              <div className="pt-3 border-t border-teal-100">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Muat ulang data contoh mata kuliah dan tugas akuntansi?')) {
                      onResetSampleData();
                      setBackupStatusMessage('✓ Data contoh akuntansi berhasil dimuat ulang.');
                    }
                  }}
                  className="text-xs text-teal-700 hover:text-teal-900 hover:underline cursor-pointer font-medium"
                >
                  Muat ulang data contoh (Akuntansi Keuangan, Biaya, Auditing, Pajak, SIA)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Mode AI Opsional (Kunci API Pribadi)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Secara default, aplikasi mengekstrak dokumen menggunakan algoritma heuristik lokal 100% offline dan gratis. Bila Anda ingin ringkasan yang lebih mendalam, Anda dapat memasukkan Gemini API Key pribadi Anda. Kunci ini hanya disimpan di peramban Anda.
                </p>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-teal-300"
                />
                <span className="text-xs font-bold text-slate-800">
                  Aktifkan Mode Ekstraksi AI
                </span>
              </label>

              {aiEnabled && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Gemini API Key
                  </label>
                  <input
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-teal-200 bg-white text-xs font-mono outline-none focus:ring-2 focus:ring-teal-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Bila kuota habis atau jaringan bermasalah, aplikasi otomatis kembali ke mode ekstraksi lokal.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tentang' && (
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50/60 to-white border border-teal-200">
                <div className="w-10 h-10 rounded-full bg-white ring-2 ring-teal-400/30 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  <img
                    src={APP_CONFIG.fallbackLogoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {APP_CONFIG.appName}
                  </div>
                  <div className="text-[11px] text-teal-800 font-semibold">
                    {APP_CONFIG.institution}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900">Jaminan Privasi & Keamanan:</div>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>Seluruh data jadwal, tugas, dan file lampiran disimpan secara lokal di IndexedDB peramban Anda.</li>
                  <li>Tidak ada data dokumen atau tugas yang dikirimkan ke server eksternal tanpa izin Anda.</li>
                  <li>Aplikasi berfungsi penuh saat offline berkat dukungan Service Worker (PWA).</li>
                </ul>
              </div>

              <div className="pt-2 text-[11px] text-slate-500">
                Versi 1.0.0 • Dibuat khusus untuk Mahasiswa S1 Akuntansi Fakultas Ekonomi dan Bisnis UPN "Veteran" Jakarta.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-teal-100 flex justify-end gap-2 bg-teal-50/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-sm shadow-teal-500/20 cursor-pointer transition-all"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
