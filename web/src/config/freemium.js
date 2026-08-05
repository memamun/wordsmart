/**
 * WordSmart Freemium Config
 * Defines which views are free vs. require Google login.
 */

// Views accessible without any login
export const FREE_VIEWS = new Set([
  'dashboard',
  'search',
  'hitparades',
]);

// Unit restriction for Flashcards: only unit 1 is free
export const FREE_FLASHCARD_UNITS = 1;

// Feature display names for the auth gate modal
export const FEATURE_NAMES = {
  flashcards: 'Flashcard Quest',
  review: 'SM-2 Review Deck',
  stories: 'Contextual Stories',
  quizzes: 'Qualification MCQs',
  vocabdrills: 'Vocab Drills',
  quickmatch: 'Quick Match',
  advanced: 'Advanced Quizzes',
  timeblitz: 'Time Blitz',
  specialized: 'Specialized Vocabs',
  allquizzes: 'Quiz Library',
  leaderboard: 'Leaderboard',
};

// Benefit copy shown per-feature in the auth gate
export const FEATURE_BENEFITS = {
  flashcards: 'Unlock all 10 units and track your progress across sessions.',
  review: 'Your SM-2 spaced-repetition schedule syncs across all your devices.',
  stories: 'Read 100+ contextual vocabulary stories crafted for SASS prep.',
  quizzes: 'Practice with 500+ qualification MCQs and track your scores.',
  vocabdrills: 'Drill targeted word lists with instant performance analytics.',
  quickmatch: 'Race against the clock and compete on the leaderboard.',
  advanced: 'Challenge yourself with advanced synonym and usage questions.',
  timeblitz: 'Beat your personal best with timed blitz sessions.',
  specialized: 'Access grammar, idioms, and domain-specific vocabulary packs.',
  allquizzes: 'Browse and replay every quiz in the complete quiz library.',
  leaderboard: 'See how you rank against other WordSmart learners.',
};

/**
 * Returns true if a view is accessible without login.
 * Handles the flashcards special case separately.
 */
export function isViewFree(viewId) {
  return FREE_VIEWS.has(viewId);
}
