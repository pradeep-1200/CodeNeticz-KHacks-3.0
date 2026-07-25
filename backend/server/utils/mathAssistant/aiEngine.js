'use strict';

/**
 * AI Visual Learning Engine — Phase 7 (v2)
 *
 * Calls Gemini to return a rich structured JSON response.
 * The key upgrade: instead of returning only a visualization TYPE string,
 * the AI now returns a full `vizData` object with ALL pre-extracted numbers
 * needed for exact rendering — no client-side guessing.
 *
 * Data contract:
 *   visualization: string (type key)
 *   vizData: object (all numbers/params for that type — see schema below)
 *   steps: [{ type, description }]
 *   practiceQuestion: string
 *
 * Falls back to the deterministic engine if the AI call fails.
 */

const https = require('https');
const { detectMathConcept } = require('./detector');
const { generateMathAssistance: legacyEngine } = require('./engine');

// ── Gemini API ─────────────────────────────────────────────────
const GEMINI_MODEL = 'gemini-2.0-flash';

function callGemini(prompt) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return reject(new Error('GEMINI_API_KEY not configured'));

        const body = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1500,
                responseMimeType: 'application/json'
            }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) return reject(new Error(parsed.error.message || 'Gemini API error'));
                    const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) return reject(new Error('Empty response from Gemini'));
                    resolve(text);
                } catch (e) {
                    reject(new Error('Failed to parse Gemini response: ' + e.message));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(25000, () => { req.destroy(); reject(new Error('Gemini request timed out')); });
        req.write(body);
        req.end();
    });
}

// ── Prompt ─────────────────────────────────────────────────────
function buildPrompt({ question, concept, difficulty, options }) {
    const optionsText = options && options.length
        ? `\nAnswer options (DO NOT select or reveal which is correct): ${options.join(', ')}`
        : '';

    return `You are an AI Visual Mathematics Teacher for students with dyscalculia.
Your ONLY job: teach the CONCEPT visually. NEVER reveal the answer.

QUESTION: "${question}"${optionsText}
CONCEPT: ${concept}
DIFFICULTY: ${difficulty}

═══════════════════════════════════════════════
STRICT RULES
═══════════════════════════════════════════════
1. NEVER state, calculate, or hint at the final answer.
2. Return ONLY valid JSON — no markdown, no prose.
3. Every number in vizData must come DIRECTLY from the question.
4. Steps must match vizData exactly — reference the same numbers.
5. Last step MUST say "Now solve it yourself!" or similar.

═══════════════════════════════════════════════
VISUALIZATION SCHEMAS — pick the best one
═══════════════════════════════════════════════

counting_blocks  → small addition (both operands ≤ 20)
  vizData: { "groups": [<first number>, <second number>], "symbol": "⭐" }

number_line  → addition with larger numbers (use jumps strategy)
  vizData: { "start": <first operand>, "jumps": [<tens part>, <ones part>], "direction": "forward",
             "rangeMin": <start - 5, rounded to nearest 5>, "rangeMax": <result + 5, rounded up to nearest 5>, "rangeStep": 5 }
  EXAMPLE for 77 + 23: start=77, jumps=[20,3], rangeMin=75, rangeMax=105, rangeStep=5

number_line_backward  → subtraction
  vizData: { "start": <minuend>, "jumps": [<tens part of subtrahend>, <ones part>], "direction": "backward",
             "rangeMin": <result - 5, rounded down>, "rangeMax": <minuend + 5, rounded up>, "rangeStep": 5 }

cross_out_objects  → small subtraction (minuend ≤ 20)
  vizData: { "total": <minuend>, "remove": <subtrahend>, "symbol": "🍎" }

multiplication_array  → multiplication
  vizData: { "rows": <first factor>, "columns": <second factor> }

equal_groups  → division
  vizData: { "total": <dividend>, "groups": <divisor> }

fraction_circle  → fractions
  vizData: { "fractions": [{ "numerator": <n>, "denominator": <d> }] }
  (include up to 2 fractions if the question has two)

fraction_bar  → fraction comparison or addition
  vizData: { "fractions": [{ "numerator": <n>, "denominator": <d> }, { "numerator": <n2>, "denominator": <d2> }] }

place_value  → place value or multi-digit addition/subtraction
  vizData: { "numbers": [<first number>, <second number>] }

hundred_grid  → percentages
  vizData: { "percentage": <exact percentage integer from question> }

geometry  → geometry
  vizData: { "shape": "rectangle|triangle|circle|square|cube", "dimensions": { "length": <l>, "width": <w> } }
  (use actual dimension names: length/width, or base/height, or radius, or side)

word_problem_objects  → word problems
  vizData: { "symbol": "<best emoji for the object>", "groups": [<first quantity>, <second quantity>], "operation": "add|subtract|multiply|divide" }

balance_scale  → algebra
  vizData: { "variable": "<letter>", "knownValue": <number>, "total": <number> }

═══════════════════════════════════════════════
STEP RULES
═══════════════════════════════════════════════
- 3 to 5 steps total
- Each step references the actual numbers from the question
- type "visual": describes what is shown in the diagram (must match vizData)
- type "instruction": tells student what to do next
- NEVER reveal the answer in any step

═══════════════════════════════════════════════
OUTPUT — respond with EXACTLY this JSON, no wrapper:
═══════════════════════════════════════════════
{
  "concept": "${concept}",
  "difficulty": "${difficulty}",
  "visualization": "<type key from list above>",
  "vizData": { <schema fields for chosen type> },
  "title": "<short engaging title, max 60 chars>",
  "steps": [
    { "type": "visual|instruction", "description": "<text referencing actual numbers>" }
  ],
  "practiceQuestion": "<similar problem with DIFFERENT numbers — no answer>"
}`;
}

