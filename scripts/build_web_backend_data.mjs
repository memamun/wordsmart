import { readFile, mkdir, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('web/public/data/core_vocabulary.json', root), 'utf8'));
const words = data.words.filter(word => word.id <= 822 && word.definition).map(({ id, word, synonyms = [], antonyms = [] }) => ({ id, word, synonyms, antonyms }));
if (words.length !== 822 || new Set(words.map(word => word.id)).size !== words.length) {
  throw new Error('Expected 822 unique core vocabulary records for ranked scoring.');
}
await mkdir(new URL('functions/data/', root), { recursive: true });
await writeFile(new URL('functions/data/vocabulary.json', root), JSON.stringify(words));
console.log(`Prepared ${words.length} vocabulary records for server-side scoring.`);
