# WordSmart UI/UX Principles v1.1

This document defines the foundational visual, interaction, and performance principles for WordSmart. Every screen and component designed for the platform must comply with these guidelines.

---

## 🏛️ 1. Design Philosophy
WordSmart is not a dashboard, a social application, or a gamified children's learning app. It is a premium vocabulary reading and learning platform for adult learners. The interface exists solely to make vocabulary acquisition effortless and must never compete with the content.

---

## 🎯 2. Design Goal
Every screen must answer one primary question: *"What should the user do next?"* If the answer is not obvious within 3 seconds, the design has failed.

---

## 📖 3. Content First
The vocabulary word is always the visual hero. Decorative elements must never become more prominent than the word itself.
*   **Visual Priority Order:** Word $\rightarrow$ Meaning $\rightarrow$ Definition $\rightarrow$ Pronunciation $\rightarrow$ Learning Action $\rightarrow$ Supporting Information.

---

## 🔍 4. Search First Experience
Search is the heart of WordSmart. Users primarily open the app to find a word.
*   Search must always be immediately visible.
*   It should require zero scrolling.
*   It should visually dominate the first screen.
*   *Search Feeling:* Simple, fast, and instant (resembling Google Search).

---

## 🔄 5. Progressive Disclosure
Never display everything at once. Reveal details gradually as the user interacts or scrolls:
*   **Disclosure Flow:** Word $\rightarrow$ Pronunciation $\rightarrow$ Meaning $\rightarrow$ Definition $\rightarrow$ Examples $\rightarrow$ Synonyms $\rightarrow$ Antonyms $\rightarrow$ Roots $\rightarrow$ Derivatives $\rightarrow$ Collocations.

---

## 🔤 6. Typography Before Decoration
Typography communicates learning; decoration communicates branding. Learning has higher priority.
*   Use large vocabulary words.
*   Implement comfortable body text and generous line spacing.
*   Minimize borders and icons.

---

## 📐 7. Calm Visual Rhythm
Every screen should breathe. Use whitespace intentionally, follow an **8dp spacing system**, avoid crowded layouts, and let sections feel naturally separated.

---

## 🎨 8. Minimal Color Usage
Color should communicate meaning, not decoration. Never introduce additional accent colors without a purpose.
*   **Amber (`#FFB900`):** Current word, primary action, active state, and bookmarks.
*   **Teal (`#26A69A`):** Definitions, success states, learning progress, and educational metadata.
*   **Red (`#FF6B6B`):** Errors and overdue reviews.
*   **Gray (`#B0B0B0`):** Muted supporting information and secondary labels.

---

## 🎬 9. Motion Philosophy
Animations should explain, never decorate.
*   **Allowed Animations:** Fade, Scale, Hero transition, Card elevation, Ripple, and Page transition.
*   **Forbidden Animations:** Bouncing, rotating, flashing, or long transitions.
*   **Target Duration:** `200–250ms`.

---

## ♿ 10. Accessibility First
*   **Touch Targets:** Minimum `48dp` x `48dp` for all buttons.
*   **Typography:** High-contrast text supporting dynamic system scaling.
*   **Usability:** Optimize for one-handed operation and screen readers.

---

## 🧩 11. Component Consistency
A component must look and behave identically everywhere. No exceptions are permitted for the Search Bar, Word Cards, or Audio buttons.

---

## 🧭 12. Navigation Philosophy
Users should never get lost.
*   **Maximum Navigation Depth:** Home $\rightarrow$ Search $\rightarrow$ Word Details.
*   Every screen must have a clear way back. Avoid unnecessary nested navigation.

---

## 📰 13. Editorial Layout
WordSmart should feel like reading a premium publication, not filling out a database form.
*   **Inspirations:** Apple Books, Readwise Reader, Kindle, Apple Dictionary.
*   **Avoid:** Corporate dashboards, cryptocurrency charts, or colorful gaming interfaces.

---

## ⚡ 14. Performance-Oriented Design
Every UI decision must consider Flutter's rendering efficiency.
*   **Prefer:** Lazy lists (`ListView.builder`), reusable widgets, Material 3 components, simple shadows.
*   **Avoid:** Excessive blurs, complex clipping paths, large SVG stacks, or deep widget trees.

---

## 🍰 15. Vertical Slice Principle
Every completed screen must be fully functional and map cleanly to the backend:
*   **Architecture Flow:** UI $\rightarrow$ Provider $\rightarrow$ UseCase $\rightarrow$ Repository $\rightarrow$ SQLite.

---

## 🔄 16. Screen State Principles
Every screen design must account for its lifecycle states. A screen design is incomplete if it only shows the "ideal" loaded state.
*   **Search States:** Initial $\rightarrow$ Typing $\rightarrow$ Searching $\rightarrow$ Results $\rightarrow$ No Results $\rightarrow$ Offline $\rightarrow$ Error.
*   **Details States:** Loading $\rightarrow$ Loaded $\rightarrow$ Audio Loading $\rightarrow$ Bookmarked/Not Bookmarked $\rightarrow$ Error.
*   **Flashcards States:** Front $\rightarrow$ Back $\rightarrow$ Completed $\rightarrow$ Review Again.

