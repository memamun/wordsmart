# WordSmart UI/UX Principles v1.0

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

## 📋 16. Design Quality Checklist
Before implementing a design, it must satisfy this checklist:
*   **Purpose:** Does the screen have one primary goal?
*   **Hierarchy:** Is the most important information obvious?
*   **Simplicity:** Can anything be removed?
*   **Consistency:** Does it follow the design system?
*   **Flutter Compatibility:** Can this be built efficiently with Material 3?
*   **Accessibility:** Is it usable by everyone?
*   **Performance:** Will it remain smooth on mid-range Android devices?
