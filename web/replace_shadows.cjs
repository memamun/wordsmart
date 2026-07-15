const fs = require('fs');
const file = '/home/mamun/wordsmart/web/src/index.css';
let css = fs.readFileSync(file, 'utf8');

// Insert --shadow-color into :root
css = css.replace(/--border-muted:\s*#000000;/g, '--border-muted: #000000;\n  --shadow-color: #444444;');

// Insert --shadow-color into [data-theme='light']
css = css.replace(/\[data-theme='light'\]\s*\{([\s\S]*?)--border-muted:\s*#000000;/, "[data-theme='light'] {$1--border-muted: #000000;\n  --shadow-color: #000000;");

// Replace all box-shadow color
css = css.replace(/box-shadow:(.*?)#000000/g, 'box-shadow:$1var(--shadow-color)');

fs.writeFileSync(file, css);
console.log("Done");
