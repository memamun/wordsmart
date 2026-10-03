/**
 * XP Reset Script
 * Resets all user XP, coins, level, quizMasteredWordIds, and streak fields.
 * Run from the project root: node scripts/reset_xp.js
 */

const { initializeApp } = require('../functions/node_modules/firebase-admin/lib/app');
const { getFirestore } = require('../functions/node_modules/firebase-admin/lib/firestore');
const { getAuth } = require('../functions/node_modules/firebase-admin/lib/auth');

// Use GOOGLE_APPLICATION_CREDENTIALS or Firebase CLI's ADC
const app = initializeApp({ projectId: 'wordsmart-vocab-76' });
const db = getFirestore(app);
const auth = getAuth(app);

const PROGRESS_RESET = {
  xp: 0,
  coins: 0,
  level: 1,
  quizMasteredWordIds: [],
  totalQuizAnswers: 0,
  totalCorrectAnswers: 0,
  streak: 0,
  longestStreak: 0,
  lastQuizDate: null,
};

async function resetAllUserXP() {
  console.log('🔄 Starting XP reset — project: wordsmart-vocab-76\n');

  // List all Auth users (handles pagination)
  const allUsers = [];
  let pageToken;
  do {
    const result = await auth.listUsers(1000, pageToken);
    allUsers.push(...result.users);
    pageToken = result.pageToken;
  } while (pageToken);

  console.log(`Found ${allUsers.length} authenticated user(s).\n`);

  const BATCH_LIMIT = 450;
  let batch = db.batch();
  let opCount = 0;
  let resetCount = 0;

  for (const user of allUsers) {
    const uid = user.uid;

    // Reset progress subcollection document
    const progressRef = db
      .collection('users').doc(uid)
      .collection('data').doc('progress');
    batch.set(progressRef, PROGRESS_RESET, { merge: true });
    opCount++;

    // Reset top-level user fields
    const userRef = db.collection('users').doc(uid);
    batch.set(userRef, { xp: 0, level: 1, coins: 0 }, { merge: true });
    opCount++;

    if (opCount >= BATCH_LIMIT) {
      await batch.commit();
      console.log(`  ✓ Flushed batch (${opCount} ops)...`);
      batch = db.batch();
      opCount = 0;
    }

    resetCount++;
    console.log(`  → UID: ${uid} | email: ${user.email || 'N/A'}`);
  }

  if (opCount > 0) {
    await batch.commit();
    console.log(`  ✓ Final batch committed (${opCount} ops).`);
  }

  console.log(`\n✅ Done! Reset ${resetCount} user(s).`);
  console.log('   Fields cleared: xp, coins, level, quizMasteredWordIds, streak, streakHistory.');
}

resetAllUserXP().catch((err) => {
  console.error('\n❌ Reset failed:', err.message);
  process.exit(1);
});
