import React from 'react';

/**
 * Renders inline markdown (bold, italic, bold-italic, code, strikethrough) into React elements.
 * @param {string} text 
 * @returns {React.ReactNode}
 */
export function renderMarkdown(text) {
  if (!text) return '';
  if (typeof text !== 'string') return text;

  // Split tokens by markdown syntax
  const regex = /(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|\*[^*]+?\*|___[^_]+?___|__[^_]+?__|_[^_]+?_|~~[^~]+?~~|`[^`]+?`)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Bold + Italic (***text*** or ___text___)
    if ((part.startsWith('***') && part.endsWith('***') && part.length >= 6) ||
        (part.startsWith('___') && part.endsWith('___') && part.length >= 6)) {
      return (
        <strong key={i} style={{ fontWeight: '800', fontStyle: 'italic', color: 'inherit' }}>
          {part.slice(3, -3)}
        </strong>
      );
    }

    // Bold (**text** or __text__)
    if ((part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
        (part.startsWith('__') && part.endsWith('__') && part.length >= 4)) {
      return (
        <strong key={i} style={{ fontWeight: '800', color: 'inherit' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic (*text* or _text_)
    if ((part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
        (part.startsWith('_') && part.endsWith('_') && part.length >= 2)) {
      return (
        <em key={i} style={{ fontStyle: 'italic', opacity: 0.95 }}>
          {part.slice(1, -1)}
        </em>
      );
    }

    // Strikethrough (~~text~~)
    if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
      return (
        <del key={i} style={{ opacity: 0.7 }}>
          {part.slice(2, -2)}
        </del>
      );
    }

    // Inline Code (`code`)
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} style={{ 
          fontFamily: 'monospace', 
          backgroundColor: 'var(--bg-surface-elevated)', 
          padding: '0.1rem 0.35rem', 
          borderRadius: '4px',
          fontSize: '0.9em'
        }}>
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

/**
 * Formats an example sentence to ensure clean quotes without duplicates.
 * @param {string} text 
 * @returns {string}
 */
export function formatExampleText(text) {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed;
  }
  return `"${trimmed}"`;
}

/**
 * Renders pure standard markdown (paragraphs, numbered lists, bullet lists, bold, italics).
 * Clean, distraction-free markdown without custom borders or decorations.
 * Properly maintains continuous numbered lists (1, 2, 3...) even with empty lines and sub-bullets.
 * @param {string} text 
 * @returns {React.ReactNode}
 */
export function renderRichMarkdown(text) {
  if (!text) return '';
  if (typeof text !== 'string') return text;

  const lines = text.split('\n');
  const elements = [];
  let currentList = null; // { type: 'ol' | 'ul', items: [] }
  let currentItem = null; // { num, text, subItems: [] }

  const flushItem = () => {
    if (currentItem && currentList) {
      currentList.items.push(currentItem);
      currentItem = null;
    }
  };

  const flushList = () => {
    flushItem();
    if (currentList && currentList.items.length > 0) {
      if (currentList.type === 'ol') {
        elements.push(
          <ol 
            key={`ol-${elements.length}`} 
            style={{ 
              paddingLeft: '1.45rem', 
              margin: '0.65rem 0', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.85rem' 
            }}
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} value={item.num || (idx + 1)} style={{ lineHeight: '1.65' }}>
                <div>{renderMarkdown(item.text)}</div>
                {item.subItems && item.subItems.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.35rem' }}>
                    {item.subItems.map((sub, sIdx) => (
                      <div 
                        key={sIdx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '0.45rem', 
                          color: 'var(--text-secondary)',
                          fontSize: '0.92rem',
                          lineHeight: '1.6'
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>•</span>
                        <span>{renderMarkdown(sub)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul 
            key={`ul-${elements.length}`} 
            style={{ 
              paddingLeft: '1.4rem', 
              margin: '0.5rem 0', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.45rem' 
            }}
          >
            {currentList.items.map((item, idx) => (
              <li key={idx} style={{ lineHeight: '1.65' }}>
                <div>{renderMarkdown(item.text)}</div>
              </li>
            ))}
          </ul>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      // Allow empty lines within lists (loose lists) without breaking numbering
      continue;
    }

    // Numbered list item: "1. ", "2. ", "1) ", "2) "
    const olMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      } else {
        flushItem();
      }
      currentItem = {
        num: parseInt(olMatch[1], 10),
        text: olMatch[2],
        subItems: []
      };
      continue;
    }

    // Bullet list item: "- ", "* ", "• "
    const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      // If we are already inside a numbered list item, attach this bullet as a sub-item!
      if (currentList && currentList.type === 'ol' && currentItem) {
        currentItem.subItems.push(ulMatch[1]);
        continue;
      }

      // Otherwise it's a top-level bullet list
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      } else {
        flushItem();
      }
      currentItem = {
        text: ulMatch[1],
        subItems: []
      };
      continue;
    }

    // Indented sub-line under a list item (e.g. translation or note)
    if (currentItem && (rawLine.startsWith('   ') || rawLine.startsWith('\t') || rawLine.startsWith('  '))) {
      currentItem.subItems.push(trimmed);
      continue;
    }

    flushList();

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h-${i}`} style={{ margin: '0.6rem 0 0.25rem 0', fontSize: '0.98rem', fontWeight: '800' }}>
          {renderMarkdown(trimmed.slice(4))}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h-${i}`} style={{ margin: '0.75rem 0 0.35rem 0', fontSize: '1.08rem', fontWeight: '900' }}>
          {renderMarkdown(trimmed.slice(3))}
        </h3>
      );
    } else {
      elements.push(
        <p key={`p-${i}`} style={{ margin: '0.35rem 0', lineHeight: '1.65' }}>
          {renderMarkdown(trimmed)}
        </p>
      );
    }
  }

  flushList();
  return elements;
}
