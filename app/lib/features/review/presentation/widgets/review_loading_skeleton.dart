import 'package:flutter/material.dart';
import '../../../../core/design_system/states/loading_skeleton.dart';

class ReviewLoadingSkeleton extends StatelessWidget {
  const ReviewLoadingSkeleton({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Skeleton progress header
            const LoadingSkeleton(
              height: 20,
              width: double.infinity,
              borderRadius: 10,
            ),
            const SizedBox(height: 48),
            // Large Skeleton Card
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1E1E), // AppColors.surface
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0x14FFFFFF)), // AppColors.divider
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const LoadingSkeleton(
                        width: 150,
                        height: 32,
                        borderRadius: 8,
                      ),
                      const SizedBox(height: 16),
                      const LoadingSkeleton(
                        width: 100,
                        height: 16,
                        borderRadius: 4,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 48),
            // Skeleton rating buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(
                4,
                (index) => const LoadingSkeleton(
                  width: 70,
                  height: 48,
                  borderRadius: 12,
                ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
