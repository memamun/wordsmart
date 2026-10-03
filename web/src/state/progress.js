export const LEGACY_STORAGE_KEY = 'wordsmart_gamestate_v2';
export const storageKey = (uid) => `wordsmart_progress_v3:${uid ? `user:${uid}` : 'guest'}`;

export function defaultProgress() {
  return {
    xp: 0, streak: 0, coins: 100, unlockedLevel: 1,
    bookmarkedWordIds: [], quizMasteredWordIds: [], lastActiveDate: null,
    levelAttempts: {}, unitAttempts: {}, achievements: [], wordProgress: {},
  };
}

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const integer = (value, fallback, max = Number.MAX_SAFE_INTEGER) =>
  Number.isSafeInteger(value) && value >= 0 && value <= max ? value : fallback;

export function normalizeProgress(value = {}) {
  const data = isRecord(value) ? value : {};
  const result = defaultProgress();
  for (const key of ['xp', 'streak', 'coins']) result[key] = integer(data[key], result[key]);
  result.unlockedLevel = Math.max(1, integer(data.unlockedLevel ?? data.level, 1, 8));
  for (const key of ['bookmarkedWordIds', 'quizMasteredWordIds']) {
    result[key] = Array.isArray(data[key])
      ? [...new Set(data[key].map(Number).filter(id => Number.isSafeInteger(id) && id > 0))] : [];
  }
  result.achievements = Array.isArray(data.achievements) ? data.achievements.filter(x => typeof x === 'string') : [];
  for (const key of ['wordProgress', 'levelAttempts', 'unitAttempts']) {
    result[key] = isRecord(data[key])
      ? Object.fromEntries(Object.entries(data[key]).filter(([, item]) => isRecord(item))) : {};
  }
  result.lastActiveDate = typeof data.lastActiveDate === 'string' && Number.isFinite(Date.parse(data.lastActiveDate))
    ? data.lastActiveDate : null;
  return result;
}

export function cloudRevision(data) {
  return integer(data?.revision, 0);
}

// Each account owns its own snapshot. Legacy data has no trustworthy owner and stays guest-only.
export function createProgressStore(storage, uid = null) {
  const key = storageKey(uid);
  let initial;
  let storageError = null;
  try {
    const saved = storage.getItem(key);
    initial = saved ? JSON.parse(saved) : null;
    if (!initial && !uid) {
      const legacy = storage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) initial = { progress: JSON.parse(legacy), dirty: true };
    }
  } catch {
    storageError = 'Progress could not be read from this browser.';
  }
  let snapshot = {
    progress: normalizeProgress(initial?.progress),
    baseRevision: cloudRevision({ revision: initial?.baseRevision }),
    dirty: initial?.dirty === true,
    generation: 0,
    status: uid ? 'restoring' : 'local',
    error: null, storageError, conflict: null,
  };
  const listeners = new Set();
  function publish(patch, persist = false) {
    snapshot = { ...snapshot, ...patch };
    if (persist) {
      try {
        storage.setItem(key, JSON.stringify({
          progress: snapshot.progress, baseRevision: snapshot.baseRevision, dirty: snapshot.dirty,
        }));
        snapshot = { ...snapshot, storageError: null };
      } catch {
        snapshot = { ...snapshot, storageError: 'Progress could not be saved in this browser. Keep this tab open and free some storage.' };
      }
    }
    listeners.forEach(listener => listener());
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    update(updater) {
      const next = typeof updater === 'function' ? updater(snapshot.progress) : updater;
      if (next === snapshot.progress) return;
      publish({ progress: normalizeProgress(next), dirty: true, generation: snapshot.generation + 1 }, true);
    },
    setStatus(status, error = null) { publish({ status, error }); },
    restore(remote) {
      const revision = cloudRevision(remote);
      if (snapshot.dirty && (snapshot.baseRevision !== revision || (remote && revision === 0))) {
        publish({ status: 'conflict', conflict: remote, error: null });
      } else if (snapshot.dirty) {
        publish({ status: 'ready', error: null });
      } else {
        publish({ progress: normalizeProgress(remote), baseRevision: revision, status: 'ready', error: null }, true);
      }
    },
    conflict(remote) { publish({ status: 'conflict', conflict: remote, error: null }); },
    resolveConflict(choice) {
      if (snapshot.status !== 'conflict') return;
      const remote = snapshot.conflict;
      // Keep a recovery copy before either explicit choice replaces a snapshot.
      try {
        storage.setItem(`${key}:conflict-backup`, JSON.stringify({ local: snapshot.progress, cloud: remote }));
      } catch {
        publish({ storageError: 'Could not back up conflicting progress. Free browser storage before choosing a version.' });
        return;
      }
      publish({
        progress: choice === 'cloud' ? normalizeProgress(remote) : snapshot.progress,
        baseRevision: cloudRevision(remote), dirty: choice !== 'cloud',
        generation: snapshot.generation + 1, status: 'ready', conflict: null, error: null,
      }, true);
    },
    acknowledge(sent, revision) {
      publish({ baseRevision: revision, dirty: snapshot.generation !== sent.generation, status: 'ready', error: null }, true);
    },
  };
}

// Serialized writes plus compare-and-set prevent slow restores and stale devices from overwriting data.
export function createSyncController(store, remote) {
  let stopped = false;
  let busy = false;
  let restored = false;
  return {
    stop() { stopped = true; },
    async restore() {
      if (busy || stopped) return;
      busy = true;
      store.setStatus('restoring');
      try {
        const data = await remote.read();
        if (!stopped) { store.restore(data); restored = true; }
      } catch {
        if (!stopped) store.setStatus('error', 'Cloud progress could not be loaded. Your changes stay on this device until you retry.');
      } finally { busy = false; }
    },
    async save() {
      const sent = store.getSnapshot();
      if (stopped || busy || !restored || sent.status !== 'ready' || !sent.dirty) return;
      busy = true;
      store.setStatus('saving');
      try {
        const result = await remote.write(sent.progress, sent.baseRevision);
        if (!stopped) {
          if (result.conflict) store.conflict(result.data);
          else store.acknowledge(sent, result.revision);
        }
      } catch {
        if (!stopped) store.setStatus('error', 'Cloud save failed. Your progress remains on this device. Retry when connected.');
      } finally { busy = false; }
    },
  };
}
