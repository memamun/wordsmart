import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../providers/word_details_notifier.dart';
import '../../../../core/design_system/buttons/bookmark_button.dart';
import '../../../../core/design_system/states/empty_state.dart';
import '../../../../core/design_system/states/loading_skeleton.dart';
import '../../../../core/design_system/buttons/primary_button.dart';
import '../../../../core/design_system/typography/section_header.dart';

class WordDetailsPage extends ConsumerStatefulWidget {
  final int wordId;

  const WordDetailsPage({super.key, required this.wordId});

  @override
  ConsumerState<WordDetailsPage> createState() => _WordDetailsPageState();
}

class _BranchWordDetails {
  // Local state helper for bookmark status
  bool isBookmarked = false;
}

class _WordDetailsPageState extends ConsumerState<WordDetailsPage> {
  final _BranchWordDetails _detailsState = _BranchWordDetails();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(wordDetailsNotifierProvider.notifier).loadWordDetails(widget.wordId);
    });
  }

  void _playPronunciation() {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Playing pronunciation audio...'),
        duration: Duration(seconds: 1),
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.teal,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(wordDetailsNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.canvas, // base Level 0 canvas
      body: _buildBody(state),
    );
  }

  Widget _buildBody(state) {
    if (state.isLoading) {
      return _buildLoadingState();
    }

    if (state.failure != null) {
      return SafeArea(
        child: EmptyState(
          icon: Icons.error_outline_rounded,
          title: 'Failed to Load Details',
          description: state.failure!.message,
          actionLabel: 'Retry',
          onActionPressed: () {
            ref.read(wordDetailsNotifierProvider.notifier).loadWordDetails(widget.wordId);
          },
        ),
      );
    }

    final word = state.word;
    if (word == null) {
      return const SizedBox.shrink();
    }

    return Stack(
      children: [
        CustomScrollView(
          slivers: [
            // Pinned Collapsible Sliver App Bar
            SliverAppBar(
              expandedHeight: 120.0,
              floating: false,
              pinned: true,
              backgroundColor: AppColors.canvas,
              elevation: 0,
              flexibleSpace: FlexibleSpaceBar(
                centerTitle: true,
                title: Text(
                  word.word.toUpperCase(),
                  style: const TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.amber, // Amber
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              actions: [
                Padding(
                  padding: const EdgeInsets.only(right: 12.0),
                  child: BookmarkButton(
                    isBookmarked: _detailsState.isBookmarked,
                    onToggle: (val) {
                      setState(() {
                        _detailsState.isBookmarked = val;
                      });
                      ScaffoldMessenger.of(context).clearSnackBars();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            val ? 'Word saved to bookmarks.' : 'Word removed from bookmarks.',
                          ),
                          duration: const Duration(seconds: 1),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),

            // Content Area
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // Header Block
                  Row(
                    children: [
                      Expanded(
                        child: Hero(
                          tag: 'word-card-${word.id}',
                          child: Material(
                            color: Colors.transparent,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  word.word.toUpperCase(),
                                  style: TextStyle(
                                    fontFamily: 'Outfit',
                                    fontSize: 44,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.amber,
                                    letterSpacing: -1.0,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    if (word.pronunciation != null)
                                      Text(
                                        word.pronunciation!,
                                        style: TextStyle(
                                          fontFamily: 'Inter',
                                          fontSize: 16,
                                          fontWeight: FontWeight.w500,
                                          color: AppColors.teal, // Teal
                                        ),
                                      ),
                                    if (word.pronunciation != null && word.level != null)

                                  const Text('  •  ', style: TextStyle(color: Colors.white24)),
                                if (word.level != null)
                                  Text(
                                    word.level!,
                                      style: TextStyle(
                                        fontFamily: 'Inter',
                                        fontSize: 14,
                                        color: AppColors.textMuted,
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                      // Floating Audio Action
                      GestureDetector(
                        onTap: _playPronunciation,
                        child: Container(
                          width: 56,
                          height: 56,
                              decoration: BoxDecoration(
                            color: AppColors.teal.withOpacity(0.08),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AppColors.teal.withOpacity(0.2),
                              width: 1,
                            ),
                          ),
                          child: Icon(
                            Icons.volume_up_rounded,
                            color: AppColors.teal,
                            size: 26,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Core Meanings Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surface, // Level 1 surface
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.04),
                        width: 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (word.bengaliMeaning != null) ...[
                          Text(
                            word.bengaliMeaning!,
                            style: TextStyle(
                              fontFamily: 'Hind Siliguri',
                              fontSize: 22,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary, // off-white
                            ),
                          ),
                          const SizedBox(height: 12),
                          const Divider(color: Colors.white10, height: 1),
                          const SizedBox(height: 12),
                        ],
                        if (word.definition != null)
                          Text(
                            word.definition!,
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 16,
                              color: AppColors.textSecondary, // secondary definition
                              height: 1.5,
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Mnemonic Box (if available)
                  if (word.mnemonic != null && word.mnemonic!.isNotEmpty) ...[
                    const SectionHeader(title: 'Memory Mnemonic'),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.amber.withOpacity(0.03),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppColors.amber.withOpacity(0.15),
                          width: 1.2,
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(
                            Icons.lightbulb_outline_rounded,
                            color: AppColors.amber,
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              word.mnemonic!,
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 14,
                                  color: AppColors.mnemonicText,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Examples Section
                  if (word.examples != null && word.examples!.isNotEmpty) ...[
                    const SectionHeader(title: 'Example Sentences'),
                    ...word.examples!.map((ex) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.02),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                ex.sentence,
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 15,
                                  color: AppColors.textPrimary,
                                  height: 1.4,
                                ),
                              ),
                              if (ex.translation != null && ex.translation!.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Text(
                                  ex.translation!,
                                  style: TextStyle(
                                    fontFamily: 'Hind Siliguri',
                                    fontSize: 14,
                                    color: AppColors.teal, // Teal Bengali translation
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    }),
                    const SizedBox(height: 8),
                  ],

                  // Related Words chips (Synonyms & Antonyms)
                  if ((word.synonyms != null && word.synonyms!.isNotEmpty) ||
                      (word.antonyms != null && word.antonyms!.isNotEmpty)) ...[
                    const SectionHeader(title: 'Related Words'),
                    if (word.synonyms != null && word.synonyms!.isNotEmpty) ...[
                      const Padding(
                        padding: EdgeInsets.only(bottom: 8.0),
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12,
                          color: AppColors.textMuted,
                        ),
                        child: Text('SYNONYMS'),
                      ),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: word.synonyms!.map((syn) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.teal.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              syn,
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 13,
                                color: AppColors.teal,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),
                    ],
                    if (word.antonyms != null && word.antonyms!.isNotEmpty) ...[
                      const Padding(
                        padding: EdgeInsets.only(bottom: 8.0),
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12,
                          color: AppColors.textMuted,
                        ),
                        child: Text('ANTONYMS'),
                      ),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: word.antonyms!.map((ant) {
                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.coral.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              ant,
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 13,
                                color: AppColors.coral,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ],

                  // Roots & Etymology
                  if (word.roots != null && word.roots!.isNotEmpty) ...[
                    const SectionHeader(title: 'Roots & Etymology'),
                    ...word.roots!.map((rt) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.02),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.04),
                              width: 1,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                rt.root.toUpperCase(),
                                  style: TextStyle(
                                    fontFamily: 'Outfit',
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.amber,
                                  letterSpacing: 1.0,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                rt.meaning,
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 14,
                                    color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                    const SizedBox(height: 12),
                  ],

                  // Derivatives
                  if (word.derivatives != null && word.derivatives!.isNotEmpty) ...[
                    const SectionHeader(title: 'Derivatives'),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: word.derivatives!.map((der) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.04),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                der.derivative,
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 13,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              if (der.partOfSpeech != null) ...[
                                const SizedBox(width: 4),
                                Text(
                                  '(${der.partOfSpeech})',
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 11,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ]),
              ),
            ),
          ],
        ),

        // Persistent Study Actions Bar
        Align(
          alignment: Alignment.bottomCenter,
          child: Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.canvas.withOpacity(0),
                  AppColors.canvas.withOpacity(0.95),
                  AppColors.canvas,
                ],
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: PrimaryButton(
                    text: 'Review Again',
                    isFilled: false,
                    color: AppColors.textSecondary,
                    onPressed: () {
                      ScaffoldMessenger.of(context).clearSnackBars();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Word scheduled for review soon.'),
                          duration: Duration(seconds: 1),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: PrimaryButton(
                    text: 'Mark as Mastered',
                    isFilled: true,
                    color: AppColors.teal,
                    onPressed: () {
                      ScaffoldMessenger.of(context).clearSnackBars();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Word marked as mastered! 🎉'),
                          duration: Duration(seconds: 1),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLoadingState() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const LoadingSkeleton(width: 80, height: 24),
            const SizedBox(height: 24),
            const LoadingSkeleton(width: 200, height: 48),
            const SizedBox(height: 12),
            const LoadingSkeleton(width: 150, height: 16),
            const SizedBox(height: 32),
            const LoadingSkeleton(width: double.infinity, height: 120, borderRadius: 16),
            const SizedBox(height: 24),
            const LoadingSkeleton(width: 140, height: 20),
            const SizedBox(height: 12),
            const LoadingSkeleton(width: double.infinity, height: 80, borderRadius: 12),
          ],
        ),
      ),
    );
  }
}
