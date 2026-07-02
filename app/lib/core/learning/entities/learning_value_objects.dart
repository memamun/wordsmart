enum LearningState {
  newCard,
  discovered,
  learning,
  reviewing,
  mastered,
  decaying,
  relearning
}

enum ReviewMode { newCard, review, relearn }

enum ReviewPriority { low, medium, high, critical }

enum ReviewRating {
  completeBlackout, // 0
  incorrect, // 1
  difficult, // 2
  hard, // 3
  good, // 4
  easy, // 5
}

extension ReviewRatingExtension on ReviewRating {
  int get score => index;
  bool get isCorrect => index >= 3;
  bool get isPerfect => index == 5;
}

class MasteryScore {
  final int value;

  const MasteryScore._(this.value);

  factory MasteryScore(int value) {
    if (value < 0 || value > 100) {
      throw ArgumentError(
          'Mastery score must be between 0 and 100. Received: $value');
    }
    return MasteryScore._(value);
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
    if (current > longest)
      throw ArgumentError('Current streak cannot exceed longest streak');
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

    final localLastDate =
        DateTime(lastStudyDate!.year, lastStudyDate!.month, lastStudyDate!.day);
    final localStudyDate =
        DateTime(studyDate.year, studyDate.month, studyDate.day);
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

  const Accuracy._(this.value);

  factory Accuracy(double value) {
    if (value < 0.0 || value > 100.0) {
      throw ArgumentError(
          'Accuracy percentage must be between 0.0 and 100.0. Received: $value');
    }
    return Accuracy._(value);
  }
}

class RetentionRate {
  final double value;

  const RetentionRate._(this.value);

  factory RetentionRate(double value) {
    if (value < 0.0 || value > 100.0) {
      throw ArgumentError(
          'Retention rate percentage must be between 0.0 and 100.0. Received: $value');
    }
    return RetentionRate._(value);
  }
}

class StudyDuration {
  final Duration value;

  const StudyDuration._(this.value);

  factory StudyDuration(Duration value) {
    if (value.isNegative) {
      throw ArgumentError(
          'Study duration cannot be negative. Received: $value');
    }
    return StudyDuration._(value);
  }

  int get inMinutes => value.inMinutes;
}

class ReviewCount {
  final int value;

  const ReviewCount._(this.value);

  factory ReviewCount(int value) {
    if (value < 0) {
      throw ArgumentError('Review count cannot be negative. Received: $value');
    }
    return ReviewCount._(value);
  }
}
