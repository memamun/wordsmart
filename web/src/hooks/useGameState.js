import { useState, useEffect, useCallback } from 'react';

import { defaultProgress } from '../state/progress.js';
import { useProgressStore } from './useProgressStore.js';

import { PREP_STAGES, checkIsUnitUnlocked, checkIsStageExamUnlocked, calculateSM2 } from '../state/learning.js';
export { PREP_STAGES, checkIsUnitUnlocked, checkIsStageExamUnlocked, getUnitsCountForStage } from '../state/learning.js';
import { getPlayerLevel, calculateEarnedBaseline } from '../state/rewards.js';

function computeXpAchievements(newXp, currentAchievements = []) {
  const achievements = [...currentAchievements];
  const milestones = [
    { threshold: 500, id: 'xp_500' },
    { threshold: 1000, id: 'xp_1000' },
    { threshold: 2500, id: 'xp_2500' },
    { threshold: 5000, id: 'xp_5000' },
    { threshold: 10000, id: 'xp_10000' },
  ];
  for (const m of milestones) {
    if (newXp >= m.threshold && !achievements.includes(m.id)) {
      achievements.push(m.id);
    }
  }
  return achievements;
}

export function useGameState(uid = null) {
  const { store, snapshot, retrySync } = useProgressStore(uid);
  const state = snapshot.progress;
  const setState = store.update;
  const [isQuizActive, setIsQuizActive] = useState(false);

  // Wait for restoration before recording today's activity against the correct snapshot,
  // and ensure user's earned XP and Coins match or exceed their baseline.
  useEffect(() => {
    if (snapshot.status === 'ready' || snapshot.status === 'local') {
      updateStreak();
      const baseline = calculateEarnedBaseline(state);
      if (state.xp < baseline.minXp || state.coins < baseline.minCoins) {
        setState((prev) => {
          const b = calculateEarnedBaseline(prev);
          const newXp = Math.max(prev.xp, b.minXp);
          const newCoins = Math.max(prev.coins, b.minCoins);
          const newAchievements = computeXpAchievements(newXp, prev.achievements);
          return {
            ...prev,
            xp: newXp,
            coins: newCoins,
            achievements: newAchievements,
          };
        });
      }
    }
  }, [snapshot.status]);

  const addXp = useCallback((amount) => {
    if (!Number.isSafeInteger(amount) || amount <= 0) return;
    setState((prev) => {
      const newXp = prev.xp + amount;
      const newAchievements = computeXpAchievements(newXp, prev.achievements);
      return {
        ...prev,
        xp: newXp,
        achievements: newAchievements,
      };
    });
  }, []);

  const addAchievement = useCallback((achievementId) => {
    if (!achievementId) return;
    setState((prev) => {
      const list = prev.achievements || [];
      if (list.includes(achievementId)) return prev;
      return {
        ...prev,
        achievements: [...list, achievementId],
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
      
      // Flashcards are a self-study spaced repetition memory tool.
      // XP is strictly reserved for verified quiz mastery (not passive card flipping).
      const coinsGained = rating === 5 ? 1 : 0;
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

      return {
        ...prev,
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

    setState((prev) => {
      const existing = prev.levelAttempts?.[levelId];
      const previousBestScore = existing?.score || 0;
      const wasAlreadyPassed = Boolean(existing?.passed);

      let xpGained = 0;
      let coinsGained = 0;

      if (!wasAlreadyPassed && isPass) {
        // First-time stage exam clearance milestone
        const accuracyBonus = scorePercent === 100 ? 50 : scorePercent >= 90 ? 30 : 0;
        xpGained = 120 + accuracyBonus;
        coinsGained = 30;
      } else if (wasAlreadyPassed && scorePercent > previousBestScore) {
        // High score improvement on stage exam: reward accuracy bonus difference
        const prevBonus = previousBestScore === 100 ? 50 : previousBestScore >= 90 ? 30 : 0;
        const newBonus = scorePercent === 100 ? 50 : scorePercent >= 90 ? 30 : 0;
        xpGained = Math.max(0, newBonus - prevBonus);
        coinsGained = 10;
      }
      // Repetitions without score improvement or failed attempts grant 0 XP to prevent farming.

      const bestScore = Math.max(previousBestScore, scorePercent);
      const passed = wasAlreadyPassed || isPass;

      const updatedAttempts = {
        ...(prev.levelAttempts || {}),
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
      let newAchievements = [...(prev.achievements || [])];
      if (isPass && !newAchievements.includes(`stage_${levelId}_passed`)) {
        newAchievements.push(`stage_${levelId}_passed`);
      }
      if (scorePercent === 100 && !newAchievements.includes('perfect_quiz')) {
        newAchievements.push('perfect_quiz');
      }
      newAchievements = computeXpAchievements(newXp, newAchievements);

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

    setState((prev) => {
      const key = `${stageId}.${unitId}`;
      const existing = prev.unitAttempts?.[key];
      const previousBestScore = existing?.score || 0;
      const wasAlreadyPassed = Boolean(existing?.passed);

      let xpGained = 0;
      let coinsGained = 0;

      if (!wasAlreadyPassed && isPass) {
        // First-time unit quiz pass milestone
        const accuracyBonus = scorePercent === 100 ? 25 : scorePercent >= 90 ? 15 : 0;
        xpGained = 50 + accuracyBonus;
        coinsGained = 15;
      } else if (wasAlreadyPassed && scorePercent > previousBestScore) {
        // High score improvement: award accuracy bonus difference
        const prevBonus = previousBestScore === 100 ? 25 : previousBestScore >= 90 ? 15 : 0;
        const newBonus = scorePercent === 100 ? 25 : scorePercent >= 90 ? 15 : 0;
        xpGained = Math.max(0, newBonus - prevBonus);
        coinsGained = 5;
      }
      // Repetitions without score improvement or failed attempts grant 0 XP.

      const bestScore = Math.max(previousBestScore, scorePercent);
      const passed = wasAlreadyPassed || isPass;

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
      let newAchievements = [...(prev.achievements || [])];
      if (scorePercent === 100 && !newAchievements.includes('perfect_quiz')) {
        newAchievements.push('perfect_quiz');
      }
      newAchievements = computeXpAchievements(newXp, newAchievements);

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
      let newAchievements = [...(prev.achievements || [])];
      if (masteredCount >= 10 && !newAchievements.includes('mastered_10')) {
        newAchievements.push('mastered_10');
      }
      if (masteredCount >= 50 && !newAchievements.includes('mastered_50')) {
        newAchievements.push('mastered_50');
      }

      // First-time word mastery reward: 10 XP per unique word answered correctly in a quiz
      const newXp = prev.xp + 10;
      const newCoins = prev.coins + 2;
      newAchievements = computeXpAchievements(newXp, newAchievements);

      return {
        ...prev,
        xp: newXp,
        coins: newCoins,
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

      // Passive flashcard viewing / learning marks grant 0 XP
      return {
        ...prev,
        wordProgress: newProgress,
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

  // Word mastery includes quizMasteredWordIds and any active mastered wordProgress entries
  const masteredWordIds = Array.from(new Set([
    ...(state.quizMasteredWordIds || []),
    ...Object.entries(state.wordProgress || {})
      .filter(([, p]) => p?.status === 'mastered')
      .map(([id]) => Number(id))
  ])).filter(id => Number.isSafeInteger(id) && id > 0);
  
  const learningWordIds = Object.keys(state.wordProgress).filter(
    (id) => state.wordProgress[id].status === 'learning' || state.wordProgress[id].status === 'reviewing' || state.wordProgress[id].status === 'relearning'
  ).map(Number);

  const playerLevelInfo = getPlayerLevel(state.xp);

  return {
    ...state,
    playerLevelInfo,
    playerLevel: playerLevelInfo.level,
    league: playerLevelInfo.league,
    isQuizActive,
    setIsQuizActive,
    masteredWordIds,
    learningWordIds,
    addXp,
    addCoins,
    deductCoins,
    addAchievement,
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
