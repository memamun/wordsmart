# Screen Specification: 04_flashcards

## 🎯 Purpose
Provide a focused, distraction-free spaced-repetition flashcard deck for active memory recall.

## 🏆 User Goal
Review due words, check mnemonic hints, self-evaluate recall accuracy, and update mastery state.

## 🧭 Entry / Exit
*   **Entry:** Tapping "Flashcards" quick action on Home screen (01_home).
*   **Exit:** Tapping Close icon $(X)$ returns to Home (01_home).

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Vocabulary display word, flip tap interaction.
*   **Tier 2 (Secondary Context):** Bengali translation, definition, mnemonic hint card.
*   **Tier 3 (Supporting Actions):** Swipe indicator buttons, progress deck count indicator.

## 📐 Layout Structure
The screen is vertically centered to maximize focus. Side margins are `24dp`.
```
+---------------------------------------------------+
|  (x) Close               [ 4 / 15 ]          (⭐) | <- Top Status Bar
+---------------------------------------------------+
|                                                   |
|  +---------------------------------------------+  |
|  |                                             |  |
|  |                                             |  |
|  |                   ABATE                     |  | <- Front Side (Outfit Bold)
|  |                 [uh-bayt]                   |  |
|  |                                             |  |
|  |            [ Tap Card to Reveal ]           |  | <- Flip hint
|  |                                             |  |
|  +---------------------------------------------+  | <- Glass Card (Level 1 surface)
|                                                   |
+---------------------------------------------------+
|  [◀ Still Learning]              [Mastered ▶]     | <- Swipe Actions (or Tap buttons)
+---------------------------------------------------+
```

## 🧩 Components
1.  **Deck Header:** Displays progress count (e.g. `4 / 15`) and close button.
2.  **Flip Card Container:** Central glassmorphic card housing front and back states.
3.  **Mnemonic Card:** Translucent block colored with 10% Amber highlight detailing memory association hooks.
4.  **Action Buttons:** Bottom actions representing "Still Learning" (Left) and "Mastered" (Right).

## 🔄 Lifecycle States
*   **Front:** Displays vocabulary word and phonetic pronunciation only.
*   **Back:** Displays definitions, examples, and the mnemonic panel.
*   **Completed:** Displays success screen when all due reviews are finished.
*   **Empty:** Displays fallback when no reviews are due today.

## 🖐️ Interactions
*   **Tap Card:** Flips card to toggle between Front and Back states.
*   **Swipe Right:** Dismisses card to the right $\rightarrow$ Marks word as Mastered in progress database.
*   **Swipe Left:** Dismisses card to the left $\rightarrow$ Re-queues word for review at the tail of the deck.

## 🎬 Animations
*   **Y-Axis Flip:** Card rotates 180 degrees over `250ms` using `easeOutCubic` curve.
*   **Swipe Slide:** Dismissed card slides off-screen matching gesture velocity.

## 📐 Responsive Behavior
*   **Phone (<600dp):** Centered card fills 85% of screen width.
*   **Tablet & Desktop (>600dp):** Centered card width is locked to `400dp` with a `3:4` aspect ratio to prevent distorted, oversized stretching.

## ♿ Accessibility
*   Buttons at the bottom act as alternative click targets for users unable to perform swipe gestures.
*   Triggers light haptic ticks on tap and success/warning haptics on swipes.

## 🛠️ Flutter Notes
*   Implement flip animation using `AnimatedBuilder` with a 3D transform matrix (`Matrix4.identity()..setEntry(3, 2, 0.001)..rotateY(angle)`).
*   Wrap the card widget in a `GestureDetector` paired with a drag controller to animate swipe thresholds.

## ✅ Success Criteria
A successful Flashcard screen should allow users to:
*   Identify the word instantly upon screen loading.
*   Flip the card to reveal the definition with **1 tap** on the card surface.
*   Swipe left or right with **1 swipe action** to progress to the next word.
*   Update database learning progress automatically on swipe.
