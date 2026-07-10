import React, { useState } from 'react';
import { BookOpen, Calendar } from 'lucide-react';
import FlashcardsView from './FlashcardsView.jsx';
import ReviewSessionView from './ReviewSessionView.jsx';

export default function StudyDeckView({ state, wordsData, selectedUnit, setSelectedUnit }) {
  const [activeTab, setActiveTab] = useState('flashcards');

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        padding: '1rem 2rem', 
        borderBottom: '3px solid #000000',
        backgroundColor: 'var(--bg-surface-elevated)'
      }}>
        <button
          onClick={() => setActiveTab('flashcards')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'flashcards' ? '#FFD740' : '#ffffff',
            boxShadow: activeTab === 'flashcards' ? '2px 2px 0px #000000' : '1px 1px 0px #000000',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          <BookOpen size={16} /> Flashcard Quest
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className="btn"
          style={{
            backgroundColor: activeTab === 'review' ? '#FFD740' : '#ffffff',
            boxShadow: activeTab === 'review' ? '2px 2px 0px #000000' : '1px 1px 0px #000000',
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}
        >
          <Calendar size={16} /> Spaced Review
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'flashcards' ? (
          <FlashcardsView 
            state={state} 
            wordsData={wordsData} 
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
          />
        ) : (
          <ReviewSessionView 
            state={state} 
            wordsData={wordsData} 
          />
        )}
      </div>
    </div>
  );
}
