export function resolveDetailWord(value, list, allWords = []) {
  if (!value) return null;
  const wrapped = value.word && typeof value.word === 'object';
  const word = wrapped ? value.word : value;
  if (!word || typeof word.word !== 'string') return null;
  return { word, list: (wrapped ? value.list : null) || list || allWords };
}
