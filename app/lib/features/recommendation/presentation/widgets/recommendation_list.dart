import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../actions/recommendation_action_mapper.dart';
import '../providers/recommendation_notifier.dart';
import 'recommendation_card.dart';

class RecommendationList extends ConsumerWidget {
  const RecommendationList({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(recommendationProvider);

    if (state is RecommendationLoading) {
      return const SizedBox(
        height: 120,
        child: Center(child: CircularProgressIndicator(color: AppColors.teal)),
      );
    }

    if (state is RecommendationEmpty || state is RecommendationFailure) {
      return const SizedBox.shrink();
    }

    if (state is RecommendationLoaded) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 8, 16, 4),
            child: Text(
              'Recommended for you',
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          ...state.recommendations.map(
            (r) => RecommendationCard(
              recommendation: r,
              onAction: () {
                final mapper = RecommendationActionMapper(context: context);
                mapper.execute(r);
                ref.read(recommendationProvider.notifier).complete(r.id);
              },
              onDismiss: () {
                ref.read(recommendationProvider.notifier).dismiss(r.id);
              },
            ),
          ),
        ],
      );
    }

    return const SizedBox.shrink();
  }
}
