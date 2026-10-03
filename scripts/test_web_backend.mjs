// Integration smoke test: only demo emulators. Never use production URLs or credentials.
import assert from 'node:assert/strict';
const host = '127.0.0.1';
if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.GCLOUD_PROJECT !== 'demo-wordsmart') {
  throw new Error('Run this test through Firebase emulators:exec --project demo-wordsmart.');
}
const authUrl = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`;
const signup = await fetch(authUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `test-${Date.now()}@example.test`, password: 'emulator-only-password', returnSecureToken: true }) });
assert.equal(signup.status, 200);
const { idToken, localId } = await signup.json();
const apiUrl = `http://${host}:5001/demo-wordsmart/us-central1/webApi`;
const post = (path, body, token = idToken) => fetch(`${apiUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
assert.equal((await post('/api/quiz/score', { answers: [] }, null)).status, 401);
assert.equal((await post('/api/quiz/score', { xp: 999999 })).status, 400);
const { readFile } = await import('node:fs/promises');
const [word] = JSON.parse(await readFile(new URL('../functions/data/vocabulary.json', import.meta.url), 'utf8'));
const answers = [{ wordId: word.id, kind: 'definition', answer: word.word }];
const first = await post('/api/quiz/score', { answers, xp: 999999 });
assert.equal(first.status, 200, await first.clone().text());
assert.deepEqual(await first.json(), { awardedXp: 10, totalXp: 10 });
const repeated = await Promise.all([post('/api/quiz/score', { answers }), post('/api/quiz/score', { answers })]);
for (const response of repeated) assert.deepEqual(await response.json(), { awardedXp: 0, totalXp: 10 });
const firestore = `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/demo-wordsmart/databases/(default)/documents`;
const leaderboard = await fetch(`${firestore}/leaderboard/${localId}`);
assert.equal(leaderboard.status, 200);
assert.equal((await leaderboard.json()).fields.xp.integerValue, '10');
const denied = await fetch(`${firestore}/leaderboard/${localId}`, {
  method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
  body: JSON.stringify({ fields: { xp: { integerValue: '999999' } } }),
});
assert.equal(denied.status, 403);
// Empty emulator-only configuration must fail cleanly without calling a provider.
const tutor = await post('/api/tutor', { messages: [{ role: 'user', text: 'Explain abate' }] });
assert.equal(tutor.status, 503);
assert.match((await tutor.json()).error, /not configured/);
console.log('Backend integration passed: authentication, canonical scoring, concurrent replay protection, leaderboard rules, and safe missing-secret behavior.');
