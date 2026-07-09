import 'package:flutter/material.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import 'word_details_page.dart';

class SwipeableWordDetailsPage extends StatefulWidget {
  final List<int> wordIds;
  final int initialIndex;

  const SwipeableWordDetailsPage({
    super.key,
    required this.wordIds,
    required this.initialIndex,
  });

  @override
  State<SwipeableWordDetailsPage> createState() =>
      _SwipeableWordDetailsPageState();
}

class _SwipeableWordDetailsPageState extends State<SwipeableWordDetailsPage> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _goToPrevious() {
    if (_currentIndex > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _goToNext() {
    if (_currentIndex < widget.wordIds.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.wordIds.length;
    final canGoBack = _currentIndex > 0;
    final canGoForward = _currentIndex < total - 1;

    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        leading: canGoBack
            ? IconButton(
                icon: const Icon(Icons.chevron_left_rounded),
                onPressed: _goToPrevious,
              )
            : null,
        title: Text(
          'Word ${_currentIndex + 1} of $total',
          style: const TextStyle(
            fontFamily: 'Outfit',
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
        centerTitle: true,
        actions: [
          if (canGoForward)
            IconButton(
              icon: const Icon(Icons.chevron_right_rounded),
              onPressed: _goToNext,
            ),
        ],
        backgroundColor: AppColors.canvas,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: PageView.builder(
        controller: _pageController,
        itemCount: total,
        pageSnapping: true,
        onPageChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        itemBuilder: (context, index) {
          return WordDetailsPage(wordId: widget.wordIds[index]);
        },
      ),
    );
  }
}
