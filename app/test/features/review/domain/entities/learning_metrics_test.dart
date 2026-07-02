import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/review/domain/entities/learning_metrics.dart';
import '../../../../../lib/features/review/domain/entities/study_session.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';

void main() {
  final streak =
      StudyStreak(current: 2, longest: 4, lastStudyDate: DateTime(2026, 7, 2));

  final session1 = StudySession(
    id: 's1',
    mode: ReviewMode.review,
    startedAt: DateTime(2026, 7, 2, 9, 0),
    finishedAt: DateTime(2026, 7, 2, 9, 10),
    reviewedCards: 15,
    correctAnswers: 12,
    incorrectAnswers: 3,
    duration: StudyDuration(const Duration(minutes: 10)),
  );

  final session2 = StudySession(
    id: 's2',
    mode: ReviewMode.newCard,
    startedAt: DateTime(2026, 7, 2, 14, 0),
    finishedAt: DateTime(2026, 7, 2, 14, 5),
    reviewedCards: 5,
    correctAnswers: 4,
    incorrectAnswers: 1,
    duration: StudyDuration(const Duration(minutes: 5)),
  );

  group('LearningMetrics Calculations', () {
    test('should aggregate metrics correctly from multiple sessions', () {
      final metrics = LearningMetrics.calculate(
        streak: streak,
        sessions: [session1, session2],
        masteredWords: 12,
        learningWords: 8,
        reviewingWords: 15,
        dueToday: 5,
        today: DateTime(2026, 7, 2),
      );

      expect(metrics.masteredWords, 12);
      expect(metrics.learningWords, 8);
      expect(metrics.dueToday, 5);
      expect(metrics.studyMinutesToday, 15); // 10 + 5 minutes
      expect(metrics.accuracy.value,
          80.0); // (12 + 4) / (15 + 5) = 16 / 20 = 80.0%
      expect(metrics.retentionRate.value, 80.0);
    });

    test('should handle calculations with zero sessions completed', () {
      final metrics = LearningMetrics.calculate(
        streak: streak,
        sessions: [],
        masteredWords: 0,
        learningWords: 0,
        reviewingWords: 0,
        dueToday: 10,
        today: DateTime(2026, 7, 2),
      );

      expect(metrics.studyMinutesToday, 0);
      expect(metrics.accuracy.value, 0.0);
      expect(metrics.retentionRate.value, 0.0);
    });
  });
}
