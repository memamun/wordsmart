# WordSmart UI/UX Compliance Audit Report

This report presents the findings of a comprehensive design compliance audit of the WordSmart Flutter application against the established UI/UX, design tokens, and accessibility documents located in `docs/design/`.

---

## 📊 Executive Summary

The WordSmart application contains a highly functional feature set (v0.5.1). However, the UI implementation has **significant design drift** from the specifications. 

*   **Design Tokens (Spacing & Radii):** Major inconsistencies exist between the token values defined in `design_tokens.md` and those implemented in `app_spacing.dart`. Additionally, raw magic numbers for paddings, margins, and border radii are used extensively across all feature widgets.
*   **Semantic Color System:**
    *   Central tokens in `app_colors.dart` drift from `design_system.md` specifications (e.g., using green/red for success/error instead of teal/soft-red).
    *   Features like `practice` hardcode light-theme colors (`Colors.white`, `Colors.grey[50]`, `Colors.green[50]`, `Colors.red[50]`), which causes **severe legibility issues** in Dark Mode (white text on near-white background).
*   **Component Reuse:** The Design System component library (buttons, empty states, search bar) is heavily bypassed. Custom widgets (e.g., `PracticeEmptyState`, `ReviewEmptyState`) and custom-styled `ElevatedButton`s are implemented instead of reusing the centralized design system widgets (`EmptyState`, `PrimaryButton`).
*   **Accessibility & Haptics:** The application contains **zero** `HapticFeedback` implementations despite specific mappings required in the accessibility guidelines. 
*   **Motion & Transitions:** Centralized `AppAnimation` constants are rarely used, and raw durations/curves are declared inline.

**Overall Design Compliance Status: ❌ FAIL**

---

## 🔍 Detailed Findings & Gaps

### 1. Spacing & Corner Radii Drift

There is a mismatch between the spacing grid definitions in `docs/design/design_tokens.md` and the implemented token names in `app_spacing.dart`:

| Design Token Spec | Spec Value | Dart Token Implementation | Dart Value | Status |
| :--- | :--- | :--- | :--- | :--- |
| `spacing-xs` | `4dp` | `AppSpacing.xs` | `4.0` | ✅ Match |
| `spacing-sm` | `8dp` | `AppSpacing.sm` | `8.0` | ✅ Match |
| `spacing-md` | `16dp` | `AppSpacing.md` | `12.0` | ❌ Mismatch (Should be 16) |
| `spacing-lg` | `24dp` | `AppSpacing.lg` | `16.0` | ❌ Mismatch (Should be 24) |
| `spacing-xl` | `32dp` | `AppSpacing.xl` | `20.0` | ❌ Mismatch (Should be 32) |
| `spacing-xxl` | `48dp` | `AppSpacing.xxl` | `24.0` | ❌ Mismatch (Should be 48) |
| — | — | `AppSpacing.xxxl` | `32.0` | ⚠️ Extra Token |
| — | — | `AppSpacing.hero` | `48.0` | ⚠️ Extra Token |

Similarly, corner radii drift:

| Radius Token Spec | Spec Value | Dart Token Implementation | Dart Value | Status |
| :--- | :--- | :--- | :--- | :--- |
| `radius-sm` | `4dp` (checkboxes, tags) | `AppSpacing.radiusSm` | `8.0` | ❌ Mismatch (Should be 4) |
| `radius-md` | `8dp` (etymology, history) | `AppSpacing.radiusMd` | `12.0` | ❌ Mismatch (Should be 8) |
| `radius-lg` | `12dp` (dialogs, chips) | `AppSpacing.radiusLg` | `16.0` | ❌ Mismatch (Should be 12) |
| `radius-xl` | `16dp` (Word/Progress Cards) | `AppSpacing.radiusXl` | `24.0` | ❌ Mismatch (Should be 16) |
| `radius-xxl` | `20dp` (Primary buttons) | — | — | ❌ Missing |
| `radius-full` | `28dp` (SearchBar) | — | — | ❌ Missing |

#### Spacing Violations in Features:
*   Features use raw `EdgeInsets` rather than `AppSpacing`. Examples:
    *   `recommendation_card.dart`: `EdgeInsets.symmetric(horizontal: 16, vertical: 6)`, `EdgeInsets.all(16)`
    *   `review_flashcard.dart`: `EdgeInsets.all(28.0)`, `EdgeInsets.symmetric(horizontal: 12, vertical: 6)`
    *   `review_session_page.dart`: `EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0)`
    *   `practice_session_page.dart`: `EdgeInsets.symmetric(horizontal: 16, vertical: 8)`

---

### 2. Semantic Color Drift & Dark Theme Legibility Failure

#### Color Token Drift:
`app_colors.dart` implements different hex codes than those specified in `design_system.md`:

