import React, { useState, useEffect } from 'react';
import { 
  Puzzle, 
  CheckCircle2, 
  RefreshCw,
  Award,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Neobrutalist design constants
const NEO_SHADOW = 'var(--shadow-medium)';
const NEO_BORDER = 'var(--border-thick)';
const NEO_RADIUS = '0px';

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

  const startQuiz = (quiz) => {
    // Shuffle words
    const sWords = [...quiz.matches].sort(() => 0.5 - Math.random());
    // Shuffle definitions
    const sDefs = Object.entries(quiz.choices).sort(() => 0.5 - Math.random());
    
    setActiveQuiz(quiz);
    setShuffledWords(sWords);
    setShuffledDefs(sDefs);
    
    setSelectedWord(null);
    setSelectedDefinition(null);
    setCorrectMatches([]);
    setWrongMatch(null);
    setIsFinished(false);
  };

  const handleWordClick = (num) => {
    if (correctMatches.includes(num)) return;
    
    if (selectedWord === num) {
      setSelectedWord(null); // deselect
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
      setCorrectMatches(prev => [...prev, wordNum]);
      setSelectedWord(null);
      setSelectedDefinition(null);
      
      // Check win
      if (correctMatches.length + 1 === activeQuiz.matches.length) {
        setIsFinished(true);
        state.addXp(100);
        state.addCoins(25);
        confetti({ particleCount: 50, spread: 60, colors: ['#000', '#FF5252', '#FFD740'] });
      }
    } else {
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
      <div className="animate-fade" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--theme-yellow)', padding: '0.5rem', border: NEO_BORDER, boxShadow: NEO_SHADOW }}>
            <Puzzle size={32} color="#000" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Quick Match
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', fontSize: '1.1rem', fontWeight: '500' }}>
          Test your rapid recall by matching words to their definitions. Select a quiz to begin.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
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
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-main)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translate(0px, 0px)';
                  e.currentTarget.style.boxShadow = NEO_SHADOW;
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(2px, 2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-tiny)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translate(-2px, -2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-main)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase' }}>
                    Quiz {quiz.quiz_id}
                  </h3>
                  <Zap size={20} />
                </div>
                <p style={{ fontSize: '1rem', fontWeight: '700' }}>
                  {quiz.matches.length} words
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Quiz View
  return (
    <div className="animate-fade" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: NEO_BORDER }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => setActiveQuiz(null)} 
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '1rem', 
              fontWeight: '800',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: NEO_BORDER,
              boxShadow: 'var(--shadow-tiny)',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            ← Back
          </button>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase' }}>
            Set {activeQuiz.quiz_id}
          </h2>
        </div>
        <div style={{ 
          backgroundColor: 'var(--theme-green)', 
          border: NEO_BORDER, 
          padding: '0.5rem 1rem',
          boxShadow: 'var(--shadow-tiny)'
        }}>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-black)', fontWeight: '900', textTransform: 'uppercase' }}>
            {correctMatches.length} / {activeQuiz.matches.length} Matched
          </span>
        </div>
      </div>

      {isFinished ? (
        <div className="animate-fade" style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          maxWidth: '600px', 
          margin: '2rem auto',
          backgroundColor: 'var(--theme-yellow)',
          border: NEO_BORDER,
          boxShadow: '8px 8px 0px var(--shadow-color)'
        }}>
          <Award size={80} color="#000" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '3rem', fontFamily: 'var(--font-title)', marginBottom: '1rem', color: '#000', textTransform: 'uppercase' }}>Flawless!</h2>
          <p style={{ color: '#000', marginBottom: '2.5rem', fontSize: '1.2rem', fontWeight: '700' }}>
            You destroyed all {activeQuiz.matches.length} matches.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => setActiveQuiz(null)} 
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: NEO_BORDER,
                padding: '0.75rem 1.5rem',
                fontSize: '1.1rem',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-medium)',
                textTransform: 'uppercase'
              }}
            >
              Menu
            </button>
            <button 
              onClick={() => startQuiz(activeQuiz)} 
              style={{
                backgroundColor: 'var(--theme-green)',
                border: NEO_BORDER,
                padding: '0.75rem 1.5rem',
                fontSize: '1.1rem',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-medium)',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-black)'
              }}
            >
              <RefreshCw size={20} /> Play Again
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
          {/* Words Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {shuffledWords.map(item => {
              const num = item.word_number;
              const isCorrect = correctMatches.includes(num);
              const isSelected = selectedWord === num;
              const isWrong = wrongMatch?.word === num;

              let bg = 'var(--bg-surface)';
              let translate = '0px, 0px';
              let shadow = NEO_SHADOW;
              let zIndex = 1;

              if (isCorrect) {
                bg = 'var(--theme-green)';
                translate = '2px, 2px';
                shadow = 'var(--shadow-one)';
              } else if (isWrong) {
                bg = 'var(--theme-red)';
                translate = '4px, -4px';
              } else if (isSelected) {
                bg = 'var(--theme-cyan)';
                translate = '-2px, -2px';
                shadow = 'var(--shadow-main)';
                zIndex = 10;
              }

              return (
                <button
                  key={num}
                  onClick={() => handleWordClick(num)}
                  disabled={isCorrect}
                  style={{
                    padding: '1.25rem',
                    textAlign: 'left',
                    backgroundColor: bg,
                    border: NEO_BORDER,
                    boxShadow: shadow,
                    color: (isCorrect || isWrong || isSelected) ? 'var(--text-black)' : 'var(--text-primary)',
                    fontWeight: '900',
                    fontSize: '1.2rem',
                    textTransform: 'uppercase',
                    cursor: isCorrect ? 'default' : 'pointer',
                    transform: `translate(${translate})`,
                    transition: 'all 0.1s ease',
                    opacity: isCorrect ? 0.7 : 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    position: 'relative',
                    zIndex: zIndex
                  }}
                >
                  <span>{item.word}</span>
                  {isCorrect && <CheckCircle2 size={24} color="#ffffff" />}
                </button>
              );
            })}
          </div>

          {/* Definitions Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {shuffledDefs.map(([letter, definition]) => {
              const isCorrect = correctMatches.some(n => activeQuiz.answer_key[n.toString()] === letter);
              const isSelected = selectedDefinition === letter;
              const isWrong = wrongMatch?.def === letter;

              let bg = 'var(--bg-surface)';
              let translate = '0px, 0px';
              let shadow = NEO_SHADOW;
              let zIndex = 1;

              if (isCorrect) {
                bg = 'var(--theme-green)';
                translate = '2px, 2px';
                shadow = 'var(--shadow-one)';
              } else if (isWrong) {
                bg = 'var(--theme-red)';
              } else if (isSelected) {
                bg = 'var(--theme-purple)';
                translate = '-2px, -2px';
                shadow = 'var(--shadow-main)';
                zIndex = 10;
              }

              return (
                <button
                  key={letter}
                  onClick={() => handleDefClick(letter)}
                  disabled={isCorrect}
                  style={{
                    padding: '1.25rem',
                    textAlign: 'left',
                    backgroundColor: bg,
                    border: NEO_BORDER,
                    boxShadow: shadow,
                    color: (isCorrect || isWrong || isSelected) ? 'var(--text-black)' : 'var(--text-primary)',
                    cursor: isCorrect ? 'default' : 'pointer',
                    transform: `translate(${translate})`,
                    transition: 'all 0.1s ease',
                    opacity: isCorrect ? 0.7 : 1,
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: zIndex
                  }}
                >
                  <span style={{ 
                    backgroundColor: '#000', 
                    color: '#fff',
                    padding: '0.2rem 0.6rem', 
                    fontSize: '0.9rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    border: '1px solid #000'
                  }}>
                    {letter}
                  </span>
                  <span style={{ lineHeight: '1.4', fontSize: '1.1rem', fontWeight: '700' }}>{definition}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
