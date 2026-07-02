class ReviewQueries {
  static const String selectAllWordsWithProgress = '''
    SELECT 
      w.id as word_id, 
      w.word, 
      w.definition, 
      w.bengali_meaning, 
      w.pronunciation, 
      w.part_of_speech, 
      w.level, 
      w.audio as audio_path, 
      w.mnemonic,
      p.is_read, 
      p.is_reviewed, 
      p.review_count, 
      p.correct_count, 
      p.incorrect_count, 
      p.mastery_score, 
      p.status, 
      p.last_reviewed_at, 
      p.next_review_at,
      p.ease_factor, 
      p.interval_days, 
      p.repetitions, 
      p.learning_state
    FROM words w
    LEFT JOIN progress p ON w.id = p.word_id;
  ''';

  static const String selectWordProgress = '''
    SELECT 
      word_id, 
      is_read, 
      is_reviewed, 
      review_count, 
      correct_count, 
      incorrect_count, 
      mastery_score, 
      status, 
      last_reviewed_at, 
      next_review_at,
      ease_factor, 
      interval_days, 
      repetitions, 
      learning_state
    FROM progress
    WHERE word_id = ?;
  ''';

  static const String upsertProgress = '''
    INSERT INTO progress (
      word_id, 
      is_read, 
      is_reviewed, 
      review_count, 
      correct_count, 
      incorrect_count, 
      mastery_score, 
      status, 
      last_reviewed_at, 
      next_review_at, 
      ease_factor, 
      interval_days, 
      repetitions, 
      learning_state
    ) VALUES (?, 1, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(word_id) DO UPDATE SET
      review_count = excluded.review_count,
      correct_count = excluded.correct_count,
      incorrect_count = excluded.incorrect_count,
      mastery_score = excluded.mastery_score,
      status = excluded.status,
      last_reviewed_at = excluded.last_reviewed_at,
      next_review_at = excluded.next_review_at,
      ease_factor = excluded.ease_factor,
      interval_days = excluded.interval_days,
      repetitions = excluded.repetitions,
      learning_state = excluded.learning_state;
  ''';

  static const String insertStudySession = '''
    INSERT INTO study_sessions (
      id, 
      mode, 
      started_at, 
      finished_at, 
      reviewed_cards, 
      correct_answers, 
      incorrect_answers, 
      duration_seconds
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      finished_at = excluded.finished_at,
      reviewed_cards = reviewed_cards + excluded.reviewed_cards,
      correct_answers = correct_answers + excluded.correct_answers,
      incorrect_answers = incorrect_answers + excluded.incorrect_answers,
      duration_seconds = duration_seconds + excluded.duration_seconds;
  ''';

  static const String selectAllStudySessions = '''
    SELECT 
      id, 
      mode, 
      started_at, 
      finished_at, 
      reviewed_cards, 
      correct_answers, 
      incorrect_answers, 
      duration_seconds
    FROM study_sessions;
  ''';

  static const String insertLearningEvent = '''
    INSERT OR IGNORE INTO learning_events (
      id, 
      word_id, 
      event_type, 
      logged_at, 
      reference_id, 
      reference_type
    ) VALUES (?, ?, ?, ?, ?, ?);
  ''';

  static const String insertWeakWordEvent = '''
    INSERT OR IGNORE INTO weak_word_events (
      id, 
      word_id, 
      weakness_reason, 
      logged_at
    ) VALUES (?, ?, ?, ?);
  ''';
}
