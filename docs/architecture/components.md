# WordSmart Reusable Component Library

This document outlines the standard reusable UI widgets of the WordSmart design system. All layouts must compose views using these widgets.

---

## 🧩 Component Directory

### 1. SearchBar
*   **Purpose:** Global dictionary query interface.
*   **Usage:** Anchor at the top of the Home (`readOnly: true`) and Search (`readOnly: false`) screens.
*   **Variants:** Pinned, Inline, Overlay Suggestions suggestions pane.
*   **States:** Enabled, Pressed, Focused (pins at top when keyboard launches), Disabled, Loading.
*   **Padding:** Outer: `spacing-md`, Inner elements: `12dp` vertical capsule padding.
*   **Spacing:** Margin below: `spacing-lg`.
*   **Flutter Widget:** custom wrapper around Material 3 `SearchBar`.
*   **Accessibility:** FocusNode requests keyboard on entry. Screen readers announce: *"Search input field. Double tap to enter text."*
*   **Animations:** Hero expansion (`200ms`) transitioning from Home to Search.

### 2. WordCard
*   **Purpose:** Displays primary vocabulary headword details.
*   **Usage:** Featured on details and search results screens.
*   **Variants:** Standard Details Card, Expanded Card.
*   **States:** Enabled, Pressed (micro-scales down `3%`), Loading (pulses skeleton shimmer).
*   **Padding:** Inner padding: `spacing-md` (`16dp`).
*   **Spacing:** `spacing-md`.
*   **Flutter Widget:** `Card` with `outline` border tokens.
*   **Accessibility:** Screen reader announces: *"Word card: [spelling]. [definition]"*.
*   **Animations:** Scale spring bounce on press release.

### 3. FeaturedWordCard
*   **Purpose:** Editorial featured vocabulary term of the day.
*   **Usage:** Top of Home screen below greeting.
*   **Variants:** Single default layout.
*   **States:** Enabled, Pressed, Loading (1.2s shimmer pulse).
*   **Padding:** Outer: `spacing-md` (`16dp`).
*   **Spacing:** `spacing-lg` (`24dp`).
*   **Flutter Widget:** Glassmorphic container (`BackdropFilter` with `10%` opacity).
*   **Accessibility:** Entire card reads out meaning, spelling, and audio prompts sequentially.
*   **Animations:** Pulsing Amber glow (`box-shadow: elevation-glow` breathing over `2000ms`). Tapping opens details.

### 4. ProgressCard
*   **Purpose:** Tracks and displays daily goals, streaks, or completion targets.
*   **Usage:** Home priority card, story readers, and study deck entries.
*   **Variants:** Unified Hero Priority Card, Mini Goal Card.
*   **States:** Enabled, Pressed, Completed (grows Teal checkmark overlays).
*   **Padding:** Inner margins: `spacing-md` (`16dp`).
*   **Spacing:** `spacing-lg`.
*   **Flutter Widget:** Flat custom `Card` with Teal and Amber progress indicators.
*   **Accessibility:** Announces: *"Progress card: 8 of 20 completed. 40% daily goal progress."*
*   **Animations:** Animated progress bar fill (`LinearProgressIndicator` values slide over `300ms`).

### 5. SectionHeader
*   **Purpose:** Clean typographical breaks between screen segments.
*   **Usage:** Separator before collections, lists, and activities.
*   **Variants:** Bold Title, Subtitle layout.
*   **States:** Enabled (non-interactive).
*   **Padding:** Vertical: `spacing-sm` (`8dp`).
*   **Spacing:** Bottom spacing: `spacing-xs` (`4dp`).
*   **Flutter Widget:** `Padding` with custom `Text` (Outfit SemiBold, `18sp`).
*   **Accessibility:** Marked semantically as a header tag for screen readers.
*   **Animations:** None.

### 6. StatCard
*   **Purpose:** Visual blocks to display numeric achievements.
*   **Usage:** Learning dashboard metrics grid.
*   **Variants:** Numeric Card, Dot Matrix Progress Card.
*   **States:** Enabled, pressed (navigates details lists), loading.
*   **Padding:** Inner grid: `spacing-md` (`16dp`).
*   **Spacing:** Grid child spacing: `spacing-sm` (`8dp`).
*   **Flutter Widget:** Custom flat `Container` with rounded borders.
*   **Accessibility:** Announces: *"Statistic: 352 mastered words. Top 43% of goal."*
*   **Animations:** Numeric counters slide count values up (`0` to `target`) over `500ms`.

### 7. AudioButton
*   **Purpose:** Trigger phonetic pronunciation audio.
*   **Usage:** Featured on Word Details cards and Today's Word cards.
*   **Variants:** Floating Audio capsule, Circular Audio button.
*   **States:** Enabled, Pressed, Selected (plays glow animations), Loading (displays circular rotation overlay), Disabled.
*   **Padding:** Minimum target bounds: `44dp` diameter (touch-friendly).
*   **Spacing:** `spacing-xs` (`4dp`).
*   **Flutter Widget:** `IconButton` with custom circular indicator overlay.
*   **Accessibility:** Announces: *"Play phonetic pronunciation"* button.
*   **Animations:** Spin rotation loading indicator, scale bounce on tap.

### 8. BookmarkButton
*   **Purpose:** Save/Bookmark vocabulary words.
*   **Usage:** Bottom sheets, WordDetails headers, Today's Word cards.
*   **Variants:** Star icon (`☆` / `★`).
*   **States:** Enabled, Pressed, Selected (bookmark active), Disabled.
*   **Padding:** Touch bounds: `48dp` x `48dp`.
*   **Spacing:** Inline.
*   **Flutter Widget:** `IconButton` toggling between filled and outlined.
*   **Accessibility:** Announces: *"Save word to vocabulary list"* / *"Remove word from vocabulary list"*.
*   **Animations:** Scale bounce (`0.8x` to `1.2x` to `1.0x` over `150ms`) on state changes.

