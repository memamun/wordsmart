# Screen Specification: 04_flashcards

## 🎯 Purpose
Provide a focused, distraction-free spaced-repetition flashcard deck for active memory recall.

## 🏆 User Goal
Review due words, check mnemonic hints, self-evaluate recall accuracy, and update mastery state.

## 🧭 Entry & Exit Points
*   **Entry:** Tapping "Flashcards" quick action on Home screen.
*   **Exit:** Tapping Close icon $(X)$ returns to Home (01_home).

## 🧩 Components
1.  **Deck Header:** Displays progress count (e.g. `4 / 15`) and close button.
2.  **Flip Card Container:** Central glassmorphic card housing front and back states.
3.  **Mnemonic Card:** Colored panel highlighting memory hooks.
4.  **Action Buttons:** Bottom actions representing "Still Learning" (Left) and "Mastered" (Right).

## 🔄 Lifecycle States
*   **Front:** Displays vocabulary word and phonetic pronunciation only.
*   **Back:** Displays definitions, examples, and the mnemonic panel.
*   **Completed:** Displays success screen when all due reviews are finished.

## 🖐️ Interactions & Gestures
*   **Tap Card:** Flips card to toggle between Front and Back states.
*   **Swipe Right:** Dismisses card to the right $\rightarrow$ Marks word as Mastered in progress database.
*   **Swipe Left:** Dismisses card to the left $\rightarrow$ Re-queues word for review at the tail of the deck.

## 🎬 Animations
*   **Y-Axis Flip:** Card rotates 180 degrees over `250ms` using `easeOutCubic` curve.
*   **Swipe Slide:** Dismissed card slides off-screen matching gesture velocity.

## ♿ Accessibility
*   Buttons at the bottom act as alternative click targets for users unable to perform swipe gestures.
*   Triggers light haptic ticks on tap and success/warning haptics on swipes.

## 🛠️ Flutter Implementation Notes
*   Implement flip animation using `AnimatedBuilder` with a 3D transform matrix (`Matrix4.identity()..setEntry(3, 2, 0.001)..rotateY(angle)`).
*   Wrap the card widget in a `GestureDetector` paired with a drag controller to animate swipe thresholds.
