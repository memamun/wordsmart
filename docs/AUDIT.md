# WordSmart Data Repository Audit

## Project Overview

Total JSON Files: 12

Purpose:
To support a robust vocabulary learning application (specifically SAT/GRE/WordSmart prep) with structured definitions, flashcards, etymologies (word roots), matching quizzes, exams, mnemonics, audio pronunciation guides, and reading comprehension contextual stories.

---

## File 1: core_vocabulary.json

Purpose:
Core vocabulary database containing primary dictionary entries for vocabulary words, including definitions, examples, Bengali meanings, and metadata.

Approx Records:
822

Fields:

* id
* word
* pronunciation
* part_of_speech
* definition
* quick_quiz_id
* examples
* bengali_meaning
* synonyms
* antonyms
* mnemonic
* level
* root_tags
* collocations
* audio
* derivatives

Sample Entry:

```json
{
  "id": 1,
  "word": "ABASH",
  "pronunciation": "uh BASH",
  "part_of_speech": "v",
  "definition": "to make ashamed; to embarrass",
  "quick_quiz_id": 1,
  "examples": [
    "Meredith felt abashed by her inability to remember her lines in the school chorus of \"Old McDonald Had a Farm.\"",
    "The unexpected compliment seemed to abash her, as she blushed and looked away."
  ],
  "bengali_meaning": "লজ্জিত করা, অপ্রস্তুত করা, বিব্রত করা",
  "synonyms": [
    "embarrass",
    "mortify",
    "humble",
    "disconcert",
    "shame"
  ],
  "antonyms": [
    "encourage",
    "embolden",
    "hearten",
    "reassure",
    "cheer"
  ],
  "mnemonic": "A BASH-ful person might ABASH easily, feeling embarrassed.",
  "level": "beginner",
  "root_tags": [],
  "collocations": [],
  "audio": "audio/ABASH.mp3",
  "derivatives": {}
}
```

Used For:

* Browse Words
* Search
* Word Details

---

## File 2: flashcards.json

Purpose:
Interactive study deck database featuring distinct front/back cards with phonetic pronunciations, contextual sentences, and mnemonics.

Approx Records:
822

Fields:

* word
* pronunciation
* part_of_speech
* front_side (word, pronunciation)
* back_side (bengali_meaning, definition, book_example, additional_example, additional_example_bengali, mnemonic_hint)
* synonyms
* antonyms

Sample Entry:

```json
{
  "word": "ABASH",
  "pronunciation": "uh BASH",
  "part_of_speech": "v",
  "front_side": {
    "word": "ABASH",
    "pronunciation": "uh BASH"
  },
  "back_side": {
    "bengali_meaning": "লজ্জিত করা, অপ্রস্তুত করা, বিব্রত করা",
    "definition": "to make ashamed; to embarrass",
    "book_example": "Meredith felt **abashed** by her inability to remember her lines in the school chorus of \"Old McDonald Had a Farm.\"",
    "additional_example": "The unexpected compliment seemed to abash her, as she blushed and looked away.",
    "additional_example_bengali": "অপ্রত্যাশিত প্রশংসা তাকে বিব্রত করেছিল বলে মনে হলো, কারণ সে লাল হয়ে অন্যদিকে তাকালো।",
    "mnemonic_hint": "ABASH শব্দটার মধ্যে 'Bash' (বকা) সাউন্ডটা আছে। যখন কেউ কাউকে বকা দেয় বা 'bash' করে, তখন সে হয়তো লজ্জা পায়। তাই, ABASH মানে কাউকে বিব্রত করা বা লজ্জিত করা।"
  },
  "synonyms": [
    "embarrass",
    "mortify",
    "humble",
    "disconcert",
    "shame"
  ],
  "antonyms": [
    "encourage",
    "embolden",
    "hearten",
    "reassure",
    "cheer"
  ]
}
```

Used For:

* Study/Review Cards
* Flashcards Studymode

---

## File 3: mcq_quizzes.json

Purpose:
Multiple-choice question quiz blocks designed to test word meaning with detailed explanations and Bengali clues.

