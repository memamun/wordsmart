import 'package:flutter/material';

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
          Container(
            height: 24,
            width: 150,
            decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(4)),
          ),
          const SizedBox(height: 24),
          // Skeleton card for Question
          Container(
            height: 120,
            width: double.infinity,
            decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(16)),
          ),
          const SizedBox(height: 32),
          // MCQ options skeletons
          for (int i = 0; i < 4; i++) ...[
            Container(
              height: 56,
              width: double.infinity,
              decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(12)),
            ),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }
}
