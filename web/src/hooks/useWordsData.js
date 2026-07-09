import { useState, useEffect, useCallback, useMemo } from 'react';

export function useWordsData() {
  const [words, setWords] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [stories, setStories] = useState([]);
  const [hitParades, setHitParades] = useState(null);
  const [specializedVocab, setSpecializedVocab] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);

        // Helper: fetch JSON with graceful fallback
        const fetchJson = async (url, label) => {
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
          } catch (err) {
            console.warn(`[WordSmart] Optional data "${label}" failed to load:`, err.message);
            return null;
          }
        };

        // Core vocabulary is required — fail hard if missing
        const vocabRes = await fetch('/data/core_vocabulary.json');
        if (!vocabRes.ok) throw new Error('Failed to fetch core vocabulary data');
        const vocabData = await vocabRes.json();

        // Load the rest in parallel, gracefully falling back on failure
        const [quizData, storyData, hitData, specData] = await Promise.all([
          fetchJson('/data/mcq_quizzes.json', 'MCQ Quizzes'),
          fetchJson('/data/contextual_stories.json', 'Contextual Stories'),
          fetchJson('/data/hit_parades.json', 'Hit Parades'),
          fetchJson('/data/specialized_vocabulary.json', 'Specialized Vocab'),
        ]);

        setWords(vocabData.words || []);
        setQuizzes(quizData?.quizzes || []);
        setStories(storyData?.stories || []);
        setHitParades(hitData || {});
        setSpecializedVocab(specData?.chapters || []);
        setError(null);
      } catch (err) {
        console.error('Error loading Wordsmart data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  // Partition the 822 core words into 10 levels (stages)
  const wordsByLevel = useMemo(() => {
    if (words.length === 0) return {};

    // Simple deterministic string hashing function
    const getHash = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
    };

    // Filter and shuffle deterministically within difficulty tiers
    const beginnerWords = words
      .filter(w => w.level === 'beginner')
      .sort((a, b) => getHash(a.word) - getHash(b.word));
      
    const intermediateWords = words
      .filter(w => w.level === 'intermediate')
      .sort((a, b) => getHash(a.word) - getHash(b.word));
      
    const advancedWords = words
      .filter(w => w.level === 'advanced')
      .sort((a, b) => getHash(a.word) - getHash(b.word));

    const coreWords = [...beginnerWords, ...intermediateWords, ...advancedWords];
    if (coreWords.length === 0) return {};
    
    const partitioned = {};
    const wordsPerLevel = Math.ceil(coreWords.length / 10); // ~83 words per level
    
    for (let i = 1; i <= 10; i++) {
      const start = (i - 1) * wordsPerLevel;
      const end = Math.min(i * wordsPerLevel, coreWords.length);
      partitioned[i] = coreWords.slice(start, end);
    }
    
    return partitioned;
  }, [words]);

  // Partition the 86 quizzes into 10 levels (~8-9 quizzes per level)
  const quizzesByLevel = useMemo(() => {
    if (quizzes.length === 0) return {};
    
    const partitioned = {};
    const quizzesPerLevel = Math.ceil(quizzes.length / 10); // ~9 quizzes per level
    
    for (let i = 1; i <= 10; i++) {
      const start = (i - 1) * quizzesPerLevel;
      const end = Math.min(i * quizzesPerLevel, quizzes.length);
      partitioned[i] = quizzes.slice(start, end);
    }
    
    return partitioned;
  }, [quizzes]);

  // Partition the 86 stories into 10 levels (~8-9 stories per level)
  const storiesByLevel = useMemo(() => {
    if (stories.length === 0) return {};
    
    const partitioned = {};
    const storiesPerLevel = Math.ceil(stories.length / 10);
    
    for (let i = 1; i <= 10; i++) {
      const start = (i - 1) * storiesPerLevel;
      const end = Math.min(i * storiesPerLevel, stories.length);
      partitioned[i] = stories.slice(start, end);
    }
    
    return partitioned;
  }, [stories]);

  // Helper to fetch words in a level
  const getWordsForLevel = useCallback((levelId) => {
    return wordsByLevel[levelId] || [];
  }, [wordsByLevel]);

  // Helper to fetch words in a specific Unit (1 to 10) of a level
  const getWordsForUnit = useCallback((levelId, unitNumber) => {
    const levelWords = getWordsForLevel(levelId);
    if (levelWords.length === 0) return [];
    
    // Divide the words list into 10 partitions
    const wordsPerUnit = Math.ceil(levelWords.length / 10);
    const start = (unitNumber - 1) * wordsPerUnit;
    const end = Math.min(unitNumber * wordsPerUnit, levelWords.length);
    return levelWords.slice(start, end);
  }, [getWordsForLevel]);

  // Helper to fetch quizzes in a level
  const getQuizzesForLevel = useCallback((levelId) => {
    return quizzesByLevel[levelId] || [];
  }, [quizzesByLevel]);

  // Helper to fetch stories in a level
  const getStoriesForLevel = useCallback((levelId) => {
    return storiesByLevel[levelId] || [];
  }, [storiesByLevel]);

  // Generator: Dynamic Analogy Questions for a level
  const generateAnalogiesForLevel = useCallback((levelId, count = 10) => {
    const levelWords = getWordsForLevel(levelId);
    if (levelWords.length < 5) return [];

    const analogies = [];
    const usedWordIds = new Set();

    const validWords = levelWords.filter(
      (w) => (w.synonyms && w.synonyms.length > 0) || (w.antonyms && w.antonyms.length > 0)
    );

    if (validWords.length < 4) return [];

    for (let i = 0; i < Math.min(count, Math.floor(validWords.length / 2)); i++) {
      const w1 = validWords[Math.floor(Math.random() * validWords.length)];
      if (usedWordIds.has(w1.id)) continue;
      usedWordIds.add(w1.id);

      const isSynonym = w1.synonyms && w1.synonyms.length > 0 ? (w1.antonyms && w1.antonyms.length > 0 ? Math.random() > 0.5 : true) : false;
      
      let rel1 = '';
      if (isSynonym) {
        rel1 = w1.synonyms[Math.floor(Math.random() * w1.synonyms.length)].toUpperCase();
      } else {
        rel1 = w1.antonyms[Math.floor(Math.random() * w1.antonyms.length)].toUpperCase();
      }

      let w2 = validWords[Math.floor(Math.random() * validWords.length)];
      let retry = 0;
      while ((w2.id === w1.id || usedWordIds.has(w2.id) || (isSynonym ? (!w2.synonyms || w2.synonyms.length === 0) : (!w2.antonyms || w2.antonyms.length === 0))) && retry < 10) {
        w2 = validWords[Math.floor(Math.random() * validWords.length)];
        retry++;
      }
      if (w2.id === w1.id) continue;
      usedWordIds.add(w2.id);

      let rel2 = '';
      if (isSynonym) {
        rel2 = w2.synonyms[Math.floor(Math.random() * w2.synonyms.length)].toUpperCase();
      } else {
        rel2 = w2.antonyms[Math.floor(Math.random() * w2.antonyms.length)].toUpperCase();
      }

      const distractors = [];
      while (distractors.length < 3) {
        const randWord = words[Math.floor(Math.random() * words.length)];
        const dist = randWord.word.toUpperCase();
        if (dist !== rel2 && dist !== w2.word.toUpperCase() && dist !== rel1 && dist !== w1.word.toUpperCase() && !distractors.includes(dist)) {
          distractors.push(dist);
        }
      }

      const options = [rel2, ...distractors].sort(() => Math.random() - 0.5);

      analogies.push({
        id: `analogy_${levelId}_${i}`,
        question: `${w1.word.toUpperCase()} : ${rel1} :: ${w2.word.toUpperCase()} : ?`,
        options,
        correct_answer: rel2,
        explanation: `${w1.word.toUpperCase()} and ${rel1} are ${isSynonym ? 'synonyms' : 'antonyms'}. Similarly, ${w2.word.toUpperCase()} and ${rel2} are ${isSynonym ? 'synonyms' : 'antonyms'}.`,
        bengali_clue: `সম্পর্কটি হলো: ${isSynonym ? 'সমার্থক (Synonyms)' : 'বিপরীতার্থক (Antonyms)'}`,
        type: isSynonym ? 'Synonym Analogy' : 'Antonym Analogy'
      });
    }

    return analogies;
  }, [getWordsForLevel, words]);

  return {
    words,
    quizzes,
    stories,
    hitParades,
    specializedVocab,
    loading,
    error,
    getWordsForLevel,
    getWordsForUnit,
    getQuizzesForLevel,
    getStoriesForLevel,
    generateAnalogiesForLevel,
  };
}
