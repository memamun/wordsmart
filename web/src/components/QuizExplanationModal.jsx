import React, { useEffect } from 'react';
import { Lightbulb, X, CheckCircle2, ArrowRight } from 'lucide-react';

export default function QuizExplanationModal({
  isOpen,
  onClose,
  question,
  correctAnswer,
  explanation,
  bengaliExplanation
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10005,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        backgroundColor: 'rgba(9, 11, 17, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        animation: 'explanationModalFadeIn 0.18s ease-out'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-explanation-title"
    >
      <style>{`
        @keyframes explanationModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes explanationModalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .explanation-dialog {
          animation: explanationModalSlideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      <div
        className="explanation-dialog"
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '24px',
          border: '2px solid var(--border-muted)',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35), 4px 4px 0px #000000',
          overflow: 'hidden'
        }}
      >
        {/* Header - Minimal, elegant, borderless top */}
        <div
          style={{
            padding: '1.4rem 1.6rem 1rem 1.6rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: 'rgba(251, 191, 36, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706'
              }}
            >
              <Lightbulb size={18} />
            </div>
            <h3
              id="quiz-explanation-title"
              style={{
                fontSize: '1.15rem',
                fontFamily: 'var(--font-title)',
                fontWeight: '800',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Explanation
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="btn-icon-hover"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              border: '1.5px solid var(--border-muted)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'color 0.15s ease'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body - Fluid Typography with natural hierarchy, no nested cards */}
        <div
          style={{
            padding: '0 1.6rem 1.5rem 1.6rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {/* Question Text - Direct & Clear Headline */}
          {question && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)'
                }}
              >
                Question
              </span>
              <p
                style={{
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  fontFamily: 'var(--font-title)',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)',
                  margin: 0
                }}
              >
                {question}
              </p>
            </div>
          )}

          {/* Correct Answer Pill - Subtle inline badge without heavy card borders */}
          {correctAnswer && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '12px',
                backgroundColor: 'var(--quiz-correct-bg)',
                alignSelf: 'flex-start'
              }}
            >
              <CheckCircle2 size={17} color="var(--quiz-correct-text)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.92rem', lineHeight: '1.2' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '500', marginRight: '0.4rem' }}>
                  Correct:
                </span>
                <strong style={{ color: 'var(--quiz-correct-text)', fontWeight: '800' }}>
                  {correctAnswer}
                </strong>
              </div>
            </div>
          )}

          {/* Detailed Explanation Paragraph - Clean, breathable editorial typography */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)'
              }}
            >
              Context & Meaning
            </span>
            <p
              style={{
                fontSize: '0.98rem',
                lineHeight: '1.75',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontWeight: '400',
                margin: 0
              }}
            >
              {explanation || 'No detailed explanation available for this question.'}
            </p>
          </div>

          {/* Bengali Translation / Clue - Refined blockquote accent, not a nested box */}
          {bengaliExplanation && (
            <div
              style={{
                borderLeft: '3.5px solid var(--accent-blue, #3b82f6)',
                paddingLeft: '0.95rem',
                marginTop: '0.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--accent-blue, #3b82f6)',
                  fontFamily: 'var(--font-title)'
                }}
              >
                বাংলা অর্থ ও ব্যাখ্যা
              </span>
              <p
                style={{
                  fontSize: '0.98rem',
                  lineHeight: '1.7',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-bengali)',
                  fontWeight: '500',
                  margin: 0
                }}
              >
                {bengaliExplanation}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer - Clean single bar */}
        <div
          style={{
            padding: '1rem 1.6rem 1.3rem 1.6rem',
            borderTop: '1px solid var(--border-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.4rem',
              fontSize: '0.88rem',
              fontWeight: '800',
              fontFamily: 'var(--font-title)',
              borderRadius: '12px',
              border: '2px solid #000000',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              boxShadow: '2.5px 2.5px 0px #000000',
              transition: 'transform 0.1s ease'
            }}
            className="btn-icon-hover"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
