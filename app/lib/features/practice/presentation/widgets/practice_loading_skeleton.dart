import 'package:flutter/material.dart';
import '../../../../core/design_system/states/loading_skeleton.dart';

class PracticeLoadingSkeleton extends StatelessWidget {
  const PracticeLoadingSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          // Skeleton Bar for Header
          const LoadingSkeleton(
            height: 24,
            width: 150,
            borderRadius: 4,
          ),
          const SizedBox(height: 24),
          // Skeleton card for Question
          const LoadingSkeleton(
            height: 120,
            width: double.infinity,
            borderRadius: 16,
          ),
          const SizedBox(height: 32),
          // MCQ options skeletons
          for (int i = 0; i < 4; i++) ...[
            const LoadingSkeleton(
              height: 56,
              width: double.infinity,
              borderRadius: 12,
            ),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }
}
