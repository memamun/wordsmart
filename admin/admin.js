// ============================================================
//  WordSmart Admin Panel — admin.js
//  Firebase Web SDK v10 (modular), vanilla JS, no bundler
// ============================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js';
import {
  getFirestore, collection, getDocs, doc, getDoc,
  setDoc, updateDoc, onSnapshot, query, orderBy, limit,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';

// ── Config ───────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            'AIzaSyAxiaWl1ZadMdUlU4ifudIObmVfY44tn3o',
  authDomain:        'wordsmart-vocab-76.firebaseapp.com',
  projectId:         'wordsmart-vocab-76',
  storageBucket:     'wordsmart-vocab-76.firebasestorage.app',
  messagingSenderId: '33237847985',
  appId:             '1:33237847985:web:f522f3da79121d5bbf3790',
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── State ────────────────────────────────────────────────────
let allUsers        = [];
let filteredUsers   = [];
let selectedUser    = null;
let currentView     = 'dashboard';

// ── DOM helpers ──────────────────────────────────────────────
const $  = (id) => document.getElementById(id);
const el = (tag, cls, html = '') => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
};
const fmt = (n) => Number(n || 0).toLocaleString();
const relDate = (str) => {
  if (!str) return '—';
  const d = new Date(str);
  const diff = Math.floor((Date.now() - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString();
};
const isToday = (str) => {
  if (!str) return false;
  return new Date(str).toDateString() === new Date().toDateString();
};

// ── Toast ────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, duration = 3000) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), duration);
}

// ── Auth ─────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    $('login-screen').classList.add('hidden');
    $('app').classList.remove('hidden');
    $('admin-name').textContent  = user.displayName || user.email;
    $('admin-email').textContent = user.email;
    $('admin-avatar').src        = user.photoURL || '';
    loadAllData();
  } else {
    $('login-screen').classList.remove('hidden');
    $('app').classList.add('hidden');
  }
});

$('google-login-btn').addEventListener('click', () => {
  signInWithPopup(auth, new GoogleAuthProvider()).catch(e => showToast('Login failed: ' + e.message));
});
$('logout-btn').addEventListener('click', () => signOut(auth));

// ── Navigation ───────────────────────────────────────────────
const TITLES = { dashboard: 'Dashboard', users: 'Users', leaderboard: 'Leaderboard', 'xp-tools': 'XP Tools' };
document.querySelectorAll('.nav-item, .btn-link[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    if (!view) return;
    switchView(view);
  });
});
function switchView(view) {
  currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = $(`view-${view}`);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
  $('page-title').textContent = TITLES[view] || view;
  if (view === 'users') renderUsersTable();
  if (view === 'leaderboard') loadLeaderboard();
  if (view === 'xp-tools') renderXpEconomy();
}

$('refresh-btn').addEventListener('click', loadAllData);

// ── Load All Data ─────────────────────────────────────────────
async function loadAllData() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    allUsers = [];
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      // Try to fetch progress sub-doc
      let progress = {};
      try {
        const progSnap = await getDoc(doc(db, 'users', docSnap.id, 'data', 'progress'));
        if (progSnap.exists()) progress = progSnap.data();
      } catch (_) {}
      allUsers.push({
        uid:          docSnap.id,
        displayName:  data.displayName || progress.displayName || 'Unknown',
        email:        data.email || '—',
        photoURL:     data.photoURL || progress.photoURL || '',
        xp:           Number(data.xp ?? progress.xp ?? 0),
        coins:        Number(data.coins ?? progress.coins ?? 0),
        level:        Number(data.level ?? progress.level ?? progress.unlockedLevel ?? 1),
        streak:       Number(data.streak ?? progress.streak ?? 0),
        mastered:     Array.isArray(progress.quizMasteredWordIds) ? progress.quizMasteredWordIds.length : 0,
        lastActive:   data.lastActiveDate || progress.lastActiveDate || null,
        achievements: Array.isArray(progress.achievements) ? progress.achievements : [],
        raw:          { ...data, progress },
        progress,
      });
    }
    allUsers.sort((a, b) => b.xp - a.xp);
    filteredUsers = [...allUsers];

    // Update badge
    $('users-count-badge').textContent = allUsers.length;
    $('user-count-label').textContent  = `${allUsers.length} users`;

    renderDashboard();
    if (currentView === 'users') renderUsersTable();
    if (currentView === 'leaderboard') loadLeaderboard();
    if (currentView === 'xp-tools') renderXpEconomy();

    showToast(`✅ Loaded ${allUsers.length} users`);
  } catch (e) {
    showToast('❌ Error loading users: ' + e.message);
    console.error(e);
  }
}

