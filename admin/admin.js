// ============================================================
//  WordSmart Admin Panel — admin.js
//  Firebase Web SDK v10 (modular CDN), no bundler
//  Uses local proxy server (port 3001) for full user management
//  Start proxy: python3 admin/proxy.py
// ============================================================

import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
import { getFirestore, collection, getDocs, doc, setDoc, query, orderBy, limit }
  from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

// ── Config ───────────────────────────────────────────────────
const PROJECT_ID = 'wordsmart-vocab-76';
const ADMIN_UIDS = new Set(['mQkm2B0UawN77DvOzFR8E1bQhOy2']);

const firebaseConfig = {
  apiKey:            'AIzaSyAxiaWl1ZadMdUlU4ifudIObmVfY44tn3o',
  authDomain:        'wordsmart-vocab-76.firebaseapp.com',
  projectId:         PROJECT_ID,
  storageBucket:     'wordsmart-vocab-76.firebasestorage.app',
  messagingSenderId: '33237847985',
  appId:             '1:33237847985:web:f522f3da79121d5bbf3790',
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── State ────────────────────────────────────────────────────
let allUsers      = [];
let filteredUsers = [];
let selectedUser  = null;
let currentView   = 'dashboard';

// ── DOM helpers ──────────────────────────────────────────────
const $       = (id) => document.getElementById(id);
const el      = (tag, cls, html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
const fmt     = (n) => Number(n || 0).toLocaleString();
const relDate = (strOrMs) => {
  if (!strOrMs) return '—';
  const d = typeof strOrMs === 'number' ? new Date(strOrMs) : new Date(strOrMs);
  if (isNaN(d.getTime())) return '—';
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7)   return `${diff}d ago`;
  return d.toLocaleDateString();
};
const isRecent7 = (strOrMs) => {
  if (!strOrMs) return false;
  const d = typeof strOrMs === 'number' ? new Date(strOrMs) : new Date(strOrMs);
  return !isNaN(d.getTime()) && (Date.now() - d.getTime()) < 7 * 86400000;
};

// ── Toast ────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, duration = 3500) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), duration);
}

// ── Photo Modal (Lightbox) ───────────────────────────────────
function getHighResPhoto(url) {
  if (!url) return '';
  if (url.includes('googleusercontent.com')) {
    return url.replace(/=s\d+(-c)?/g, '=s400-c');
  }
  return url;
}

function openPhotoModal(photoUrl, name = 'User Photo', email = '') {
  const modal    = $('photo-modal');
  const img      = $('photo-modal-img');
  const fallback = $('photo-modal-fallback');

  $('photo-modal-name').textContent  = name || 'WordSmart Learner';
  $('photo-modal-email').textContent = email || '';

  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || '👤';

  // If no photo URL is available, immediately show initials fallback
  if (!photoUrl) {
    img.classList.add('hidden');
    img.src = '';
    if (fallback) {
      fallback.textContent = initials;
      fallback.classList.remove('hidden');
    }
    modal.classList.remove('hidden');
    return;
  }

  // Hide initials and prepare image
  if (fallback) fallback.classList.add('hidden');
  img.removeAttribute('alt');
  img.classList.remove('hidden');
  img.style.opacity = '0';

  const proxyUrl = `${PROXY}/api/avatar?url=${encodeURIComponent(photoUrl)}`;
  const directUrl = getHighResPhoto(photoUrl);

  let triedDirect = false;

  img.onload = () => {
    img.style.opacity = '1';
    img.classList.remove('hidden');
    if (fallback) fallback.classList.add('hidden');
  };

  img.onerror = () => {
    if (!triedDirect) {
      triedDirect = true;
      // Fallback: try direct Google high-res URL
      img.src = directUrl;
    } else {
      // Both failed: show initials avatar
      img.classList.add('hidden');
      if (fallback) {
        fallback.textContent = initials;
        fallback.classList.remove('hidden');
      }
    }
  };

  // Primary: Load through proxy (bypasses Google's 429 referer block, provides crisp 400x400 image)
  img.src = proxyUrl;
  modal.classList.remove('hidden');
}

