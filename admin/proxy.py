#!/usr/bin/env python3
"""
WordSmart Admin Proxy Server (Python)
Uses Firebase CLI OAuth2 credentials to:
- List ALL 289+ Auth users via Identity Toolkit batchGet
- Fetch and merge Firestore user records
- Initialize missing database records for users without Firestore documents
- Save / edit user statistics
- Perform user resets
No Blaze plan or service account needed.

Usage: python3 admin/proxy.py
"""

import os
import json
import re
import time
import urllib.request
import urllib.parse
import urllib.error
from concurrent.futures import ThreadPoolExecutor
from http.server import HTTPServer, BaseHTTPRequestHandler

PROJECT_ID    = os.environ.get('FIREBASE_PROJECT_ID', 'wordsmart-vocab-76')
PORT          = int(os.environ.get('ADMIN_PROXY_PORT', 3001))
CONFIG_PATH   = os.environ.get('FIREBASE_CONFIG_PATH', os.path.expanduser('~/.config/configstore/firebase-tools.json'))
CLIENT_ID     = os.environ.get('FIREBASE_CLIENT_ID', '563584335869-fguslvqprrqf7vgqcgmq8ldtd6k86gig.apps.googleusercontent.com')
CLIENT_SECRET = os.environ.get('FIREBASE_CLIENT_SECRET', 'j9iVZfS8ggKWsJ_euGSFWQ')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}

# ── Token management ──────────────────────────────────────────
_token_cache = {'token': None, 'expires_at': 0}

def get_access_token():
    if _token_cache['token'] and time.time() * 1000 < _token_cache['expires_at'] - 60000:
        return _token_cache['token']

    with open(CONFIG_PATH) as f:
        config = json.load(f)

    tokens = config.get('tokens', {})
    stored = tokens.get('access_token')
    expires_at = tokens.get('expires_at', 0)

    if stored and time.time() * 1000 < expires_at - 60000:
        _token_cache['token'] = stored
        _token_cache['expires_at'] = expires_at
        return stored

    print('  Refreshing access token...')
    data = urllib.parse.urlencode({
        'client_id':     CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'refresh_token': tokens['refresh_token'],
        'grant_type':    'refresh_token',
    }).encode()
    req = urllib.request.Request(
        'https://oauth2.googleapis.com/token', data=data, method='POST')
    with urllib.request.urlopen(req, timeout=10) as resp:
        result = json.loads(resp.read())

    _token_cache['token']      = result['access_token']
    _token_cache['expires_at'] = time.time() * 1000 + result.get('expires_in', 3600) * 1000
    print('  ✅ Token refreshed')
    return _token_cache['token']


# ── Firestore Value Converters ─────────────────────────────────
def to_firestore_value(v):
    if v is None:           return {'nullValue': None}
    if isinstance(v, bool): return {'booleanValue': v}
    if isinstance(v, int):  return {'integerValue': str(v)}
    if isinstance(v, float): return {'doubleValue': v}
    if isinstance(v, str):  return {'stringValue': v}
    if isinstance(v, list): return {'arrayValue': {'values': [to_firestore_value(i) for i in v]}}
    if isinstance(v, dict): return {'mapValue': {'fields': {k: to_firestore_value(val) for k, val in v.items()}}}
    return {'nullValue': None}


def parse_firestore_value(val):
    if not val or not isinstance(val, dict): return None
    if 'stringValue' in val: return val['stringValue']
    if 'integerValue' in val: return int(val['integerValue'])
    if 'doubleValue' in val: return float(val['doubleValue'])
    if 'booleanValue' in val: return val['booleanValue']
    if 'timestampValue' in val: return val['timestampValue']
    if 'nullValue' in val: return None
    if 'arrayValue' in val: return [parse_firestore_value(x) for x in val['arrayValue'].get('values', [])]
    if 'mapValue' in val: return {k: parse_firestore_value(v) for k, v in val['mapValue'].get('fields', {}).items()}
    return None


