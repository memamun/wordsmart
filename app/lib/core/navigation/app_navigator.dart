import 'package:flutter/material.dart';
import '../../features/dictionary/presentation/screens/hit_parades_page.dart';
import '../../features/dictionary/presentation/screens/specialized_vocab_page.dart';
import '../../features/dictionary/presentation/screens/word_details_page.dart';
import '../../features/practice/presentation/screens/quizzes_list_page.dart';
import '../../features/review/presentation/screens/review_session_page.dart';
import '../../features/stories/presentation/screens/story_reader_page.dart';

class AppNavigator {
  static Future<void> pushQuizzesList(BuildContext context) {
    return Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const QuizzesListPage()),
    );
  }

  static Future<void> pushWordDetails(BuildContext context, int wordId) {
    return Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WordDetailsPage(wordId: wordId),
      ),
    );
  }

  static Future<void> pushReviewSession(BuildContext context) {
    return Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ReviewSessionPage()),
    );
  }

  static Future<void> pushStoryReader(BuildContext context, {int storyId = 1}) {
    return Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StoryReaderPage(storyId: storyId),
      ),
    );
  }

  static Future<void> pushHitParades(BuildContext context) {
    return Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const HitParadesPage()),
    );
  }

  static Future<void> pushSpecializedVocab(BuildContext context) {
    return Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const SpecializedVocabPage()),
    );
  }

  static void pop(BuildContext context) {
    Navigator.pop(context);
  }

  static void popToHome(BuildContext context) {
    Navigator.popUntil(context, (route) => route.isFirst);
  }

  static void maybePop(BuildContext context) {
    Navigator.maybePop(context);
  }
}
