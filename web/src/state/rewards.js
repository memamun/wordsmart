import { PREP_STAGES, getUnitsCountForStage } from './learning.js';

// ===============================================================
// Leagues & Tiers Configuration
// ===============================================================
export const LEAGUES = [
  { id: 'bronze', name: 'Bronze League', minXp: 0, maxXp: 999, color: '#CD7F32', badge: '🥉', tier: 'Bronze' },
  { id: 'silver', name: 'Silver League', minXp: 1000, maxXp: 2999, color: '#A0AEC0', badge: '🥈', tier: 'Silver' },
  { id: 'gold', name: 'Gold League', minXp: 3000, maxXp: 5999, color: '#FFD700', badge: '🥇', tier: 'Gold' },
  { id: 'platinum', name: 'Platinum League', minXp: 6000, maxXp: 9999, color: '#00E5FF', badge: '💎', tier: 'Platinum' },
  { id: 'diamond', name: 'Diamond League', minXp: 10000, maxXp: 19999, color: '#A855F7', badge: '💠', tier: 'Diamond' },
  { id: 'master', name: 'Master League', minXp: 20000, maxXp: Infinity, color: '#EC4899', badge: '👑', tier: 'Master' },
];

export const PLAYER_TITLES = [
  { maxLevel: 2, title: 'Word Novice' },
  { maxLevel: 4, title: 'Vocabulary Apprentice' },
  { maxLevel: 6, title: 'Word Explorer' },
  { maxLevel: 9, title: 'Etymologist' },
  { maxLevel: 13, title: 'Lexicon Adept' },
  { maxLevel: 18, title: 'Linguistic Knight' },
  { maxLevel: 24, title: 'Vocabulary Sage' },
  { maxLevel: 32, title: 'Master of Words' },
  { maxLevel: Infinity, title: 'Grandmaster of Lexicon' },
];

export function getLeague(xp = 0) {
  const safeXp = Math.max(0, Number(xp) || 0);
  return LEAGUES.find(l => safeXp >= l.minXp && (l.maxXp === Infinity || safeXp <= l.maxXp)) || LEAGUES[0];
}

/**
 * Calculates progressive player level from total XP.
 * Level 1 starts at 0 XP.
 * Level curve: base 150 XP for level 1->2, compounding by 15% each level.
 */
export function getPlayerLevel(xp = 0) {
  const safeXp = Math.max(0, Number(xp) || 0);
  let level = 1;
  let threshold = 150;
  let totalXpRequired = 0;

  while (safeXp >= totalXpRequired + threshold && level < 100) {
    totalXpRequired += threshold;
    level += 1;
    threshold = Math.round(150 * Math.pow(1.15, level - 1));
  }

  const currentLevelXp = safeXp - totalXpRequired;
  const xpToNextLevel = Math.max(0, threshold - currentLevelXp);
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXp / threshold) * 100)));
  const league = getLeague(safeXp);
  const titleObj = PLAYER_TITLES.find(t => level <= t.maxLevel) || PLAYER_TITLES[PLAYER_TITLES.length - 1];

  return {
    level,
    title: titleObj.title,
    league,
    currentLevelXp,
    nextLevelThreshold: threshold,
    xpToNextLevel,
    progressPercent,
  };
}

/**
 * Daily Streak Multiplier:
 * Rewards consistent daily learners with bonus XP multipliers.
 */
export function getStreakMultiplier(streak = 0) {
  const s = Math.max(0, Number(streak) || 0);
  if (s >= 30) return 1.25; // 25% bonus for 30+ days
  if (s >= 14) return 1.15; // 15% bonus for 14+ days
  if (s >= 7)  return 1.10; // 10% bonus for 7+ days
  if (s >= 3)  return 1.05; // 5% bonus for 3+ days
  return 1.0;
}

/**
 * Milestone streak coins awarded when crossing key daily streak days.
 */
export function getStreakMilestoneCoins(streak = 0) {
  const s = Number(streak) || 0;
  if (s === 30) return 150;
  if (s === 14) return 60;
  if (s === 7) return 30;
  if (s === 3) return 15;
  return 0;
}

