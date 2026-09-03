import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Zap, 
  Timer, 
  Trophy, 
  Coins, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowLeft, 
  AlertTriangle,
  Flame,
  Sparkles,
  Target,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { shuffleArray } from '../utils/shuffle.js';
import { playCorrectSound, playIncorrectSound } from '../utils/sounds.js';

const HIGH_SCORE_KEY = 'wordsmart_blitz_highscore';

const getBlitzRank = (score) => {
  if (score >= 150) return { title: 'Vocabulary Legend', color: '#FFD54F' };
  if (score >= 100) return { title: 'Speed Demon', color: '#00E676' };
  if (score >= 50) return { title: 'Rapid Scholar', color: '#18FFFF' };
  if (score > 0) return { title: 'Blitz Cadet', color: '#E040FB' };
  return { title: 'Rookie Run', color: 'var(--text-muted)' };
};

export default function TimeBlitzView({ state, wordsData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerStreak, setAnswerStreak] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeChange, setTimeChange] = useState({ show: false, amount: 0 });
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
    } catch (e) {
      console.error('Failed to load blitz high score', e);
      return 0;
    }
  });
  
  const timerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);
  const recentWordsRef = useRef([]);

  // Synchronize active game state globally
  useEffect(() => {
    if (state?.setIsQuizActive) {
      state.setIsQuizActive(isPlaying && !isGameOver);
    }
    return () => {
      if (state?.setIsQuizActive) {
        state.setIsQuizActive(false);
      }
    };
  }, [isPlaying, isGameOver, state?.setIsQuizActive]);

  // Filter core vocabulary to only include words that have synonyms or antonyms
  const validWords = useMemo(() => {
    return (wordsData?.words || []).filter(
      (wordObj) =>
        (wordObj.synonyms && wordObj.synonyms.length > 0) ||
        (wordObj.antonyms && wordObj.antonyms.length > 0)
    );
  }, [wordsData?.words]);

  // Generate a rapid-fire synonym/antonym question
  const generateBlitzQuestion = () => {
    if (validWords.length === 0) return;

    let availableWords = validWords.filter(w => !recentWordsRef.current.includes(w.word));
    if (availableWords.length === 0) {
      availableWords = validWords;
    }

    const wordObj = availableWords[Math.floor(Math.random() * availableWords.length)];
    recentWordsRef.current = [...recentWordsRef.current, wordObj.word].slice(-20);
    
    const isSynonym = wordObj.synonyms && wordObj.synonyms.length > 0 
      ? (wordObj.antonyms && wordObj.antonyms.length > 0 ? Math.random() > 0.5 : true) 
      : false;
    
    let questionText = '';
    let correctAnswer = '';

    if (isSynonym) {
      questionText = `Synonym of "${wordObj.word.toUpperCase()}"`;
      correctAnswer = wordObj.synonyms[Math.floor(Math.random() * wordObj.synonyms.length)].toUpperCase();
    } else {
      questionText = `Antonym of "${wordObj.word.toUpperCase()}"`;
      correctAnswer = wordObj.antonyms[Math.floor(Math.random() * wordObj.antonyms.length)].toUpperCase();
    }

    // Generate wrong options
    const distractors = [];
    let attempts = 0;
    while (distractors.length < 3 && attempts < 100) {
      attempts++;
      const rand = wordsData.words[Math.floor(Math.random() * wordsData.words.length)];
      if (!rand || !rand.word) continue;
      const dist = rand.word.toUpperCase();
      if (dist !== correctAnswer && dist !== wordObj.word.toUpperCase() && !distractors.includes(dist)) {
        distractors.push(dist);
      }
    }
    
    if (distractors.length < 3 && (wordsData?.words || []).length) {
      for (const w of wordsData.words) {
        if (!w || !w.word) continue;
        const dist = w.word.toUpperCase();
        if (dist !== correctAnswer && dist !== wordObj.word.toUpperCase() && !distractors.includes(dist)) {
          distractors.push(dist);
        }
        if (distractors.length >= 3) break;
      }
    }

    const options = shuffleArray([correctAnswer, ...distractors]);

    setCurrentQuestion({
      targetWord: wordObj.word,
      question: questionText,
      correct_answer: correctAnswer,
      options: options
    });
  };

  const startBlitzGame = () => {
    setIsGameOver(false);
    setScore(0);
    setAnswerStreak(0);
    setTimeRemaining(60);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowQuitConfirm(false);
    recentWordsRef.current = [];
    generateBlitzQuestion();
    setIsPlaying(true);
  };

  const handleOptionClick = (option) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setSelectedOption(option);
    
    const isCorrect = option === currentQuestion.correct_answer;
    
    if (isCorrect) {
      playCorrectSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(25);
      }

      setScore((prev) => prev + 10);
      setAnswerStreak((prev) => prev + 1);
      setTimeRemaining((prev) => Math.min(prev + 3, 90));
      setTimeChange({ show: true, amount: 3 });
      
      state.addXp(2 * Math.min(answerStreak + 1, 5)); 
      
      if ((answerStreak + 1) % 5 === 0) {
        state.addCoins(5);
        confetti({
          particleCount: 20,
          spread: 40,
          colors: ['hsl(var(--coin))', 'hsl(var(--secondary))']
        });
      }
    } else {
      playIncorrectSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
      setAnswerStreak(0);
      setTimeRemaining((prev) => Math.max(prev - 5, 0));
      setTimeChange({ show: true, amount: -5 });
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeChange({ show: false, amount: 0 });
      generateBlitzQuestion();
    }, 600);
  };

  // Timer loop - automatically pauses when quit confirmation dialog is open
  useEffect(() => {
    if (isPlaying && timeRemaining > 0 && !showQuitConfirm) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isPlaying) {
      clearInterval(timerRef.current);
      setIsPlaying(false);
      setIsGameOver(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeChange({ show: false, amount: 0 });

      if (score > highScore) {
        setHighScore(score);
        try {
          localStorage.setItem(HIGH_SCORE_KEY, score.toString());
        } catch (e) {
          console.error('Failed to load blitz high score', e);
        }
        confetti({
          particleCount: 50,
          spread: 60
        });
      }

      const coinsEarned = Math.floor(score / 20);
      state.addCoins(coinsEarned);
      state.addXp(Math.floor(score / 2));
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, timeRemaining, showQuitConfirm, score, highScore, state]);

  // Clean up timer and feedback timeout on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const handleQuitBlitz = () => {
    clearInterval(timerRef.current);
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setShowQuitConfirm(false);
    setIsPlaying(false);
    setIsGameOver(false);
    if (state?.setIsQuizActive) state.setIsQuizActive(false);
  };

  const rank = getBlitzRank(highScore);

  return (
    <div style={{ padding: '1rem', maxWidth: '640px', margin: '0 auto' }} className="animate-fade timeblitz-view-container">
      {/* 1. START GAME SCREEN: Compact Punchy Arcade Card */}
      {!isPlaying && !isGameOver && (
        <div className="blitz-arcade-card animate-slide-up">
          {/* Top Header Section */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.8rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 213, 79, 0.2)',
              border: '1.5px solid var(--theme-yellow)',
              color: 'var(--text-primary)',
              fontSize: '0.72rem',
              fontWeight: '900',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.65rem'
            }}>
              <Zap size={13} color="var(--theme-yellow)" fill="var(--theme-yellow)" />
              <span>60-Second Challenge</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.1rem, 6vw, 2.75rem)',
              fontFamily: 'var(--font-title)',
              fontWeight: '900',
              color: 'var(--text-primary)',
              lineHeight: '1.1',
              margin: '0 0 0.35rem 0',
              letterSpacing: '-0.02em'
            }}>
              TIME BLITZ
            </h1>

            <p style={{
              fontSize: '0.92rem',
              color: 'var(--text-secondary)',
              margin: '0',
              fontWeight: '600'
            }}>
              Rapid Recall • Synonyms & Antonyms
            </p>
          </div>

          {/* Middle Body Section: Best Score + 3 Rule Pills */}
          <div style={{ width: '100%', margin: '1.5rem 0' }}>
            {/* Personal Record Showcase */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.15rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '2px solid var(--border-muted)',
              borderRadius: '16px',
              boxShadow: '3px 3px 0px var(--shadow-color)',
              marginBottom: '1rem',
              width: '100%'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #FFD54F 0%, #FFA000 100%)',
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000000',
                  flexShrink: 0
                }}>
                  <Trophy size={20} strokeWidth={2.5} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    PERSONAL RECORD
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'var(--text-primary)', lineHeight: '1.1' }}>
                    {highScore > 0 ? `${highScore} PTS` : '0 PTS'}
                  </div>
                </div>
              </div>

              <span style={{
                fontSize: '0.75rem',
                fontWeight: '900',
                color: rank.color,
                backgroundColor: 'rgba(0,0,0,0.25)',
                padding: '0.3rem 0.7rem',
                borderRadius: '9999px',
                border: `1.5px solid ${rank.color}`
              }}>
                {rank.title}
              </span>
            </div>

            {/* 3 Quick Game Rule Pills */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.65rem',
              width: '100%'
            }}>
              {/* Start Pill */}
              <div className="blitz-pill blitz-pill-neutral">
                <span className="pill-label">CLOCK</span>
                <span className="pill-value">⏱️ 60s</span>
              </div>

              {/* Correct Pill */}
              <div className="blitz-pill blitz-pill-correct">
                <span className="pill-label">MATCH</span>
                <span className="pill-value">+3s</span>
              </div>

              {/* Mistake Pill */}
              <div className="blitz-pill blitz-pill-mistake">
                <span className="pill-label">MISS</span>
                <span className="pill-value">-5s</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Section */}
          <div style={{ width: '100%' }}>
            <button 
              onClick={startBlitzGame}
              className="blitz-cta-btn"
              style={{ width: '100%', maxWidth: '100%' }}
            >
              <Play size={20} fill="#000" /> Start Time Blitz
            </button>
          </div>
        </div>
      )}

      {/* 2. PLAYING GAME LOOP SCREEN */}
      {isPlaying && currentQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
          {/* Game Stats HUD */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1.25rem',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '2.5px solid var(--border-muted)',
            boxShadow: '4px 4px 0px var(--shadow-color)'
          }}>
            {/* Left: Timer + Quit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setShowQuitConfirm(true)}
                className="btn btn-secondary"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  fontFamily: 'var(--font-title)',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-secondary)',
                  border: 'var(--border-thin)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                title="Quit Blitz Run"
                aria-label="Quit Blitz Run"
              >
                <ArrowLeft size={14} />
                <span>Quit</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: timeRemaining <= 10 ? 'var(--quiz-incorrect-text)' : 'var(--text-primary)', position: 'relative' }}>
                <Timer size={18} className={timeRemaining <= 10 ? 'animate-shake' : ''} />
                <span style={{ fontSize: '1.3rem', fontFamily: 'var(--font-title)', fontWeight: '900' }}>
                  {timeRemaining}s
                </span>

                {/* Floating time feedback */}
                {timeChange.show && (
                  <span className="animate-float-fade-up" style={{
                    position: 'absolute',
                    left: '100%',
                    marginLeft: '0.5rem',
                    fontWeight: '900',
                    fontSize: '1rem',
                    color: timeChange.amount > 0 ? 'var(--quiz-correct-text)' : 'var(--quiz-incorrect-text)',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}>
                    {timeChange.amount > 0 ? `+${timeChange.amount}s` : `${timeChange.amount}s`}
                  </span>
                )}
              </div>
            </div>

            {/* Answer Streak Badge */}
            {answerStreak >= 2 && (
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.25rem', 
                padding: '0.25rem 0.65rem', 
                borderRadius: '9999px', 
                backgroundColor: 'var(--theme-yellow)', 
                color: '#000000', 
                fontWeight: '900', 
                fontSize: '0.78rem', 
                border: '2px solid #000000',
                boxShadow: '2px 2px 0px #000000'
              }}>
                <Zap size={14} fill="#000000" />
                <span>STREAK x{answerStreak}</span>
              </div>
            )}

            {/* Score Display */}
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: '900', fontSize: '1.3rem', color: 'hsl(var(--secondary))' }}>
              {score} PTS
            </div>
          </div>

          {/* Rapid Question Board */}
          <div className="blitz-question-box">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', padding: '0.2rem 0.65rem', borderRadius: '9999px', backgroundColor: 'rgba(255, 179, 0, 0.15)', border: '1px solid rgba(255, 179, 0, 0.4)' }}>
              <Zap size={14} color="#D97706" fill="#D97706" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                RAPID TARGET
              </span>
            </div>
            <h2 style={{ fontSize: '1.65rem', color: 'var(--text-primary)', lineHeight: '1.4', fontWeight: '900', fontFamily: 'var(--font-title)', margin: 0 }}>
              {currentQuestion.question}
            </h2>
          </div>

          {/* MCQ Blitz Options - Uniform Letter Badges (A, B, C, D) & Neo-Brutalist Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {currentQuestion.options.map((option, idx) => {
              const isCorrect = option === currentQuestion.correct_answer;
              const isSelected = selectedOption === option;

              let optClass = '';
              if (isAnswered) {
                if (isCorrect) optClass = 'correct';
                else if (isSelected) optClass = 'wrong';
              }

              const letterBadges = ['A', 'B', 'C', 'D'];
              const letterFills = ['#0284C7', '#A855F7', '#F59E0B', '#10B981'];

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  disabled={isAnswered}
                  className={`mcq-option ${optClass}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderRadius: '16px',
                    border: '2.5px solid var(--border-muted)',
                    boxShadow: '4px 4px 0px var(--shadow-color)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    cursor: isAnswered ? 'default' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                    <span style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      border: '2px solid #000000',
                      backgroundColor: letterFills[idx % 4],
                      color: '#FFFFFF',
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
                  {isAnswered && isCorrect && <CheckCircle2 size={22} color="var(--quiz-correct-text)" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={22} color="var(--quiz-incorrect-text)" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. GAME OVER SCREEN */}
      {isGameOver && (
        <div className="blitz-card animate-scale-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFD54F 0%, #FFA000 100%)',
            border: '2.5px solid #000000',
            boxShadow: '3px 3px 0px #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#000000'
          }}>
            <Award size={36} strokeWidth={2.5} />
          </div>

          <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            Time's Up!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            Solid run! Keep training your fast recall.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            padding: '1.25rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '2px solid var(--border-muted)',
            boxShadow: '4px 4px 0px var(--shadow-color)',
            borderRadius: '16px',
            marginBottom: '1.25rem',
            maxWidth: '420px',
            margin: '0 auto 1.25rem'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)' }}>FINAL SCORE</div>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'hsl(var(--primary))' }}>
                {score}
              </div>
            </div>
            <div style={{ width: '2px', backgroundColor: 'var(--border-muted)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)' }}>MAX STREAK</div>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'hsl(var(--secondary))' }}>
                x{answerStreak}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.65rem 1.25rem',
            backgroundColor: 'var(--theme-yellow)',
            border: '2px solid #000000',
            boxShadow: '3px 3px 0px #000000',
            borderRadius: '14px',
            marginBottom: '1.5rem',
            maxWidth: '420px',
            margin: '0 auto 1.5rem',
            color: '#000000'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>BEST SCORE</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', fontFamily: 'var(--font-title)', lineHeight: '1.1' }}>
              {highScore} PTS
            </div>
          </div>

          <div style={{
            padding: '1.15rem 1.25rem',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '2px solid var(--border-muted)',
            boxShadow: '4px 4px 0px var(--shadow-color)',
            textAlign: 'left',
            marginBottom: '1.75rem',
            fontSize: '0.9rem',
            lineHeight: '1.7',
            maxWidth: '420px',
            margin: '0 auto 1.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
              <span>Coins Earned:</span>
              <span style={{ color: 'hsl(var(--secondary))', fontWeight: '900' }}>+{Math.floor(score / 20)} Coins</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
              <span>XP Granted:</span>
              <span style={{ color: 'hsl(var(--primary))', fontWeight: '900' }}>+{Math.floor(score / 2)} XP</span>
            </div>
            {score === highScore && score > 0 && (
              <div style={{ color: 'var(--quiz-correct-text)', fontWeight: '900', marginTop: '0.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
                🎉 NEW HIGH SCORE RECORD!
              </div>
            )}
          </div>

          <button 
            onClick={startBlitzGame}
            className="blitz-cta-btn"
            style={{ maxWidth: '420px' }}
          >
            <RefreshCw size={18} color="#000000" /> Replay Time Blitz
          </button>
        </div>
      )}

      {/* Quit Blitz Confirmation Modal */}
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
                Quit Time Blitz?
              </h3>
              <p style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                margin: 0
              }}>
                Your current blitz score and streak will end. Are you sure you want to quit?
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
                Keep Blitzing
              </button>

              <button
                onClick={handleQuitBlitz}
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
