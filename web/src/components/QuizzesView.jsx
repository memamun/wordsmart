import React, { useState, useEffect, useContext } from 'react';
import { 
  Award, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  Coins, 
  BookOpen, 
  Trophy, 
  RefreshCw, 
  Target, 
  Zap, 
  Shield, 
  Star,
  CheckCircle2,
  Play,
  Lock
} from 'lucide-react';
import { shuffleArray } from '../utils/shuffle.js';
import { DetailPanelContext } from '../App';
import { PREP_STAGES, checkIsUnitUnlocked, checkIsStageExamUnlocked, getUnitsCountForStage } from '../hooks/useGameState.js';
import QuizRunner from './QuizRunner.jsx';

/**
 * Helper to generate balanced MCQ questions from an array of word objects
 */
function createQuestionsFromWords(selectedWords, allWords) {
  return selectedWords.map((wordObj, index) => {
    const hasSynonyms = wordObj.synonyms && wordObj.synonyms.length > 0;
    const hasAntonyms = wordObj.antonyms && wordObj.antonyms.length > 0;
    
    // Pick question type: 0 = synonym, 1 = antonym, 2 = definition
    let qType = 2;
    const rand = Math.random();
    if (rand < 0.35 && hasSynonyms) {
      qType = 0;
    } else if (rand < 0.65 && hasAntonyms) {
      qType = 1;
    }

    let questionText = '';
    let correctAnswer = '';

    if (qType === 0) {
      questionText = `Which of the following is a SYNONYM for the word: "${wordObj.word.toUpperCase()}"?`;
      correctAnswer = wordObj.synonyms[Math.floor(Math.random() * wordObj.synonyms.length)].toUpperCase();
    } else if (qType === 1) {
      questionText = `Which of the following is an ANTONYM for the word: "${wordObj.word.toUpperCase()}"?`;
      correctAnswer = wordObj.antonyms[Math.floor(Math.random() * wordObj.antonyms.length)].toUpperCase();
    } else {
      questionText = `Which word matches the definition: "${wordObj.definition}"?`;
      correctAnswer = wordObj.word.toUpperCase();
    }

    // Generate 3 distractors
    const distractors = [];
    const pool = (allWords && allWords.length > 0) ? allWords : [wordObj];
    let attempts = 0;
    while (distractors.length < 3 && attempts < 60) {
      attempts++;
      const randWord = pool[Math.floor(Math.random() * pool.length)];
      if (!randWord || !randWord.word) continue;

      let dist = '';
      if (qType === 2) {
        dist = randWord.word.toUpperCase();
      } else if (qType === 0 && randWord.synonyms && randWord.synonyms.length > 0) {
        dist = randWord.synonyms[0].toUpperCase();
      } else {
        dist = randWord.word.toUpperCase();
      }

      if (dist && dist !== correctAnswer && dist !== wordObj.word.toUpperCase() && !distractors.includes(dist)) {
        distractors.push(dist);
      }
    }

    // Fallbacks if pool had few entries
    const fallbacks = ['ABATE', 'CANDID', 'LUCID', 'VERBOSE', 'ZEALOUS', 'METICULOUS'];
    for (const fb of fallbacks) {
      if (distractors.length >= 3) break;
      if (fb !== correctAnswer && fb !== wordObj.word.toUpperCase() && !distractors.includes(fb)) {
        distractors.push(fb);
      }
    }

    const options = shuffleArray([correctAnswer, ...distractors]);

    return {
      answerKind: ['synonym', 'antonym', 'definition'][qType],
      question_number: index + 1,
      wordId: wordObj.id,
      question: questionText,
      options,
      correct_answer: correctAnswer,
      explanation: `The correct answer is "${correctAnswer}". "${wordObj.word.toUpperCase()}" means: ${wordObj.definition}.`,
      bengali_clue: wordObj.bengali_meaning || 'সমার্থক অর্থ পাওয়া যায়নি।',
      mnemonic: wordObj.mnemonic || 'কোনো কৌশল সংরক্ষিত নেই।',
      targetWord: wordObj
    };
  });
}

