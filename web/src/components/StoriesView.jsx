import React, { useState } from 'react';
import { 
  BookOpen, 
  Eye, 
  EyeOff, 
  Award, 
  Coins, 
  Sparkles, 
  HelpCircle,
  Volume2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StoriesView({ state, wordsData }) {
  const levelStories = React.useMemo(() => {
    return wordsData.getStoriesForLevel(state.unlockedLevel);
  }, [wordsData, state.unlockedLevel]);

  const [activeStory, setActiveStory] = useState(null);
  const [showBengali, setShowBengali] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  const startReading = (story) => {
    setActiveStory(story);
    setShowBengali(false);
    setSelectedWord(null);
  };

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const highlightVocabulary = (text) => {
    if (!text) return '';
    
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const wordText = part.replace(/\*\*/g, '');
        const normalizedWordText = wordText.toLowerCase();
        
        // Find the base word from covered words to handle conjugation (e.g. 'abashed' -> 'ABASH')
        const baseWordName = activeStory?.words_covered?.find(w => 
          normalizedWordText.includes(w.toLowerCase()) || w.toLowerCase().includes(normalizedWordText)
        ) || wordText;
        
        const wordObj = wordsData.words.find(w => w.word.toUpperCase() === baseWordName.toUpperCase()) || 
                        { word: wordText, definition: 'Definition not loaded', part_of_speech: 'n/a' };
        
        return (
          <span 
            key={index}
            role="button"
            tabIndex={0}
            aria-label={`Show details for ${wordText}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedWord(wordObj);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedWord(wordObj);
              }
            }}
            style={{
              color: 'hsl(var(--secondary))',
              fontWeight: '600',
              backgroundColor: 'hsla(var(--secondary), 0.15)',
              padding: '0.1rem 0.35rem',
              borderRadius: '4px',
              borderBottom: '2px solid hsl(var(--secondary))',
              cursor: 'pointer',
              outlineOffset: '2px',
              display: 'inline-block',
              margin: '0 0.1rem'
            }}
          >
            {wordText}
          </span>
        );
      }
      return part;
    });
  };

  const handleMarkAsRead = () => {
    state.addXp(50);
    state.addCoins(10);
    confetti({
      particleCount: 40,
      spread: 60
    });
    setActiveStory(null);
  };

  if (wordsData.loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading contextual stories...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '850px', margin: '0 auto' }} className="animate-fade stories-view-container">
      {/* 1. STORIES LIST VIEW */}
      {!activeStory && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)' }}>Contextual Stories Portal</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Read contextual stories woven with Stage {state.unlockedLevel} vocabulary to learn words in physical usage.
            </p>
          </div>

          <div className="grid-cols-responsive">
            {levelStories.map((story, idx) => {
              const masteredCount = story.words_covered.filter(w => {
                const wordObj = wordsData.words.find(dw => dw.word.toUpperCase() === w.toUpperCase());
                return wordObj && state.masteredWordIds.includes(wordObj.id);
              }).length;
              const totalCount = story.words_covered.length;
              const masteryPercent = totalCount ? Math.round((masteredCount / totalCount) * 100) : 0;

              return (
              <div key={idx} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
                      Reading Set #{idx + 1}
                    </h4>
                    {masteryPercent > 0 && (
                      <span style={{
                        fontSize: '0.6rem', fontWeight: '800', color: '#000',
                        padding: '2px 8px', borderRadius: '99px',
                        background: masteryPercent >= 80 ? 'var(--theme-green)' : 'var(--theme-yellow)',
                        border: 'var(--border-thin)',
                        boxShadow: 'var(--shadow-one)',
                      }}>
                        {masteryPercent}% MASTERY
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>
                    Covers {totalCount} Vocabulary Words
                  </span>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.25rem'
                  }}>
                    {story.words_covered.slice(0, 5).map((w, wIdx) => {
                      const wordObj = wordsData.words.find(dw => dw.word.toUpperCase() === w.toUpperCase());
                      const isMastered = wordObj && state.masteredWordIds.includes(wordObj.id);
                      return (
                        <span key={wIdx} style={{
                          fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '99px',
                          backgroundColor: isMastered ? 'var(--theme-green)' : 'var(--bg-canvas)',
                          color: isMastered ? '#000' : 'var(--text-secondary)',
                          border: `2px solid ${isMastered ? 'var(--text-black)' : 'var(--border-muted)'}`,
                          fontWeight: '700'
                        }}>
                          {w.toUpperCase()}
                        </span>
                      );
                    })}
                    {totalCount > 5 && (
                      <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                        +{totalCount - 5} more
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => startReading(story)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', marginTop: 'auto' }}
                >
                  <BookOpen size={14} /> Read Story
                </button>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ACTIVE STORY READER VIEW */}
      {activeStory && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={() => setActiveStory(null)}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Back to Stories List
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
              STORY STAGE {state.unlockedLevel}
            </span>
          </div>

          {/* Reading Arena */}
          <div className="glass-panel" style={{ padding: '2.5rem 2rem', backgroundColor: 'var(--bg-surface)', border: '1px solid hsla(var(--primary), 0.15)' }}>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="hsl(var(--primary))" />
              English Reading Context
            </h2>
            <p style={{ 
              fontSize: '1.15rem', 
              color: 'var(--text-secondary)', 
              lineHeight: '1.8', 
              letterSpacing: '0.01em',
              fontWeight: '400'
            }}>
              {highlightVocabulary(activeStory.story_english)}
            </p>
          </div>

          {/* Toggles and Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowBengali(!showBengali)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {showBengali ? <EyeOff size={16} /> : <Eye size={16} />}
              {showBengali ? 'Hide Translation' : 'Reveal Bengali Translation (বঙ্গানুবাদ)'}
            </button>
            
            <button 
              onClick={handleMarkAsRead}
              className="btn btn-accent"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Award size={16} />
              Mark as Studied (+50 XP, +10 Coins)
            </button>
          </div>

          {/* Bengali Translation Block */}
          {showBengali && (
            <div className="card animate-fade" style={{ padding: '2rem', borderLeft: '4px solid hsl(var(--secondary))', backgroundColor: 'var(--bg-surface)' }}>
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', color: 'hsl(var(--secondary))', marginBottom: '1rem' }}>
                বঙ্গানুবাদ (Bengali Translation)
              </h3>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                {activeStory.story_bengali.split(/(\*\*.*?\*\*)/g).map((part, index) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} style={{ color: 'hsl(var(--secondary))', fontWeight: '700' }}>{part.replace(/\*\*/g, '')}</strong>;
                  }
                  return part;
                })}
              </p>
            </div>
          )}

          {/* Word details mini floating card */}
          {selectedWord && (
            <div className="glass-panel animate-slide-up" style={{
              padding: '1.5rem',
              border: '1px solid hsl(var(--primary))',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              backgroundColor: 'var(--bg-canvas)',
              position: 'relative'
            }}>
              <button 
                onClick={() => setSelectedWord(null)}
                className="min-touch"
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{selectedWord.word.toUpperCase()}</h3>
                <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>({selectedWord.part_of_speech})</span>
                <button 
                  onClick={() => speakWord(selectedWord.word)}
                  className="min-touch"
                  style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer' }}
                >
                  <Volume2 size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Definition</div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '500' }}>{selectedWord.definition}</p>
                </div>
                {selectedWord.bengali_meaning && (
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Bengali Meaning</div>
                    <p style={{ fontSize: '0.95rem', color: 'hsl(var(--primary))', fontWeight: '500' }}>{selectedWord.bengali_meaning}</p>
                  </div>
                )}
                {selectedWord.mnemonic && (
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Mnemonic Aid</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{selectedWord.mnemonic}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vocabulary Mapping Table */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="hsl(var(--primary))" />
              Vocabulary Word Index for this Story
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeStory.words_covered.map((wName, index) => {
                const wordObj = wordsData.words.find(w => w.word.toUpperCase() === wName.toUpperCase()) || { word: wName, definition: 'Definition loading...' };
                return (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-muted)'
                  }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{wName.toUpperCase()}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.75rem' }}>
                        {wordObj.definition}
                      </span>
                    </div>
                    {wordObj.bengali_meaning && (
                      <span style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', fontWeight: '600' }}>
                        {wordObj.bengali_meaning}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
