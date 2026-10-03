import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'wordsmart_gamestate_v2';

const DEFAULT_STATE = {
  xp: 0,
  streak: 0,
  coins: 100,
  unlockedLevel: 1,
  bookmarkedWordIds: [],
  quizMasteredWordIds: [], // Word IDs mastered strictly through quiz completion
  lastActiveDate: null,
  levelAttempts: {}, 
  unitAttempts: {},
  achievements: [], 
  wordProgress: {}, // e.g. { '1': { easinessFactor: 2.5, repetitionCount: 1, intervalDays: 1, nextReviewAt: '...', masteryScore: 20, status: 'learning' } }
};

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
  const sId = Number(stageId) || 1;
  const uNum = Number(unitNum) || 1;
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
  const sId = Number(stageId) || 1;
  const currentUnlockedLevel = Number(state.unlockedLevel) || 1;

  if (sId > currentUnlockedLevel) return false;
  if (state.levelAttempts?.[sId]?.passed || sId < currentUnlockedLevel) return true;

  const finalUnit = getUnitsCountForStage(sId);
  const finalUnitKey = `${sId}.${finalUnit}`;
  return Boolean(state.unitAttempts?.[finalUnitKey]?.passed);
}

export function useGameState() {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    return DEFAULT_STATE;
  });

  const [isQuizActive, setIsQuizActive] = useState(false);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [state]);

  // Check and update streak on mount
  useEffect(() => {
    updateStreak();
  }, []);

  const addXp = useCallback((amount) => {
    setState((prev) => {
      const newXp = prev.xp + amount;
      
      const newAchievements = [...prev.achievements];
      if (newXp >= 1000 && !newAchievements.includes('xp_1000')) {
        newAchievements.push('xp_1000');
      }
      if (newXp >= 5000 && !newAchievements.includes('xp_5000')) {
        newAchievements.push('xp_5000');
      }
      if (newXp >= 10000 && !newAchievements.includes('xp_10000')) {
        newAchievements.push('xp_10000');
      }

      return {
        ...prev,
        xp: newXp,
        achievements: newAchievements,
      };
    });
  }, []);

  const addCoins = useCallback((amount) => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
    }));
  }, []);

  const deductCoins = useCallback((amount) => {
    let success = false;
    setState((prev) => {
      if (prev.coins >= amount) {
        success = true;
        return { ...prev, coins: prev.coins - amount };
      }
      return prev;
    });
    return success;
  }, []);

  const updateStreak = useCallback(() => {
    const todayStr = new Date().toDateString();
    
    setState((prev) => {
      if (!prev.lastActiveDate) {
        return {
          ...prev,
          streak: 1,
          lastActiveDate: todayStr,
        };
      }

      if (prev.lastActiveDate === todayStr) {
        return prev;
      }

      const lastActive = new Date(prev.lastActiveDate);
      const today = new Date(todayStr);
      const diffTime = Math.abs(today - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = prev.streak;
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }

      const newAchievements = [...prev.achievements];
      if (newStreak >= 3 && !newAchievements.includes('streak_3')) {
        newAchievements.push('streak_3');
      }
      if (newStreak >= 7 && !newAchievements.includes('streak_7')) {
        newAchievements.push('streak_7');
      }

      return {
        ...prev,
        streak: newStreak,
        lastActiveDate: todayStr,
        achievements: newAchievements,
      };
    });
  }, []);

  // SM-2 Spaced Repetition engine calculations
  const calculateSM2 = (card, q, reviewDate) => {
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
  };

  const submitSM2Review = useCallback((wordId, rating) => {
    const now = new Date();
    
    setState((prev) => {
      const currentCard = prev.wordProgress[wordId] || {
        easinessFactor: 2.5,
        repetitionCount: 0,
        intervalDays: 0,
        nextReviewAt: null,
        masteryScore: 0,
        status: 'unlearned',
      };

      const result = calculateSM2(currentCard, rating, now);
      
      // Calculate XP and Coin reward based on quality rating
      const xpGained = rating >= 3 ? 10 + rating : 2;
      const coinsGained = rating === 5 ? 2 : 0;
      const newXp = prev.xp + xpGained;
      const newCoins = prev.coins + coinsGained;

      const newProgress = {
        ...prev.wordProgress,
        [wordId]: result,
      };

      // Recalculate achievement rules atomically
      const masteredCount = Object.values(newProgress).filter(p => p.status === 'mastered').length;
      const newAchievements = [...prev.achievements];
      if (masteredCount >= 10 && !newAchievements.includes('mastered_10')) {
        newAchievements.push('mastered_10');
      }
      if (masteredCount >= 50 && !newAchievements.includes('mastered_50')) {
        newAchievements.push('mastered_50');
      }
      if (newXp >= 1000 && !newAchievements.includes('xp_1000')) {
        newAchievements.push('xp_1000');
      }
      if (newXp >= 5000 && !newAchievements.includes('xp_5000')) {
        newAchievements.push('xp_5000');
      }
      if (newXp >= 10000 && !newAchievements.includes('xp_10000')) {
        newAchievements.push('xp_10000');
      }

      return {
        ...prev,
        xp: newXp,
        coins: newCoins,
        wordProgress: newProgress,
        achievements: newAchievements,
      };
    });
  }, []);

  const toggleBookmark = useCallback((wordId) => {
    setState((prev) => {
      const bookmarked = prev.bookmarkedWordIds.includes(wordId)
        ? prev.bookmarkedWordIds.filter((id) => id !== wordId)
        : [...prev.bookmarkedWordIds, wordId];
      return {
        ...prev,
        bookmarkedWordIds: bookmarked,
      };
    });
  }, []);

  const recordQuizAttempt = useCallback((levelId, scorePercent) => {
    const isPass = scorePercent >= 70; 
    const xpGained = isPass ? 150 : 30;
    const coinsGained = isPass ? 30 : 5;

    setState((prev) => {
      const existing = prev.levelAttempts[levelId];
      const bestScore = Math.max(existing?.score || 0, scorePercent);
      const passed = existing?.passed || isPass;

      const updatedAttempts = {
        ...prev.levelAttempts,
        [levelId]: {
          score: bestScore,
          passed,
          date: new Date().toISOString(),
        },
      };

      let nextUnlocked = prev.unlockedLevel;
      if (isPass && levelId === prev.unlockedLevel && prev.unlockedLevel < PREP_STAGES.length) {
        nextUnlocked = prev.unlockedLevel + 1;
      }

      const newXp = prev.xp + xpGained;
      const newCoins = prev.coins + coinsGained;
      const newAchievements = [...prev.achievements];
      if (isPass && !newAchievements.includes(`stage_${levelId}_passed`)) {
        newAchievements.push(`stage_${levelId}_passed`);
      }
      if (scorePercent === 100 && !newAchievements.includes('perfect_quiz')) {
        newAchievements.push('perfect_quiz');
      }
      if (newXp >= 1000 && !newAchievements.includes('xp_1000')) {
        newAchievements.push('xp_1000');
      }
      if (newXp >= 5000 && !newAchievements.includes('xp_5000')) {
        newAchievements.push('xp_5000');
      }
      if (newXp >= 10000 && !newAchievements.includes('xp_10000')) {
        newAchievements.push('xp_10000');
      }

      return {
        ...prev,
        xp: newXp,
        coins: newCoins,
        levelAttempts: updatedAttempts,
        unlockedLevel: nextUnlocked,
        achievements: newAchievements,
      };
    });
  }, []);

  const recordUnitQuizAttempt = useCallback((stageId, unitId, scorePercent) => {
    const isPass = scorePercent >= 70;
    const xpGained = isPass ? 80 : 20;
    const coinsGained = isPass ? 15 : 3;

    setState((prev) => {
      const key = `${stageId}.${unitId}`;
      const existing = prev.unitAttempts?.[key];
      const bestScore = Math.max(existing?.score || 0, scorePercent);
      const passed = existing?.passed || isPass;

      const updatedUnitAttempts = {
        ...(prev.unitAttempts || {}),
        [key]: {
          score: bestScore,
          passed,
          date: new Date().toISOString(),
        },
      };

      const newXp = prev.xp + xpGained;
      const newCoins = prev.coins + coinsGained;
      const newAchievements = [...(prev.achievements || [])];
      if (scorePercent === 100 && !newAchievements.includes('perfect_quiz')) {
        newAchievements.push('perfect_quiz');
      }

      return {
        ...prev,
        xp: newXp,
        coins: newCoins,
        unitAttempts: updatedUnitAttempts,
        achievements: newAchievements,
      };
    });
  }, []);

  const recordQuizWordMastered = useCallback((wordId) => {
    const numId = Number(wordId);
    if (!numId) return;

    setState((prev) => {
      const currentList = prev.quizMasteredWordIds || [];
      if (currentList.includes(numId)) return prev;

      const updatedList = [...currentList, numId];
      const currentCard = prev.wordProgress[numId] || {
        easinessFactor: 2.5,
        repetitionCount: 0,
        intervalDays: 0,
        nextReviewAt: null,
        masteryScore: 0,
        status: 'unlearned',
      };

      const newProgress = {
        ...prev.wordProgress,
        [numId]: {
          ...currentCard,
          status: 'mastered',
          masteryScore: 100,
          repetitionCount: Math.max(currentCard.repetitionCount || 0, 4),
        }
      };

      const masteredCount = updatedList.length;
      const newAchievements = [...(prev.achievements || [])];
      if (masteredCount >= 10 && !newAchievements.includes('mastered_10')) {
        newAchievements.push('mastered_10');
      }
      if (masteredCount >= 50 && !newAchievements.includes('mastered_50')) {
        newAchievements.push('mastered_50');
      }

      return {
        ...prev,
        quizMasteredWordIds: updatedList,
        wordProgress: newProgress,
        achievements: newAchievements,
      };
    });
  }, []);

  const markWordMastered = recordQuizWordMastered;

  const markWordLearning = useCallback((wordId) => {
    setState((prev) => {
      const currentCard = prev.wordProgress[wordId] || {
        easinessFactor: 2.5,
        repetitionCount: 0,
        intervalDays: 0,
        nextReviewAt: null,
        masteryScore: 0,
        status: 'unlearned',
      };
      
      const newProgress = {
        ...prev.wordProgress,
        [wordId]: {
          ...currentCard,
          status: 'learning',
          masteryScore: 20,
          repetitionCount: 1,
        }
      };

      const newXp = prev.xp + 5;
      const newAchievements = [...prev.achievements];
      if (newXp >= 1000 && !newAchievements.includes('xp_1000')) {
        newAchievements.push('xp_1000');
      }
      if (newXp >= 5000 && !newAchievements.includes('xp_5000')) {
        newAchievements.push('xp_5000');
      }
      if (newXp >= 10000 && !newAchievements.includes('xp_10000')) {
        newAchievements.push('xp_10000');
      }

      return {
        ...prev,
        xp: newXp,
        wordProgress: newProgress,
        achievements: newAchievements,
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const resetWordProgress = useCallback((wordIds) => {
    setState((prev) => {
      const idsToRemove = new Set(wordIds.map(Number));
      const newProgress = { ...prev.wordProgress };
      wordIds.forEach(id => {
        if (newProgress[id]) {
          newProgress[id] = {
            ...newProgress[id],
            status: 'unlearned',
            masteryScore: 0,
            repetitionCount: 0,
          };
        }
      });
      return {
        ...prev,
        quizMasteredWordIds: (prev.quizMasteredWordIds || []).filter(id => !idsToRemove.has(id)),
        wordProgress: newProgress
      };
    });
  }, []);

  // Stage and word mastery is strictly measured by quizzes (not flashcard study)
  const masteredWordIds = Array.from(new Set(state.quizMasteredWordIds || [])).map(Number);
  
  const learningWordIds = Object.keys(state.wordProgress).filter(
    (id) => state.wordProgress[id].status === 'learning' || state.wordProgress[id].status === 'reviewing' || state.wordProgress[id].status === 'relearning'
  ).map(Number);

  const syncFromCloud = useCallback((cloudData) => {
    if (!cloudData) return;
    setState((prev) => {
      // Intelligently merge cloud data with local device state
      const mergedXp = Math.max(Number(cloudData.xp) || 0, Number(prev.xp) || 0);
      const mergedCoins = Math.max(Number(cloudData.coins) || 0, Number(prev.coins) || 0);
      const mergedLevel = Math.max(Number(cloudData.unlockedLevel) || 1, Number(prev.unlockedLevel) || 1);
      const mergedStreak = Math.max(Number(cloudData.streak) || 0, Number(prev.streak) || 0);
      const mergedBookmarks = Array.from(new Set([...(prev.bookmarkedWordIds || []), ...(cloudData.bookmarkedWordIds || [])]));
      const mergedQuizMastered = Array.from(new Set([...(prev.quizMasteredWordIds || []), ...(cloudData.quizMasteredWordIds || [])])).map(Number);
      const mergedLevelAttempts = { ...(cloudData.levelAttempts || {}), ...(prev.levelAttempts || {}) };
      const mergedUnitAttempts = { ...(cloudData.unitAttempts || {}), ...(prev.unitAttempts || {}) };
      const mergedWordProgress = { ...(cloudData.wordProgress || {}), ...(prev.wordProgress || {}) };
      const mergedAchievements = Array.from(new Set([...(prev.achievements || []), ...(cloudData.achievements || [])]));

      return {
        ...prev,
        xp: mergedXp,
        coins: mergedCoins,
        unlockedLevel: mergedLevel,
        streak: mergedStreak,
        bookmarkedWordIds: mergedBookmarks,
        quizMasteredWordIds: mergedQuizMastered,
        levelAttempts: mergedLevelAttempts,
        unitAttempts: mergedUnitAttempts,
        wordProgress: mergedWordProgress,
        achievements: mergedAchievements,
        lastActiveDate: cloudData.lastActiveDate || prev.lastActiveDate
      };
    });
  }, []);

  return {
    ...state,
    isQuizActive,
    setIsQuizActive,
    masteredWordIds,
    learningWordIds,
    addXp,
    addCoins,
    deductCoins,
    submitSM2Review,
    toggleBookmark,
    recordQuizAttempt,
    recordUnitQuizAttempt,
    recordQuizWordMastered,
    isUnitUnlocked: (stageId, unitNum) => checkIsUnitUnlocked(stageId, unitNum, state),
    isStageExamUnlocked: (stageId) => checkIsStageExamUnlocked(stageId, state),
    resetProgress,
    resetWordProgress,
    markWordMastered,
    markWordLearning,
    syncFromCloud,
  };
}
