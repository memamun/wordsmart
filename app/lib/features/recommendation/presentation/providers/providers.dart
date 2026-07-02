import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/di/injection.dart';
import '../../domain/usecases/get_recommendations.dart';
import '../../domain/usecases/dismiss_recommendation.dart';
import '../../domain/usecases/complete_recommendation.dart';
import 'recommendation_notifier.dart';

final getRecommendationsUseCaseProvider = Provider<GetRecommendationsUseCase>((ref) {
  return sl();
});

final dismissRecommendationUseCaseProvider = Provider<DismissRecommendationUseCase>((ref) {
  return sl();
});

final completeRecommendationUseCaseProvider = Provider<CompleteRecommendationUseCase>((ref) {
  return sl();
});

final recommendationProvider = StateNotifierProvider<RecommendationNotifier, RecommendationState>((ref) {
  return RecommendationNotifier(
    getRecommendationsUseCase: ref.watch(getRecommendationsUseCaseProvider),
    dismissRecommendationUseCase: ref.watch(dismissRecommendationUseCaseProvider),
    completeRecommendationUseCase: ref.watch(completeRecommendationUseCaseProvider),
  );
});