export function computeXpAchievements(newXp, currentAchievements = []) {
  const achievements = [...currentAchievements];
  const milestones = [
    { threshold: 500, id: 'xp_500' },
    { threshold: 1000, id: 'xp_1000' },
    { threshold: 2500, id: 'xp_2500' },
    { threshold: 5000, id: 'xp_5000' },
    { threshold: 10000, id: 'xp_10000' },
    { threshold: 20000, id: 'xp_20000' },
    { threshold: 50000, id: 'xp_50000' },
  ];
  for (const m of milestones) {
    if (newXp >= m.threshold && !achievements.includes(m.id)) {
      achievements.push(m.id);
    }
  }
  return achievements;
}

/**
 * Recovers or validates earned baseline XP & Coins from existing learning artifacts
 * (mastered words, passed unit quizzes, passed stage exams, achievements).
 * Used to ensure users who mastered words never get stuck at 0 XP.
 */
export function calculateEarnedBaseline(progress = {}) {
  const masteredList = Array.isArray(progress.quizMasteredWordIds) ? progress.quizMasteredWordIds : [];
  const levelAttempts = progress.levelAttempts || {};
  const unitAttempts = progress.unitAttempts || {};

  const allMasteredSet = new Set([
    ...masteredList,
    ...Object.entries(progress.wordProgress || {})
      .filter(([, p]) => p?.status === 'mastered')
      .map(([id]) => Number(id))
  ]);
  const validMastered = Array.from(allMasteredSet).filter(id => Number.isSafeInteger(id) && id > 0);

  let earnedXp = validMastered.length * 10;
  let earnedCoins = 100; // Starting allowance

  for (const attempt of Object.values(levelAttempts)) {
    if (attempt?.passed) {
      earnedXp += 120;
      earnedCoins += 30;
      if (attempt.score === 100) {
        earnedXp += 50;
        earnedCoins += 10;
      } else if (attempt.score >= 90) {
        earnedXp += 30;
      }
    }
  }

  for (const attempt of Object.values(unitAttempts)) {
    if (attempt?.passed) {
      earnedXp += 50;
      earnedCoins += 15;
      if (attempt.score === 100) {
        earnedXp += 25;
        earnedCoins += 5;
      } else if (attempt.score >= 90) {
        earnedXp += 15;
      }
    }
  }

  return {
    minXp: earnedXp,
    minCoins: earnedCoins,
  };
}

export function recordQuizAttempt(prev, levelId, scorePercent) {
  levelId = Number(levelId);
  if (!Number.isInteger(levelId) || levelId < 1 || levelId > 8 || !Number.isFinite(scorePercent) || scorePercent < 0 || scorePercent > 100) return prev;

  const isPass = scorePercent >= 70;

  const existing = prev.levelAttempts?.[levelId];
  const previousBestScore = existing?.score || 0;
  const wasAlreadyPassed = Boolean(existing?.passed);

  let rawXpGained = 0;
  let coinsGained = 0;

  if (!wasAlreadyPassed && isPass) {
    // First-time stage exam clearance milestone
    const accuracyBonus = scorePercent === 100 ? 50 : scorePercent >= 90 ? 30 : 0;
    rawXpGained = 120 + accuracyBonus;
    coinsGained = 30 + (scorePercent === 100 ? 10 : 0);
  } else if (wasAlreadyPassed && scorePercent > previousBestScore) {
    // High score improvement on stage exam: reward accuracy bonus difference
    const prevBonus = previousBestScore === 100 ? 50 : previousBestScore >= 90 ? 30 : 0;
    const newBonus = scorePercent === 100 ? 50 : scorePercent >= 90 ? 30 : 0;
    rawXpGained = Math.max(0, newBonus - prevBonus);
    coinsGained = 10;
  }

  // Apply streak multiplier (if active streak >= 3)
  const multiplier = getStreakMultiplier(prev.streak);
  const xpGained = Math.round(rawXpGained * multiplier);

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

  // Level up detection and bonus coins (+50 coins per player level gained!)
  const oldLevelInfo = getPlayerLevel(prev.xp);
  const newLevelInfo = getPlayerLevel(newXp);
  const levelsGained = Math.max(0, newLevelInfo.level - oldLevelInfo.level);
  const levelUpBonusCoins = levelsGained * 50;

  const newCoins = prev.coins + coinsGained + levelUpBonusCoins;

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
    playerLevel: newLevelInfo.level,
    levelAttempts: updatedAttempts,
    unlockedLevel: nextUnlocked,
    achievements: newAchievements,
  };
}

