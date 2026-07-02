import '../../../../core/learning/entities/learning_card.dart';
import 'value_objects.dart';

class ReviewQueue {
  final String id;
  final DateTime createdAt;
  final List<LearningCard> cards;
  final QueueStatistics statistics;
  final Duration estimatedDuration;

  ReviewQueue._({
    required this.id,
    required this.createdAt,
    required this.cards,
    required this.statistics,
    required this.estimatedDuration,
  });

  factory ReviewQueue({
    required String id,
    required DateTime createdAt,
    required List<LearningCard> cards,
  }) {
    if (id.isEmpty) {
      throw ArgumentError('Queue ID cannot be empty');
    }

    final stats = QueueStatistics.calculate(cards);

    // Estimate 30 seconds per card
    final duration = Duration(seconds: cards.length * 30);

    return ReviewQueue._(
      id: id,
      createdAt: createdAt,
      cards: List.unmodifiable(cards),
      statistics: stats,
      estimatedDuration: duration,
    );
  }
}
