import 'package:flutter/material.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../../../core/design_system/tokens/app_spacing.dart';
import '../../../../core/design_system/buttons/primary_button.dart';

class SessionFooter extends StatelessWidget {
  final String buttonText;
  final bool isButtonEnabled;
  final bool isSubmitting;
  final VoidCallback onPressed;

  const SessionFooter({
    super.key,
    required this.buttonText,
    required this.isButtonEnabled,
    required this.isSubmitting,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.md,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.divider)),
      ),
      child: SafeArea(
        child: SizedBox(
          width: double.infinity,
          child: PrimaryButton(
            key: const Key('session_footer_button'),
            text: buttonText,
            onPressed: onPressed,
            isLoading: isSubmitting,
            isDisabled: !isButtonEnabled,
          ),
        ),
      ),
    );
  }
}
