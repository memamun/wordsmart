import React, { useState } from 'react';
import { 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Coins, 
  RefreshCw,
  Sparkles,
  Lightbulb,
  ArrowLeft,
  BookOpen,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { shuffleArray } from '../utils/shuffle.js';
import QuizExplanationModal from './QuizExplanationModal';
import { playCorrectSound, playIncorrectSound } from '../utils/sounds.js';

export default function QuizRunner({
  title,
  subtitle,
  questions,
  state,
  onFinish,
  onQuit,
  isQualification = false,
  passingScore = 8,
  renderFinishActions = null
}) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [notice, setNotice] = useState(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  // Hint states
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState([]);
  const [bengaliClueUsed, setBengaliClueUsed] = useState(false);
  const [mnemonicUsed, setMnemonicUsed] = useState(false);
  const [showHintPopover, setShowHintPopover] = useState(false);

  const resetHints = () => {
    setFiftyFiftyUsed(false);
    setDisabledOptions([]);
    setBengaliClueUsed(false);
    setMnemonicUsed(false);
    setShowHintPopover(false);
  };

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const currentQ = questions[currentQIndex] || null;

  // Hint: 50/50
  const buyFiftyFifty = () => {
    if (!currentQ || fiftyFiftyUsed || isAnswered) return;
    if (state.coins < 15) return showNotice('Not enough coins for 50/50 hint (15 coins required).');

    state.deductCoins(15);
    setFiftyFiftyUsed(true);

    const wrongOptions = currentQ.options.filter(opt => opt !== currentQ.correct_answer);
    const toDisable = shuffleArray(wrongOptions).slice(0, 2);
    setDisabledOptions(toDisable);
  };

  // Hint: Bengali Clue
  const buyBengaliClue = () => {
    if (bengaliClueUsed || isAnswered) return;
    if (state.coins < 10) return showNotice('Not enough coins for Bengali clue (10 coins required).');

    state.deductCoins(10);
    setBengaliClueUsed(true);
  };

  // Hint: Mnemonic Aid
  const buyMnemonic = () => {
    if (mnemonicUsed || isAnswered) return;
    if (state.coins < 20) return showNotice('Not enough coins for Mnemonic hint (20 coins required).');

    state.deductCoins(20);
    setMnemonicUsed(true);
  };

  const handleAnswer = (option) => {
    if (isAnswered || disabledOptions.includes(option)) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.correct_answer;
    if (isCorrect) {
      playCorrectSound();
      setScore(prev => prev + 1);
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
      setCurrentQIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      if (onFinish) {
        onFinish(score + (selectedOption === currentQ.correct_answer ? 0 : 0), questions.length);
      }
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setQuizFinished(false);
    resetHints();
    setShowExplanationModal(false);
  };

  if (!currentQ && !quizFinished) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Preparing questions...</div>;
  }

  // --- FINISHED STATE ---
  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = isQualification ? score >= passingScore : percentage >= 70;

    return (
      <div 
        className="glass-panel animate-fade" 
        style={{
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-lg)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-large)',
          textAlign: 'center',
          background: 'linear-gradient(145deg, var(--bg-surface) 0%, hsla(var(--primary), 0.05) 100%)',
          maxWidth: '550px',
          margin: '2rem auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem'
        }}
      >
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          backgroundColor: passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: passed ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${passed ? '#10b981' : '#ef4444'}`
        }}>
          {passed ? <Award size={42} /> : <XCircle size={42} />}
        </div>

        <div>
          <h2 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-title)', fontWeight: '900', margin: '0 0 0.4rem 0' }}>
            {passed ? 'Quiz Completed!' : 'Keep Practicing!'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
            {isQualification 
              ? (passed ? 'Congratulations! You qualified and mastered this unit.' : `You need at least ${passingScore}/${questions.length} to pass this exam.`)
              : `You answered ${score} out of ${questions.length} questions correctly.`}
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '2rem',
          padding: '1rem 2rem',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-md)',
          border: 'var(--border-thin)'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)' }}>SCORE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
              {score} / {questions.length}
            </div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--border-muted)' }} />
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)' }}>ACCURACY</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: passed ? 'var(--theme-green)' : 'var(--theme-yellow)' }}>
              {percentage}%
            </div>
          </div>
        </div>

        {renderFinishActions ? (
          renderFinishActions(score, questions.length, passed, handleRestart)
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
            <button
              onClick={handleRestart}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '800' }}
            >
              <RefreshCw size={16} />
              <span>Retake</span>
            </button>
            <button
              onClick={onQuit}
              className="btn btn-primary"
              style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '800' }}
            >
              <span>Finish</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- ACTIVE QUESTION STATE ---
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }} className="animate-fade">
      {/* 1. Quiz Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: isQualification ? 'hsl(var(--secondary))' : 'hsl(var(--primary))' }}>
            {title ? title.toUpperCase() : 'VOCABULARY QUIZ'} {subtitle ? `• ${subtitle.toUpperCase()}` : ''}
          </span>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', margin: '0.15rem 0 0 0' }}>
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
            <span>Need a Hint?</span>
          </button>

          {/* Quit Button */}
          <button
            onClick={onQuit}
            className="btn-icon-hover"
            title="Quit Quiz"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}
          >
            <ArrowLeft size={16} />
            <span>Quit</span>
          </button>
        </div>
      </div>

      {/* 2. Hint Shop Popover Drawer */}
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

      {/* 3. Progress Track */}
      <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-muted)', borderRadius: '3px', overflow: 'hidden', border: 'var(--border-thin)', boxShadow: 'var(--shadow-tiny)' }}>
        <div style={{
          height: '100%',
          width: `${((currentQIndex + 1) / questions.length) * 100}%`,
          backgroundColor: isQualification ? 'hsl(var(--secondary))' : 'hsl(var(--primary))',
          transition: 'var(--transition-normal)'
        }}></div>
      </div>

      {/* Notice Feedback Toast */}
      {notice && (
        <div role="status" aria-live="polite" className="card animate-fade" style={{ padding: '0.85rem 1rem', borderLeft: '3px solid hsl(var(--secondary))', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {notice}
        </div>
      )}

      {/* 4. Interactive Hints Output (Bengali & Mnemonic) */}
      {(bengaliClueUsed || mnemonicUsed) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {bengaliClueUsed && (
            <div className="card animate-fade" style={{ padding: '1rem', borderLeft: '3.5px solid #18FFFF', backgroundColor: 'var(--bg-surface-elevated)', border: '2px solid #000000', boxShadow: '3px 3px 0 #000000', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#18FFFF', fontWeight: '900' }}>BENGALI TRANSLATION CLUE</div>
              <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.15rem', margin: 0, fontFamily: 'var(--font-bengali)' }}>
                {currentQ?.bengali_clue}
              </p>
            </div>
          )}
          {mnemonicUsed && (
            <div className="card animate-fade" style={{ padding: '1rem', borderLeft: '3.5px solid #FFD54F', backgroundColor: 'var(--bg-surface-elevated)', border: '2px solid #000000', boxShadow: '3px 3px 0 #000000', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#FFD54F', fontWeight: '900' }}>MEMORIZATION AID (MNEMONIC)</div>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.15rem', margin: 0, lineHeight: '1.5', fontStyle: 'italic' }}>
                {currentQ?.mnemonic}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. Neo-Brutalist Gradient Question Card */}
      <div style={{ 
        padding: '2.25rem 2.5rem', 
        background: 'linear-gradient(135deg, rgba(224, 64, 251, 0.12) 0%, rgba(24, 255, 255, 0.1) 50%, var(--bg-surface) 100%)',
        border: '3px solid #000000',
        boxShadow: '6px 6px 0px #000000',
        borderRadius: '20px'
      }}>
        <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', lineHeight: '1.55', fontWeight: '900', fontFamily: 'var(--font-title)', margin: 0 }}>
          {currentQ?.question}
        </h3>
      </div>

      {/* 6. MCQ Options with Vibrant Color Badges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {currentQ?.options.map((option, idx) => {
          const isCorrect = option === currentQ.correct_answer;
          const isDisabled = disabledOptions.includes(option);
          const isSelected = selectedOption === option;

          let optClass = '';
          if (isAnswered) {
            if (isCorrect) optClass = 'correct';
            else if (isSelected) optClass = 'wrong';
          }

          const letterBadges = ['A', 'B', 'C', 'D'];
          const letterFills = ['#18FFFF', '#E040FB', '#FFD54F', '#69F0AE'];

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <span style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  border: '2px solid #000000',
                  backgroundColor: letterFills[idx % 4],
                  color: idx % 4 === 0 || idx % 4 === 2 ? '#000000' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-title)',
                  boxShadow: '2px 2px 0px #000000',
                  flexShrink: 0
                }}>
                  {letterBadges[idx % 4]}
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: '800' }}>{option}</span>
              </div>
              {isAnswered && isCorrect && <CheckCircle2 size={22} color="#000000" />}
              {isAnswered && isSelected && !isCorrect && <XCircle size={22} color="#FFFFFF" />}
            </button>
          );
        })}
      </div>

      {/* 7. Next / Explanation Action Bar */}
      {isAnswered && (
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
            <span>{currentQIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanationModal && currentQ && (
        <QuizExplanationModal
          isOpen={showExplanationModal}
          onClose={() => setShowExplanationModal(false)}
          question={currentQ?.question}
          correctAnswer={currentQ?.correct_answer}
          explanation={currentQ?.explanation}
          bengaliExplanation={currentQ?.bengali_clue}
        />
      )}
    </div>
  );
}
