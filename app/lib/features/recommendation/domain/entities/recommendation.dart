enum RecommendationType {
  dueReview,
  continueStory,
  weakWord,
  practiceSession,
  dailyGoal,
}

class Recommendation {
  final String id;
  final RecommendationType type;
  final String title;
  final String subtitle;
  final String reason;
  final String actionLabel;
  final int priority;
  final Map<String, dynamic> metadata;

  const Recommendation({
    required this.id,
    required this.type,
    required this.title,
    required this.subtitle,
    required this.reason,
    required this.actionLabel,
    required this.priority,
    this.metadata = const {},
  });
}
