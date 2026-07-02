import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/dictionary/presentation/screens/search_page.dart';
import '../../features/dictionary/presentation/providers/search_notifier.dart';
import '../../features/dictionary/presentation/widgets/featured_word_card.dart';
import '../../features/dictionary/presentation/widgets/word_list_tile.dart';
import '../../core/navigation/app_navigator.dart';
import '../../core/design_system/states/empty_state.dart';
import '../../core/design_system/states/loading_skeleton.dart';
import '../../core/design_system/inputs/word_search_bar.dart';
import '../../core/design_system/typography/section_header.dart';
import '../../features/review/presentation/screens/progress_dashboard_page.dart';
import '../../features/review/presentation/screens/review_session_page.dart';
import '../../features/practice/presentation/screens/practice_session_page.dart';
import '../../features/stories/presentation/screens/story_reader_page.dart';
import '../../features/recommendation/presentation/providers/providers.dart';
import '../../features/recommendation/presentation/widgets/recommendation_list.dart';
import '../design_system/tokens/app_colors.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  int _currentIndex = 0;

  final _featurePages = const [
    SearchPage(),
    StoryReaderPage(),
    ReviewSessionPage(),
    PracticeSessionPage(),
    ProgressDashboardPage(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(recommendationProvider.notifier).load();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_currentIndex == 0) {
      return _buildHomeWithRecommendations();
    }

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _featurePages,
      ),
      bottomNavigationBar: _buildNavBar(),
    );
  }

  Widget _buildHomeWithRecommendations() {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // SearchPage content without its own Scaffold/SafeArea wrapper
            const Expanded(
              child: _HomeSearchContent(),
            ),
            const RecommendationList(),
          ],
        ),
      ),
      bottomNavigationBar: _buildNavBar(),
    );
  }

  Widget _buildNavBar() {
    return NavigationBar(
      selectedIndex: _currentIndex,
      onDestinationSelected: (index) {
        HapticFeedback.lightImpact().catchError((_) {});
        setState(() => _currentIndex = index);
      },
      backgroundColor: AppColors.surface,
      indicatorColor: AppColors.teal.withValues(alpha: 0.2),
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.home_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.home, color: AppColors.teal),
          label: 'Home',
        ),
        NavigationDestination(
          icon: Icon(Icons.auto_stories_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.auto_stories, color: AppColors.teal),
          label: 'Stories',
        ),
        NavigationDestination(
          icon: Icon(Icons.psychology_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.psychology, color: AppColors.teal),
          label: 'Review',
        ),
        NavigationDestination(
          icon: Icon(Icons.fitness_center_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.fitness_center, color: AppColors.teal),
          label: 'Practice',
        ),
        NavigationDestination(
          icon: Icon(Icons.dashboard_outlined, color: AppColors.textMuted),
          selectedIcon: Icon(Icons.dashboard, color: AppColors.teal),
          label: 'Progress',
        ),
      ],
    );
  }
}

class _HomeSearchContent extends ConsumerStatefulWidget {
  const _HomeSearchContent();

  @override
  ConsumerState<_HomeSearchContent> createState() => _HomeSearchContentState();
}

class _HomeSearchContentState extends ConsumerState<_HomeSearchContent> {
  Timer? _debounceTimer;
  List<String> _suggestions = [];
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

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(searchNotifierProvider);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          WordSearchBar(
            autofocus: true,
            onChanged: _onSearchChanged,
            onSubmitted: _onSearchSubmitted,
            onBackTap: () => AppNavigator.popToHome(context),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _buildContent(searchState),
          ),
        ],
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

    if (searchState.query.isEmpty && !_submitted) {
      return const EmptyState(
        icon: Icons.search_rounded,
        title: 'Focused Enlightenment',
        description:
            'Type words above to explore definitions, roots, mnemonics, and synonyms.',
      );
    }

    if (_suggestions.isNotEmpty && !_submitted) {
      return ListView.builder(
        itemCount: _suggestions.length,
        itemBuilder: (context, index) {
          final suggestion = _suggestions[index];
          return ListTile(
            leading: const Icon(Icons.history_toggle_off_rounded,
                color: Colors.white24),
            title: Text(
              suggestion,
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 16,
                color: AppColors.textPrimary,
              ),
            ),
            trailing: const Icon(Icons.arrow_outward_rounded,
                color: Colors.white24, size: 18),
            onTap: () => _onSearchSubmitted(suggestion),
          );
        },
      );
    }

    if (_submitted) {
      if (searchState.results.isEmpty) {
        return EmptyState(
          icon: Icons.find_in_page_outlined,
          title: 'No Matches Found',
          description:
              'We could not find "${searchState.query}" in the dictionary.',
          actionLabel: 'Search Again',
          onActionPressed: () => _onSearchChanged(''),
        );
      }

      final exactMatchIndex = searchState.results.indexWhere(
        (w) => w.word.toUpperCase() == searchState.query.toUpperCase(),
      );

      final hasExactMatch = exactMatchIndex != -1;
      final exactWord =
          hasExactMatch ? searchState.results[exactMatchIndex] : null;

      final relatedWords = hasExactMatch
          ? (List.from(searchState.results)..removeAt(exactMatchIndex))
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
                  isBookmarked: false,
                  onBookmarkToggle: (val) {},
                  onAudioPressed: () {},
                  onTap: () => AppNavigator.pushWordDetails(context, exactWord.id),
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
                onTap: () => AppNavigator.pushWordDetails(context, w.id),
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
        const LoadingSkeleton(
            width: double.infinity, height: 180, borderRadius: 16),
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
