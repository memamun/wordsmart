import 'package:flutter/material.dart';
import '../../../../../core/design_system/buttons/primary_button.dart';
import '../../../../../core/design_system/tokens/app_colors.dart';
import '../../../../../core/design_system/tokens/app_spacing.dart';

class NextActionCard extends StatelessWidget {
  final int dueCount;
  final VoidCallback onActionPressed;

  const NextActionCard({
    Key? key,
    required this.dueCount,
    required this.onActionPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final bool hasDue = dueCount > 0;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
        border: Border.all(color: AppColors.divider),
      ),
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: (hasDue ? AppColors.primary : AppColors.success)
                  .withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              hasDue ? Icons.alarm : Icons.done_all,
              color: hasDue ? AppColors.primary : AppColors.success,
              size: 28,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  hasDue ? "Reviews Ready" : "Up to Date",
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  hasDue
                      ? "You have $dueCount words due for review."
                      : "Awesome! You have no pending reviews.",
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          PrimaryButton(
            width: 100,
            text: hasDue ? "Review" : "Explore",
            onPressed: onActionPressed,
            color: hasDue ? AppColors.primary : AppColors.surfaceHigh,
          ),
        ],
      ),
    );
  }
}