---

## ⏳ 17. Loading Experience (Perceived Performance)
Never display raw, spinning progress indicators for primary screen transitions.
*   **Skeletons & Shimmer:** Use soft gray skeletons (`#1E1E1E` pulsing to `#262626`) that match the exact shape of incoming content cards.
*   **Transition:** Fade-in loaded content over `200ms` rather than instantly snapping.

---

## 📐 18. Responsive Layout Rules
WordSmart scales responsively across form factors:
*   **< 600dp (Phone):** Single-column layout, full screen margins at `24dp`.
*   **600–840dp (Tablet / Foldables):** Two-column layout (e.g. word card on left, relations on right).
*   **> 840dp (Desktop / Wide Screen):** Centered editorial reading layout with maximum content width capped at `800dp`.

---

## 🖐️ 19. Interaction & Gestures
*   **Allowed Gestures:**
    *   *Tap:* Primary selection, link navigation, page transitions.
    *   *Swipe (Horizontal):* Allowed only on Flashcards (Left = Still Learning, Right = Mastered).
    *   *Long Press:* Word Card $\rightarrow$ Triggers lightweight definition overlay/sheet preview.
*   **Disallowed Gestures:** No multi-touch or complex multi-finger gestures.

---

## 📳 20. Haptic Feedback & Sound Design
*   **Haptic Feedback Rules:**
    *   *Light Click:* Toggling bookmarks, tab changes, button taps.
    *   *Success Haptic:* Correct quiz answer, card swiped Mastered.
    *   *Warning Haptic:* Incorrect quiz answer, operation error.
*   **Sound Design Rules:** Pronunciation audio is the only sound permitted. Interface interactions must remain completely silent to avoid distraction.

---

## 💫 21. Animation Choreography
*   **Transition Mapping:**
    *   *Home to Search:* Horizontal Slide transition (`200ms`).
    *   *Search to Word Details:* Hero transition on the headword.
    *   *Bookmark Star Toggle:* Scale bounce (`0.8x` to `1.2x` to `1.0x` over `150ms`).
    *   *Card Swipe:* Dismiss slide off-screen with rotation factor.

---

## 💎 22. Design Tokens (Visual Constants)
*   **Corner Radii:** Cards = `16dp`, Buttons = `20dp`, Search input = `28dp`.
*   **Spacing Grid:** Base = `8dp` (Multiples: `8dp`, `16dp`, `24dp`, `32dp`).
*   **Stroke Width:** Outer outlines = `1dp` at `8%` white opacity. Active outlines = `2dp` solid.
*   **Avatar Sizes:** Header profile = `32dp` diameter.

---

## 🛡️ 23. Error UX Design
Errors must be presented constructively, encouraging retry.
*   **Components:** Small editorial illustration (no child-like drawings), clear user-friendly explanation, and a prominent `Retry` button.
*   **Never** display raw technical stack traces (SQLite exceptions) to the user.

---

## 📝 24. Editorial Writing Style
The tone of WordSmart must be professional, friendly, and academic.
*   **Strict Rules:** Never use childish, sarcastic, or gamified gaming language.
*   *Correct:* *"Well done. You mastered this word."*
*   *Incorrect:* *"Awesome! Level Up! You rock!"*

---

## 📋 25. Complete Design Review Checklist
Before any screen enters Flutter implementation, it must pass these questions:

### Visual & Brand
*   [ ] Does the screen have one primary goal?
*   [ ] Is the typography hierarchy Outfit (headers) and Inter (body) correct?
*   [ ] Does it strictly follow the minimal color palette (Amber/Teal/Red/Gray)?
*   [ ] Is it free of corporate dashboard clutter?

### UX & Interaction
*   [ ] Is the next action obvious within 3 seconds?
*   [ ] Are all touch targets at least `48dp` x `48dp`?
*   [ ] Are the correct haptic feedbacks defined?
*   [ ] Are error states, empty states, and shimmer loading designed?

### Technical & Performance
*   [ ] Can this be built efficiently with standard Material 3 widgets?
*   [ ] Are we avoiding heavy clip path structures and excessive blur?
*   [ ] Is the widget tree optimized for lazy loading?

---

## 📌 10 Principles to Print and Hang on the Wall
1.  **Content over Chrome:** The vocabulary is the hero.
2.  **Search First:** Make finding words effortless.
3.  **One Primary Action:** Every screen has a single clear purpose.
4.  **Typography Creates Hierarchy:** Use size and spacing before color.
5.  **Whitespace Creates Focus:** Don't fear empty space.
6.  **Progressive Disclosure:** Reveal complexity gradually.
7.  **Consistency Builds Trust:** Reuse components and behaviors.
8.  **Motion Explains:** Animate only to communicate state or navigation.
9.  **Performance Feels Premium:** Smoothness is part of the design.
10. **Design for Learning, Not Decoration:** Every visual choice should help users understand, remember, or practice vocabulary.
