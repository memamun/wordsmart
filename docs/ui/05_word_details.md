# Word Details Screen Wireframe & Spec

This document defines the layout, sections, and progressive disclosure rules for the flagship **Word Details** screen of WordSmart.

---

## 🏛️ Layout Structure (Top-to-Bottom)

The screen uses a scrollable sliver structure to allow the primary vocabulary word to stay prominent or collapse cleanly into the app bar on scroll. Spacing aligns to the 8dp grid, and screen side margins are **24dp**.

```
+---------------------------------------------------+
|  (<) Back                          (⭐) Bookmark  | <- Sliver App Bar
+---------------------------------------------------+
|                                                   |
|  ABASH                                            | <- display-word (Outfit Bold, 48sp)
|  /əˈbæʃ/   [ v. ]                             (🔊) | <- Pronunciation, Chip, Audio Button
|                                                   |
+---------------------------------------------------+
|  MEANINGS                                         | <- Section Header
|  +---------------------------------------------+  |
|  |  অনুবাদ: লজ্জিত করা / অপ্রস্তুত করা               |  | <- Hind Siliguri (Bengali)
|  |                                             |  |
|  |  Definition: To embarrass or make ashamed   |  | <- Inter Medium (English)
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  POPULAR COLLOCATIONS                             | <- Section Header
|  • feel abashed     • abashed silence             | <- Bullet items (Inter)
+---------------------------------------------------+
|  EXAMPLE SENTENCES                                | <- Section Header
|  1. Meredith felt abashed by her sister's success | <- Example 1
|     অনুবাদ: মেরডিথ তার বোনের সাফল্যে অপ্রস্তুত বোধ ... | <- Bengali Translation (Muted)
+---------------------------------------------------+
|  WORD RELATIONSHIPS                               | <- Section Header
|  Synonyms:  [ embarrass ]  [ mortify ]  [ rattle ] | <- Synonym Chips
|  Antonyms:  [ encourage ]  [ embolden ]           | <- Antonym Chips
+---------------------------------------------------+
|  DERIVATIVES                                      | <- Section Header
|  • abashment (n.)   The state of being abashed.   | <- Bullet list
+---------------------------------------------------+
|  ROOTS & ETYMOLOGY                                | <- Section Header
|  +---------------------------------------------+  |
|  |  Root: AB (off / away)                      |  | <- Root Card (Level 1 surface)
|  |  Origin: Latin 'ab' meaning from or away.   |  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
```

---

## 📝 Component Specifications

### 1. Hero Word Header
*   **Vocabulary Word:** Displayed in Outfit Bold (`48sp`, `#FFB900` Amber).
*   **Phonetics:** Muted gray Inter (`16sp`) centered or left-aligned below the word.
*   **Audio player:** Tactical `44dp` play button sitting parallel to the word.

### 2. Meanings Card
*   **Style:** Translucent Level 1 surface card with a 1px border.
*   **Bengali Translation:** Outfit / Hind Siliguri (`17sp`, `#F5F5F5`).
*   **English Definition:** Inter Medium (`17sp`, `#B0B0B0`).
*   **Spacing:** `16dp` gap between translations.

### 3. Example Sentences List
*   **Style:** Borderless list with a `16dp` gap between items.
*   **English Sentence:** Inter Regular (`16sp`, `#F5F5F5`).
*   **Bengali Translation:** Muted Hind Siliguri (`15sp`, `#B0B0B0`) sitting directly underneath the English sentence.

### 4. Synonyms & Antonyms Chips
*   **Style:** Row of standard `Chips` with horizontal scrolling.
*   **Colors:** Inactive chips use a dark gray surface (`#1E1E1E`); selected/focused chips use the Teal accent (`rgba(38, 166, 154, 0.1)`).

### 5. Roots & Derivatives
*   **Roots Card:** Styled as a distinct Level 1 surface box containing Outfit headers (`20sp`) and monospace root tags (e.g. `AB`, `ES`).
*   **Derivatives List:** Clean bullet points with italicized Part of Speech tags in JetBrains Mono.

---

## 🔄 Interaction & Progressive Disclosure Rules
*   **The Disclosure Flow:** To avoid cognitive overload, only **Hero Header**, **Meanings**, and **Collocations** are visible above the fold on launch. 
*   **Scroll Reveal:** Scrolling down reveals **Examples**, **Synonyms/Antonyms**, and finally **Derivatives/Roots** sequentially.
*   **Collapsing Header:** When the user scrolls past the main word, the Outfit title collapses into a smaller `20sp` version inside the pinned Sliver Top App Bar for persistent context.
