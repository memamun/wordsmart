import 'package:flutter/material.dart';
import '../../../../core/navigation/app_navigator.dart';
import '../../domain/entities/recommendation.dart';

class RecommendationActionMapper {
  final BuildContext context;

  const RecommendationActionMapper({required this.context});

  void execute(Recommendation recommendation) {
    switch (recommendation.type) {
      case RecommendationType.dueReview:
        AppNavigator.pushReviewSession(context);
        break;
      case RecommendationType.continueStory:
        final storyId = recommendation.metadata['storyId'] as int? ?? 1;
        AppNavigator.pushStoryReader(context, storyId: storyId);
        break;
      case RecommendationType.weakWord:
      case RecommendationType.practiceSession:
        // Practice session page doesn't have a push method yet
        // For now, navigate to review as fallback
        AppNavigator.pushReviewSession(context);
        break;
      case RecommendationType.dailyGoal:
        AppNavigator.pushReviewSession(context);
        break;
    }
  }
}
