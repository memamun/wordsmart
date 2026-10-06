import React, { useState, useEffect } from 'react';
import { 
  MessageSquareHeart, 
  X, 
  Star, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Coins, 
  Lightbulb, 
  Bug, 
  BookOpen, 
  Palette, 
  MessageCircle,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CATEGORIES = [
  { id: 'idea',    label: 'Idea / Suggestion', icon: Lightbulb, color: 'var(--theme-yellow, #facc15)' },
  { id: 'bug',     label: 'Bug Report',        icon: Bug,       color: 'var(--theme-red, #f87171)' },
  { id: 'content', label: 'Words & Content',   icon: BookOpen,  color: 'var(--theme-cyan, #22d3ee)' },
  { id: 'design',  label: 'UI & Design',       icon: Palette,   color: 'var(--theme-purple, #c084fc)' },
  { id: 'general', label: 'General Thoughts',  icon: MessageCircle, color: 'var(--theme-green, #4ade80)' },
];

const RATING_LABELS = {
  1: 'Needs improvement 🙁',
  2: 'Could be better 😐',
  3: 'It is okay 🙂',
  4: 'Great experience! 😊',
  5: 'Love WordSmart! 🚀',
};

export default function FeedbackModal({ 
  isOpen, 
  onClose, 
  user, 
  activeView, 
  onRewardCoins 
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('idea');
  const [message, setMessage] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 3) {
      setError('Please share a few words (at least 3 characters).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const email = user?.email || guestEmail.trim() || '';
      const feedbackData = {
        rating: Number(rating) || 5,
        category,
        message: message.trim(),
        userId: user?.uid || 'guest',
        userName: user?.displayName || 'Learner',
        userEmail: email,
        userPhoto: user?.photoURL || '',
        activeView: activeView || 'dashboard',
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent || '',
        status: 'new',
        createdAt: Date.now(),
        submittedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'feedback'), feedbackData);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // Reward learner with 50 bonus coins
      if (typeof onRewardCoins === 'function') {
        onRewardCoins(50);
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError('Could not submit feedback. Please try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setMessage('');
    setIsSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={resetAndClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 99998,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="feedback-modal-card"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '520px',
          maxWidth: '92vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '16px',
          zIndex: 99999,
          padding: '1.75rem',
          fontFamily: 'var(--font-body, system-ui, sans-serif)',
          animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
            }}>
              <MessageSquareHeart size={22} />
            </div>
            <div>
              <h2 id="feedback-title" style={{ 
                fontSize: '1.25rem', 
                fontWeight: 800, 
                margin: 0, 
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em' 
              }}>
                Help Us Improve!
              </h2>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Your ideas shape the future of WordSmart
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            aria-label="Close feedback modal"
            className="feedback-modal-close"
          >
            <X size={20} />
          </button>
        </div>

        {isSubmitted ? (
          /* Success Screen */
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '2px solid rgba(34, 197, 94, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              color: '#22c55e',
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h3 className="feedback-success-title" style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              Thank You!
            </h3>
            <p className="feedback-success-desc" style={{ fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
              We received your feedback! We read every suggestion and continuously refine WordSmart to make your vocabulary learning more powerful and engaging.
            </p>

            <div className="feedback-coins-badge">
              <Coins size={18} />
              <span>+50 Bonus Coins Earned!</span>
            </div>

            <div>
              <button
                type="button"
                onClick={resetAndClose}
                className="feedback-btn-submit"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                Back to Learning
              </button>
            </div>
          </div>
        ) : (
          /* Feedback Form */
          <form onSubmit={handleSubmit}>
            {/* Rating Stars */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.78rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                color: 'var(--text-muted)',
                marginBottom: '0.5rem' 
              }}>
                How is your experience with WordSmart?
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Rate ${star} star`}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s ease',
                        transform: (hoverRating || rating) === star ? 'scale(1.2)' : 'scale(1)',
                      }}
                    >
                      <Star 
                        size={28} 
                        fill={active ? '#eab308' : 'none'} 
                        className={`feedback-star-icon ${active ? 'active' : ''}`}
                      />
                    </button>
                  );
                })}
                <span style={{ 
                  marginLeft: '0.6rem', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)' 
                }}>
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Category Selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.78rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                color: 'var(--text-muted)',
                marginBottom: '0.5rem' 
              }}>
                Category
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`feedback-cat-btn ${isSelected ? 'selected' : ''}`}
                      style={{
                        borderColor: isSelected ? cat.color : undefined,
                        transform: isSelected ? 'translateY(-1px)' : 'none',
                      }}
                    >
                      <Icon size={14} color={isSelected ? cat.color : 'currentColor'} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Area */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.78rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                color: 'var(--text-muted)',
                marginBottom: '0.5rem' 
              }}>
                <span>What can we improve?</span>
                <span style={{ fontWeight: 500, fontSize: '0.72rem', textTransform: 'none' }}>
                  {message.length}/1000
                </span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                placeholder={
                  category === 'bug'
                    ? "What went wrong? Describe what happened or what you clicked..."
                    : category === 'content'
                    ? "Suggest a word, fix a definition, or request vocabulary themes..."
                    : category === 'design'
                    ? "How can we make navigation or flashcards cleaner and faster?"
                    : "Tell us what feature you'd love to see or how we can make learning more fun!"
                }
                rows={4}
                required
                className="feedback-textarea"
              />
            </div>

            {/* Guest email optional */}
            {!user && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.78rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  color: 'var(--text-muted)',
                  marginBottom: '0.4rem' 
                }}>
                  Your Email (Optional, if you want us to reply)
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="feedback-input"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '0.6rem 0.8rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.8rem',
                marginBottom: '1rem',
              }}>
                {error}
              </div>
            )}

            {/* Bonus Banner */}
            <div className="feedback-bonus-box">
              <Sparkles size={16} className="feedback-bonus-icon" />
              <span>
                Earn <strong>+50 Coins</strong> added to your balance for helping us make WordSmart better!
              </span>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={resetAndClose}
                disabled={isSubmitting}
                className="feedback-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || message.trim().length < 3}
                className="feedback-btn-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
