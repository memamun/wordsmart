import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Flame, Sparkles, Cloud, Coins, Shield, Zap } from 'lucide-react';
import { db } from '../firebase.js';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { LEAGUES, getLeague, getPlayerLevel } from '../state/rewards.js';

export default function LeaderboardView({ state, user }) {
  const [cloudUsers, setCloudUsers] = useState([]);
  const [isCloudActive, setIsCloudActive] = useState(false);
  const [loadingCloud, setLoadingCloud] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState('all');

  // Subscribe to live global leaderboard from Cloud Firestore
  useEffect(() => {
    if (!db) {
      setLoadingCloud(false);
      return;
    }

    const processSnapshot = (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const xp = Number(data.xp) || 0;
        const level = Number(data.level) || getPlayerLevel(xp).level;
        list.push({
          id: docSnap.id,
          name: (data.displayName && data.displayName.trim()) || 'WordSmart Learner',
          xp,
          level,
          coins: Number(data.coins) || 0,
          streak: Number(data.streak) || 0,
          photoURL: data.photoURL || null,
          masteredWordsCount: Number(data.masteredWordsCount) || (Array.isArray(data.quizMasteredWordIds) ? data.quizMasteredWordIds.length : 0),
          isUser: Boolean(user?.uid && user.uid === docSnap.id)
        });
      });
      return list;
    };

    try {
      // Query users collection where all learner rankings are aggregated
      const q = query(
        collection(db, 'users'),
        orderBy('xp', 'desc'),
        limit(100)
      );

      let unsubscribeLb = null;
      const unsubscribeUsers = onSnapshot(q, (snapshot) => {
        const list = processSnapshot(snapshot);
        setCloudUsers(list);
        setIsCloudActive(true);
        setLoadingCloud(false);
      }, (error) => {
        console.warn("Firestore users query fallback to leaderboard:", error?.message);
        // Fallback to leaderboard collection
        const qLb = query(
          collection(db, 'leaderboard'),
          orderBy('xp', 'desc'),
          limit(100)
        );
        unsubscribeLb = onSnapshot(qLb, (lbSnap) => {
          const list = processSnapshot(lbSnap);
          setCloudUsers(list);
          setIsCloudActive(true);
          setLoadingCloud(false);
        }, () => {
          setIsCloudActive(false);
          setCloudUsers([]);
          setLoadingCloud(false);
        });
      });

      return () => {
        if (unsubscribeUsers) unsubscribeUsers();
        if (unsubscribeLb) unsubscribeLb();
      };
    } catch (err) {
      console.error("Leaderboard query error:", err);
      setLoadingCloud(false);
    }
  }, [user]);

  // Combine cloud users with current user's local state if they have active progress
  const currentUserXp = Number(state?.xp) || 0;
  const currentUserStreak = Number(state?.streak) || 0;
  const currentUserLevel = Number(state?.playerLevel) || getPlayerLevel(currentUserXp).level;

  let leaderboardList = [...cloudUsers];
  const userIndexInCloud = leaderboardList.findIndex(item => item.isUser || (user?.uid && item.id === user.uid));

  if (userIndexInCloud >= 0) {
    // Keep local optimistic XP if higher than cloud snapshot
    if (currentUserXp > leaderboardList[userIndexInCloud].xp) {
      leaderboardList[userIndexInCloud] = {
        ...leaderboardList[userIndexInCloud],
        xp: currentUserXp,
        level: currentUserLevel,
        streak: Math.max(leaderboardList[userIndexInCloud].streak, currentUserStreak),
        isUser: true
      };
      leaderboardList.sort((a, b) => b.xp - a.xp);
    }
  } else if (currentUserXp > 0 || user?.uid) {
    leaderboardList.push({
      id: user?.uid || 'local_user',
      name: (user?.displayName && user.displayName.trim()) || 'You (WordSmart Learner)',
      xp: currentUserXp,
      level: currentUserLevel,
      coins: Number(state?.coins) || 100,
      streak: currentUserStreak,
      photoURL: user?.photoURL || null,
      masteredWordsCount: Array.isArray(state?.quizMasteredWordIds) ? state.quizMasteredWordIds.length : 0,
      isUser: true
    });
    leaderboardList.sort((a, b) => b.xp - a.xp);
  }

  const userRankIndex = leaderboardList.findIndex(item => item.isUser) + 1;
  const userRankedXp = leaderboardList.find(item => item.isUser)?.xp || currentUserXp;
  const userLevelInfo = useMemo(() => getPlayerLevel(userRankedXp), [userRankedXp]);

  const displayedList = useMemo(() => {
    if (selectedLeague === 'all') return leaderboardList;
    return leaderboardList.filter(competitor => {
      const compInfo = getPlayerLevel(competitor.xp);
      return compInfo.league.id === selectedLeague;
    });
  }, [leaderboardList, selectedLeague]);

  return (
    <div style={{ padding: '2rem', maxWidth: '780px', margin: '0 auto' }} className="animate-fade leaderboard-view-container">
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Trophy color="hsl(var(--secondary))" /> Global Leaderboard
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '800',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: isCloudActive ? 'var(--theme-green)' : 'var(--bg-surface-elevated)',
              color: isCloudActive ? '#000' : 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              border: 'var(--border-thin)'
            }}>
              <Cloud size={12} color={isCloudActive ? '#000' : 'currentColor'} />
              {loadingCloud ? 'SYNCING…' : isCloudActive ? 'LIVE CLOUD' : 'OFFLINE'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            Climb the ranks by mastering vocabulary words, acing stage quizzes, and keeping your daily streak alive!
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em' }}>YOUR GLOBAL RANK</div>
          <div style={{ fontSize: '1.65rem', fontWeight: '900', fontFamily: 'var(--font-title)', color: 'hsl(var(--primary))' }}>
            #{userRankIndex > 0 ? userRankIndex : '-'} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>of {leaderboardList.length}</span>
          </div>
        </div>
      </div>

      {/* User Progression & League Card */}
      <div className="glass-panel" style={{
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: 'var(--border-thick)',
        background: 'linear-gradient(135deg, hsla(var(--primary), 0.1) 0%, var(--bg-surface) 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.75rem' }}>{userLevelInfo.league.badge}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  {userLevelInfo.league.name}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  backgroundColor: 'hsl(var(--primary))',
                  color: '#000'
                }}>
                  Lvl {userLevelInfo.level} • {userLevelInfo.title}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {userRankedXp.toLocaleString()} Total XP earned
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin)' }}>
              <Coins size={16} color="var(--theme-yellow)" />
              <span style={{ fontWeight: '800', fontSize: '0.88rem' }}>{state?.coins ?? 100}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Coins</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', border: 'var(--border-thin)' }}>
              <Flame size={16} color="hsl(var(--secondary))" fill="hsl(var(--secondary))" />
              <span style={{ fontWeight: '800', fontSize: '0.88rem' }}>{currentUserStreak}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Day Streak</span>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            <span>Level {userLevelInfo.level} Progress</span>
            <span>{userLevelInfo.xpToNextLevel > 0 ? `${userLevelInfo.xpToNextLevel.toLocaleString()} XP to Level ${userLevelInfo.level + 1}` : 'Max Level'}</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-canvas)', borderRadius: '999px', overflow: 'hidden', border: 'var(--border-thin)' }}>
            <div style={{
              width: `${userLevelInfo.progressPercent}%`,
              height: '100%',
              backgroundColor: 'hsl(var(--primary))',
              transition: 'width 0.4s ease',
              borderRadius: '999px'
            }} />
          </div>
        </div>
      </div>

      {/* Top Banner / Motivating quote */}
      {userRankIndex > 0 && (
        <div className="glass-panel" style={{
          padding: '1rem 1.25rem',
          background: 'var(--bg-surface)',
          border: 'var(--border-thin)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.25rem'
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
            flexShrink: 0
          }}>
            <Sparkles size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RANKING INSIGHT
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: '1.4', marginTop: '2px', fontWeight: '600', margin: 0 }}>
              {userRankIndex === 1 ? (
                <span style={{ color: 'hsl(var(--secondary))' }}>🏆 Outstanding Achievement! You are currently #1 on the leaderboard! Keep building your streak to hold the title.</span>
              ) : userRankIndex <= 3 && userRankIndex > 1 ? (
                <span style={{ color: 'hsl(var(--secondary))' }}>🥇 Excellent work! You are on the podium in the Top 3!</span>
              ) : (
                <span>You need <strong style={{ color: 'hsl(var(--primary))' }}>{((leaderboardList[userRankIndex - 2]?.xp || 0) - userRankedXp).toLocaleString()} XP</strong> to pass <strong>{leaderboardList[userRankIndex - 2]?.name}</strong>!</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* League Filter Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        overflowX: 'auto',
        paddingBottom: '0.4rem',
        marginBottom: '0.85rem',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        <button
          onClick={() => setSelectedLeague('all')}
          className={`filter-pill ${selectedLeague === 'all' ? 'active active-yellow' : ''}`}
          style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <span>🏆 All Leagues</span>
          <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>({leaderboardList.length})</span>
        </button>
        {LEAGUES.map((lg) => {
          const count = leaderboardList.filter(c => getPlayerLevel(c.xp).league.id === lg.id).length;
          const isUserInLeague = userLevelInfo.league.id === lg.id;
          const isCurrentActive = selectedLeague === lg.id;
          return (
            <button
              key={lg.id}
              onClick={() => setSelectedLeague(lg.id)}
              className={`filter-pill ${isCurrentActive ? 'active active-cyan' : ''}`}
              style={{
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>{lg.badge} {lg.tier}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>({count})</span>
              {isUserInLeague && (
                <span style={{
                  fontSize: '0.58rem',
                  backgroundColor: isCurrentActive ? '#000' : 'var(--theme-yellow)',
                  color: isCurrentActive ? '#fff' : '#000',
                  padding: '0.05rem 0.35rem',
                  borderRadius: '999px',
                  fontWeight: '900'
                }}>YOU</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected League Tier Info Card */}
      {selectedLeague !== 'all' && (() => {
        const activeLg = LEAGUES.find(l => l.id === selectedLeague);
        if (!activeLg) return null;
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 1rem',
            marginBottom: '0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: 'var(--border-thin)',
            fontSize: '0.82rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{activeLg.badge}</span>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>{activeLg.name}</strong>
              <span style={{ color: 'var(--text-muted)' }}>
                ({activeLg.minXp.toLocaleString()} – {activeLg.maxXp === Infinity ? '∞' : `${activeLg.maxXp.toLocaleString()} XP`})
              </span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontWeight: '700' }}>
              {displayedList.length} {displayedList.length === 1 ? 'Learner' : 'Learners'}
            </div>
          </div>
        );
      })()}

      {/* Leaderboard Table List */}
      <div className="glass-panel" style={{
        padding: displayedList.length === 0 ? '2.5rem 1.5rem' : '0.5rem',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        borderRadius: 'var(--radius-md)',
        border: 'var(--border-thin)'
      }}>
        {displayedList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>
              {selectedLeague !== 'all' ? (LEAGUES.find(l => l.id === selectedLeague)?.badge || '🏆') : '🏆'}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {selectedLeague !== 'all' 
                ? `No Learners in ${LEAGUES.find(l => l.id === selectedLeague)?.name || 'this League'} Yet`
                : (loadingCloud ? 'Loading rankings…' : 'No Ranked Learners Yet')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
              {selectedLeague !== 'all'
                ? `Reach ${LEAGUES.find(l => l.id === selectedLeague)?.minXp.toLocaleString()} XP by mastering vocabulary words and taking quizzes to be the first in this league!`
                : 'Complete vocabulary quizzes and practice flashcards while signed in to rank on the global leaderboard!'}
            </p>
          </div>
        ) : (
          displayedList.map((competitor, index) => {
            const rank = index + 1;
            const isUser = competitor.isUser;
            const compLevelInfo = getPlayerLevel(competitor.xp);

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
                        width: '38px',
                        height: '38px',
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
                      width: '38px',
                      height: '38px',
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
                      gap: '0.4rem'
                    }}>
                      <span>{competitor.name}</span>
                      {isUser && (
                        <span style={{ 
                          fontSize: '0.65rem', 
                          backgroundColor: '#000', 
                          color: '#fff', 
                          padding: '0.1rem 0.45rem', 
                          borderRadius: '9999px',
                          fontWeight: '800'
                        }}>YOU</span>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '0.72rem', 
                      color: isUser ? 'rgba(0, 0, 0, 0.75)' : 'var(--text-muted)', 
                      fontWeight: isUser ? '700' : '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <span>{compLevelInfo.league.badge} {compLevelInfo.league.name}</span>
                      <span>•</span>
                      <span>Lvl {competitor.level || compLevelInfo.level}</span>
                    </div>
                  </div>
                </div>

                {/* Stats - Streak & XP */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
                  {competitor.streak > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.2rem', 
                      color: isUser ? 'var(--text-black)' : 'hsl(var(--secondary))', 
                      fontSize: '0.85rem', 
                      fontWeight: '800',
                      backgroundColor: isUser ? 'rgba(0,0,0,0.06)' : 'var(--bg-canvas)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '999px'
                    }}>
                      <Flame size={14} fill={isUser ? 'var(--text-black)' : 'hsl(var(--secondary))'} />
                      <span>{competitor.streak}d</span>
                    </div>
                  )}
                  <div style={{ textAlign: 'right', minWidth: '85px' }}>
                    <div style={{ 
                      fontFamily: 'var(--font-title)', 
                      fontWeight: '900', 
                      fontSize: '1.05rem', 
                      color: isUser ? 'var(--text-black)' : 'var(--text-primary)'
                    }}>
                      {competitor.xp.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: isUser ? 'rgba(0, 0, 0, 0.75)' : 'var(--text-muted)', fontWeight: '800' }}>TOTAL XP</div>
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
