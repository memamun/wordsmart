import React, { useState } from 'react';
import { Library } from 'lucide-react';
import { shuffleArray } from '../utils/shuffle.js';
import QuizRunner from './QuizRunner.jsx';

export default function AllQuizzesView({ state, wordsData, setActiveView }) {
  const allQuizzes = wordsData.quizzes || [];
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Start a preloaded MCQ quiz
  const startPreloadedQuiz = (quiz) => {
    // Map JSON questions structure to our local format and shuffle options
    const formatted = quiz.questions.map((q) => {
      const targetWord = wordsData.words.find(
        w => w.word.toUpperCase() === q.correct_answer || q.question.toLowerCase().includes(w.word.toLowerCase())
      );
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
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }} className="animate-fade quiz-view-container">
      {!activeQuiz ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Library size={28} color="hsl(var(--primary))" />
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Quiz Library</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: '1.5' }}>
            Browse and practice all available quizzes in the application, regardless of your current stage. Playing these quizzes awards XP and coins but does not affect stage progression.
          </p>

          {allQuizzes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No practice quizzes available.</p>
          ) : (
            <div className="grid-cols-responsive">
              {allQuizzes.map((quiz) => (
                <div key={quiz.quiz_id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', borderLeft: '4px solid hsl(var(--primary))' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>{quiz.title}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                      {quiz.total_questions} MCQ Questions
                    </span>
                  </div>
                  <button 
                    onClick={() => startPreloadedQuiz(quiz)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: '100%', marginTop: 'auto' }}
                  >
                    Start Practice Quiz
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <QuizRunner
          title="Practice Quiz"
          subtitle={activeQuiz.title}
          questions={questions}
          state={state}
          onFinish={() => {
            state.addCoins(5);
            state.addXp(30);
          }}
          onQuit={() => setActiveQuiz(null)}
        />
      )}
    </div>
  );
}
