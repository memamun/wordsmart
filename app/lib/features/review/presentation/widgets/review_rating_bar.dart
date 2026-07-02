import 'package:flutter/material.dart';
import '../../../../core/design_system/buttons/primary_button.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../../../core/design_system/tokens/app_spacing.dart';

class ReviewRatingBar extends StatelessWidget {
  final Function(bool isCorrect) onRatingSelected;
  final bool isSubmitting;

  const ReviewRatingBar({
    super.key,
    required this.onRatingSelected,
    required this.isSubmitting,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildRatingButton(
          label: "Again",
          color: AppColors.error,
          onTap: () => onRatingSelected(false),
        ),
        _buildRatingButton(
          label: "Hard",
          color: AppColors.warning,
          onTap: () => onRatingSelected(true),
        ),
        _buildRatingButton(
          label: "Good",
          color: AppColors.primary,
          onTap: () => onRatingSelected(true),
        ),
        _buildRatingButton(
          label: "Easy",
          color: AppColors.success,
          onTap: () => onRatingSelected(true),
        ),
      ],
    );
  }

  Widget _buildRatingButton({
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
        child: PrimaryButton(
          text: label,
          onPressed: onTap,
          isFilled: false,
          color: color,
          isLoading: isSubmitting,
        ),
      ),
    );
  }
}
