enum LearningState {
  newCard,
  discovered,
  learning,
  reviewing,
  mastered,
  decaying,
  relearning
}

enum ReviewMode {
  newCard,
  review,
  relearn
}

enum ReviewPriority {
  low,
  medium,
  high,
  critical
}

class ReviewRating {
  final int value;

  const ReviewRating(this.value) {
    if (value < 0 || value > 5) {
      throw ArgumentError('Review rating must be between 0 and 5. Received: $value');
    }
  }

  bool get isCorrect => value >= 3;
  bool get isPerfect => value == 5;
}

class QueueStatistics {
  final int totalCount;
  final int newCount;
  final int reviewCount;
  final int relearnCount;

  const QueueStatistics({
    required this.totalCount,
    required this.newCount,
    required this.reviewCount,
    required this.relearnCount,
  });

  factory QueueStatistics.calculate(List<dynamic> cards) {
    int n = 0;
    int r = 0;
    int rl = 0;

    for (final card in cards) {
      // Dynamic matching depends on card mode property
      final mode = card.mode;
      if (mode == ReviewMode.newCard) n++;
      if (mode == ReviewMode.review) r++;
      if (mode == ReviewMode.relearn) rl++;
    }

    return QueueStatistics(
      totalCount: cards.length,
      newCount: n,
      reviewCount: r,
      relearnCount: rl,
    );
  }
}
