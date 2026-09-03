import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Link2, 
  FileText, 
  HelpCircle, 
  Play, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers,
  Award
} from 'lucide-react';
import { shuffleArray } from '../utils/shuffle.js';
import QuizRunner from './QuizRunner.jsx';

const FORMAT_CONFIG = {
  all: {
    label: 'All Formats',
    icon: Layers,
    color: 'var(--theme-yellow)'
  },
  analogies: {
    label: 'Analogies',
    icon: Link2,
    badgeBg: '#0284C7',
    badgeColor: '#FFFFFF',
    desc: 'Match word-pair relationships'
  },
  sentence_completions: {
    label: 'Sentence Completion',
    icon: FileText,
    badgeBg: '#A855F7',
    badgeColor: '#FFFFFF',
    desc: 'Fill-in-the-blank contextual grammar'
  },
  contextual_lexical: {
    label: 'Contextual Lexical',
    icon: HelpCircle,
    badgeBg: '#10B981',
    badgeColor: '#FFFFFF',
    desc: 'Interpret words in complex prose'
  }
};

const SET_ACCENT_GRADIENTS = [
  'linear-gradient(90deg, #0284C7, #38BDF8)',
  'linear-gradient(90deg, #A855F7, #EC4899)',
  'linear-gradient(90deg, #10B981, #06B6D4)',
  'linear-gradient(90deg, #F59E0B, #EF4444)',
  'linear-gradient(90deg, #6366F1, #8B5CF6)',
  'linear-gradient(90deg, #EC4899, #F43F5E)',
  'linear-gradient(90deg, #14B8A6, #0EA5E9)',
  'linear-gradient(90deg, #F97316, #FBBF24)',
  'linear-gradient(90deg, #8B5CF6, #3B82F6)'
];

