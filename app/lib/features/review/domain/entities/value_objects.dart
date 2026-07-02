import '../../../../core/learning/entities/learning_value_objects.dart';

// Re-export shared value objects from core/learning/
export '../../../../core/learning/entities/learning_value_objects.dart'
    show
        LearningState,
        ReviewMode,
        ReviewPriority,
        ReviewRating,
        ReviewRatingExtension,
        MasteryScore;

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

class StudyStreak {
  final int current;
  final int longest;
  final DateTime? lastStudyDate;

  const StudyStreak._({
    required this.current,
    required this.longest,
    this.lastStudyDate,
  });

  factory StudyStreak({
    required int current,
    required int longest,
    DateTime? lastStudyDate,
  }) {
    if (current < 0) throw ArgumentError('Current streak cannot be negative');
    if (longest < 0) throw ArgumentError('Longest streak cannot be negative');
    if (current > longest) throw ArgumentError('Current streak cannot exceed longest streak');
    return StudyStreak._(
      current: current,
      longest: longest,
      lastStudyDate: lastStudyDate,
    );
  }

  StudyStreak increment(DateTime studyDate) {
    if (lastStudyDate == null) {
      return StudyStreak(
        current: 1,
        longest: longest < 1 ? 1 : longest,
        lastStudyDate: studyDate,
      );
    }
    
    final localLastDate = DateTime(lastStudyDate!.year, lastStudyDate!.month, lastStudyDate!.day);
    final localStudyDate = DateTime(studyDate.year, studyDate.month, studyDate.day);
    final diff = localStudyDate.difference(localLastDate).inDays;

    if (diff == 1) {
      final newCurrent = current + 1;
      return StudyStreak(
        current: newCurrent,
        longest: newCurrent > longest ? newCurrent : longest,
        lastStudyDate: studyDate,
      );
    } else if (diff > 1) {
      return StudyStreak(
        current: 1,
        longest: longest,
        lastStudyDate: studyDate,
      );
    }
    return this;
  }

  StudyStreak reset() {
    return StudyStreak(
      current: 0,
      longest: longest,
      lastStudyDate: lastStudyDate,
    );
  }
}

class Accuracy {
  final double value;

  const Accuracy(this.value) {
    if (value < 0.0 || value > 100.0) {
      throw ArgumentError('Accuracy percentage must be between 0.0 and 100.0. Received: $value');
    }
  }
}

class RetentionRate {
  final double value;

  const RetentionRate(this.value) {
    if (value < 0.0 || value > 100.0) {
      throw ArgumentError('Retention rate percentage must be between 0.0 and 100.0. Received: $value');
    }
  }
}

class StudyDuration {
  final Duration value;

  const StudyDuration(this.value) {
    if (value.isNegative) {
      throw ArgumentError('Study duration cannot be negative. Received: $value');
    }
  }

  int get inMinutes => value.inMinutes;
}

class ReviewCount {
  final int value;

  const ReviewCount(this.value) {
    if (value < 0) {
      throw ArgumentError('Review count cannot be negative. Received: $value');
    }
  }
}
