import 'package:flutter/material.dart';
import '../../../../core/design_system/tokens/app_colors.dart';

class McqOptionTile extends StatelessWidget {
  final String optionText;
  final bool isSelected;
  final bool isCorrect;
  final bool isFeedbackMode;
  final VoidCallback onTap;

  const McqOptionTile({
    super.key,
    required this.optionText,
    required this.isSelected,
    required this.isCorrect,
    required this.isFeedbackMode,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color cardColor = AppColors.surface;
    Color borderColor = AppColors.divider;
    Widget? trailing;

    if (isFeedbackMode) {
      if (isCorrect) {
        cardColor = AppColors.success.withValues(alpha: 0.12);
        borderColor = AppColors.success;
        trailing = const Icon(Icons.check_circle, color: AppColors.success);
      } else if (isSelected) {
        cardColor = AppColors.error.withValues(alpha: 0.12);
        borderColor = AppColors.error;
        trailing = const Icon(Icons.cancel, color: AppColors.error);
      }
    } else if (isSelected) {
      cardColor = AppColors.primary.withValues(alpha: 0.08);
      borderColor = AppColors.primary;
    }

    String semanticLabel = optionText;
    if (isFeedbackMode) {
      if (isCorrect) {
        semanticLabel = "$optionText, correct answer";
      } else if (isSelected) {
        semanticLabel = "$optionText, incorrect selection";
      }
    } else if (isSelected) {
      semanticLabel = "$optionText, selected";
    }

    return Semantics(
      label: semanticLabel,
      button: true,
      selected: isSelected,
      child: InkWell(
        onTap: isFeedbackMode ? null : onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          constraints: const BoxConstraints(minHeight: 56),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: cardColor,
            border: Border.all(color: borderColor, width: 2),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  optionText,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              if (trailing != null) trailing,
            ],
          ),
        ),
      ),
    );
  }
}
