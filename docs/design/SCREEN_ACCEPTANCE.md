# Screen Acceptance Matrix

One row per screen. All checks must pass before release.

---

## Acceptance Table

| Screen | Layout | States | Components | Animation | Accessibility | Performance | Approved |
|---|---|---|---|---|---|---|---|
| SearchPage | ⚠️ Maint. | ✅ | ✅ | ✅ | ⚠️ Maint. | ⬜ | ✅ UX PASS |
| WordDetailsPage | ⚠️ Maint. | ✅ | ✅ | ✅ | ⚠️ Maint. | ⬜ | ✅ UX PASS |
| ReviewSessionPage | ⚠️ Maint. | ✅ | ❌ Drift | ⚠️ Maint. | ⚠️ Maint. | ⬜ | ❌ Drift |
| ProgressDashboardPage | ⚠️ Maint. | ✅ | ❌ Drift | ⚠️ Maint. | ⚠️ Maint. | ⬜ | ❌ Drift |
| PracticeSessionPage | ⚠️ Maint. | ✅ | ❌ Drift | ⚠️ Maint. | ❌ Contrast | ⬜ | ❌ UX BLOCKER |
| PracticeSummaryPage | ⚠️ Maint. | ✅ | ❌ Drift | ⚠️ Maint. | ⚠️ Maint. | ⬜ | ❌ Drift |
| StoryReaderPage | ⚠️ Maint. | ✅ | ❌ Drift | ⚠️ Maint. | ⚠️ Maint. | ⬜ | ❌ Drift |

---

## Column Definitions

| Column | What to verify |
|---|---|
| **Layout** | Spacing grid, padding, card radius, icon sizes, typography scale |
| **States** | Loading, empty, success, error all implemented |
| **Components** | Uses Design System widgets (PrimaryButton, EmptyState, etc.) |
| **Animation** | ≤300ms, smooth transitions, Hero effects work |
| **Accessibility** | Contrast, screen reader labels, font scaling |
| **Performance** | No jank, const widgets, lazy lists, <200ms load |

---

## Detailed Acceptance Criteria

### SearchPage

| Criterion | Status | Notes |
|---|---|---|
| Layout matches spec | ⬜ | |
| Initial state (empty search) | ⬜ | |
| Typing state (suggestions) | ⬜ | |
| Results state (word list) | ⬜ | |
| Empty state (no results) | ⬜ | |
| Uses WordSearchBar | ⬜ | |
| Uses FeaturedWordCard | ⬜ | |
| Debounced search (300ms) | ⬜ | |
| Hero transition to details | ⬜ | |
| **Subtotal** | ⬜ / 9 | |

### WordDetailsPage

| Criterion | Status | Notes |
|---|---|---|
| Layout matches spec | ⬜ | |
| Loading state (skeleton) | ⬜ | |
| Success state (full word) | ⬜ | |
| Error state (word not found) | ⬜ | |
| Uses AudioButton | ⬜ | |
| Uses BookmarkButton | ⬜ | |
| Uses SectionHeader | ⬜ | |
| Pronunciation visible | ⬜ | |
| Examples with translations | ⬜ | |
| **Subtotal** | ⬜ / 9 | |

### ReviewSessionPage

| Criterion | Status | Notes |
|---|---|---|
| Layout matches spec | ⬜ | |
| Loading state | ⬜ | |
| Active state (flashcard) | ⬜ | |
| Completed state (summary) | ⬜ | |
| Error state | ⬜ | |
| Card flip animation ≤300ms | ⬜ | |
| Rating buttons 48dp+ tap target | ⬜ | |
| Progress indicator visible | ⬜ | |
| **Subtotal** | ⬜ / 8 | |

### ProgressDashboardPage

| Criterion | Status | Notes |
|---|---|---|
| Layout matches spec | ⬜ | |
| Loading state | ⬜ | |
| Loaded state (metrics) | ⬜ | |
| Error state | ⬜ | |
| Metrics grid readable | ⬜ | |
| Daily goal prominent | ⬜ | |
| Refresh works | ⬜ | |
| **Subtotal** | ⬜ / 7 | |

### PracticeSessionPage

| Criterion | Status | Notes |
|---|---|---|
| Layout matches spec | ⬜ | |
| Loading state | ⬜ | |
| Active state (question) | ⬜ | |
| Completed state | ⬜ | |
| Error state | ⬜ | |
| MCQ options 48dp+ tap target | ⬜ | |
| Correct/incorrect feedback | ⬜ | |
| Spelling input works | ⬜ | |
| **Subtotal** | ⬜ / 8 | |

### PracticeSummaryPage

| Criterion | Status | Notes |
|---|---|---|
| Layout matches spec | ⬜ | |
| Accuracy score prominent | ⬜ | |
| Metrics grid visible | ⬜ | |
| No overflow on small screens | ⬜ | |
| "Practice Again" primary CTA | ⬜ | |
| "Back to Home" accessible | ⬜ | |
| **Subtotal** | ⬜ / 6 | |

### StoryReaderPage

| Criterion | Status | Notes |
|---|---|---|
| Layout matches spec | ⬜ | |
| Loading state | ⬜ | |
| Reading state | ⬜ | |
| Vocabulary list visible | ⬜ | |
| Highlighted words distinct | ⬜ | |
| Word tap shows meaning | ⬜ | |
| Reading progress visible | ⬜ | |
| **Subtotal** | ⬜ / 7 | |

---

## Release Gate

| Gate | Required | Status |
|---|---|---|
| All screens approved | Yes | ❌ FAIL |
| No layout overflows | Yes | ⚠️ UNKNOWN (Needs device profiling) |
| All states implemented | Yes | ✅ PASS |
| Design System used | Yes | ❌ FAIL |
| Accessibility checked | Yes | ❌ FAIL |
| Performance profiled | Yes | ⬜ PENDING |

**Overall Design Compliance:** ❌ FAIL
