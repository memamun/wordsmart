import test from 'node:test';
import assert from 'node:assert/strict';
import { checkIsUnitUnlocked, checkIsStageExamUnlocked, calculateSM2 } from '../src/state/learning.js';
import { defaultProgress } from '../src/state/progress.js';
import { resolveDetailWord } from '../src/utils/detailWord.js';

test('unit and stage exams enforce prerequisites, including the sixth unit in stage eight', () => {
  const state = defaultProgress();
  assert.equal(checkIsUnitUnlocked(1, 1, state), true);
  assert.equal(checkIsUnitUnlocked(1, 2, state), false);
  state.unitAttempts['1.1'] = { passed: true };
  assert.equal(checkIsUnitUnlocked(1, 2, state), true);
  assert.equal(checkIsUnitUnlocked(2, 1, state), false);
  assert.equal(checkIsUnitUnlocked(1, -1, state), false);
  assert.equal(checkIsStageExamUnlocked(1, state), false);
  state.unlockedLevel = 8;
  state.unitAttempts['8.5'] = { passed: true };
  assert.equal(checkIsUnitUnlocked(8, 6, state), true);
  assert.equal(checkIsStageExamUnlocked(8, state), false);
  state.unitAttempts['8.6'] = { passed: true };
  assert.equal(checkIsStageExamUnlocked(8, state), true);
});

test('spaced repetition progresses through initial intervals and resets after failure', () => {
  const date = new Date('2026-10-04T12:00:00Z');
  const first = calculateSM2({}, 5, date);
  assert.equal(first.intervalDays, 1);
  const second = calculateSM2(first, 5, date);
  assert.equal(second.intervalDays, 6);
  const third = calculateSM2(second, 5, date);
  assert.ok(third.intervalDays > 6);
  const failed = calculateSM2(third, 1, date);
  assert.equal(failed.repetitionCount, 0);
  assert.equal(failed.intervalDays, 1);
  assert.equal(failed.status, 'relearning');
});

test('detail panel accepts raw flashcard records and wrapped search records without losing fields', () => {
  const word = { id: 1, word: 'ABATE', definition: 'become less intense' };
  const words = [word];
  assert.deepEqual(resolveDetailWord(word, null, words), { word, list: words });
  assert.deepEqual(resolveDetailWord({ word, list: words }), { word, list: words });
  assert.equal(resolveDetailWord(null), null);
  assert.equal(resolveDetailWord('ABATE'), null);
});