def set_firestore_doc(token, doc_path, fields):
    url = f'https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{doc_path}'
    body = json.dumps({'fields': {k: to_firestore_value(v) for k, v in fields.items()}}).encode()
    req = urllib.request.Request(
        url, data=body, method='PATCH',
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


def patch_firestore_fields(token, doc_path, fields):
    fs_fields = {k: to_firestore_value(v) for k, v in fields.items()}
    mask = '&'.join(f'updateMask.fieldPaths={urllib.parse.quote(k)}' for k in fields)
    url = (f'https://firestore.googleapis.com/v1/projects/{PROJECT_ID}'
           f'/databases/(default)/documents/{doc_path}?{mask}')
    body = json.dumps({'fields': fs_fields}).encode()
    req = urllib.request.Request(
        url, data=body, method='PATCH',
        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


# ── Auth & Firestore Fetchers ─────────────────────────────────
def fetch_all_auth_users():
    token = get_access_token()
    all_users = []
    next_page_token = None

    while True:
        url = f'https://identitytoolkit.googleapis.com/v1/projects/{PROJECT_ID}/accounts:batchGet?maxResults=1000'
        if next_page_token:
            url += f'&nextPageToken={urllib.parse.quote(next_page_token)}'

        req = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())

        batch = data.get('users', [])
        all_users.extend(batch)
        next_page_token = data.get('nextPageToken')
        if not next_page_token:
            break

    return all_users


def fetch_all_firestore_users(token):
    docs_map = {}
    page_token = None
    while True:
        url = f'https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/users?pageSize=300'
        if page_token:
            url += f'&pageToken={urllib.parse.quote(page_token)}'
        req = urllib.request.Request(url, headers={'Authorization': f'Bearer {token}'})
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read())
                for doc in data.get('documents', []):
                    uid = doc['name'].split('/')[-1]
                    parsed = {k: parse_firestore_value(v) for k, v in doc.get('fields', {}).items()}
                    docs_map[uid] = parsed
                page_token = data.get('nextPageToken')
                if not page_token:
                    break
        except Exception as e:
            print(f'  ⚠️ Error fetching firestore users: {e}')
            break
    return docs_map


def build_merged_users():
    token = get_access_token()
    auth_users = fetch_all_auth_users()
    fs_map = fetch_all_firestore_users(token)

    merged = []
    with_db = 0
    no_db = 0

    for u in auth_users:
        uid = u['localId']
        fs = fs_map.get(uid)
        has_fs = fs is not None
        if not has_fs:
            try:
                init_user_in_firestore(token, uid, {
                    'displayName': u.get('displayName'),
                    'email': u.get('email'),
                    'photoURL': u.get('photoUrl'),
                })
                has_fs = True
            except Exception as e:
                print(f'  ⚠️ Auto-init error for {uid}: {e}')

        provider = u.get('providerUserInfo', [{}])[0].get('providerId', 'unknown')
        created_at = None
        if u.get('createdAt'):
            try: created_at = int(u['createdAt'])
            except: pass

        last_sign_in = None
        if u.get('lastLoginAt'):
            try: last_sign_in = int(u['lastLoginAt'])
            except: pass

        merged.append({
            'uid':          uid,
            'email':        u.get('email') or u.get('providerUserInfo', [{}])[0].get('email', ''),
            'displayName':  u.get('displayName') or (fs.get('displayName') if fs else None) or 'WordSmart Learner',
            'photoURL':     u.get('photoUrl') or (fs.get('photoURL') if fs else None) or '',
            'createdAt':    created_at,
            'lastSignIn':   last_sign_in,
            'disabled':     u.get('disabled', False),
            'provider':     provider,
            'emailVerified': u.get('emailVerified', False),
            'xp':           int(fs.get('xp', 0)) if fs else 0,
            'coins':        int(fs.get('coins', 100)) if fs else 100,
            'level':        int(fs.get('level', 1)) if fs else 1,
            'streak':       int(fs.get('streak', 0)) if fs else 0,
            'longestStreak': int(fs.get('longestStreak', 0)) if fs else 0,
            'mastered':     len(fs.get('quizMasteredWordIds', [])) if fs and isinstance(fs.get('quizMasteredWordIds'), list) else (fs.get('masteredWordsCount', 0) if fs else 0),
            'lastActive':   fs.get('lastQuizDate') or fs.get('updatedAt') if fs else None,
            'raw':          {'auth': u, 'firestore': fs},
        })

    # Sort by XP descending
    merged.sort(key=lambda x: x['xp'], reverse=True)
    return {
        'users': merged,
        'total': len(merged),
    }