// ── Dashboard ─────────────────────────────────────────────────
function renderDashboard() {
  const totalXp     = allUsers.reduce((s, u) => s + u.xp, 0);
  const totalCoins  = allUsers.reduce((s, u) => s + u.coins, 0);
  const totalMaster = allUsers.reduce((s, u) => s + u.mastered, 0);
  const avgLevel    = allUsers.length ? (allUsers.reduce((s, u) => s + u.level, 0) / allUsers.length).toFixed(1) : '—';
  const activeToday = allUsers.filter(u => isToday(u.lastActive)).length;

  $('stat-users-val').textContent   = fmt(allUsers.length);
  $('stat-xp-val').textContent      = fmt(totalXp);
  $('stat-level-val').textContent   = avgLevel;
  $('stat-active-val').textContent  = activeToday;
  $('stat-coins-val').textContent   = fmt(totalCoins);
  $('stat-mastered-val').textContent = fmt(totalMaster);

  // Top 8 users
  const top = allUsers.slice(0, 8);
  const maxXp = top[0]?.xp || 1;
  const list = $('top-users-list');
  list.innerHTML = '';
  top.forEach((u, i) => {
    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-n';
    const row = el('div', 'top-user-row');
    row.innerHTML = `
      <div class="rank-badge ${rankClass}">${i + 1}</div>
      <img class="top-user-avatar" src="${u.photoURL || ''}" onerror="this.src=''" alt="" />
      <div style="flex:1">
        <div class="top-user-name">${esc(u.displayName)}</div>
        <div class="xp-bar-outer"><div class="xp-bar-inner" style="width:${Math.round((u.xp / maxXp) * 100)}%"></div></div>
      </div>
      <div class="top-user-xp">${fmt(u.xp)} XP</div>
    `;
    row.addEventListener('click', () => openDrawer(u));
    list.appendChild(row);
  });

  // XP Distribution
  const buckets = [
    { label: '0 XP',      min: 0,    max: 1     },
    { label: '1–500',     min: 1,    max: 500    },
    { label: '500–2k',    min: 500,  max: 2000   },
    { label: '2k–5k',     min: 2000, max: 5000   },
    { label: '5k–10k',    min: 5000, max: 10000  },
    { label: '10k+',      min: 10000,max: Infinity},
  ];
  const maxCount = Math.max(1, ...buckets.map(b => allUsers.filter(u => u.xp >= b.min && u.xp < b.max).length));
  const dist = $('xp-distribution');
  dist.innerHTML = '';
  buckets.forEach(b => {
    const count = allUsers.filter(u => u.xp >= b.min && u.xp < b.max).length;
    const pct   = Math.round((count / maxCount) * 100);
    const row   = el('div', 'dist-row');
    row.innerHTML = `
      <div class="dist-label">${b.label}</div>
      <div class="dist-bar-outer"><div class="dist-bar-inner" style="width:${pct}%"></div></div>
      <div class="dist-count">${count}</div>
    `;
    dist.appendChild(row);
  });
}

// ── Users Table ───────────────────────────────────────────────
$('user-search').addEventListener('input', applyFilters);
$('sort-select').addEventListener('change', applyFilters);

function applyFilters() {
  const q     = $('user-search').value.toLowerCase();
  const sort  = $('sort-select').value;
  filteredUsers = allUsers.filter(u =>
    u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );
  const [field, dir] = sort.split('-');
  filteredUsers.sort((a, b) => {
    if (field === 'name') return dir === 'asc' ? a.displayName.localeCompare(b.displayName) : b.displayName.localeCompare(a.displayName);
    return dir === 'desc' ? b[field] - a[field] : a[field] - b[field];
  });
  $('user-count-label').textContent = `${filteredUsers.length} of ${allUsers.length} users`;
  renderUsersTable();
}

