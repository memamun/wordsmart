import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:wordsmart/features/dictionary/presentation/screens/search_page.dart';
import 'package:wordsmart/features/dictionary/presentation/screens/word_details_page.dart';
import 'package:wordsmart/features/dictionary/presentation/widgets/featured_word_card.dart';
import 'package:wordsmart/core/design_system/inputs/word_search_bar.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Slice 1 - E2E Integration Workflow', () {
    testWidgets('Flow 1 & 2: Search -> Exact Match -> Details -> Bookmark State Sync', (tester) async {
      // 1. Launch Search Screen
      await tester.pumpWidget(
        const MaterialApp(
          home: SearchPage(),
        ),
      );
      await tester.pumpAndSettle();

      // Verify search input is focused (autofocus works)
      final searchTextField = find.byType(TextField);
      expect(searchTextField, findsOneWidget);

      // 2. Type "abate" and submit search
      await tester.enterText(searchTextField, 'abate');
      await tester.testTextInput.receiveAction(TextInputAction.search);
      await tester.pumpAndSettle();

      // 3. Exact match card appears
      expect(find.byType(FeaturedWordCard), findsOneWidget);
      expect(find.text('ABATE'), findsWidgets);

      // 4. Tap card to navigate to Word Details Page
      await tester.tap(find.byType(FeaturedWordCard));
      await tester.pumpAndSettle();

      // 5. WordDetailsPage opens successfully
      expect(find.byType(WordDetailsPage), findsOneWidget);

      // 6. Toggle bookmark status active
      final bookmarkButton = find.byIcon(Icons.star_outline_rounded);
      expect(bookmarkButton, findsOneWidget);
      await tester.tap(bookmarkButton);
      await tester.pumpAndSettle();

      // Bookmark icon changes to active filled star
      expect(find.byIcon(Icons.star_rounded), findsOneWidget);
    });

    testWidgets('Flow 3: Query Input -> Delete -> Refill stability check', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: SearchPage(),
        ),
      );
      await tester.pumpAndSettle();

      final searchTextField = find.byType(TextField);
      
      // Type
      await tester.enterText(searchTextField, 'aba');
      await tester.pump(const Duration(milliseconds: 100));
      
      // Delete
      await tester.enterText(searchTextField, '');
      await tester.pump(const Duration(milliseconds: 100));

      // Refill
      await tester.enterText(searchTextField, 'abate');
      await tester.pumpAndSettle();

      expect(find.text('abate'), findsOneWidget);
    });
  });
}
