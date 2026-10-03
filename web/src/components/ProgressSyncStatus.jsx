import React from 'react';

export default function ProgressSyncStatus({ state, user }) {
  const status = state.syncStatus;
  if (!user && !state.storageError) return null;
  if (!state.storageError && !state.syncError && status !== 'conflict') return null;
  return (
    <aside aria-label="Progress synchronization" style={{ padding: '0.6rem 1rem', background: 'var(--bg-surface)', borderBottom: 'var(--border-thin)', fontSize: '0.85rem' }}>
      <div role="status" aria-live="polite">
        {state.storageError || state.syncError || 'Progress changed on another device. Choose which version to keep; a backup of both will be saved in this browser.'}
      </div>
      {status === 'error' && <button className="btn btn-secondary" onClick={state.retrySync}>Retry sync</button>}
      {status === 'conflict' && <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        <button className="btn btn-primary" onClick={() => state.resolveSyncConflict('cloud')}>Use cloud progress</button>
        <button className="btn btn-secondary" onClick={() => state.resolveSyncConflict('local')}>Use this device’s progress</button>
      </div>}

    </aside>
  );
}
