import React, { useState, useContext } from 'react';
import { 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Coins, 
  BookOpen, 
  RefreshCw,
  Library,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { shuffleArray } from '../utils/shuffle.js';
import { DetailPanelContext } from '../App';
import QuizExplanationModal from './QuizExplanationModal';
import { playCorrectSound, playIncorrectSound } from '../utils/sounds.js';

export default function AllQuizzesView({ state, wordsData, setActiveView }) {
  const { setDetailWord } = useContext(DetailPanelContext);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const allQuizzes = wordsData.quizzes || [];

  // Quiz running state
  const [activeQuiz, setActiveQuiz] = useState(null); // quiz object
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [notice, setNotice] = useState(null);
  
  // Hint states
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState([]);
  const [bengaliClueUsed, setBengaliClueUsed] = useState(false);
  const [mnemonicUsed, setMnemonicUsed] = useState(false);
  const [showHintPopover, setShowHintPopover] = useState(false);

  // Start a preloaded MCQ quiz
  const startPreloadedQuiz = (quiz) => {
    // Map JSON questions structure to our local format and shuffle options
    const formatted = quiz.questions.map((q) => {
      // Find corresponding word in core vocabulary if possible
      const targetWord = wordsData.words.find(w => w.word.toUpperCase() === q.correct_answer || q.question.toLowerCase().includes(w.word.toLowerCase()));
      return {
        ...q,
        options: shuffleArray(q.options),
        bengali_clue: q.bengali_clue || targetWord?.bengali_meaning || 'ক্লু নেই।',
        mnemonic: targetWord?.mnemonic || 'কৌশল নেই।',
        targetWord
      };
    });

    setQuestions(formatted);
    setCurrentQIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setQuizFinished(false);
    resetHints();
    setShowExplanationModal(false);
    setActiveQuiz(quiz);
  };

  const resetHints = () => {
    setFiftyFiftyUsed(false);
    setDisabledOptions([]);
    setBengaliClueUsed(false);
    setMnemonicUsed(false);
    setNotice(null);
    setShowHintPopover(false);
  };

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2400);
  };

  // Hint shop purchases
  const buyFiftyFifty = () => {
    if (state.coins < 15) return showNotice('Not enough coins for 50/50. Complete more questions to earn coins.');
    state.deductCoins(15);
    setFiftyFiftyUsed(true);

    const q = questions[currentQIndex];
    const incorrect = q.options.filter(o => o !== q.correct_answer);
    // Shuffle using Fisher-Yates and pick 2 to disable
    const toDisable = shuffleArray(incorrect).slice(0, 2);
    setDisabledOptions(toDisable);
  };

  const buyBengaliClue = () => {
    if (state.coins < 10) return showNotice('Not enough coins for the Bengali clue.');
    state.deductCoins(10);
    setBengaliClueUsed(true);
  };

  const buyMnemonic = () => {
    if (state.coins < 20) return showNotice('Not enough coins for the mnemonic hint.');
    state.deductCoins(20);
    setMnemonicUsed(true);
  };

  const handleAnswer = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === questions[currentQIndex].correct_answer;
    if (isCorrect) {
      playCorrectSound();
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 15,
        spread: 25,
        origin: { y: 0.8 }
      });
    } else {
      playIncorrectSound();
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    setShowExplanationModal(false);
    resetHints();

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      // Practice quiz gives small coin bonus
      state.addCoins(5);
      state.addXp(30);
    }
  };

  if (wordsData.loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading quizzes...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }} className="animate-fade quiz-view-container">
      {/* 1. QUIZ LIST VIEW */}
      {!activeQuiz && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Library size={28} color="hsl(var(--primary))" />
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Quiz Library</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.5' }}>
            Browse and practice all available quizzes in the application, regardless of your current stage. Playing these quizzes awards XP and coins but does not affect stage progression.
          </p>

          {allQuizzes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No practice quizzes available.</p>
          ) : (
            <div className="grid-cols-responsive">
              {allQuizzes.map((quiz) => (
                <div key={quiz.quiz_id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '1rem', borderLeft: '4px solid hsl(var(--primary))' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>{quiz.title}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {quiz.total_questions} MCQ Questions
                    </span>
                  </div>
                  <button 
                    onClick={() => startPreloadedQuiz(quiz)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: '100%', marginTop: 'auto' }}
                  >
                    Start Practice Quiz
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ACTIVE QUIZ PLAY VIEW */}
      {activeQuiz && !quizFinished && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          {/* Quiz Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'hsl(var(--primary))' }}>
                PRACTICE QUIZ: {activeQuiz.title}
              </span>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)' }}>
                Question {currentQIndex + 1} of {questions.length}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'hsl(var(--coin))', fontWeight: '800', fontSize: '0.85rem' }}>
                <Coins size={18} />
                <span>{state.coins} Coins</span>
              </div>

              {/* Hint Shop Drawer Button */}
              <button 
                onClick={() => setShowHintPopover(prev => !prev)}
                className="btn btn-secondary"
                style={{ 
                  padding: '0.35rem 0.75rem', 
                  fontSize: '0.75rem', 
                  borderRadius: '9999px',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem',
                  backgroundColor: showHintPopover ? 'var(--theme-yellow)' : 'var(--bg-surface-elevated)',
                  color: showHintPopover ? '#000' : 'var(--text-primary)',
                  boxShadow: showHintPopover ? 'var(--shadow-tiny)' : 'none',
                  border: 'var(--border-thin)'
                }}
                title="Need a Hint?"
              >
                <Lightbulb size={14} color={showHintPopover ? '#000' : 'var(--theme-bulb)'} />
                <span>Need a hint?</span>
              </button>
            </div>
          </div>

          {/* Hint Shop Popover Drawer */}
          {showHintPopover && (
            <div className="animate-fade glass-panel" style={{
              padding: '1rem',
              border: 'var(--border-thick)',
              boxShadow: 'var(--shadow-medium)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-title)', fontWeight: '900', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Lightbulb size={14} color="var(--theme-bulb)" /> Available Hints
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>Use coins to unlock assistance</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={buyFiftyFifty}
                  disabled={fiftyFiftyUsed || isAnswered || state.coins < 15}
                  className={`quiz-hint-pill hint-5050 ${fiftyFiftyUsed ? 'used' : ''}`}
                  style={{ flex: 1, minWidth: '110px' }}
                >
                  {fiftyFiftyUsed ? (
                    <>
                      <CheckCircle2 size={14} color="#000" />
                      <span>50/50 Used</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} color="#000" />
                      <span>50/50</span>
                      <span className="hint-cost-pill">-15c</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={buyBengaliClue}
                  disabled={bengaliClueUsed || isAnswered || state.coins < 10}
                  className={`quiz-hint-pill hint-bengali ${bengaliClueUsed ? 'used' : ''}`}
                  style={{ flex: 1, minWidth: '110px' }}
                >
                  {bengaliClueUsed ? (
                    <>
                      <CheckCircle2 size={14} color="#000" />
                      <span>Bengali</span>
                    </>
                  ) : (
                    <>
                      <BookOpen size={14} color="#000" />
                      <span>Bengali</span>
                      <span className="hint-cost-pill">-10c</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={buyMnemonic}
                  disabled={mnemonicUsed || isAnswered || state.coins < 20}
                  className={`quiz-hint-pill hint-mnemonic ${mnemonicUsed ? 'used' : ''}`}
                  style={{ flex: 1, minWidth: '110px' }}
                >
                  {mnemonicUsed ? (
                    <>
                      <CheckCircle2 size={14} color="#000" />
                      <span>Mnemonic</span>
                    </>
                  ) : (
                    <>
                      <Lightbulb size={14} color="#000" />
                      <span>Mnemonic</span>
                      <span className="hint-cost-pill">-20c</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-canvas)', border: 'var(--border-thin)', overflow: 'hidden', boxShadow: 'var(--shadow-tiny)' }}>
            <div style={{
              height: '100%',
              width: `${((currentQIndex + 1) / questions.length) * 100}%`,
              backgroundColor: 'var(--theme-cyan)',
              transition: 'var(--transition-normal)'
            }}></div>
          </div>

          {/* Question Card */}
          <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: '1.5', fontWeight: '600' }}>
              {questions[currentQIndex]?.question}
            </h3>
          </div>

          {/* Interactive Hints Output */}
          {notice && (
            <div role="status" aria-live="polite" className="card animate-fade" style={{ padding: '0.85rem 1rem', borderLeft: '3px solid hsl(var(--secondary))', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {notice}
            </div>
          )}
          {(bengaliClueUsed || mnemonicUsed) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bengaliClueUsed && (
                <div className="card animate-fade" style={{ padding: '1rem', borderLeft: '3px solid hsl(var(--primary))', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'hsl(var(--primary))', fontWeight: '700' }}>BENGALI TRANSLATION CLUE</div>
                  <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                    {questions[currentQIndex]?.bengali_clue}
                  </p>
                </div>
              )}
              {mnemonicUsed && (
                <div className="card animate-fade" style={{ padding: '1rem', borderLeft: '3px solid hsl(var(--secondary))', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'hsl(var(--secondary))', fontWeight: '700' }}>MEMORIZATION AID (MNEMONIC)</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: '1.4' }}>
                    {questions[currentQIndex]?.mnemonic}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* MCQ Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {questions[currentQIndex]?.options.map((option, idx) => {
              const isCorrect = option === questions[currentQIndex].correct_answer;
              const isDisabled = disabledOptions.includes(option);
              
              let optClass = '';
              if (isAnswered) {
                if (isCorrect) optClass = 'correct';
                else if (selectedOption === option) optClass = 'wrong';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered || isDisabled}
                  className={`mcq-option ${optClass}`}
                  style={{
                    opacity: isDisabled ? 0.3 : 1,
                    pointerEvents: isDisabled ? 'none' : 'auto'
                  }}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 size={18} color="hsl(var(--success))" />}
                  {isAnswered && selectedOption === option && !isCorrect && <XCircle size={18} color="hsl(var(--danger))" />}
                </button>
              );
            })}
          </div>

          {/* Next / Explanation Action Bar */}
          {isAnswered && (() => {
            const currentQ = questions[currentQIndex];
            return (
              <>
                <div className="quiz-action-bar animate-fade">
                  <button
                    onClick={() => setShowExplanationModal(true)}
                    className="quiz-btn-explanation"
                    title="View full explanation in dialog"
                  >
                    <Lightbulb size={16} color="var(--theme-bulb)" />
                    <span>Explanation</span>
                  </button>

                  <button 
                    onClick={handleNext}
                    className="quiz-btn-next"
                  >
                    <span>Next Question</span>
                    <ArrowRight size={18} />
                  </button>
                </div>

                {/* Explanation Modal / Dialog */}
                <QuizExplanationModal
                  isOpen={showExplanationModal}
                  onClose={() => setShowExplanationModal(false)}
                  question={currentQ?.question}
                  correctAnswer={currentQ?.correct_answer}
                  explanation={currentQ?.explanation}
                  bengaliExplanation={currentQ?.bengali_clue}
                />
              </>
            );
          })()}
        </div>
      )}

      {/* 3. QUIZ FINISHED CELEBRATION VIEW */}
      {activeQuiz && quizFinished && (
        <div className="glass-panel animate-fade" style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'linear-gradient(145deg, var(--bg-surface) 0%, hsla(var(--primary), 0.05) 100%)',
          maxWidth: '550px',
          margin: '2rem auto'
        }}>
          <CheckCircle2 size={56} color="hsl(var(--primary))" style={{ margin: '0 auto 1.5rem', display: 'block' }} />

          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Quiz Completed!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
            You scored <strong style={{ color: 'var(--text-primary)', fontWeight: '800' }}>{score} out of {questions.length}</strong> ({Math.round((score / questions.length) * 100)}%).
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                setActiveQuiz(null);
                setQuizFinished(false);
              }}
              className="btn btn-secondary"
            >
              Exit to Library
            </button>
            <button 
              onClick={() => startPreloadedQuiz(activeQuiz)}
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