export default function QuizzesView({ 
  state, 
  wordsData, 
  setActiveView, 
  selectedUnit, 
  setSelectedUnit,
  selectedStage,
  setSelectedStage,
  quizAction,
  setQuizAction
}) {
  const { setDetailWord } = useContext(DetailPanelContext) || {};

  // Active Stage strictly constrained to unlocked levels
  const maxUnlockedStage = state.unlockedLevel || 1;
  const initialStage = selectedStage && selectedStage <= maxUnlockedStage ? selectedStage : maxUnlockedStage;
  const [currentStage, setCurrentStage] = useState(initialStage);

  useEffect(() => {
    if (selectedStage) {
      const valid = Math.min(selectedStage, state.unlockedLevel || 1);
      setCurrentStage(valid);
    }
  }, [selectedStage, state.unlockedLevel]);

  // Quiz execution state
  const [activeQuiz, setActiveQuiz] = useState(null); // null, 'qualification', 'unit_qualification', or quiz object
  const [questions, setQuestions] = useState([]);
  const [currentQuizUnit, setCurrentQuizUnit] = useState(() => selectedUnit || 1);
  const [currentQuizStage, setCurrentQuizStage] = useState(() => initialStage);
  const [quizSessionKey, setQuizSessionKey] = useState(0);

  // Practice quizzes for current stage
  const levelQuizzes = React.useMemo(() => {
    return wordsData.getQuizzesForLevel(currentStage);
  }, [wordsData, currentStage]);

  /**
   * Start a specific Unit Quiz (1 to 10)
   * Strictly enforces lock checking: locked units CANNOT be started.
   * Once unlocked, user can quiz them as many times as they want.
   */
  const startUnitQuiz = (unitNum = currentQuizUnit, stageNum = currentStage) => {
    const targetStage = Number(stageNum) || 1;
    const targetUnit = Number(unitNum) || 1;

    // Strict lock check: target unit must be unlocked
    const isUnlocked = checkIsUnitUnlocked(targetStage, targetUnit, state) || 
      (targetStage === currentQuizStage && targetUnit === currentQuizUnit + 1 && state.unitAttempts?.[`${targetStage}.${currentQuizUnit}`]?.passed);

    if (!isUnlocked) {
      return;
    }

    if (setSelectedStage) setSelectedStage(targetStage);
    if (setSelectedUnit) setSelectedUnit(targetUnit);
    setCurrentStage(targetStage);
    setCurrentQuizStage(targetStage);
    setCurrentQuizUnit(targetUnit);

    const targetWords = wordsData.getWordsForUnit(targetStage, targetUnit);
    if (!targetWords || targetWords.length === 0) return;

    const shuffledWords = shuffleArray(targetWords);
    const generatedQuestions = createQuestionsFromWords(shuffledWords, wordsData.words);

    setQuestions(generatedQuestions);
    setActiveQuiz('unit_qualification');
    setQuizSessionKey(prev => prev + 1);
  };

  /**
   * Auto-start quiz action from navigation (e.g. Dashboard direct clicks)
   */
  useEffect(() => {
    if (!quizAction) return;
    if (quizAction.type === 'unit') {
      const targetStage = Math.min(quizAction.stage || currentStage, maxUnlockedStage);
      const targetUnit = Number(quizAction.unit) || 1;
      if (checkIsUnitUnlocked(targetStage, targetUnit, state)) {
        startUnitQuiz(targetUnit, targetStage);
      }
    } else if (quizAction.type === 'exam') {
      const targetStage = Math.min(quizAction.stage || currentStage, maxUnlockedStage);
      if (checkIsStageExamUnlocked(targetStage, state)) {
        startCumulativeExam(targetStage);
      }
    }
  }, [quizAction?.id]);

  /**
   * Start Stage Cumulative Exam
   * Strictly enforces lock checking: only unlocked after unit 10 is passed.
   */
  const startCumulativeExam = (stageNum = currentStage) => {
    const targetStage = Number(stageNum) || 1;

    if (!checkIsStageExamUnlocked(targetStage, state)) {
      return;
    }

    if (setSelectedStage) setSelectedStage(targetStage);
    setCurrentStage(targetStage);
    setCurrentQuizStage(targetStage);

    const targetWords = wordsData.getWordsForLevel(targetStage);
    if (!targetWords || targetWords.length === 0) return;

    const shuffledWords = shuffleArray(targetWords);
    const selectedWords = shuffledWords.slice(0, Math.min(10, shuffledWords.length));
    const generatedQuestions = createQuestionsFromWords(selectedWords, wordsData.words);

    setQuestions(generatedQuestions);
    setActiveQuiz('qualification');
    setQuizSessionKey(prev => prev + 1);
  };

  /**
   * Start preloaded practice quiz
   */
  const startPreloadedQuiz = (quiz) => {
    const formatted = quiz.questions.map((q) => {
      const targetWord = wordsData.words.find(
        w => w.word.toUpperCase() === q.correct_answer || q.question.toLowerCase().includes(w.word.toLowerCase())
      );
      return {
        ...q,
        options: shuffleArray(q.options),
        bengali_clue: q.bengali_clue || targetWord?.bengali_meaning || 'ক্লু নেই।',
        mnemonic: targetWord?.mnemonic || 'কৌশল নেই।',
        targetWord,
        wordId: targetWord?.id
      };
    });

    setCurrentQuizStage(currentStage);
    setQuestions(formatted);
    setActiveQuiz(quiz);
    setQuizSessionKey(prev => prev + 1);
  };

  if (wordsData.loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading quizzes...</div>;
  }

  // Active target unit from props or state
  const targetUnitNum = selectedUnit || 1;
  const isTargetUnitUnlocked = checkIsUnitUnlocked(currentStage, targetUnitNum, state);
  const targetUnitAttempt = state.unitAttempts?.[`${currentStage}.${targetUnitNum}`];
  const isTargetUnitPassed = Boolean(targetUnitAttempt?.passed);
  const targetUnitWords = wordsData.getWordsForUnit(currentStage, targetUnitNum);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '840px', margin: '0 auto' }} className="animate-fade quiz-view-container">
      {/* ======================================================== */}
      {/* 1. QUIZ LIST VIEW                                        */}
      {/* ======================================================== */}
      {!activeQuiz && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Header Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <Award size={28} color="hsl(var(--primary))" />
              <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.85rem)', fontFamily: 'var(--font-title)', fontWeight: '900', margin: 0 }}>
                Stage {currentStage} Assessments & Quizzes
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              Complete each unit quiz to unlock the next unit. <strong>Once unlocked, you can take and retake any quiz as many times as you like.</strong>
            </p>
          </div>

          {/* Unlocked Stage Selector (Only unlocked stages are selectable; locked stages cannot be accessed) */}
          {state.unlockedLevel > 1 && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
              padding: '0.75rem 1rem',
              background: 'var(--bg-surface)',
              border: 'var(--border-thin)',
              borderRadius: 'var(--radius-md)'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.25rem' }}>
                Stage:
              </span>
              {PREP_STAGES.filter(stg => stg.id <= state.unlockedLevel).map((stg) => {
                const isSelected = stg.id === currentStage;
                const isPassed = state.levelAttempts?.[stg.id]?.passed;
                return (
                  <button
                    key={stg.id}
                    onClick={() => {
                      setCurrentStage(stg.id);
                      if (setSelectedStage) setSelectedStage(stg.id);
                    }}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid #000' : 'var(--border-thin)',
                      background: isSelected ? 'var(--theme-yellow)' : 'var(--bg-surface-elevated)',
                      color: isSelected ? '#000' : 'var(--text-primary)',
                      fontWeight: isSelected ? '900' : '700',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-title)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <span>Stage {stg.id}</span>
                    {isPassed && <CheckCircle2 size={12} color={isSelected ? '#000' : '#10b981'} />}
                  </button>
                );
              })}
            </div>
          )}

          {/* ALL 10 UNITS IN STAGE (STRICT LOCK RULES APPLIED) */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-title)', fontWeight: '900', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Target size={18} color="var(--theme-cyan)" /> Stage {currentStage} Unit Quizzes
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '0.75rem'
            }}>
              {Array.from({ length: getUnitsCountForStage(currentStage) }).map((_, idx) => {
                const uNum = idx + 1;
                const isUnlocked = checkIsUnitUnlocked(currentStage, uNum, state);
                const attempt = state.unitAttempts?.[`${currentStage}.${uNum}`];
                const isPassed = Boolean(attempt?.passed);
                const uWords = wordsData.getWordsForUnit(currentStage, uNum);
                const isTargetSelected = uNum === targetUnitNum;

                return (
                  <div
                    key={uNum}
                    style={{
                      padding: '0.9rem 1rem',
                      background: isUnlocked ? 'var(--bg-surface)' : 'var(--bg-canvas)',
                      border: isTargetSelected ? '2px solid var(--theme-yellow)' : 'var(--border-thin)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: isUnlocked ? 'var(--shadow-tiny)' : 'none',
                      opacity: isUnlocked ? 1 : 0.55,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.65rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '900', fontSize: '0.95rem', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          Unit {currentStage}.{uNum}
                        </span>
                        {isUnlocked ? (
                          isPassed ? (
                            <span style={{ fontSize: '0.68rem', fontWeight: '900', color: 'var(--theme-green)' }}>
                              ✓ {attempt.score}%
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--theme-cyan)' }}>
                              READY
                            </span>
                          )
                        ) : (
                          <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Lock size={10} /> LOCKED
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {uWords.length} words
                      </span>
                    </div>

                    {isUnlocked ? (
                      <button
                        onClick={() => startUnitQuiz(uNum, currentStage)}
                        className={isPassed ? "btn btn-secondary" : "btn btn-primary"}
                        style={{
                          width: '100%',
                          padding: '0.45rem',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        {isPassed ? (
                          <>
                            <RefreshCw size={12} /> Retake Quiz
                          </>
                        ) : (
                          <>
                            <Play size={12} fill="currentColor" /> Take Quiz
                          </>
                        )}
                      </button>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.45rem 0' }}>
                        Pass Unit {currentStage}.{uNum - 1} quiz to unlock
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STAGE CUMULATIVE EXAM BANNER (LOCKED UNTIL UNIT 10 IS PASSED) */}
          <div className="glass-panel" style={{
            padding: '1.25rem 1.5rem',
            background: 'var(--bg-surface)',
            border: 'var(--border-thick)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-small)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: checkIsStageExamUnlocked(currentStage, state) ? 'var(--theme-yellow)' : 'var(--bg-surface-elevated)',
                border: 'var(--border-thin)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000'
              }}>
                <Trophy size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-primary)' }}>
                  Stage {currentStage} Cumulative Qualification Exam
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  10-question MCQ assessment covering all words in Stage {currentStage}. Score 70%+ to advance.
                </div>
              </div>
            </div>

            {checkIsStageExamUnlocked(currentStage, state) ? (
              <button 
                onClick={() => startCumulativeExam(currentStage)}
                className="btn btn-accent"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {state.levelAttempts?.[currentStage]?.passed ? (
                  <>
                    <RefreshCw size={14} /> Retake Stage Exam
                  </>
                ) : (
                  <>
                    Launch Stage Exam <ArrowRight size={14} />
                  </>
                )}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800' }}>
                <Lock size={14} /> Pass Unit {currentStage}.{getUnitsCountForStage(currentStage)} Quiz to Unlock Exam
              </div>
            )}
          </div>

          {/* PRACTICE QUIZZES */}
          {levelQuizzes.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-title)', fontWeight: '900', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={18} color="hsl(var(--primary))" /> Stage {currentStage} Practice Quizzes
              </h3>
              <div className="grid-cols-responsive">
                {levelQuizzes.map((quiz) => (
                  <div key={quiz.quiz_id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem', padding: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                        {quiz.title}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {quiz.total_questions} MCQ Questions
                      </span>
                    </div>
                    <button 
                      onClick={() => startPreloadedQuiz(quiz)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem', width: '100%', marginTop: 'auto' }}
                    >
                      Practice Quiz
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ACTIVE QUIZ PLAY VIEW (Powered by QuizRunner)          */}
      {/* ======================================================== */}
      {activeQuiz && (
        <QuizRunner
          key={`quiz-${quizSessionKey}-s${currentQuizStage}-u${currentQuizUnit}-${typeof activeQuiz === 'string' ? activeQuiz : activeQuiz?.quiz_id || 'custom'}`}
          title={
            activeQuiz === 'qualification'
              ? `Stage ${currentQuizStage} Cumulative Exam`
              : activeQuiz === 'unit_qualification'
              ? `Unit ${currentQuizStage}.${currentQuizUnit} Quiz`
              : 'Practice Quiz'
          }
          subtitle={
            typeof activeQuiz === 'object' ? activeQuiz.title : `Stage ${currentQuizStage}`
          }
          questions={questions}
          state={state}
          isQualification={activeQuiz === 'qualification' || activeQuiz === 'unit_qualification'}
          passingScore={Math.ceil(questions.length * 0.7)}
          onFinish={(finalScore, total) => {
            const percent = total > 0 ? Math.round((finalScore / total) * 100) : 0;
            if (activeQuiz === 'qualification') {
              state.recordQuizAttempt(currentQuizStage, percent);
            } else if (activeQuiz === 'unit_qualification') {
              if (state.recordUnitQuizAttempt) {
                state.recordUnitQuizAttempt(currentQuizStage, currentQuizUnit, percent);
              }
            } else {
              state.addCoins(5);
              state.addXp(30);
            }
          }}
          onQuit={() => setActiveQuiz(null)}
          renderFinishActions={(finalScore, total, passed, handleRestart) => {
            const stage = currentQuizStage;
            const unit = currentQuizUnit;
            const nextUnit = unit + 1;
            const hasNextUnit = nextUnit <= getUnitsCountForStage(stage);

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
                {/* UNIT QUIZ ACTIONS */}
                {activeQuiz === 'unit_qualification' && (
                  <>
                    {/* IF PASSED: NEXT UNIT QUIZ (Primary CTA - Center on Quiz!) */}
                    {passed && hasNextUnit && (
                      <button
                        onClick={() => {
                          startUnitQuiz(nextUnit, stage);
                        }}
                        className="btn btn-accent"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: '900', padding: '0.85rem' }}
                      >
                        <Sparkles size={16} /> Take Unit {stage}.{nextUnit} Quiz <ArrowRight size={16} />
                      </button>
                    )}

                    {/* IF PASSED UNIT 10: STAGE EXAM */}
                    {passed && !hasNextUnit && (
                      <button
                        onClick={() => startCumulativeExam(stage)}
                        className="btn btn-accent"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontWeight: '900', padding: '0.85rem' }}
                      >
                        <Trophy size={16} /> Stage {stage} Qualification Exam <ArrowRight size={16} />
                      </button>
                    )}

                    {/* RETAKE THIS UNIT QUIZ (Once unlocked, user can quiz as many times as they want!) */}
                    <button
                      onClick={() => startUnitQuiz(unit, stage)}
                      className={passed ? "btn btn-secondary" : "btn btn-primary"}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.75rem' }}
                    >
                      <RefreshCw size={15} /> {passed ? `Retake Unit ${stage}.${unit} Quiz` : `Retry Unit ${stage}.${unit} Quiz`}
                    </button>

                    {/* STUDY FLASHCARDS (Optional secondary assistance) */}
                    <button
                      onClick={() => {
                        const targetU = passed && hasNextUnit ? nextUnit : unit;
                        if (setSelectedUnit) setSelectedUnit(targetU);
                        if (setSelectedStage) setSelectedStage(stage);
                        setActiveQuiz(null);
                        setActiveView('flashcards', targetU, stage);
                      }}
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', opacity: 0.85 }}
                    >
                      <BookOpen size={15} /> Study Unit {stage}.{passed && hasNextUnit ? nextUnit : unit} Flashcards
                    </button>
                  </>
                )}

                {/* CUMULATIVE QUALIFICATION EXAM ACTIONS */}
                {activeQuiz === 'qualification' && (
                  <>
                    {passed && (
                      <button
                        onClick={() => {
                          const nextStage = Math.min(PREP_STAGES.length, stage + 1);
                          if (setSelectedStage) setSelectedStage(nextStage);
                          if (setSelectedUnit) setSelectedUnit(1);
                          setActiveQuiz(null);
                          setActiveView('dashboard');
                        }}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.85rem', fontWeight: '900' }}
                      >
                        <Sparkles size={16} /> Advance to Stage {Math.min(PREP_STAGES.length, stage + 1)} <ArrowRight size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => startCumulativeExam(stage)}
                      className={passed ? "btn btn-secondary" : "btn btn-primary"}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.75rem' }}
                    >
                      <RefreshCw size={15} /> {passed ? `Retake Stage ${stage} Exam` : `Retry Stage ${stage} Exam`}
                    </button>
                  </>
                )}

                {/* PRACTICE QUIZ RETAKE */}
                {typeof activeQuiz === 'object' && (
                  <button
                    onClick={() => startPreloadedQuiz(activeQuiz)}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <RefreshCw size={15} /> Retake This Practice Quiz
                  </button>
                )}

                {/* NAVIGATION */}
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.25rem' }}>
                  <button 
                    onClick={() => {
                      setActiveQuiz(null);
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
                  >
                    Quizzes List
                  </button>
                  <button 
                    onClick={() => {
                      setActiveQuiz(null);
                      setActiveView('dashboard');
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
                  >
                    Return to Roadmap
                  </button>
                </div>
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