// ── Validate vizData for each type ────────────────────────────
const VIZDATA_VALIDATORS = {
    counting_blocks:      (d) => Array.isArray(d.groups) && d.groups.length >= 2,
    number_line:          (d) => typeof d.start === 'number' && Array.isArray(d.jumps) && d.jumps.length >= 1,
    number_line_backward: (d) => typeof d.start === 'number' && Array.isArray(d.jumps) && d.jumps.length >= 1,
    cross_out_objects:    (d) => typeof d.total === 'number' && typeof d.remove === 'number',
    multiplication_array: (d) => typeof d.rows === 'number' && typeof d.columns === 'number',
    equal_groups:         (d) => typeof d.total === 'number' && typeof d.groups === 'number',
    fraction_circle:      (d) => Array.isArray(d.fractions) && d.fractions.length >= 1,
    fraction_bar:         (d) => Array.isArray(d.fractions) && d.fractions.length >= 1,
    place_value:          (d) => Array.isArray(d.numbers) && d.numbers.length >= 1,
    hundred_grid:         (d) => typeof d.percentage === 'number',
    geometry:             (d) => typeof d.shape === 'string' && d.dimensions && typeof d.dimensions === 'object',
    word_problem_objects: (d) => Array.isArray(d.groups) && d.groups.length >= 1,
    balance_scale:        (d) => typeof d.variable === 'string'
};

const VALID_TYPES = Object.keys(VIZDATA_VALIDATORS);

// ── Parse and validate AI response ────────────────────────────
function parseAiResponse(raw, concept, difficulty) {
    let jsonStr = (raw || '').trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();

    const parsed = JSON.parse(jsonStr);

    if (!parsed.visualization || !parsed.vizData || !Array.isArray(parsed.steps)) {
        throw new Error('AI response missing required fields: visualization, vizData, steps');
    }

    // Normalize type key
    const vizType = String(parsed.visualization).toLowerCase().trim();
    if (!VALID_TYPES.includes(vizType)) {
        throw new Error(`Unknown visualization type: "${vizType}"`);
    }

    // Validate vizData shape for chosen type
    const validator = VIZDATA_VALIDATORS[vizType];
    if (!validator(parsed.vizData)) {
        throw new Error(`vizData invalid for type "${vizType}": ${JSON.stringify(parsed.vizData)}`);
    }

    // Sanitize steps
    const steps = (parsed.steps || [])
        .filter(s => s && s.description)
        .map(s => ({
            type: ['visual', 'instruction'].includes(String(s.type)) ? String(s.type) : 'visual',
            description: String(s.description).slice(0, 400)
        }));

    if (steps.length === 0) throw new Error('AI response has no valid steps');

    return {
        isMath:           true,
        concept:          String(parsed.concept   || concept).slice(0, 60),
        difficulty:       ['Easy', 'Medium', 'Hard'].includes(parsed.difficulty) ? parsed.difficulty : difficulty,
        visualization:    vizType,
        vizData:          parsed.vizData,
        title:            String(parsed.title || 'Let\'s understand this visually').slice(0, 80),
        steps,
        practiceQuestion: parsed.practiceQuestion ? String(parsed.practiceQuestion).slice(0, 300) : null
    };
}