def init_user_in_firestore(token, uid, user_info=None):
    if not user_info:
        user_info = {}
    display_name = user_info.get('displayName') or 'WordSmart Learner'
    email = user_info.get('email') or ''
    photo_url = user_info.get('photoURL') or user_info.get('photoUrl') or ''

    # 1. Main user doc
    user_doc = {
        'uid': uid,
        'displayName': display_name,
        'email': email,
        'photoURL': photo_url,
        'xp': 0,
        'level': 1,
        'coins': 100,
        'streak': 0,
        'longestStreak': 0,
        'learningWordsCount': 0,
        'masteredWordsCount': 0,
        'totalQuizAnswers': 0,
        'totalCorrectAnswers': 0,
        'quizMasteredWordIds': [],
        'lastQuizDate': None,
    }
    set_firestore_doc(token, f'users/{uid}', user_doc)

    # 2. Progress doc
    progress_doc = {
        'xp': 0,
        'coins': 100,
        'streak': 0,
        'unlockedLevel': 1,
        'bookmarkedWordIds': [],
        'quizMasteredWordIds': [],
        'lastActiveDate': None,
        'levelAttempts': {},
        'unitAttempts': {},
        'achievements': [],
        'wordProgress': {},
        'schemaVersion': 3,
        'revision': 1,
    }
    set_firestore_doc(token, f'users/{uid}/data/progress', progress_doc)


def init_all_missing_users():
    token = get_access_token()
    auth_users = fetch_all_auth_users()
    fs_map = fetch_all_firestore_users(token)
    missing = [u for u in auth_users if u['localId'] not in fs_map]

    print(f'  Initializing {len(missing)} missing users...')

    def _worker(u):
        uid = u['localId']
        info = {
            'displayName': u.get('displayName'),
            'email': u.get('email'),
            'photoURL': u.get('photoUrl'),
        }
        init_user_in_firestore(token, uid, info)
        return uid

    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(_worker, missing))

    print(f'  ✅ Initialized {len(results)} users successfully')
    return len(results)


