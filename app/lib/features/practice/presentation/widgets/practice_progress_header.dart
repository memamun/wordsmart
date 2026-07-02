import 'package:flutter/material.dart';

class PracticeProgressHeader extends StatelessWidget {
  final int currentIndex;
  final int totalQuestions;
  final VoidCallback onClose;

  const PracticeProgressHeader({
    super.key,
    required this.currentIndex,
    required this.totalQuestions,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    final progress = totalQuestions > 0 ? (currentIndex) / totalQuestions : 0.0;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                key: const Key('exit_practice_button'),
                icon: const Icon(Icons.close),
                onPressed: onClose,
              ),
              Text(
                'Question ${currentIndex + 1} of $totalQuestions',
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(width: 48),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.grey[300],
              valueColor:
                  AlwaysStoppedAnimation<Color>(Theme.of(context).primaryColor),
              minHeight: 6,
            ),
          ),
        ],
      ),
    );
  }
}
