import 'package:flutter/material.dart';

class AudioButton extends StatefulWidget {
  final VoidCallback onPressed;

  const AudioButton({super.key, required this.onPressed});

  @override
  State<AudioButton> createState() => _AudioButtonState();
}

class _AudioButtonState extends State<AudioButton> {
  double _scale = 1.0;

  void _onTapDown(TapDownDetails details) {
    setState(() => _scale = 0.90);
  }

  void _onTapUp(TapUpDetails details) {
    setState(() => _scale = 1.0);
    widget.onPressed();
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
        duration: const Duration(milliseconds: 80),
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: const Color(0xFF26A69A).withOpacity(0.08),
            shape: BoxShape.circle,
            border: Border.all(
              color: const Color(0xFF26A69A).withOpacity(0.15),
              width: 1,
            ),
          ),
          child: const Icon(
            Icons.volume_up_rounded,
            color: Color(0xFF26A69A),
            size: 20,
          ),
        ),
      ),
    );
  }
}
