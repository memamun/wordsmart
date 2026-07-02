import 'package:flutter/material.dart';
import '../../../../core/design_system/tokens/app_colors.dart';

class ReadingProgressBar extends StatelessWidget {
  final double percent;

  const ReadingProgressBar({super.key, required this.percent});

  @override
  Widget build(BuildContext context) {
    final normalized = (percent / 100).clamp(0.0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${percent.round()}% complete',
          style: const TextStyle(
            fontFamily: 'Inter',
            fontSize: 12,
            color: AppColors.textMuted,
          ),
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(99),
          child: LinearProgressIndicator(
            value: normalized,
            minHeight: 8,
            backgroundColor: AppColors.surfaceHigh,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.teal),
          ),
        ),
      ],
    );
  }
}
