import React, { useState, useEffect } from 'react';
import { 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Coins, 
  BookOpen, 
  RefreshCw,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizzesView({ state, wordsData, setActiveView, selectedUnit }) {
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

  // Generate dynamic qualification quiz from words in this level / unit
  const generateQualificationQuiz = (isUnitOnly = false) => {
    const targetWords = isUnitOnly ? unitWords : levelWords;
    if (targetWords.length < 5) return;
    
    // Choose 10 random words from the pool
    const shuffledWords = [...targetWords].sort(() => Math.random() - 0.5);
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

      const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

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
    // Map JSON questions structure to our local format
    const formatted = quiz.questions.map((q) => {
      // Find corresponding word in core vocabulary if possible
      const targetWord = wordsData.words.find(w => w.word.toUpperCase() === q.correct_answer || q.question.toLowerCase().includes(w.word.toLowerCase()));
      return {
        ...q,
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
    // Shuffle and pick 2 to disable
    const toDisable = incorrect.sort(() => Math.random() - 0.5).slice(0, 2);
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
          {/* Header Nav Row */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={() => setActiveView('dashboard')}
              className="btn btn-secondary"
              style={{ padding: '0.40rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              ← Return to Roadmap
            </button>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '700' }}>
              STAGE {state.unlockedLevel} / UNIT {selectedUnit || 1}
            </span>
          </div>

          <div>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)' }}>Qualification & Practice Exams</h1>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
              Test your knowledge. Passing the stage cumulative exam or progressing through Units unlocks your path to success.
            </p>
          </div>

          {/* Unit Specific Quiz Banner (if selectedUnit is set) */}
          {selectedUnit && (
            <div className="glass-panel unit-quiz-banner" style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, hsla(var(--primary), 0.15) 0%, hsla(var(--bg-surface), 0.5) 100%)',
              border: '1px solid hsla(var(--primary), 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'hsl(var(--primary))', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <Award size={16} /> TARGET UNIT STUDY CHECK
                </span>
                <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)', marginBottom: '0.25rem' }}>
                  Unit {state.unlockedLevel}.{selectedUnit} Quiz
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', maxWidth: '480px' }}>
                  An MCQ assessment specifically testing the {unitWords.length} words in Unit {state.unlockedLevel}.{selectedUnit}. Awarded with +80 XP and +15 Coins!
                </p>
              </div>
              <button 
                onClick={() => generateQualificationQuiz(true)}
                className="btn btn-primary"
                style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}
              >
                Start Unit Quiz <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Qualification Exam Banner */}
          <div className="glass-panel cumulative-exam-banner" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, hsla(var(--secondary), 0.15) 0%, hsla(var(--bg-surface), 0.5) 100%)',
            border: '1px solid hsla(var(--secondary), 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'hsl(var(--secondary))', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <Award size={16} /> REQUIRED TO ADVANCE
              </span>
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)', marginBottom: '0.25rem' }}>
                Stage {state.unlockedLevel} Cumulative Exam
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', maxWidth: '480px' }}>
                A 10-question MCQ assessment covering all words in Stage {state.unlockedLevel}. Score **70% or higher** to qualify for the next exam level!
              </p>
            </div>
            <button 
              onClick={() => generateQualificationQuiz(false)}
              className="btn btn-accent"
              style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}
            >
              Start Cumulative Exam <ArrowRight size={16} />
            </button>
          </div>

          {/* Practice Quizzes List */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="hsl(var(--primary))" />
              Practice Quizzes (Stage {state.unlockedLevel})
            </h2>
            {levelQuizzes.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', fontStyle: 'italic' }}>No practice quizzes available for this level.</p>
            ) : (
              <div className="grid-cols-responsive">
                {levelQuizzes.map((quiz) => (
                  <div key={quiz.quiz_id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', gap: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-title)', color: 'hsl(var(--text-primary))' }}>{quiz.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: (activeQuiz === 'qualification' || activeQuiz === 'unit_qualification') ? 'hsl(var(--secondary))' : 'hsl(var(--primary))' }}>
                {activeQuiz === 'qualification' ? 'STAGE CUMULATIVE EXAM' : activeQuiz === 'unit_qualification' ? `UNIT ${state.unlockedLevel}.${selectedUnit} QUIZ` : 'PRACTICE QUIZ'}
              </span>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)' }}>
                Question {currentQIndex + 1} of {questions.length}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--coin))', fontWeight: '700' }}>
              <Coins size={18} />
              <span>{state.coins} Coins</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div style={{ width: '100%', height: '6px', backgroundColor: 'hsl(var(--border-muted))', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${((currentQIndex + 1) / questions.length) * 100}%`,
              backgroundColor: (activeQuiz === 'qualification' || activeQuiz === 'unit_qualification') ? 'hsl(var(--secondary))' : 'hsl(var(--primary))',
              transition: 'var(--transition-normal)'
            }}></div>
          </div>

          {/* Question Card */}
          <div className="card" style={{ padding: '2rem', backgroundColor: 'hsl(var(--bg-surface))' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', lineHeight: '1.5', fontWeight: '600' }}>
              {questions[currentQIndex]?.question}
            </h3>
          </div>

          {/* Hint Shop / Budget Section */}
          <div className="glass-panel" style={{
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            backgroundColor: 'hsl(var(--bg-surface) / 0.3)',
            borderStyle: 'dashed'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              💡 PREP BUDGET HINTS:
            </span>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button 
                onClick={buyFiftyFifty}
                disabled={fiftyFiftyUsed || isAnswered || state.coins < 15}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.78rem', minHeight: '38px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Coins size={12} color="hsl(var(--coin))" /> 50/50 (-15c)
              </button>
              <button 
                onClick={buyBengaliClue}
                disabled={bengaliClueUsed || isAnswered || state.coins < 10}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.78rem', minHeight: '38px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Coins size={12} color="hsl(var(--coin))" /> Show Bengali (-10c)
              </button>
              <button 
                onClick={buyMnemonic}
                disabled={mnemonicUsed || isAnswered || state.coins < 20}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.78rem', minHeight: '38px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Coins size={12} color="hsl(var(--coin))" /> Mnemonic (-20c)
              </button>
            </div>
          </div>

          {/* Interactive Hints Output */}
          {notice && (
            <div role="status" aria-live="polite" className="card animate-fade" style={{ padding: '0.85rem 1rem', borderLeft: '3px solid hsl(var(--secondary))', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
              {notice}
            </div>
          )}
          {(bengaliClueUsed || mnemonicUsed) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bengaliClueUsed && (
                <div className="card animate-fade" style={{ padding: '1rem', borderLeft: '3px solid hsl(var(--primary))', backgroundColor: 'hsl(var(--bg-surface) / 0.6)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'hsl(var(--primary))', fontWeight: '700' }}>BENGALI TRANSLATION CLUE</div>
                  <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'hsl(var(--text-primary))', marginTop: '0.15rem' }}>
                    {questions[currentQIndex]?.bengali_clue}
                  </p>
                </div>
              )}
              {mnemonicUsed && (
                <div className="card animate-fade" style={{ padding: '1rem', borderLeft: '3px solid hsl(var(--secondary))', backgroundColor: 'hsl(var(--bg-surface) / 0.6)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'hsl(var(--secondary))', fontWeight: '700' }}>MEMORIZATION AID (MNEMONIC)</div>
                  <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', marginTop: '0.15rem', lineHeight: '1.4' }}>
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

          {/* Next / Explanation Card */}
          {isAnswered && (
            <div className="card animate-fade" style={{ 
              padding: '1.5rem', 
              borderLeft: `4px solid ${selectedOption === questions[currentQIndex].correct_answer ? 'hsl(var(--success))' : 'hsl(var(--danger))'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.25rem', color: selectedOption === questions[currentQIndex].correct_answer ? 'hsl(var(--success))' : 'hsl(var(--danger))' }}>
                  {selectedOption === questions[currentQIndex].correct_answer ? 'Correct Answer!' : 'Incorrect Answer'}
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', marginTop: '0.4rem', lineHeight: '1.4' }}>
                  {questions[currentQIndex]?.explanation}
                </p>
              </div>
              <button 
                onClick={handleNext}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-end', padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
              >
                Next Question <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. QUIZ FINISHED CELEBRATION VIEW */}
      {activeQuiz && quizFinished && (
        <div className="glass-panel animate-fade" style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'linear-gradient(145deg, hsla(var(--bg-surface), 0.4) 0%, hsla(var(--primary), 0.05) 100%)',
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
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>
            You scored **{score} out of {questions.length}** ({Math.round((score / questions.length) * 100)}%).
          </p>

          {/* Qualification Exam result specific styling */}
          {(activeQuiz === 'qualification' || activeQuiz === 'unit_qualification') && (
            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'hsl(var(--bg-canvas) / 0.8)',
              border: `1px solid ${score >= 7 ? 'hsla(var(--primary), 0.3)' : 'hsla(var(--danger), 0.3)'}`,
              marginBottom: '2rem'
            }}>
              {score >= 7 ? (
                <>
                  <h4 style={{ color: 'hsl(var(--primary))', fontWeight: '700', marginBottom: '0.25rem' }}>🎉 QUIZ PASSED!</h4>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                    {activeQuiz === 'qualification' 
                      ? `Excellent! You qualified for the next prep level. Stage ${state.unlockedLevel} unlocked! You earned +150 XP and +30 Coins.`
                      : `Great job! You passed the Unit ${state.unlockedLevel}.${selectedUnit} study quiz. You earned +80 XP and +15 Coins!`}
                  </p>
                </>
              ) : (
                <>
                  <h4 style={{ color: 'hsl(var(--danger))', fontWeight: '700', marginBottom: '0.25rem' }}>❌ DID NOT PASS</h4>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                    You need to score at least **70% (7/10)** to pass. Review Unit {state.unlockedLevel}.${selectedUnit} words and try again to solidify your retention!
                  </p>
                </>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => {
                setActiveQuiz(null);
                setQuizFinished(false);
              }}
              className="btn btn-secondary"
            >
              Exit to Roadmap
            </button>
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
                className="btn btn-primary"
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
          </div>
        </div>
      )}
    </div>
  );
}