// ── Fallback: build vizData from the legacy rule-based engine ──
function buildFallbackVizData(concept, question) {
    // Extract numbers directly from the question string
    const allNums = [...question.matchAll(/\b(\d+(?:\.\d+)?)\b/g)]
        .map(m => parseFloat(m[1]))
        .filter(n => !isNaN(n));

    const [a = 5, b = 3] = allNums;

    // Build vizData for each concept using actual question numbers
    switch (concept) {
        case 'Addition': {
            if (a > 20 || b > 20) {
                // Decomposition strategy for large numbers
                const tens = Math.floor(b / 10) * 10;
                const ones = b % 10;
                const jumps = tens > 0 && ones > 0 ? [tens, ones] : [b];
                const result = a + b;
                return {
                    type: 'number_line',
                    vizData: {
                        start: a,
                        jumps,
                        direction: 'forward',
                        rangeMin: Math.floor((a - 5) / 5) * 5,
                        rangeMax: Math.ceil((result + 5) / 5) * 5,
                        rangeStep: 5
                    }
                };
            }
            return {
                type: 'counting_blocks',
                vizData: { groups: [a, b], symbol: '⭐' }
            };
        }

        case 'Subtraction': {
            const diff = a - b;
            if (a <= 20) {
                return {
                    type: 'cross_out_objects',
                    vizData: { total: Math.round(a), remove: Math.round(b), symbol: '🍎' }
                };
            }
            const tens = Math.floor(b / 10) * 10;
            const ones = b % 10;
            const jumps = tens > 0 && ones > 0 ? [tens, ones] : [b];
            return {
                type: 'number_line_backward',
                vizData: {
                    start: Math.round(a),
                    jumps,
                    direction: 'backward',
                    rangeMin: Math.floor((diff - 5) / 5) * 5,
                    rangeMax: Math.ceil((a + 5) / 5) * 5,
                    rangeStep: 5
                }
            };
        }

        case 'Multiplication':
            return {
                type: 'multiplication_array',
                vizData: { rows: Math.min(Math.round(a), 10), columns: Math.min(Math.round(b), 10) }
            };

        case 'Division':
            return {
                type: 'equal_groups',
                vizData: { total: Math.round(a), groups: Math.round(b) }
            };

        case 'Fractions': {
            const fracMatches = [...question.matchAll(/(\d+)\s*\/\s*(\d+)/g)];
            const fractions = fracMatches.map(m => ({ numerator: parseInt(m[1]), denominator: parseInt(m[2]) }));
            if (fractions.length === 0) fractions.push({ numerator: 1, denominator: 4 });
            return {
                type: fractions.length >= 2 ? 'fraction_bar' : 'fraction_circle',
                vizData: { fractions }
            };
        }

        case 'Percentages': {
            const pctMatch = question.match(/(\d+)\s*%/);
            const pct = pctMatch ? Math.min(parseInt(pctMatch[1]), 100) : Math.min(Math.round(a), 100);
            return { type: 'hundred_grid', vizData: { percentage: pct } };
        }

        case 'Decimals':
        case 'Place Value':
            return { type: 'place_value', vizData: { numbers: allNums.slice(0, 2) } };

        case 'Geometry': {
            const shape = /circle/i.test(question) ? 'circle'
                : /triangle/i.test(question) ? 'triangle'
                : /square/i.test(question) ? 'square'
                : 'rectangle';
            const dims = shape === 'circle'
                ? { radius: a }
                : shape === 'triangle'
                ? { base: a, height: b }
                : shape === 'square'
                ? { side: a }
                : { length: a, width: b };
            return { type: 'geometry', vizData: { shape, dimensions: dims } };
        }

        case 'Word Problem': {
            const op = /sold|gave|lost|remove|take|eaten|left|remaining|spent/i.test(question)
                ? 'subtract'
                : /times|groups|multiply/i.test(question)
                ? 'multiply'
                : /share|split|each|divide/i.test(question)
                ? 'divide'
                : 'add';
            const emoji = /apple/i.test(question) ? '🍎'
                : /ball/i.test(question) ? '⚽'
                : /book/i.test(question) ? '📚'
                : /cookie/i.test(question) ? '🍪'
                : '🍎';
            return {
                type: 'word_problem_objects',
                vizData: { symbol: emoji, groups: [Math.min(a, 15), Math.min(b, 15)], operation: op }
            };
        }

        case 'Algebra': {
            const varMatch = question.match(/([a-zA-Z])\s*[\+\-\*\/]\s*(\d+)\s*=\s*(\d+)/);
            return {
                type: 'balance_scale',
                vizData: {
                    variable: varMatch ? varMatch[1] : 'x',
                    knownValue: varMatch ? parseInt(varMatch[2]) : Math.round(b),
                    total: varMatch ? parseInt(varMatch[3]) : Math.round(a)
                }
            };
        }

        default:
            return {
                type: 'counting_blocks',
                vizData: { groups: [Math.min(Math.round(a), 20), Math.min(Math.round(b), 20)], symbol: '⭐' }
            };
    }
}

