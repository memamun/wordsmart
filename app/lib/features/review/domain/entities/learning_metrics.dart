import 'study_session.dart';
import 'value_objects.dart';

class LearningMetrics {
  final StudyStreak streak;
  final int masteredWords;
  final int learningWords;
  final int reviewingWords;
  final int dueToday;
  final int studyMinutesToday;
  final Accuracy accuracy;
  final RetentionRate retentionRate;

  const LearningMetrics({
    required this.streak,
    required this.masteredWords,
    required this.learningWords,
    required this.reviewingWords,
    required this.dueToday,
    required this.studyMinutesToday,
    required this.accuracy,
    required this.retentionRate,
  });

  factory LearningMetrics.calculate({
    required StudyStreak streak,
    required List<StudySession> sessions,
    required int masteredWords,
    required int learningWords,
    required int reviewingWords,
    required int dueToday,
    required DateTime today,
  }) {
    int totalReviewed = 0;
    int totalCorrect = 0;
    int minutesToday = 0;

    final localToday = DateTime(today.year, today.month, today.day);

    for (final session in sessions) {
      totalReviewed += session.reviewedCards;
      totalCorrect += session.correctAnswers;

      final localStarted = DateTime(
        session.startedAt.year,
        session.startedAt.month,
        session.startedAt.day,
      );
      if (localStarted.difference(localToday).inDays == 0) {
        minutesToday += session.duration.inMinutes;
      }
    }

    final double calculatedAccuracy = totalReviewed > 0
        ? (totalCorrect / totalReviewed) * 100.0
        : 0.0;

    return LearningMetrics(
      streak: streak,
      masteredWords: masteredWords,
      learningWords: learningWords,
      reviewingWords: reviewingWords,
      dueToday: dueToday,
      studyMinutesToday: minutesToday,
      accuracy: Accuracy(calculatedAccuracy),
      retentionRate: RetentionRate(calculatedAccuracy),
    );
  }
}
