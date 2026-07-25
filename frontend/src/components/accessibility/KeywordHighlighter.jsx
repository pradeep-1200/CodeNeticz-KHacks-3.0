/**
 * KeywordHighlighter — Phase 5
 *
 * Visually emphasizes important words in a question.
 * Activated automatically when keywordHighlighting = true.
 * Keywords are extracted client-side — no AI required.
 *
 * Strategy: highlight nouns, numbers, and words in ALL CAPS
 * while skipping common stop words.
 */

import React, { useMemo } from 'react';

// Common English stop words to skip
const STOP_WORDS = new Set([
    'a','an','the','and','or','but','is','are','was','were','be','been','being',
    'have','has','had','do','does','did','will','would','could','should','may',
    'might','shall','can','need','dare','ought','used','to','of','in','for','on',
    'with','at','by','from','as','into','through','during','before','after',
    'above','below','between','out','off','over','under','again','further',
    'then','once','here','there','when','where','why','how','all','both','each',
    'few','more','most','other','some','such','no','not','only','same','so',
    'than','too','very','just','what','which','who','this','that','these','those',
    'i','you','he','she','it','we','they','me','him','her','us','them','my','your',
    'his','its','our','their','if','about','up','down','per','its'
]);

/**
 * Returns true if the bare word (lowercased, stripped of punctuation)
 * should be highlighted.
 */
function isKeyword(raw) {
    // Always highlight numbers
    if (/\d/.test(raw)) return true;
    // Always highlight ALL-CAPS words (abbreviations / acronyms)
    const stripped = raw.replace(/[^A-Za-z]/g, '');
    if (stripped.length >= 2 && stripped === stripped.toUpperCase()) return true;
    // Skip stop words
    const lower = stripped.toLowerCase();
    if (STOP_WORDS.has(lower)) return false;
    // Highlight longer words (likely meaningful content words)
    if (stripped.length >= 5) return true;
    return false;
}

const KeywordHighlighter = ({ text }) => {
    const segments = useMemo(() => {
        if (!text) return [];
        // Split on word boundaries while preserving whitespace/punctuation
        return text.split(/(\s+)/).map((chunk, i) => {
            if (/^\s+$/.test(chunk)) return { key: i, text: chunk, highlight: false };
            const highlight = isKeyword(chunk);
            return { key: i, text: chunk, highlight };
        });
    }, [text]);

    return (
        <span aria-label={text}>
            {segments.map(seg =>
                seg.highlight ? (
                    <mark
                        key={seg.key}
                        className="bg-amber-400/25 text-[var(--text-primary)] rounded-sm px-0.5 font-bold not-italic"
                        style={{ textDecoration: 'none' }}
                    >
                        {seg.text}
                    </mark>
                ) : (
                    <span key={seg.key}>{seg.text}</span>
                )
            )}
        </span>
    );
};

export default KeywordHighlighter;
