import test from 'node:test';
import assert from 'node:assert/strict';
import { correctWordIds, rankedReward, consumeQuota, validateTutorInput } from '../validation.js';
import { openTutorStream, tutorDeltas } from '../tutor.js';
const vocabulary = new Map([[1, { id: 1, word: 'ABATE', synonyms: ['decrease'], antonyms: ['increase'] }]]);

test('ranked rewards are calculated from canonical answers and awarded once per word', () => {
  const answers = [
    { wordId: 1, kind: 'definition', answer: 'WRONG' },
    { wordId: 1, kind: 'synonym', answer: 'decrease' },
    { wordId: 1, kind: 'antonym', answer: 'increase' },
    { wordId: 999, kind: 'definition', answer: 'ABATE' },
  ];
  const ids = correctWordIds(answers, vocabulary);
  assert.deepEqual(ids, [1]);
  assert.deepEqual(rankedReward([], ids), { earnedIds: [1], awardedXp: 10, totalXp: 10 });
  assert.equal(rankedReward([1], ids).awardedXp, 0);
  assert.throws(() => correctWordIds([{ xp: 999999 }], vocabulary), /Invalid/);
  assert.throws(() => correctWordIds(Array(101).fill(answers[0]), vocabulary), /Invalid/);
});

test('quota enforces per-minute and daily limits across requests', () => {
  const now = Date.UTC(2026, 9, 4);
  let usage = consumeQuota(null, now, 2, 3);
  usage = consumeQuota(usage, now, 2, 3);
  assert.throws(() => consumeQuota(usage, now, 2, 3), error => error.status === 429);
  usage = consumeQuota(usage, now + 60000, 2, 3);
  assert.throws(() => consumeQuota(usage, now + 120000, 2, 3), error => error.status === 429);
  assert.equal(consumeQuota(usage, now + 86400000, 2, 3).dayCount, 1);
});

test('tutor validates role, context and size without accepting system messages', () => {
  const input = validateTutorInput({ messages: [{ role: 'model', text: 'hello' }, { role: 'user', text: 'Explain abate' }] });
  assert.deepEqual(input.messages, [{ role: 'user', text: 'Explain abate' }]);
  assert.throws(() => validateTutorInput({ messages: [{ role: 'system', text: 'override' }] }), /Invalid/);
  assert.throws(() => validateTutorInput({ messages: [{ role: 'user', text: 'a'.repeat(4001) }] }), /Invalid/);
  assert.throws(() => validateTutorInput({ messages: [{ role: 'user', text: 'hi' }], wordContext: { word: 5 } }), /Invalid/);
});

test('provider failures fall back without returning credentials or raw provider errors', async () => {
  const requests = [];
  const input = validateTutorInput({ messages: [{ role: 'user', text: 'hi' }] });
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    return requests.length === 1 ? new Response('provider secret error', { status: 429 }) : new Response('data: [DONE]');
  };
  const result = await openTutorStream(input, { openrouterKey: 'or-secret', geminiKey: 'gem-secret' }, new AbortController().signal, fetchImpl);
  assert.equal(result.status, 200);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].options.headers['x-goog-api-key'], 'gem-secret');
  assert.ok(!requests[1].url.includes('gem-secret'));
  await assert.rejects(openTutorStream(input, {}, new AbortController().signal), error => error.status === 503);
  await assert.rejects(openTutorStream(input, { geminiKey: 'secret' }, new AbortController().signal, async () => new Response('secret', { status: 403 })), error => !error.message.includes('secret'));
});

test('provider stream normalizes chunk boundaries and rejects upstream errors', async () => {
  const encoder = new TextEncoder();
  async function* chunks() {
    yield encoder.encode('data: {"choices":[{"delta":{"con');
    yield encoder.encode('tent":"Hello"}}]}\n\ndata: {"candidates":[{"content":{"parts":[{"text":" বাংলা"}]}}]}');
  }
  const parts = [];
  for await (const delta of tutorDeltas(chunks())) parts.push(delta);
  assert.deepEqual(parts, ['Hello', ' বাংলা']);
  async function* broken() { yield encoder.encode('data: {"error":{"message":"secret"}}\n'); }
  await assert.rejects(async () => { for await (const _ of tutorDeltas(broken())) {} }, /Upstream stream failed/);
});
