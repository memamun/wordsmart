# Design Review Checklist

For every screen, answer these questions before merge.

---

## Universal Questions

Answer for EVERY screen:

1. Does it match the Stitch mockup? (If no, document why)
2. Does it match the screen spec? (States, hierarchy, actions)
3. Did we use Design System components?
4. Did we invent new components? (If yes, justify and add to Design System)
5. Did we violate spacing rules? (Must use AppSpacing)
6. Did we violate typography rules? (Must use Design System fonts)
7. Did we violate animation rules? (Must use AppAnimation)
8. Did we duplicate any widgets? (If yes, extract to Design System)
9. Does this screen still feel like WordSmart?
10. Would a new user understand this screen in 3 seconds?

---

## Screen-Specific Questions

### SearchPage

- [ ] Is the search bar immediately visible and focused?
- [ ] Do results appear as user types (debounced)?
- [ ] Is the exact match highlighted differently?
- [ ] Does tapping a result navigate to WordDetails?
- [ ] Is the empty state shown when no results found?
- [ ] Are search suggestions helpful and relevant?

### WordDetailsPage

- [ ] Is the word pronunciation prominent?
- [ ] Are definitions clearly separated by part of speech?
- [ ] Are examples shown with translations?
- [ ] Is the bookmark toggle accessible?
- [ ] Does the audio button work on tap?
- [ ] Is the mnemonic/memory aid visually distinct?
- [ ] Are derivatives and roots shown if available?

### ReviewSessionPage

- [ ] Is the flashcard centered and tappable?
- [ ] Does the card flip animation feel natural?
- [ ] Are rating buttons clearly labeled?
- [ ] Is progress shown (cards remaining)?
- [ ] Is the completion summary clear?
- [ ] Does "Back to Home" work correctly?

### ProgressDashboardPage

- [ ] Are metrics displayed in a grid?
- [ ] Is the daily goal visually prominent?
- [ ] Are charts/graphs readable?
- [ ] Does "Start Review" navigate correctly?
- [ ] Is the loading state shown initially?
- [ ] Is the error state recoverable?

### PracticeSessionPage

- [ ] Is the question clearly presented?
- [ ] Are MCQ options tappable with adequate size?
- [ ] Is the correct/incorrect feedback immediate?
- [ ] Does the spelling input work smoothly?
- [ ] Is the progress indicator visible?
- [ ] Does the session complete gracefully?

### PracticeSummaryPage

- [ ] Is the accuracy score prominent?
- [ ] Are all metrics visible without scrolling?
- [ ] Is "Practice Again" the primary action?
- [ ] Is "Back to Home" accessible?
- [ ] Does the layout not overflow on small screens?

### StoryReaderPage

- [ ] Is the paragraph text readable?
- [ ] Are highlighted words visually distinct?
- [ ] Does tapping a word show its meaning?
- [ ] Is the reading progress indicator visible?
- [ ] Does "Next Paragraph" work smoothly?
- [ ] Is the vocabulary list accessible?

---

## Review Process

For each screen:

1. **Open the Stitch mockup** (if available)
2. **Compare pixel-by-pixel** against the implementation
3. **Test all states** (loading, empty, error, success)
4. **Test all interactions** (tap, scroll, back, keyboard)
5. **Check accessibility** (contrast, labels, scaling)
6. **Run on real device** (not just simulator)

If any check fails, document the issue and create a follow-up task.

---

## Sign-Off

| Screen | Reviewed By | Date | Status |
|---|---|---|---|
| SearchPage | | | |
| WordDetailsPage | | | |
| ReviewSessionPage | | | |
| ProgressDashboardPage | | | |
| PracticeSessionPage | | | |
| PracticeSummaryPage | | | |
| StoryReaderPage | | | |
