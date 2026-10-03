export const PREP_STAGES = [
  { id: 1, name: 'Core Vocabulary Part 1', desc: 'Core vocabulary foundations (100 words • 5 units)', xpRequired: 0 },
  { id: 2, name: 'Core Vocabulary Part 2', desc: 'Core vocabulary foundations (100 words • 5 units)', xpRequired: 600 },
  { id: 3, name: 'Core Vocabulary Part 3', desc: 'Core vocabulary advancement (100 words • 5 units)', xpRequired: 1500 },
  { id: 4, name: 'Core Vocabulary Part 4', desc: 'Core vocabulary advancement (100 words • 5 units)', xpRequired: 2700 },
  { id: 5, name: 'Core Vocabulary Part 5', desc: 'Core vocabulary mastery (100 words • 5 units)', xpRequired: 4200 },
  { id: 6, name: 'Core Vocabulary Part 6', desc: 'Core vocabulary mastery (100 words • 5 units)', xpRequired: 6000 },
  { id: 7, name: 'Core Vocabulary Part 7', desc: 'Core vocabulary excellence (100 words • 5 units)', xpRequired: 8500 },
  { id: 8, name: 'Core Vocabulary Part 8', desc: 'Core vocabulary final mastery (122 words • 6 units)', xpRequired: 11500 },
];

/**
 * Stages 1-7 contain 5 units (20 words each = 100 words).
 * Stage 8 contains 6 units (5 of 20 words + final unit of 22 words = 122 words).
 * Total: 41 units = 822 words across 8 stages.
 */
export function getUnitsCountForStage(stageId) {
  return Number(stageId) === 8 ? 6 : 5;
}

/**
 * Strict lock checking function:
 * - A stage is locked if stageId > state.unlockedLevel.
 * - In an unlocked stage, Unit 1 is always unlocked.
 * - Unit N (N > 1) is unlocked ONLY if Unit N-1 quiz was passed (or if the stage was already completed).
 * - Locked units cannot be used.
 * - Once unlocked, a user can quiz them as many times as they want (even if completed before).
 */
export function checkIsUnitUnlocked(stageId, unitNum, state) {
  if (!state) return false;
  const sId = Number(stageId);
  const uNum = Number(unitNum);
  if (!Number.isInteger(sId) || sId < 1 || sId > 8 || !Number.isInteger(uNum) || uNum < 1) return false;
  const currentUnlockedLevel = Number(state.unlockedLevel) || 1;
  const maxUnits = getUnitsCountForStage(sId);

  if (uNum > maxUnits) return false;

  // Stages higher than unlockedLevel are strictly locked
  if (sId > currentUnlockedLevel) return false;

  // If this stage has already been qualified or user has advanced past it, all units are unlocked
  if (state.levelAttempts?.[sId]?.passed || sId < currentUnlockedLevel) {
    return true;
  }

  // Unit 1 in the active stage is always unlocked
  if (uNum === 1) return true;

  // Unit N is unlocked if Unit N-1 quiz was passed
  const prevKey = `${sId}.${uNum - 1}`;
  if (state.unitAttempts?.[prevKey]?.passed) {
    return true;
  }

  return false;
}

/**
 * Checks if the Stage Cumulative Exam is unlocked:
 * - Stage must not be locked.
 * - If stage already qualified, it's unlocked (can retake anytime).
 * - Otherwise, requires the final unit quiz of this stage to be passed.
 */
export function checkIsStageExamUnlocked(stageId, state) {
  if (!state) return false;
  const sId = Number(stageId);
  if (!Number.isInteger(sId) || sId < 1 || sId > 8) return false;
  const currentUnlockedLevel = Number(state.unlockedLevel) || 1;

  if (sId > currentUnlockedLevel) return false;
  if (state.levelAttempts?.[sId]?.passed || sId < currentUnlockedLevel) return true;

  const finalUnit = getUnitsCountForStage(sId);
  const finalUnitKey = `${sId}.${finalUnit}`;
  return Boolean(state.unitAttempts?.[finalUnitKey]?.passed);
}

export function calculateSM2(card, q, reviewDate) {
  let ef = card.easinessFactor || 2.5;
  let repetitions = card.repetitionCount || 0;
  let interval = card.intervalDays || 0;

  if (q >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    repetitions += 1;
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
  }

  // Update easiness factor
  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < 1.3) {
    ef = 1.3;
  }

  // Next review date
  const nextReview = new Date(reviewDate.getTime());
  nextReview.setDate(nextReview.getDate() + interval);

  // Calculate status and mastery score
  let status = 'learning';
  if (q < 3) {
    status = 'relearning';
  } else {
    status = repetitions >= 4 ? 'mastered' : 'reviewing';
  }

  let mastery = Math.min(Math.max(repetitions * 20, 0), 100);
  if (q < 3) {
    mastery = Math.min(Math.max(mastery - 30, 0), 100);
  }

  return {
    easinessFactor: parseFloat(ef.toFixed(4)),
    intervalDays: interval,
    repetitionCount: repetitions,
    nextReviewAt: nextReview.toISOString(),
    status,
    masteryScore: mastery,
  };
}
