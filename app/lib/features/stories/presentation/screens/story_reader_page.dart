import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../../../core/design_system/states/empty_state.dart';
import '../../../../core/navigation/app_navigator.dart';
import '../providers/providers.dart';
import '../providers/story_reader_state.dart';
import '../widgets/reading_progress_bar.dart';
import '../widgets/story_paragraph_block.dart';
import '../widgets/word_context_sheet.dart';

class StoryReaderPage extends ConsumerStatefulWidget {
  final int storyId;

  const StoryReaderPage({super.key, this.storyId = 1});

  @override
  ConsumerState<StoryReaderPage> createState() => _StoryReaderPageState();
}

class _StoryReaderPageState extends ConsumerState<StoryReaderPage> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(storyReaderProvider.notifier).loadStory(widget.storyId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(storyReaderProvider);
    ref.listen<StoryReaderState>(storyReaderProvider, (previous, next) {
      if (next is StoryReaderLoaded && next.selectedWord != null) {
        showModalBottomSheet<void>(
          context: context,
          backgroundColor: Colors.transparent,
          builder: (context) => WordContextSheet(
            word: next.selectedWord!,
            onClose: () {
              AppNavigator.pop(context);
              ref.read(storyReaderProvider.notifier).clearSelectedWord();
            },
          ),
        ).whenComplete(() {
          ref.read(storyReaderProvider.notifier).clearSelectedWord();
        });
      }
    });

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(child: _buildBody(state)),
    );
  }

  Widget _buildBody(StoryReaderState state) {
    if (state is StoryReaderLoading || state is StoryReaderInitial) {
      return const Center(
          child: CircularProgressIndicator(color: AppColors.teal));
    }

    if (state is StoryReaderFailure) {
      return EmptyState(
        icon: Icons.auto_stories_outlined,
        title: 'Story unavailable',
        description: state.failure.message,
        actionLabel: 'Retry',
        onActionPressed: () =>
            ref.read(storyReaderProvider.notifier).loadStory(widget.storyId),
      );
    }

    final loaded = state as StoryReaderLoaded;
    final paragraph = loaded.story.paragraphs[loaded.currentParagraphIndex];

    return Padding(
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            loaded.story.title,
            style: const TextStyle(
              fontFamily: 'Outfit',
              fontSize: 26,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          ReadingProgressBar(percent: loaded.statistics.completionPercent),
          const SizedBox(height: 20),
          Expanded(
            child: SingleChildScrollView(
              child: StoryParagraphBlock(
                paragraph: paragraph,
                onWordTap: ref.read(storyReaderProvider.notifier).selectWord,
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: loaded.isComplete
                  ? null
                  : () =>
                      ref.read(storyReaderProvider.notifier).nextParagraph(),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.teal,
                foregroundColor: AppColors.textPrimary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
              child: Text(
                  loaded.isComplete ? 'Story Complete' : 'Continue Reading'),
            ),
          ),
        ],
      ),
    );
  }
}
