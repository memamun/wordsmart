import React, { useState } from 'react';

export default function ProgressSyncStatus({ state, user }) {
  const [importOpen, setImportOpen] = useState(false);
  const [importError, setImportError] = useState(null);
  const status = state.syncStatus;
  if (!user && !state.storageError) return null;
  const canImport = status === 'ready';
  return (
    <aside aria-label="Progress synchronization" style={{ padding: '0.6rem 1rem', background: 'var(--bg-surface)', borderBottom: 'var(--border-thin)', fontSize: '0.85rem' }}>
      <div role="status" aria-live="polite">
        {state.storageError || state.syncError || ({
          restoring: 'Restoring your cloud progress…', saving: 'Saving progress…',
          ready: 'Cloud progress connected.', conflict: 'Progress changed on another device. Choose which version to keep; a backup of both will be saved in this browser.',
        }[status])}
      </div>
      {status === 'error' && <button className="btn btn-secondary" onClick={state.retrySync}>Retry sync</button>}
      {status === 'conflict' && <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        <button className="btn btn-primary" onClick={() => state.resolveSyncConflict('cloud')}>Use cloud progress</button>
        <button className="btn btn-secondary" onClick={() => state.resolveSyncConflict('local')}>Use this device’s progress</button>
      </div>}
      {canImport && !importOpen && <button className="btn btn-secondary" onClick={() => setImportOpen(true)}>Import guest progress</button>}
      {importOpen && <div>
        <p>Replace this account’s progress with this browser’s guest progress? Your current account progress will be backed up locally.</p>
        {importError && <p role="alert">{importError}</p>}
        <button className="btn btn-primary" disabled={!canImport} onClick={() => {
          try { state.importGuestProgress(); setImportOpen(false); setImportError(null); }
          catch { setImportError('Could not back up your progress. Free browser storage and try again.'); }
        }}>Replace with guest progress</button>
        <button className="btn btn-secondary" onClick={() => setImportOpen(false)}>Cancel</button>
      </div>}
    </aside>
  );
}
