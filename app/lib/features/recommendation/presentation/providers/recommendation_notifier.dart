import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/recommendation.dart';
import '../../domain/usecases/get_recommendations.dart';
import '../../domain/usecases/dismiss_recommendation.dart';
import '../../domain/usecases/complete_recommendation.dart';

abstract class RecommendationState {
  const RecommendationState();
}

class RecommendationInitial extends RecommendationState {
  const RecommendationInitial();
}

class RecommendationLoading extends RecommendationState {
  const RecommendationLoading();
}

class RecommendationLoaded extends RecommendationState {
  final List<Recommendation> recommendations;

  const RecommendationLoaded({required this.recommendations});
}

class RecommendationEmpty extends RecommendationState {
  const RecommendationEmpty();
}

class RecommendationFailure extends RecommendationState {
  final String message;

  const RecommendationFailure({required this.message});
}

class RecommendationNotifier extends StateNotifier<RecommendationState> {
  final GetRecommendationsUseCase getRecommendationsUseCase;
  final DismissRecommendationUseCase dismissRecommendationUseCase;
  final CompleteRecommendationUseCase completeRecommendationUseCase;

  RecommendationNotifier({
    required this.getRecommendationsUseCase,
    required this.dismissRecommendationUseCase,
    required this.completeRecommendationUseCase,
  }) : super(const RecommendationInitial());

  Future<void> load() async {
    if (state is RecommendationLoaded) return;
    await _fetch();
  }

  Future<void> refresh() async {
    await _fetch();
  }

  Future<void> dismiss(String id) async {
    await dismissRecommendationUseCase(id);
    await _fetch();
  }

  Future<void> complete(String id) async {
    await completeRecommendationUseCase(id);
    await _fetch();
  }

  Future<void> _fetch() async {
    state = const RecommendationLoading();
    final result = await getRecommendationsUseCase();
    result.fold(
      (failure) => state = RecommendationFailure(message: failure.message),
      (recommendations) {
        if (recommendations.isEmpty) {
          state = const RecommendationEmpty();
        } else {
          state = RecommendationLoaded(recommendations: recommendations);
        }
      },
    );
  }
}
