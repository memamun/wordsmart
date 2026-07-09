import 'package:flutter/material.dart';
import '../../../../core/di/injection.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../../../core/design_system/tokens/app_spacing.dart';
import '../../../../core/design_system/states/empty_state.dart';
import '../../../../core/design_system/states/loading_skeleton.dart';
import '../../../../core/design_system/buttons/primary_button.dart';
import '../../data/datasources/word_local_data_source.dart';
import '../../data/models/word_model.dart';
import 'swipeable_word_details_page.dart';

class WordListPage extends StatefulWidget {
  const WordListPage({super.key});

  @override
  State<WordListPage> createState() => _WordListPageState();
}

class _WordListPageState extends State<WordListPage> {
  final ds = sl<WordLocalDataSource>();
  late Future<List<WordModel>> _future;
  List<int> _wordIds = [];

  @override
  void initState() {
    super.initState();
    _loadWords();
  }

  void _loadWords() {
    _future = ds.getAllWords().then((words) {
      _wordIds = words.map((w) => w.id).toList();
      return words;
    });
  }

  Future<void> _refresh() async {
    setState(() {
      _loadWords();
    });
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        title: const Text(
          'All Words',
          style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.w600),
        ),
        backgroundColor: AppColors.canvas,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: SafeArea(
        child: FutureBuilder<List<WordModel>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return _buildLoading();
            }
            if (snapshot.hasError) {
              return _buildError(snapshot.error.toString());
            }
            final words = snapshot.data ?? [];
            if (words.isEmpty) {
              return const EmptyState(
                icon: Icons.menu_book_rounded,
                title: 'No Words Yet',
                description: 'The dictionary is empty. Add words to get started.',
              );
            }
            return _buildList(words);
          },
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: 10,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: Row(
            children: [
              const LoadingSkeleton(width: 40, height: 40, borderRadius: 20),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const LoadingSkeleton(width: 160, height: 18),
                    const SizedBox(height: AppSpacing.sm),
                    const LoadingSkeleton(width: double.infinity, height: 14),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildError(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, size: 64, color: Colors.white10),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'Something went wrong',
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            PrimaryButton(
              text: 'Retry',
              onPressed: () {
                setState(() {
                  _loadWords();
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildList(List<WordModel> words) {
    return RefreshIndicator(
      onRefresh: _refresh,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
        itemCount: words.length,
        itemBuilder: (context, index) {
          final word = words[index];
          return _buildWordTile(word);
        },
      ),
    );
  }

  Widget _buildWordTile(WordModel word) {
    final firstLetter = word.word.isNotEmpty
        ? word.word[0].toUpperCase()
        : '?';

    return InkWell(
      onTap: () {
        final idx = _wordIds.indexOf(word.id);
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => SwipeableWordDetailsPage(
              wordIds: _wordIds,
              initialIndex: idx,
            ),
          ),
        );
      },
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: AppColors.surfaceHigh,
              child: Text(
                firstLetter,
                style: const TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        word.word.toUpperCase(),
                        style: const TextStyle(
                          fontFamily: 'Outfit',
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      if (word.partOfSpeech != null) ...[
                        const SizedBox(width: AppSpacing.sm),
                        Text(
                          word.partOfSpeech!,
                          style: const TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 11,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    word.definition ?? word.bengaliMeaning ?? '',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.textDark,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
