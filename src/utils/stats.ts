/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modul Statistik & Perhitungan Nilai Akuntansi
 */

import { Task, GradeItem } from '../types';

export interface TaskSummaryStats {
  total: number;
  active: number;
  today: number;
  thisWeek: number;
  overdue: number;
  completed: number;
  onTimePercent: number;
  onTimeStreak: number;
  courseWorkload: { courseName: string; count: number; percentage: number; color?: string }[];
  heatmap28Days: { dateStr: string; dayLabel: string; count: number; completedCount: number }[];
}

export function calculateTaskStats(
  tasks: Task[],
  nowUtc: number = Date.now()
): TaskSummaryStats {
  const nonDeleted = tasks.filter((t) => !t.deletedAt);
  const total = nonDeleted.length;
  const completedTasks = nonDeleted.filter((t) => t.status === 'completed');
  const activeTasks = nonDeleted.filter((t) => t.status !== 'completed' && t.status !== 'archived');

  const completed = completedTasks.length;
  const active = activeTasks.length;

  // Overdue count: active tasks whose deadline has passed
  const overdue = activeTasks.filter((t) => t.deadlineAt && t.deadlineAt < nowUtc).length;

  // Today count (within current 24h interval)
  const oneDayMs = 24 * 3600 * 1000;
  const today = activeTasks.filter(
    (t) => t.deadlineAt && t.deadlineAt >= nowUtc && t.deadlineAt <= nowUtc + oneDayMs
  ).length;

  // This week count (within next 7 days)
  const thisWeek = activeTasks.filter(
    (t) => t.deadlineAt && t.deadlineAt >= nowUtc && t.deadlineAt <= nowUtc + 7 * oneDayMs
  ).length;

  // On-time percentage
  let onTimeCount = 0;
  for (const t of completedTasks) {
    if (t.onTime !== false) {
      onTimeCount++;
    }
  }
  const onTimePercent = completed > 0 ? Math.round((onTimeCount / completed) * 100) : 100;

  // On-time streak: count consecutive on-time completed tasks sorted by completedAt desc
  const sortedCompleted = [...completedTasks]
    .filter((t) => t.completedAt)
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  let onTimeStreak = 0;
  for (const t of sortedCompleted) {
    if (t.onTime !== false) {
      onTimeStreak++;
    } else {
      break;
    }
  }

  // Workload per course
  const courseCountMap: Record<string, number> = {};
  for (const t of nonDeleted) {
    const cName = t.courseName?.trim() || 'Lainnya / Umum';
    courseCountMap[cName] = (courseCountMap[cName] || 0) + 1;
  }

  const courseWorkload = Object.entries(courseCountMap).map(([courseName, count]) => ({
    courseName,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
  courseWorkload.sort((a, b) => b.count - a.count);

  // 4-Week (28 days) Heatmap
  const heatmap28Days: { dateStr: string; dayLabel: string; count: number; completedCount: number }[] = [];
  const startDay = new Date(nowUtc - 27 * oneDayMs);

  for (let i = 0; i < 28; i++) {
    const cur = new Date(startDay.getTime() + i * oneDayMs);
    const dateStr = cur.toISOString().split('T')[0];
    const dayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'narrow' }).format(cur);

    // Filter tasks that have deadline on this date or were completed on this date
    const dayTasks = nonDeleted.filter((t) => {
      if (!t.deadlineAt) return false;
      const dStr = new Date(t.deadlineAt).toISOString().split('T')[0];
      return dStr === dateStr;
    });

    const dayCompleted = completedTasks.filter((t) => {
      if (!t.completedAt) return false;
      const dStr = new Date(t.completedAt).toISOString().split('T')[0];
      return dStr === dateStr;
    });

    heatmap28Days.push({
      dateStr,
      dayLabel,
      count: dayTasks.length,
      completedCount: dayCompleted.length,
    });
  }

  return {
    total,
    active,
    today,
    thisWeek,
    overdue,
    completed,
    onTimePercent,
    onTimeStreak,
    courseWorkload,
    heatmap28Days,
  };
}

/**
 * Konversi skor numerik ke Huruf Mutu dan Bobot IPK standar universitas di Indonesia
 */
export function scoreToGradeLetterAndPoint(score: number): { letter: string; point: number; predicate: string } {
  if (score >= 85) return { letter: 'A', point: 4.0, predicate: 'Sangat Memuaskan' };
  if (score >= 80) return { letter: 'A-', point: 3.7, predicate: 'Memuaskan' };
  if (score >= 75) return { letter: 'B+', point: 3.3, predicate: 'Sangat Baik' };
  if (score >= 70) return { letter: 'B', point: 3.0, predicate: 'Baik' };
  if (score >= 65) return { letter: 'B-', point: 2.7, predicate: 'Cukup Baik' };
  if (score >= 60) return { letter: 'C+', point: 2.3, predicate: 'Cukup' };
  if (score >= 55) return { letter: 'C', point: 2.0, predicate: 'Cukup' };
  if (score >= 40) return { letter: 'D', point: 1.0, predicate: 'Kurang' };
  return { letter: 'E', point: 0.0, predicate: 'Gagal' };
}

/**
 * Hitung Nilai Akhir Mata Kuliah dari komponen berbobot
 */
export function calculateCourseFinalScore(components: GradeItem[]): {
  finalScore: number;
  letter: string;
  point: number;
  predicate: string;
  totalWeight: number;
} {
  if (components.length === 0) {
    return { finalScore: 0, letter: '-', point: 0, predicate: 'Belum ada data', totalWeight: 0 };
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const item of components) {
    weightedSum += (item.score * item.weightPercent) / 100;
    totalWeight += item.weightPercent;
  }

  // Jika total bobot belum 100%, hitung normalisasi proporsional
  const finalScore = totalWeight > 0 ? (weightedSum / (totalWeight / 100)) : 0;
  const gradeInfo = scoreToGradeLetterAndPoint(Math.round(finalScore * 10) / 10);

  return {
    finalScore: Math.round(finalScore * 10) / 10,
    letter: gradeInfo.letter,
    point: gradeInfo.point,
    predicate: gradeInfo.predicate,
    totalWeight,
  };
}
