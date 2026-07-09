import React from 'react';
import { Trophy, Award, Flame, Star, Sparkles } from 'lucide-react';
import { PREP_STAGES } from '../hooks/useGameState';

// Mock banking aspirants competing on the platform
const MOCK_ASPIRANTS = [
  { id: 'm1', name: 'Tanvir Hossain', xp: 18450, level: 10, streak: 12, avatar: '🥇' },
  { id: 'm2', name: 'Ayesha Akhter', xp: 15920, level: 9, streak: 8, avatar: '🥈' },
  { id: 'm3', name: 'Zayan Ahmed', xp: 12840, level: 8, streak: 15, avatar: '🥉' },
  { id: 'm4', name: 'Taskin Karim', xp: 10450, level: 7, streak: 4, avatar: '👤' },
  { id: 'm5', name: 'Adnan Sami', xp: 8750, level: 6, streak: 6, avatar: '👤' },
  { id: 'm6', name: 'Nusrat Jahan', xp: 6200, level: 5, streak: 3, avatar: '👤' },
  { id: 'm7', name: 'Mahrab Kabir', xp: 4890, level: 4, streak: 2, avatar: '👤' },
  { id: 'm8', name: 'Sumaiya Khan', xp: 2900, level: 3, streak: 1, avatar: '👤' },
  { id: 'm9', name: 'Faisal Mahmud', xp: 950, level: 2, streak: 0, avatar: '👤' },
];

export default function LeaderboardView({ state }) {
  const currentStage = PREP_STAGES.find(s => s.id === state.unlockedLevel) || PREP_STAGES[0];
  
  // Create user's entry dynamically based on their live XP
  const userEntry = {
    id: 'user',
    name: 'You (WordSmart Learner)',
    xp: state.xp,
    level: state.unlockedLevel,
    streak: state.streak,
    avatar: '🎓',
    isUser: true
  };

  // Combine user entry and mock competitors, then sort by XP
  const leaderboardList = [...MOCK_ASPIRANTS, userEntry].sort((a, b) => b.xp - a.xp);

  // Find user's current ranking position
  const userRankIndex = leaderboardList.findIndex(item => item.id === 'user') + 1;

  return (
    <div style={{ padding: '2rem', maxWidth: '750px', margin: '0 auto' }} className="animate-fade">
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy color="hsl(var(--secondary))" /> Aspirants Leaderboard
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
            Compete with simulated learners. Gain XP to climb the ranks!
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '700' }}>YOUR RANKING</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-title)', color: 'hsl(var(--primary))' }}>
            #{userRankIndex} <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>of {leaderboardList.length}</span>
          </div>
        </div>
      </div>

      {/* Top Banner / Motivating quote */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(30, 41, 59, 0.4) 100%)',
        border: '1px solid hsla(var(--primary), 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'hsla(var(--primary), 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--primary))'
        }}>
          <Sparkles size={16} />
        </div>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
          {userRankIndex <= 3 ? (
            <span style={{ color: 'hsl(var(--secondary))', fontWeight: '600' }}>Excellent work! You are in the top 3! Keep studying to maintain your position on the podium.</span>
          ) : (
            <span>You need **{(leaderboardList[userRankIndex - 2]?.xp - state.xp).toLocaleString()} more XP** to overtake **{leaderboardList[userRankIndex - 2]?.name}**! Complete more flashcards and quizzes.</span>
          )}
        </p>
      </div>

      {/* Leaderboard Table List */}
      <div className="glass-panel" style={{
        padding: '0.5rem',
        backgroundColor: 'hsl(var(--bg-surface) / 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
      }}>
        {leaderboardList.map((competitor, index) => {
          const rank = index + 1;
          const stage = PREP_STAGES.find(s => s.id === competitor.level) || PREP_STAGES[0];
          
          let rankIcon = competitor.avatar;
          if (rank === 1) rankIcon = '🥇';
          else if (rank === 2) rankIcon = '🥈';
          else if (rank === 3) rankIcon = '🥉';

          return (
            <div 
              key={competitor.id}
              className="animate-slide-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.9rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: competitor.isUser ? 'hsla(var(--primary), 0.08)' : 'transparent',
                border: competitor.isUser ? '1px solid hsla(var(--primary), 0.3)' : '1px solid transparent',
                transition: 'var(--transition-fast)'
              }}
            >
              {/* Rank & Profile Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <span style={{ 
                  width: '28px', 
                  fontSize: '1rem', 
                  fontWeight: '800', 
                  fontFamily: 'var(--font-title)', 
                  color: rank <= 3 ? 'hsl(var(--secondary))' : 'hsl(var(--text-muted))',
                  textAlign: 'center'
                }}>
                  {rank > 3 ? `#${rank}` : ''}
                  {rank <= 3 && rankIcon}
                </span>
                
                <span style={{ 
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: competitor.isUser ? 'hsla(var(--primary), 0.15)' : 'hsl(var(--bg-canvas))',
                  border: '1px solid hsl(var(--border-muted))'
                }}>
                  {competitor.isUser ? '🎓' : '👤'}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ 
                    fontWeight: competitor.isUser ? '700' : '600', 
                    fontSize: '1rem',
                    color: competitor.isUser ? 'white' : 'hsl(var(--text-primary))'
                  }}>
                    {competitor.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
                    Stage {competitor.level}: {stage.name}
                  </span>
                </div>
              </div>

              {/* Stats - Streak & XP */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {competitor.streak > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: '#F59E0B', fontSize: '0.85rem', fontWeight: '600' }}>
                    <Flame size={14} fill="#F59E0B" />
                    <span>{competitor.streak}d</span>
                  </div>
                )}
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <div style={{ 
                    fontFamily: 'var(--font-title)', 
                    fontWeight: '800', 
                    fontSize: '1.05rem', 
                    color: competitor.isUser ? 'hsl(var(--primary))' : 'white'
                  }}>
                    {competitor.xp.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>XP</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
