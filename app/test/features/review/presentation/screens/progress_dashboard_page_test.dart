import 'package:dartz/dartz.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/core/error/failures.dart';
import '../../../../../lib/features/review/domain/entities/learning_metrics.dart';
import '../../../../../lib/features/review/domain/entities/value_objects.dart';
import '../../../../../lib/features/review/domain/usecases/get_learning_metrics.dart';
import '../../../../../lib/features/review/presentation/providers/providers.dart';
import '../../../../../lib/features/review/presentation/screens/progress_dashboard_page.dart';

class MockGetLearningMetricsUseCase implements GetLearningMetricsUseCase {
  Either<Failure, LearningMetrics>? result;
  @override
  late final repository = throw UnimplementedError();

  @override
  Future<Either<Failure, LearningMetrics>> call({required DateTime now}) async {
    return result ?? const Left(DatabaseFailure('Error'));
  }
}

void main() {
  testWidgets(
      'should render progress dashboard elements when loaded successfully',
      (WidgetTester tester) async {
    final mockUseCase = MockGetLearningMetricsUseCase();
    final metrics = LearningMetrics(
      streak: StudyStreak(current: 3, longest: 7),
      masteredWords: 15,
      learningWords: 5,
      reviewingWords: 10,
      dueToday: 4,
      studyMinutesToday: 8,
      sessionsToday: 2,
      accuracy: Accuracy(88.0),
      retentionRate: RetentionRate(90.0),
    );
    mockUseCase.result = Right(metrics);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          progressProvider.overrideWith((ref) => ProgressNotifier(
                getLearningMetricsUseCase: mockUseCase,
              )),
        ],
        child: const MaterialApp(
          home: ProgressDashboardPage(),
        ),
      ),
    );

    // Initial trigger and pump state to Loaded
    await tester.pumpAndSettle();

    // Check specific dashboard cards exist
    expect(find.text("Progress & Analytics"), findsOneWidget);
    expect(find.text("15 Words Mastered"), findsOneWidget);
    expect(find.text("Daily Study Goal"), findsOneWidget);
  });
}
