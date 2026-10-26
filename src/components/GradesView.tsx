/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pencatat Nilai & Bobot per Mata Kuliah dengan Estimasi Nilai Akhir & IPK
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  Award,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { Course, GradeItem } from '../types';
import { calculateCourseFinalScore } from '../utils/stats';

interface GradesViewProps {
  courses: Course[];
  grades: GradeItem[];
  onSaveGrade: (grade: GradeItem) => void;
  onDeleteGrade: (gradeId: string) => void;
}

export const GradesView: React.FC<GradesViewProps> = ({
  courses,
  grades,
  onSaveGrade,
  onDeleteGrade,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || ''
  );

  // Form for new component
  const [componentName, setComponentName] = useState('');
  const [weightPercent, setWeightPercent] = useState<number>(20);
  const [score, setScore] = useState<number>(85);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const courseGrades = grades.filter((g) => g.courseId === selectedCourse?.id);

  const summary = calculateCourseFinalScore(courseGrades);

  // Calculate Semester GPA (IPS) estimate across all courses
  let totalSks = 0;
  let totalPointsEarned = 0;

  for (const c of courses) {
    const cGrades = grades.filter((g) => g.courseId === c.id);
    const cSum = calculateCourseFinalScore(cGrades);
    if (cSum.totalWeight > 0) {
      totalSks += c.sks;
      totalPointsEarned += cSum.point * c.sks;
    }
  }

  const estimatedIps = totalSks > 0 ? (totalPointsEarned / totalSks).toFixed(2) : '0.00';

  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!componentName.trim() || !selectedCourse) return;

    onSaveGrade({
      id: `g-${Date.now()}`,
      courseId: selectedCourse.id,
      componentName: componentName.trim(),
      weightPercent: Number(weightPercent),
      score: Number(score),
    });

    setComponentName('');
    setWeightPercent(20);
    setScore(85);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
            Pencatat Nilai & Estimasi IPK
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola bobot persentase nilai (Tugas, UTS, UAS, Praktikum) & estimasi Indeks Prestasi Semester
          </p>
        </div>

        {/* IPK Summary Badge */}
        <div className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/20 flex items-center gap-3">
          <GraduationCap className="w-5 h-5" />
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-100">
              Estimasi IPS ({totalSks} SKS)
            </div>
            <div className="text-xl font-black tracking-tight tabular-nums">
              {estimatedIps} <span className="text-xs font-normal opacity-90">/ 4.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Course Selector List */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-teal-100 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 px-2 mb-2">
            Pilih Mata Kuliah
          </h3>
          {courses.map((c) => {
            const isSelected = (selectedCourse?.id || '') === c.id;
            const cGrades = grades.filter((g) => g.courseId === c.id);
            const cScore = calculateCourseFinalScore(cGrades);

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCourseId(c.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50/90 border-2 border-teal-500 ring-2 ring-teal-400/20 shadow-xs'
                    : 'border-slate-100 hover:bg-teal-50/40 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {c.name}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                    {cScore.letter}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>{c.code} • {c.sks} SKS</span>
                  <span className="font-bold text-teal-700">
                    {cScore.finalScore} / 100
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Grade Components Details */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm space-y-5">
          {selectedCourse ? (
            <>
              {/* Header Card for selected course */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50/60 to-cyan-50/40 border border-teal-200 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                    {selectedCourse.code} • {selectedCourse.sks} SKS
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedCourse.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Dosen: {selectedCourse.lecturer}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Nilai Akhir:</div>
                    <div className="text-xl font-black text-teal-800 tabular-nums">
                      {summary.finalScore}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-teal-500/25">
                    {summary.letter}
                  </div>
                </div>
              </div>

              {/* Components List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                  <span>Komponen Penilaian ({courseGrades.length})</span>
                  <span>Total Bobot: {summary.totalWeight}% {summary.totalWeight !== 100 && <span className="text-amber-500">(idealnya 100%)</span>}</span>
                </div>

                {courseGrades.map((g) => (
                  <div
                    key={g.id}
                    className="p-3.5 rounded-2xl bg-slate-50/80 border border-teal-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">
                        {g.componentName}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Bobot: <strong className="text-teal-700">{g.weightPercent}%</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                        {g.score}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteGrade(g.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {courseGrades.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    Belum ada komponen nilai untuk mata kuliah ini.
                  </p>
                )}
              </div>

              {/* Add Component Form */}
              <form onSubmit={handleAddComponent} className="pt-4 border-t border-teal-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  Tambah Komponen Nilai Baru
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                    placeholder="Nama Komponen (e.g. UTS, Praktikum)"
                    className="px-3 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                  />

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 shrink-0 font-medium">Bobot %:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={weightPercent}
                      onChange={(e) => setWeightPercent(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 shrink-0 font-medium">Skor:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-xl border border-teal-200 bg-white text-xs focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 cursor-pointer"
                >
                  Tambahkan Komponen
                </button>
              </form>
            </>
          ) : (
            <p className="text-xs text-slate-400">Silakan pilih mata kuliah terlebih dahulu.</p>
          )}
        </div>
      </div>
    </div>
  );
};
