class StoryQueries {
  static const String ensureStoryProgressTable = '''
    CREATE TABLE IF NOT EXISTS story_progress (
      id TEXT PRIMARY KEY,
      story_id INTEGER NOT NULL,
      chapter INTEGER NOT NULL,
      paragraph INTEGER NOT NULL,
      offset INTEGER NOT NULL,
      last_studied_at TEXT NOT NULL
    );
  ''';

  static const String selectStories = '''
    SELECT quiz_id, quiz_title, words_covered, story_english, story_bengali, vocabulary_mapping
    FROM contextual_stories
    ORDER BY quiz_id ASC;
  ''';

  static const String selectStoryById = '''
    SELECT quiz_id, quiz_title, words_covered, story_english, story_bengali, vocabulary_mapping
    FROM contextual_stories
    WHERE quiz_id = ?
    LIMIT 1;
  ''';

  static const String selectProgressByStoryId = '''
    SELECT id, story_id, chapter, paragraph, offset, last_studied_at
    FROM story_progress
    WHERE story_id = ?
    LIMIT 1;
  ''';

  static const String upsertProgress = '''
    INSERT INTO story_progress (id, story_id, chapter, paragraph, offset, last_studied_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      chapter = excluded.chapter,
      paragraph = excluded.paragraph,
      offset = excluded.offset,
      last_studied_at = excluded.last_studied_at;
  ''';

  static const String selectWordIdByHeadword = '''
    SELECT id
    FROM words
    WHERE UPPER(word) = UPPER(?)
    LIMIT 1;
  ''';
}