function renderUsersTable() {
  const tbody = $('users-tbody');
  tbody.innerHTML = '';
  if (!filteredUsers.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--text-muted)">No users found</td></tr>';
    return;
  }
  filteredUsers.forEach((u, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--text-muted);font-size:0.8rem">${i + 1}</td>
      <td>
        <div class="user-cell">
          <img class="user-avatar-sm" src="${u.photoURL}" onerror="this.src=''" alt="" />
          <div>
            <div class="user-name-sm">${esc(u.displayName)}</div>
            <div class="user-email-sm">${esc(u.email)}</div>
          </div>
        </div>
      </td>
      <td><span class="xp-val">${fmt(u.xp)}</span></td>
      <td><span class="level-badge">${u.level}</span></td>
      <td><span class="coins-val">${fmt(u.coins)}</span></td>
      <td><span class="streak-val">${u.streak}🔥</span></td>
      <td>${u.mastered}</td>
      <td><span class="date-val">${relDate(u.lastActive)}</span></td>
      <td><button class="btn-detail">View</button></td>
    `;
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
      const q  = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(100));
      const sn = await getDocs(q);
      sorted   = sn.docs.map(d => ({ ...d.data(), uid: d.id }));
    }
    $('lb-count').textContent = `${sorted.length} players`;
    listEl.innerHTML = '';
    sorted.forEach((u, i) => {
      const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-n';
      const row = el('div', 'lb-row');
      row.innerHTML = `
        <div class="rank-badge ${rankClass}">${i + 1}</div>
        <img class="lb-avatar" src="${u.photoURL || ''}" onerror="this.src=''" alt="" />
        <div>
          <div class="lb-name">${esc(u.displayName || u.name || 'Unknown')}</div>
          <div class="lb-uid">${(u.uid || '').slice(0, 20)}…</div>
        </div>
        <span class="lb-xp">${fmt(u.xp)} XP</span>
        <span class="level-badge">${u.level || 1}</span>
        <span class="lb-streak">${u.streak || 0}🔥</span>
      `;
      const found = allUsers.find(x => x.uid === (u.uid || u.id));
      if (found) row.addEventListener('click', () => openDrawer(found));
      listEl.appendChild(row);
    });
  } catch (e) {
    listEl.innerHTML = `<div style="padding:2rem;color:var(--danger)">Error: ${e.message}</div>`;
  }
}

// ── XP Economy ────────────────────────────────────────────────
function renderXpEconomy() {
  const total     = allUsers.length || 1;
  const totalXp   = allUsers.reduce((s, u) => s + u.xp, 0);
  const avgXp     = Math.round(totalXp / total);
  const maxXp     = allUsers[0]?.xp || 0;
  const zeroXp    = allUsers.filter(u => u.xp === 0).length;
  const active7d  = allUsers.filter(u => {
    if (!u.lastActive) return false;
    return (Date.now() - new Date(u.lastActive)) < 7 * 86400000;
  }).length;
  const avgMaster = Math.round(allUsers.reduce((s, u) => s + u.mastered, 0) / total);

  const container = $('xp-economy-stats');
  const stats = [
    ['Total Users',            allUsers.length, ''],
    ['Total XP in System',     fmt(totalXp),    '⚡'],
    ['Average XP per User',    fmt(avgXp),      '⚡'],
    ['Top User XP',            fmt(maxXp),      '🏆'],
    ['Users with 0 XP',        `${zeroXp} (${Math.round(zeroXp/total*100)}%)`, ''],
    ['Active last 7 days',     `${active7d} (${Math.round(active7d/total*100)}%)`, '🔥'],
    ['Avg Words Mastered',     avgMaster,       '🎯'],
  ];
  container.innerHTML = stats.map(([label, val, icon]) => `
    <div class="eco-row">
      <span class="eco-label">${label}</span>
      <span class="eco-val">${icon} ${val}</span>
    </div>
  `).join('');
}

// ── Bulk Reset ─────────────────────────────────────────────────
$('reset-confirm-input').addEventListener('input', (e) => {
  const btn = $('bulk-reset-btn');
  if (e.target.value.trim() === 'RESET ALL') {
    btn.classList.add('enabled');
    btn.disabled = false;
  } else {
    btn.classList.remove('enabled');
    btn.disabled = true;
  }
});

$('bulk-reset-btn').addEventListener('click', async () => {
  if (!confirm('⚠️ This will reset XP, coins, level, streak, and quiz history for ALL users. Are you absolutely sure?')) return;
  const progress = $('reset-progress');
  progress.classList.remove('hidden');
  progress.textContent = '🔄 Starting reset…';
  $('bulk-reset-btn').disabled = true;
  $('bulk-reset-btn').classList.remove('enabled');

  const resetData = {
    xp: 0, coins: 0, level: 1, streak: 0, longestStreak: 0,
    quizMasteredWordIds: [], totalQuizAnswers: 0, totalCorrectAnswers: 0, lastQuizDate: null,
  };

  let done = 0;
  for (const u of allUsers) {
    try {
      await setDoc(doc(db, 'users', u.uid), { xp: 0, level: 1, coins: 0 }, { merge: true });
      await setDoc(doc(db, 'users', u.uid, 'data', 'progress'), resetData, { merge: true });
    } catch (e) { console.warn('Skip:', u.uid, e.message); }
    done++;
    progress.textContent = `🔄 Resetting… ${done}/${allUsers.length}`;
  }
  progress.textContent = `✅ Done! Reset ${done} users.`;
  $('reset-confirm-input').value = '';
  showToast(`✅ Reset complete — ${done} users cleared`);
  loadAllData();
});

// ── User Drawer ───────────────────────────────────────────────
function openDrawer(u) {
  selectedUser = u;
  $('drawer-name').textContent  = u.displayName;
  $('drawer-email').textContent = u.email;
  $('drawer-uid').textContent   = u.uid;
  $('drawer-avatar').src        = u.photoURL || '';
  $('d-xp').textContent         = fmt(u.xp);
  $('d-level').textContent      = u.level;
  $('d-coins').textContent      = fmt(u.coins);
  $('d-streak').textContent     = u.streak;
  $('edit-xp').value            = u.xp;
  $('edit-coins').value         = u.coins;
  $('edit-level').value         = u.level;
  $('edit-streak').value        = u.streak;
  $('save-feedback').classList.add('hidden');

  // Progress detail grid
  const grid = $('drawer-progress-grid');
  grid.innerHTML = '';
  const fields = [
    ['Words Mastered', u.mastered],
    ['Last Active',    relDate(u.lastActive)],
    ['Longest Streak', u.progress?.longestStreak ?? '—'],
    ['Total Quiz Answers', u.progress?.totalQuizAnswers ?? '—'],
    ['Correct Answers', u.progress?.totalCorrectAnswers ?? '—'],
    ['Accuracy', (() => {
      const tot = u.progress?.totalQuizAnswers;
      const cor = u.progress?.totalCorrectAnswers;
      if (!tot) return '—';
      return Math.round((cor / tot) * 100) + '%';
    })()],
    ['Bookmarks', Array.isArray(u.progress?.bookmarkedWordIds) ? u.progress.bookmarkedWordIds.length : 0],
    ['Unlocked Level', u.progress?.unlockedLevel ?? u.level],
  ];
  fields.forEach(([label, val]) => {
    const d = el('div', 'detail-item');
    d.innerHTML = `<div class="detail-item-label">${label}</div><div class="detail-item-val">${val}</div>`;
    grid.appendChild(d);
  });

  // Achievements
  const achEl = $('drawer-achievements');
  achEl.innerHTML = '';
  if (u.achievements.length) {
    u.achievements.forEach(a => {
      achEl.appendChild(el('span', 'achievement-pill', a));
    });
  } else {
    achEl.appendChild(el('span', 'no-achievements', 'No achievements yet'));
  }

  // Raw JSON
  $('drawer-raw-json').textContent = JSON.stringify(u.raw, null, 2);

  $('user-drawer').classList.remove('hidden');
}

function closeDrawer() {
  $('user-drawer').classList.add('hidden');
  selectedUser = null;
}
$('drawer-close').addEventListener('click', closeDrawer);
$('drawer-overlay').addEventListener('click', closeDrawer);

$('copy-json-btn').addEventListener('click', () => {
  navigator.clipboard.writeText($('drawer-raw-json').textContent);
  showToast('📋 JSON copied!');
});

$('save-user-btn').addEventListener('click', async () => {
  if (!selectedUser) return;
  const xp     = parseInt($('edit-xp').value) || 0;
  const coins  = parseInt($('edit-coins').value) || 0;
  const level  = parseInt($('edit-level').value) || 1;
  const streak = parseInt($('edit-streak').value) || 0;
  const fb     = $('save-feedback');
  try {
    await setDoc(doc(db, 'users', selectedUser.uid), { xp, coins, level, streak }, { merge: true });
    await setDoc(doc(db, 'users', selectedUser.uid, 'data', 'progress'), { xp, coins, streak, unlockedLevel: level }, { merge: true });
    fb.textContent = '✅ Saved successfully!';
    fb.className = 'feedback success';
    fb.classList.remove('hidden');
    showToast('✅ User updated');
    // Update local data
    const u = allUsers.find(x => x.uid === selectedUser.uid);
    if (u) Object.assign(u, { xp, coins, level, streak });
    setTimeout(() => fb.classList.add('hidden'), 3000);
  } catch (e) {
    fb.textContent = '❌ Error: ' + e.message;
    fb.className = 'feedback error';
    fb.classList.remove('hidden');
  }
});

$('reset-user-btn').addEventListener('click', async () => {
  if (!selectedUser) return;
  if (!confirm(`Reset XP, coins, level, and streak for ${selectedUser.displayName}?`)) return;
  const resetData = { xp: 0, coins: 0, level: 1, streak: 0, longestStreak: 0, quizMasteredWordIds: [], totalQuizAnswers: 0, totalCorrectAnswers: 0 };
  try {
    await setDoc(doc(db, 'users', selectedUser.uid), { xp: 0, coins: 0, level: 1, streak: 0 }, { merge: true });
    await setDoc(doc(db, 'users', selectedUser.uid, 'data', 'progress'), resetData, { merge: true });
    showToast(`✅ Reset ${selectedUser.displayName}`);
    closeDrawer();
    loadAllData();
  } catch (e) {
    showToast('❌ Reset failed: ' + e.message);
  }
});

// ── Escape helper ──────────────────────────────────────────────
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
