import React, { useState, useContext } from 'react';
import { Star, Trophy, ArrowRight, BookOpen } from 'lucide-react';
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
  
  if (tabs.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-title)', color: 'hsl(var(--text-primary))' }}>Hit Parades Loading...</h2>
      </div>
    );
  }

  // Ensure active tab is valid if hit parades load after initial render
  if (tabs.length > 0 && !tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
  }

  const currentList = hitParades[activeTab] || [];

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }} className="animate-fade">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Star size={28} color="hsl(var(--accent-purple))" />
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-title)' }}>Hit Parades</h1>
      </div>
      <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '2rem', maxWidth: '600px', lineHeight: '1.5' }}>
        Curated lists of the most highly tested vocabulary words on standardized exams. Master these top-priority words to maximize your score.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid hsl(var(--border-muted))', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              color: activeTab === tab ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-fast)'
            }}
          >
            {formatTitle(tab)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-title)', color: 'hsl(var(--text-primary))' }}>
            {formatTitle(activeTab)} Top Words
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: '700' }}>
            {currentList.length} WORDS
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {currentList.map((item, index) => {
            // Find the word in core vocabulary if possible
            const coreWord = wordsData.words.find(w => w.word.toUpperCase() === item.word.toUpperCase());

            return (
              <div 
                key={index}
                className="card card-hover"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1.25rem',
                  cursor: coreWord ? 'pointer' : 'default',
                  borderLeft: '4px solid hsl(var(--accent-purple))'
                }}
                onClick={() => {
                  if (coreWord) {
                    setDetailWord(coreWord);
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      backgroundColor: 'hsla(var(--accent-purple), 0.15)',
                      color: 'hsl(var(--accent-purple))',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '800'
                    }}>
                      #{item.rank}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-title)', color: 'hsl(var(--text-primary))' }}>
                      {item.word}
                    </h3>
                  </div>
                  {coreWord && (
                    <BookOpen size={16} color="hsl(var(--text-muted))" />
                  )}
                </div>
                
                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                  {item.definition || (coreWord && coreWord.definition) || "Definition not available."}
                </p>
                
                {coreWord && coreWord.bengali_meaning && (
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', marginTop: 'auto' }}>
                    {coreWord.bengali_meaning}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