// ── Build fallback steps referencing actual numbers ─────────────
function buildFallbackSteps(concept, question, vizType, vizData) {
    const nums = [...question.matchAll(/\b(\d+(?:\.\d+)?)\b/g)]
        .map(m => parseFloat(m[1]))
        .filter(n => !isNaN(n));
    const [a = 5, b = 3] = nums;

    switch (concept) {
        case 'Addition':
            if (vizType === 'number_line') {
                const jumps = vizData.jumps || [b];
                return [
                    { type: 'visual', description: `Find ${a} on the number line — that's your starting point.` },
                    { type: 'visual', description: `Jump forward ${jumps[0]}. Mark where you land.` },
                    ...(jumps[1] ? [{ type: 'visual', description: `Now jump forward ${jumps[1]} more. Mark that spot.` }] : []),
                    { type: 'instruction', description: 'What number are you at? Count the position and write your answer.' }
                ];
            }
            return [
                { type: 'visual', description: `Here are ${a} blocks in the first group.` },
                { type: 'visual', description: `Here are ${b} blocks in the second group.` },
                { type: 'instruction', description: 'Count ALL the blocks together. What is the total?' }
            ];

        case 'Subtraction':
            if (vizType === 'number_line_backward') {
                const jumps = vizData.jumps || [b];
                return [
                    { type: 'visual', description: `Start at ${a} on the number line.` },
                    { type: 'visual', description: `Jump backward ${jumps[0]}. Mark where you land.` },
                    ...(jumps[1] ? [{ type: 'visual', description: `Jump backward ${jumps[1]} more.` }] : []),
                    { type: 'instruction', description: 'Where did you land? That is your answer — write it down.' }
                ];
            }
            return [
                { type: 'visual', description: `Here are ${a} objects — count them.` },
                { type: 'visual', description: `Click to cross out ${b} of them.` },
                { type: 'instruction', description: 'How many are left? Count the ones not crossed out.' }
            ];

        case 'Multiplication':
            return [
                { type: 'visual', description: `Look at the grid: ${a} rows, each with ${b} stars.` },
                { type: 'visual', description: `Each row is revealed one by one. Watch the pattern.` },
                { type: 'instruction', description: `Count all the stars in ${a} complete rows. What is the total?` }
            ];

        case 'Division':
            return [
                { type: 'visual', description: `You have ${a} objects to split into ${b} equal groups.` },
                { type: 'visual', description: 'Reveal each group one at a time.' },
                { type: 'instruction', description: 'How many objects ended up in each group?' }
            ];

        case 'Fractions': {
            const f = (vizData.fractions || [{ numerator: 1, denominator: 4 }])[0];
            return [
                { type: 'visual', description: `The whole is divided into ${f.denominator} equal parts.` },
                { type: 'visual', description: `${f.numerator} part${f.numerator !== 1 ? 's are' : ' is'} shaded — that represents ${f.numerator}/${f.denominator}.` },
                { type: 'instruction', description: 'Use this picture to work out the answer to your question.' }
            ];
        }

        case 'Percentages':
            return [
                { type: 'visual', description: `The grid has 100 squares — each square = 1%.` },
                { type: 'visual', description: `${vizData.percentage} squares are highlighted, showing ${vizData.percentage}%.` },
                { type: 'instruction', description: 'Now use this to calculate what that percentage equals in your question.' }
            ];

        case 'Geometry':
            return [
                { type: 'visual', description: `Here is your ${vizData.shape} with its measurements labelled.` },
                { type: 'instruction', description: 'Look at the formula hint. Substitute the labelled numbers and calculate.' }
            ];

        case 'Word Problem':
            return [
                { type: 'visual', description: `Start with ${vizData.groups[0]} objects shown here.` },
                { type: 'visual', description: `The second group has ${vizData.groups[1]} objects.` },
                { type: 'instruction', description: 'Count the final number of objects after the action in your question.' }
            ];

        default:
            return [
                { type: 'visual', description: `The diagram shows the numbers ${a} and ${b} from your question.` },
                { type: 'instruction', description: 'Use what you see to work out the answer yourself.' }
            ];
    }
}