function closePhotoModal() {
  $('photo-modal')?.classList.add('hidden');
}

$('photo-modal-close')?.addEventListener('click', closePhotoModal);
$('photo-modal-overlay')?.addEventListener('click', closePhotoModal);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePhotoModal();
});

// ── Auth ─────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    $('login-screen').classList.add('hidden');
    $('app').classList.remove('hidden');
    $('admin-name').textContent  = user.displayName || user.email;
    $('admin-email').textContent = user.email;
    $('admin-avatar').src        = user.photoURL || '';
    if (!ADMIN_UIDS.has(user.uid)) {
      showToast('⛔ Your account is not authorized as admin.', 8000);
      return;
    }
    loadAllData();
  } else {
    $('login-screen').classList.remove('hidden');
    $('app').classList.add('hidden');
  }
});
$('google-login-btn').addEventListener('click', () =>
  signInWithPopup(auth, new GoogleAuthProvider()).catch(e => showToast('Login failed: ' + e.message))
);
$('logout-btn').addEventListener('click', () => signOut(auth));

// ── Navigation ───────────────────────────────────────────────
const TITLES = { dashboard: 'Dashboard', users: 'Users', leaderboard: 'Leaderboard', 'xp-tools': 'XP Tools' };
document.querySelectorAll('.nav-item, .btn-link[data-view]').forEach(btn => {
  btn.addEventListener('click', () => { if (btn.dataset.view) switchView(btn.dataset.view); });
});
function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = $(`view-${view}`);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
  $('page-title').textContent = TITLES[view] || view;
  if (view === 'users')       renderUsersTable();
  if (view === 'leaderboard') loadLeaderboard();
  if (view === 'xp-tools')    renderXpEconomy();
}
$('refresh-btn').addEventListener('click', loadAllData);

// ── Proxy helpers ─────────────────────────────────────────────
const PROXY = 'http://localhost:3001';
let proxyAvailable = null;

async function checkProxy() {
  if (proxyAvailable !== null) return proxyAvailable;
  try {
    const r = await fetch(`${PROXY}/api/health`, { signal: AbortSignal.timeout(2000) });
    proxyAvailable = r.ok;
  } catch { proxyAvailable = false; }
  return proxyAvailable;
}

async function proxyGet(path) {
  const r = await fetch(`${PROXY}${path}`);
  if (!r.ok) throw new Error(`Proxy ${r.status}: ${await r.text()}`);
  return r.json();
}

async function proxyPost(path, body) {
  const r = await fetch(`${PROXY}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Proxy ${r.status}: ${await r.text()}`);
  return r.json();
}

