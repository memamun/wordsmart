class PracticeQueries {
  static const String selectPracticeCards = '''
    SELECT 
      w.id as word_id, 
      w.word, 
      w.definition, 
      w.bengali_meaning, 
      w.pronunciation, 
      w.part_of_speech, 
      w.level, 
      w.audio_path, 
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
    INNER JOIN progress p ON w.id = p.word_id;
  ''';

  static const String selectDictionaryPool = '''
    SELECT 
      w.id as word_id, 
      w.word, 
      w.definition, 
      w.bengali_meaning, 
      w.pronunciation, 
      w.part_of_speech, 
      w.level, 
      w.audio_path, 
      w.mnemonic
    FROM words w;
  ''';
}