// ── Fallback practice question generator ──────────────────────
function buildFallbackPractice(concept, question) {
    const nums = [...question.matchAll(/\b(\d+)\b/g)]
        .map(m => parseInt(m[1]))
        .filter(n => !isNaN(n));
    const [a = 12, b = 7] = nums;
    const pa = Math.round(a * 1.3 + 4);
    const pb = Math.round(b * 1.2 + 3);

    const map = {
        Addition:       `${pa} + ${pb} = ?`,
        Subtraction:    `${pa + pb} − ${pb} = ?`,
        Multiplication: `${Math.min(pa, 9)} × ${Math.min(pb, 9)} = ?`,
        Division:       `${pa * Math.min(pb, 6)} ÷ ${Math.min(pb, 6)} = ?`,
        Fractions:      `What is ${Math.min(pa % 5 + 1, 3)}/${Math.min(pb % 6 + 2, 8)} of 24?`,
        Percentages:    `What is ${Math.min(pa % 50 + 5, 75)}% of ${pb * 2}?`,
        Geometry:       `Find the area of a rectangle with length ${pa} and width ${pb}.`,
        Algebra:        `If x + ${pb} = ${pa + pb}, what is x?`,
        'Word Problem':  `Sam had ${pa} items. He gave away ${pb}. How many remain?`,
    };
    return map[concept] || `${pa} + ${pb} = ?`;
}

/**
 * Main entry point.
 * Calls Gemini; falls back to deterministic engine on any failure.
 */
async function generateVisualLearning({ question, questionType, options, studentAnswer, accessibilityProfile }) {
    const { isMath, concept, difficulty } = detectMathConcept(question);

    if (!isMath) {
        return { isMath: false, concept: 'Unknown', difficulty: 'Easy',
                 visualization: null, vizData: null, title: '', steps: [], practiceQuestion: null };
    }

    // ── Try AI ────────────────────────────────────────────────
    try {
        const prompt = buildPrompt({ question, concept, difficulty, options });
        const raw    = await callGemini(prompt);
        const result = parseAiResponse(raw, concept, difficulty);
        result._source = 'ai';
        return result;
    } catch (err) {
        // Log and fall through to deterministic fallback
        try {
            const logger = require('../logger');
            logger.warn(`AI engine fallback: ${err.message}`, { category: 'ai-engine', question: question.slice(0, 80) });
        } catch {
            // logger not available in all contexts — silence
        }

        // ── Deterministic fallback ────────────────────────────
        const { type, vizData } = buildFallbackVizData(concept, question);
        const steps = buildFallbackSteps(concept, question, type, vizData);
        const practiceQuestion = buildFallbackPractice(concept, question);

        return {
            isMath: true,
            concept,
            difficulty,
            visualization: type,
            vizData,
            title: `Let's understand ${concept} visually`,
            steps,
            practiceQuestion,
            _source: 'fallback'
        };
    }
}

module.exports = { generateVisualLearning };