Approx Records:
86 quizzes (containing 11 questions each, total 946 questions)

Fields:

* quiz_id
* title
* total_questions
* questions (question_number, question, options, correct_answer, bengali_clue, explanation, bengali_explanation)

Sample Entry:

```json
{
  "quiz_id": 1,
  "title": "MCQ Quiz #1",
  "total_questions": 11,
  "questions": [
    {
      "question_number": 1,
      "question": "Which of the following words matches the definition: 'to make ashamed; to embarrass'?",
      "options": [
        "ABJECT",
        "ABATE",
        "ABSOLUTE",
        "ABASH"
      ],
      "correct_answer": "ABASH",
      "bengali_clue": "বাংলা অর্থ: লজ্জিত করা, অপ্রস্তুত করা, বিব্রত করা",
      "explanation": "The correct answer is 'ABASH', which means 'to make ashamed; to embarrass'. For example, in context: \"Meredith felt abashed by her inability to remember her lines in the school chorus of \"Old McDonald Had a Farm.\"\"",
      "bengali_explanation": "সঠিক উত্তর হলো 'ABASH', যার অর্থ 'লজ্জিত করা, অপ্রস্তুত করা, বিব্রত করা'। যেমন বাক্যে প্রয়োগ: \"Meredith felt abashed by her inability to remember her lines in the school chorus of \"Old McDonald Had a Farm.\"\""
    }
  ]
}
```

Used For:

* Quiz study mode
* MCQ Test Evaluations

---

## File 4: quick_quizzes.json

Purpose:
Matching quizzes where users match multiple words with their corresponding definitions.

Approx Records:
86 quizzes (each testing 11 words)

Fields:

* quiz_id
* title
* matches (word_number, word)
* choices
* answer_key

Sample Entry:

```json
{
  "quiz_id": 1,
  "title": "Quick Quiz #1",
  "matches": [
    {
      "word_number": 1,
      "word": "abash"
    },
    {
      "word_number": 2,
      "word": "abate"
    }
  ],
  "choices": {
    "a": "to make ashamed; to embarrass",
    "b": "to subside; to reduce"
  },
  "answer_key": {
    "1": "a",
    "2": "b"
  }
}
```

Used For:

* Quick Matching Quizzes
* Recall Training

---

## File 5: final_exam.json

Purpose:
Exam-style completion exercises featuring multiple choice options and answer keys.

Approx Records:
48 exam drills (each containing 5 questions, total 240 questions)

Fields:

* drill_number
* drill_type
* instructions
* questions (question_number, sentence, options)
* answers

Sample Entry:

```json
{
  "drill_number": 1,
  "drill_type": "completions",
  "instructions": "For each question below, choose the word that best completes the meaning of the sentence.",
  "questions": [
    {
      "question_number": 1,
      "sentence": "Because Stan had been preoccupied during his dynamite-juggling demonstration, the jury felt that he was not _______ for the destruction of the audience.",
      "options": {
        "a": "decorous",
        "b": "decimated",
        "c": "indiscreet",
        "d": "culpable",
        "e": "indiscrete"
      }
    }
  ],
  "answers": {
    "1": "d"
  }
}
```

Used For:

* Exam Simulator
* Drill Mode

---

## File 6: mnemonics_database.json

Purpose:
Word-association and mnemonic study database using English/Bengali wordplay and extra bilingual examples.

Approx Records:
822

Fields:

* word
* mnemonic_english
* mnemonic_bengali
* additional_example
* additional_example_bengali
* bengali_meaning
* antonyms

Sample Entry:

```json
{
  "word": "ABASH",
  "mnemonic_english": "A BASH-ful person might ABASH easily, feeling embarrassed.",
  "mnemonic_bengali": "ABASH শব্দটার মধ্যে 'Bash' (বকা) সাউন্ডটা আছে। যখন কেউ কাউকে বকা দেয় বা 'bash' করে, তখন সে হয়তো লজ্জা পায়। তাই, ABASH মানে কাউকে বিব্রত করা বা লজ্জিত করা।",
  "additional_example": "The unexpected compliment seemed to abash her, as she blushed and looked away.",
  "additional_example_bengali": "অপ্রত্যাশিত প্রশংসা তাকে বিব্রত করেছিল বলে মনে হলো, কারণ সে লাল হয়ে অন্যদিকে তাকালো।",
  "bengali_meaning": "লজ্জিত করা, অপ্রস্তুত করা, বিব্রত করা",
  "antonyms": [
    "NONE"
  ]
}
```

