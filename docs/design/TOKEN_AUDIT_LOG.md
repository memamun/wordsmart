# WordSmart Design Token Audit Log

This document provides a comprehensive log of hardcoded UI elements, styling definitions, colors, and layout margins that bypass the WordSmart Design System. 

---

## 📊 Summary of Hardcoded Elements

| Pattern / Keyword | Count | Priority | Target Resolution (Phase B/C) |
| :--- | :---: | :--- | :--- |
| `Colors.*` (standard Flutter colors) | 38 | High | Replace with semantic roles (`AppColors.textMuted`, etc.) |
| `Color(0xFF...)` (raw hex literals) | 33 | High | Migrate design system & features to `AppColors` |
| `EdgeInsets.*` (raw margin/padding) | 34 | High | Migrate layouts to `AppSpacing` values |
| `BorderRadius.*` / `Radius.*` | 31 | Medium | Align radii to standard values (`AppSpacing.radiusMd`, etc.) |
| `Duration(...)` | 18 | Medium | Centralize in `AppAnimation` constants |
| `Curves.*` | 4 | Medium | Map to motion decelerations in `AppAnimation` |
| `TextStyle(...)` | 34 | Medium | Consolidate under standard typography scale |
| `BoxShadow(...)` / `Border.all` | ~12 | Low | Replace with tonal elevations or standardized borders |
| `Alignment(...)` / `*AxisAlignment` | ~40 | Low | Review and standardise container alignment helpers |
| `Theme.of(` / `ColorScheme` | 4 | Low | Ensure correct dark theme attribute utilization |

---

## 🔍 Detailed Occurrence Log

### 1. Hardcoded Colors (Colors.* & Color(0xFF...))
*   `app/lib/app.dart`: Custom primary (`AppColors.teal`) and secondary (`AppColors.amber`) mapped semantically in Step 3.
*   `app/lib/features/stories/presentation/screens/story_reader_page.dart`: `CircularProgressIndicator` color.
*   `app/lib/features/stories/presentation/widgets/word_context_sheet.dart`: Modal sheet context color overrides.
*   `app/lib/features/stories/presentation/widgets/story_paragraph_block.dart`: Hardcoded `AppColors.amber` for highlighted reading text.
*   `app/lib/features/recommendation/presentation/widgets/recommendation_list.dart`: Hardcoded indicator teal.
*   `app/lib/features/recommendation/presentation/widgets/recommendation_card.dart`: Custom surface and division overlay alpha values.
*   `app/lib/features/practice/presentation/widgets/summary_score_card.dart`: Hardcoded `Colors.green` and `Colors.orange`.
*   `app/lib/features/practice/presentation/widgets/mcq_option_tile.dart`: *Resolved in Step 2* (formerly white, green, red).
*   `app/lib/features/practice/presentation/widgets/spelling_input_card.dart`: *Resolved in Step 2* (formerly green/red).
*   `app/lib/features/review/presentation/widgets/review_flashcard.dart`: Hardcoded `Colors.grey[900]` card fills, `Colors.indigoAccent` labels.
*   `app/lib/features/review/presentation/widgets/review_rating_bar.dart`: Hardcoded `Colors.redAccent`, `Colors.orangeAccent`, `Colors.indigoAccent`, `Colors.greenAccent`.
*   `app/lib/features/review/presentation/screens/review_session_page.dart`: Scaffold background set to `Colors.black`.
*   `app/lib/features/review/presentation/screens/progress_dashboard_page.dart`: Accent dashboard metrics highlights.

### 2. Spacing Violations (EdgeInsets.* & SizedBox)
Almost all feature views bypass standard design tokens:
*   `recommendation_card.dart`: `EdgeInsets.all(16)` and `EdgeInsets.symmetric(horizontal: 16, vertical: 6)`
*   `story_paragraph_block.dart`: `EdgeInsets.all(18)`
*   `word_context_sheet.dart`: `EdgeInsets.fromLTRB(20, 16, 20, 28)`
*   `story_reader_page.dart`: `EdgeInsets.fromLTRB(18, 16, 18, 20)`
*   `review_flashcard.dart`: `EdgeInsets.all(28.0)` and `EdgeInsets.symmetric(horizontal: 12, vertical: 6)`
*   `review_session_page.dart`: `EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0)`

### 3. BorderRadius & Radii
*   `review_flashcard.dart`: Hardcoded `BorderRadius.circular(24)` (does not map to standard cards `radius-xl` 16dp).
*   `mcq_option_tile.dart`: Hardcoded `BorderRadius.circular(12)` (maps to `radiusLg` 12dp).
*   `spelling_input_card.dart`: Hardcoded `BorderRadius.circular(16)` (maps to `radiusXl` 16dp).
*   `story_paragraph_block.dart`: Hardcoded `BorderRadius.circular(12)`.

### 4. Animation Durations & Motion Curves
*   `review_flashcard.dart`: Hardcoded `const Duration(milliseconds: 300)` and `Curves.easeInOutCubic` for card flip.
*   `search_page.dart`: Hardcoded debounce timer `const Duration(milliseconds: 300)`.
*   `word_details_page.dart`: SnackBar durations hardcoded to `Duration(seconds: 1)`.

### 5. Alignment Violations
*   Standard widgets use raw `MainAxisAlignment.spaceEvenly` or `CrossAxisAlignment.start`. These will be audited in Phase B to see if custom wrappers can simplify the hierarchy.

---

## 📅 Maintenance Protocol

This log serves as the backlog for **Phase B (Design System Cleanup)** and **Phase C (UX Polish)**. Developers must not add new items to this list. All new features must strictly reference `AppColors` and `AppSpacing` tokens.
