/**
 * Fisher-Yates (Durstenfeld) Uniform Shuffle Algorithm
 * Guarantees unbiased random distribution for quiz options, card decks, and matching games.
 */
export function shuffleArray(array) {
  if (!Array.isArray(array)) return [];
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}
