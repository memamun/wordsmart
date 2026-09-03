import React, { useState } from 'react';
import { 
  BookA, 
  Repeat, 
  Shuffle, 
  Type, 
  FileText,
  Play,
  Trophy
} from 'lucide-react';
import { shuffleArray } from '../utils/shuffle.js';
import QuizRunner from './QuizRunner.jsx';

export default function VocabDrillsView({ state, wordsData }) {
  const [activeDrillType, setActiveDrillType] = useState(null);
  const [questions, setQuestions] = useState([]);

  const DRILL_MODES = [
    { id: 'synonym_mcq', label: 'Synonyms', icon: Repeat, desc: 'Find words with similar meanings', color: 'hsl(var(--primary))' },
    { id: 'antonym_mcq', label: 'Antonyms', icon: Shuffle, desc: 'Find words with opposite meanings', color: 'hsl(var(--danger))' },
    { id: 'definition_mcq', label: 'Definitions', icon: BookA, desc: 'Match words to their meanings', color: 'hsl(var(--accent-purple))' },
    { id: 'sentence_completion', label: 'Sentences', icon: FileText, desc: 'Fill in the missing word', color: 'hsl(var(--accent-blue))' },
    { id: 'collocation', label: 'Collocations', icon: Type, desc: 'Common word pairings', color: 'hsl(var(--success))' }
  ];

  const generateCollocationQuestions = () => {
    const collQuestions = [];
    const availableWords = (wordsData.words || []).filter(w => w.collocations && w.collocations.length > 0);
    const selected = shuffleArray(availableWords).slice(0, 10);
    
    selected.forEach(wordObj => {
      const coll = wordObj.collocations[Math.floor(Math.random() * wordObj.collocations.length)];
      const regex = new RegExp(`\\b${wordObj.word}\\b`, 'i');
      let sentence = coll.replace(regex, '_______');
      
      if (sentence === coll) {
        sentence = coll.replace(new RegExp(wordObj.word.substring(0, 4), 'i'), '_______');
      }

      const distractors = shuffleArray((wordsData.words || []).filter(w => w.id !== wordObj.id))
        .slice(0, 3)
        .map(w => w.word);

      collQuestions.push({
        question: `Fill in the collocation blank:\n"${sentence}"`,
        options: shuffleArray([wordObj.word, ...distractors]),
        correct_answer: wordObj.word,
        bengali_clue: wordObj.bengali_meaning || 'ক্লু নেই।',
        mnemonic: wordObj.mnemonic || 'কোনো নেমোনিক নেই।',
        explanation: `${wordObj.word.toUpperCase()}: ${wordObj.definition || ''}`
      });
    });
    return collQuestions;
  };

  const startDrill = (typeId) => {
    let formattedQuestions = [];

    if (typeId === 'collocation') {
      formattedQuestions = generateCollocationQuestions();
    } else {
      const drills = wordsData.vocabDrills || [];
      const validDrills = drills.filter(d => d[typeId] != null);
      
      formattedQuestions = shuffleArray(validDrills)
        .slice(0, 10)
        .map(d => {
          const item = d[typeId];
          const targetWord = (wordsData.words || []).find(
            w => w.word.toLowerCase() === (item.word || item.correct_answer || '').toLowerCase()
          );

          let promptText = item.question || '';
          if (!promptText) {
            if (typeId === 'synonym_mcq') {
              promptText = `Which word is a SYNONYM for "${(item.word || '').toUpperCase()}"?`;
            } else if (typeId === 'antonym_mcq') {
              promptText = `Which word is an ANTONYM for "${(item.word || '').toUpperCase()}"?`;
            } else if (typeId === 'definition_mcq') {
              promptText = `Which word matches the definition: "${item.word || item.definition || ''}"?`;
            } else if (typeId === 'sentence_completion') {
              promptText = item.sentence || `Complete the sentence: "${item.word || ''}"`;
            }
          }

          return {
            question: promptText,
            options: item.options ? shuffleArray(item.options) : [],
            correct_answer: item.correct_answer,
            bengali_clue: d.bengali_meaning || targetWord?.bengali_meaning || 'ক্লু নেই।',
            mnemonic: targetWord?.mnemonic || 'কোনো নেমোনিক নেই।',
            explanation: targetWord?.definition ? `${targetWord.word.toUpperCase()}: ${targetWord.definition}` : undefined
          };
        });
    }

    if (formattedQuestions.length === 0) return;

    setQuestions(formattedQuestions);
    setActiveDrillType(typeId);
  };

  return (
    <div className="animate-fade quiz-view-container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {!activeDrillType ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Trophy size={28} color="hsl(var(--primary))" />
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', margin: 0 }}>Vocab Drills</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', lineHeight: '1.5' }}>
            Master vocabulary through targeted micro-drills. Choose a focus area below to begin a rapid-fire practice session.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {DRILL_MODES.map(mode => {
              const Icon = mode.icon;
              return (
                <div 
                  key={mode.id}
                  onClick={() => startDrill(mode.id)}
                  className="card card-hover"
                  style={{ 
                    padding: '1.5rem', 
                    cursor: 'pointer',
                    borderTop: `4px solid ${mode.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ 
                    backgroundColor: 'var(--bg-surface-elevated)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'var(--border-thin)',
                    boxShadow: 'var(--shadow-tiny)',
                    color: mode.color
                  }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', marginBottom: '0.25rem' }}>{mode.label}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{mode.desc}</p>
                  </div>
                  <button className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%' }}>
                    <Play size={14} style={{ marginRight: '0.5rem' }} /> Start Drill
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <QuizRunner
          title="Vocab Micro-Drill"
          subtitle={DRILL_MODES.find(m => m.id === activeDrillType)?.label || 'Practice Drill'}
          questions={questions}
          state={state}
          onFinish={(finalScore, total) => {
            state.addXp(50);
            if (finalScore === total) {
              state.addCoins(10);
            } else {
              state.addCoins(Math.max(1, Math.floor(finalScore / 2)));
            }
          }}
          onQuit={() => setActiveDrillType(null)}
        />
      )}
    </div>
  );
}
