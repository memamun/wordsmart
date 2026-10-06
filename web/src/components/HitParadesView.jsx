import React, { useState, useContext } from 'react';
import { Trophy, ArrowRight, ArrowUpRight, Flame, Sparkles, Zap } from 'lucide-react';
import { DetailPanelContext } from '../App';

export default function HitParadesView({ wordsData }) {
  const { setDetailWord } = useContext(DetailPanelContext);
  const [activeTab, setActiveTab] = useState('gre_hit_parade');

  const hitParades = wordsData.hitParades || {};
  
  // Format keys to human readable titles (e.g. gre_hit_parade -> GRE Hit Parade)
  const formatTitle = (key) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const tabs = Object.keys(hitParades);

  // Ensure active tab is valid if hit parades load after initial render
  React.useEffect(() => {
    if (tabs.length > 0 && !tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);

  if (tabs.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--text-primary)' }}>Hit Parades Loading...</h2>
      </div>
    );
  }

  const currentList = hitParades[activeTab] || [];

  // Determine vibrant active tab color scheme
  const getTabColorClass = (tabKey) => {
    if (tabKey.includes('gre')) return 'active-purple';
    if (tabKey.includes('sat')) return 'active-yellow';
    return 'active-cyan';
  };

  const getAccentColor = (tabKey) => {
    if (tabKey.includes('gre')) return '#8b5cf6';
    if (tabKey.includes('sat')) return 'var(--theme-bulb)';
    return 'var(--theme-cyan)';
  };

  const activeAccent = getAccentColor(activeTab);

  return (
    <div className="hitparades-view-container animate-fade">
      {/* Neumorphic 3D Glue Hero Header Banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(24, 255, 255, 0.08) 50%, rgba(18, 24, 36, 0.95) 100%)',
        border: 'var(--border-thick)',
        boxShadow: 'var(--neu-shadow-extrude), var(--shadow-medium)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow ambient background light */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '200px',
          height: '200px',
          background: activeAccent,
          opacity: 0.15,
          filter: 'blur(50px)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #FFD54F 0%, #FF9100 100%)',
              border: '2.5px solid #000000',
              boxShadow: '0 4px 0 #000000, inset 0 2px 4px rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Trophy size={28} color="#000000" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: '900',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  backgroundColor: '#000000',
                  color: '#18FFFF',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(24, 255, 255, 0.4)'
                }}>
                  <Flame size={11} style={{ display: 'inline', marginRight: '3px' }} /> High-Impact Exam Vocab
                </span>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-title)', fontWeight: '900', margin: 0 }}>
                Hit Parades
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '12px',
              background: 'var(--bg-surface-elevated)',
              border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-tiny)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <Sparkles size={14} color="#FFD54F" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', fontFamily: 'var(--font-title)' }}>
                Top Exam Frequency
              </span>
            </div>
            <div style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '12px',
              background: 'var(--bg-surface-elevated)',
              border: 'var(--border-thin)',
              boxShadow: 'var(--shadow-tiny)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <Zap size={14} color="#18FFFF" />
              <span style={{ fontSize: '0.78rem', fontWeight: '800', fontFamily: 'var(--font-title)' }}>
                Score Booster
              </span>
            </div>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.55', margin: 0, maxWidth: '720px' }}>
          Curated priority word lists compiled from real GRE & SAT exam occurrences. Focus on these high-yield terms to rapidly raise your verbal test scores.
        </p>
      </div>

      {/* Neumorphic 3D Glue Selector Tabs */}
      <div className="pill-tabs" style={{ marginBottom: '2rem' }}>
        {tabs.map((tab) => {
          const isSelected = activeTab === tab;
          const colorClass = getTabColorClass(tab);

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pill-tab ${isSelected ? `active ${colorClass}` : ''}`}
            >
              <Trophy size={16} />
              <span>{formatTitle(tab)}</span>
            </button>
          );
        })}
      </div>

      {/* List Container */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px dashed var(--border-muted)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '5px',
              height: '22px',
              borderRadius: '9999px',
              backgroundColor: activeAccent
            }} />
            <h2 style={{ fontSize: '1.45rem', fontFamily: 'var(--font-title)', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
              {formatTitle(activeTab)} Top Words
            </h2>
          </div>
          <span style={{
            fontSize: '0.8rem',
            fontFamily: 'var(--font-title)',
            fontWeight: '900',
            backgroundColor: 'var(--bg-surface-elevated)',
            color: activeAccent,
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            border: 'var(--border-thin)',
            boxShadow: 'var(--shadow-tiny)'
          }}>
            {currentList.length} WORDS
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {currentList.map((item, index) => {
            const coreWord = wordsData.words.find(w => w.word.toUpperCase() === item.word.toUpperCase());
            const rank = item.rank || index + 1;

            return (
              <div 
                key={index}
                className="hit-parade-card"
                onClick={() => {
                  if (coreWord) {
                    const coreWordsList = currentList
                      .map(i => wordsData.words.find(w => w.word.toUpperCase() === i.word.toUpperCase()))
                      .filter(Boolean);
                    setDetailWord({ word: coreWord, list: coreWordsList });
                  }
                }}
              >
                {/* Header row: Rank badge, Part of Speech, and Click/Action Indicator */}
                <div className="hp-card-header">
                  <div className="hp-card-meta">
                    <span className={`hp-rank-badge ${rank <= 3 ? `top-${rank}` : ''}`}>
                      {rank === 1 ? '🥇 #01' : rank === 2 ? '🥈 #02' : rank === 3 ? '🥉 #03' : `#${rank < 10 ? `0${rank}` : rank}`}
                    </span>
                    {coreWord?.part_of_speech && (
                      <span className="hp-pos-badge">
                        {coreWord.part_of_speech}
                      </span>
                    )}
                  </div>

                  {coreWord && (
                    <div className="hp-arrow-btn" aria-hidden="true" title="Open full card details">
                      <ArrowUpRight size={15} />
                    </div>
                  )}
                </div>

                {/* Word Title & Pronunciation */}
                <div className="hp-word-section">
                  <h3 className="hp-word-title">
                    {item.word}
                  </h3>
                  {coreWord?.pronunciation && (
                    <span className="hp-phonetics">
                      /{coreWord.pronunciation}/
                    </span>
                  )}
                </div>

                {/* Bengali Meaning */}
                {coreWord?.bengali_meaning && (
                  <div className="hp-bengali-meaning">
                    {coreWord.bengali_meaning}
                  </div>
                )}

                {/* English Definition */}
                <p className="hp-definition">
                  {item.definition || (coreWord && coreWord.definition) || "A key high-yield vocabulary word frequently tested on standardized exams."}
                </p>

                {/* Synonyms & Antonyms */}
                {coreWord && ((coreWord.synonyms && coreWord.synonyms.length > 0) || (coreWord.antonyms && coreWord.antonyms.length > 0)) && (
                  <div className="hp-rel-words">
                    {coreWord.synonyms && coreWord.synonyms.length > 0 && (
                      <div className="hp-rel-row">
                        <span className="hp-chip syn">SYN</span>
                        <span className="hp-rel-text">
                          {coreWord.synonyms.slice(0, 4).join(', ')}
                        </span>
                      </div>
                    )}
                    {coreWord.antonyms && coreWord.antonyms.length > 0 && (
                      <div className="hp-rel-row">
                        <span className="hp-chip ant">ANT</span>
                        <span className="hp-rel-text muted">
                          {coreWord.antonyms.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
