import { doc, getDocFromServer, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import { cloudRevision } from '../state/progress.js';
import { getPlayerLevel, getLeague } from '../state/rewards.js';

export function progressRemote(uid) {
  const ref = doc(db, 'users', uid, 'data', 'progress');
  return {
    async read() {
      const snapshot = await getDocFromServer(ref);
      if (snapshot.exists()) {
        const progData = snapshot.data();
        // If subcollection progress doc has 0 XP but top-level user doc has XP, adopt it
        if (!progData.xp || Number(progData.xp) === 0) {
          try {
            const userSnap = await getDocFromServer(doc(db, 'users', uid));
            if (userSnap.exists()) {
              const uData = userSnap.data();
              const uXp = Number(uData.xp) || 0;
              const uCoins = Number(uData.coins) || 0;
              if (uXp > 0) {
                return {
                  ...progData,
                  xp: uXp,
                  coins: Math.max(Number(progData.coins) || 0, uCoins),
                  streak: Math.max(Number(progData.streak) || 0, Number(uData.streak) || 0),
                };
              }
            }
          } catch {
            // Ignore optional fetch error and proceed with progData
          }
        }
        return progData;
      }

      // Read legacy profiles once; never combine them with another browser user's progress.
      const legacy = await getDocFromServer(doc(db, 'users', uid));
      return legacy.exists() ? { ...legacy.data(), revision: 0 } : null;
    },

    write(progress, expectedRevision) {
      const userRef = doc(db, 'users', uid);
      const leaderboardRef = doc(db, 'leaderboard', uid);
      const user = auth.currentUser;
      const displayName = user?.displayName ? user.displayName.slice(0, 100) : 'WordSmart Learner';
      const photoURL = user?.photoURL ? user.photoURL.slice(0, 1000) : '';
      const email = user?.email ? user.email.slice(0, 150) : '';

      const xp = Math.max(0, Number(progress.xp) || 0);
      const coins = Math.max(0, Number(progress.coins) || 0);
      const level = Math.max(1, Number(progress.playerLevel || getPlayerLevel(xp).level) || 1);
      const league = getLeague(xp).name;
      const streak = Math.max(0, Number(progress.streak) || 0);
      const longestStreak = Math.max(streak, Number(progress.longestStreak) || 0);
      const quizMastered = Array.isArray(progress.quizMasteredWordIds) ? progress.quizMasteredWordIds : [];

      return runTransaction(db, async transaction => {
        const snapshot = await transaction.get(ref);
        const data = snapshot.exists() ? snapshot.data() : null;
        if (cloudRevision(data) !== expectedRevision) return { conflict: true, data };
        const revision = expectedRevision + 1;
        const now = serverTimestamp();

        // 1. Full private progress state
        transaction.set(ref, {
          ...progress,
          xp,
          coins,
          streak,
          longestStreak,
          playerLevel: level,
          schemaVersion: 3,
          revision,
          updatedAt: now
        });

        // 2. Public profile & primary leaderboard record in users/{uid}
        // (Queried by Web Leaderboard, Android App LeaderboardRepository, and Admin Panel)
        transaction.set(userRef, {
          uid,
          displayName,
          photoURL,
          email,
          xp,
          coins,
          level,
          league,
          streak,
          longestStreak,
          masteredWordsCount: quizMastered.length,
          quizMasteredWordIds: quizMastered.slice(0, 2000),
          updatedAt: now
        }, { merge: true });

        // 3. Fast leaderboard/{uid} mirror record
        transaction.set(leaderboardRef, {
          uid,
          displayName,
          photoURL,
          xp,
          level,
          league,
          streak,
          updatedAt: now
        }, { merge: true });

        return { revision };
      });
    },
  };
}
