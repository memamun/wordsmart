import '../../../../core/learning/entities/learning_card.dart';
import '../entities/review_queue.dart';
import '../entities/queue_policy.dart';
import '../entities/value_objects.dart';

class ReviewQueueBuilder {
  const ReviewQueueBuilder();

  ReviewQueue build({
    required List<LearningCard> cards,
    required QueuePolicy policy,
    required DateTime now,
    String queueId = 'queue-default',
  }) {
    // 1. Duplicate Protection (keep unique word IDs only)
    final seenIds = <int>{};
    final uniqueCards = <LearningCard>[];
    for (final card in cards) {
      if (seenIds.add(card.word.id)) {
        uniqueCards.add(card);
      }
    }

    // 2. Policy Filtering
    final filteredCards = uniqueCards.where(policy.shouldInclude).toList();

    // 3. Priority Sorting
    filteredCards.sort((a, b) {
      // Primary: Category Rank (Overdue > Decaying > Due > Learning > New)
      final rankA = _getCategoryRank(a, now);
      final rankB = _getCategoryRank(b, now);
      if (rankA != rankB) {
        return rankB.compareTo(rankA); // higher rank first
      }

      // Secondary: Overdue Ratio (highest first)
      final ratioA = _getOverdueRatio(a, now);
      final ratioB = _getOverdueRatio(b, now);
      if ((ratioA - ratioB).abs() > 0.0001) {
        return ratioB.compareTo(ratioA);
      }

      // Tertiary: Repetition Count / Mastery (lowest first)
      if (a.repetitionCount != b.repetitionCount) {
        return a.repetitionCount.compareTo(b.repetitionCount);
      }

      // Quaternary: Alphabetical
      return a.word.word.compareTo(b.word.word);
    });

    // 4. Daily Limits Cap
    final limitedCards = filteredCards.take(policy.maxCards).toList();

    // 5. Daily Variety Interleave Hook
    final finalCards = _interleaveRoots(limitedCards);

    return ReviewQueue(
      id: queueId,
      createdAt: now,
      cards: finalCards,
    );
  }

  int _getCategoryRank(LearningCard card, DateTime now) {
    if (card.learningState == LearningState.decaying) return 3; // Decaying

    if (card.isDue) {
      if (card.mode == ReviewMode.newCard) return 0; // New
      if (card.learningState == LearningState.relearning ||
          card.learningState == LearningState.learning) {
        return 1; // Learning
      }

      // Check if overdue
      if (card.nextReviewAt != null && card.nextReviewAt!.isBefore(now)) {
        return 4; // Overdue
      }
      return 2; // Due
    }

    return -1; // Future/Optional
  }

  double _getOverdueRatio(LearningCard card, DateTime now) {
    if (card.nextReviewAt == null || card.lastReviewedAt == null) return 0.0;
    final totalSec =
        card.nextReviewAt!.difference(card.lastReviewedAt!).inSeconds;
    if (totalSec <= 0) return 1.0;
    final delaySec = now.difference(card.nextReviewAt!).inSeconds;
    if (delaySec <= 0) return 0.0;
    return delaySec / totalSec;
  }

  List<LearningCard> _interleaveRoots(List<LearningCard> cards) {
    if (cards.length <= 2) return cards;
    final List<LearningCard> result = [];
    final List<LearningCard> remaining = List.from(cards);

    result.add(remaining.removeAt(0));

    while (remaining.isNotEmpty) {
      int targetIndex = 0;
      final lastCard = result.last;
      final lastPrefix = lastCard.word.word
          .substring(
            0,
            lastCard.word.word.length >= 3 ? 3 : lastCard.word.word.length,
          )
          .toLowerCase();

      // Try to find a card with a different spelling prefix
      for (int i = 0; i < remaining.length; i++) {
        final cur = remaining[i];
        final curPrefix = cur.word.word
            .substring(
              0,
              cur.word.word.length >= 3 ? 3 : cur.word.word.length,
            )
            .toLowerCase();

        if (curPrefix != lastPrefix) {
          targetIndex = i;
          break;
        }
      }
      result.add(remaining.removeAt(targetIndex));
    }
    return result;
  }
}
