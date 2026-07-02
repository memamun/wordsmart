import 'dart:math';
import 'package:flutter/material.dart';
import '../../../../core/learning/entities/learning_card.dart';

class ReviewFlashcard extends StatefulWidget {
  final LearningCard card;
  final bool isFront;
  final VoidCallback onTap;

  const ReviewFlashcard({
    Key? key,
    required this.card,
    required this.isFront,
    required this.onTap,
  }) : super(key: key);

  @override
  State<ReviewFlashcard> createState() => _ReviewFlashcardState();
}

class _ReviewFlashcardState extends State<ReviewFlashcard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutCubic),
    );
    if (!widget.isFront) {
      _controller.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(covariant ReviewFlashcard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isFront != oldWidget.isFront) {
      if (widget.isFront) {
        _controller.reverse();
      } else {
        _controller.forward();
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          final transformValue = _animation.value * pi;
          final isBack = transformValue >= pi / 2;

          return Transform(
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001)
              ..rotateY(transformValue),
            alignment: Alignment.center,
            child: isBack
                ? Transform(
                    transform: Matrix4.identity()..rotateY(pi),
                    alignment: Alignment.center,
                    child: _buildBackCard(),
                  )
                : _buildFrontCard(),
          );
        },
      ),
    );
  }

  Widget _buildFrontCard() {
    return Container(
      key: const ValueKey('front'),
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[850]!, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(28.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            widget.card.word.word.toUpperCase(),
            style: const TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -0.5,
            ),
          ),
          if (widget.card.word.pronunciation != null) ...[
            const SizedBox(height: 12),
            Text(
              "/${widget.card.word.pronunciation}/",
              style: TextStyle(
                fontSize: 18,
                fontStyle: FontStyle.italic,
                color: Colors.indigoAccent[100],
              ),
            ),
          ],
          if (widget.card.word.partOfSpeech != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.grey[850],
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                widget.card.word.partOfSpeech!.toLowerCase(),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[400],
                ),
              ),
            ),
          ],
          const SizedBox(height: 48),
          Text(
            "Tap to Reveal Definition",
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackCard() {
    return Container(
      key: const ValueKey('back'),
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[850]!, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      padding: const EdgeInsets.all(28.0),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.card.word.word.toUpperCase(),
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: Colors.white,
              ),
            ),
            const Divider(color: Colors.grey, height: 32),
            const Text(
              "DEFINITION",
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Colors.indigoAccent,
                letterSpacing: 1.0,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              widget.card.word.definition ?? "No definition available",
              style: const TextStyle(
                fontSize: 16,
                color: Colors.white,
                height: 1.4,
              ),
            ),
            if (widget.card.word.bengaliMeaning != null) ...[
              const SizedBox(height: 20),
              const Text(
                "BENGALI MEANING",
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Colors.purpleAccent,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                widget.card.word.bengaliMeaning!,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
            if (widget.card.word.mnemonic != null) ...[
              const SizedBox(height: 20),
              const Text(
                "MNEMONIC / MEMORY HELP",
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Colors.amberAccent,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                widget.card.word.mnemonic!,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[300],
                  fontStyle: FontStyle.italic,
                  height: 1.4,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
