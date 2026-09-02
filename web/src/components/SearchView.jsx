import React, { useState, useMemo, useContext } from 'react';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Volume2, 
  Award, 
  Filter, 
  Star, 
  BookOpen, 
  LayoutGrid, 
  List as ListIcon, 
  ArrowRight, 
  X,
  Compass,
  Sparkles
} from 'lucide-react';
import { DetailPanelContext } from '../App';
import { renderMarkdown } from '../utils/markdown';

const ALPHABET = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

export default function SearchView({ state, wordsData }) {
  const { setDetailWord } = useContext(DetailPanelContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'bookmarked', 'mastered', 'learning', 'hit_parades', 'beginner', 'intermediate', 'advanced'
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const speakWord = (text, e) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filter and search words list
  const filteredWords = useMemo(() => {
    if ((wordsData.words || []).length === 0) return [];

    let result = wordsData.words || [];

    // Apply category & difficulty filters
    if (filterMode === 'bookmarked') {
      result = result.filter(w => (state.bookmarkedWordIds || []).includes(w.id));
    } else if (filterMode === 'mastered') {
      result = result.filter(w => {
        const prog = (state.wordProgress || {})[w.id];
        return prog && prog.status === 'mastered';
      });
    } else if (filterMode === 'learning') {
      result = result.filter(w => {
        const prog = (state.wordProgress || {})[w.id];
        return prog && (prog.status === 'learning' || prog.status === 'reviewing' || prog.status === 'relearning');
      });
    } else if (filterMode === 'hit_parades') {
      const satList = wordsData.hitParades?.sat_hit_parade?.map(item => item.word.toLowerCase()) || [];
      result = result.filter(w => satList.includes(w.word.toLowerCase()));
    }

    // Apply A-Z letter filter
    if (selectedLetter !== 'ALL') {
      result = result.filter(w => w.word.toUpperCase().startsWith(selectedLetter));
    }

    // Apply search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(w => 
        w.word.toLowerCase().includes(q) || 
        w.definition.toLowerCase().includes(q) ||
        (w.bengali_meaning && w.bengali_meaning.toLowerCase().includes(q)) ||
        (w.synonyms && w.synonyms.some(s => s.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [wordsData.words, wordsData.hitParades, searchQuery, filterMode, selectedLetter, state.bookmarkedWordIds, state.wordProgress]);

  const handleOpenDetail = (word) => {
    if (setDetailWord) {
      setDetailWord({ word, list: filteredWords });
    }
  };

  const totalWordsCount = (wordsData.words || []).length || 1913;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }} className="animate-fade search-view-container">
      
      {/* Minimal & Elegant Search Header Banner */}
      <div style={{
        padding: '1.5rem 1.75rem',
        backgroundColor: 'var(--bg-surface)',
        border: 'var(--border-thin)',
        boxShadow: 'var(--shadow-tiny)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem'
      }}>
        {/* Top Title Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-tiny)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'var(--text-primary)'
            }}>
              <Search size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-title)'
                }}>
                  Lexicon Archive
                </span>
              </div>
              <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-title)', fontWeight: '900', margin: 0, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Dictionary Portal
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: '800',
              fontFamily: 'var(--font-title)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-secondary)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border: 'var(--border-thin)',
              letterSpacing: '0.02em'
            }}>
              {filteredWords.length} / {totalWordsCount} WORDS
            </span>

            {/* View Mode Toggle */}
            <div style={{ 
              display: 'flex', 
              backgroundColor: 'var(--bg-surface-elevated)', 
              padding: '3px', 
              borderRadius: '10px', 
              border: 'var(--border-thin)' 
            }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '0.35rem 0.55rem',
                  borderRadius: '7px',
                  border: viewMode === 'grid' ? '1px solid var(--border-muted)' : 'none',
                  backgroundColor: viewMode === 'grid' ? 'var(--bg-surface)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'grid' ? 'var(--shadow-tiny)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '0.35rem 0.55rem',
                  borderRadius: '7px',
                  border: viewMode === 'list' ? '1px solid var(--border-muted)' : 'none',
                  backgroundColor: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: viewMode === 'list' ? 'var(--shadow-tiny)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
                title="List View"
                aria-label="List View"
              >
                <ListIcon size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Input Field */}
        <div style={{ position: 'relative', width: '100%' }}>
          <input 
            type="text"
            placeholder="Search by spelling, definition, Bengali meaning, or synonyms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-field"
            style={{
              width: '100%',
              padding: '0.8rem 2.8rem 0.8rem 3rem',
              fontSize: '0.92rem',
              fontWeight: '500',
              borderRadius: '12px',
              border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-tiny)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
            }}
          />
          <Search 
            size={18} 
            color="var(--text-muted)" 
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Alphabet A-Z Quick Selector Bar */}
        <div className="no-scrollbar" style={{ 
          display: 'flex', 
          gap: '0.25rem', 
          overflowX: 'auto', 
          paddingBottom: '0.1rem', 
          WebkitOverflowScrolling: 'touch' 
        }}>
          {ALPHABET.map(letter => {
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                style={{
                  padding: '0.25rem 0.55rem',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  fontFamily: 'var(--font-title)',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-muted)',
                  backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-surface-elevated)',
                  color: isSelected ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: isSelected ? 'var(--shadow-tiny)' : 'none',
                  transition: 'all 0.12s ease'
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category & Status Filter Tabs */}
      <div className="pill-tabs no-scrollbar" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
          <Filter size={13} /> Filter:
        </span>
        <button 
          onClick={() => setFilterMode('all')}
          className={`filter-pill ${filterMode === 'all' ? 'active active-cyan' : ''}`}
        >
          All ({totalWordsCount})
        </button>
        <button 
          onClick={() => setFilterMode('bookmarked')}
          className={`filter-pill ${filterMode === 'bookmarked' ? 'active active-yellow' : ''}`}
        >
          <Bookmark size={13} /> Bookmarked ({(state.bookmarkedWordIds || []).length})
        </button>
        <button 
          onClick={() => setFilterMode('mastered')}
          className={`filter-pill ${filterMode === 'mastered' ? 'active active-green' : ''}`}
        >
          <Award size={13} /> Mastered ({Object.values(state.wordProgress || {}).filter(p => p.status === 'mastered').length})
        </button>
        <button 
          onClick={() => setFilterMode('learning')}
          className={`filter-pill ${filterMode === 'learning' ? 'active active-purple' : ''}`}
        >
          <BookOpen size={13} /> Learning ({Object.values(state.wordProgress || {}).filter(p => p.status === 'learning' || p.status === 'reviewing' || p.status === 'relearning').length})
        </button>
        <button 
          onClick={() => setFilterMode('hit_parades')}
          className={`filter-pill ${filterMode === 'hit_parades' ? 'active active-blue' : ''}`}
        >
          <Star size={13} /> SAT Hit Parade
        </button>
      </div>

      {/* Words Grid / List Container */}
      {filteredWords.length === 0 ? (
        <div style={{ 
          padding: '3.5rem 2rem', 
          textAlign: 'center', 
          color: 'var(--text-muted)', 
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-surface)',
          border: 'var(--border-thin)',
          boxShadow: 'var(--shadow-tiny)'
        }}>
          <Compass size={40} style={{ marginBottom: '0.75rem', opacity: 0.6, color: 'var(--text-secondary)' }} />
          <h3 style={{ fontFamily: 'var(--font-title)', color: 'var(--text-primary)', margin: '0 0 0.4rem 0', fontSize: '1.2rem', fontWeight: '800' }}>
            No vocabulary matches found
          </h3>
          <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--text-secondary)' }}>
            Try checking for spelling variations or switching your letter / category filters.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1rem' }}>
          {filteredWords.slice(0, 100).map((w) => {
            const isBookmarked = (state.bookmarkedWordIds || []).includes(w.id);

            return (
              <div
                key={w.id}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  padding: '1.25rem 1.35rem',
                  borderRadius: '14px',
                  border: 'var(--border-thin)',
                  boxShadow: 'var(--shadow-tiny)',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onClick={() => handleOpenDetail(w)}
              >
                {/* 1. Header Row: Headword, Part of Speech, Pronunciation & Quick Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ 
                        fontSize: '1.3rem', 
                        fontFamily: 'var(--font-title)', 
                        fontWeight: '900', 
                        color: 'var(--text-primary)', 
                        margin: 0,
                        letterSpacing: '0.01em',
                        lineHeight: 1.15
                      }}>
                        {w.word}
                      </h3>
                      {w.part_of_speech && (
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: 'var(--text-muted)', 
                          fontWeight: '600', 
                          fontStyle: 'italic'
                        }}>
                          {w.part_of_speech}.
                        </span>
                      )}
                    </div>
                    {w.pronunciation && (
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontFamily: 'monospace', 
                        color: 'var(--text-muted)', 
                        fontWeight: '500',
                        letterSpacing: '0.02em'
                      }}>
                        /{w.pronunciation}/
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => speakWord(w.word, e)}
                      title="Listen pronunciation"
                      aria-label={`Pronounce ${w.word}`}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--text-secondary)', 
                        cursor: 'pointer', 
                        padding: '0.35rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      className="btn-icon-hover"
                    >
                      <Volume2 size={17} />
                    </button>
                    <button
                      onClick={() => state.toggleBookmark(w.id)}
                      title={isBookmarked ? "Remove bookmark" : "Bookmark word"}
                      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark word"}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: isBookmarked ? '#F59E0B' : 'var(--text-muted)', 
                        cursor: 'pointer', 
                        padding: '0.35rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      className="btn-icon-hover"
                    >
                      {isBookmarked ? <BookmarkCheck size={19} fill="#F59E0B" /> : <Bookmark size={19} />}
                    </button>
                  </div>
                </div>

                {/* 2. Bengali Meaning (Immediate Visual Anchor, High-Contrast Hind Siliguri) */}
                {w.bengali_meaning && (
                  <div style={{
                    fontSize: '1.15rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-bengali)',
                    lineHeight: '1.4'
                  }}>
                    {renderMarkdown(w.bengali_meaning)}
                  </div>
                )}

                {/* 3. English Definition (Comfortable reading weight & line-height) */}
                <p style={{ 
                  fontSize: '0.92rem', 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6', 
                  margin: '0.1rem 0 0 0', 
                  fontWeight: '450' 
                }}>
                  {renderMarkdown(w.definition)}
                </p>

                {/* 4. Footer: Synonyms (if present) */}
                {w.synonyms && w.synonyms.length > 0 && (
                  <div style={{ 
                    marginTop: 'auto', 
                    paddingTop: '0.65rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.35rem', 
                    flexWrap: 'wrap', 
                    fontSize: '0.78rem',
                    borderTop: '1px solid var(--border-muted)'
                  }}>
                    <span style={{ fontWeight: '800', color: 'var(--text-muted)', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                      SYN:
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {w.synonyms.slice(0, 3).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredWords.slice(0, 100).map((w) => {
            const isBookmarked = (state.bookmarkedWordIds || []).includes(w.id);

            return (
              <div
                key={w.id}
                className="card card-hover"
                style={{
                  padding: '0.9rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '12px',
                  border: 'var(--border-thin)',
                  boxShadow: 'var(--shadow-tiny)',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: 'pointer',
                  gap: '1rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onClick={() => handleOpenDetail(w)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>
                      {w.word}
                    </span>
                    {w.part_of_speech && (
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--text-muted)', 
                        fontWeight: '500',
                        fontStyle: 'italic'
                      }}>
                        {w.part_of_speech}.
                      </span>
                    )}
                    {w.bengali_meaning && (
                      <span style={{ 
                        fontSize: '1.02rem', 
                        color: 'var(--text-primary)', 
                        fontWeight: '600', 
                        marginLeft: '0.35rem',
                        fontFamily: 'var(--font-bengali)'
                      }}>
                        {w.bengali_meaning}
                      </span>
                    )}
                  </div>

                  <span style={{ 
                    fontSize: '0.86rem', 
                    color: 'var(--text-secondary)', 
                    textOverflow: 'ellipsis', 
                    overflow: 'hidden', 
                    whiteSpace: 'nowrap',
                    fontWeight: '450',
                    lineHeight: '1.4'
                  }}>
                    {w.definition}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => speakWord(w.word, e)}
                    title={`Pronounce ${w.word}`}
                    aria-label={`Pronounce ${w.word}`}
                    className="btn-icon-hover"
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px' }}
                  >
                    <Volume2 size={17} />
                  </button>
                  <button
                    onClick={() => state.toggleBookmark(w.id)}
                    title={isBookmarked ? "Remove bookmark" : "Bookmark word"}
                    aria-label={isBookmarked ? "Remove bookmark" : "Bookmark word"}
                    className="btn-icon-hover"
                    style={{ background: 'none', border: 'none', color: isBookmarked ? '#F59E0B' : 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px' }}
                  >
                    {isBookmarked ? <BookmarkCheck size={19} fill="#F59E0B" /> : <Bookmark size={19} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
