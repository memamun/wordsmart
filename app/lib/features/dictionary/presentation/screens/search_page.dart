import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/search_notifier.dart';
import '../../../../core/design_system/states/empty_state.dart';
import '../widgets/featured_word_card.dart';
import '../../../../core/design_system/states/loading_skeleton.dart';
import '../../../../core/design_system/inputs/word_search_bar.dart';
import '../../../../core/design_system/typography/section_header.dart';
import '../widgets/word_list_tile.dart';
import 'word_details_page.dart';

class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  Timer? _debounceTimer;
  List<String> _suggestions = [];
  bool _isSearching = false;
  bool _submitted = false;

  void _onSearchChanged(String query) {
    _debounceTimer?.cancel();
    if (query.trim().isEmpty) {
      setState(() {
        _suggestions = [];
        _submitted = false;
      });
      return;
    }

    _debounceTimer = Timer(const Duration(milliseconds: 300), () async {
      if (!mounted) return;
      
      // Fetch suggestions for autocomplete state
      if (!_submitted) {
        final notifier = ref.read(searchNotifierProvider.notifier);
        final suggestions = await notifier.getSuggestions(query);
        setState(() {
          _suggestions = suggestions;
        });
      }
    });
  }

  void _onSearchSubmitted(String query) {
    _debounceTimer?.cancel();
    setState(() {
      _submitted = true;
      _suggestions = [];
    });
    ref.read(searchNotifierProvider.notifier).search(query);
  }

  void _navigateToWordDetails(int wordId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WordDetailsPage(wordId: wordId),
      ),
    );
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(searchNotifierProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF121212), // base Level 0 canvas
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search Input Bar
              WordSearchBar(
                autofocus: true,
                onChanged: _onSearchChanged,
                onSubmitted: _onSearchSubmitted,
                onBackTap: () => Navigator.maybePop(context),
              ),
              const SizedBox(height: 16),

              // Main Content Area
              Expanded(
                child: _buildContent(searchState),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent(searchState) {
    if (searchState.isLoading) {
      return _buildLoadingState();
    }

    if (searchState.failure != null) {
      return EmptyState(
        icon: Icons.error_outline_rounded,
        title: 'Search Error',
        description: searchState.failure!.message,
        actionLabel: 'Retry',
        onActionPressed: () => _onSearchSubmitted(searchState.query),
      );
    }

    // 1. Initial State: Empty query
    if (searchState.query.isEmpty && !_submitted) {
      return const EmptyState(
        icon: Icons.search_rounded,
        title: 'Focused Enlightenment',
        description: 'Type words above to explore definitions, roots, mnemonics, and synonyms.',
      );
    }

    // 2. Autocomplete Suggestions State
    if (_suggestions.isNotEmpty && !_submitted) {
      return ListView.builder(
        itemCount: _suggestions.length,
        itemBuilder: (context, index) {
          final suggestion = _suggestions[index];
          return ListTile(
            leading: const Icon(Icons.history_toggle_off_rounded, color: Colors.white24),
            title: Text(
              suggestion,
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 16,
                color: Color(0xFFF5F5F5),
              ),
            ),
            trailing: const Icon(Icons.arrow_outward_rounded, color: Colors.white24, size: 18),
            onTap: () => _onSearchSubmitted(suggestion),
          );
        },
      );
    }

    // 3. Submitted Results State
    if (_submitted) {
      if (searchState.results.isEmpty) {
        return EmptyState(
          icon: Icons.find_in_page_outlined,
          title: 'No Matches Found',
          description: 'We could not find "${searchState.query}" in the dictionary.',
          actionLabel: 'Search Again',
          onActionPressed: () => _onSearchChanged(''),
        );
      }

      // Check for exact headword match (case-insensitive)
      final exactMatchIndex = searchState.results.indexWhere(
        (w) => w.word.toUpperCase() == searchState.query.toUpperCase(),
      );

      final hasExactMatch = exactMatchIndex != -1;
      final exactWord = hasExactMatch ? searchState.results[exactMatchIndex] : null;

      final relatedWords = hasExactMatch
          ? List.from(searchState.results)..removeAt(exactMatchIndex)
          : searchState.results;

      return ListView(
        children: [
          if (exactWord != null) ...[
            const SectionHeader(title: 'Exact Match'),
            Hero(
              tag: 'word-card-${exactWord.id}',
              child: Material(
                color: Colors.transparent,
                child: FeaturedWordCard(
                  word: exactWord,
                  isBookmarked: false, // Default false, synced inside details page
                  onBookmarkToggle: (val) {},
                  onAudioPressed: () {
                    // Quick feedback audio
                  },
                  onTap: () => _navigateToWordDetails(exactWord.id),
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
          
          if (relatedWords.isNotEmpty) ...[
            const SectionHeader(title: 'Related Results'),
            ...relatedWords.map(
              (w) => WordListTile(
                word: w,
                onTap: () => _navigateToWordDetails(w.id),
              ),
            ),
          ],
        ],
      );
    }

    return const SizedBox.shrink();
  }

  Widget _buildLoadingState() {
    return ListView(
      children: [
        const SectionHeader(title: 'Searching'),
        const LoadingSkeleton(width: double.infinity, height: 180, borderRadius: 16),
        const SizedBox(height: 20),
        const SectionHeader(title: 'Related'),
        ...List.generate(
          4,
          (index) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const LoadingSkeleton(width: 120, height: 16),
                      const SizedBox(height: 8),
                      LoadingSkeleton(
                        width: MediaQuery.of(context).size.width * 0.7,
                        height: 14,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
