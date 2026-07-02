import 'package:flutter/material.dart';
import '../../features/dictionary/presentation/screens/word_details_page.dart';
import '../../features/review/presentation/screens/review_session_page.dart';
import '../../features/stories/presentation/screens/story_reader_page.dart';

class AppNavigator {
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
