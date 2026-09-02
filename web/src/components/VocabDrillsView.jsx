import React, { useState, useEffect } from 'react';
import { 
  BookA, 
  Repeat, 
  Shuffle, 
  Type, 
  FileText,
  Play,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Coins,
  RefreshCw,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { shuffleArray } from '../utils/shuffle.js';

export default function VocabDrillsView({ state, wordsData }) {
  const [activeDrillType, setActiveDrillType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const DRILL_MODES = [
    { id: 'synonym_mcq', label: 'Synonyms', icon: Repeat, desc: 'Find words with similar meanings', color: 'hsl(var(--primary))' },
    { id: 'antonym_mcq', label: 'Antonyms', icon: Shuffle, desc: 'Find words with opposite meanings', color: 'hsl(var(--danger))' },
    { id: 'definition_mcq', label: 'Definitions', icon: BookA, desc: 'Match words to their meanings', color: 'hsl(var(--accent-purple))' },
    { id: 'sentence_completion', label: 'Sentences', icon: FileText, desc: 'Fill in the missing word', color: 'hsl(var(--accent-blue))' },
    { id: 'collocation', label: 'Collocations', icon: Type, desc: 'Common word pairings', color: 'hsl(var(--success))' }
  ];

  const generateCollocationQuestions = () => {
    const questions = [];
    const availableWords = wordsData.words.filter(w => w.collocations && w.collocations.length > 0);
    // Pick 10 random words using Fisher-Yates
    const selected = shuffleArray(availableWords).slice(0, 10);
    
    selected.forEach(wordObj => {
      const coll = wordObj.collocations[Math.floor(Math.random() * wordObj.collocations.length)];
      // Replace the word in the collocation with blanks
      const regex = new RegExp(`\\b${wordObj.word}\\b`, 'i');
      let sentence = coll.replace(regex, '_______');
      
      // If the word isn't exactly matched (e.g. past tense), fallback to replacing the first word that resembles it
      if (sentence === coll) {
        sentence = coll.replace(new RegExp(wordObj.word.substring(0, 4), 'i'), '_______');
      }

      // Generate distractors
      const distractors = shuffleArray(wordsData.words.filter(w => w.id !== wordObj.id))
        .slice(0, 3)
        .map(w => w.word);

      questions.push({
        word: wordObj.word,
        sentence: sentence,
        options: shuffleArray([wordObj.word, ...distractors]),
        correct_answer: wordObj.word,
        bengali_meaning: wordObj.bengali_meaning
      });
    });
    return questions;
  };

  const startDrill = (typeId) => {
    let selectedQuestions = [];

    if (typeId === 'collocation') {
      selectedQuestions = generateCollocationQuestions();
    } else {
      // Pull from vocab_drills JSON
      const drills = wordsData.vocabDrills || [];
      const validDrills = drills.filter(d => d[typeId] != null);
      
      // Pick 10 random and shuffle option choices
      selectedQuestions = shuffleArray(validDrills)
        .slice(0, 10)
        .map(d => {
          const item = d[typeId];
          return {
            ...item,
            options: item.options ? shuffleArray(item.options) : item.options,
            bengali_meaning: d.bengali_meaning
          };
        });
    }

    setQuestions(selectedQuestions);
    setCurrentQIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setQuizFinished(false);
    setActiveDrillType(typeId);
  };

  const handleAnswer = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === questions[currentQIndex].correct_answer) {
      setScore(prev => prev + 1);
      state.addCoins(1);
      confetti({ particleCount: 15, spread: 20, origin: { y: 0.8 } });
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      state.addXp(50);
      if (score === questions.length) state.addCoins(10);
    }
  };

  if (!activeDrillType) {
    return (
      <div className="animate-fade" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Trophy size={28} color="hsl(var(--primary))" />
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Vocab Drills</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', lineHeight: '1.5' }}>
          Master vocabulary through specialized micro-drills. Choose a focus area below to begin a rapid-fire practice session.
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
    );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div className="animate-fade" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {!quizFinished ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={() => setActiveDrillType(null)}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              ← Back to Drills
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--coin))', fontWeight: '700' }}>
              <Coins size={18} />
              <span>{state.coins} Coins</span>
            </div>
          </div>

          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-canvas)', border: 'var(--border-thin)', overflow: 'hidden', boxShadow: 'var(--shadow-tiny)' }}>
            <div style={{
              height: '100%',
              width: `${((currentQIndex + 1) / questions.length) * 100}%`,
              backgroundColor: 'var(--theme-green)',
              transition: 'var(--transition-normal)'
            }}></div>
          </div>
          
          <h2 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            Question {currentQIndex + 1} of {questions.length}
          </h2>

          {/* Question Display */}
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(145deg, var(--bg-surface) 0%, hsla(var(--primary), 0.05) 100%)' }}>
            {activeDrillType === 'sentence_completion' || activeDrillType === 'collocation' ? (
              <h3 style={{ fontSize: '1.4rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                {currentQ.sentence}
              </h3>
            ) : (
              <>
                <span style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Find the {activeDrillType.split('_')[0]} for
                </span>
                <h3 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                  {currentQ.word}
                </h3>
              </>
            )}
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            {currentQ.options.map((opt, idx) => {
              const isCorrect = opt === currentQ.correct_answer;
              let btnClass = 'mcq-option';
              if (isAnswered) {
                if (isCorrect) btnClass += ' correct';
                else if (selectedOption === opt) btnClass += ' wrong';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={isAnswered}
                  className={btnClass}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.5rem',
                    fontSize: '1.1rem'
                  }}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 size={20} color="hsl(var(--success))" />}
                  {isAnswered && selectedOption === opt && !isCorrect && <XCircle size={20} color="hsl(var(--danger))" />}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className="card animate-fade" style={{ padding: '1.5rem', borderLeft: `4px solid ${selectedOption === currentQ.correct_answer ? 'hsl(var(--success))' : 'hsl(var(--danger))'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: selectedOption === currentQ.correct_answer ? 'hsl(var(--success))' : 'hsl(var(--danger))', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {selectedOption === currentQ.correct_answer ? 'Correct!' : 'Incorrect'}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <strong>{currentQ.word || currentQ.correct_answer}</strong>: <span style={{ fontFamily: 'var(--font-bengali)' }}>{currentQ.bengali_meaning}</span>
                  </p>
                </div>
                <button onClick={handleNext} className="btn btn-primary">
                  Next <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel animate-fade" style={{ textAlign: 'center', padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
          <CheckCircle2 size={64} color="hsl(var(--primary))" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', marginBottom: '1rem' }}>Drill Complete!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
            You scored {score} out of {questions.length}.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => setActiveDrillType(null)} className="btn btn-secondary">
              Drill Menu
            </button>
            <button onClick={() => startDrill(activeDrillType)} className="btn btn-primary">
              <RefreshCw size={16} style={{ marginRight: '0.5rem' }} /> Retry Drill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
