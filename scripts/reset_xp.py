#!/usr/bin/env python3
"""
XP Reset Script using Firebase REST API with stored CLI credentials.
Resets xp, coins, level, quizMasteredWordIds, streak for all users.
"""

import json
import sys
import time
import urllib.request
import urllib.error

PROJECT_ID = "wordsmart-vocab-76"
CONFIG_PATH = "/home/mamun/.config/configstore/firebase-tools.json"
CLIENT_ID = "563584335869-fguslvqprrqf7vgqcgmq8ldtd6k86gig.apps.googleusercontent.com"
CLIENT_SECRET = "j9iVZfS8ggKWsJ_euGSFWQ"
TOKEN_URL = "https://oauth2.googleapis.com/token"

def get_access_token():
    """Refresh the Firebase CLI access token."""
    with open(CONFIG_PATH) as f:
        config = json.load(f)
    
    refresh_token = config["tokens"]["refresh_token"]
    access_token = config["tokens"].get("access_token")
    expires_at = config["tokens"].get("expires_at", 0)
    
    # Check if existing token is still valid (with 60s buffer)
    if access_token and time.time() * 1000 < (expires_at - 60000):
        print("✓ Using existing access token")
        return access_token
    
    print("🔄 Refreshing access token...")
    data = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }).encode()
    
    req = urllib.request.Request(TOKEN_URL, data=data, method="POST")
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
    
    return result["access_token"]

def firestore_request(method, url, token, body=None):
    """Make a Firestore REST API request."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        raise Exception(f"HTTP {e.code}: {error_body[:200]}")

def list_documents(collection_path, token):
    """List all documents in a collection using pagination."""
    base_url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/{collection_path}"
    docs = []
    page_token = None
    
    while True:
        url = base_url + "?pageSize=300"
        if page_token:
            url += f"&pageToken={page_token}"
        
        result = firestore_request("GET", url, token)
        docs.extend(result.get("documents", []))
        
        page_token = result.get("nextPageToken")
        if not page_token:
            break
    
    return docs

def patch_document(doc_path, fields, token):
    """Patch/update a Firestore document with specific fields."""
    url = f"https://firestore.googleapis.com/v1/{doc_path}"
    # Build field mask
    field_names = list(fields.keys())
    mask_params = "&".join([f"updateMask.fieldPaths={f}" for f in field_names])
    url += f"?{mask_params}"
    
    body = {"fields": fields}
    return firestore_request("PATCH", url, body=body, token=token)

def make_firestore_value(value):
    """Convert Python value to Firestore value format."""
    if value is None:
        return {"nullValue": None}
    elif isinstance(value, bool):
        return {"booleanValue": value}
    elif isinstance(value, int):
        return {"integerValue": str(value)}
    elif isinstance(value, float):
        return {"doubleValue": value}
    elif isinstance(value, str):
        return {"stringValue": value}
    elif isinstance(value, list):
        return {"arrayValue": {"values": [make_firestore_value(v) for v in value]}}
    elif isinstance(value, dict):
        return {"mapValue": {"fields": {k: make_firestore_value(v) for k, v in value.items()}}}
    return {"nullValue": None}

def reset_user(uid, token):
    """Reset XP-related fields for a user."""
    reset_fields = {
        "xp": 0,
        "coins": 0,
        "level": 1,
        "streak": 0,
        "longestStreak": 0,
        "quizMasteredWordIds": [],
        "totalQuizAnswers": 0,
        "totalCorrectAnswers": 0,
        "lastQuizDate": None,
    }
    
    firestore_fields = {k: make_firestore_value(v) for k, v in reset_fields.items()}
    
    errors = []
    
    # 1. Reset top-level user document
    user_path = f"projects/{PROJECT_ID}/databases/(default)/documents/users/{uid}"
    try:
        patch_document(user_path, firestore_fields, token)
    except Exception as e:
        errors.append(f"top-level: {e}")
    
    # 2. Reset progress sub-document
    progress_path = f"projects/{PROJECT_ID}/databases/(default)/documents/users/{uid}/data/progress"
    try:
        patch_document(progress_path, firestore_fields, token)
    except Exception as e:
        errors.append(f"progress: {e}")
    
    return errors

def main():
    print("=" * 60)
    print("🗑️  WordSmart XP Reset")
    print(f"   Project: {PROJECT_ID}")
    print("=" * 60)
    
    try:
        token = get_access_token()
    except Exception as e:
        print(f"❌ Failed to get access token: {e}")
        sys.exit(1)
    
    print("\n📋 Fetching user list from Firestore...")
    try:
        user_docs = list_documents("users", token)
    except Exception as e:
        print(f"❌ Failed to list users: {e}")
        sys.exit(1)
    
    if not user_docs:
        print("No users found in Firestore.")
        return
    
    print(f"Found {len(user_docs)} user(s). Starting reset...\n")
    
    success_count = 0
    error_count = 0
    
    for doc in user_docs:
        # Extract UID from document name
        uid = doc["name"].split("/")[-1]
        print(f"  → Resetting UID: {uid}...", end=" ")
        
        errors = reset_user(uid, token)
        
        if errors:
            print(f"⚠️  partial errors: {'; '.join(errors)}")
            error_count += 1
        else:
            print("✅")
            success_count += 1
    
    print(f"\n{'=' * 60}")
    print(f"✅ Reset complete!")
    print(f"   Success: {success_count} user(s)")
    if error_count:
        print(f"   Errors:  {error_count} user(s) (may not have progress doc yet)")
    print(f"\n   Fields cleared: xp, coins, level, quizMasteredWordIds,")
    print(f"                    streak, longestStreak, lastQuizDate,")
    print(f"                    totalQuizAnswers, totalCorrectAnswers")
    print("=" * 60)

if __name__ == "__main__":
    main()
