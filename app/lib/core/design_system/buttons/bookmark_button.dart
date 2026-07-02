import 'package:flutter/material.dart';

class BookmarkButton extends StatefulWidget {
  final bool isBookmarked;
  final ValueChanged<bool> onToggle;

  const BookmarkButton({
    super.key,
    required this.isBookmarked,
    required this.onToggle,
  });

  @override
  State<BookmarkButton> createState() => _BookmarkButtonState();
}

class _BookmarkButtonState extends State<BookmarkButton> {
  double _scale = 1.0;

  void _onTapDown(TapDownDetails details) {
    setState(() => _scale = 0.85);
  }

  void _onTapUp(TapUpDetails details) {
    setState(() => _scale = 1.0);
    widget.onToggle(!widget.isBookmarked);
  }

  void _onTapCancel() {
    setState(() => _scale = 1.0);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      child: AnimatedScale(
        scale: _scale,
        duration: const Duration(milliseconds: 100),
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.04),
            shape: BoxShape.circle,
          ),
          child: Icon(
            widget.isBookmarked ? Icons.star_rounded : Icons.star_outline_rounded,
            color: widget.isBookmarked ? const Color(0xFFFFB900) : const Color(0xFF888888),
            size: 24,
            shadows: widget.isBookmarked
                ? [
                    const Shadow(
                      color: Color(0x4DFFB900),
                      blurRadius: 8,
                    )
                  ]
                : null,
          ),
        ),
      ),
    );
  }
}