// ── Load All Data ─────────────────────────────────────────────
async function loadAllData() {
  ['stat-users-val','stat-xp-val','stat-level-val','stat-active-val','stat-coins-val','stat-mastered-val']
    .forEach(id => $(id).textContent = '…');

  const hasProxy = await checkProxy();
  let proxyResult = null;

  if (hasProxy) {
    showToast('🔄 Loading users…');
    try {
      proxyResult = await proxyGet('/api/users');
    } catch (e) {
      console.warn('Proxy fetch failed:', e.message);
      proxyAvailable = false;
    }
  }

  if (proxyResult && proxyResult.users && proxyResult.users.length > 0) {
    allUsers = proxyResult.users;
    showToast(`✅ Loaded ${allUsers.length} users`);
  } else {
    // Fallback: direct Firestore query
    const firestoreMap = new Map();
    try {
      const snap = await getDocs(collection(db, 'users'));
      snap.docs.forEach(d => firestoreMap.set(d.id, d.data()));
    } catch (e) {
      console.warn('Firestore users fetch failed:', e.message);
    }

    allUsers = [...firestoreMap.entries()].map(([uid, fs]) => ({
      uid,
      email: fs.email || '—',
      displayName: fs.displayName || 'WordSmart Learner',
      photoURL: fs.photoURL || '',
      createdAt: null,
      lastSignIn: null,
      disabled: false,
      provider: 'unknown',
      emailVerified: false,
      xp: Number(fs.xp ?? 0),
      coins: Number(fs.coins ?? 0),
      level: Number(fs.level ?? 1),
      streak: Number(fs.streak ?? 0),
      longestStreak: Number(fs.longestStreak ?? 0),
      mastered: Array.isArray(fs.quizMasteredWordIds) ? fs.quizMasteredWordIds.length : (Number(fs.masteredWordsCount) || 0),
      lastActive: fs.lastQuizDate || fs.updatedAt || null,
      achievements: [],
      raw: { firestore: fs },
    }));

    showToast(`✅ Loaded ${allUsers.length} users`);
  }

  // Sort by XP descending by default
  allUsers.sort((a, b) => b.xp - a.xp);
  filteredUsers = [...allUsers];
  $('users-count-badge').textContent = allUsers.length;
  $('user-count-label').textContent  = `${allUsers.length} users`;

  renderDashboard();
  if (currentView === 'users')       applyFilters();
  if (currentView === 'leaderboard') loadLeaderboard();
  if (currentView === 'xp-tools')    renderXpEconomy();
}

// ── Dashboard ─────────────────────────────────────────────────
function renderDashboard() {
  const totalXp     = allUsers.reduce((s, u) => s + u.xp, 0);
  const totalCoins  = allUsers.reduce((s, u) => s + u.coins, 0);
  const totalMaster = allUsers.reduce((s, u) => s + u.mastered, 0);
  const avgLevel    = allUsers.length
    ? (allUsers.reduce((s, u) => s + u.level, 0) / allUsers.length).toFixed(1) : '—';
  const activeToday = allUsers.filter(u => isRecent7(u.lastSignIn) || isRecent7(u.lastActive)).length;

  $('stat-users-val').textContent    = fmt(allUsers.length);
  $('stat-xp-val').textContent       = fmt(totalXp);
  $('stat-level-val').textContent    = avgLevel;
  $('stat-active-val').textContent   = activeToday;
  $('stat-coins-val').textContent    = fmt(totalCoins);
  $('stat-mastered-val').textContent = fmt(totalMaster);

  // Top 8 by XP
  const top   = [...allUsers].sort((a,b) => b.xp - a.xp).slice(0, 8);
  const maxXp = top[0]?.xp || 1;
  const list  = $('top-users-list');
  list.innerHTML = '';
  if (!top.length) {
    list.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-muted)">No users yet</div>';
    return;
  }
  top.forEach((u, i) => {
    const rankClass = ['rank-1','rank-2','rank-3'][i] || 'rank-n';
    const row = el('div', 'top-user-row');
    row.innerHTML = `
      <div class="rank-badge ${rankClass}">${i + 1}</div>
      <img class="top-user-avatar" src="${u.photoURL}" onerror="this.style.display='none'" alt="" title="Click to view photo" />
      <div style="flex:1;min-width:0">
        <div class="top-user-name">${esc(u.displayName)}</div>
        <div class="xp-bar-outer"><div class="xp-bar-inner" style="width:${Math.round((u.xp/maxXp)*100)}%"></div></div>
      </div>
      <div class="top-user-xp">${fmt(u.xp)} XP</div>`;

    const avatar = row.querySelector('.top-user-avatar');
    if (avatar) {
      avatar.addEventListener('click', (e) => {
        e.stopPropagation();
        openPhotoModal(u.photoURL, u.displayName, u.email);
      });
    }

    row.addEventListener('click', () => openDrawer(u));
    list.appendChild(row);
  });

  // XP Distribution
  const buckets = [
    {label:'0 XP',min:0,max:1},{label:'1–500',min:1,max:500},
    {label:'500–2k',min:500,max:2000},{label:'2k–5k',min:2000,max:5000},
    {label:'5k–10k',min:5000,max:10000},{label:'10k+',min:10000,max:Infinity},
  ];
  const counts   = buckets.map(b => allUsers.filter(u => u.xp >= b.min && u.xp < b.max).length);
  const maxCount = Math.max(1, ...counts);
  const dist     = $('xp-distribution');
  dist.innerHTML = '';
  buckets.forEach((b, i) => {
    const row = el('div', 'dist-row');
    row.innerHTML = `
      <div class="dist-label">${b.label}</div>
      <div class="dist-bar-outer"><div class="dist-bar-inner" style="width:${Math.round((counts[i]/maxCount)*100)}%"></div></div>
      <div class="dist-count">${counts[i]}</div>`;
    dist.appendChild(row);
  });
}

