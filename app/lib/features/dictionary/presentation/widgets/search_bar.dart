import 'package:flutter/material.dart';

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
        color: const Color(0xFF1E1E1E), // Level 1 surface
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: _isFocused
              ? const Color(0xFFFFB900) // Amber on focus
              : Colors.white.withOpacity(0.08),
          width: 1.2,
        ),
      ),
      child: Row(
        children: [
          if (widget.onBackTap != null)
            IconButton(
              icon: const Icon(
                Icons.arrow_back_rounded,
                color: Color(0xFFB0B0B0),
              ),
              onPressed: widget.onBackTap,
            )
          else
            const Padding(
              padding: EdgeInsets.only(left: 16.0, right: 8.0),
              child: Icon(
                Icons.search_rounded,
                color: Color(0xFFB0B0B0),
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
                color: Color(0xFFF5F5F5), // off-white
              ),
              decoration: InputDecoration(
                hintText: widget.placeholder,
                hintStyle: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 15,
                  color: Color(0xFF888888), // muted hint
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
                color: Color(0xFFB0B0B0),
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
