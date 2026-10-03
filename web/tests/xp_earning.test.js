import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultProgress } from '../src/state/progress.js';

// Replicate the pure state transitions used in useGameState for unit-level verification
function recordQuizWordMastered(prev, wordId) {
  const numId = Number(wordId);
  if (!numId) return prev;
  const currentList = prev.quizMasteredWordIds || [];
  if (currentList.includes(numId)) return prev;

  const updatedList = [...currentList, numId];
  return {
    ...prev,
    xp: prev.xp + 10,
    quizMasteredWordIds: updatedList,
  };
}

function recordUnitQuizAttempt(prev, stageId, unitId, scorePercent) {
  const isPass = scorePercent >= 70;
  const key = `${stageId}.${unitId}`;
  const existing = prev.unitAttempts?.[key];
  const previousBestScore = existing?.score || 0;
  const wasAlreadyPassed = Boolean(existing?.passed);

  let xpGained = 0;
  if (!wasAlreadyPassed && isPass) {
    const accuracyBonus = scorePercent === 100 ? 25 : scorePercent >= 90 ? 15 : 0;
    xpGained = 50 + accuracyBonus;
  } else if (wasAlreadyPassed && scorePercent > previousBestScore) {
    const prevBonus = previousBestScore === 100 ? 25 : previousBestScore >= 90 ? 15 : 0;
    const newBonus = scorePercent === 100 ? 25 : scorePercent >= 90 ? 15 : 0;
    xpGained = Math.max(0, newBonus - prevBonus);
  }

  const bestScore = Math.max(previousBestScore, scorePercent);
  const passed = wasAlreadyPassed || isPass;

  return {
    ...prev,
    xp: prev.xp + xpGained,
    unitAttempts: {
      ...(prev.unitAttempts || {}),
      [key]: { score: bestScore, passed, date: new Date().toISOString() },
    },
  };
}

function recordQuizAttempt(prev, levelId, scorePercent) {
  const isPass = scorePercent >= 70;
  const existing = prev.levelAttempts?.[levelId];
  const previousBestScore = existing?.score || 0;
  const wasAlreadyPassed = Boolean(existing?.passed);

  let xpGained = 0;
  if (!wasAlreadyPassed && isPass) {
    const accuracyBonus = scorePercent === 100 ? 50 : scorePercent >= 90 ? 30 : 0;
    xpGained = 120 + accuracyBonus;
  } else if (wasAlreadyPassed && scorePercent > previousBestScore) {
    const prevBonus = previousBestScore === 100 ? 50 : previousBestScore >= 90 ? 30 : 0;
    const newBonus = scorePercent === 100 ? 50 : scorePercent >= 90 ? 30 : 0;
    xpGained = Math.max(0, newBonus - prevBonus);
  }

  const bestScore = Math.max(previousBestScore, scorePercent);
  const passed = wasAlreadyPassed || isPass;

  return {
    ...prev,
    xp: prev.xp + xpGained,
    levelAttempts: {
      ...(prev.levelAttempts || {}),
      [levelId]: { score: bestScore, passed, date: new Date().toISOString() },
    },
  };
}

test('word mastery awards 10 XP only once per unique word and rejects duplicates', () => {
  let state = defaultProgress();
  assert.equal(state.xp, 0);

  // First time answering word #42 correctly
  state = recordQuizWordMastered(state, 42);
  assert.equal(state.xp, 10);
  assert.deepEqual(state.quizMasteredWordIds, [42]);

  // Retaking or answering the same word again
  state = recordQuizWordMastered(state, 42);
  assert.equal(state.xp, 10); // No additional XP
  assert.deepEqual(state.quizMasteredWordIds, [42]);

  // Answering a second new word
  state = recordQuizWordMastered(state, 105);
  assert.equal(state.xp, 20);
  assert.deepEqual(state.quizMasteredWordIds, [42, 105]);
});

test('unit quiz awards first-time pass and accuracy bonus, but denies repetitive retake farming', () => {
  let state = defaultProgress();

  // 1. Fail: < 70%
  state = recordUnitQuizAttempt(state, 1, 1, 65);
  assert.equal(state.xp, 0); // 0 XP for failing

  // 2. First-time pass at 80% (Pass, but not high-score bonus)
  state = recordUnitQuizAttempt(state, 1, 1, 80);
  assert.equal(state.xp, 50); // +50 XP base

  // 3. Retaking the unit with same score (80%)
  state = recordUnitQuizAttempt(state, 1, 1, 80);
  assert.equal(state.xp, 50); // 0 XP! No repetitive farming

  // 4. Retaking with lower score (75%)
  state = recordUnitQuizAttempt(state, 1, 1, 75);
  assert.equal(state.xp, 50); // 0 XP

  // 5. Improving score to 100% (Earns the +25 accuracy bonus delta)
  state = recordUnitQuizAttempt(state, 1, 1, 100);
  assert.equal(state.xp, 75); // 50 + 25 = 75 XP

  // 6. Retaking at 100% again
  state = recordUnitQuizAttempt(state, 1, 1, 100);
  assert.equal(state.xp, 75); // 0 XP
});

test('stage exam awards milestone and prevents repetitive farming', () => {
  let state = defaultProgress();

  // First time pass with 100%
  state = recordQuizAttempt(state, 1, 100);
  assert.equal(state.xp, 170); // 120 base + 50 perfect bonus

  // Retake with 100%
  state = recordQuizAttempt(state, 1, 100);
  assert.equal(state.xp, 170); // 0 XP on retake
});
