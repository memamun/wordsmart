import 'package:flutter/material.dart';
import '../tokens/app_colors.dart';
import '../tokens/app_spacing.dart';

class WordSearchBar extends StatefulWidget {
  final ValueChanged<String> onChanged;
  final ValueChanged<String> onSubmitted;
  final VoidCallback? onBackTap;
  final String placeholder;
  final bool autofocus;

  const WordSearchBar({
    super.key,
    required this.onChanged,
    required this.onSubmitted,
    this.onBackTap,
    this.placeholder = 'Search GRE / SAT vocabulary...',
    this.autofocus = false,
  });

  @override
  State<WordSearchBar> createState() => _WordSearchBarState();
}

class _WordSearchBarState extends State<WordSearchBar> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _isFocused = false;
  bool _showClear = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_handleFocusChange);
    _controller.addListener(_handleTextChange);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_handleFocusChange);
    _controller.removeListener(_handleTextChange);
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _handleFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  void _handleTextChange() {
    setState(() {
      _showClear = _controller.text.isNotEmpty;
    });
    widget.onChanged(_controller.text);
  }

  void _clearSearch() {
    _controller.clear();
    _focusNode.requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusFull),
        border: Border.all(
          color: _isFocused
              ? AppColors.warning // Amber on focus
              : AppColors.divider,
          width: 1.2,
        ),
      ),
      child: Row(
        children: [
          if (widget.onBackTap != null)
            IconButton(
              icon: const Icon(
                Icons.arrow_back_rounded,
                color: AppColors.textSecondary,
              ),
              onPressed: widget.onBackTap,
            )
          else
            const Padding(
              padding: EdgeInsets.only(left: 16.0, right: 8.0),
              child: Icon(
                Icons.search_rounded,
                color: AppColors.textSecondary,
                size: 22,
              ),
            ),
          Expanded(
            child: TextField(
              controller: _controller,
              focusNode: _focusNode,
              autofocus: widget.autofocus,
              textInputAction: TextInputAction.search,
              onSubmitted: widget.onSubmitted,
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 16,
                color: AppColors.textPrimary,
              ),
              decoration: InputDecoration(
                hintText: widget.placeholder,
                hintStyle: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 15,
                  color: AppColors.textMuted, // muted hint
                ),
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
          if (_showClear)
            IconButton(
              icon: const Icon(
                Icons.close_rounded,
                color: AppColors.textSecondary,
                size: 20,
              ),
              onPressed: _clearSearch,
            )
          else
            const SizedBox(width: 16),
        ],
      ),
    );
  }
}
