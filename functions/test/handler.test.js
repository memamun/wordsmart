import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createWebHandler } from '../handler.js';
import { RequestError } from '../validation.js';

function request(overrides = {}) {
  return { method: 'POST', path: '/api/tutor', get: () => 'Bearer test-token', body: { messages: [{ role: 'user', text: 'Explain abate' }] }, ...overrides };
}
function response() {
  const res = new EventEmitter();
  Object.assign(res, { code: 200, headers: {}, output: '', headersSent: false, writableEnded: false });
  res.status = code => { res.code = code; return res; };
  res.set = (key, value) => { res.headers[key] = value; return res; };
  res.json = data => { res.data = data; res.end(); return res; };
  res.write = text => { res.headersSent = true; res.output += text; return true; };
  res.end = () => { res.writableEnded = true; res.emit('close'); };
  return res;
}
const user = { uid: 'alice', firebase: { sign_in_provider: 'google.com' } };
const dependencies = () => ({
  verifyToken: async token => { assert.equal(token, 'test-token'); return user; },
  scoreQuiz: async (account, answers) => { assert.equal(account.uid, 'alice'); return { awardedXp: 10, totalXp: 10 }; },
  limitUsage: async () => {}, getConfig: () => '{}',
  openStream: async () => new Response('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: [DONE]\n'),
});

test('missing, invalid, and anonymous authentication cannot reach provider or scoring', async () => {
  for (const verifyToken of [async () => { throw new Error('secret token'); }, async () => ({ uid: 'guest', firebase: { sign_in_provider: 'anonymous' } })]) {
    let used = false;
    const handler = createWebHandler({ ...dependencies(), verifyToken, limitUsage: async () => { used = true; } });
    const res = response();
    await handler(request(), res);
    assert.equal(res.code, 401);
    assert.equal(used, false);
    assert.ok(!res.data.error.includes('secret'));
  }
  const res = response();
  await createWebHandler(dependencies())(request({ get: () => undefined }), res);
  assert.equal(res.code, 401);
});

test('authenticated requests stream sanitized deltas and score with the verified user', async () => {
  const handler = createWebHandler(dependencies());
  const stream = response();
  await handler(request(), stream);
  assert.equal(stream.code, 200);
  assert.ok(stream.output.includes('"delta":"Hello"'));
  assert.ok(stream.output.includes('[DONE]'));
  const ranked = response();
  await handler(request({ path: '/api/quiz/score', body: { answers: [] } }), ranked);
  assert.deepEqual(ranked.data, { awardedXp: 10, totalXp: 10 });
});

test('method, body size, and usage limits reject before any provider request', async () => {
  const handler = createWebHandler({ ...dependencies(), limitUsage: async () => { throw new RequestError(429, 'Usage limit reached.'); } });
  for (const [overrides, status] of [[{ method: 'GET' }, 405], [{ rawBody: { length: 32001 } }, 413], [{}, 429]]) {
    const res = response();
    await handler(request(overrides), res);
    assert.equal(res.code, status);
  }
});

test('provider errors never leak credentials and mid-stream failures are explicit', async () => {
  const handler = createWebHandler({ ...dependencies(), openStream: async () => new Response('data: {"choices":[{"delta":{"content":"partial"}}]}\n\ndata: {"error":{"message":"SECRET"}}\n') });
  const res = response();
  await handler(request(), res);
  assert.ok(res.output.includes('"error"'));
  assert.ok(!res.output.includes('SECRET'));
  assert.ok(!res.output.includes('[DONE]'));
});
