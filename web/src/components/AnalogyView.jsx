import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Coins, 
  Lightbulb,
  RefreshCw,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AnalogyView({ state, wordsData }) {
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load analogies for this level
  const loadAnalogies = () => {
    setLoading(true);
    const generated = wordsData.generateAnalogiesForLevel(state.unlockedLevel, 10);
    setQuestions(generated);
    setCurrentQIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setQuizFinished(false);
    setLoading(false);
  };

  useEffect(() => {
    if (wordsData.words.length > 0) {
      loadAnalogies();
    }
  }, [wordsData.words, state.unlockedLevel]);

  const handleAnswer = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === questions[currentQIndex].correct_answer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      state.addXp(15); // Reward for correct analogy
      state.addCoins(2); // Small coin award
      confetti({
        particleCount: 15,
        spread: 20,
        origin: { y: 0.8 }
      });
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      // Perfect analogy score bonus
      if (score === questions.length) {
        state.addCoins(20);
        state.addXp(100);
      }
    }
  };

  if (loading || wordsData.loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading analogy questions...</div>;
  }

  if (questions.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <HelpCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ fontFamily: 'var(--font-title)', marginBottom: '0.5rem' }}>Analogy Arena Locked</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          We need more synonym and antonym data for words in Stage {state.unlockedLevel} to generate analogies. Study more words or try another level!
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }} className="animate-fade analogy-view-container">
      {/* Quiz Header */}
      {!quizFinished && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'hsl(var(--accent-blue))', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sparkles size={14} /> ANALOGY ARENA DRIL
              </span>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)' }}>
                Question {currentQIndex + 1} of {questions.length}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--coin))', fontWeight: '700' }}>
              <Coins size={18} />
              <span>{state.coins} Coins</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-muted)', borderRadius: '3px', overflow: 'hidden', border: 'var(--border-thin)', boxShadow: 'var(--shadow-tiny)' }}>
            <div style={{
              height: '100%',
              width: `${((currentQIndex + 1) / questions.length) * 100}%`,
              backgroundColor: 'hsl(var(--accent-blue))',
              transition: 'var(--transition-normal)'
            }}></div>
          </div>

          {/* Analogy Challenge Box */}
          <div className="glass-panel" style={{
            padding: '2.5rem 2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, hsla(var(--accent-blue), 0.05) 100%)',
            border: 'var(--border-thick)'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Match the Relation
            </span>
            <h1 style={{
              fontSize: '2.5rem',
              fontFamily: 'var(--font-title)',
              color: 'var(--text-primary)',
              letterSpacing: '0.05em',
              margin: '0.5rem 0 1.5rem',
              textShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              {questions[currentQIndex]?.question}
            </h1>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-muted)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Lightbulb size={12} color="hsl(var(--secondary))" />
              <span>Relation Type: {questions[currentQIndex]?.type}</span>
            </div>
          </div>

          {/* MCQ Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {questions[currentQIndex]?.options.map((option, idx) => {
              const isCorrect = option === questions[currentQIndex].correct_answer;
              
              let optClass = '';
              if (isAnswered) {
                if (isCorrect) optClass = 'correct';
                else if (selectedOption === option) optClass = 'wrong';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className={`mcq-option ${optClass}`}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 size={18} color="hsl(var(--success))" />}
                  {isAnswered && selectedOption === option && !isCorrect && <XCircle size={18} color="hsl(var(--danger))" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="card animate-fade" style={{ 
              padding: '1.5rem', 
              borderLeft: `4px solid ${selectedOption === questions[currentQIndex].correct_answer ? 'hsl(var(--success))' : 'hsl(var(--danger))'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.25rem', color: selectedOption === questions[currentQIndex].correct_answer ? 'hsl(var(--success))' : 'hsl(var(--danger))' }}>
                  {selectedOption === questions[currentQIndex].correct_answer ? 'Correct Relation Recognized!' : 'Incorrect Analogy'}
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: '1.4' }}>
                  {questions[currentQIndex]?.explanation}
                </p>
                <div style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', fontWeight: '600', marginTop: '0.5rem' }}>
                  💡 {questions[currentQIndex]?.bengali_clue}
                </div>
              </div>
              <button 
                onClick={handleNext}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-end', padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
              >
                Next Challenge <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Celebration Finished Screen */}
      {quizFinished && (
        <div className="glass-panel animate-fade" style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'linear-gradient(145deg, var(--bg-surface) 0%, hsla(var(--accent-blue), 0.05) 100%)',
          border: 'var(--border-thick)',
          maxWidth: '550px',
          margin: '2rem auto'
        }}>
          <Award size={56} color="hsl(var(--accent-blue))" style={{ margin: '0 auto 1.5rem', display: 'block' }} />

          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Analogy Drill Complete!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            You scored **{score} out of {questions.length}** ({Math.round((score / questions.length) * 100)}%).
          </p>

          {score === questions.length && (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'hsla(var(--primary), 0.1)',
              border: '1px solid hsl(var(--primary))',
              color: 'hsl(var(--primary))',
              fontWeight: '600',
              fontSize: '0.9rem',
              marginBottom: '2rem'
            }}>
              🏆 PERFECT SCORE BONUS: +20 Coins & +100 XP!
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={loadAnalogies}
              className="btn btn-primary"
            >
              <RefreshCw size={14} /> Practice Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
