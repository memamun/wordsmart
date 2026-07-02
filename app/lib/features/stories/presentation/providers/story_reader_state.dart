import '../../../../core/error/failures.dart';
import '../../domain/entities/highlighted_word.dart';
import '../../domain/entities/reading_session.dart';
import '../../domain/entities/reading_statistics.dart';
import '../../domain/entities/story.dart';

abstract class StoryReaderState {
  const StoryReaderState();
}

class StoryReaderInitial extends StoryReaderState {
  const StoryReaderInitial();
}

class StoryReaderLoading extends StoryReaderState {
  const StoryReaderLoading();
}

class StoryReaderLoaded extends StoryReaderState {
  final Story story;
  final ReadingSession session;
  final ReadingStatistics statistics;
  final HighlightedWord? selectedWord;

  const StoryReaderLoaded({
    required this.story,
    required this.session,
    required this.statistics,
    this.selectedWord,
  });

  int get currentParagraphIndex => session.position.paragraph;
  bool get isComplete => session.isCompleted;

  StoryReaderLoaded copyWith({
    Story? story,
    ReadingSession? session,
    ReadingStatistics? statistics,
    HighlightedWord? selectedWord,
    bool clearSelectedWord = false,
  }) {
    return StoryReaderLoaded(
      story: story ?? this.story,
      session: session ?? this.session,
      statistics: statistics ?? this.statistics,
      selectedWord: clearSelectedWord ? null : selectedWord ?? this.selectedWord,
    );
  }
}

class StoryReaderFailure extends StoryReaderState {
  final Failure failure;
  const StoryReaderFailure(this.failure);
}
