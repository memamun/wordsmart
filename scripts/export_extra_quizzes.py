import sqlite3
import json
import os

DB_PATH = 'app/assets/wordsmart.db'
OUT_DIR = 'web/public/data'

def export_vocab_drills(cursor):
    cursor.execute('SELECT word_id, bengali_meaning, spelling, definition_mcq, synonym_mcq, antonym_mcq, sentence_completion FROM vocab_drills')
    rows = cursor.fetchall()
    drills = []
    for row in rows:
        try:
            drill = {
                'word_id': row[0],
                'bengali_meaning': row[1],
                'spelling': json.loads(row[2]) if row[2] else None,
                'definition_mcq': json.loads(row[3]) if row[3] else None,
                'synonym_mcq': json.loads(row[4]) if row[4] else None,
                'antonym_mcq': json.loads(row[5]) if row[5] else None,
                'sentence_completion': json.loads(row[6]) if row[6] else None
            }
            drills.append(drill)
        except Exception as e:
            print(f"Error parsing JSON for vocab_drill {row[0]}: {e}")
            
    with open(os.path.join(OUT_DIR, 'vocab_drills.json'), 'w', encoding='utf-8') as f:
        json.dump(drills, f, ensure_ascii=False, indent=2)
    print(f"Exported {len(drills)} vocab drills.")

def export_quick_quizzes(cursor):
    cursor.execute('SELECT quiz_id, quiz_title, matches, choices, answer_key FROM quick_quizzes')
    rows = cursor.fetchall()
    quizzes = []
    for row in rows:
        try:
            quiz = {
                'quiz_id': row[0],
                'quiz_title': row[1],
                'matches': json.loads(row[2]) if row[2] else [],
                'choices': json.loads(row[3]) if row[3] else {},
                'answer_key': json.loads(row[4]) if row[4] else {}
            }
            quizzes.append(quiz)
        except Exception as e:
            print(f"Error parsing JSON for quick_quiz {row[0]}: {e}")
            
    with open(os.path.join(OUT_DIR, 'quick_quizzes.json'), 'w', encoding='utf-8') as f:
        json.dump(quizzes, f, ensure_ascii=False, indent=2)
    print(f"Exported {len(quizzes)} quick quizzes.")

def export_advanced_quizzes(cursor):
    cursor.execute('SELECT quiz_id, quiz_title, analogies, sentence_completions, contextual_lexical FROM advanced_sat_gre_quizzes')
    rows = cursor.fetchall()
    quizzes = []
    for row in rows:
        try:
            quiz = {
                'quiz_id': row[0],
                'quiz_title': row[1],
                'analogies': json.loads(row[2]) if row[2] else [],
                'sentence_completions': json.loads(row[3]) if row[3] else [],
                'contextual_lexical': json.loads(row[4]) if row[4] else []
            }
            quizzes.append(quiz)
        except Exception as e:
            print(f"Error parsing JSON for advanced_quiz {row[0]}: {e}")
            
    with open(os.path.join(OUT_DIR, 'advanced_quizzes.json'), 'w', encoding='utf-8') as f:
        json.dump(quizzes, f, ensure_ascii=False, indent=2)
    print(f"Exported {len(quizzes)} advanced quizzes.")

def main():
    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    export_vocab_drills(cursor)
    export_quick_quizzes(cursor)
    export_advanced_quizzes(cursor)
    
    conn.close()
    print("Export complete.")

if __name__ == '__main__':
    main()
