import 'package:flutter/material.dart';
import 'package:wordsmart/core/di/injection.dart';
import '../../../../core/design_system/tokens/app_colors.dart';
import '../../../../core/design_system/tokens/app_spacing.dart';
import '../../../../core/design_system/buttons/primary_button.dart';
import '../../data/datasources/practice_local_data_source.dart';
import 'quiz_list_page.dart';

class _QuizQuestion {
  final String prompt;
  final String? correctAnswer;
  final List<String>? options;

  const _QuizQuestion({
    required this.prompt,
    this.correctAnswer,
    this.options,
  });
}

class QuizPlayerPage extends StatefulWidget {
  final QuizListItem quizItem;

  const QuizPlayerPage({super.key, required this.quizItem});

  @override
  State<QuizPlayerPage> createState() => _QuizPlayerPageState();
}

class _QuizPlayerPageState extends State<QuizPlayerPage> {
  List<_QuizQuestion> _questions = [];
  int _currentIndex = 0;
  int _score = 0;
  bool _isLoading = true;
  String? _error;
  String? _selectedOption;
  final TextEditingController _textController = TextEditingController();
  bool? _isCorrect;
  bool _isFinished = false;

  @override
  void initState() {
    super.initState();
    _loadQuiz();
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  Future<void> _loadQuiz() async {
    try {
      final ds = sl<PracticeLocalDataSource>();
      final category = widget.quizItem.category;
      List<_QuizQuestion> questions = [];

      switch (category) {
        case QuizCategory.mcq:
          final quizzes = await ds.getMcqQuizzes();
          final quiz = quizzes.firstWhere(
            (q) => q.quizId == widget.quizItem.id,
          );
          final list = quiz.questionsList;
          for (final item in list) {
            final map = item as Map<String, dynamic>;
            final options = (map['options'] as List<dynamic>)
                .map((o) => o.toString())
                .toList();
            questions.add(_QuizQuestion(
              prompt: map['question'] as String,
              options: options,
              correctAnswer: map['answer'] as String,
            ));
          }
          break;
        case QuizCategory.quickMatch:
          final quizzes = await ds.getQuickQuizzes();
          final quiz = quizzes.firstWhere(
            (q) => q.quizId == widget.quizItem.id,
          );
          final matches = quiz.matchesList;
          final choices = quiz.choicesMap;
          final answerKey = quiz.answerKeyMap;
          final choiceLabels = choices.entries.map((e) => e.value as String).toList();
          for (final match in matches) {
            questions.add(_QuizQuestion(
              prompt: 'Match: ${match.toString()}',
              options: choiceLabels,
              correctAnswer: answerKey[match.toString()] as String?,
            ));
          }
          break;
        case QuizCategory.advanced:
          final quizzes = await ds.getAdvancedQuizzes();
          final quiz = quizzes.firstWhere(
            (q) => q.quizId == widget.quizItem.id,
          );
          for (final item in quiz.analogiesList) {
            final map = item as Map<String, dynamic>;
            final options = (map['options'] as List<dynamic>?)
                    ?.map((o) => o.toString())
                    .toList() ??
                [];
            questions.add(_QuizQuestion(
              prompt: map['stem'] as String? ?? map['question'] as String,
              options: options,
              correctAnswer: map['answer'] as String?,
            ));
          }
          for (final item in quiz.sentenceCompletionsList) {
            final map = item as Map<String, dynamic>;
            final options = (map['options'] as List<dynamic>?)
                    ?.map((o) => o.toString())
                    .toList() ??
                [];
            questions.add(_QuizQuestion(
              prompt: map['sentence'] as String? ?? map['question'] as String,
              options: options,
              correctAnswer: map['answer'] as String?,
            ));
          }
          for (final item in quiz.contextualLexicalList) {
            final map = item as Map<String, dynamic>;
            questions.add(_QuizQuestion(
              prompt: map['question'] as String? ?? map.toString(),
              correctAnswer: map['answer'] as String?,
            ));
          }
          break;
        case QuizCategory.finalExam:
          final exams = await ds.getFinalExams();
          final exam = exams.firstWhere(
            (e) => e.drillNumber == widget.quizItem.id,
          );
          final list = exam.questionsList;
          final answers = exam.answersMap;
          for (int i = 0; i < list.length; i++) {
            final item = list[i];
            final answer = answers[i.toString()] as String? ??
                answers['$i'] as String? ??
                '';
            questions.add(_QuizQuestion(
              prompt: item.toString(),
              correctAnswer: answer,
            ));
          }
          break;
      }

      setState(() {
        _questions = questions;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  _QuizQuestion get _currentQuestion => _questions[_currentIndex];
  bool get _hasOptions =>
      _currentQuestion.options != null && _currentQuestion.options!.isNotEmpty;

  void _submitAnswer() {
    final correct = _currentQuestion.correctAnswer ?? '';
    bool correctAnswer;
    if (_hasOptions) {
      correctAnswer = _selectedOption == correct;
    } else {
      final userAnswer = _textController.text.trim().toLowerCase();
      correctAnswer = userAnswer == correct.trim().toLowerCase();
    }
    setState(() {
      _isCorrect = correctAnswer;
    });
    if (correctAnswer) {
      _score++;
    }
  }

  void _nextQuestion() {
    if (_currentIndex + 1 >= _questions.length) {
      setState(() => _isFinished = true);
    } else {
      setState(() {
        _currentIndex++;
        _selectedOption = null;
        _isCorrect = null;
        _textController.clear();
      });
    }
  }

  void _restart() {
    setState(() {
      _currentIndex = 0;
      _score = 0;
      _selectedOption = null;
      _isCorrect = null;
      _isFinished = false;
      _textController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: AppColors.error, size: 48),
              const SizedBox(height: AppSpacing.md),
              const Text(
                'Failed to load quiz',
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: AppColors.textMuted,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              PrimaryButton(
                text: 'Go Back',
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
      );
    }

    if (_questions.isEmpty) {
      return const Center(
        child: Text(
          'No questions in this quiz',
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 16,
            color: AppColors.textMuted,
          ),
        ),
      );
    }

    if (_isFinished) {
      return _buildSummary();
    }

    return Column(
      children: [
        _buildProgressHeader(),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildQuestionCard(),
                const SizedBox(height: AppSpacing.lg),
                if (_hasOptions) _buildOptions(),
                if (!_hasOptions) _buildTextInput(),
                if (_isCorrect != null) _buildFeedback(),
              ],
            ),
          ),
        ),
        _buildFooter(),
      ],
    );
  }

  Widget _buildProgressHeader() {
    final progress = _questions.isEmpty
        ? 0.0
        : (_currentIndex) / _questions.length;
    return Container(
      padding: const EdgeInsets.fromLTRB(4, 8, 16, 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(bottom: BorderSide(color: AppColors.divider)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.close, color: AppColors.textPrimary),
                onPressed: () => Navigator.pop(context),
              ),
              const Spacer(),
              Text(
                'Question ${_currentIndex + 1} of ${_questions.length}',
                style: const TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(width: 48),
            ],
          ),
          const SizedBox(height: 4),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: AppColors.divider,
                valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                minHeight: 6,
              ),
            ),
          ),
          const SizedBox(height: 4),
        ],
      ),
    );
  }

  Widget _buildQuestionCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
        border: Border.all(color: AppColors.divider),
      ),
      child: Text(
        _currentQuestion.prompt,
        style: const TextStyle(
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: FontWeight.w600,
          height: 1.5,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }

  Widget _buildOptions() {
    return Column(
      children: (_currentQuestion.options ?? []).map((option) {
        final isSelected = _selectedOption == option;
        final isFeedbackMode = _isCorrect != null;
        final isCorrectOption = option == _currentQuestion.correctAnswer;

        Color cardColor = AppColors.surface;
        Color borderColor = AppColors.divider;
        Widget? trailing;

        if (isFeedbackMode) {
          if (isCorrectOption) {
            cardColor = AppColors.success.withValues(alpha: 0.12);
            borderColor = AppColors.success;
            trailing = const Icon(Icons.check_circle, color: AppColors.success);
          } else if (isSelected) {
            cardColor = AppColors.error.withValues(alpha: 0.12);
            borderColor = AppColors.error;
            trailing = const Icon(Icons.cancel, color: AppColors.error);
          }
        } else if (isSelected) {
          cardColor = AppColors.primary.withValues(alpha: 0.08);
          borderColor = AppColors.primary;
        }

        return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.sm),
          child: InkWell(
            onTap: isFeedbackMode
                ? null
                : () => setState(() => _selectedOption = option),
            borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
            child: Container(
              constraints: const BoxConstraints(minHeight: 56),
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                color: cardColor,
                border: Border.all(color: borderColor, width: 2),
                borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      option,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  if (trailing != null) trailing,
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildTextInput() {
    final isFeedbackMode = _isCorrect != null;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: AppColors.divider),
      ),
      child: TextField(
        controller: _textController,
        enabled: !isFeedbackMode,
        style: const TextStyle(
          fontFamily: 'Inter',
          fontSize: 16,
          color: AppColors.textPrimary,
        ),
        decoration: InputDecoration(
          hintText: 'Type your answer...',
          hintStyle: TextStyle(
            fontFamily: 'Inter',
            fontSize: 16,
            color: AppColors.textMuted,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
        ),
      ),
    );
  }

  Widget _buildFeedback() {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.md),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: _isCorrect!
              ? AppColors.success.withValues(alpha: 0.12)
              : AppColors.error.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          border: Border.all(
            color: _isCorrect! ? AppColors.success : AppColors.error,
          ),
        ),
        child: Row(
          children: [
            Icon(
              _isCorrect! ? Icons.check_circle : Icons.cancel,
              color: _isCorrect! ? AppColors.success : AppColors.error,
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                _isCorrect!
                    ? 'Correct!'
                    : 'Incorrect. Answer: ${_currentQuestion.correctAnswer ?? "N/A"}',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color:
                      _isCorrect! ? AppColors.success : AppColors.error,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFooter() {
    final isFeedbackMode = _isCorrect != null;
    final canSubmit = _hasOptions
        ? _selectedOption != null
        : _textController.text.trim().isNotEmpty;

    return Container(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.sm,
        AppSpacing.md,
        AppSpacing.md,
      ),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.divider)),
      ),
      child: SafeArea(
        top: false,
        child: PrimaryButton(
          text: isFeedbackMode ? 'Next' : 'Submit',
          isDisabled: !isFeedbackMode && !canSubmit,
          onPressed: isFeedbackMode ? _nextQuestion : _submitAnswer,
        ),
      ),
    );
  }

  Widget _buildSummary() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _score == _questions.length
                  ? Icons.emoji_events_rounded
                  : Icons.assignment_turned_in_rounded,
              size: 80,
              color: _score == _questions.length
                  ? AppColors.warning
                  : AppColors.primary,
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              'Quiz Complete!',
              style: const TextStyle(
                fontFamily: 'Outfit',
                fontSize: 28,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              '${_score.toString().padLeft(2, '0')} / ${_questions.length.toString().padLeft(2, '0')}',
              style: const TextStyle(
                fontFamily: 'Outfit',
                fontSize: 48,
                fontWeight: FontWeight.w800,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              '${(_score * 100 ~/ _questions.length)}% accuracy',
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 16,
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),
            SizedBox(
              width: double.infinity,
              child: PrimaryButton(
                text: 'Retry Quiz',
                onPressed: _restart,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            SizedBox(
              width: double.infinity,
              child: PrimaryButton(
                text: 'Back to Quizzes',
                isFilled: false,
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
