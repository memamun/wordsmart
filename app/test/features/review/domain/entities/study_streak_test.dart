import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';

void main() {
  group('StudyStreak Invariants & Operations', () {
    test('should construct a valid StudyStreak', () {
      final streak = StudyStreak(
        current: 3,
        longest: 5,
        lastStudyDate: DateTime(2026, 7, 1),
      );

      expect(streak.current, 3);
      expect(streak.longest, 5);
      expect(streak.lastStudyDate, DateTime(2026, 7, 1));
    });

    test('should throw ArgumentError when current exceeds longest streak', () {
      expect(
        () => StudyStreak(
          current: 6,
          longest: 5,
          lastStudyDate: DateTime(2026, 7, 1),
        ),
        throwsArgumentError,
      );
    });

    test(
        'should increment streak when next study date is exactly one day later',
        () {
      final streak = StudyStreak(
        current: 3,
        longest: 5,
        lastStudyDate: DateTime(2026, 7, 1),
      );

      final updated = streak.increment(DateTime(2026, 7, 2));

      expect(updated.current, 4);
      expect(updated.longest, 5);
      expect(updated.lastStudyDate, DateTime(2026, 7, 2));
    });

    test(
        'should increment streak and update longest streak when new current exceeds longest',
        () {
      final streak = StudyStreak(
        current: 5,
        longest: 5,
        lastStudyDate: DateTime(2026, 7, 1),
      );

      final updated = streak.increment(DateTime(2026, 7, 2));

      expect(updated.current, 6);
      expect(updated.longest, 6);
    });

    test('should reset current streak to 1 when a gap of study days occurs',
        () {
      final streak = StudyStreak(
        current: 3,
        longest: 5,
        lastStudyDate: DateTime(2026, 7, 1),
      );

      // Studied on July 5 (gap of 4 days)
      final updated = streak.increment(DateTime(2026, 7, 5));

      expect(updated.current, 1);
      expect(updated.longest, 5); // preserves longest
      expect(updated.lastStudyDate, DateTime(2026, 7, 5));
    });

    test(
        'should keep streak unchanged when studying multiple times on the same day',
        () {
      final streak = StudyStreak(
        current: 3,
        longest: 5,
        lastStudyDate: DateTime(2026, 7, 1, 10, 0),
      );

      final updated = streak.increment(DateTime(2026, 7, 1, 14, 0));

      expect(updated.current, 3);
      expect(updated.longest, 5);
    });
  });
}