| Semantic Role | Design Spec Hex | AppColors Implementation | Status |
| :--- | :--- | :--- | :--- |
| **Success** | `#26A69A` (Teal) | `Color(0xFF66BB6A)` (Green) | ❌ Mismatch |
| **Error** | `#FF6B6B` (Soft Red) | `Color(0xFFEF5350)` (Red) | ❌ Mismatch |
| **Warning / Active** | `#FFB900` (Amber) | `Color(0xFFFFA726)` (Orange) | ❌ Mismatch |
| **Divider** | `rgba(255,255,255,0.08)` | `Color(0xFF333333)` | ❌ Mismatch |
| **Secondary** | `#80D8FF` (Light Blue) | `Color(0xFFFFB900)` (Amber - mapped to second) | ❌ Mismatch |

#### 🚨 Critical Bug: Unreadable Practice Widgets in Dark Theme
The application theme enforces `brightness: Brightness.dark` globally. However, the `practice` widgets hardcode light colors:
*   `QuestionCard` background is `Colors.grey[50]` (near-white) with border `Colors.grey[200]`.
*   `McqOptionTile` background is `Colors.white` (or `Colors.green[50]` / `Colors.red[50]`).
*   `SpellingInputCard` background is `Colors.white` (or `Colors.green[50]` / `Colors.red[50]`).

**Result:** In Dark Mode, text elements inherit light colors (e.g. white/light-grey) from the theme, resulting in **white text rendered on a white background**, making questions, options, and input fields completely unreadable.

---

### 3. Component Reuse Violations (Anti-Patterns)

*   `PrimaryButton` (`core/design_system/buttons/`) is ignored everywhere except in `word_details_page.dart`. Instead, screens and widgets (e.g., `story_reader_page.dart`, `practice_summary_page.dart`, `review_session_page.dart`, `next_action_card.dart`) instantiate raw `ElevatedButton` widgets with custom stylized inline borders and paddings.
*   `EmptyState` (`core/design_system/states/`) is bypassed. Features redefine their own custom empty states:
    *   `PracticeEmptyState` in `app/lib/features/practice/presentation/widgets/practice_empty_state.dart`
    *   `ReviewEmptyState` in `app/lib/features/review/presentation/widgets/review_empty_state.dart`
*   **Loading skeletons:** Instead of utilizing `LoadingSkeleton` from the design system, `practice` and `review` features implement `PracticeLoadingSkeleton` and `ReviewLoadingSkeleton` containing custom containers and custom light-theme/dark-theme colors.
*   **Raw Color References in Design System:** The design system widgets themselves (e.g., `empty_state.dart`, `primary_button.dart`, `word_search_bar.dart`, `audio_button.dart`, `bookmark_button.dart`) hardcode raw hex values (e.g., `Color(0xFF26A69A)`, `Color(0xFFB0B0B0)`, `Color(0xFF888888)`) rather than utilizing `AppColors`.

---

### 4. Accessibility Gaps

*   **Haptic Feedback:** The accessibility guidelines in `docs/design/accessibility.md` define standard haptic feedback for stars, nav tabs, quiz answers, and mastered reviews. **No `HapticFeedback` calls exist anywhere in the codebase.**
*   **Touch Targets:** Several buttons and icons do not explicitly guarantee the minimum touch target of `48dp x 48dp` (e.g. custom styled rating buttons in `ReviewRatingBar` have vertical paddings but no guaranteed constraints, small toggle actions).
*   **Semantics:** Custom widgets (like `McqOptionTile` and `ReviewFlashcard`) do not wrap their components in `Semantics` tags to announce structural meanings (e.g., whether an option is correct or incorrect) for screen readers.

---

### 5. Motion & Transition Violations

*   **Flashcard Flip Duration:** `ReviewFlashcard` defines flip animation durations with raw values (`const Duration(milliseconds: 300)`) instead of using `AppAnimation.cardFlip` (400ms) or referencing `docs/design/motion.md` standard durations (`duration-slow`: `300ms`).
*   **Deceleration Curves:** Transition curves in widgets are occasionally declared inline instead of routing through centralized tokens (e.g., `Curves.easeInOutCubic` is used directly in `ReviewFlashcard`).

---

## 📱 Screen-by-Screen Acceptance Checklist Status

