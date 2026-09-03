import React, { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
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
    if (!currentQ || fiftyFiftyUsed) return;
    if (state.coins < 10) return showNotice('Not enough coins for 50/50 hint (10 coins required).');

    state.deductCoins(10);
    setFiftyFiftyUsed(true);

    const wrongOptions = currentQ.options.filter(opt => opt !== currentQ.correct_answer);
    const toDisable = wrongOptions.slice(0, 2);
    setDisabledOptions(toDisable);
  };

  // Hint: Bengali Clue
  const buyBengaliClue = () => {
    if (bengaliClueUsed) return;
    setBengaliClueUsed(true);
  };

  // Hint: Mnemonic Aid
  const buyMnemonic = () => {
    if (mnemonicUsed) return;
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
        className="card animate-scale-in" 
        style={{
          maxWidth: '560px',
          margin: '2rem auto',
          textAlign: 'center',
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          borderRadius: '16px',
          border: 'var(--border-thin)',
          boxShadow: 'var(--shadow-medium)',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: passed ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `2px solid ${passed ? '#10b981' : '#ef4444'}`
        }}>
          {passed ? <Award size={38} /> : <XCircle size={38} />}
        </div>

        <div>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', margin: '0 0 0.4rem 0' }}>
            {passed ? 'Quiz Completed!' : 'Keep Practicing!'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            {isQualification 
              ? (passed ? 'Congratulations! You met the qualification threshold.' : `You need at least ${passingScore}/${questions.length} to pass this stage.`)
              : `You scored ${score} out of ${questions.length} questions.`}
          </p>
        </div>

        <div style={{
          padding: '1rem 1.75rem',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: 'var(--border-thin)',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)' }}>SCORE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
              {score} / {questions.length}
            </div>
          </div>
          <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--border-muted)' }} />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '800px', margin: '0 auto' }} className="animate-fade">
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--theme-cyan)', letterSpacing: '0.05em' }}>
            {title ? title.toUpperCase() : 'VOCABULARY QUIZ'} {subtitle ? `• ${subtitle.toUpperCase()}` : ''}
          </span>
          <h2 style={{ fontSize: '1.45rem', fontFamily: 'var(--font-title)', margin: '0.15rem 0 0 0' }}>
            Question {currentQIndex + 1} of {questions.length}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--theme-yellow)', fontWeight: '800', fontSize: '0.85rem' }}>
            <Coins size={17} />
            <span>{state.coins}</span>
          </div>

          {/* Hint Shop Toggle */}
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
              border: 'var(--border-thin)'
            }}
          >
            <Lightbulb size={14} />
            <span>Hints</span>
          </button>

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

      {/* Progress Track */}
      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-muted)', borderRadius: '3px', overflow: 'hidden' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${((currentQIndex + 1) / questions.length) * 100}%`, 
            backgroundColor: 'var(--theme-cyan)',
            transition: 'width 0.3s ease'
          }} 
        />
      </div>

      {/* Notice Message Banner */}
      {notice && (
        <div style={{
          padding: '0.65rem 1rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          fontSize: '0.84rem',
          fontWeight: '700',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          {notice}
        </div>
      )}

      {/* Hint Popover Menu */}
      {showHintPopover && (
        <div 
          className="animate-fade"
          style={{
            padding: '1rem',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--border-thin)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)' }}>
            AVAILABLE LIFELINES
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem' }}>
            {/* 50/50 */}
            <button
              onClick={buyFiftyFifty}
              disabled={fiftyFiftyUsed}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.85rem',
                opacity: fiftyFiftyUsed ? 0.5 : 1,
                fontSize: '0.8rem'
              }}
            >
              <span>50/50 Lifeline</span>
              <span style={{ fontWeight: '800', color: 'var(--theme-yellow)' }}>
                {fiftyFiftyUsed ? 'Used' : '10 Coins'}
              </span>
            </button>

            {/* Bengali Clue */}
            <button
              onClick={buyBengaliClue}
              disabled={bengaliClueUsed}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.85rem',
                opacity: bengaliClueUsed ? 0.5 : 1,
                fontSize: '0.8rem'
              }}
            >
              <span>Bengali Clue</span>
              <span style={{ fontWeight: '800', color: 'var(--theme-green)' }}>
                {bengaliClueUsed ? 'Active' : 'Free'}
              </span>
            </button>

            {/* Mnemonic Aid */}
            <button
              onClick={buyMnemonic}
              disabled={mnemonicUsed}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.85rem',
                opacity: mnemonicUsed ? 0.5 : 1,
                fontSize: '0.8rem'
              }}
            >
              <span>Mnemonic Trick</span>
              <span style={{ fontWeight: '800', color: 'var(--theme-yellow)' }}>
                {mnemonicUsed ? 'Unlocked' : '20 Coins'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Clue Panels (if unlocked) */}
      {bengaliClueUsed && currentQ.bengali_clue && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          backgroundColor: 'rgba(24, 255, 255, 0.08)',
          border: '1px solid rgba(24, 255, 255, 0.25)',
          color: 'var(--text-primary)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontWeight: '800', color: 'var(--theme-cyan)' }}>বাংলা ইঙ্গিত:</span>
          <span style={{ fontFamily: 'var(--font-bengali)', fontWeight: '600' }}>{currentQ.bengali_clue}</span>
        </div>
      )}

      {mnemonicUsed && currentQ.mnemonic && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 215, 0, 0.08)',
          border: '1px solid rgba(255, 215, 0, 0.25)',
          color: 'var(--text-primary)',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Sparkles size={16} color="var(--theme-yellow)" />
          <span style={{ fontWeight: '800', color: 'var(--theme-yellow)' }}>স্মৃতি কৌশল:</span>
          <span>{currentQ.mnemonic}</span>
        </div>
      )}

      {/* Question Card */}
      <div 
        className="card"
        style={{
          padding: '1.75rem',
          borderRadius: '16px',
          border: 'var(--border-thin)',
          boxShadow: 'var(--shadow-tiny)',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <p style={{
          fontSize: '1.15rem',
          lineHeight: '1.6',
          fontWeight: '700',
          color: 'var(--text-primary)',
          margin: 0
        }}>
          {currentQ.question}
        </p>
      </div>

      {/* MCQ Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {currentQ.options.map((option, oIdx) => {
          const letter = ['A', 'B', 'C', 'D'][oIdx];
          const isSelected = selectedOption === option;
          const isCorrect = option === currentQ.correct_answer;
          const isDisabled = disabledOptions.includes(option);

          let optionStyle = {
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            border: 'var(--border-thin)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            cursor: isDisabled ? 'not-allowed' : (isAnswered ? 'default' : 'pointer'),
            opacity: isDisabled ? 0.35 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontWeight: '600',
            fontSize: '0.96rem',
            transition: 'all 0.15s ease'
          };

          if (isAnswered) {
            if (isCorrect) {
              optionStyle.borderColor = '#10b981';
              optionStyle.backgroundColor = 'rgba(16, 185, 129, 0.12)';
              optionStyle.color = '#10b981';
            } else if (isSelected) {
              optionStyle.borderColor = '#ef4444';
              optionStyle.backgroundColor = 'rgba(239, 68, 68, 0.12)';
              optionStyle.color = '#ef4444';
            }
          }

          return (
            <button
              key={oIdx}
              onClick={() => handleAnswer(option)}
              disabled={isDisabled || isAnswered}
              className="mcq-option"
              style={optionStyle}
            >
              <span style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: isAnswered && isCorrect 
                  ? '#10b981' 
                  : (isAnswered && isSelected ? '#ef4444' : 'var(--bg-surface-elevated)'),
                color: isAnswered && (isCorrect || isSelected) ? '#ffffff' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '0.85rem',
                border: 'var(--border-thin)',
                flexShrink: 0
              }}>
                {letter}
              </span>

              <span style={{ flex: 1, textAlign: 'left', wordBreak: 'break-word' }}>
                {option}
              </span>

              {isAnswered && isCorrect && <CheckCircle2 size={20} color="#10b981" />}
              {isAnswered && isSelected && !isCorrect && <XCircle size={20} color="#ef4444" />}
            </button>
          );
        })}
      </div>

      {/* Bottom Action Bar */}
      {isAnswered && (
        <div 
          className="animate-fade"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--border-thin)',
            marginTop: '0.5rem',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <button
            onClick={() => setShowExplanationModal(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
          >
            <HelpCircle size={16} />
            <span>Why is this correct?</span>
          </button>

          <button
            onClick={handleNext}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.5rem', fontWeight: '800' }}
          >
            <span>{currentQIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanationModal && currentQ && (
        <QuizExplanationModal
          question={currentQ}
          isOpen={showExplanationModal}
          onClose={() => setShowExplanationModal(false)}
        />
      )}
    </div>
  );
}
