import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore, createSyncController, defaultProgress, storageKey, LEGACY_STORAGE_KEY, normalizeProgress } from '../src/state/progress.js';

function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
}
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const cloud = (revision, overrides = {}) => ({ ...defaultProgress(), revision, ...overrides });

test('legacy progress remains guest-only across sign-in, sign-out and account switches', () => {
  const storage = memoryStorage();
  storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ xp: 500, bookmarkedWordIds: [4] }));
  assert.equal(createProgressStore(storage).getSnapshot().progress.xp, 500);
  const alice = createProgressStore(storage, 'alice');
  alice.update(p => ({ ...p, xp: 80 }));
  assert.equal(createProgressStore(storage, 'bob').getSnapshot().progress.xp, 0);
  assert.equal(createProgressStore(storage, 'alice').getSnapshot().progress.xp, 80);
  assert.equal(createProgressStore(storage).getSnapshot().progress.xp, 500);
});

test('slow restoration prevents an early save from overwriting cloud progress', async () => {
  const store = createProgressStore(memoryStorage(), 'alice');
  const read = deferred();
  let writes = 0;
  const controller = createSyncController(store, { read: () => read.promise, write: () => { writes++; } });
  const restoring = controller.restore();
  await controller.save();
  assert.equal(writes, 0);
  read.resolve(cloud(3, { xp: 250 }));
  await restoring;
  assert.equal(store.getSnapshot().progress.xp, 250);
  assert.equal(store.getSnapshot().status, 'ready');
});

test('failed restore never uploads defaults and retries retain local work as a conflict', async () => {
  const store = createProgressStore(memoryStorage(), 'alice');
  let fail = true, writes = 0;
  const controller = createSyncController(store, { read: async () => { if (fail) throw new Error('offline'); return cloud(2); }, write: async () => { writes++; } });
  await controller.restore();
  store.update(p => ({ ...p, xp: 50 }));
  await controller.save();
  assert.equal(writes, 0);
  assert.equal(store.getSnapshot().status, 'error');
  fail = false;
  await controller.restore();
  assert.equal(store.getSnapshot().status, 'conflict');
  assert.equal(store.getSnapshot().progress.xp, 50);
});

test('clean restore preserves spent coins, deleted bookmarks, reset maps and newer reviews exactly', () => {
  const storage = memoryStorage();
  const store = createProgressStore(storage, 'alice');
  store.restore(cloud(1, { coins: 100, bookmarkedWordIds: [1], wordProgress: { 1: { repetitionCount: 1 } } }));
  store.restore(cloud(2, { coins: 10, bookmarkedWordIds: [], wordProgress: { 1: { repetitionCount: 5 } }, lastActiveDate: 'Sat Oct 03 2026' }));
  const { progress } = store.getSnapshot();
  assert.equal(progress.coins, 10);
  assert.deepEqual(progress.bookmarkedWordIds, []);
  assert.equal(progress.wordProgress[1].repetitionCount, 5);
  store.restore(cloud(3));
  assert.deepEqual(store.getSnapshot().progress.wordProgress, {});
});

test('legacy cloud records conflict with unsynchronized edits instead of silently losing either', () => {
  const store = createProgressStore(memoryStorage(), 'alice');
  store.update(p => ({ ...p, xp: 10 }));
  store.restore({ xp: 500 });
  assert.equal(store.getSnapshot().status, 'conflict');
});

test('concurrent saves require an explicit choice and back up both versions', async () => {
  const storage = memoryStorage();
  const store = createProgressStore(storage, 'alice');
  let document = cloud(1, { xp: 100 });
  const controller = createSyncController(store, {
    read: async () => document,
    write: async (progress, revision) => revision === document.revision ? { revision: revision + 1 } : { conflict: true, data: document },
  });
  await controller.restore();
  store.update(p => ({ ...p, xp: 120 }));
  document = cloud(2, { xp: 180 });
  await controller.save();
  assert.equal(store.getSnapshot().status, 'conflict');
  store.resolveConflict('local');
  assert.equal(store.getSnapshot().baseRevision, 2);
  assert.equal(store.getSnapshot().progress.xp, 120);
  assert.equal(JSON.parse(storage.getItem(`${storageKey('alice')}:conflict-backup`)).cloud.xp, 180);
  await controller.save();
  assert.equal(store.getSnapshot().dirty, false);
  assert.equal(store.getSnapshot().baseRevision, 3);
});

test('cloud conflict choice preserves deletions instead of unioning arrays', () => {
  const store = createProgressStore(memoryStorage(), 'alice');
  store.update(p => ({ ...p, bookmarkedWordIds: [1] }));
  store.restore(cloud(2, { bookmarkedWordIds: [] }));
  store.resolveConflict('cloud');
  assert.deepEqual(store.getSnapshot().progress.bookmarkedWordIds, []);
  assert.equal(store.getSnapshot().dirty, false);
});

test('edits while a save is in flight are retained and saved against the acknowledged revision', async () => {
  const store = createProgressStore(memoryStorage(), 'alice');
  const write = deferred();
  const controller = createSyncController(store, { read: async () => cloud(1), write: () => write.promise });
  await controller.restore();
  store.update(p => ({ ...p, xp: 10 }));
  const saving = controller.save();
  store.update(p => ({ ...p, xp: 25 }));
  write.resolve({ revision: 2 });
  await saving;
  assert.equal(store.getSnapshot().progress.xp, 25);
  assert.equal(store.getSnapshot().dirty, true);
  assert.equal(store.getSnapshot().baseRevision, 2);
});

test('stopping a session ignores late cloud responses', async () => {
  const read = deferred();
  const store = createProgressStore(memoryStorage(), 'alice');
  const controller = createSyncController(store, { read: () => read.promise });
  const pending = controller.restore();
  controller.stop();
  read.resolve(cloud(4, { xp: 900 }));
  await pending;
  assert.equal(store.getSnapshot().progress.xp, 0);
});

test('storage failures are visible and corrupted shapes do not crash learning views', () => {
  const store = createProgressStore({ getItem() { throw new Error(); }, setItem() { throw new Error(); } }, 'alice');
  store.update({ xp: 10 });
  assert.ok(store.getSnapshot().storageError);
  const progress = normalizeProgress({ xp: -1, wordProgress: { 1: null }, bookmarkedWordIds: 'invalid', unlockedLevel: 500 });
  assert.equal(progress.xp, 0);
  assert.deepEqual(progress.wordProgress, {});
  assert.deepEqual(progress.bookmarkedWordIds, []);
  assert.equal(progress.unlockedLevel, 1);
});
