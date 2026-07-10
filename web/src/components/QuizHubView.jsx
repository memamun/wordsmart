import React, { useState } from 'react';
import { 
  Award, 
  Zap, 
  Puzzle, 
  GraduationCap, 
  Library 
} from 'lucide-react';
import QuizzesView from './QuizzesView.jsx';
import VocabDrillsView from './VocabDrillsView.jsx';
import QuickMatchView from './QuickMatchView.jsx';
import AdvancedQuizzesView from './AdvancedQuizzesView.jsx';
import TimeBlitzView from './TimeBlitzView.jsx';
import AllQuizzesView from './AllQuizzesView.jsx';

export default function QuizHubView({ state, wordsData, selectedUnit, setSelectedUnit, setActiveView }) {
  const [activeTab, setActiveTab] = useState('library'); // Default to library to explore

  const TABS = [
    { id: 'library', label: 'Quiz Library', icon: Library, color: '#18FFFF' },
    { id: 'qualification', label: 'Qualification MCQs', icon: Award, color: '#69F0AE' },
    { id: 'drills', label: 'Vocab Drills', icon: Zap, color: '#E040FB' },
    { id: 'match', label: 'Quick Match', icon: Puzzle, color: '#FFD740' },
    { id: 'advanced', label: 'Advanced GRE/SAT', icon: GraduationCap, color: '#FF5252' },
    { id: 'blitz', label: 'Time Blitz', icon: Zap, color: '#FF9100' }
  ];

  const renderActiveView = () => {
    switch (activeTab) {
      case 'qualification':
        return (
          <QuizzesView 
            state={state} 
            wordsData={wordsData} 
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
          />
        );
      case 'drills':
        return (
          <VocabDrillsView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'match':
        return (
          <QuickMatchView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'advanced':
        return (
          <AdvancedQuizzesView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'blitz':
        return (
          <TimeBlitzView 
            state={state} 
            wordsData={wordsData} 
          />
        );
      case 'library':
      default:
        return (
          <AllQuizzesView 
            state={state} 
            wordsData={wordsData} 
            setActiveView={setActiveView}
          />
        );
    }
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Scrollable Sub-navigation Tabs */}
      <div className="no-scrollbar" style={{ 
        display: 'flex', 
        gap: '0.75rem', 
        padding: '1rem 2rem', 
        borderBottom: '3px solid #000000',
        backgroundColor: 'var(--bg-surface-elevated)',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn"
              style={{
                backgroundColor: isActive ? tab.color : '#ffffff',
                boxShadow: isActive ? '2px 2px 0px #000000' : '1px 1px 0px #000000',
                color: '#000000',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                flexShrink: 0
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderActiveView()}
      </div>
    </div>
  );
}
