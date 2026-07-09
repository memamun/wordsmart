# UI/UX Compliance Checklist

Release gate: Every screen must pass ALL checks below before merge.

---

## 1. Screen Specification

Every screen must match its spec and implement all defined states.

| Screen | Initial | Loading | Results | Empty | Error | Offline |
|---|---|---|---|---|---|---|
| SearchPage | ✅ | ✅ | ✅ | ✅ | ✅ | N/A |
| WordDetailsPage | — | ✅ | ✅ | ✅ | ✅ | N/A |
| ReviewSessionPage | — | ✅ | ✅ | ✅ | ✅ | N/A |
| ProgressDashboardPage | — | ✅ | ✅ | — | ✅ | N/A |
| PracticeSessionPage | — | ✅ | ✅ | ✅ | ✅ | N/A |
| PracticeSummaryPage | — | — | ✅ | — | — | N/A |
| StoryReaderPage | — | ✅ | ✅ | ✅ | ✅ | N/A |

**Verification:** Each page widget handles all applicable states via pattern matching on state type.

---

## 2. Design System Compliance

All UI must use Design System components. No custom widgets unless documented.

### Required Components

| Component | Location | Usage |
|---|---|---|
| `PrimaryButton` | `core/design_system/buttons/` | All primary CTAs |
| `AudioButton` | `core/design_system/buttons/` | Pronunciation playback |
| `BookmarkButton` | `core/design_system/buttons/` | Word bookmarking |
| `WordSearchBar` | `core/design_system/inputs/` | Search input |
| `SectionHeader` | `core/design_system/typography/` | Section dividers |
| `LoadingSkeleton` | `core/design_system/states/` | Loading placeholders |
| `EmptyState` | `core/design_system/states/` | Empty/error states |

### Required Tokens

| Token | Location | Rule |
|---|---|---|
| `AppColors` | `core/design_system/tokens/` | No inline `Color(0xFF...)` |
| `AppSpacing` | `core/design_system/tokens/` | No magic numbers |
| `AppAnimation` | `core/design_system/tokens/` | No raw `Duration` for animations |

**Verification:** `grep -rn "Color(0x" app/lib/features/` should return zero results.

---

## 3. Layout Consistency

All screens must follow:

- [x] 8dp spacing grid (`AppSpacing` values)
- [x] Consistent horizontal padding (16dp)
- [x] Card border radius: 12dp (`AppSpacing.cardRadius`)
- [x] Screen-level padding: 24dp
- [x] Icon sizes: 24dp (standard), 20dp (small), 28dp (large)
- [x] Typography scale defined in Design System

**Verification:** No raw `EdgeInsets` values outside `AppSpacing`.

---

## 4. State Coverage

Every screen must support:

| State | Requirement |
|---|---|
| **Loading** | Show `LoadingSkeleton` or `CircularProgressIndicator` |
| **Empty** | Show `EmptyState` with helpful message and optional action |
| **Success** | Display content with proper hierarchy |
| **Error** | Show error message with retry action |
| **Offline** | Graceful handling if applicable (not required for offline-first app) |

**Verification:** Every page class handles all state transitions.

---

## 5. UX Principles

Every screen must satisfy:

- [x] **3-second rule:** User understands the screen within 3 seconds
- [x] **Primary action obvious:** Most important action is visually prominent
- [x] **Secondary action clear:** Secondary actions are accessible but not competing
- [x] **Visual hierarchy:** Title → Content → Actions (top to bottom)
- [x] **CTA visible:** Primary button visible without scrolling
- [x] **Empty state helpful:** Guides user toward next action
- [x] **Error recoverable:** User can retry or navigate away
- [x] **No dead ends:** Every screen has a clear exit path

---

## 6. Interaction Review

- [x] Tap target minimum: 48dp
- [x] Animations duration: ≤300ms (`AppAnimation` values)
- [x] Hero transitions: Smooth between related screens
- [x] Scroll behavior: Natural momentum, no overscroll jank
- [x] Keyboard: Dismisses on tap outside input
- [x] Back navigation: Consistent with platform conventions
- [x] Haptic feedback: On significant actions (correct/incorrect answer)

**Verification:** Manual testing on real device.

---

## 7. Accessibility

- [x] WCAG AA contrast ratios (4.5:1 text, 3:1 large text)
- [x] Screen reader labels on all interactive elements
- [x] Semantic widgets (Semantics widget for custom layouts)
- [x] Font scaling: Text scales without layout breakage
- [x] No info conveyed by color alone

**Verification:** `flutter analyze` accessibility lints pass.

---

## 8. Performance

- [x] No unnecessary widget rebuilds (const constructors)
- [x] `const` used wherever possible
- [x] Lazy loading for lists (`ListView.builder`)
- [x] No jank during animations (60fps)
- [x] Screen load: <200ms

**Verification:** Flutter DevTools performance overlay shows no red frames.

---

## 9. Design Drift Audit

Every screen must be compared against the original Stitch mockup.

| Screen | Stitch Match | Drift | Justification |
|---|---|---|---|
| SearchPage | TBD | — | — |
| WordDetailsPage | TBD | — | — |
| ReviewSessionPage | TBD | — | — |
| ProgressDashboardPage | TBD | — | — |
| PracticeSessionPage | TBD | — | — |
| PracticeSummaryPage | TBD | — | — |
| StoryReaderPage | TBD | — | — |

If drift exists, document the reason. Otherwise, six months later you'll wonder why the app doesn't match the design.

---

## 10. Anti-Patterns to Reject

| Violation | Rule |
|---|---|
| Raw `Color(0xFF...)` | Use `AppColors` |
| Raw `EdgeInsets.all(16)` | Use `AppSpacing` |
| Raw `Duration(milliseconds: 300)` | Use `AppAnimation` |
| Custom button widget | Use `PrimaryButton` |
| Custom loading indicator | Use `LoadingSkeleton` |
| Custom empty state | Use `EmptyState` |
| `setState` for cross-screen state | Use Riverpod provider |
| Business logic in `build()` | Move to provider/use case |
| Hardcoded strings | Use constants or localization |
