'use strict';

/**
 * mathAssistant/detector.js
 *
 * Detects whether a question is mathematical and identifies
 * its concept category. Used as the first step in the AI engine.
 *
 * Returns: { isMath: boolean, concept: string, difficulty: string }
 */

// ── Keyword maps for each concept ─────────────────────────────
const CONCEPT_PATTERNS = [
    {
        concept: 'Fractions',
        difficulty: 'Medium',
        patterns: [/fraction/i, /numerator/i, /denominator/i, /\d+\/\d+/, /half|quarter|third/i, /over\s+\d/i]
    },
    {
        concept: 'Decimals',
        difficulty: 'Medium',
        patterns: [/decimal/i, /\.\d+/, /place value/i, /tenths|hundredths|thousandths/i]
    },
    {
        concept: 'Percentages',
        difficulty: 'Medium',
        patterns: [/percent|%/i, /out of 100/i, /ratio/i, /proportion/i]
    },
    {
        concept: 'Geometry',
        difficulty: 'Medium',
        patterns: [/area|perimeter|volume|circumference/i, /triangle|circle|square|rectangle|polygon|cube|cylinder|sphere/i, /angle|degree|radius|diameter/i, /shape/i]
    },
    // Multiplication BEFORE Algebra — catches "4 x 6" before algebra sees 'x'
    {
        concept: 'Multiplication',
        difficulty: 'Easy',
        patterns: [/multipl|times|product of|\*|×/i, /\btimes\b/i, /\d\s*[xX]\s*\d/]
    },
    {
        concept: 'Division',
        difficulty: 'Easy',
        patterns: [/divid|quotient|÷|\/(?!\d*[a-zA-Z])/i, /\bhow many\b.*\bin each\b/i, /split equally|share equally/i]
    },
    {
        concept: 'Subtraction',
        difficulty: 'Easy',
        patterns: [/subtract|minus|difference|less than|take away/i, /how much more|how much less/i, /\d+\s*-\s*\d+/]
    },
    {
        concept: 'Addition',
        difficulty: 'Easy',
        patterns: [/add|plus|sum|total|altogether|combined|and.*more/i, /\d+\s*\+\s*\d+/]
    },
    {
        concept: 'Algebra',
        difficulty: 'Hard',
        // Only match genuine algebra — never catch "4 x 6" (x as multiplication sign)
        patterns: [
            /solve for|find x|find the value/i,
            /equation/i,
            /variable|unknown/i,
            /algebra/i,
            /[a-zA-Z]\s*=\s*\d/,           // e.g. x = 5
            /\bif\b.*\b[a-zA-Z]\b.*=\s*\d/i // e.g. "If n + 3 = 7"
        ]
    },
    {
        concept: 'Word Problem',
        difficulty: 'Medium',
        patterns: [/how many|how much|how far|how long|how tall|how old/i, /bought|sold|spent|saved|earned|remaining|left/i, /train|car|speed|distance|time/i]
    }
];

// ── General math indicators ────────────────────────────────────
const MATH_INDICATORS = [
    /\d+\s*[\+\-\*\/×÷]\s*\d+/,        // arithmetic expression
    /\b\d+\b/,                           // has numbers
    /[\+\-×÷=%<>]/,                     // has operators
    /\d+\.\d+/,                          // decimals
    /\d+\/\d+/,                          // fractions
    /equal|solve|calculate|compute|find the|what is the value|evaluate/i
];

/**
 * Detect whether question text is mathematical and what concept it covers.
 * @param {string} text
 * @returns {{ isMath: boolean, concept: string, difficulty: string }}
 */
function detectMathConcept(text) {
    if (!text || typeof text !== 'string') {
        return { isMath: false, concept: 'Unknown', difficulty: 'Easy' };
    }

    const t = text.trim();

    // Check each concept pattern set — first match wins (ordered by specificity)
    for (const { concept, difficulty, patterns } of CONCEPT_PATTERNS) {
        if (patterns.some(p => p.test(t))) {
            return { isMath: true, concept, difficulty };
        }
    }

    // Fallback: does it look like a math question at all?
    const looksLikeMath = MATH_INDICATORS.some(p => p.test(t));
    if (looksLikeMath) {
        return { isMath: true, concept: 'Arithmetic', difficulty: 'Easy' };
    }

    return { isMath: false, concept: 'Unknown', difficulty: 'Easy' };
}

module.exports = { detectMathConcept };