Used For:

* Mnemonics Study Mode
* Word associations

---

## File 7: contextual_stories.json

Purpose:
Natural reading passages that contextually group multiple words together with parallel English/Bengali text.

Approx Records:
86 stories

Fields:

* quiz_id
* quiz_title
* words_covered
* story_english
* story_bengali
* vocabulary_mapping (word, definition, bengali_meaning)

Sample Entry:

```json
{
  "quiz_id": 1,
  "quiz_title": "Quick Quiz #1",
  "words_covered": [
    "ABASH",
    "ABATE"
  ],
  "story_english": "The king felt **abashed** when his army returned defeated. Hoping the political unrest would **abate**...",
  "story_bengali": "রাজা লজ্জিত (**abashed**) বোধ করলেন যখন তার সেনাবাহিনী পরাজিত হয়ে ফিরে এলো। রাজনৈতিক অস্থিরতা প্রশমিত (**abate**) হবে...",
  "vocabulary_mapping": [
    {
      "word": "ABASH",
      "definition": "to make ashamed; to embarrass",
      "bengali_meaning": "লজ্জিত করা, অপ্রস্তুত করা, বিব্রত করা"
    }
  ]
}
```

Used For:

* Contextual reading practice
* Bilingual translation studies

---

## File 8: word_roots.json

Purpose:
Root family listings mapping etymological prefix/root patterns to their meanings and related words.

Approx Records:
178 roots

Fields:

* root
* meaning
* words

Sample Entry:

```json
{
  "root": "A",
  "meaning": "without",
  "words": [
    "amoral",
    "atheist",
    "atypical",
    "anonymous"
  ]
}
```

Used For:

* Roots Study Mode
* Etymological associations

---

## File 9: advanced_sat_gre_quizzes.json

Purpose:
High-difficulty mock exam questions covering analogies, sentence completions, and contextual definitions.

Approx Records:
20 quizzes

Fields:

* quiz_id
* title
* total_questions
* analogies (question_number, stem, options, correct_answer, explanation, bengali_explanation)
* sentence_completions (question_number, sentence, options, correct_answer, explanation, bengali_explanation)
* contextual_lexical (question_number, question_type, sentence, target_word, options, correct_answer, explanation, bengali_explanation)

Sample Entry:

```json
{
  "quiz_id": 1,
  "title": "Advanced SAT/GRE Challenge #1",
  "total_questions": 15,
  "analogies": [
    {
      "question_number": 1,
      "stem": "ABRIDGE : LENGTH",
      "options": [
        "CONDENSE : SIZE",
        "AGGRAVATE : ANGER",
        "ABDICATE : POWER",
        "ACTIVATE : ENERGY"
      ],
      "correct_answer": "CONDENSE : SIZE",
      "explanation": "To abridge is to reduce length, just as to condense is to reduce size.",
      "bengali_explanation": "abridge মানে দৈর্ঘ্য কমানো, যেমন condense মানে আকার বা সাইজ কমানো।"
    }
  ],
  "sentence_completions": [],
  "contextual_lexical": []
}
```

Used For:

* Advanced SAT/GRE Practice
* Analogies/Sentence completion drills

---

## File 10: vocab_drills.json

Purpose:
Word-by-word practice modules comprising multiple drill types (spelling, definition matching, synonym matching, antonym matching, and sentence completions).

Approx Records:
822

Fields:

* word
* spelling
* definition_mcq
* synonym_mcq
* antonym_mcq
* sentence_completion
* synonyms
* antonyms
* bengali_meaning

Sample Entry:

