import 'package:flutter/material.dart';

class SummaryScoreCard extends StatelessWidget {
  final double accuracy;
  final int correctAnswers;
  final int totalQuestions;

  const SummaryScoreCard({
    super.key,
    required this.accuracy,
    required this.correctAnswers,
    required this.totalQuestions,
  });

  @override
  Widget build(BuildContext context) {
    final isGood = accuracy >= 80;
    final color = isGood ? Colors.green : Colors.orange;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.2), width: 2),
      ),
      child: Column(
        children: [
          Text(
            isGood ? 'Great Job! 🎉' : 'Keep Practicing! 👍',
            style: TextStyle(
                fontSize: 20, fontWeight: FontWeight.bold, color: color),
          ),
          const SizedBox(height: 16),
          Text(
            '${accuracy.toStringAsFixed(0)}%',
            style: TextStyle(
                fontSize: 48, fontWeight: FontWeight.w900, color: color),
          ),
          const SizedBox(height: 8),
          Text(
            'Accuracy ($correctAnswers of $totalQuestions correct)',
            style: const TextStyle(
                fontSize: 14, color: Colors.grey, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
