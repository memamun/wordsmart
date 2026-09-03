import React, { useState } from 'react';
import { 
  BookA, 
  Repeat, 
  Shuffle, 
  Type, 
  FileText,
  Play,
  Trophy,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { shuffleArray } from '../utils/shuffle.js';
import QuizRunner from './QuizRunner.jsx';

export default function VocabDrillsView({ state, wordsData }) {
  const [activeDrillType, setActiveDrillType] = useState(null);
  const [questions, setQuestions] = useState([]);

  const DRILL_MODES = [
    { 
      id: 'synonym_mcq', 
      label: 'Synonyms', 
      icon: Repeat, 
      desc: 'Identify words sharing identical or near-identical connotations.', 
      tag: 'Similar Meanings',
      badgeBg: '#0284C7',
      accentGradient: 'linear-gradient(90deg, #0284C7, #38BDF8)'
    },
    { 
      id: 'antonym_mcq', 
      label: 'Antonyms', 
      icon: Shuffle, 
      desc: 'Recognize contrasting definitions and opposite concepts quickly.', 
      tag: 'Opposite Nuances',
      badgeBg: '#EF4444',
      accentGradient: 'linear-gradient(90deg, #EF4444, #F87171)'
    },
    { 
      id: 'definition_mcq', 
      label: 'Definitions', 
      icon: BookA, 
      desc: 'Match target words to their exact dictionary definitions.', 
      tag: 'Precision Recall',
      badgeBg: '#A855F7',
      accentGradient: 'linear-gradient(90deg, #A855F7, #C084FC)'
    },
    { 
      id: 'sentence_completion', 
      label: 'Sentences', 
      icon: FileText, 
      desc: 'Fill in context-dependent missing words in natural sentences.', 
      tag: 'Context Clues',
      badgeBg: '#3B82F6',
      accentGradient: 'linear-gradient(90deg, #3B82F6, #60A5FA)'
    },
    { 
      id: 'collocation', 
      label: 'Collocations', 
      icon: Type, 
      desc: 'Master natural idiomatic pairings and frequent word unions.', 
      tag: 'Natural Pairings',
      badgeBg: '#10B981',
      accentGradient: 'linear-gradient(90deg, #10B981, #34D399)'
    },
    { 
      id: 'random_mix', 
      label: 'Mixed Arena', 
      icon: Sparkles, 
      desc: 'Rapid-fire blended gauntlet sampling all 5 categories.', 
      tag: 'All-Round Gauntlet',
      badgeBg: '#F59E0B',
      accentGradient: 'linear-gradient(90deg, #F59E0B, #FBBF24)'
    }
  ];

  const generateCollocationQuestions = (count = 10) => {
    const collQuestions = [];
    const availableWords = (wordsData.words || []).filter(w => w.collocations && w.collocations.length > 0);
    const selected = shuffleArray(availableWords).slice(0, count);
    
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
        question: `COLLOCATION: Fill in the natural pairing blank:\n\n"${sentence}"`,
        options: shuffleArray([wordObj.word, ...distractors]),
        correct_answer: wordObj.word,
        bengali_clue: wordObj.bengali_meaning || 'ক্লু নেই।',
        mnemonic: wordObj.mnemonic || 'কোনো নেমোনিক নেই।',
        explanation: `${wordObj.word.toUpperCase()}: ${wordObj.definition || ''}`
      });
    });
    return collQuestions;
  };

  const formatCategoryQuestions = (typeId, count = 10) => {
    const drills = wordsData.vocabDrills || [];
    const validDrills = drills.filter(d => d[typeId] != null);
    
    return shuffleArray(validDrills)
      .slice(0, count)
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
            promptText = `Which word matches the definition:\n\n"${item.word || item.definition || ''}"?`;
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
  };

  const startDrill = (typeId) => {
    let formattedQuestions = [];

    if (typeId === 'collocation') {
      formattedQuestions = generateCollocationQuestions(10);
    } else if (typeId === 'random_mix') {
      const syn = formatCategoryQuestions('synonym_mcq', 2);
      const ant = formatCategoryQuestions('antonym_mcq', 2);
      const def = formatCategoryQuestions('definition_mcq', 2);
      const sen = formatCategoryQuestions('sentence_completion', 2);
      const col = generateCollocationQuestions(2);
      formattedQuestions = shuffleArray([...syn, ...ant, ...def, ...sen, ...col]);
    } else {
      formattedQuestions = formatCategoryQuestions(typeId, 10);
    }

    if (formattedQuestions.length === 0) return;

    setQuestions(formattedQuestions);
    setActiveDrillType(typeId);
  };

  return (
    <div className="animate-fade quiz-view-container" style={{ padding: '2rem 1.25rem', maxWidth: '1120px', margin: '0 auto' }}>
      {!activeDrillType ? (
        <div>
          {/* Header Banner */}
          <div style={{ marginBottom: '2.25rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 213, 79, 0.15)',
              border: '1.5px solid var(--theme-yellow)',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              fontWeight: '900',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '0.85rem'
            }}>
              <Zap size={14} color="var(--theme-yellow)" fill="var(--theme-yellow)" />
              <span>Targeted Practice • Rapid Micro-Drills</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontFamily: 'var(--font-title)',
              fontWeight: '900',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 0.5rem 0'
            }}>
              Vocab Micro-Drills
            </h1>

            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              maxWidth: '680px',
              lineHeight: '1.6',
              margin: 0,
              fontWeight: '500'
            }}>
              Sharpen your core linguistic instincts with fast 10-question micro-drills. Pick any category or test your all-round mastery in the Mixed Arena.
            </p>
          </div>

          {/* Micro-Drills Grid */}
          <div className="drill-grid">
            {DRILL_MODES.map((mode) => {
              const Icon = mode.icon;

              return (
                <div 
                  key={mode.id}
                  onClick={() => startDrill(mode.id)}
                  className="drill-card"
                >
                  {/* Top Dynamic Accent Line */}
                  <div style={{ height: '5px', width: '100%', background: mode.accentGradient }} />

                  {/* Card Header */}
                  <div className="drill-card-header">
                    <div 
                      className="drill-icon-badge" 
                      style={{ backgroundColor: mode.badgeBg, color: '#FFFFFF' }}
                    >
                      <Icon size={24} strokeWidth={2.5} />
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1.5px solid var(--border-muted)',
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      color: 'var(--text-secondary)'
                    }}>
                      <Target size={12} color="var(--theme-yellow)" />
                      <span>10 Qs</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="drill-card-body">
                    <div>
                      <div style={{
                        fontSize: '0.72rem',
                        fontWeight: '900',
                        color: mode.badgeBg,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: '0.25rem'
                      }}>
                        {mode.tag}
                      </div>

                      <h3 style={{
                        fontSize: '1.4rem',
                        fontFamily: 'var(--font-title)',
                        fontWeight: '900',
                        color: 'var(--text-primary)',
                        margin: '0 0 0.4rem 0'
                      }}>
                        {mode.label}
                      </h3>

                      <p style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.5',
                        margin: 0
                      }}>
                        {mode.desc}
                      </p>
                    </div>

                    <button 
                      className="drill-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        startDrill(mode.id);
                      }}
                    >
                      <Play size={15} fill="#000000" />
                      <span>Start {mode.label} Drill</span>
                    </button>
                  </div>
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
