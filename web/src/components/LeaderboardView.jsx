import React, { useState, useEffect } from 'react';
import { Trophy, Award, Flame, Star, Sparkles, Globe, UserCheck, Cloud, RefreshCw } from 'lucide-react';
import { PREP_STAGES } from '../hooks/useGameState';
import { db } from '../firebase.js';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function LeaderboardView({ state, user }) {
  const [cloudUsers, setCloudUsers] = useState([]);
  const [isCloudActive, setIsCloudActive] = useState(false);
  const [loadingCloud, setLoadingCloud] = useState(true);

  // Subscribe to live global leaderboard from Cloud Firestore
  useEffect(() => {
    if (!db) {
      setLoadingCloud(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'users'),
        orderBy('xp', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.displayName || 'WordSmart Learner',
            xp: Number(data.xp) || 0,
            level: Number(data.level) || 1,
            streak: Number(data.streak) || 0,
            photoURL: data.photoURL || null,
            isUser: user?.uid === docSnap.id
          });
        });

        setCloudUsers(list);
        setIsCloudActive(true);
        setLoadingCloud(false);
      }, () => {
        setLoadingCloud(false);
      });

      return () => unsubscribe();
    } catch {
      setLoadingCloud(false);
    }
  }, [user]);

  const userName = user?.displayName ? `${user.displayName}` : 'You (WordSmart Learner)';

  // Build local user entry
  const userEntry = {
    id: user?.uid || 'current_user',
    name: user?.displayName ? `${user.displayName}` : 'You (WordSmart Learner)',
    xp: Number(state.xp) || 0,
    level: Number(state.unlockedLevel) || 1,
    streak: Number(state.streak) || 0,
    photoURL: user?.photoURL || null,
    avatar: '🎓',
    isUser: true
  };

  // Only actual real registered competitors from Firestore
  let rawList = [...cloudUsers];

  // If local user has earned XP or is signed in, ensure they appear in the live list
  const userAlreadyInList = rawList.some(item => item.id === userEntry.id || (user?.uid && item.id === user.uid));
  if (!userAlreadyInList && (user?.uid || state.xp > 0)) {
    rawList.push(userEntry);
  } else {
    // Update existing user entry with live local state
    rawList = rawList.map(item => {
      if (item.id === userEntry.id || (user?.uid && item.id === user.uid)) {
        return { ...item, ...userEntry, isUser: true };
      }
      return item;
    });
  }

  // Sort descending by XP
  const leaderboardList = rawList.sort((a, b) => b.xp - a.xp);

  // Find user rank
  const userRankIndex = leaderboardList.findIndex(item => item.isUser || item.id === userEntry.id) + 1;

  return (
    <div style={{ padding: '2rem', maxWidth: '750px', margin: '0 auto' }} className="animate-fade leaderboard-view-container">
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy color="hsl(var(--secondary))" /> Global Leaderboard
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '800',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: isCloudActive ? 'var(--theme-green)' : 'var(--bg-surface-elevated)',
              color: isCloudActive ? '#000' : 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              border: 'var(--border-thin)'
            }}>
              <Cloud size={12} color="#000" />
              LIVE CLOUD
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Compete with test takers nationwide. Earn XP through flashcards and quizzes to climb the podium!
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800' }}>YOUR GLOBAL RANK</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'hsl(var(--primary))' }}>
            #{userRankIndex > 0 ? userRankIndex : '-'} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>of {leaderboardList.length}</span>
          </div>
        </div>
      </div>

      {/* Top Banner / Motivating quote */}
      {leaderboardList.length > 0 && (
        <div className="glass-panel" style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, hsla(var(--primary), 0.08) 0%, var(--bg-surface) 100%)',
          border: 'var(--border-thick)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--theme-yellow)',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            border: 'var(--border-thin)',
            flexShrink: 0,
            boxShadow: 'var(--shadow-tiny)'
          }}>
            <Sparkles size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              PERFORMANCE HIGHLIGHT
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.4', marginTop: '2px', fontWeight: '600' }}>
              {userRankIndex === 1 ? (
                <span style={{ color: 'hsl(var(--secondary))' }}>🏆 Outstanding Achievement! You are currently #1 on the leaderboard! Keep building your streak to hold the title.</span>
              ) : userRankIndex <= 3 && userRankIndex > 1 ? (
                <span style={{ color: 'hsl(var(--secondary))' }}>🥇 Excellent work! You are on the podium in the Top 3!</span>
              ) : (
                <span>You need <strong style={{ color: 'hsl(var(--primary))' }}>{((leaderboardList[userRankIndex - 2]?.xp || 0) - state.xp).toLocaleString()} XP</strong> to pass <strong>{leaderboardList[userRankIndex - 2]?.name}</strong>!</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="glass-panel" style={{
        padding: leaderboardList.length === 0 ? '2.5rem 1.5rem' : '0.5rem',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem'
      }}>
        {leaderboardList.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <Trophy size={48} color="hsl(var(--secondary))" style={{ margin: '0 auto 1rem', display: 'block' }} />
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              No Ranked Learners Yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
              Sign in with your Google account and practice vocabulary quizzes or flashcards to be the first to claim the #1 spot on the global leaderboard!
            </p>
          </div>
        ) : (
          leaderboardList.map((competitor, index) => {
          const rank = index + 1;
          const stage = PREP_STAGES.find(s => s.id === competitor.level) || PREP_STAGES[0];
          const isUser = competitor.isUser;

          return (
            <div 
              key={competitor.id || index}
              className="animate-slide-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isUser ? 'var(--theme-cyan)' : 'var(--bg-surface-elevated)',
                color: isUser ? 'var(--text-black)' : 'inherit',
                border: isUser ? 'var(--border-thick)' : 'var(--border-thin)',
                boxShadow: isUser ? 'var(--shadow-small)' : 'none',
                transition: 'var(--transition-fast)',
                fontWeight: isUser ? '800' : '400'
              }}
            >
              {/* Rank & Profile Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                <span style={{ 
                  width: '32px', 
                  fontSize: rank <= 3 ? '1.25rem' : '0.9rem', 
                  fontWeight: '900', 
                  fontFamily: 'var(--font-title)', 
                  color: isUser ? 'var(--text-black)' : rank <= 3 ? 'var(--theme-yellow)' : 'var(--text-muted)',
                  textAlign: 'center',
                  flexShrink: 0
                }}>
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                </span>
                
                {competitor.photoURL ? (
                  <img 
                    src={competitor.photoURL} 
                    alt={competitor.name}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: isUser ? '2px solid #000' : 'var(--border-thin)',
                      flexShrink: 0
                    }} 
                  />
                ) : (
                  <div style={{ 
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: isUser ? 'var(--text-black)' : 'var(--bg-canvas)',
                    color: isUser ? 'var(--theme-cyan)' : 'var(--text-primary)',
                    border: 'var(--border-thin)',
                    flexShrink: 0,
                    fontWeight: '800'
                  }}>
                    {isUser ? '🎓' : competitor.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ 
                    fontWeight: isUser ? '900' : '700', 
                    fontSize: '0.95rem',
                    color: isUser ? 'var(--text-black)' : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <span>{competitor.name}</span>
                    {isUser && (
                      <span style={{ 
                        fontSize: '0.65rem', 
                        backgroundColor: '#000', 
                        color: '#fff', 
                        padding: '0.1rem 0.4rem', 
                        borderRadius: '9999px',
                        fontWeight: '800'
                      }}>YOU</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: isUser ? 'rgba(0, 0, 0, 0.75)' : 'var(--text-muted)', fontWeight: isUser ? '700' : '500' }}>
                    Stage {competitor.level}: {stage.name}
                  </div>
                </div>
              </div>

              {/* Stats - Streak & XP */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                {competitor.streak > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: isUser ? 'var(--text-black)' : 'hsl(var(--secondary))', fontSize: '0.85rem', fontWeight: '800' }}>
                    <Flame size={14} fill={isUser ? 'var(--text-black)' : 'hsl(var(--secondary))'} />
                    <span>{competitor.streak}d</span>
                  </div>
                )}
                <div style={{ textAlign: 'right', minWidth: '75px' }}>
                  <div style={{ 
                    fontFamily: 'var(--font-title)', 
                    fontWeight: '900', 
                    fontSize: '1rem', 
                    color: isUser ? 'var(--text-black)' : 'var(--text-primary)'
                  }}>
                    {competitor.xp.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: isUser ? 'rgba(0, 0, 0, 0.75)' : 'var(--text-muted)', fontWeight: '800' }}>XP</div>
                </div>
              </div>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}
