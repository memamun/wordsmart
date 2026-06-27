enum LearningStatus {
  unlearned,
  learning,
  mastered,
  review;

  /// Helper to deserialize string representation from SQLite to domain enum safely.
  static LearningStatus fromString(String value) {
    switch (value.toLowerCase()) {
      case 'learning':
        return LearningStatus.learning;
      case 'mastered':
        return LearningStatus.mastered;
      case 'review':
        return LearningStatus.review;
      case 'unlearned':
      default:
        return LearningStatus.unlearned;
    }
  }

  /// Helper to serialize domain enum back to SQLite string.
  String toDbString() => name;
}
