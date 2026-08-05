import React, { useState, useContext } from 'react';
import { Star, Trophy, ArrowRight, BookOpen, Flame, Sparkles, Zap, Award } from 'lucide-react';
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
    if (tabKey.includes('gre')) return '#e040fb';
    if (tabKey.includes('sat')) return '#ffd54f';
    return '#18ffff';
  };

  const activeAccent = getAccentColor(activeTab);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }} className="animate-fade">
      {/* Neumorphic 3D Glue Hero Header Banner */}
      <div className="glass-panel" style={{
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(224, 64, 251, 0.12) 0%, rgba(24, 255, 255, 0.08) 50%, rgba(18, 24, 36, 0.95) 100%)',
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
      <div className="glass-panel" style={{
        padding: '2rem',
        boxShadow: 'var(--neu-shadow-extrude), var(--shadow-main)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', borderBottom: '2px dashed var(--border-muted)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '12px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: activeAccent
            }} />
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-title)', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem' }}>
          {currentList.map((item, index) => {
            const coreWord = wordsData.words.find(w => w.word.toUpperCase() === item.word.toUpperCase());
            const rank = item.rank || index + 1;

            // Medal colors for top 3
            let badgeBg = 'linear-gradient(135deg, #18FFFF 0%, #00E5FF 100%)';
            let badgeColor = '#000000';

            if (rank === 1) {
              badgeBg = 'linear-gradient(135deg, #FFD700 0%, #FF9100 100%)';
              badgeColor = '#000000';
            } else if (rank === 2) {
              badgeBg = 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)';
              badgeColor = '#000000';
            } else if (rank === 3) {
              badgeBg = 'linear-gradient(135deg, #FF9100 0%, #FF5252 100%)';
              badgeColor = '#000000';
            }

            return (
              <div 
                key={index}
                className="card card-hover"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.85rem',
                  padding: '1.35rem',
                  cursor: coreWord ? 'pointer' : 'default',
                  borderLeft: `5px solid ${activeAccent}`,
                  borderRadius: '16px',
                  boxShadow: 'var(--neu-shadow-extrude), var(--shadow-small)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => {
                  if (coreWord) {
                    setDetailWord(coreWord);
                  }
                }}
              >
                {/* Header line: Rank badge & Word title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      background: badgeBg,
                      color: badgeColor,
                      padding: '0.25rem 0.6rem',
                      borderRadius: '9999px',
                      border: '2px solid #000000',
                      boxShadow: '0 2px 0 #000000',
                      fontSize: '0.75rem',
                      fontWeight: '900',
                      fontFamily: 'var(--font-title)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      flexShrink: 0
                    }}>
                      #{rank}
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                      {item.word}
                    </h3>
                  </div>

                  {coreWord && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: 'var(--border-thin)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }} title="View full details">
                      <BookOpen size={15} color={activeAccent} />
                    </div>
                  )}
                </div>

                {/* Definition */}
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  {item.definition || (coreWord && coreWord.definition) || "A key high-yield vocabulary word frequently tested on standardized exams."}
                </p>

                {/* Synonyms & Antonyms preview */}
                {coreWord && ((coreWord.synonyms && coreWord.synonyms.length > 0) || (coreWord.antonyms && coreWord.antonyms.length > 0)) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', marginTop: '0.1rem' }}>
                    {coreWord.synonyms && coreWord.synonyms.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '900', color: 'var(--theme-green)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Syn:</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                          {coreWord.synonyms.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    )}
                    {coreWord.antonyms && coreWord.antonyms.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '900', color: 'var(--theme-red)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ant:</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {coreWord.antonyms.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bengali meaning pill */}
                {coreWord && coreWord.bengali_meaning && (
                  <div style={{
                    marginTop: 'auto',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(24, 255, 255, 0.12) 0%, rgba(224, 64, 251, 0.12) 100%)',
                    border: '1px solid var(--border-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: activeAccent, fontFamily: 'var(--font-body)' }}>
                      {coreWord.bengali_meaning}
                    </span>
                    <ArrowRight size={14} color={activeAccent} />
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
