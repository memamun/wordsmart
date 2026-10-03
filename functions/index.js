import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { correctWordIds, rankedReward, consumeQuota } from './validation.js';
import { createWebHandler } from './handler.js';

initializeApp();
const db = getFirestore();
const aiConfig = defineSecret('WORDSMART_AI_CONFIG');
const vocabulary = new Map(JSON.parse(readFileSync(new URL('./data/vocabulary.json', import.meta.url))).map(word => [word.id, word]));

// Admin UIDs with elevated access
const ADMIN_UIDS = new Set(['mQkm2B0UawN77DvOzFR8E1bQhOy2']);

async function limitUsage(uid, kind, perMinute, perDay) {
  const ref = db.doc(`serverUsage/${uid}/limits/${kind}`);
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    transaction.set(ref, consumeQuota(snapshot.data(), Date.now(), perMinute, perDay));
  });
}

async function scoreQuiz(user, answers) {
  const correctIds = correctWordIds(answers, vocabulary);
  await limitUsage(user.uid, 'quiz', 10, 200);
  const progressRef = db.doc(`rankedProgress/${user.uid}`);
  const leaderboardRef = db.doc(`leaderboard/${user.uid}`);
  return db.runTransaction(async transaction => {
    const previous = (await transaction.get(progressRef)).data() || {};
    const result = rankedReward(previous.earnedIds || [], correctIds);
    if (!result.awardedXp) return { awardedXp: 0, totalXp: result.totalXp };
    const today = Math.floor(Date.now() / 86400000);
    const streak = previous.lastDay === today ? previous.streak : previous.lastDay === today - 1 ? previous.streak + 1 : 1;
    transaction.set(progressRef, { earnedIds: result.earnedIds, lastDay: today, streak });
    transaction.set(leaderboardRef, {
      uid: user.uid, displayName: typeof user.name === 'string' ? user.name.slice(0, 100) : 'WordSmart Learner',
      photoURL: typeof user.picture === 'string' ? user.picture : null,
      xp: result.totalXp, level: Math.min(8, 1 + Math.floor(result.earnedIds.length / 100)), streak,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { awardedXp: result.awardedXp, totalXp: result.totalXp };
  });
}

export const webApi = onRequest({ region: 'us-central1', secrets: [aiConfig], timeoutSeconds: 60, maxInstances: 5, cors: false }, createWebHandler({
  verifyToken: token => getAuth().verifyIdToken(token, true),
  scoreQuiz, limitUsage, getConfig: () => aiConfig.value(),
}));

/**
 * Admin API — lists all Firebase Auth users merged with their Firestore progress.
 * Only callable by UIDs in ADMIN_UIDS.
 *
 * Actions:
 *   listUsers  — returns all Auth users with Firestore data merged
 *   resetUser  — resets a single user's XP/coins/level/streak
 *   updateUser — updates specific fields for a user
 */
export const adminApi = onCall({
  region: 'us-central1',
  timeoutSeconds: 120,
  maxInstances: 2,
  cors: true,
}, async (request) => {
  // 1. Auth check
  if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
  if (!ADMIN_UIDS.has(request.auth.uid)) throw new HttpsError('permission-denied', 'Admin access required.');

  const { action, uid: targetUid } = request.data || {};

  // ── listUsers ─────────────────────────────────────────────
  if (action === 'listUsers') {
    const auth = getAuth();
    const allAuthUsers = [];
    let pageToken;
    do {
      const result = await auth.listUsers(1000, pageToken);
      allAuthUsers.push(...result.users);
      pageToken = result.pageToken;
    } while (pageToken);

    // Batch-fetch Firestore top-level user docs
    const firestoreData = new Map();
    const CHUNK = 10;
    for (let i = 0; i < allAuthUsers.length; i += CHUNK) {
      const chunk = allAuthUsers.slice(i, i + CHUNK);
      await Promise.all(chunk.map(async (u) => {
        try {
          const [userSnap, progSnap] = await Promise.all([
            db.collection('users').doc(u.uid).get(),
            db.collection('users').doc(u.uid).collection('data').doc('progress').get(),
          ]);
          firestoreData.set(u.uid, {
            ...(userSnap.exists ? userSnap.data() : {}),
            progress: progSnap.exists ? progSnap.data() : {},
          });
        } catch (_) { firestoreData.set(u.uid, { progress: {} }); }
      }));
    }

    // Merge Auth + Firestore
    const users = allAuthUsers.map(u => {
      const fs = firestoreData.get(u.uid) || { progress: {} };
      const prog = fs.progress || {};
      return {
        uid:         u.uid,
        email:       u.email || '',
        displayName: u.displayName || fs.displayName || prog.displayName || 'Unknown',
        photoURL:    u.photoURL || fs.photoURL || prog.photoURL || '',
        createdAt:   u.metadata?.creationTime || null,
        lastSignIn:  u.metadata?.lastSignInTime || null,
        disabled:    u.disabled || false,
        provider:    u.providerData?.[0]?.providerId || 'unknown',
        // Firestore fields
        xp:          Number(fs.xp ?? prog.xp ?? 0),
        coins:       Number(fs.coins ?? prog.coins ?? 0),
        level:       Number(fs.level ?? prog.level ?? prog.unlockedLevel ?? 1),
        streak:      Number(fs.streak ?? prog.streak ?? 0),
        longestStreak: Number(prog.longestStreak ?? 0),
        mastered:    Array.isArray(prog.quizMasteredWordIds) ? prog.quizMasteredWordIds.length : 0,
        lastActive:  prog.lastActiveDate || fs.lastActiveDate || null,
        achievements: Array.isArray(prog.achievements) ? prog.achievements : [],
        totalQuizAnswers:   Number(prog.totalQuizAnswers ?? 0),
        totalCorrectAnswers: Number(prog.totalCorrectAnswers ?? 0),
        hasFirestore: firestoreData.has(u.uid),
      };
    });

    return { users, total: users.length };
  }

  // ── resetUser ─────────────────────────────────────────────
  if (action === 'resetUser') {
    if (!targetUid) throw new HttpsError('invalid-argument', 'uid is required.');
    const resetData = {
      xp: 0, coins: 0, level: 1, streak: 0, longestStreak: 0,
      quizMasteredWordIds: [], totalQuizAnswers: 0, totalCorrectAnswers: 0, lastQuizDate: null,
    };
    await db.collection('users').doc(targetUid).set({ xp: 0, coins: 0, level: 1, streak: 0 }, { merge: true });
    await db.collection('users').doc(targetUid).collection('data').doc('progress').set(resetData, { merge: true });
    return { success: true };
  }

  // ── updateUser ────────────────────────────────────────────
  if (action === 'updateUser') {
    if (!targetUid) throw new HttpsError('invalid-argument', 'uid is required.');
    const { xp, coins, level, streak } = request.data;
    const update = {};
    if (typeof xp     === 'number') update.xp     = xp;
    if (typeof coins  === 'number') update.coins   = coins;
    if (typeof level  === 'number') update.level   = level;
    if (typeof streak === 'number') update.streak  = streak;
    await db.collection('users').doc(targetUid).set(update, { merge: true });
    await db.collection('users').doc(targetUid).collection('data').doc('progress').set(
      { ...update, ...(level ? { unlockedLevel: level } : {}) }, { merge: true }
    );
    return { success: true };
  }

  throw new HttpsError('invalid-argument', `Unknown action: ${action}`);
});
