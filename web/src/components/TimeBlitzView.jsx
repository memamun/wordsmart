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
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { shuffleArray } from '../utils/shuffle.js';

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
      availableWords = validWords; // Fallback if all words are marked as recent
    }

    // Pick a random word from the available list
    const wordObj = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    // Add to recent words list, keeping only the last 20 words
    recentWordsRef.current = [...recentWordsRef.current, wordObj.word].slice(-20);
    
    // Choose relationship: synonym (0) or antonym (1)
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
    
    // If not enough distractors found, fallback to selecting distinct core words
    if (distractors.length < 3 && (wordsData?.words || []).length) {
      for (const w of wordsData.words) {
        if (!w || !w.word) continue;
        const dist = w.word.toUpperCase();
        if (dist !== correctAnswer && dist !== wordObj.word.toUpperCase() && !distractors.includes(dist)) {
          distractors.push(dist);
          if (distractors.length === 3) break;
        }
      }
    }

    const options = shuffleArray([correctAnswer, ...distractors]);

    setCurrentQuestion({
      question: questionText,
      options,
      correct_answer: correctAnswer
    });
  };

  const startBlitzGame = () => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setIsPlaying(true);
    setIsGameOver(false);
    setTimeRemaining(60);
    setScore(0);
    setAnswerStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeChange({ show: false, amount: 0 });
    recentWordsRef.current = [];
    generateBlitzQuestion();
  };

  const handleOptionClick = (option) => {
    if (isAnswered) return; // Prevent double clicks
    
    setIsAnswered(true);
    setSelectedOption(option);
    
    const isCorrect = option === currentQuestion.correct_answer;
    
    if (isCorrect) {
      setScore((prev) => prev + 10);
      setAnswerStreak((prev) => prev + 1);
      setTimeRemaining((prev) => Math.min(prev + 3, 90)); // add 3s, max 90s
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
      setAnswerStreak(0);
      setTimeRemaining((prev) => Math.max(prev - 5, 0)); // deduct 5s
      setTimeChange({ show: true, amount: -5 });
    }

    // Delay generating next question to show feedback
    feedbackTimeoutRef.current = setTimeout(() => {
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeChange({ show: false, amount: 0 });
      generateBlitzQuestion();
    }, 600); // 600ms feedback duration
  };

  // Timer loop
  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isPlaying) {
      // Game Over
      clearInterval(timerRef.current);
      setIsPlaying(false);
      setIsGameOver(true);
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeChange({ show: false, amount: 0 });

      // Check for new High Score
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

      // Final rewards
      const coinsEarned = Math.floor(score / 20);
      state.addCoins(coinsEarned);
      state.addXp(Math.floor(score / 2));
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, timeRemaining, score, highScore, state]);

  // Clean up timer and feedback timeout on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

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
            {/* Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: timeRemaining <= 10 ? 'var(--theme-red)' : 'var(--text-primary)' }}>
                <Timer size={18} className={timeRemaining <= 10 ? 'animate-shake' : ''} />
                <span style={{ fontSize: '1.3rem', fontFamily: 'var(--font-title)', fontWeight: '900' }}>
                  {timeRemaining}s
                </span>
              </div>
              
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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '48px'
                  }}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 size={18} color="var(--theme-green)" />}
                  {isAnswered && selectedOption === option && !isCorrect && <XCircle size={18} color="var(--theme-red)" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. GAME OVER OVERLAY */}
      {isGameOver && (
        <div className="card animate-fade" style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, hsla(var(--secondary), 0.08) 100%)',
          border: 'var(--border-thick)',
          boxShadow: 'var(--shadow-medium)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <Trophy size={48} color="var(--theme-yellow)" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Time's Up!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem', fontWeight: '700' }}>
            Final Blitz Score: <strong style={{ color: 'hsl(var(--secondary))', fontSize: '1.2rem' }}>{score} PTS</strong>
          </p>

          {/* Best Score Badge */}
          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
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
    </div>
  );
}