```json
{
  "word": "ABASH",
  "spelling": {
    "drill_type": "spelling",
    "word": "ABASH",
    "pronunciation": "uh BASH",
    "definition": "to make ashamed; to embarrass",
    "clue": "a_a_h"
  },
  "definition_mcq": {
    "drill_type": "definition_mcq",
    "word": "ABASH",
    "options": [
      "to make ashamed; to embarrass",
      "to subside; to reduce"
    ],
    "correct_answer": "to make ashamed; to embarrass"
  },
  "synonym_mcq": {
    "drill_type": "synonym_matching",
    "word": "ABASH",
    "options": [
      "adore",
      "embarrass",
      "unaware",
      "emptiness"
    ],
    "correct_answer": "embarrass"
  },
  "antonym_mcq": {
    "drill_type": "antonym_matching",
    "word": "ABASH",
    "options": [
      "adore",
      "encourage",
      "unaware",
      "emptiness"
    ],
    "correct_answer": "encourage"
  },
  "sentence_completion": {
    "drill_type": "sentence_completion",
    "sentence": "Meredith felt **_______ed** by her inability to remember her lines...",
    "options": [
      "INVECTIVE",
      "IRREVOCABLE",
      "ABASH",
      "CONDUCIVE"
    ],
    "correct_answer": "ABASH"
  },
  "synonyms": [
    "embarrass",
    "mortify",
    "humble",
    "disconcert",
    "shame"
  ],
  "antonyms": [
    "encourage",
    "embolden",
    "hearten",
    "reassure",
    "cheer"
  ],
  "bengali_meaning": "লজ্জিত করা, অপ্রস্তুত করা, বিব্রত করা"
}
```

Used For:

* Spaced Repetition study
* Individualized word drills

---

## File 11: specialized_vocabulary.json

Purpose:
Specific grammar/vocabulary chapters targeting common usage pitfalls and thematic sections.

Approx Records:
7 chapters

Fields:

* chapter_number
* chapter_title
* entries (term, definition, examples)

Sample Entry:

```json
{
  "chapter_number": 7,
  "chapter_title": "Common Usage Errors",
  "entries": [
    {
      "term": "AMONG/BETWEEN",
      "definition": "Among is used with three or more; between is used with two.",
      "examples": [
        "The tin-can telephone line ran between the two houses.",
        "Mrs. Downs distributed the candy among the four of us."
      ]
    }
  ]
}
```

Used For:

* Specialized grammar tutorials
* Error prevention guides

---

## File 12: hit_parades.json

Purpose:
Frequency/importance-based ranking databases for SAT and GRE vocabulary prep.

Approx Records:
245 SAT / 198 GRE records

Fields:

* sat_hit_parade (word, definition, rank)
* gre_hit_parade (word, definition, rank)

Sample Entry:

```json
{
  "sat_hit_parade": [
    {
      "word": "indifferent",
      "definition": "not caring one way or the other; mediocre; lacking a preference; neutral",
      "rank": 1
    }
  ],
  "gre_hit_parade": [
    {
      "word": "equivocal",
      "definition": "ambiguous; intentionally confusing; capable of being interpreted in more than one way",
      "rank": 1
    }
  ]
}
```

Used For:

* High-priority targeted study
* Rank-based filtering

---

## Audio Assets

Approx Count:
822

Naming Convention:
`[UPPERCASE_WORD].mp3` (e.g. `ABASH.mp3`)

Usage:
Pronunciation audio files mapped directly inside the `audio` field of the `core_vocabulary.json` records (e.g. `"audio": "audio/ABASH.mp3"`).

---

## Existing Features Supported

* Browse Words
* Search
* Flashcards
* Quiz
* Exam
* Mnemonics
* Root Words exploration

---

## Planned Features

* Progress Tracking
* Bookmark
* Daily Revision
* AI Features

---

## Known Data Limitations

* The pronunciation schema uses phonetic respellings (e.g. "uh BASH") instead of international standardized IPA symbols.
* Placeholder synonyms/antonyms: Resolved. All 822 words now have unique, context-appropriate lowercase synonyms and antonyms.
* Translation gaps: Resolved. All 822 words now have unique, high-quality Bengali translations.
