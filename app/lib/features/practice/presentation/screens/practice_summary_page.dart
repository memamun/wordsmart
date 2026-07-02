import 'package:flutter/material';
import '../../domain/entities/practice_summary.dart';
import '../widgets/summary_score_card.dart';

class PracticeSummaryPage extends StatelessWidget {
  final PracticeSummary summary;

  const PracticeSummaryPage({super.key, required this.summary});

  @override
  Widget build(BuildContext context) {
    final minutes = summary.totalDuration.inMinutes;
    final seconds = summary.totalDuration.inSeconds % 60;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 32),

              // Title
              const Text(
                'Session Complete',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.black),
              ),
              const SizedBox(height: 32),

              // Score Card
              SummaryScoreCard(
                accuracy: summary.accuracy,
                correctAnswers: summary.correctAnswers,
                totalQuestions: summary.totalQuestions,
              ),
              const SizedBox(height: 24),

              // Metrics Grid
              Row(
                children: [
                  Expanded(
                    child: _metricTile(
                      icon: Icons.timer_outlined,
                      label: 'Duration',
                      value: '${minutes}m ${seconds}s',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _metricTile(
                      icon: Icons.quiz_outlined,
                      label: 'Questions',
                      value: '${summary.totalQuestions}',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _metricTile(
                      icon: Icons.check_circle_outline,
                      label: 'Correct',
                      value: '${summary.correctAnswers}',
                      valueColor: Colors.green,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _metricTile(
                      icon: Icons.cancel_outlined,
                      label: 'Incorrect',
                      value: '${summary.incorrectAnswers}',
                      valueColor: Colors.red,
                    ),
                  ),
                ],
              ),
              const Spacer(),

              // Action buttons
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  key: const Key('practice_again_button'),
                  onPressed: () => Navigator.of(context).pop(),
                  style: ElevatedButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Practice Again', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: OutlinedButton(
                  key: const Key('back_home_button'),
                  onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                  style: OutlinedButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Back to Home', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _metricTile({
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: [
          Icon(icon, color: Colors.grey[500], size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: valueColor),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}
