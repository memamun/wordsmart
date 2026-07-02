import '../../../../core/learning/entities/learning_value_objects.dart';

// Re-export ALL value objects from core/learning/
export '../../../../core/learning/entities/learning_value_objects.dart';

// ── Review-specific value objects ──────────────────────────────────

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
