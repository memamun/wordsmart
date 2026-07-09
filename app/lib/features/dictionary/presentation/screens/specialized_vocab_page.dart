import 'dart:convert';
import 'package:flutter/material.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../../../core/design_system/tokens/app_spacing.dart';
import '../../../../core/design_system/states/empty_state.dart';
import '../../../../core/design_system/states/loading_skeleton.dart';
import '../../../../core/design_system/buttons/primary_button.dart';
import '../../data/datasources/word_local_data_source.dart';
import '../../data/models/specialized_vocab_model.dart';
import '../../../../core/di/injection.dart';

class SpecializedVocabPage extends StatefulWidget {
  const SpecializedVocabPage({super.key});

  @override
  State<SpecializedVocabPage> createState() => _SpecializedVocabPageState();
}

class _SpecializedVocabPageState extends State<SpecializedVocabPage> {
  final ds = sl<WordLocalDataSource>();
  late Future<List<SpecializedVocabModel>> _future;

  @override
  void initState() {
    super.initState();
    _future = ds.getSpecializedVocabulary();
  }

  Future<void> _refresh() async {
    setState(() {
      _future = ds.getSpecializedVocabulary();
    });
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      appBar: AppBar(
        title: const Text(
          'Thematic Vocabulary',
          style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.w600),
        ),
        backgroundColor: AppColors.canvas,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: SafeArea(
        child: FutureBuilder<List<SpecializedVocabModel>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return _buildLoading();
            }
            if (snapshot.hasError) {
              return _buildError(snapshot.error.toString());
            }
            final vocab = snapshot.data ?? [];
            if (vocab.isEmpty) {
              return const EmptyState(
                icon: Icons.menu_book_rounded,
                title: 'No Vocabulary',
                description: 'No thematic vocabulary entries are available yet.',
              );
            }
            return _buildList(vocab);
          },
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return ListView.builder(
      padding: const EdgeInsets.all(AppSpacing.md),
      itemCount: 6,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const LoadingSkeleton(width: 180, height: 16),
              const SizedBox(height: AppSpacing.sm),
              ...List.generate(
                2,
                (_) => const Padding(
                  padding: EdgeInsets.only(bottom: AppSpacing.sm),
                  child: LoadingSkeleton(
                    width: double.infinity,
                    height: 48,
                    borderRadius: AppSpacing.radiusMd,
                  ),
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
                  _future = ds.getSpecializedVocabulary();
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildList(List<SpecializedVocabModel> vocab) {
    final grouped = <int, List<SpecializedVocabModel>>{};
    for (final v in vocab) {
      grouped.putIfAbsent(v.chapterNumber, () => []).add(v);
    }

    return RefreshIndicator(
      onRefresh: _refresh,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        itemCount: grouped.length,
        itemBuilder: (context, index) {
          final chapterNumber = grouped.keys.elementAt(index);
          final items = grouped[chapterNumber]!;
          final title = items.first.chapterTitle;
          return _buildChapter(chapterNumber, title, items);
        },
      ),
    );
  }

  Widget _buildChapter(
    int chapterNumber,
    String chapterTitle,
    List<SpecializedVocabModel> items,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(top: AppSpacing.md, bottom: AppSpacing.sm),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, Color(0xFF00897B)],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.sm,
                  vertical: 2,
                ),
                decoration: BoxDecoration(
                  color: Colors.black26,
                  borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
                ),
                child: Text(
                  '$chapterNumber',
                  style: const TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Colors.white70,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  chapterTitle,
                  style: const TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                ),
              ),
            ],
          ),
        ),
        ...items.map((item) => _buildTermCard(item)),
      ],
    );
  }

  Widget _buildTermCard(SpecializedVocabModel item) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Material(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
          ),
          childrenPadding: const EdgeInsets.fromLTRB(
            AppSpacing.md,
            0,
            AppSpacing.md,
            AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          collapsedShape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
          ),
          title: Text(
            item.term,
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 15,
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
          leading: Container(
            width: 4,
            height: 24,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          children: [
            const SizedBox(height: AppSpacing.sm),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                item.definition,
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
              ),
            ),
            if (item.examplesList.isNotEmpty) ...[
              const SizedBox(height: AppSpacing.md),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Examples',
                  style: const TextStyle(
                    fontFamily: 'Outfit',
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textMuted,
                    letterSpacing: 1,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              ...item.examplesList.map(
                (example) => Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        '\u2022 ',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontSize: 14,
                        ),
                      ),
                      Expanded(
                        child: Text(
                          example.toString(),
                          style: const TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 13,
                            color: AppColors.textMuted,
                            fontStyle: FontStyle.italic,
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
