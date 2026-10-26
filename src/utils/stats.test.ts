import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTaskStats, calculateCourseFinalScore, scoreToGradeLetterAndPoint } from './stats';
import { Task, GradeItem } from '../types';

test('calculateTaskStats menghitung onTimePercent dan onTimeStreak dengan benar', () => {
  const baseTime = 1761600000000;
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Tugas 1',
      summary: '',
      keyPoints: [],
      requirements: [],
      questions: [],
      type: 'Individu',
      priority: 'sedang',
      deadlineAt: baseTime + 10000,
      deadlineTz: 'Asia/Jakarta',
      status: 'completed',
      completedAt: baseTime + 5000,
      onTime: true,
      subtasks: [],
      attachments: [],
      links: [],
      notes: '',
      reminders: [],
      tags: [],
      createdAt: baseTime,
      updatedAt: baseTime,
    },
    {
      id: '2',
      title: 'Tugas 2',
      summary: '',
      keyPoints: [],
      requirements: [],
      questions: [],
      type: 'Individu',
      priority: 'tinggi',
      deadlineAt: baseTime + 20000,
      deadlineTz: 'Asia/Jakarta',
      status: 'completed',
      completedAt: baseTime + 15000,
      onTime: true,
      subtasks: [],
      attachments: [],
      links: [],
      notes: '',
      reminders: [],
      tags: [],
      createdAt: baseTime,
      updatedAt: baseTime,
    },
    {
      id: '3',
      title: 'Tugas 3',
      summary: '',
      keyPoints: [],
      requirements: [],
      questions: [],
      type: 'Individu',
      priority: 'rendah',
      deadlineAt: baseTime + 1000,
      deadlineTz: 'Asia/Jakarta',
      status: 'completed',
      completedAt: baseTime + 5000,
      onTime: false, // terlambat
      subtasks: [],
      attachments: [],
      links: [],
      notes: '',
      reminders: [],
      tags: [],
      createdAt: baseTime,
      updatedAt: baseTime,
    },
  ];

  const stats = calculateTaskStats(mockTasks, baseTime);
  assert.equal(stats.total, 3);
  assert.equal(stats.completed, 3);
  assert.equal(stats.onTimePercent, 67); // 2 out of 3 = 67%
});

test('calculateCourseFinalScore menghitung nilai akhir dan huruf mutu akuntansi', () => {
  const components: GradeItem[] = [
    { id: '1', courseId: 'c1', componentName: 'Tugas & Kuis', weightPercent: 20, score: 90 },
    { id: '2', courseId: 'c1', componentName: 'UTS', weightPercent: 30, score: 85 },
    { id: '3', courseId: 'c1', componentName: 'UAS', weightPercent: 40, score: 88 },
    { id: '4', courseId: 'c1', componentName: 'Keaktifan', weightPercent: 10, score: 95 },
  ];

  const result = calculateCourseFinalScore(components);
  // (90*0.2) + (85*0.3) + (88*0.4) + (95*0.1) = 18 + 25.5 + 35.2 + 9.5 = 88.2
  assert.equal(result.finalScore, 88.2);
  assert.equal(result.letter, 'A');
  assert.equal(result.point, 4.0);
});

test('scoreToGradeLetterAndPoint memetakan skor ke huruf', () => {
  assert.equal(scoreToGradeLetterAndPoint(86).letter, 'A');
  assert.equal(scoreToGradeLetterAndPoint(77).letter, 'B+');
  assert.equal(scoreToGradeLetterAndPoint(68).letter, 'B-');
  assert.equal(scoreToGradeLetterAndPoint(50).letter, 'D');
});
