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

    // Filter out recently used words to prevent immediate repeats
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
      
      // Multiplier effect
      state.addXp(2 * Math.min(answerStreak + 1, 5)); 
      
      // Coins trigger on streak milestones
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
    <div style={{ padding: '1.5rem 1rem', maxWidth: '600px', margin: '0 auto' }} className="animate-fade timeblitz-view-container">
      {/* 1. START GAME SCREEN */}
      {!isPlaying && !isGameOver && (
        <div className="card animate-slide-up" style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, hsla(var(--secondary), 0.08) 100%)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-medium)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--theme-yellow)',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-tiny)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#000'
          }}>
            <Timer size={32} />
          </div>

          <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Ready for Speed?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Answer rapid-fire vocabulary synonyms and antonyms before time runs out.
          </p>

          {/* Quick Rules Pills */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{ padding: '0.6rem 0.3rem', backgroundColor: 'var(--bg-canvas)', border: 'var(--border-thin)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800' }}>START</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--text-primary)' }}>⏱️ 60s</div>
            </div>
            <div style={{ padding: '0.6rem 0.3rem', backgroundColor: 'hsla(var(--success), 0.1)', border: 'var(--border-thin)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'hsl(var(--success))', fontWeight: '800' }}>CORRECT</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '900', color: 'hsl(var(--success))' }}>+3s</div>
            </div>
            <div style={{ padding: '0.6rem 0.3rem', backgroundColor: 'hsla(var(--danger), 0.1)', border: 'var(--border-thin)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--theme-red)', fontWeight: '800' }}>MISTAKE</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--theme-red)' }}>-5s</div>
            </div>
          </div>

          <button 
            onClick={startBlitzGame}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', background: 'var(--theme-yellow)', color: '#000', fontWeight: '900', boxShadow: 'var(--shadow-medium)' }}
          >
            <Play size={18} fill="#000" /> Start Time Blitz
          </button>
        </div>
      )}

      {/* 2. PLAYING GAME LOOP SCREEN */}
      {isPlaying && currentQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Game Stats HUD */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-tiny)'
          }}>
            {/* Left: Timer + Quit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setShowQuitConfirm(true)}
                className="btn btn-secondary"
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer'
                }}
                title="Quit Blitz Run"
              >
                <ArrowLeft size={13} />
                <span>Quit</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: timeRemaining <= 10 ? 'var(--theme-red)' : 'var(--text-primary)', position: 'relative' }}>
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
                    fontSize: '0.95rem',
                    color: timeChange.amount > 0 ? 'var(--theme-green)' : 'var(--theme-red)',
                    textShadow: '1px 1px 0px #000',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}>
                    {timeChange.amount > 0 ? `+${timeChange.amount}s` : `${timeChange.amount}s`}
                  </span>
                )}
              </div>
            </div>

            {/* Answer Streak */}
            {answerStreak >= 2 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--theme-yellow)', color: '#000', fontWeight: '900', fontSize: '0.75rem', border: '1px solid #000' }}>
                <Zap size={13} fill="#000" />
                <span>STREAK x{answerStreak}</span>
              </div>
            )}

            {/* Score */}
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: '900', fontSize: '1.3rem', color: 'hsl(var(--secondary))' }}>
              {score} PTS
            </div>
          </div>

          {/* Rapid Question Board */}
          <div className="glass-panel" style={{
            padding: '2rem 1.5rem',
            textAlign: 'center',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-medium)',
            borderRadius: 'var(--radius-md)'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--secondary))', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ⚡ RAPID TARGET
            </span>
            <h2 style={{ fontSize: '1.85rem', color: 'var(--text-primary)', marginTop: '0.25rem', fontWeight: '900', fontFamily: 'var(--font-title)' }}>
              {currentQuestion.question}
            </h2>
          </div>

          {/* MCQ Blitz Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {currentQuestion.options.map((option, idx) => {
              const isCorrect = option === currentQuestion.correct_answer;
              
              let optClass = '';
              if (isAnswered) {
                if (isCorrect) optClass = 'correct';
                else if (selectedOption === option) optClass = 'wrong';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  disabled={isAnswered}
                  className={`mcq-option ${optClass}`}
                  style={{ 
                    padding: '0.9rem 1.1rem',
                    fontSize: '1rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 'var(--radius-md)',
                    border: 'var(--border-thin)',
                    backgroundColor: 'var(--bg-surface)'
                  }}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 size={18} color="hsl(var(--success))" />}
                  {isAnswered && selectedOption === option && !isCorrect && <XCircle size={18} color="hsl(var(--danger))" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. GAME OVER SCREEN */}
      {isGameOver && (
        <div className="card animate-scale-in" style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, hsla(var(--primary), 0.08) 100%)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-large)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-tiny)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: 'hsl(var(--primary))'
          }}>
            <Award size={32} />
          </div>

          <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Time's Up!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Solid run! Keep training your fast recall.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            padding: '1.25rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-medium)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>FINAL SCORE</div>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'hsl(var(--primary))' }}>
                {score}
              </div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--border-muted)' }} />
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>MAX STREAK</div>
              <div style={{ fontSize: '2.25rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'hsl(var(--secondary))' }}>
                x{answerStreak}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.45rem 1.25rem',
            backgroundColor: 'var(--theme-yellow)',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-tiny)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            color: '#000'
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em' }}>BEST SCORE</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', fontFamily: 'var(--font-title)', lineHeight: '1.1' }}>
              {highScore} PTS
            </div>
          </div>

          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-canvas)',
            border: 'var(--border-thick)',
            textAlign: 'left',
            marginBottom: '1.75rem',
            fontSize: '0.85rem',
            lineHeight: '1.6'
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
              <div style={{ color: 'var(--theme-green)', fontWeight: '900', marginTop: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                🎉 NEW HIGH SCORE RECORD!
              </div>
            )}
          </div>

          <button 
            onClick={startBlitzGame}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', background: 'var(--theme-yellow)', color: '#000', fontWeight: '900', boxShadow: 'var(--shadow-medium)' }}
          >
            <RefreshCw size={16} color="#000" /> Replay Time Blitz
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