export default function AdvancedQuizzesView({ state, wordsData }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'analogies' | 'sentence_completions' | 'contextual_lexical'
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeMode, setActiveMode] = useState(null);
  const [preparedQuestions, setPreparedQuestions] = useState([]);

  const quizzes = useMemo(() => {
    return wordsData?.advancedQuizzes || [];
  }, [wordsData?.advancedQuizzes]);

  // Start a specific drill format or full set
  const startAdvancedQuiz = (quiz, mode) => {
    let rawQuestions = [];
    let titlePrefix = '';

    if (mode === 'analogies') {
      rawQuestions = (quiz.analogies || []).map(q => ({
        question: `ANALOGY: Find the relationship that best matches:\n\n${q.stem}`,
        options: shuffleArray(q.options || []),
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        bengali_clue: q.bengali_explanation || 'ক্লু নেই।',
        mnemonic: 'সম্পর্কটি লক্ষ্য করুন এবং একই সম্পর্কের অপশনটি বেছে নিন।'
      }));
      titlePrefix = 'Analogies Drill';
    } else if (mode === 'sentence_completions') {
      rawQuestions = (quiz.sentence_completions || []).map(q => ({
        question: `SENTENCE COMPLETION: Choose the word that best fits the blank:\n\n"${q.sentence}"`,
        options: shuffleArray(q.options || []),
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        bengali_clue: q.bengali_explanation || 'ক্লু নেই।',
        mnemonic: 'বাক্যের অর্থ ও প্রেক্ষাপট অনুযায়ী সবচেয়ে নিখুঁত শব্দটি বেছে নিন।'
      }));
      titlePrefix = 'Sentence Completion';
    } else if (mode === 'contextual_lexical') {
      rawQuestions = (quiz.contextual_lexical || []).map(q => ({
        question: `CONTEXTUAL LEXICAL: Determine the meaning of the highlighted word in context:\n\n"${q.sentence}"`,
        options: shuffleArray(q.options || []),
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        bengali_clue: q.bengali_explanation || 'ক্লু নেই।',
        mnemonic: q.target_word ? `টার্গেট শব্দ: ${q.target_word}` : 'বাক্যের প্রেক্ষাপট অনুযায়ী অর্থ নির্ণয় করুন।'
      }));
      titlePrefix = 'Contextual Lexical';
    } else {
      // Full 15-question composite set
      rawQuestions = [
        ...(quiz.analogies || []).map(q => ({
          question: `ANALOGY: Find the relationship that best matches:\n\n${q.stem}`,
          options: shuffleArray(q.options || []),
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          bengali_clue: q.bengali_explanation || 'ক্লু নেই।',
          mnemonic: 'সম্পর্কটি লক্ষ্য করুন এবং একই সম্পর্কের অপশনটি বেছে নিন।'
        })),
        ...(quiz.sentence_completions || []).map(q => ({
          question: `SENTENCE COMPLETION: Choose the word that best fits the blank:\n\n"${q.sentence}"`,
          options: shuffleArray(q.options || []),
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          bengali_clue: q.bengali_explanation || 'ক্লু নেই।',
          mnemonic: 'বাক্যের অর্থ ও প্রেক্ষাপট অনুযায়ী সবচেয়ে নিখুঁত শব্দটি বেছে নিন।'
        })),
        ...(quiz.contextual_lexical || []).map(q => ({
          question: `CONTEXTUAL LEXICAL: Determine the meaning in context:\n\n"${q.sentence}"`,
          options: shuffleArray(q.options || []),
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          bengali_clue: q.bengali_explanation || 'ক্লু নেই।',
          mnemonic: q.target_word ? `টার্গেট শব্দ: ${q.target_word}` : 'বাক্যের প্রেক্ষাপট অনুযায়ী অর্থ নির্ণয় করুন।'
        }))
      ];
      titlePrefix = 'Full Advanced Exam';
    }

    setActiveQuiz(quiz);
    setActiveMode(mode);
    setPreparedQuestions(rawQuestions);
  };

  const handleQuizFinish = (score, total) => {
    state?.addXp?.(score * 15);
    if (score === total && total > 0) {
      state?.addCoins?.(20);
    }
  };

  // If a quiz is running, render via QuizRunner for rich interactive experience
  if (activeQuiz && preparedQuestions.length > 0) {
    const subtitle = activeMode === 'full' 
      ? `Set ${activeQuiz.quiz_id} • Complete 15-Question Prep`
      : `Set ${activeQuiz.quiz_id} • ${FORMAT_CONFIG[activeMode]?.label || 'Advanced Prep'}`;

    return (
      <div style={{ padding: '1.5rem 1rem', maxWidth: '800px', margin: '0 auto' }} className="animate-fade">
        <QuizRunner
          title="Advanced SAT/GRE Prep"
          subtitle={subtitle}
          questions={preparedQuestions}
          state={state}
          onFinish={handleQuizFinish}
          onQuit={() => {
            setActiveQuiz(null);
            setPreparedQuestions([]);
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1.25rem', maxWidth: '1120px', margin: '0 auto' }} className="animate-fade">
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          backgroundColor: 'rgba(2, 132, 199, 0.15)',
          border: '1.5px solid #0284C7',
          color: 'var(--text-primary)',
          fontSize: '0.78rem',
          fontWeight: '900',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '0.85rem'
        }}>
          <GraduationCap size={16} color="#0284C7" />
          <span>Graduate & Elite Prep • SAT / GRE / GMAT</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 2.5rem)',
          fontFamily: 'var(--font-title)',
          fontWeight: '900',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          margin: '0 0 0.5rem 0'
        }}>
          Advanced SAT/GRE Quizzes
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1rem',
          maxWidth: '680px',
          lineHeight: '1.6',
          margin: 0,
          fontWeight: '500'
        }}>
          Challenge yourself with high-level test preparation formats including Analogies, Sentence Completions, and Contextual Lexical questions.
        </p>
      </div>

      {/* Format Filter Bar */}
      <div className="adv-filter-pills">
        <button
          onClick={() => setActiveFilter('all')}
          className={`adv-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
        >
          <Layers size={16} />
          <span>All Formats (Full Sets)</span>
        </button>

        <button
          onClick={() => setActiveFilter('analogies')}
          className={`adv-filter-pill ${activeFilter === 'analogies' ? 'active' : ''}`}
        >
          <Link2 size={16} color={activeFilter === 'analogies' ? '#000' : '#0284C7'} />
          <span>Analogies (5 Qs)</span>
        </button>

        <button
          onClick={() => setActiveFilter('sentence_completions')}
          className={`adv-filter-pill ${activeFilter === 'sentence_completions' ? 'active' : ''}`}
        >
          <FileText size={16} color={activeFilter === 'sentence_completions' ? '#000' : '#A855F7'} />
          <span>Sentence Completion (5 Qs)</span>
        </button>

        <button
          onClick={() => setActiveFilter('contextual_lexical')}
          className={`adv-filter-pill ${activeFilter === 'contextual_lexical' ? 'active' : ''}`}
        >
          <HelpCircle size={16} color={activeFilter === 'contextual_lexical' ? '#000' : '#10B981'} />
          <span>Contextual Lexical (5 Qs)</span>
        </button>
      </div>

      {/* Responsive Set Grid */}
      <div className="adv-quiz-grid">
        {quizzes.map((quiz, index) => {
          const accentGradient = SET_ACCENT_GRADIENTS[index % SET_ACCENT_GRADIENTS.length];
          const totalQuestions = (quiz.analogies?.length || 0) + 
                                (quiz.sentence_completions?.length || 0) + 
                                (quiz.contextual_lexical?.length || 0);

          return (
            <div key={quiz.quiz_id} className="adv-quiz-card">
              {/* Top Dynamic Accent Line */}
              <div style={{ height: '5px', width: '100%', background: accentGradient }} />

              {/* Card Header */}
              <div className="adv-quiz-card-header">
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    PRACTICE SET
                  </div>
                  <h3 style={{
                    fontSize: '1.35rem',
                    fontFamily: 'var(--font-title)',
                    fontWeight: '900',
                    color: 'var(--text-primary)',
                    margin: 0
                  }}>
                    {quiz.quiz_title || `Advanced Set ${quiz.quiz_id}`}
                  </h3>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1.5px solid var(--border-muted)',
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  color: 'var(--text-secondary)'
                }}>
                  <Sparkles size={12} color="var(--theme-yellow)" fill="var(--theme-yellow)" />
                  <span>{totalQuestions || 15} Qs</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="adv-quiz-card-body">
                {activeFilter === 'all' ? (
                  <>
                    {/* Format 1: Analogies */}
                    {quiz.analogies && quiz.analogies.length > 0 && (
                      <button
                        onClick={() => startAdvancedQuiz(quiz, 'analogies')}
                        className="adv-format-btn"
                        title="Practice Analogies Drill"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="adv-format-badge" style={{ backgroundColor: FORMAT_CONFIG.analogies.badgeBg, color: '#FFFFFF' }}>
                            <Link2 size={16} strokeWidth={2.5} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>Analogies</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Relationship pairing</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                          <span>{quiz.analogies.length} Qs</span>
                          <ArrowRight size={14} />
                        </div>
                      </button>
                    )}

                    {/* Format 2: Sentence Completion */}
                    {quiz.sentence_completions && quiz.sentence_completions.length > 0 && (
                      <button
                        onClick={() => startAdvancedQuiz(quiz, 'sentence_completions')}
                        className="adv-format-btn"
                        title="Practice Sentence Completion"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="adv-format-badge" style={{ backgroundColor: FORMAT_CONFIG.sentence_completions.badgeBg, color: '#FFFFFF' }}>
                            <FileText size={16} strokeWidth={2.5} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>Sentence Completion</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Fill-in-the-blank</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                          <span>{quiz.sentence_completions.length} Qs</span>
                          <ArrowRight size={14} />
                        </div>
                      </button>
                    )}

                    {/* Format 3: Contextual Lexical */}
                    {quiz.contextual_lexical && quiz.contextual_lexical.length > 0 && (
                      <button
                        onClick={() => startAdvancedQuiz(quiz, 'contextual_lexical')}
                        className="adv-format-btn"
                        title="Practice Contextual Lexical"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="adv-format-badge" style={{ backgroundColor: FORMAT_CONFIG.contextual_lexical.badgeBg, color: '#FFFFFF' }}>
                            <HelpCircle size={16} strokeWidth={2.5} />
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>Contextual Lexical</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600' }}>Word in context</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                          <span>{quiz.contextual_lexical.length} Qs</span>
                          <ArrowRight size={14} />
                        </div>
                      </button>
                    )}

                    {/* Full 15-Q Exam Button */}
                    <button
                      onClick={() => startAdvancedQuiz(quiz, 'full')}
                      className="adv-full-btn"
                    >
                      <Play size={15} fill="#000000" />
                      <span>Start Full Exam (15 Qs)</span>
                    </button>
                  </>
                ) : (
                  /* Focused Single Format View */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
                    <div style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1.5px solid var(--border-muted)',
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                        {activeFilter === 'analogies' && <Link2 size={16} color="#0284C7" />}
                        {activeFilter === 'sentence_completions' && <FileText size={16} color="#A855F7" />}
                        {activeFilter === 'contextual_lexical' && <HelpCircle size={16} color="#10B981" />}
                        <span>{FORMAT_CONFIG[activeFilter]?.label}</span>
                      </div>
                      <span>{FORMAT_CONFIG[activeFilter]?.desc}</span>
                    </div>

                    <button
                      onClick={() => startAdvancedQuiz(quiz, activeFilter)}
                      className="adv-full-btn"
                    >
                      <Play size={15} fill="#000000" />
                      <span>Launch {FORMAT_CONFIG[activeFilter]?.label} ({quiz[activeFilter]?.length || 5} Qs)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
