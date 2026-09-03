import React, { useState, useEffect } from 'react';
import { 
  Puzzle, 
  CheckCircle2, 
  RefreshCw, 
  Award, 
  Zap, 
  ArrowLeft,
  AlertTriangle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { shuffleArray } from '../utils/shuffle.js';
import { playCorrectSound, playIncorrectSound } from '../utils/sounds.js';
import { useSpeech } from '../hooks/useSpeech.js';

// Neobrutalist design constants
const NEO_SHADOW = 'var(--shadow-medium)';
const NEO_BORDER = 'var(--border-thick)';
const NEO_RADIUS = '14px';

const COLORS = [
  'var(--theme-red)',
  'var(--theme-blue)',
  'var(--theme-green)',
  'var(--theme-yellow)',
  'var(--theme-purple)',
  'var(--theme-cyan)'
];

export default function QuickMatchView({ state, wordsData }) {
  const [activeQuiz, setActiveQuiz] = useState(null);
  
  // Shuffled items for the active quiz
  const [shuffledWords, setShuffledWords] = useState([]);
  const [shuffledDefs, setShuffledDefs] = useState([]);

  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  
  const [correctMatches, setCorrectMatches] = useState([]); // [wordNumber, ...]
  const [wrongMatch, setWrongMatch] = useState(null); // {word, def}
  const [isFinished, setIsFinished] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const { speak } = useSpeech(0.85);

  // Synchronize active game state globally
  useEffect(() => {
    if (state?.setIsQuizActive) {
      state.setIsQuizActive(!!activeQuiz && !isFinished);
    }
    return () => {
      if (state?.setIsQuizActive) {
        state.setIsQuizActive(false);
      }
    };
  }, [activeQuiz, isFinished, state?.setIsQuizActive]);

  const startQuiz = (quiz) => {
    const sWords = shuffleArray(quiz.matches);
    const sDefs = shuffleArray(Object.entries(quiz.choices));
    
    setActiveQuiz(quiz);
    setShuffledWords(sWords);
    setShuffledDefs(sDefs);
    
    setSelectedWord(null);
    setSelectedDefinition(null);
    setCorrectMatches([]);
    setWrongMatch(null);
    setIsFinished(false);
    setShowQuitConfirm(false);
  };

  const handleWordClick = (num) => {
    if (correctMatches.includes(num)) return;
    
    if (selectedWord === num) {
      setSelectedWord(null);
    } else {
      setSelectedWord(num);
      if (selectedDefinition) {
        checkMatch(num, selectedDefinition);
      }
    }
  };

  const handleDefClick = (letter) => {
    const isAlreadyMatched = correctMatches.some(num => activeQuiz.answer_key[num.toString()] === letter);
    if (isAlreadyMatched) return;

    if (selectedDefinition === letter) {
      setSelectedDefinition(null);
    } else {
      setSelectedDefinition(letter);
      if (selectedWord) {
        checkMatch(selectedWord, letter);
      }
    }
  };

  const checkMatch = (wordNum, defLetter) => {
    const isCorrect = activeQuiz.answer_key[wordNum.toString()] === defLetter;
    
    if (isCorrect) {
      playCorrectSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(35);
      }

      // Auditory pronunciation reinforcement
      const matchedItem = activeQuiz.matches.find(m => m.word_number === wordNum);
      if (matchedItem && matchedItem.word) {
        speak(matchedItem.word);
      }

      setCorrectMatches(prev => [...prev, wordNum]);
      setSelectedWord(null);
      setSelectedDefinition(null);
      
      // Check win condition
      if (correctMatches.length + 1 === activeQuiz.matches.length) {
        setIsFinished(true);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([60, 40, 80, 40, 120]);
        }
        state.addXp(100);
        state.addCoins(25);
        confetti({ particleCount: 50, spread: 60, colors: ['#000', '#FF5252', '#FFD740'] });
      }
    } else {
      playIncorrectSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 40, 40]);
      }
      setWrongMatch({ word: wordNum, def: defLetter });
      setTimeout(() => {
        setWrongMatch(null);
        setSelectedWord(null);
        setSelectedDefinition(null);
      }, 500);
    }
  };

  if (!activeQuiz) {
    return (
      <div className="animate-fade" style={{ padding: '1.5rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: 'var(--theme-yellow)', padding: '0.5rem', border: NEO_BORDER, boxShadow: NEO_SHADOW, borderRadius: 'var(--radius-sm)' }}>
            <Puzzle size={28} color="#000" />
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.25rem)', fontFamily: 'var(--font-title)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Quick Match
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '600px', fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.4' }}>
          Test your rapid recall by matching words to their definitions. Select a quiz set below to begin.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {(wordsData.quickQuizzes || []).map((quiz, idx) => {
            const bgColor = COLORS[idx % COLORS.length];
            return (
              <div 
                key={quiz.quiz_id}
                onClick={() => startQuiz(quiz)}
                style={{ 
                  padding: '1.5rem', 
                  cursor: 'pointer', 
                  backgroundColor: bgColor,
                  border: NEO_BORDER,
                  boxShadow: NEO_SHADOW,
                  borderRadius: NEO_RADIUS,
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  color: '#000',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
                className="card-hover"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '900', fontSize: '1.25rem', fontFamily: 'var(--font-title)' }}>SET {quiz.quiz_id}</span>
                  <Zap size={20} color="#000" />
                </div>
                <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                  {quiz.matches.length} WORDS MATCH
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ padding: '1.5rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Active Game Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => setShowQuitConfirm(true)} 
            className="btn btn-secondary"
            style={{ 
              padding: '0.4rem 0.85rem', 
              fontSize: '0.82rem', 
              fontWeight: '800',
              fontFamily: 'var(--font-title)',
              borderRadius: '9999px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <ArrowLeft size={15} />
            <span>Quit</span>
          </button>
          <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>
            Set {activeQuiz.quiz_id}
          </h2>
        </div>

        <div style={{ 
          backgroundColor: 'var(--theme-green)', 
          border: '2px solid #000', 
          borderRadius: '9999px',
          padding: '0.4rem 0.85rem',
          boxShadow: '2px 2px 0 #000'
        }}>
          <span style={{ fontSize: '0.82rem', color: '#000', fontWeight: '900', textTransform: 'uppercase' }}>
            {correctMatches.length} / {activeQuiz.matches.length} Matched
          </span>
        </div>
      </div>

      {isFinished ? (
        <div className="animate-scale-in glass-panel" style={{ 
          textAlign: 'center', 
          padding: '3.5rem 2rem', 
          maxWidth: '560px', 
          margin: '2rem auto',
          borderRadius: '20px',
          border: NEO_BORDER,
          boxShadow: 'var(--shadow-large)'
        }}>
          <Award size={64} color="var(--theme-yellow)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-title)', marginBottom: '0.5rem', fontWeight: '900' }}>Flawless Match!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem', fontWeight: '600' }}>
            You completed all {activeQuiz.matches.length} word matches. Earned +100 XP & +25 Coins!
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button 
              onClick={() => setActiveQuiz(null)} 
              className="btn btn-secondary"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '800',
                borderRadius: '12px'
              }}
            >
              All Sets
            </button>
            <button 
              onClick={() => startQuiz(activeQuiz)} 
              className="btn btn-primary"
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: '800',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={18} /> Play Again
            </button>
          </div>
        </div>
      ) : (
        <div className="quickmatch-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Words Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {shuffledWords.map(item => {
              const num = item.word_number;
              const isCorrect = correctMatches.includes(num);
              const isSelected = selectedWord === num;
              const isWrong = wrongMatch?.word === num;

              let bg = 'var(--bg-surface)';
              let shadow = NEO_SHADOW;

              if (isCorrect) {
                bg = 'rgba(105, 240, 174, 0.25)';
                shadow = 'none';
              } else if (isWrong) {
                bg = 'rgba(255, 82, 82, 0.25)';
              } else if (isSelected) {
                bg = 'rgba(24, 255, 255, 0.25)';
                shadow = 'var(--shadow-main)';
              }

              return (
                <button
                  key={num}
                  onClick={() => handleWordClick(num)}
                  disabled={isCorrect}
                  style={{
                    padding: '1.15rem 1.25rem',
                    textAlign: 'left',
                    backgroundColor: bg,
                    border: isSelected ? '3px solid #18FFFF' : NEO_BORDER,
                    borderRadius: NEO_RADIUS,
                    boxShadow: shadow,
                    color: 'var(--text-primary)',
                    fontWeight: '900',
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    cursor: isCorrect ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    opacity: isCorrect ? 0.6 : 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  className="card-hover"
                >
                  <span>{item.word}</span>
                  {isCorrect && <CheckCircle2 size={22} color="#00E676" />}
                </button>
              );
            })}
          </div>

          {/* Definitions Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {shuffledDefs.map(([letter, definition]) => {
              const isCorrect = correctMatches.some(n => activeQuiz.answer_key[n.toString()] === letter);
              const isSelected = selectedDefinition === letter;
              const isWrong = wrongMatch?.def === letter;

              let bg = 'var(--bg-surface)';
              let shadow = NEO_SHADOW;

              if (isCorrect) {
                bg = 'rgba(105, 240, 174, 0.25)';
                shadow = 'none';
              } else if (isWrong) {
                bg = 'rgba(255, 82, 82, 0.25)';
              } else if (isSelected) {
                bg = 'rgba(224, 64, 251, 0.25)';
                shadow = 'var(--shadow-main)';
              }

              return (
                <button
                  key={letter}
                  onClick={() => handleDefClick(letter)}
                  disabled={isCorrect}
                  style={{
                    padding: '1.15rem 1.25rem',
                    textAlign: 'left',
                    backgroundColor: bg,
                    border: isSelected ? '3px solid #E040FB' : NEO_BORDER,
                    borderRadius: NEO_RADIUS,
                    boxShadow: shadow,
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.45',
                    cursor: isCorrect ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    opacity: isCorrect ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}
                  className="card-hover"
                >
                  <span style={{ 
                    fontWeight: '900', 
                    fontSize: '0.85rem',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1.5px solid #000',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {letter}
                  </span>
                  <span style={{ flex: 1, fontWeight: '600' }}>{definition}</span>
                  {isCorrect && <CheckCircle2 size={20} color="#00E676" style={{ flexShrink: 0, marginTop: '2px' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quit Match Confirmation Dialog */}
      {showQuitConfirm && (
        <div 
          className="animate-fade"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
          onClick={() => setShowQuitConfirm(false)}
        >
          <div 
            className="animate-scale-in"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '3px solid #000000',
              boxShadow: '6px 6px 0px #000000',
              borderRadius: '20px',
              padding: '2rem 1.75rem',
              maxWidth: '420px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1.25rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--theme-yellow)',
              border: '2.5px solid #000000',
              boxShadow: '2.5px 2.5px 0px #000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000'
            }}>
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>

            <div>
              <h3 style={{
                fontSize: '1.4rem',
                fontFamily: 'var(--font-title)',
                fontWeight: '900',
                color: 'var(--text-primary)',
                margin: '0 0 0.4rem 0'
              }}>
                Quit Quick Match?
              </h3>
              <p style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                margin: 0
              }}>
                Your current match progress will be lost. Are you sure you want to exit to sets?
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  fontWeight: '800',
                  fontFamily: 'var(--font-title)',
                  borderRadius: '12px',
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                  cursor: 'pointer'
                }}
              >
                Resume
              </button>

              <button
                onClick={() => {
                  setShowQuitConfirm(false);
                  if (state?.setIsQuizActive) state.setIsQuizActive(false);
                  setActiveQuiz(null);
                }}
                className="btn"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  fontWeight: '800',
                  fontFamily: 'var(--font-title)',
                  borderRadius: '12px',
                  backgroundColor: '#FF5252',
                  color: '#FFFFFF',
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                  cursor: 'pointer'
                }}
              >
                Yes, Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
