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
    
    // If not enough distractors found, fallback to generic ones
    while (distractors.length < 3) {
      distractors.push(`OPTION_${distractors.length + 1}`);
    }

    const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

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
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }} className="animate-fade timeblitz-view-container">
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap color="hsl(var(--secondary))" fill="hsl(var(--secondary))" /> Time Blitz
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Survival Time Attack. Score correct answers to gain seconds, avoid wrong options.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>HIGH SCORE</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'var(--font-title)', color: 'hsl(var(--secondary))' }}>
            {highScore} pts
          </div>
        </div>
      </div>

      {/* 1. START GAME SCREEN */}
      {!isPlaying && !isGameOver && (
        <div className="glass-panel" style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, hsla(var(--danger), 0.1) 0%, var(--bg-surface) 100%)',
          border: 'var(--border-thick)'
        }}>
          <Timer size={48} color="hsl(var(--danger))" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', marginBottom: '1rem' }}>
            Ready for the Blitz?
          </h3>
          <ul style={{ 
            textAlign: 'left', 
            maxWidth: '350px', 
            margin: '0 auto 2rem', 
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            lineHeight: '1.4'
          }}>
            <li>⏱️ You start with **60 seconds** on the clock.</li>
            <li>✅ Correct answers grant **+3 seconds** and **+10 pts**.</li>
            <li>❌ Incorrect answers deduct **-5 seconds**!</li>
            <li>🔥 Build streaks to compound XP multipliers!</li>
          </ul>
          <button 
            onClick={startBlitzGame}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', background: 'var(--theme-red)', boxShadow: '3px 3px 0px var(--shadow-color)' }}
          >
            <Play size={16} fill="var(--bg-canvas)" /> Launch Blitz Game
          </button>
        </div>
      )}

      {/* 2. PLAYING GAME LOOP SCREEN */}
      {isPlaying && currentQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Game Stats Panel */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-muted)'
          }}>
            {/* Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeRemaining <= 10 ? 'hsl(var(--danger))' : 'var(--text-primary)' }}>
                <Timer size={20} className={timeRemaining <= 10 ? 'animate-shake' : ''} />
                <span style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: '700' }}>
                  {timeRemaining}s
                </span>
              </div>
              
              {/* Floating time feedback */}
              {timeChange.show && (
                <span className="animate-float-fade-up" style={{
                  position: 'absolute',
                  left: '100%',
                  marginLeft: '0.5rem',
                  fontWeight: '800',
                  fontSize: '1rem',
                  color: timeChange.amount > 0 ? 'hsl(var(--success))' : 'var(--theme-red)',
                  textShadow: '1px 1px 0px var(--shadow-color)',
                  pointerEvents: 'none',
                  zIndex: 10
                }}>
                  {timeChange.amount > 0 ? `+${timeChange.amount}s` : `${timeChange.amount}s`}
                </span>
              )}
            </div>

            {/* Answer Streak */}
            {answerStreak >= 2 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: 'hsla(var(--secondary), 0.15)', color: 'hsl(var(--secondary))', fontWeight: '700', fontSize: '0.8rem' }}>
                <Zap size={14} fill="hsl(var(--secondary))" />
                <span>STREAK x{answerStreak} ({Math.min(answerStreak, 5)}x XP)</span>
              </div>
            )}

            {/* Score */}
            <div style={{ fontFamily: 'var(--font-title)', fontWeight: '700', fontSize: '1.25rem', color: 'hsl(var(--primary))' }}>
              {score} Pts
            </div>
          </div>

          {/* Rapid Question Board */}
          <div className="glass-panel" style={{
            padding: '2.5rem 2rem',
            textAlign: 'center',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-main)'
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.1em' }}>
              RAPID DRILL
            </span>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--text-primary)', marginTop: '0.5rem', fontWeight: '700' }}>
              {currentQuestion.question}
            </h2>
          </div>

          {/* MCQ Blitz Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                    padding: '1.1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
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

      {/* 3. GAME OVER OVERLAY */}
      {isGameOver && (
        <div className="glass-panel animate-fade" style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, hsla(var(--secondary), 0.05) 100%)',
          border: 'var(--border-thick)'
        }}>
          <Trophy size={48} color="hsl(var(--secondary))" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Time's Up!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Your final blitz score was **{score} Pts**.
          </p>

          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-muted)',
            textAlign: 'left',
            marginBottom: '2rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>Coins Earned:</span>
              <span style={{ color: 'hsl(var(--coin))', fontWeight: '700' }}>+{Math.floor(score / 20)} Coins</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>XP Granted:</span>
              <span style={{ color: 'hsl(var(--accent-purple))', fontWeight: '700' }}>+{Math.floor(score / 2)} XP</span>
            </div>
            {score === highScore && score > 0 && (
              <div style={{ color: 'hsl(var(--secondary))', fontWeight: '700', marginTop: '0.5rem', textAlign: 'center' }}>
                🎉 NEW BLITZ HIGH SCORE!
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={startBlitzGame}
              className="btn btn-primary"
              style={{ background: 'var(--theme-red)' }}
            >
              <RefreshCw size={14} /> Retry Blitz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
