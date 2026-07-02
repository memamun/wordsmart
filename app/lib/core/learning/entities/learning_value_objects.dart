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

enum ReviewRating {
  completeBlackout, // 0
  incorrect,        // 1
  difficult,        // 2
  hard,             // 3
  good,             // 4
  easy,             // 5
}

extension ReviewRatingExtension on ReviewRating {
  int get score => index;
  bool get isCorrect => index >= 3;
  bool get isPerfect => index == 5;
}

class MasteryScore {
  final int value;

  const MasteryScore(this.value) {
    if (value < 0 || value > 100) {
      throw ArgumentError('Mastery score must be between 0 and 100. Received: $value');
    }
  }
}
