import { test, before, after } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { defaultProgress } from '../src/state/progress.js';
let env;
before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-wordsmart', firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8') } });
});
after(async () => env?.cleanup());
const payload = revision => ({ ...defaultProgress(), schemaVersion: 3, revision, updatedAt: serverTimestamp() });

test('progress is private and revisions must advance exactly once', async () => {
  const alice = env.authenticatedContext('alice').firestore();
  const bob = env.authenticatedContext('bob').firestore();
  const ref = doc(alice, 'users/alice/data/progress');
  await assertSucceeds(setDoc(ref, payload(1)));
  await assertFails(getDoc(doc(bob, 'users/alice/data/progress')));
  await assertFails(setDoc(doc(bob, 'users/alice/data/progress'), payload(2)));
  await assertFails(setDoc(ref, payload(1)));
  await assertFails(setDoc(ref, payload(3)));
  await assertSucceeds(setDoc(ref, { ...payload(2), bookmarkedWordIds: [] }));
  await assertFails(deleteDoc(ref));
});

test('legacy records can migrate but invalid progress and hidden fields are denied', async () => {
  await env.withSecurityRulesDisabled(async context => setDoc(doc(context.firestore(), 'users/legacy/data/progress'), { xp: 40 }));
  const db = env.authenticatedContext('legacy').firestore();
  const ref = doc(db, 'users/legacy/data/progress');
  await assertSucceeds(setDoc(ref, payload(1)));
  await assertFails(setDoc(ref, { ...payload(2), coins: -5 }));
  await assertFails(setDoc(ref, { ...payload(2), unlockedLevel: 9 }));
  await assertFails(setDoc(ref, { ...payload(2), admin: true }));
});

test('public leaderboard is readable but client score and quota writes are denied', async () => {
  const db = env.authenticatedContext('alice').firestore();
  const guest = env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(guest, 'leaderboard/alice')));
  await assertFails(setDoc(doc(db, 'leaderboard/alice'), { xp: 999999 }));
  await assertFails(setDoc(doc(db, 'users/alice'), { uid: 'alice', xp: 999999, level: 1, streak: 1 }));
  await assertFails(setDoc(doc(db, 'rankedProgress/alice'), { earnedIds: [1] }));
  await assertFails(setDoc(doc(db, 'serverUsage/alice/limits/tutor'), { dayCount: 0 }));
  await assertFails(setDoc(doc(guest, 'users/alice/data/progress'), payload(3)));
});
