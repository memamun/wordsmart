import 'package:flutter/material';
import 'package:flutter_test/flutter_test.dart';
import '../../../../../lib/features/practice/domain/entities/practice_summary.dart';
import '../../../../../lib/features/practice/presentation/screens/practice_summary_page.dart';

void main() {
  group('PracticeSummaryPage Widget Tests', () {
    testWidgets('should render accuracy, metrics grid, and action buttons', (tester) async {
      const summary = PracticeSummary(
        sessionId: 's1',
        totalQuestions: 10,
        correctAnswers: 7,
        incorrectAnswers: 3,
        accuracy: 70.0,
        totalDuration: Duration(minutes: 2, seconds: 30),
      );

      await tester.pumpWidget(
        const MaterialApp(home: PracticeSummaryPage(summary: summary)),
      );

      // Verify title
      expect(find.text('Session Complete'), findsOneWidget);

      // Verify score
      expect(find.text('70%'), findsOneWidget);
      expect(find.text('Accuracy (7 of 10 correct)'), findsOneWidget);

      // Verify metrics
      expect(find.text('2m 30s'), findsOneWidget);
      expect(find.text('10'), findsOneWidget);
      expect(find.text('7'), findsOneWidget);
      expect(find.text('3'), findsOneWidget);

      // Verify buttons
      expect(find.byKey(const Key('practice_again_button')), findsOneWidget);
      expect(find.byKey(const Key('back_home_button')), findsOneWidget);
    });
  });
}
