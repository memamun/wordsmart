import { useState, useEffect, useCallback } from 'react';

import { defaultProgress } from '../state/progress.js';
import { useProgressStore } from './useProgressStore.js';

import { PREP_STAGES, checkIsUnitUnlocked, checkIsStageExamUnlocked, calculateSM2 } from '../state/learning.js';
export { PREP_STAGES, checkIsUnitUnlocked, checkIsStageExamUnlocked, getUnitsCountForStage } from '../state/learning.js';

export function useGameState(uid = null) {
  const { store, snapshot, retrySync } = useProgressStore(uid);
  const state = snapshot.progress;
  const setState = store.update;
  const [isQuizActive, setIsQuizActive] = useState(false);

  // Wait for restoration before recording today's activity against the correct snapshot.
  useEffect(() => {
    if (snapshot.status === 'ready' || snapshot.status === 'local') updateStreak();
  }, [snapshot.status]);

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
    if (!Number.isSafeInteger(amount) || amount <= 0) return false;
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
    setState(defaultProgress());
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
    syncStatus: snapshot.status,
    syncError: snapshot.error,
    storageError: snapshot.storageError,
    resolveSyncConflict: store.resolveConflict,
    retrySync,
  };
}
