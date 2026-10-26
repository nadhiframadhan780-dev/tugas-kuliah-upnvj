import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNaturalLanguageTask } from './naturalLanguage';
import { createUtcTimestamp } from './time';

test('parseNaturalLanguageTask membedah input "Laporan Auditing besok 23.59"', () => {
  const fakeNow = createUtcTimestamp('2026-10-25', '10:00', 'Asia/Jakarta');
  const res = parseNaturalLanguageTask('Laporan Auditing besok 23.59', 'Asia/Jakarta', fakeNow);

  assert.match(res.title, /Laporan Auditing/i);
  assert.equal(res.courseName, 'Auditing');
  assert.equal(res.type, 'Laporan/Makalah');
  assert.equal(res.dateStr, '2026-10-26');
  assert.equal(res.timeStr, '23:59');
});

test('parseNaturalLanguageTask membedah input "Kuis Perpajakan lusa 14.00"', () => {
  const fakeNow = createUtcTimestamp('2026-10-25', '10:00', 'Asia/Jakarta');
  const res = parseNaturalLanguageTask('Kuis Perpajakan lusa 14.00', 'Asia/Jakarta', fakeNow);

  assert.equal(res.courseName, 'Perpajakan');
  assert.equal(res.type, 'Kuis');
  assert.equal(res.dateStr, '2026-10-27');
  assert.equal(res.timeStr, '14:00');
});