# ── HTTP Handler ──────────────────────────────────────────────
class AdminHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f'  [{self.command}] {self.path} — {args[1] if len(args)>1 else ""}')

    def send_cors(self, status=200):
        self.send_response(status)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.send_header('Content-Length', len(body))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_cors(204)

    def do_GET(self):
        path = self.path.split('?')[0]

        if path == '/api/health':
            return self.send_json({'ok': True, 'project': PROJECT_ID})

        if path == '/api/avatar':
            query = self.path.split('?')[1] if '?' in self.path else ''
            params = urllib.parse.parse_qs(query)
            target_url = params.get('url', [None])[0]
            if not target_url:
                return self.send_json({'error': 'url required'}, 400)
            try:
                # Upgrade to s400-c for crisp resolution
                if 'googleusercontent.com' in target_url:
                    target_url = re.sub(r'=s\d+(-c)?', '=s400-c', target_url)
                req = urllib.request.Request(target_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    img_data = resp.read()
                    content_type = resp.headers.get('Content-Type', 'image/jpeg')
                    self.send_response(200)
                    for k, v in CORS_HEADERS.items():
                        if k != 'Content-Type':
                            self.send_header(k, v)
                    self.send_header('Content-Type', content_type)
                    self.send_header('Content-Length', len(img_data))
                    self.send_header('Cache-Control', 'public, max-age=86400')
                    self.end_headers()
                    self.wfile.write(img_data)
                    return
            except Exception as e:
                print(f'  ❌ Avatar proxy error: {e}')
                return self.send_json({'error': str(e)}, 500)

        if path == '/api/users':
            print('\n[GET] /api/users — fetching all Auth + Firestore users...')
            try:
                data = build_merged_users()
                print(f'  ✅ Returning {data["total"]} users')
                return self.send_json(data)
            except Exception as e:
                print(f'  ❌ Error: {e}')
                return self.send_json({'error': str(e)}, 500)

        self.send_json({'error': 'Not found'}, 404)

    def do_POST(self):
        path = self.path.split('?')[0]
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length) or b'{}')

        # ── Initialize DB for single user ──────────────────────
        if path == '/api/init-user':
            uid = body.get('uid')
            if not uid:
                return self.send_json({'error': 'uid is required'}, 400)
            print(f'\n[POST] /api/init-user — UID: {uid}')
            try:
                token = get_access_token()
                init_user_in_firestore(token, uid, body)
                return self.send_json({'success': True, 'uid': uid, 'message': 'Database record initialized'})
            except Exception as e:
                print(f'  ❌ Init error: {e}')
                return self.send_json({'error': str(e)}, 500)

        # ── Initialize DB for all missing users ─────────────────
        if path == '/api/init-all':
            print('\n[POST] /api/init-all — Initializing all missing users...')
            try:
                count = init_all_missing_users()
                return self.send_json({'success': True, 'initializedCount': count})
            except Exception as e:
                print(f'  ❌ Init-all error: {e}')
                return self.send_json({'error': str(e)}, 500)

        # ── Save / Edit user stats ─────────────────────────────
        if path == '/api/save-user':
            uid = body.get('uid')
            if not uid:
                return self.send_json({'error': 'uid is required'}, 400)
            print(f'\n[POST] /api/save-user — UID: {uid}')
            try:
                token = get_access_token()
                updates = {}
                for k in ('xp', 'coins', 'level', 'streak'):
                    if k in body:
                        updates[k] = int(body[k])
                patch_firestore_fields(token, f'users/{uid}', updates)
                prog_updates = dict(updates)
                if 'level' in prog_updates:
                    prog_updates['unlockedLevel'] = prog_updates.pop('level')
                patch_firestore_fields(token, f'users/{uid}/data/progress', prog_updates)
                return self.send_json({'success': True, 'uid': uid})
            except Exception as e:
                print(f'  ❌ Save error: {e}')
                return self.send_json({'error': str(e)}, 500)

        # ── Reset single user ───────────────────────────────────
        if path == '/api/reset':
            uid = body.get('uid')
            if not uid:
                return self.send_json({'error': 'uid required'}, 400)
            print(f'\n[POST] /api/reset — UID: {uid}')
            try:
                token = get_access_token()
                reset = {
                    'xp': 0, 'coins': 0, 'level': 1, 'streak': 0,
                    'longestStreak': 0, 'quizMasteredWordIds': [],
                    'totalQuizAnswers': 0, 'totalCorrectAnswers': 0
                }
                patch_firestore_fields(token, f'users/{uid}', {k: v for k, v in reset.items() if k in ('xp','coins','level','streak')})
                patch_firestore_fields(token, f'users/{uid}/data/progress', reset)
                return self.send_json({'success': True, 'uid': uid})
            except Exception as e:
                print(f'  ❌ Reset error: {e}')
                return self.send_json({'error': str(e)}, 500)

        self.send_json({'error': 'Not found'}, 404)


# ── Run ───────────────────────────────────────────────────────
if __name__ == '__main__':
    server = HTTPServer(('127.0.0.1', PORT), AdminHandler)
    print(f'\n🚀 WordSmart Admin Proxy (Python) on http://localhost:{PORT}')
    print(f'   Project : {PROJECT_ID}')
    print(f'   CORS    : * (all origins)')
    print(f'\n   Keep this running while using the admin panel.\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nProxy stopped.')
