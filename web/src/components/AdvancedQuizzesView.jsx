import React, { useState } from 'react';
import { 
  GraduationCap, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RefreshCw,
  Award,
  Link2,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdvancedQuizzesView({ state, wordsData }) {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [mode, setMode] = useState(null); // 'analogies' | 'sentence_completions' | 'contextual_lexical'

  const startQuiz = (quiz, selectedMode) => {
    setActiveQuiz(quiz);
    setMode(selectedMode);
    setQuestions(quiz[selectedMode] || []);
    setCurrentQIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setQuizFinished(false);
  };

  const handleAnswer = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === questions[currentQIndex].correct_answer) {
      setScore(prev => prev + 1);
      state.addCoins(2);
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
      state.addXp(150);
      if (score === questions.length) state.addCoins(25);
    }
  };

  if (!activeQuiz) {
    return (
      <div className="animate-fade" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <GraduationCap size={32} color="hsl(var(--accent-blue))" />
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Advanced SAT/GRE Quizzes</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '700px', lineHeight: '1.5' }}>
          Challenge yourself with high-level test preparation formats, including Analogies, Sentence Completions, and Contextual Lexical questions.
        </p>

        <div className="grid-cols-responsive">
          {(wordsData.advancedQuizzes || []).map(quiz => (
            <div key={quiz.quiz_id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
                  {quiz.quiz_title || `Advanced Set ${quiz.quiz_id}`}
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {quiz.analogies && quiz.analogies.length > 0 && (
                  <button onClick={() => startQuiz(quiz, 'analogies')} className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '0.75rem' }}>
                    <Link2 size={16} style={{ marginRight: '0.75rem', color: 'hsl(var(--primary))' }} />
                    Analogies ({quiz.analogies.length})
                  </button>
                )}
                {quiz.sentence_completions && quiz.sentence_completions.length > 0 && (
                  <button onClick={() => startQuiz(quiz, 'sentence_completions')} className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '0.75rem' }}>
                    <FileText size={16} style={{ marginRight: '0.75rem', color: 'hsl(var(--accent-purple))' }} />
                    Sentence Completion ({quiz.sentence_completions.length})
                  </button>
                )}
                {quiz.contextual_lexical && quiz.contextual_lexical.length > 0 && (
                  <button onClick={() => startQuiz(quiz, 'contextual_lexical')} className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'flex-start', padding: '0.75rem' }}>
                    <HelpCircle size={16} style={{ marginRight: '0.75rem', color: 'hsl(var(--success))' }} />
                    Contextual Lexical ({quiz.contextual_lexical.length})
                  </button>
                )}
              </div>
            </div>
          ))}
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
              onClick={() => setActiveQuiz(null)}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
            >
              ← Back to Sets
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {mode.replace('_', ' ')}
            </span>
          </div>

          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-canvas)', border: 'var(--border-thin)', overflow: 'hidden', boxShadow: 'var(--shadow-tiny)' }}>
            <div style={{
              height: '100%',
              width: `${((currentQIndex + 1) / questions.length) * 100}%`,
              backgroundColor: 'var(--theme-blue)',
              transition: 'var(--transition-normal)'
            }}></div>
          </div>
          
          <h2 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            Question {currentQIndex + 1} of {questions.length}
          </h2>

          {/* Question Display */}
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
            {mode === 'analogies' ? (
              <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                {currentQ.stem}
              </h3>
            ) : (
              <h3 style={{ fontSize: '1.35rem', lineHeight: '1.6', color: 'var(--text-primary)', textAlign: 'left' }}>
                {currentQ.sentence}
              </h3>
            )}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                    padding: '1.25rem 1.5rem',
                    fontSize: '1.1rem',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontWeight: mode === 'analogies' ? '700' : '500', letterSpacing: mode === 'analogies' ? '0.05em' : 'normal' }}>
                    {opt}
                  </span>
                  {isAnswered && isCorrect && <CheckCircle2 size={20} color="hsl(var(--success))" />}
                  {isAnswered && selectedOption === opt && !isCorrect && <XCircle size={20} color="hsl(var(--danger))" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Card (High-Contrast Neobrutalist 3D) */}
          {isAnswered && (() => {
            const isCorrectAnswer = selectedOption === currentQ.correct_answer;
            return (
              <div className="animate-fade" style={{ 
                padding: '1.75rem 2rem', 
                borderRadius: '20px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '3px solid #000000',
                borderLeft: isCorrectAnswer ? '8px solid #00E676' : '8px solid #FF5252',
                boxShadow: '6px 6px 0px #000000',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '900',
                    fontFamily: 'var(--font-title)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.45rem', 
                    color: isCorrectAnswer ? '#00E676' : '#FF5252',
                    margin: 0
                  }}>
                    {isCorrectAnswer ? (
                      <><CheckCircle2 size={22} color="#00E676" /> Brilliant!</>
                    ) : (
                      <><XCircle size={22} color="#FF5252" /> Not quite.</>
                    )}
                  </h4>
                </div>

                <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: '1.65', margin: 0, fontWeight: '600' }}>
                  {currentQ.explanation}
                </p>

                {currentQ.bengali_explanation && (
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0, fontWeight: '700' }}>
                    {currentQ.bengali_explanation}
                  </p>
                )}

                <button 
                  onClick={handleNext}
                  style={{
                    alignSelf: 'flex-end',
                    padding: '0.65rem 1.4rem',
                    fontSize: '0.9rem',
                    fontWeight: '900',
                    fontFamily: 'var(--font-title)',
                    borderRadius: '12px',
                    border: '2.5px solid #000000',
                    background: 'linear-gradient(135deg, #18FFFF 0%, #00E5FF 100%)',
                    color: '#000000',
                    cursor: 'pointer',
                    boxShadow: '3.5px 3.5px 0px #000000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'transform 0.1s ease'
                  }}
                >
                  Next Question <ArrowRight size={18} />
                </button>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="glass-panel animate-fade" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '2rem auto' }}>
          <Award size={64} color="hsl(var(--accent-blue))" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-title)', marginBottom: '1rem' }}>Set Completed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.2rem' }}>
            You scored {score} out of {questions.length}.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => setActiveQuiz(null)} className="btn btn-secondary">
              Back to Sets
            </button>
            <button onClick={() => startQuiz(activeQuiz, mode)} className="btn btn-primary">
              <RefreshCw size={16} style={{ marginRight: '0.5rem' }} /> Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