export function recordUnitQuizAttempt(prev, stageId, unitId, scorePercent) {
  stageId = Number(stageId);
  unitId = Number(unitId);
  if (!Number.isInteger(stageId) || stageId < 1 || stageId > 8 || !Number.isInteger(unitId) || unitId < 1 || unitId > getUnitsCountForStage(stageId) || !Number.isFinite(scorePercent) || scorePercent < 0 || scorePercent > 100) return prev;

  const isPass = scorePercent >= 70;

  const key = `${stageId}.${unitId}`;
  const existing = prev.unitAttempts?.[key];
  const previousBestScore = existing?.score || 0;
  const wasAlreadyPassed = Boolean(existing?.passed);

  let rawXpGained = 0;
  let coinsGained = 0;

  if (!wasAlreadyPassed && isPass) {
    // First-time unit quiz pass milestone
    const accuracyBonus = scorePercent === 100 ? 25 : scorePercent >= 90 ? 15 : 0;
    rawXpGained = 50 + accuracyBonus;
    coinsGained = 15 + (scorePercent === 100 ? 5 : 0);
  } else if (wasAlreadyPassed && scorePercent > previousBestScore) {
    // High score improvement: award accuracy bonus difference
    const prevBonus = previousBestScore === 100 ? 25 : previousBestScore >= 90 ? 15 : 0;
    const newBonus = scorePercent === 100 ? 25 : scorePercent >= 90 ? 15 : 0;
    rawXpGained = Math.max(0, newBonus - prevBonus);
    coinsGained = 5;
  }

  // Apply streak multiplier
  const multiplier = getStreakMultiplier(prev.streak);
  const xpGained = Math.round(rawXpGained * multiplier);

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

  // Level up detection and bonus coins (+50 coins per player level gained!)
  const oldLevelInfo = getPlayerLevel(prev.xp);
  const newLevelInfo = getPlayerLevel(newXp);
  const levelsGained = Math.max(0, newLevelInfo.level - oldLevelInfo.level);
  const levelUpBonusCoins = levelsGained * 50;

  const newCoins = prev.coins + coinsGained + levelUpBonusCoins;

  let newAchievements = [...(prev.achievements || [])];
  if (scorePercent === 100 && !newAchievements.includes('perfect_quiz')) {
    newAchievements.push('perfect_quiz');
  }
  newAchievements = computeXpAchievements(newXp, newAchievements);

  return {
    ...prev,
    xp: newXp,
    coins: newCoins,
    playerLevel: newLevelInfo.level,
    unitAttempts: updatedUnitAttempts,
    achievements: newAchievements,
  };
}

export function recordQuizWordMastered(prev, wordId) {
  const numId = Number(wordId);
  if (!Number.isSafeInteger(numId) || numId <= 0) return prev;

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
      quizXpAwarded: true,
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
  if (masteredCount >= 100 && !newAchievements.includes('mastered_100')) {
    newAchievements.push('mastered_100');
  }

  // First-time word mastery reward: 10 XP per unique word answered correctly in a quiz
  // Plus 2 coins per word mastered
  const multiplier = getStreakMultiplier(prev.streak);
  const xpGained = currentCard.quizXpAwarded ? 0 : Math.round(10 * multiplier);
  const newXp = prev.xp + xpGained;
  const newCoins = prev.coins + (currentCard.quizXpAwarded ? 0 : 2);

  const levelInfo = getPlayerLevel(newXp);
  newAchievements = computeXpAchievements(newXp, newAchievements);

  return {
    ...prev,
    xp: newXp,
    coins: newCoins,
    playerLevel: levelInfo.level,
    quizMasteredWordIds: updatedList,
    wordProgress: newProgress,
    achievements: newAchievements,
  };
}

export function quickMatchReward(achievements, quiz) {
  const id = quiz.quiz_id ?? quiz.id ?? quiz.title;
  const key = `quickmatch_${id}`;
  const alreadyEarned = achievements.includes(key);
  return { key, xp: alreadyEarned ? 0 : 15, coins: alreadyEarned ? 1 : 5 };
}

export function blitzReward(score) {
  return { xp: Math.min(15, Math.floor(score / 30)), coins: Math.min(5, Math.floor(score / 50)) };
}
