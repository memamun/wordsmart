# Flashcard Study Screen Wireframe & Spec

This document defines the layout, swipe interactions, and flip card animation rules for the spaced-repetition **Flashcards** training screen.

---

## 🏛️ Layout Structure (Top-to-Bottom)

The screen is vertically centered to maximize focus. Side margins are **24dp**.

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

### Back Side of the Card (After Tap)
```
+---------------------------------------------------+
|  [ 4 / 15 ]                                       |
+---------------------------------------------------+
|  +---------------------------------------------+  |
|  |  ABATE                                 (🔊) |  |
|  |  অনুবাদ: প্রশমিত হওয়া                          |  | <- Bengali Translation
|  |  Definition: to subside; to reduce          |  | <- English Definition
|  |                                             |  |
|  |  +---------------------------------------+  |  |
|  |  | MNEMONIC: 'A-BATE' -> 'Re-Bate'       |  |  | <- Mnemonic Box (10% Amber)
|  |  | (Discount makes prices subside/reduce)|  |  |
|  |  +---------------------------------------+  |  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
|  [◀ Still Learning]              [Mastered ▶]     |
+---------------------------------------------------+
```

---

## 📝 Component Specifications

### 1. The Glass Card Container
*   **Dimensions:** Aspect ratio `3:4`, centered in the viewport.
*   **Shape:** `RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))`.
*   **Aesthetics:** Translucent Level 1 surface (`#1E1E1E`) with `rgba(255, 255, 255, 0.08)` outline. The back side features a soft Amber outer glow to signal active focus.

### 2. Mnemonic Box
*   **Style:** Filled container card inside the card back.
*   **Colors:** `rgba(255, 185, 0, 0.08)` (10% Amber) background, no border, text in `#F5F5F5`.
*   **Typography:** Title in JetBrains Mono (`12sp`, uppercase, bold), text in Inter (`14sp`).

### 3. Swipe Action Buttons
*   **Hollow Left Button:** `OutlinedButton` (labeled "Still Learning") with red error text (`#FF6B6B`) on outline, pill-shaped.
*   **Filled Right Button:** `FilledButton` (labeled "Mastered") with solid Teal background (`#26A69A`) and white text.

---

## 🔄 Card Motion & Swipe Mechanics

### 1. Y-Axis Flip Animation
*   **Trigger:** Tap anywhere on the card surface.
*   **Transition:** Y-axis 3D rotation (`180 degrees`).
*   **Duration:** `250ms` using `easeOutCubic` curve.
*   **State Switch:** At exactly `90 degrees` (halfway through the rotation), the card widget switches its content from the front view to the back view.

### 2. Swipe-to-Dismiss Gesture
*   **Swipe Left (Reject):** Slide card off-screen to the left $\rightarrow$ Marks word as `learning` state $\rightarrow$ Triggers haptic double-tick $\rightarrow$ Re-adds word to the tail of the current review deck.
*   **Swipe Right (Accept):** Slide card off-screen to the right $\rightarrow$ Marks word as `mastered` or updates spacing intervals $\rightarrow$ Triggers clean success haptic tick $\rightarrow$ Loads next card.
*   **Undo Action:** A small circular icon at the top corner allows the user to undo their last swipe, sliding the previous card back onto the canvas.