| Screen | Layout (Spacing/Grid) | States (Loading/Empty/Success/Error) | Component Reuse | Animation (Hero/Transitions) | Accessibility (Contrast/Semantics/Haptics) | Approved |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **SearchPage** | ⚠️ Maint. (Padding is 16, not 24) | ✅ | ✅ | ✅ | ⚠️ Maint. (No haptics on actions) | ✅ UX PASS (⚠️ Maint.) |
| **WordDetailsPage** | ⚠️ Maint. (Raw layout paddings) | ✅ | ✅ | ✅ | ⚠️ Maint. (No haptics on bookmark toggle) | ✅ UX PASS (⚠️ Maint.) |
| **ReviewSessionPage** | ⚠️ Maint. (Raw layout paddings) | ✅ | ❌ Drift (Uses `ReviewEmptyState`, custom button) | ⚠️ Maint. (Raw duration, curves) | ⚠️ Maint. (No haptic feedback on ratings) | ❌ Drift (Component) |
| **ProgressDashboardPage**| ⚠️ Maint. (Raw sizes/spacings) | ✅ | ❌ Drift (Custom `ElevatedButton`, indigo loading) | ⚠️ Maint. (Standard transitions) | ⚠️ Maint. (No haptics on nav actions) | ❌ Drift (Component) |
| **PracticeSessionPage** | ⚠️ Maint. (Uses raw spacing grid) | ✅ | ❌ Drift (Uses `PracticeEmptyState`, custom MCQ option tiles) | ⚠️ Maint. (Standard transitions) | ❌ Contrast (CRITICAL: White-on-white text bug; no haptics) | ❌ UX BLOCKER |
| **PracticeSummaryPage** | ⚠️ Maint. (Uses raw spacing grid) | ✅ | ❌ Drift (Uses custom buttons) | ⚠️ Maint. (Standard transitions) | ⚠️ Maint. (No haptics on CTAs) | ❌ Drift (Component) |
| **StoryReaderPage** | ⚠️ Maint. (Uses raw spacing grid) | ✅ | ❌ Drift (Uses custom button layouts) | ⚠️ Maint. (Standard transitions) | ⚠️ Maint. (No haptics on transitions) | ❌ Drift (Component) |

---

## 🛠️ Actionable Remediation Plan (Prioritized Release Plan)

To bring the codebase to full compliance, the following prioritized sequence of updates is proposed:

### Phase A — Critical Fixes (Required for v1.0)
1.  **Resolve Critical Dark Theme Contrast Bug in Practice:**
    *   Update `QuestionCard`, `McqOptionTile`, and `SpellingInputCard`.
    *   Replace `Colors.white` and `Colors.grey[50]` backgrounds with `AppColors.surface` or `AppColors.surfaceHigh`.
    *   Replace `Colors.grey[300]!` and `Colors.grey[200]!` borders with `AppColors.divider`.
    *   Replace success/error states (e.g. `Colors.green[50]` / `Colors.red[50]`) with transparent/opacity-overlay colors (e.g. `AppColors.teal.withOpacity(0.08)` or `AppColors.error.withOpacity(0.08)`).
    *   Ensure all text styles use correct semantic colors (`AppColors.textPrimary`, `AppColors.textSecondary`).
2.  **Synchronize Core Tokens:**
    *   Align `app_spacing.dart` with `design_tokens.md`:
        *   Change `AppSpacing.md` from `12` to `16`.
        *   Change `AppSpacing.lg` from `16` to `24`.
        *   Change `AppSpacing.xl` from `20` to `32`.
        *   Change `AppSpacing.xxl` from `24` to `48`.
        *   Introduce `AppSpacing.radiusXxl = 20` and `AppSpacing.radiusFull = 28`.
    *   Align `app_colors.dart` semantic colors with `design_system.md`:
        *   Change `success` color to `teal` (`0xFF26A69A`).
        *   Change `error` color to Soft Red (`0xFFFF6B6B`).
        *   Change `warning` color to Amber (`0xFFFFB900`).
        *   Change `divider` to `Color(0x14FFFFFF)` (8% white overlay).
3.  **Clean Up Duplicate Design-System Components:**
    *   Delete custom empty states (`PracticeEmptyState` and `ReviewEmptyState`) and refactor screens to use the shared `EmptyState` widget.
    *   Consolidate `PracticeLoadingSkeleton` and `ReviewLoadingSkeleton` with the central `LoadingSkeleton`.

### Phase B — Design System Cleanup (Maintainability)
1.  **Remove Inline Colors:** Replace all hardcoded raw `Color(0xFF...)` references in Design System widgets (e.g., `empty_state.dart`, `primary_button.dart`, `bookmark_button.dart`) and feature screens with standard `AppColors` references.
2.  **Replace Raw Spacing:** Replace raw `EdgeInsets` margin and padding values with `AppSpacing` tokens.
3.  **Replace Raw Durations:** Replace raw `Duration` constructors with `AppAnimation` constants.
4.  **Consolidate Buttons:** Replace all inline custom `ElevatedButton` instances across all features with `PrimaryButton` (configured with correct primary/secondary outline variants).

### Phase C — UX Polish (Nice to Have)
1.  **Add Haptic Feedback:** Import `services.dart` and trigger `HapticFeedback` light, vibrate, and heavy impact methods on buttons, quiz submissions, rating inputs, and toggles as specified in `docs/design/accessibility.md`.
2.  **Improve Accessibility (Semantics):** Add `Semantics` tags to MCQ options and flashcard state reversals.
3.  **Manual UI Review:** Review actual screen rendering against the original Stitch mockups.
4.  **Responsive Testing:** Test on different screen sizes and font scales to ensure no jank or overlaps.
