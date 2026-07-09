import React, { useState, useEffect, useRef } from 'react';
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
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
  });
  
  const timerRef = useRef(null);

  // Generate a rapid-fire synonym/antonym question
  const generateBlitzQuestion = () => {
    if (wordsData.words.length === 0) return;

    // Pick a random word from the database
    const wordObj = wordsData.words[Math.floor(Math.random() * wordsData.words.length)];
    
    // Choose relationship: synonym (0) or antonym (1)
    const isSynonym = wordObj.synonyms && wordObj.synonyms.length > 0 ? (wordObj.antonyms && wordObj.antonyms.length > 0 ? Math.random() > 0.5 : true) : false;
    
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
    while (distractors.length < 3) {
      const rand = wordsData.words[Math.floor(Math.random() * wordsData.words.length)];
      const dist = rand.word.toUpperCase();
      if (dist !== correctAnswer && dist !== wordObj.word.toUpperCase() && !distractors.includes(dist)) {
        distractors.push(dist);
      }
    }

    const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      question: questionText,
      options,
      correct_answer: correctAnswer
    });
  };

  const startBlitzGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setTimeRemaining(60);
    setScore(0);
    setAnswerStreak(0);
    generateBlitzQuestion();
  };

  const handleOptionClick = (option) => {
    const isCorrect = option === currentQuestion.correct_answer;
    
    if (isCorrect) {
      setScore((prev) => prev + 10);
      setAnswerStreak((prev) => prev + 1);
      setTimeRemaining((prev) => Math.min(prev + 3, 90)); // add 3s, max 90s
      
      // Multiplier effect
      state.addXp(2 * Math.min(answerStreak + 1, 5)); 
      
      // Coins trigger on streak milestones
      if ((answerStreak + 1) % 5 === 0) {
        state.addCoins(5);
        confetti({
          particleCount: 20,
          spread: 40,
          colors: ['#FBBF24', '#F59E0B']
        });
      }
    } else {
      setAnswerStreak(0);
      setTimeRemaining((prev) => Math.max(prev - 5, 0)); // deduct 5s
    }

    generateBlitzQuestion();
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

      // Check for new High Score
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
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
  }, [isPlaying, timeRemaining]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }} className="animate-fade">
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap color="hsl(var(--secondary))" fill="hsl(var(--secondary))" /> Time Blitz
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
            Survival Time Attack. Score correct answers to gain seconds, avoid wrong options.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '700' }}>HIGH SCORE</div>
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
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(30, 41, 59, 0.5) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <Timer size={48} color="hsl(var(--danger))" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', marginBottom: '1rem' }}>
            Ready for the Blitz?
          </h3>
          <ul style={{ 
            textAlign: 'left', 
            maxWidth: '350px', 
            margin: '0 auto 2rem', 
            color: 'hsl(var(--text-secondary))',
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
            style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
          >
            <Play size={16} fill="black" /> Launch Blitz Game
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
            backgroundColor: 'hsl(var(--bg-surface))',
            border: '1px solid hsl(var(--border-muted))'
          }}>
            {/* Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeRemaining <= 10 ? 'hsl(var(--danger))' : 'hsl(var(--text-primary))' }}>
              <Timer size={20} className={timeRemaining <= 10 ? 'animate-shake' : ''} />
              <span style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: '700' }}>
                {timeRemaining}s
              </span>
            </div>

            {/* Answer Streak */}
            {answerStreak >= 2 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontWeight: '700', fontSize: '0.8rem' }}>
                <Zap size={14} fill="#F59E0B" />
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
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
            <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: '700', letterSpacing: '0.1em' }}>
              RAPID DRILL
            </span>
            <h2 style={{ fontSize: '2.25rem', color: 'white', marginTop: '0.5rem', fontWeight: '700' }}>
              {currentQuestion.question}
            </h2>
          </div>

          {/* MCQ Blitz Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                className="mcq-option"
                style={{ padding: '1.1rem' }}
              >
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. GAME OVER OVERLAY */}
      {isGameOver && (
        <div className="glass-panel animate-fade" style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(245, 158, 11, 0.05) 100%)',
          border: '1px solid hsla(var(--secondary), 0.2)'
        }}>
          <Trophy size={48} color="hsl(var(--secondary))" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Time's Up!
          </h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>
            Your final blitz score was **{score} Pts**.
          </p>

          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(var(--bg-canvas) / 0.8)',
            border: '1px solid hsl(var(--border-muted))',
            textAlign: 'left',
            marginBottom: '2rem',
            fontSize: '0.85rem',
            color: 'hsl(var(--text-secondary))',
            lineHeight: '1.5'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>Coins Earned:</span>
              <span style={{ color: '#FBBF24', fontWeight: '700' }}>+{Math.floor(score / 20)} Coins</span>
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
              style={{ background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)' }}
            >
              <RefreshCw size={14} /> Retry Blitz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