// ── Users Table ───────────────────────────────────────────────
$('user-search').addEventListener('input', applyFilters);
$('sort-select').addEventListener('change', applyFilters);

function applyFilters() {
  const q    = $('user-search').value.toLowerCase().trim();
  const sort = $('sort-select').value;

  filteredUsers = allUsers.filter(u => {
    return !q || (
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.uid || '').toLowerCase().includes(q)
    );
  });

  const [field, dir] = sort.split('-');
  filteredUsers.sort((a, b) => {
    if (field === 'name') {
      const na = a.displayName || '';
      const nb = b.displayName || '';
      return dir === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
    }
    return dir === 'desc' ? (b[field] || 0) - (a[field] || 0) : (a[field] || 0) - (b[field] || 0);
  });

  $('user-count-label').textContent = `${filteredUsers.length} of ${allUsers.length} users`;
  renderUsersTable();
}

function renderUsersTable() {
  const tbody = $('users-tbody');
  tbody.innerHTML = '';
  if (!filteredUsers.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2.5rem;color:var(--text-muted)">No users found</td></tr>';
    return;
  }
  filteredUsers.forEach((u, i) => {
    const providerIcon  = u.provider === 'google.com' ? '🔵' : u.provider === 'password' ? '📧' : '❓';
    const disabledBadge = u.disabled ? ' <span style="color:var(--danger);font-size:0.68rem;background:var(--danger-dim);padding:1px 5px;border-radius:3px">DISABLED</span>' : '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--text-muted);font-size:0.8rem">${i + 1}</td>
      <td>
        <div class="user-cell">
          <img class="user-avatar-sm" src="${u.photoURL}" onerror="this.style.display='none'" alt="" title="Click to view photo" />
          <div>
            <div class="user-name-sm">${esc(u.displayName)}${disabledBadge}</div>
            <div class="user-email-sm">${providerIcon} ${esc(u.email || 'No email')}</div>
          </div>
        </div>
      </td>
      <td><span class="xp-val">${fmt(u.xp)}</span></td>
      <td><span class="level-badge">${u.level}</span></td>
      <td><span class="coins-val">${fmt(u.coins)}</span></td>
      <td><span class="streak-val">${u.streak}🔥</span></td>
      <td>${u.mastered}</td>
      <td><span class="date-val">${relDate(u.lastSignIn || u.lastActive)}</span></td>
      <td><button class="btn-detail">View</button></td>`;

    const avatar = tr.querySelector('.user-avatar-sm');
    if (avatar) {
      avatar.addEventListener('click', (e) => {
        e.stopPropagation();
        openPhotoModal(u.photoURL, u.displayName, u.email);
      });
    }

    tr.querySelector('.btn-detail').addEventListener('click', () => openDrawer(u));
    tr.addEventListener('dblclick', () => openDrawer(u));
    tbody.appendChild(tr);
  });
}

// ── Leaderboard ────────────────────────────────────────────────
async function loadLeaderboard() {
  const listEl = $('leaderboard-list');
  listEl.innerHTML = '<div class="loading-row"><div class="spinner"></div></div>';
  try {
    let sorted = [...allUsers].sort((a, b) => b.xp - a.xp);
    if (!sorted.length) {
      const q  = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(100));
      const sn = await getDocs(q);
      sorted   = sn.docs.map(d => ({ ...d.data(), uid: d.id }));
    }
    $('lb-count').textContent = `${sorted.length} players`;
    listEl.innerHTML = '';
    sorted.forEach((u, i) => {
      const rankClass = ['rank-1','rank-2','rank-3'][i] || 'rank-n';
      const row = el('div', 'lb-row');
      row.innerHTML = `
        <div class="rank-badge ${rankClass}">${i + 1}</div>
        <img class="lb-avatar" src="${u.photoURL||''}" onerror="this.style.display='none'" alt="" title="Click to view photo" />
        <div><div class="lb-name">${esc(u.displayName||u.name||'WordSmart Learner')}</div><div class="lb-uid">${(u.uid||'').slice(0,22)}…</div></div>
        <span class="lb-xp">${fmt(u.xp)} XP</span>
        <span class="level-badge">${u.level||1}</span>
        <span class="lb-streak">${u.streak||0}🔥</span>`;

      const avatar = row.querySelector('.lb-avatar');
      if (avatar) {
        avatar.addEventListener('click', (e) => {
          e.stopPropagation();
          openPhotoModal(u.photoURL, u.displayName || u.name, u.email);
        });
      }

      const found = allUsers.find(x => x.uid === u.uid);
      if (found) row.addEventListener('click', () => openDrawer(found));
      listEl.appendChild(row);
    });
  } catch (e) {
    listEl.innerHTML = `<div style="padding:2rem;color:var(--danger)">Error: ${e.message}</div>`;
  }
}

// ── XP Economy ────────────────────────────────────────────────
function renderXpEconomy() {
  const total    = allUsers.length || 1;
  const totalXp  = allUsers.reduce((s, u) => s + u.xp, 0);
  const avgXp    = Math.round(totalXp / total);
  const maxXp    = [...allUsers].sort((a,b)=>b.xp-a.xp)[0]?.xp || 0;
  const zeroXp   = allUsers.filter(u => u.xp === 0).length;
  const active7d = allUsers.filter(u => isRecent7(u.lastSignIn) || isRecent7(u.lastActive)).length;

  const container = $('xp-economy-stats');
  const stats = [
    ['Total Registered Users', allUsers.length,                                    '👥'],
    ['Active Last 7 Days',      `${active7d} (${Math.round(active7d/total*100)}%)`, '🔥'],
    ['Total XP in System',      fmt(totalXp),                                       '⚡'],
    ['Average XP per User',     fmt(avgXp),                                         '⚡'],
    ['Top Learner XP',          fmt(maxXp),                                         '🏆'],
    ['Users with 0 XP',         `${zeroXp} (${Math.round(zeroXp/total*100)}%)`,    '🌱'],
  ];
  container.innerHTML = stats.map(([label, val, icon]) => `
    <div class="eco-row">
      <span class="eco-label">${label}</span>
      <span class="eco-val">${icon} ${val}</span>
    </div>`).join('');
}

// ── Bulk Reset ────────────────────────────────────────────────
$('reset-confirm-input').addEventListener('input', (e) => {
  const btn = $('bulk-reset-btn');
  const ok  = e.target.value.trim() === 'RESET ALL';
  btn.classList.toggle('enabled', ok);
  btn.disabled = !ok;
});

$('bulk-reset-btn').addEventListener('click', async () => {
  if (!confirm('⚠️ Reset XP, coins, level, streak, and quiz history for ALL users? This action is irreversible.')) return;
  const progress = $('reset-progress');
  progress.classList.remove('hidden');
  $('bulk-reset-btn').disabled = true;
  $('bulk-reset-btn').classList.remove('enabled');

  let done = 0;
  const hasProxy = await checkProxy();

  for (const u of allUsers) {
    progress.textContent = `🔄 Resetting… ${done}/${allUsers.length}`;
    try {
      if (hasProxy) {
        await proxyPost('/api/reset', { uid: u.uid });
      } else {
        await setDoc(doc(db,'users',u.uid), {xp:0,coins:0,level:1,streak:0}, {merge:true});
      }
    } catch (_) {}
    done++;
  }
  progress.textContent = `✅ Done! Reset ${done} users.`;
  $('reset-confirm-input').value = '';
  showToast(`✅ Reset complete — ${done} users cleared`);
  setTimeout(loadAllData, 1000);
});

// ── User Drawer ───────────────────────────────────────────────
async function openDrawer(u) {
  selectedUser = u;
  $('drawer-name').textContent  = u.displayName || 'WordSmart Learner';
  $('drawer-email').textContent = u.email || 'No email';
  $('drawer-uid').textContent   = u.uid;
  $('drawer-avatar').src        = u.photoURL || '';
  $('drawer-avatar').title      = 'Click to view photo';
  $('d-xp').textContent         = fmt(u.xp);
  $('d-level').textContent      = u.level;
  $('d-coins').textContent      = fmt(u.coins);
  $('d-streak').textContent     = u.streak;
  $('edit-xp').value            = u.xp;
  $('edit-coins').value         = u.coins;
  $('edit-level').value         = u.level;
  $('edit-streak').value        = u.streak;
  $('save-feedback').classList.add('hidden');
  $('user-drawer').classList.remove('hidden');

  // Fetch progress subcollection if not already loaded
  if (!u.progressLoaded) {
    try {
      const snap = await getDocs(collection(db, 'users', u.uid, 'data'));
      snap.docs.forEach(d => {
        if (d.id === 'progress') {
          const p = d.data();
          u.mastered             = Array.isArray(p.quizMasteredWordIds) ? p.quizMasteredWordIds.length : 0;
          u.achievements         = Array.isArray(p.achievements) ? p.achievements : [];
          u.longestStreak        = Number(p.longestStreak ?? 0);
          u.totalQuizAnswers     = Number(p.totalQuizAnswers ?? 0);
          u.totalCorrectAnswers  = Number(p.totalCorrectAnswers ?? 0);
          u.progressLoaded       = true;
          $('d-xp').textContent    = fmt(Math.max(u.xp, Number(p.xp??0)));
          $('d-streak').textContent = Math.max(u.streak, Number(p.streak??0));
        }
      });
    } catch (_) {}
  }

  renderDrawerBody(u);
}

function renderDrawerBody(u) {
  const grid = $('drawer-progress-grid');
  grid.innerHTML = '';
  const accuracy = u.totalQuizAnswers
    ? Math.round((u.totalCorrectAnswers / u.totalQuizAnswers) * 100) + '%' : '—';
  const fields = [
    ['Words Mastered',     u.mastered],
    ['Longest Streak',     u.longestStreak ?? '—'],
    ['Last Active',        relDate(u.lastActive)],
    ['Last Sign-In',       relDate(u.lastSignIn)],
    ['Account Created',    relDate(u.createdAt)],
    ['Auth Provider',      u.provider || '—'],
    ['Email Verified',     u.emailVerified ? '✅ Yes' : '❌ No'],
    ['Quiz Accuracy',      accuracy],
    ['Total Quiz Answers', fmt(u.totalQuizAnswers ?? 0)],
    ['Account Status',     u.disabled ? '🔴 Disabled' : '🟢 Active'],
  ];
  fields.forEach(([label, val]) => {
    const d = el('div', 'detail-item');
    d.innerHTML = `<div class="detail-item-label">${label}</div><div class="detail-item-val">${val}</div>`;
    grid.appendChild(d);
  });

  const achEl = $('drawer-achievements');
  achEl.innerHTML = '';
  (u.achievements?.length ? u.achievements : []).forEach(a => achEl.appendChild(el('span','achievement-pill',a)));
  if (!u.achievements?.length) achEl.appendChild(el('span','no-achievements','No achievements yet'));

  $('drawer-raw-json').textContent = JSON.stringify({
    uid: u.uid, email: u.email, displayName: u.displayName,
    createdAt: u.createdAt, lastSignIn: u.lastSignIn,
    provider: u.provider, disabled: u.disabled, emailVerified: u.emailVerified,
    xp: u.xp, coins: u.coins, level: u.level, streak: u.streak,
    mastered: u.mastered,
  }, null, 2);
}

function closeDrawer() { $('user-drawer').classList.add('hidden'); selectedUser = null; }
$('drawer-close').addEventListener('click', closeDrawer);
$('drawer-overlay').addEventListener('click', closeDrawer);
$('drawer-avatar')?.addEventListener('click', () => {
  if (selectedUser) {
    openPhotoModal(selectedUser.photoURL, selectedUser.displayName, selectedUser.email);
  }
});
$('admin-avatar')?.addEventListener('click', () => {
  const src = $('admin-avatar').src;
  const name = $('admin-name').textContent;
  const email = $('admin-email').textContent;
  if (src) openPhotoModal(src, name, email);
});
$('copy-json-btn').addEventListener('click', () => {
  navigator.clipboard.writeText($('drawer-raw-json').textContent);
  showToast('📋 JSON copied!');
});

$('save-user-btn').addEventListener('click', async () => {
  if (!selectedUser) return;
  const xp     = parseInt($('edit-xp').value)    || 0;
  const coins  = parseInt($('edit-coins').value)  || 0;
  const level  = parseInt($('edit-level').value)  || 1;
  const streak = parseInt($('edit-streak').value) || 0;
  const fb     = $('save-feedback');
  try {
    if (await checkProxy()) {
      await proxyPost('/api/save-user', { uid: selectedUser.uid, xp, coins, level, streak });
    } else {
      await setDoc(doc(db,'users',selectedUser.uid), {xp,coins,level,streak}, {merge:true});
      await setDoc(doc(db,'users',selectedUser.uid,'data','progress'), {xp,coins,streak,unlockedLevel:level}, {merge:true});
    }
    fb.textContent = '✅ Saved!'; fb.className = 'feedback success'; fb.classList.remove('hidden');
    showToast('✅ User updated');
    const u = allUsers.find(x => x.uid === selectedUser.uid);
    if (u) {
      Object.assign(u, {xp,coins,level,streak});
      $('d-xp').textContent = fmt(xp);
      $('d-coins').textContent = fmt(coins);
      $('d-level').textContent = level;
      $('d-streak').textContent = streak;
      renderDrawerBody(u);
      applyFilters();
    }
    setTimeout(() => fb.classList.add('hidden'), 3000);
  } catch (e) {
    fb.textContent = '❌ Error: ' + e.message; fb.className = 'feedback error'; fb.classList.remove('hidden');
  }
});

$('reset-user-btn').addEventListener('click', async () => {
  if (!selectedUser || !confirm(`Reset ${selectedUser.displayName}?`)) return;
  try {
    if (await checkProxy()) {
      await proxyPost('/api/reset', { uid: selectedUser.uid });
    } else {
      const reset = { xp:0, coins:0, level:1, streak:0, longestStreak:0, quizMasteredWordIds:[], totalQuizAnswers:0, totalCorrectAnswers:0 };
      await setDoc(doc(db,'users',selectedUser.uid), {xp:0,coins:0,level:1,streak:0}, {merge:true});
      await setDoc(doc(db,'users',selectedUser.uid,'data','progress'), reset, {merge:true});
    }
    showToast(`✅ Reset ${selectedUser.displayName}`);
    closeDrawer();
    loadAllData();
  } catch (e) { showToast('❌ Reset failed: ' + e.message); }
});

// ── Escape helper ─────────────────────────────────────────────
function esc(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
