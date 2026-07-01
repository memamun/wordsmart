# Screen Specification: 04_review_session

## 🎯 Purpose
Provide a highly focused, distraction-free spaced-repetition review session for active memory recall. The architecture separates the underlying review session engine (state, scheduling logic, and rules) from the presentation layout, allowing future review interfaces (e.g., multiple-choice, writing drills) to reuse the same session engine. The default presentation mode is a Flashcard deck.

## 🏆 User Goal
Complete due reviews, check phonetic and part-of-speech context, self-evaluate active recall, utilize mnemonics for memory consolidation, and log progression to the spaced repetition database.

## 🧭 Entry / Exit
*   **Entry:** Tapping "Start Review" or "Review Session" quick action on the Home screen ([01_home](file:///home/mamun/wordsmart/docs/ui/screen_specs/01_home.md)) or tapping "Continue Learning" on the Learning Dashboard ([08_learning_dashboard](file:///home/mamun/wordsmart/docs/ui/screen_specs/08_learning_dashboard.md)).
*   **Exit:** Tapping the Close $(X)$ button prompts to save progress and returns to Home ([01_home](file:///home/mamun/wordsmart/docs/ui/screen_specs/01_home.md)).

## 📊 Information Priority
*   **Tier 1 (Critical Focus):** Vocabulary display word, flip-tap interaction, self-evaluation controls.
*   **Tier 2 (Secondary Context):** Part of speech, Bengali meaning, definition, contextual example.
*   **Tier 3 (Supporting Actions):** Mnemonic hint box, audio replay button, session progress bar, remaining time estimate.

## 📐 Layout Structure
The screen is vertically centered. Margins are locked to `24dp` on mobile screens.

### Front Side (Card Mockup)
```
+---------------------------------------------------+
|  (x) Close                                        | <- Top Status Bar
|                                                   |
|  Today's Review                                   | <- Session Title
|  4 / 15              ■■■■□□□□□□  27%             | <- Progress Tracker
|  12 Remaining | 3 min left                        | <- ETA Tracker
+---------------------------------------------------+
|                                                   |
|  +---------------------------------------------+  |
|  |                                             |  |
|  |                                             |  |
|  |                   ABATE                     |  | <- Word (Outfit Bold, 32sp)
|  |                                             |  |
|  |                  [VERB]                     |  | <- Part of Speech (14sp Muted)
|  |                                             |  |
|  |                  uh-BAYT                    |  | <- Pronunciation (16sp Regular)
|  |                                             |  |
|  |                                             |  |
|  |            [ Tap Card to Reveal ]           |  | <- Flip Hint
|  |                                             |  |
|  +---------------------------------------------+  | <- Glass Card (Level 1 surface)
|                                                   |
+---------------------------------------------------+
|            (Swipe Gestures Disabled)              | <- Prevents accidental swipe-before-read
+---------------------------------------------------+
```

### Back Side (Card Mockup)
```
+---------------------------------------------------+
|  (x) Close                                        |
|                                                   |
|  Today's Review                                   |
|  4 / 15              ■■■■□□□□□□  27%             |
|  12 Remaining | 3 min left                        |
+---------------------------------------------------+
|  +---------------------------------------------+  |
|  |  ABATE                                      |  | <- Word Header (Outfit Bold, 20sp)
|  |  [VERB]                                     |  |
|  |                                             |  |
|  |  উপশম করা / হ্রাস পাওয়া                       |  | <- Meaning ⭐ (Bengali, 18sp Bold)
|  |                                             |  |
|  |  Definition                                 |  |
|  |  To become less intense or widespread.      |  | <- Definition (15sp Regular)
|  |                                             |  |
|  |  Example                                    |  |
|  |  The storm finally **ABATED** after         |  | <- Example (Target Word Bold & Amber) ⭐
|  |  midnight.                                  |  |
|  |                                             |  |
|  |  +---------------------------------------+  |  |
|  |  | Mnemonic                              |  |  |
|  |  | Rebate makes the price ABATE.         |  |  | <- Mnemonic Hint ⭐ (Only if exists)
|  |  +---------------------------------------+  |  |
|  |                                             |  |
|  |  (🔊) Audio Replay                          |  | <- Audio Replay Button
|  +---------------------------------------------+  | <- Glass Card (Back Side)
+---------------------------------------------------+
| [← Review Again]     [ Good ]   [Mark Mastered →] | <- Action Buttons (Self-Evaluation)
+---------------------------------------------------+
```

## 🧩 Components
1.  **Session Progress Header:**
    *   `Close` button on top-left.
    *   Spaced review progress tracker displaying count (`4 / 15`), a graphical progress bar (`■■■■□□□□□□`), session percentage completion (`27%`), remaining card count (`12 Remaining`), and estimated time remaining (`3 min left`).
2.  **Flip Card Container:**
    *   A central glassmorphic card housing Front and Back layouts.
    *   On large screens, size is restricted to a maximum width of `400dp` with a minimum height of `480dp` and a strict `3:4` aspect ratio to prevent layouts from stretching.
3.  **Mnemonic Hint Box:**
    *   A translucent panel styled with a `10%` Amber background overlay (`rgba(255, 191, 0, 0.1)`).
    *   **Visibility Rule:** Only render this component if mnemonic association data is present in the database. Collapse height completely if empty.
4.  **Self-Evaluation Action Buttons:**
    *   Positioned at the bottom of the screen.
    *   Displays three active choices when the back is revealed:
        *   **Review Again (Left):** Secondary action styling (e.g., outline button, red/amber text).
        *   **Good (Center):** Secondary styling (teal outline).
        *   **Mark Mastered (Right):** Primary solid styling (teal background, white text).

## 🔄 Lifecycle States
*   **Loading/Preloading:** The active card is displayed immediately. While the user is interacting with the current card, the next card's data and assets are preloaded in the background. Swiping to the next card transitions instantly with no lag.
*   **Front Side:** Only Word, Part of Speech, and Pronunciation are visible. Swipe gestures are disabled to enforce cognitive review.
*   **Back Side:** Full educational card hierarchy revealed. Swipe gestures and bottom assessment buttons are enabled.
*   **Empty State:** Shown if there are no reviews due for today.
    ```
    🎉
    You're finished.
    15 reviewed today.
    Next review
    Tomorrow
    ```
*   **Session Complete:** Dedicated screen state showing review session analytics.
    ```
    Session Complete
    Today's review finished
    
    15 Words Reviewed
    Accuracy: 86%
    
    [ Home ]      [ Practice Again ]
    ```

## 🖐️ Interactions & Gesture Conflict Rules
*   **Card Tap:** Flips between the Front and Back states.
*   **Gesture Conflict Resolution:** Swipe gestures are disabled on the Front Side to prevent users from accidentally skipping cards before reading. Once the Back Side is revealed, swiping is unlocked.
*   **Action Mapping:**
    *   `← Review Again` (Tap Left Button or Swipe Left): Rates the recall as "Again" (re-queues).
    *   `Good` (Tap Center Button): Rates the recall as "Good" (schedules next review according to spaced repetition algorithms).
    *   `Mark Mastered →` (Tap Right Button or Swipe Right): Rates the recall as "Easy" (marks as Mastered, increases review intervals significantly).

## 🎬 Animations
*   **Y-Axis Flip:** 3D rotational transition over `250ms` using an `easeOutCubic` curve when toggling front/back.
*   **Card Slide:** Swiped cards slide off-screen matching the velocity of the dismiss gesture.
*   **Deck Reveal:** A new card enters from the background with a subtle scale animation (`95%` to `100%`) and fade-in over `150ms`.

## 📐 Responsive Behavior
*   **Phones (<600dp):** Centered card fills `88%` of the width.
*   **Tablets & Desktops (>600dp):** Centered card locked to `400dp` width, `480dp` minimum height, and `3:4` aspect ratio.

## ♿ Accessibility
*   Bottom buttons act as alternative click targets for users unable to use swipes. Touch target size is at least `48dp`.
*   Triggers standard haptic ticks on tap, success vibrations for `Mark Mastered`, and warning vibration patterns for `Review Again`.

## 🛠️ Flutter Notes
*   Use Flutter's `Dismissible` widget or a package like `flutter_card_swiper` to manage swipe behaviors, avoiding custom gesture math.
*   Implement preloading of the next card in the review session provider's state machine. Keep the next widget in the stack tree pre-rendered.

## 🧠 Educational Cognitive Sequence
To ensure maximum active recall and memory retention, the session enforces this cognitive loop:
1.  **Front:** Word & Part of Speech are presented.
2.  **Guess:** User guesses the definition and meaning in their mind.
3.  **Tap:** Tap reveals the correct details (translation, definition, examples).
4.  **Compare:** User compares their mental guess with the actual meaning.
5.  **Self-Evaluate:** User selects `Review Again`, `Good`, or `Mark Mastered` based on the difficulty of recall.
6.  **Next Card:** App transitions to the preloaded next card.

## 📋 Session Rules
*   **Card Ordering:** Sourced dynamically from the local database spaced-repetition provider.
*   **Mastery Limit:** Words marked as Mastered do not reappear in the same review session.
*   **Re-queuing:** Marking a card as `Review Again` places it back at the tail of the current review session deck.
*   **Immediate Persistence:** Session stats and spaced scheduling parameters (intervals, ease factors) are written to SQLite immediately after each card action.
*   **Session Resumability:** The session state is persisted locally. If the user exits the app mid-session, they can resume exactly where they left off.
