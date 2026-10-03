# Web progress, tutor, and ranked scores

## Progress ownership and synchronization

Browser progress is scoped to the authenticated Firebase UID, with a separate guest record. The old `wordsmart_gamestate_v2` record has no trustworthy owner and is preserved as guest progress. Signing out or switching accounts remounts the app's learning session. Importing guest progress requires an explicit action in the sync banner and backs up the previous account snapshot locally.

Cloud progress is a complete snapshot at `users/{uid}/data/progress`, with `schemaVersion: 3` and an integer `revision`. A server read must finish before uploads are allowed. Saves use a Firestore transaction that compares the revision and replaces the complete document, including empty maps and arrays. This preserves coin spending, deleted bookmarks, and resets.

Conflicting device edits require a choice between the cloud and local snapshots. Both are backed up under the account's `:conflict-backup` local-storage key before resolving. This policy deliberately avoids guessing how to combine coin balances or review schedules. It does not automatically merge simultaneous offline work. Failed saves remain dirty locally; retry or reconnect to synchronize. The transaction catches changes made by another device even when this tab has not refreshed its snapshot.

## Tutor API and secrets

The browser sends a Firebase ID token to `/api/tutor`. The Firebase `webApi` function verifies it, rejects anonymous users, validates message sizes and roles, and enforces 5 requests/minute and 50/day per account using server-only Firestore records. Provider requests time out after 45 seconds. The function streams sanitized text deltas, and the client reports interrupted streams as errors.

Provider keys must only exist in the Firebase secret `WORDSMART_AI_CONFIG`. Its value is JSON:

```json
{"openrouterKey":"...","geminiKey":"...","geminiFallbackKey":"..."}
```

Fields are optional. `{}` allows ranked scoring while the tutor reports that it is not configured. Never put provider secrets in `VITE_*` variables or commit them. Rotate any AI keys previously included in deployed browser bundles; removing them from source does not revoke old copies. The public Firebase client configuration is not a provider credential.

## Ranked scores

Personal XP remains part of private learning progress. The public web leaderboard now reads `leaderboard/{uid}`, which clients cannot write. `/api/quiz/score` validates vocabulary answers against the server's canonical dataset and awards 10 ranked XP once per word, regardless of replay, duplicate submissions, or question type. The earned-word set and leaderboard update in one server transaction. Requests are limited to 10/minute and 200/day.

Definition, synonym, and antonym questions generated for vocabulary quizzes include explicit answer kinds. Other practice games still award personal XP. Existing client-written public scores are not imported into the new ranked leaderboard. Public ranks start from newly validated answers. This prevents forged totals and unlimited replay rewards; it is not a proctoring system and cannot prevent a learner from looking up publicly available answers.

Legacy `users/{uid}` profiles remain readable for the existing Android client and web migration, but client writes are disabled. Android source is unchanged; it will keep showing the old leaderboard until a separate Android migration. Private learning progress does not authorize ranked score updates.

## Validation

Use Node 22 for deployment dependencies and Java 21 for the Firestore emulator.

```sh
npm --prefix web ci
npm --prefix functions ci
npm --prefix web test
npm --prefix functions test
npm --prefix functions run build:data
npm --prefix web run build
firebase emulators:exec --only firestore --project demo-wordsmart "npm --prefix web run test:rules"
# With functions/.secret.local set to WORDSMART_AI_CONFIG={} (no real AI keys):
firebase emulators:exec --only firestore,auth,functions --project demo-wordsmart "node scripts/test_web_backend.mjs"
```

Tests cover account separation, delayed/failed restoration, conflicts, deletion/reset semantics, edits during saves, spaced repetition, unlock prerequisites, detail-panel inputs, streaming, authentication, quotas, canonical scoring, and Firestore access rules. Emulator tests use a demo project and do not access production.

For local API development, Firebase Hosting emulation listens on port 5000 and Vite proxies `/api` there. Use the Firebase Auth and Firestore emulators for backend development rather than production credentials. To supply test-only provider configuration, use an ignored `functions/.secret.local` containing `WORDSMART_AI_CONFIG={}`. To connect a local web client to emulators, set `VITE_USE_EMULATORS=true` (development builds only); the Firebase client uses the demo project ID.

## Activation (not performed by this change)

1. Enable the Firebase project's supported Functions billing/runtime prerequisites.
2. Set the secret interactively: `firebase functions:secrets:set WORDSMART_AI_CONFIG`.
3. Deploy the functions, rules, and hosting together: `firebase deploy --only functions:web,firestore:rules,hosting`.

Function predeployment generates its vocabulary dataset from `web/public/data/core_vocabulary.json`; Hosting predeployment rebuilds the browser bundle. Deploy both so `/api/**` is rewritten to `webApi` before the SPA fallback. Until deployed, the existing live site and rules are unchanged. Do not deploy hosting alone against the old rules or a missing function.

References: [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions), [HTTP functions](https://firebase.google.com/docs/functions/http-events), [Firebase secret configuration](https://firebase.google.com/docs/functions/config-env).
