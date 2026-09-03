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
  AlertTriangle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { shuffleArray } from '../utils/shuffle.js';
import { playCorrectSound, playIncorrectSound } from '../utils/sounds.js';

const HIGH_SCORE_KEY = 'wordsmart_blitz_highscore';

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

  return (
    <div style={{ padding: '1.5rem 1rem', maxWidth: '800px', margin: '0 auto' }} className="animate-fade timeblitz-view-container">
      {/* 1. START GAME SCREEN */}
      {!isPlaying && !isGameOver && (
        <div style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(224, 64, 251, 0.12) 0%, rgba(24, 255, 255, 0.1) 50%, var(--bg-surface) 100%)',
          border: '3px solid #000000',
          boxShadow: '6px 6px 0px #000000',
          borderRadius: '20px'
        }} className="animate-slide-up">
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
            margin: '0 auto 1.25rem',
            color: '#000000'
          }}>
            <Timer size={32} strokeWidth={2.5} />
          </div>

          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Ready for Speed?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem', maxWidth: '460px', margin: '0 auto 1.75rem' }}>
            Answer rapid-fire vocabulary synonyms and antonyms before time runs out.
          </p>

          {/* Quick Rules Pills */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            maxWidth: '460px',
            margin: '0 auto 2rem'
          }}>
            <div style={{ padding: '0.75rem 0.5rem', backgroundColor: 'var(--bg-surface)', border: '2px solid #000', boxShadow: '2px 2px 0px #000', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '800' }}>START</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-primary)' }}>⏱️ 60s</div>
            </div>
            <div style={{ padding: '0.75rem 0.5rem', backgroundColor: 'rgba(105, 240, 174, 0.25)', border: '2px solid #000', boxShadow: '2px 2px 0px #000', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#00E676', fontWeight: '800' }}>CORRECT</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#00E676' }}>+3s</div>
            </div>
            <div style={{ padding: '0.75rem 0.5rem', backgroundColor: 'rgba(255, 82, 82, 0.25)', border: '2px solid #000', boxShadow: '2px 2px 0px #000', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#FF5252', fontWeight: '800' }}>MISTAKE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#FF5252' }}>-5s</div>
            </div>
          </div>

          <button 
            onClick={startBlitzGame}
            className="btn btn-primary"
            style={{ 
              maxWidth: '360px', 
              width: '100%', 
              padding: '1rem', 
              fontSize: '1.1rem', 
              background: 'var(--theme-yellow)', 
              color: '#000', 
              fontWeight: '900', 
              border: '3px solid #000', 
              boxShadow: '4px 4px 0px #000', 
              borderRadius: '16px' 
            }}
          >
            <Play size={20} fill="#000" /> Start Time Blitz
          </button>
        </div>
      )}

      {/* 2. PLAYING GAME LOOP SCREEN */}
      {isPlaying && currentQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Game Stats HUD - Neo-Brutalist styling matching QuizRunner */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1.25rem',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px #000000'
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: timeRemaining <= 10 ? '#FF5252' : 'var(--text-primary)', position: 'relative' }}>
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
                    color: timeChange.amount > 0 ? '#00E676' : '#FF5252',
                    textShadow: '1px 1px 0px #000',
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
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: '900', fontSize: '1.3rem', color: 'var(--theme-yellow)' }}>
              {score} PTS
            </div>
          </div>

          {/* Rapid Question Board - Signature Neo-Brutalist Gradient Question Box */}
          <div style={{
            padding: '2.25rem 2.5rem',
            background: 'linear-gradient(135deg, rgba(224, 64, 251, 0.12) 0%, rgba(24, 255, 255, 0.1) 50%, var(--bg-surface) 100%)',
            border: '3px solid #000000',
            boxShadow: '6px 6px 0px #000000',
            borderRadius: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <Zap size={15} color="var(--theme-yellow)" fill="var(--theme-yellow)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--theme-yellow)', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
              const letterFills = ['#18FFFF', '#E040FB', '#FFD54F', '#69F0AE'];

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
                    border: '3px solid #000000',
                    boxShadow: '4px 4px 0px #000000',
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
        </div>
      )}

      {/* 3. GAME OVER SCREEN */}
      {isGameOver && (
        <div style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(224, 64, 251, 0.12) 0%, rgba(24, 255, 255, 0.1) 50%, var(--bg-surface) 100%)',
          border: '3px solid #000000',
          boxShadow: '6px 6px 0px #000000',
          borderRadius: '20px'
        }} className="animate-scale-in">
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
            margin: '0 auto 1rem',
            color: '#000000'
          }}>
            <Award size={34} strokeWidth={2.5} />
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
            backgroundColor: 'var(--bg-surface)',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px #000000',
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
            <div style={{ width: '2px', backgroundColor: '#000000' }} />
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)' }}>MAX STREAK</div>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'var(--theme-yellow)' }}>
                x{answerStreak}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.55rem 1.25rem',
            backgroundColor: 'var(--theme-yellow)',
            border: '2px solid #000000',
            boxShadow: '3px 3px 0px #000000',
            borderRadius: '14px',
            marginBottom: '1.5rem',
            maxWidth: '420px',
            margin: '0 auto 1.5rem',
            color: '#000000'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>BEST SCORE</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', fontFamily: 'var(--font-title)', lineHeight: '1.1' }}>
              {highScore} PTS
            </div>
          </div>

          <div style={{
            padding: '1.15rem 1.25rem',
            borderRadius: '16px',
            backgroundColor: 'var(--bg-surface)',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px #000000',
            textAlign: 'left',
            marginBottom: '1.75rem',
            fontSize: '0.9rem',
            lineHeight: '1.7',
            maxWidth: '420px',
            margin: '0 auto 1.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
              <span>Coins Earned:</span>
              <span style={{ color: 'var(--theme-yellow)', fontWeight: '900' }}>+{Math.floor(score / 20)} Coins</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
              <span>XP Granted:</span>
              <span style={{ color: 'hsl(var(--primary))', fontWeight: '900' }}>+{Math.floor(score / 2)} XP</span>
            </div>
            {score === highScore && score > 0 && (
              <div style={{ color: '#00E676', fontWeight: '900', marginTop: '0.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
                🎉 NEW HIGH SCORE RECORD!
              </div>
            )}
          </div>

          <button 
            onClick={startBlitzGame}
            className="btn btn-primary"
            style={{ 
              maxWidth: '420px', 
              width: '100%', 
              padding: '0.95rem', 
              fontSize: '1.05rem', 
              background: 'var(--theme-yellow)', 
              color: '#000000', 
              fontWeight: '900', 
              border: '3px solid #000000', 
              boxShadow: '4px 4px 0px #000000', 
              borderRadius: '16px' 
            }}
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
