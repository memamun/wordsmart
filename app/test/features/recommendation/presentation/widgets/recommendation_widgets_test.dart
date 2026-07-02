import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:wordsmart/features/recommendation/domain/entities/recommendation.dart';
import 'package:wordsmart/features/recommendation/presentation/providers/recommendation_notifier.dart';
import 'package:wordsmart/features/recommendation/presentation/widgets/recommendation_card.dart';
import 'package:wordsmart/features/recommendation/presentation/widgets/recommendation_list.dart';

class MockRecommendationNotifier extends StateNotifier<RecommendationState>
    implements RecommendationNotifier {
  MockRecommendationNotifier(super.state);

  @override
  Future<void> load() async {}

  @override
  Future<void> refresh() async {}

  @override
  Future<void> dismiss(String id) async {
    state = const RecommendationEmpty();
  }

  @override
  Future<void> complete(String id) async {
    state = const RecommendationEmpty();
  }
}

Widget buildTestWidget(RecommendationState state) {
  return ProviderScope(
    overrides: [
      recommendationProvider.overrideWith((ref) => MockRecommendationNotifier(state)),
    ],
    child: const MaterialApp(
      home: Scaffold(
        body: RecommendationList(),
      ),
    ),
  );
}

void main() {
  group('RecommendationCard', () {
    testWidgets('should render title and subtitle', (tester) async {
      const recommendation = Recommendation(
        id: 'test-1',
        type: RecommendationType.dueReview,
        title: 'Review overdue words',
        subtitle: '3 days overdue',
        reason: 'Spaced repetition',
        actionLabel: 'Review',
        priority: 8,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: RecommendationCard(
              recommendation: recommendation,
              onAction: () {},
              onDismiss: () {},
            ),
          ),
        ),
      );

      expect(find.text('Review overdue words'), findsOneWidget);
      expect(find.text('3 days overdue'), findsOneWidget);
      expect(find.text('Review'), findsOneWidget);
    });

    testWidgets('should call onAction when action button tapped', (tester) async {
      bool actionCalled = false;
      const recommendation = Recommendation(
        id: 'test-1',
        type: RecommendationType.dueReview,
        title: 'Review overdue words',
        subtitle: '3 days overdue',
        reason: 'Spaced repetition',
        actionLabel: 'Review',
        priority: 8,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: RecommendationCard(
              recommendation: recommendation,
              onAction: () => actionCalled = true,
              onDismiss: () {},
            ),
          ),
        ),
      );

      await tester.tap(find.text('Review'));
      expect(actionCalled, true);
    });
  });

  group('RecommendationList', () {
    testWidgets('should show loading state', (tester) async {
      await tester.pumpWidget(buildTestWidget(const RecommendationLoading()));
      await tester.pump();

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('should show nothing when empty', (tester) async {
      await tester.pumpWidget(buildTestWidget(const RecommendationEmpty()));
      await tester.pump();

      expect(find.byType(SizedBox), findsWidgets);
      expect(find.byType(RecommendationCard), findsNothing);
    });

    testWidgets('should render recommendations when loaded', (tester) async {
      const recommendations = [
        Recommendation(
          id: 'test-1',
          type: RecommendationType.dueReview,
          title: 'Review overdue words',
          subtitle: '3 days overdue',
          reason: 'Spaced repetition',
          actionLabel: 'Review',
          priority: 8,
        ),
        Recommendation(
          id: 'test-2',
          type: RecommendationType.continueStory,
          title: 'Continue reading',
          subtitle: '50% complete',
          reason: 'Incomplete session',
          actionLabel: 'Read',
          priority: 6,
        ),
      ];

      await tester.pumpWidget(
        buildTestWidget(const RecommendationLoaded(recommendations: recommendations)),
      );
      await tester.pump();

      expect(find.text('Recommended for you'), findsOneWidget);
      expect(find.byType(RecommendationCard), findsNWidgets(2));
      expect(find.text('Review overdue words'), findsOneWidget);
      expect(find.text('Continue reading'), findsOneWidget);
    });

    testWidgets('should show nothing on failure', (tester) async {
      await tester.pumpWidget(
        buildTestWidget(const RecommendationFailure(message: 'Error')),
      );
      await tester.pump();

      expect(find.byType(RecommendationCard), findsNothing);
    });
  });
}