### 9. POSChip
*   **Purpose:** Identify grammatical parts of speech (e.g. `[VERB]`, `[NOUN]`).
*   **Usage:** Word title lines.
*   **Variants:** Bracketed uppercase string.
*   **States:** Static text (non-interactive).
*   **Padding:** Horizontal: `spacing-xs`, Vertical: `2dp`.
*   **Spacing:** Left margin: `spacing-sm`.
*   **Flutter Widget:** Custom `Text` (JetBrains Mono, `12sp`, muted gray color).
*   **Accessibility:** Announces: *"Part of speech: Verb."*
*   **Animations:** None.

### 10. DifficultyChip
*   **Purpose:** Displays difficulty level or exam context badges.
*   **Usage:** Word details, search results, collections.
*   **Variants:** Outlined Chip, Filled Tint Chip.
*   **States:** Enabled, Selected, Disabled.
*   **Padding:** Horizontal: `8dp`, Vertical: `4dp`.
*   **Spacing:** Right: `spacing-xs`.
*   **Flutter Widget:** custom wrapper around Material 3 `Chip` or custom container.
*   **Accessibility:** Announces: *"Difficulty level: GRE High Frequency."*
*   **Animations:** Fade transitions.

### 11. ExampleCard
*   **Purpose:** Displays target word used in context sentences.
*   **Usage:** Word details etymology sections.
*   **Variants:** Outlined Card, Card with target highlight.
*   **States:** Enabled (non-interactive).
*   **Padding:** Inner: `spacing-md` (`16dp`).
*   **Spacing:** Bottom gap: `spacing-sm`.
*   **Flutter Widget:** Custom `Card` with bold Amber styled text span segments.
*   **Accessibility:** Pronounces sentence, emphasizing the target vocabulary word.
*   **Animations:** None.

### 12. StoryCard
*   **Purpose:** Entry link widget to active story readings.
*   **Usage:** Home featured sections and story libraries.
*   **Variants:** Library List row, Continue Reading Card.
*   **States:** Enabled, Pressed, Completed.
*   **Padding:** Inner margins: `spacing-md`.
*   **Spacing:** `spacing-md`.
*   **Flutter Widget:** custom flat `Card` with cover illustrations and reading progress bars.
*   **Accessibility:** Announces story title, duration estimate, and completion percentage.
*   **Animations:** Micro-scaling transitions.

### 13. CollectionCard
*   **Purpose:** Links to curated vocabulary categories.
*   **Usage:** Home screen collections stack.
*   **Variants:** Small card, Full Grid card.
*   **States:** Enabled, Pressed.
*   **Padding:** Inner: `spacing-md`.
*   **Spacing:** `spacing-sm`.
*   **Flutter Widget:** `Card` with leading icons prepended (`📚`, `📘`, `🧠`).
*   **Accessibility:** Announces: *"Collection: GRE High Frequency. Double tap to view collection."*
*   **Animations:** Scale spring on press.

### 14. ResultTile
*   **Purpose:** Clean search result row displaying matching queries.
*   **Usage:** Search results list views.
*   **Variants:** Default Search row.
*   **States:** Enabled, Pressed, Focused.
*   **Padding:** Vertical: `12dp`, Horizontal: `spacing-md`.
*   **Spacing:** Borderless row margins.
*   **Flutter Widget:** Material 3 `ListTile` configured with custom text themes.
*   **Accessibility:** Announces spelling, POS, and English/Bengali definitions cleanly.
*   **Animations:** Ripple highlight overlays.

### 15. ReviewCard
*   **Purpose:** Front/Back spaced review flashcard.
*   **Usage:** Review session active study container.
*   **Variants:** Front Card (spelling only), Back Card (meaning, hint, and etymology details).
*   **States:** Enabled, Flipped, Swiped.
*   **Padding:** Inner margins: `spacing-lg` (`24dp`).
*   **Spacing:** Centered.
*   **Flutter Widget:** Custom gesture-detector wrapper card with rotation transitions.
*   **Accessibility:** Full phonetic and spelling announcement when cards flip.
*   **Animations:** Flipped rotation transition (`250ms`), Swipe slide dismiss off-screen.

### 16. StudyButton
*   **Purpose:** Main Study/Review actions launcher.
*   **Usage:** Home quick actions and study dashboards.
*   **Variants:** Filled primary button, Outlined secondary button.
*   **States:** Enabled, Pressed, Focused, Disabled, Loading.
*   **Padding:** Horizontal: `spacing-lg`, Vertical: `spacing-md` (Min height: `48dp`).
*   **Spacing:** Sibling gaps: `spacing-sm`.
*   **Flutter Widget:** Material 3 `FilledButton` / `OutlinedButton` with custom theme Extension mappings.
*   **Accessibility:** Screen reader announces: *"Study Button: [Action label]."*.
*   **Animations:** Scale micro-bounce on press down/release.

### 17. NavigationBar
*   **Purpose:** Bottom app navigation bar.
*   **Usage:** Main screen canvases.
*   **Variants:** Standard bottom dock.
*   **States:** Enabled, Selected (Active tab highlights), Disabled.
*   **Padding:** Capsule horizontal indicators: `8dp`.
*   **Spacing:** Anchored bottom.
*   **Flutter Widget:** Material 3 `NavigationBar` themed in transparent background overlays.
*   **Accessibility:** Announces active page index and counts.
*   **Animations:** Slide transitions on layout flips, tab indicator scaling bounces.
