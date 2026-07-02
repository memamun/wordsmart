import 'package:flutter/material.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_spacing.dart';

class PrimaryButton extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isFilled;
  final Color color;
  final bool isLoading;
  final bool isDisabled;
  final double? width;

  const PrimaryButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isFilled = true,
    this.color = AppColors.primary,
    this.isLoading = false,
    this.isDisabled = false,
    this.width,
  });

  @override
  State<PrimaryButton> createState() => _PrimaryButtonState();
}

class _PrimaryButtonState extends State<PrimaryButton> {
  double _scale = 1.0;

  void _onTapDown(TapDownDetails details) {
    if (widget.isDisabled || widget.isLoading) return;
    setState(() => _scale = 0.95);
  }

  void _onTapUp(TapUpDetails details) {
    if (widget.isDisabled || widget.isLoading) return;
    setState(() => _scale = 1.0);
    widget.onPressed();
  }

  void _onTapCancel() {
    if (widget.isDisabled || widget.isLoading) return;
    setState(() => _scale = 1.0);
  }

  @override
  Widget build(BuildContext context) {
    final effectiveColor = (widget.isDisabled || widget.isLoading)
        ? AppColors.disabled
        : widget.color;

    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      child: AnimatedScale(
        scale: _scale,
        duration: const Duration(milliseconds: 100),
        child: Container(
          width: widget.width,
          height: 48,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: widget.isFilled ? effectiveColor : Colors.transparent,
            borderRadius: BorderRadius.circular(AppSpacing.radiusXxl),
            border: widget.isFilled
                ? null
                : Border.all(
                    color: effectiveColor.withValues(alpha: 0.5),
                    width: 1.5,
                  ),
          ),
          child: widget.isLoading
              ? SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: widget.isFilled ? Colors.black : effectiveColor,
                  ),
                )
              : Text(
                  widget.text,
                  style: TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: widget.isFilled
                        ? (widget.isDisabled || widget.isLoading
                            ? Colors.white70
                            : Colors.black)
                        : effectiveColor,
                  ),
                ),
        ),
      ),
    );
  }
}
