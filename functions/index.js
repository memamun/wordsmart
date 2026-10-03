import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { correctWordIds, rankedReward, consumeQuota } from './validation.js';
import { createWebHandler } from './handler.js';

initializeApp();
const db = getFirestore();
const aiConfig = defineSecret('WORDSMART_AI_CONFIG');
const vocabulary = new Map(JSON.parse(readFileSync(new URL('./data/vocabulary.json', import.meta.url))).map(word => [word.id, word]));

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
