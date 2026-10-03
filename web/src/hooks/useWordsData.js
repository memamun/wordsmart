import { useState, useEffect, useCallback, useMemo } from 'react';
import { shuffleArray } from '../utils/shuffle.js';

// Deterministic pseudo-random shuffle to provide a diverse mix of words across all units (non-sequential)
function seededShuffle(array, seed = 2026) {
  const arr = [...array];
  let s = seed;
  const nextRandom = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useWordsData() {
  const [words, setWords] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [stories, setStories] = useState([]);
  const [hitParades, setHitParades] = useState(null);
  const [specializedVocab, setSpecializedVocab] = useState([]);
  const [vocabDrills, setVocabDrills] = useState([]);
  const [quickQuizzes, setQuickQuizzes] = useState([]);
  const [advancedQuizzes, setAdvancedQuizzes] = useState([]);
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

        // 1. Core vocabulary is required: filter strictly to the 822 main vocabulary words
        const vocabRes = await fetch('/data/core_vocabulary.json');
        if (!vocabRes.ok) throw new Error('Failed to fetch core vocabulary data');
        const vocabData = await vocabRes.json();

        // 822 main vocabulary words (excluding stub auxiliary synonyms/antonyms)
        const mainVocabulary = (vocabData.words || []).filter(w => w.definition && w.id <= 822);
        setWords(mainVocabulary);
        setError(null);
        setLoading(false);

        // 2. Load secondary quiz, drill, and story datasets in background
        Promise.all([
          fetchJson('/data/mcq_quizzes.json', 'MCQ Quizzes'),
          fetchJson('/data/contextual_stories.json', 'Contextual Stories'),
          fetchJson('/data/hit_parades.json', 'Hit Parades'),
          fetchJson('/data/specialized_vocabulary.json', 'Specialized Vocab'),
          fetchJson('/data/vocab_drills.json', 'Vocab Drills'),
          fetchJson('/data/quick_quizzes.json', 'Quick Quizzes'),
          fetchJson('/data/advanced_quizzes.json', 'Advanced Quizzes'),
        ]).then(([quizData, storyData, hitData, specData, vocabDrillsData, quickQuizzesData, advancedQuizzesData]) => {
          setQuizzes(quizData?.quizzes || []);
          setStories(storyData?.stories || []);
          setHitParades(hitData || {});
          setSpecializedVocab(specData?.chapters || []);
          setVocabDrills(vocabDrillsData || []);
          setQuickQuizzes(quickQuizzesData || []);
          setAdvancedQuizzes(advancedQuizzesData || []);
        });
      } catch (err) {
        console.error('Error loading Wordsmart data:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  // Partition 822 words into 41 units: units 0..39 have 20 words each; unit 40 has 22 words.
  // Diverse, non-sequential word learning across the entire vocabulary.
  const unitsData = useMemo(() => {
    if (words.length === 0) return [];
    const shuffled = seededShuffle(words, 2026);
    const units = [];
    for (let i = 0; i < 40; i++) {
      units.push(shuffled.slice(i * 20, (i + 1) * 20));
    }
    units.push(shuffled.slice(40 * 20)); // unit 40 (Unit 10.5) has 22 words
    return units;
  }, [words]);

  // Words partitioned by Stage (1 to 8): Stages 1-7 have 5 units (100 words), Stage 8 has 6 units (122 words)
  const wordsByLevel = useMemo(() => {
    if (unitsData.length === 0) return {};
    const partitioned = {};
    for (let s = 1; s <= 8; s++) {
      const unitCount = s === 8 ? 6 : 5;
      const startGlobal = (s - 1) * 5;
      const stageWords = [];
      for (let u = 0; u < unitCount; u++) {
        if (unitsData[startGlobal + u]) {
          stageWords.push(...unitsData[startGlobal + u]);
        }
      }
      partitioned[s] = stageWords;
    }
    return partitioned;
  }, [unitsData]);

  // Helper to fetch words in a level/stage
  const getWordsForLevel = useCallback((levelId) => {
    return wordsByLevel[levelId] || [];
  }, [wordsByLevel]);

  // Helper to fetch words in a specific Unit (1 to 5/6) of a stage
  const getWordsForUnit = useCallback((levelId, unitNumber) => {
    if (unitsData.length === 0) return [];
    const s = Math.max(1, Math.min(8, Number(levelId) || 1));
    const maxUnits = s === 8 ? 6 : 5;
    const u = Math.max(1, Math.min(maxUnits, Number(unitNumber) || 1));
    const globalIndex = (s - 1) * 5 + (u - 1);
    return unitsData[globalIndex] || [];
  }, [unitsData]);

  // Lookup map of pre-authored questions from mcq_quizzes.json by word
  const questionByWord = useMemo(() => {
    const map = new Map();
    quizzes.forEach(quiz => {
      (quiz.questions || []).forEach(q => {
        if (q.correct_answer) {
          map.set(q.correct_answer.toUpperCase(), q);
        }
      });
    });
    return map;
  }, [quizzes]);

  // Construct Stage Practice Quizzes dynamically matching the exact words of that Stage's units
  const getQuizzesForLevel = useCallback((levelId) => {
    const s = Math.max(1, Math.min(8, Number(levelId) || 1));
    const unitCount = s === 8 ? 6 : 5;
    const stageQuizzes = [];

    // Unit-by-unit practice quizzes
    for (let u = 1; u <= unitCount; u++) {
      const uWords = getWordsForUnit(s, u);
      if (uWords.length === 0) continue;

      const questions = uWords.map((wordObj, idx) => {
        const preAuthored = questionByWord.get(wordObj.word.toUpperCase());
        if (preAuthored) {
          return {
            ...preAuthored,
            question_number: idx + 1,
            wordId: wordObj.id,
            targetWord: wordObj
          };
        }
        return {
          question_number: idx + 1,
          wordId: wordObj.id,
          question: `Which word matches the definition: "${wordObj.definition}"?`,
          options: shuffleArray([wordObj.word.toUpperCase(), 'METICULOUS', 'LUCID', 'CANDID']),
          correct_answer: wordObj.word.toUpperCase(),
          explanation: `"${wordObj.word.toUpperCase()}" means: ${wordObj.definition}.`,
          bengali_clue: wordObj.bengali_meaning || '',
          mnemonic: wordObj.mnemonic || '',
          targetWord: wordObj
        };
      });

      stageQuizzes.push({
        quiz_id: `stage_${s}_unit_${u}`,
        title: `Unit ${s}.${u} Practice Quiz`,
        total_questions: questions.length,
        questions
      });
    }

    // Comprehensive Stage practice quiz
    const stageAllWords = getWordsForLevel(s);
    if (stageAllWords.length > 0) {
      const sampled = shuffleArray(stageAllWords).slice(0, 20);
      const stageQuestions = sampled.map((wordObj, idx) => {
        const preAuthored = questionByWord.get(wordObj.word.toUpperCase());
        if (preAuthored) {
          return {
            ...preAuthored,
            question_number: idx + 1,
            wordId: wordObj.id,
            targetWord: wordObj
          };
        }
        return {
          question_number: idx + 1,
          wordId: wordObj.id,
          question: `Which word matches the definition: "${wordObj.definition}"?`,
          options: shuffleArray([wordObj.word.toUpperCase(), 'METICULOUS', 'LUCID', 'CANDID']),
          correct_answer: wordObj.word.toUpperCase(),
          explanation: `"${wordObj.word.toUpperCase()}" means: ${wordObj.definition}.`,
          bengali_clue: wordObj.bengali_meaning || '',
          mnemonic: wordObj.mnemonic || '',
          targetWord: wordObj
        };
      });

      stageQuizzes.push({
        quiz_id: `stage_${s}_comprehensive`,
        title: `Stage ${s} Comprehensive Drill`,
        total_questions: stageQuestions.length,
        questions: stageQuestions
      });
    }

    return stageQuizzes;
  }, [getWordsForUnit, getWordsForLevel, questionByWord]);

  // Partition the 86 stories into 8 levels
  const storiesByLevel = useMemo(() => {
    if (stories.length === 0) return {};
    
    const partitioned = {};
    const storiesPerLevel = Math.ceil(stories.length / 8);
    
    for (let i = 1; i <= 8; i++) {
      const start = (i - 1) * storiesPerLevel;
      const end = Math.min(i * storiesPerLevel, stories.length);
      partitioned[i] = stories.slice(start, end);
    }
    
    return partitioned;
  }, [stories]);

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

      const options = shuffleArray([rel2, ...distractors]);

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
    vocabDrills,
    quickQuizzes,
    advancedQuizzes,
    loading,
    error,
    getWordsForLevel,
    getWordsForUnit,
    getQuizzesForLevel,
    getStoriesForLevel,
    generateAnalogiesForLevel,
  };
}
