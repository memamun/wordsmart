import React, { useState, useEffect } from 'react';
import { 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ArrowLeft, 
  Sparkles, 
  Coins, 
  BookOpen, 
  RefreshCw,
  Eye,
  Zap,
  Target,
  Shield,
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { shuffleArray } from '../utils/shuffle.js';

export default function QuizzesView({ state, wordsData, setActiveView, selectedUnit, setSelectedUnit }) {
  const levelWords = React.useMemo(() => {
    return wordsData.getWordsForLevel(state.unlockedLevel);
  }, [wordsData, state.unlockedLevel]);

  const unitWords = React.useMemo(() => {
    return wordsData.getWordsForUnit(state.unlockedLevel, selectedUnit || 1);
  }, [wordsData, state.unlockedLevel, selectedUnit]);

  const levelQuizzes = React.useMemo(() => {
    return wordsData.getQuizzesForLevel(state.unlockedLevel);
  }, [wordsData, state.unlockedLevel]);

  // Quiz running state
  const [activeQuiz, setActiveQuiz] = useState(null); // null, 'qualification', 'unit_qualification', or a quiz object
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

  // Generate dynamic qualification quiz from words in this level / unit
  const generateQualificationQuiz = (isUnitOnly = false) => {
    const targetWords = isUnitOnly ? unitWords : levelWords;
    if (targetWords.length < 5) return;
    
    // Choose 10 random words from the pool using Fisher-Yates shuffle
    const shuffledWords = shuffleArray(targetWords);
    const selectedWords = shuffledWords.slice(0, Math.min(10, shuffledWords.length));
    
    const generatedQuestions = selectedWords.map((wordObj, index) => {
      // Pick question type: 0 = synonym, 1 = antonym, 2 = definition
      const qType = Math.random() > 0.5 ? 2 : (wordObj.synonyms && wordObj.synonyms.length > 0 ? 0 : 2);
      
      let questionText = '';
      let correctAnswer = '';
      
      if (qType === 0) {
        questionText = `Which of the following is a SYNONYM for the word: "${wordObj.word.toUpperCase()}"?`;
        correctAnswer = wordObj.synonyms[Math.floor(Math.random() * wordObj.synonyms.length)].toUpperCase();
      } else if (qType === 1 && wordObj.antonyms && wordObj.antonyms.length > 0) {
        questionText = `Which of the following is an ANTONYM for the word: "${wordObj.word.toUpperCase()}"?`;
        correctAnswer = wordObj.antonyms[Math.floor(Math.random() * wordObj.antonyms.length)].toUpperCase();
      } else {
        questionText = `Which word matches the definition: "${wordObj.definition}"?`;
        correctAnswer = wordObj.word.toUpperCase();
      }

      // Generate wrong options (distractors)
      const distractors = [];
      while (distractors.length < 3) {
        const randWord = wordsData.words[Math.floor(Math.random() * wordsData.words.length)];
        const dist = qType === 2 ? randWord.word.toUpperCase() : (randWord.synonyms && randWord.synonyms.length > 0 ? randWord.synonyms[0].toUpperCase() : randWord.word.toUpperCase());
        if (dist !== correctAnswer && dist !== wordObj.word.toUpperCase() && !distractors.includes(dist)) {
          distractors.push(dist);
        }
      }

      // Shuffle options using Fisher-Yates to guarantee unbiased positioning
      const options = shuffleArray([correctAnswer, ...distractors]);

      return {
        question_number: index + 1,
        question: questionText,
        options,
        correct_answer: correctAnswer,
        explanation: `The correct answer is "${correctAnswer}". "${wordObj.word.toUpperCase()}" means: ${wordObj.definition}.`,
        bengali_clue: wordObj.bengali_meaning || 'সমার্থক অর্থ পাওয়া যায়নি।',
        mnemonic: wordObj.mnemonic || 'কোনো কৌশল সংরক্ষিত নেই।',
        targetWord: wordObj
      };
    });

    setQuestions(generatedQuestions);
    setCurrentQIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setQuizFinished(false);
    resetHints();
    setActiveQuiz(isUnitOnly ? 'unit_qualification' : 'qualification');
  };

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
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 15,
        spread: 25,
        origin: { y: 0.8 }
      });
    }
  };

  const handleNext = () => {
    setIsAnswered(false);
    setSelectedOption(null);
    resetHints();

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      // If it is qualification exam, record attempt in game state
      if (activeQuiz === 'qualification') {
        const percent = Math.round((score / questions.length) * 100);
        state.recordQuizAttempt(state.unlockedLevel, percent);
      } else if (activeQuiz === 'unit_qualification') {
        // Unit Qualification Quiz awards solid bonus
        state.addCoins(15);
        state.addXp(80);
      } else {
        // Practice quiz gives small coin bonus
        state.addCoins(5);
        state.addXp(30);
      }
    }
  };

  if (wordsData.loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading quizzes...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }} className="animate-fade quiz-view-container">
      {/* 1. QUIZ LIST VIEW */}
      {!activeQuiz && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Unified 1-Row Header & Unit Stepper */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <button 
              onClick={() => setActiveView('dashboard')}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '9999px' }}
            >
              <ArrowLeft size={14} /> Roadmap
            </button>

            {/* Sleek Unit Stepper Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedUnit && selectedUnit > 1 && setSelectedUnit(selectedUnit - 1)}
                disabled={!selectedUnit || selectedUnit <= 1}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', borderRadius: '9999px', opacity: (!selectedUnit || selectedUnit <= 1) ? 0.4 : 1 }}
                title="Previous Unit"
              >
                <ChevronLeft size={14} /> <span className="hide-mobile">Prev</span>
              </button>
              
              <span style={{ 
                fontSize: '0.82rem', 
                padding: '0.2rem 0.75rem', 
                backgroundColor: 'var(--theme-yellow)', 
                color: '#000', 
                fontWeight: '900', 
                fontFamily: 'var(--font-title)',
                borderRadius: '9999px',
                border: 'var(--border-thin)',
                boxShadow: 'var(--shadow-tiny)',
                whiteSpace: 'nowrap'
              }}>
                STAGE {state.unlockedLevel} • U{selectedUnit || 1}
              </span>

              <button
                onClick={() => setSelectedUnit && selectedUnit < 10 && setSelectedUnit(selectedUnit + 1)}
                disabled={selectedUnit >= 10}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', borderRadius: '9999px', opacity: selectedUnit >= 10 ? 0.4 : 1 }}
                title="Next Unit"
              >
                <span className="hide-mobile">Next</span> <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontFamily: 'var(--font-title)', fontWeight: '900', textTransform: 'uppercase' }}>
              Qualification & Practice Quizzes
            </h1>
          </div>

          {/* Unit Specific Quiz Banner (if selectedUnit is set) */}
          {selectedUnit && (
            <div className="glass-panel unit-quiz-banner" style={{
              padding: '0',
              background: 'var(--bg-surface)',
              border: 'var(--border-thick)',
              boxShadow: 'var(--shadow-medium)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {/* Top accent bar */}
              <div style={{
                height: '4px',
                background: 'linear-gradient(90deg, var(--theme-cyan), var(--theme-green), var(--theme-cyan))',
              }} />
              
              <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* Icon cluster */}
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--theme-cyan), var(--theme-green))',
                  border: 'var(--border-thick)',
                  boxShadow: 'var(--shadow-small)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: '0',
                  position: 'relative'
                }}>
                  <Target size={32} color="#000" strokeWidth={2.5} />
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'var(--theme-yellow)',
                    border: 'var(--border-thin)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Zap size={12} color="#000" strokeWidth={3} />
                  </div>
                </div>

                {/* Text content */}
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '900',
                      color: '#000',
                      background: 'var(--theme-cyan)',
                      padding: '3px 10px',
                      borderRadius: '99px',
                      border: 'var(--border-thin)',
                      letterSpacing: '0.08em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Zap size={10} strokeWidth={3} /> TARGET UNIT STUDY CHECK
                    </span>
                  </div>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontFamily: 'var(--font-title)',
                    marginBottom: '0.3rem',
                    lineHeight: '1.2'
                  }}>
                    Unit {state.unlockedLevel}.{selectedUnit} Quiz
                  </h3>
                  <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4',
                    maxWidth: '460px',
                    margin: 0
                  }}>
                    An MCQ assessment specifically testing the <strong style={{ color: 'var(--text-primary)' }}>{unitWords.length} words</strong> in Unit {state.unlockedLevel}.{selectedUnit}.
                  </p>
                  
                  {/* Reward badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      color: '#000',
                      background: 'var(--theme-yellow)',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      border: 'var(--border-thin)',
                      boxShadow: 'var(--shadow-one)'
                    }}>
                      <Trophy size={12} strokeWidth={2.5} /> +80 XP
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      color: '#000',
                      background: 'var(--theme-orange)',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      border: 'var(--border-thin)',
                      boxShadow: 'var(--shadow-one)'
                    }}>
                      <Coins size={12} strokeWidth={2.5} /> +15 Coins
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button 
                  onClick={() => generateQualificationQuiz(true)}
                  className="btn btn-primary"
                  style={{
                    padding: '0.85rem 1.5rem',
                    whiteSpace: 'nowrap',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  Start Unit Quiz <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Qualification Exam Banner */}
          <div className="glass-panel cumulative-exam-banner" style={{
            padding: '0',
            background: 'var(--bg-surface)',
            border: 'var(--border-thick)',
            boxShadow: 'var(--shadow-medium)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Top accent bar */}
            <div style={{
              height: '4px',
              background: 'linear-gradient(90deg, var(--theme-purple), var(--theme-yellow), var(--theme-purple))',
            }} />

            <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {/* Icon cluster */}
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--theme-purple), var(--theme-red))',
                border: 'var(--border-thick)',
                boxShadow: 'var(--shadow-small)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: '0',
                position: 'relative'
              }}>
                <Shield size={32} color="#fff" strokeWidth={2.5} />
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'var(--theme-yellow)',
                  border: 'var(--border-thin)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Star size={12} color="#000" strokeWidth={3} fill="#000" />
                </div>
              </div>

              {/* Text content */}
              <div style={{ flex: '1', minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '900',
                    color: '#000',
                    background: 'var(--theme-purple)',
                    padding: '3px 10px',
                    borderRadius: '99px',
                    border: 'var(--border-thin)',
                    letterSpacing: '0.08em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Shield size={10} strokeWidth={3} /> REQUIRED TO ADVANCE
                  </span>
                </div>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontFamily: 'var(--font-title)',
                  marginBottom: '0.3rem',
                  lineHeight: '1.2'
                }}>
                  Stage {state.unlockedLevel} Cumulative Exam
                </h3>
                <p style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4',
                  maxWidth: '460px',
                  margin: 0
                }}>
                  A 10-question MCQ assessment covering <strong style={{ color: 'var(--text-primary)' }}>all words</strong> in Stage {state.unlockedLevel}.
                </p>
                
                {/* Pass requirement + rewards */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: '#000',
                    background: 'var(--theme-red)',
                    padding: '4px 10px',
                    borderRadius: '99px',
                    border: 'var(--border-thin)',
                    boxShadow: 'var(--shadow-one)'
                  }}>
                    <Target size={12} strokeWidth={2.5} /> Score 70%+ to Pass
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: '#000',
                    background: 'var(--theme-yellow)',
                    padding: '4px 10px',
                    borderRadius: '99px',
                    border: 'var(--border-thin)',
                    boxShadow: 'var(--shadow-one)'
                  }}>
                    <Trophy size={12} strokeWidth={2.5} /> +150 XP
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: '#000',
                    background: 'var(--theme-orange)',
                    padding: '4px 10px',
                    borderRadius: '99px',
                    border: 'var(--border-thin)',
                    boxShadow: 'var(--shadow-one)'
                  }}>
                    <Coins size={12} strokeWidth={2.5} /> +30 Coins
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button 
                onClick={() => generateQualificationQuiz(false)}
                className="btn btn-accent"
                style={{
                  padding: '0.85rem 1.5rem',
                  whiteSpace: 'nowrap',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                Start Cumulative Exam <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Practice Quizzes List */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="hsl(var(--primary))" />
              Practice Quizzes (Stage {state.unlockedLevel})
            </h2>
            {levelQuizzes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No practice quizzes available for this level.</p>
            ) : (
              <div className="grid-cols-responsive">
                {levelQuizzes.map((quiz) => (
                  <div key={quiz.quiz_id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>{quiz.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {quiz.total_questions} MCQ Questions
                      </span>
                    </div>
                    <button 
                      onClick={() => startPreloadedQuiz(quiz)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: '100%', marginTop: 'auto' }}
                    >
                      Practice Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ACTIVE QUIZ PLAY VIEW */}
      {activeQuiz && !quizFinished && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quiz Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: (activeQuiz === 'qualification' || activeQuiz === 'unit_qualification') ? 'hsl(var(--secondary))' : 'hsl(var(--primary))' }}>
                {activeQuiz === 'qualification' ? 'STAGE CUMULATIVE EXAM' : activeQuiz === 'unit_qualification' ? `UNIT ${state.unlockedLevel}.${selectedUnit} QUIZ` : 'PRACTICE QUIZ'}
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
                <Lightbulb size={14} color={showHintPopover ? '#000' : 'var(--theme-yellow)'} />
                <span>Need a Hint?</span>
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
                  <Lightbulb size={14} color="var(--theme-yellow)" /> Available Hints
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
          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-muted)', borderRadius: '3px', overflow: 'hidden', border: 'var(--border-thin)', boxShadow: 'var(--shadow-tiny)' }}>
            <div style={{
              height: '100%',
              width: `${((currentQIndex + 1) / questions.length) * 100}%`,
              backgroundColor: (activeQuiz === 'qualification' || activeQuiz === 'unit_qualification') ? 'hsl(var(--secondary))' : 'hsl(var(--primary))',
              transition: 'var(--transition-normal)'
            }}></div>
          </div>

          {/* Question Card */}
          <div style={{ 
            padding: '2.25rem 2.5rem', 
            background: 'linear-gradient(135deg, rgba(224, 64, 251, 0.12) 0%, rgba(24, 255, 255, 0.1) 50%, var(--bg-surface) 100%)',
            border: '3px solid #000000',
            boxShadow: '6px 6px 0px #000000',
            borderRadius: '20px'
          }}>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', lineHeight: '1.55', fontWeight: '900', fontFamily: 'var(--font-title)', margin: 0 }}>
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
                <div className="card animate-fade" style={{ padding: '1rem', borderLeft: '3.5px solid #18FFFF', backgroundColor: 'var(--bg-surface-elevated)', border: '2px solid #000000', boxShadow: '3px 3px 0 #000000' }}>
                  <div style={{ fontSize: '0.7rem', color: '#18FFFF', fontWeight: '900' }}>BENGALI TRANSLATION CLUE</div>
                  <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                    {questions[currentQIndex]?.bengali_clue}
                  </p>
                </div>
              )}
              {mnemonicUsed && (
                <div className="card animate-fade" style={{ padding: '1rem', borderLeft: '3.5px solid #FFD54F', backgroundColor: 'var(--bg-surface-elevated)', border: '2px solid #000000', boxShadow: '3px 3px 0 #000000' }}>
                  <div style={{ fontSize: '0.7rem', color: '#FFD54F', fontWeight: '900' }}>MEMORIZATION AID (MNEMONIC)</div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: '1.5', fontStyle: 'italic' }}>
                    {questions[currentQIndex]?.mnemonic}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* MCQ Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {questions[currentQIndex]?.options.map((option, idx) => {
              const isCorrect = option === questions[currentQIndex].correct_answer;
              const isDisabled = disabledOptions.includes(option);
              
              let optClass = '';
              if (isAnswered) {
                if (isCorrect) optClass = 'correct';
                else if (selectedOption === option) optClass = 'wrong';
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
                  {isAnswered && selectedOption === option && !isCorrect && <XCircle size={22} color="#FFFFFF" />}
                </button>
              );
            })}
          </div>

          {/* Next / Explanation Card (High-Contrast Neobrutalist 3D) */}
          {isAnswered && (() => {
            const isCorrectAnswer = selectedOption === questions[currentQIndex].correct_answer;
            return (
              <div className="animate-fade" style={{ 
                padding: '1.75rem 2rem', 
                borderRadius: '20px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '3px solid #000000',
                borderLeft: isCorrectAnswer ? '8px solid #00E676' : '8px solid #FF5252',
                boxShadow: '6px 6px 0px #000000',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '900',
                    fontFamily: 'var(--font-title)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.45rem', 
                    color: isCorrectAnswer ? '#00E676' : '#FF5252',
                    margin: 0
                  }}>
                    {isCorrectAnswer ? (
                      <><CheckCircle2 size={22} color="#00E676" /> Correct Answer!</>
                    ) : (
                      <><XCircle size={22} color="#FF5252" /> Incorrect Answer</>
                    )}
                  </h4>
                </div>

                <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: '1.65', margin: 0, fontWeight: '600' }}>
                  {questions[currentQIndex]?.explanation}
                </p>

                <button 
                  onClick={handleNext}
                  style={{
                    alignSelf: 'flex-end',
                    padding: '0.65rem 1.4rem',
                    fontSize: '0.9rem',
                    fontWeight: '900',
                    fontFamily: 'var(--font-title)',
                    borderRadius: '12px',
                    border: '2.5px solid #000000',
                    background: 'linear-gradient(135deg, #18FFFF 0%, #00E5FF 100%)',
                    color: '#000000',
                    cursor: 'pointer',
                    boxShadow: '3.5px 3.5px 0px #000000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'transform 0.1s ease'
                  }}
                >
                  Next Question <ArrowRight size={18} />
                </button>
              </div>
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
          {activeQuiz === 'qualification' && score >= 7 ? (
            <Award size={56} color="hsl(var(--secondary))" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
          ) : (
            <CheckCircle2 size={56} color="hsl(var(--primary))" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
          )}

          <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Quiz Completed!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            You scored **{score} out of {questions.length}** ({Math.round((score / questions.length) * 100)}%).
          </p>

          {/* Qualification Exam result specific styling */}
          {(activeQuiz === 'qualification' || activeQuiz === 'unit_qualification') && (
            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-canvas)',
              border: `1px solid ${score >= 7 ? 'hsla(var(--primary), 0.3)' : 'hsla(var(--danger), 0.3)'}`,
              marginBottom: '2rem'
            }}>
              {score >= 7 ? (
                <>
                  <h4 style={{ color: 'hsl(var(--primary))', fontWeight: '700', marginBottom: '0.25rem' }}>🎉 QUIZ PASSED!</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {activeQuiz === 'qualification' 
                      ? `Excellent! You qualified for the next prep level. Stage ${state.unlockedLevel} unlocked! You earned +150 XP and +30 Coins.`
                      : `Great job! You passed the Unit ${state.unlockedLevel}.${selectedUnit} study quiz. You earned +80 XP and +15 Coins!`}
                  </p>
                </>
              ) : (
                <>
                  <h4 style={{ color: 'hsl(var(--danger))', fontWeight: '700', marginBottom: '0.25rem' }}>❌ DID NOT PASS</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    You need to score at least **70% (7/10)** to pass. Review Unit {state.unlockedLevel}.${selectedUnit} words and try again to solidify your retention!
                  </p>
                </>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* 1. PASSING UNIT QUIZ NEXT STEPS */}
            {activeQuiz === 'unit_qualification' && score >= 7 && (
              <>
                {(selectedUnit || 1) < 10 ? (
                  <>
                    <button
                      onClick={() => {
                        const nextU = (selectedUnit || 1) + 1;
                        if (setSelectedUnit) setSelectedUnit(nextU);
                        setActiveQuiz(null);
                        setQuizFinished(false);
                        setActiveView('flashcards', nextU);
                      }}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <BookOpen size={16} /> Unit {state.unlockedLevel}.{(selectedUnit || 1) + 1} Flashcards <ArrowRight size={16} />
                    </button>
                    
                    <button
                      onClick={() => {
                        const nextU = (selectedUnit || 1) + 1;
                        if (setSelectedUnit) setSelectedUnit(nextU);
                        generateQualificationQuiz(true);
                      }}
                      className="btn btn-accent"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Sparkles size={16} /> Take Unit {state.unlockedLevel}.{(selectedUnit || 1) + 1} Quiz
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => generateQualificationQuiz(false)}
                    className="btn btn-accent"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Trophy size={16} /> Stage {state.unlockedLevel} Qualification Exam <ArrowRight size={16} />
                  </button>
                )}
              </>
            )}

            {/* 2. PASSING CUMULATIVE QUALIFICATION EXAM NEXT STEPS */}
            {activeQuiz === 'qualification' && score >= 7 && (
              <button
                onClick={() => {
                  if (setSelectedUnit) setSelectedUnit(1);
                  setActiveQuiz(null);
                  setQuizFinished(false);
                  setActiveView('flashcards', 1);
                }}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Sparkles size={16} /> Advance to Stage {state.unlockedLevel} (Unit {state.unlockedLevel}.1) <ArrowRight size={16} />
              </button>
            )}

            {/* RETRY BUTTONS */}
            {activeQuiz === 'qualification' && score < 7 && (
              <button 
                onClick={() => generateQualificationQuiz(false)}
                className="btn btn-primary"
              >
                <RefreshCw size={14} /> Retry Cumulative Exam
              </button>
            )}
            {activeQuiz === 'unit_qualification' && (
              <button 
                onClick={() => generateQualificationQuiz(true)}
                className="btn btn-secondary"
              >
                <RefreshCw size={14} /> Retry Unit Quiz
              </button>
            )}
            {activeQuiz !== 'qualification' && activeQuiz !== 'unit_qualification' && (
              <button 
                onClick={() => startPreloadedQuiz(activeQuiz)}
                className="btn btn-primary"
              >
                <RefreshCw size={14} /> Practice Again
              </button>
            )}

            {/* RETURN TO ROADMAP */}
            <button 
              onClick={() => {
                setActiveQuiz(null);
                setQuizFinished(false);
                setActiveView('dashboard');
              }}
              className="btn btn-secondary"
            >
              Return to Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
