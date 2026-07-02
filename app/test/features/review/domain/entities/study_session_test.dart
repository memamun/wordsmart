import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/review/domain/entities/study_session.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';

void main() {
  group('StudySession Invariant Validation', () {
    test('should construct a valid StudySession', () {
      final session = StudySession(
        id: 'session-abc',
        mode: ReviewMode.review,
        startedAt: DateTime(2026, 7, 2, 10, 0),
        finishedAt: DateTime(2026, 7, 2, 10, 15),
        reviewedCards: 20,
        correctAnswers: 18,
        incorrectAnswers: 2,
        duration: StudyDuration(const Duration(minutes: 15)),
      );

      expect(session.id, 'session-abc');
      expect(session.correctAnswers, 18);
      expect(session.duration.inMinutes, 15);
    });

    test('should throw ArgumentError when finished date is before started date',
        () {
      expect(
        () => StudySession(
          id: 'session-invalid',
          mode: ReviewMode.review,
          startedAt: DateTime(2026, 7, 2, 10, 15),
          finishedAt: DateTime(2026, 7, 2, 10, 0),
          reviewedCards: 20,
          correctAnswers: 18,
          incorrectAnswers: 2,
          duration: StudyDuration(const Duration(minutes: 15)),
        ),
        throwsArgumentError,
      );
    });

    test(
        'should throw ArgumentError when correct answers count exceeds reviewed cards count',
        () {
      expect(
        () => StudySession(
          id: 'session-invalid',
          mode: ReviewMode.review,
          startedAt: DateTime(2026, 7, 2, 10, 0),
          finishedAt: DateTime(2026, 7, 2, 10, 15),
          reviewedCards: 10,
          correctAnswers: 12,
          incorrectAnswers: 0,
          duration: StudyDuration(const Duration(minutes: 15)),
        ),
        throwsArgumentError,
      );
    });

    test(
        'should throw ArgumentError when correct and incorrect answers sum exceeds reviewed cards count',
        () {
      expect(
        () => StudySession(
          id: 'session-invalid',
          mode: ReviewMode.review,
          startedAt: DateTime(2026, 7, 2, 10, 0),
          finishedAt: DateTime(2026, 7, 2, 10, 15),
          reviewedCards: 10,
          correctAnswers: 8,
          incorrectAnswers: 4,
          duration: StudyDuration(const Duration(minutes: 15)),
        ),
        throwsArgumentError,
      );
    });
  });
}
