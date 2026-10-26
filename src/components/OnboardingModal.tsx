/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal Onboarding Pengenalan Mahasiswa Baru S1 Akuntansi UPNVJ
 */

import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { APP_CONFIG } from '../config';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onLoadSampleData: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onLoadSampleData,
}) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Selamat Datang di Planner Akuntansi UPNVJ',
      subtitle: 'Dirancang khusus untuk membantu mahasiswa S1 Akuntansi UPN "Veteran" Jakarta mengatur jadwal kuliah dan tenggat tugas.',
      icon: BookOpen,
      iconColor: 'bg-emerald-600',
      bullets: [
        'Organisir seluruh mata kuliah, dosen, dan ruang perkuliahan FEB.',
        'Simpan semua data tugas dan berkas soal aman di perangkat tanpa server luar.',
        'Dukungan penuh mode offline dan install sebagai aplikasi di HP (PWA).',
      ],
    },
    {
      title: 'Ekstraksi Otomatis Soal PDF, Word & Excel',
      subtitle: 'Cukup unggah berkas soal dari dosen, data judul dan instruksi terisi secara pintar.',
      icon: FileText,
      iconColor: 'bg-teal-600',
      bullets: [
        'Deteksi otomatis jenis tugas (Kuis, Praktikum, Laporan, Studi Kasus).',
        'Ringkasan poin pengerjaan dan checklist langkah akuntansi otomatis.',
        'Tenggat diisi secara manual dengan pratinjau hari dan jam Indonesia yang akurat.',
      ],
    },
    {
      title: 'Hitung Mundur Realtime & Tombol Selesai Cepat',
      subtitle: 'Ketahui dengan pasti sisa waktu pengerjaan tugas dalam hitungan detik.',
      icon: Clock,
      iconColor: 'bg-cyan-600',
      bullets: [
        'Kartu "Tenggat Terdekat" dengan hitung mundur besar dan detak waktu detik.',
        'Warna status pintar: Aman (hijau), Waspada (amber), Mendesak (oranye), Kritis (merah).',
        'Tombol Selesai lingkaran besar dengan fitur Batalkan jika tidak sengaja tertekan.',
      ],
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleLoadAndFinish = () => {
    onLoadSampleData();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-teal-200 text-center relative overflow-hidden">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold mb-6 border border-teal-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{APP_CONFIG.institution}</span>
        </div>

        {/* Step Icon */}
        <div className={`w-16 h-16 rounded-2xl ${current.iconColor} text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/25`}>
          <Icon className="w-8 h-8" />
        </div>

        {/* Step Title & Subtitle */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight mb-2">
          {current.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
          {current.subtitle}
        </p>

        {/* Step Bullets */}
        <div className="text-left space-y-2.5 bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-white p-4 rounded-2xl border border-teal-200 mb-6">
          {current.bullets.map((bullet, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </div>
          ))}
        </div>

        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-6 bg-teal-500' : 'w-2 bg-teal-100'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 cursor-pointer ml-auto transition-all"
            >
              <span>{step === steps.length - 1 ? 'Mulai Sekarang' : 'Lanjut'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Load Sample Data Button */}
          <button
            type="button"
            onClick={handleLoadAndFinish}
            className="w-full py-2.5 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
          >
            Muat contoh jadwal & tugas akuntansi UPNVJ (Rekomendasi)
          </button>
        </div>
      </div>
    </div>
  );
};
