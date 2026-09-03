import React, { useState, useContext } from 'react';
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
  Star
} from 'lucide-react';
import { shuffleArray } from '../utils/shuffle.js';
import { DetailPanelContext } from '../App';
import QuizRunner from './QuizRunner.jsx';

export default function QuizzesView({ state, wordsData, setActiveView, selectedUnit, setSelectedUnit }) {
  const { setDetailWord } = useContext(DetailPanelContext);
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
    setActiveQuiz(isUnitOnly ? 'unit_qualification' : 'qualification');
  };

  // Start a preloaded MCQ quiz
  const startPreloadedQuiz = (quiz) => {
    const formatted = quiz.questions.map((q) => {
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
    setActiveQuiz(quiz);
  };

  if (wordsData.loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading quizzes...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }} className="animate-fade quiz-view-container">
      {/* 1. QUIZ LIST VIEW */}
      {!activeQuiz && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

      {/* 2. ACTIVE QUIZ PLAY VIEW (Powered by QuizRunner) */}
      {activeQuiz && (
        <QuizRunner
          title={
            activeQuiz === 'qualification'
              ? 'Stage Cumulative Exam'
              : activeQuiz === 'unit_qualification'
              ? `Unit ${state.unlockedLevel}.${selectedUnit} Quiz`
              : 'Practice Quiz'
          }
          subtitle={
            typeof activeQuiz === 'object' ? activeQuiz.title : `Stage ${state.unlockedLevel}`
          }
          questions={questions}
          state={state}
          isQualification={activeQuiz === 'qualification' || activeQuiz === 'unit_qualification'}
          passingScore={activeQuiz === 'qualification' ? 7 : 8}
          onFinish={(finalScore, total) => {
            if (activeQuiz === 'qualification') {
              const percent = Math.round((finalScore / total) * 100);
              state.recordQuizAttempt(state.unlockedLevel, percent);
            } else if (activeQuiz === 'unit_qualification') {
              state.addCoins(15);
              state.addXp(80);
            } else {
              state.addCoins(5);
              state.addXp(30);
            }
          }}
          onQuit={() => setActiveQuiz(null)}
          renderFinishActions={(finalScore, total, passed, handleRestart) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
              {/* PASSING UNIT QUIZ NEXT STEPS */}
              {activeQuiz === 'unit_qualification' && passed && (
                (selectedUnit || 1) < 4 ? (
                  <>
                    <button
                      onClick={() => {
                        const nextU = (selectedUnit || 1) + 1;
                        if (setSelectedUnit) setSelectedUnit(nextU);
                        setActiveQuiz(null);
                        setActiveView('flashcards', nextU);
                      }}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
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
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <Sparkles size={16} /> Take Unit {state.unlockedLevel}.{(selectedUnit || 1) + 1} Quiz
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => generateQualificationQuiz(false)}
                    className="btn btn-accent"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <Trophy size={16} /> Stage {state.unlockedLevel} Qualification Exam <ArrowRight size={16} />
                  </button>
                )
              )}

              {/* PASSING CUMULATIVE QUALIFICATION EXAM */}
              {activeQuiz === 'qualification' && passed && (
                <button
                  onClick={() => {
                    if (setSelectedUnit) setSelectedUnit(1);
                    setActiveQuiz(null);
                    setActiveView('flashcards', 1);
                  }}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <Sparkles size={16} /> Advance to Stage {state.unlockedLevel} (Unit {state.unlockedLevel}.1) <ArrowRight size={16} />
                </button>
              )}

              {/* RETRY BUTTON */}
              {!passed && (
                <button 
                  onClick={handleRestart}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <RefreshCw size={14} /> Retry Exam
                </button>
              )}

              {/* RETURN TO ROADMAP */}
              <button 
                onClick={() => {
                  setActiveQuiz(null);
                  setActiveView('dashboard');
                }}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
              >
                Return to Roadmap
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
