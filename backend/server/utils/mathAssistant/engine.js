'use strict';

/**
 * mathAssistant/engine.js
 *
 * Rule-based AI Math Assistant engine.
 * Takes a question + detected concept and produces:
 *   - A plain-language explanation
 *   - Step-by-step guidance (never reveals the final answer)
 *   - Four progressive hints
 *   - A visualization type identifier
 *   - A similar practice question
 *
 * No external AI API is required. All logic is deterministic.
 */

const { detectMathConcept } = require('./detector');

// ── Visualization type by concept ─────────────────────────────
const VISUALIZATION_MAP = {
    Addition:       'number_line',
    Subtraction:    'number_line_backward',
    Multiplication: 'array_grid',
    Division:       'equal_groups',
    Fractions:      'fraction_circle',
    Decimals:       'place_value_chart',
    Percentages:    'hundred_grid',
    Geometry:       'shape_diagram',
    Algebra:        'balance_scale',
    'Word Problem':  'object_groups',
    Arithmetic:     'number_line'
};

// ── Per-concept step templates ─────────────────────────────────
// Each template is a function that receives extracted numbers
// from the question and returns an array of step strings.
const STEP_TEMPLATES = {
    Addition: (nums, q) => {
        const [a, b] = nums;
        if (a && b) {
            const tens = Math.floor(b / 10) * 10;
            const ones = b % 10;
            const steps = [`Start with ${a}.`];
            if (tens > 0 && ones > 0) {
                steps.push(`Add ${tens} first → you get ${a + tens}.`);
                steps.push(`Now add the remaining ${ones}.`);
            } else {
                steps.push(`Count up ${b} from ${a}.`);
            }
            steps.push('Now calculate the total yourself.');
            return steps;
        }
        return ['Identify the two numbers being added.', 'Start from the larger number.', 'Count up by the smaller number.', 'Write down your total.'];
    },

    Subtraction: (nums, q) => {
        const [a, b] = nums;
        if (a && b) {
            return [
                `Start at ${a} on the number line.`,
                `Move ${b} steps to the left.`,
                'The number you land on is the answer.',
                'Try it — where do you land?'
            ];
        }
        return ['Find the larger number.', 'Count backward by the smaller number.', 'Stop and record the value.', 'Check your work.'];
    },

    Multiplication: (nums, q) => {
        const [a, b] = nums;
        if (a && b) {
            return [
                `Think of ${a} × ${b} as ${a} groups of ${b}.`,
                `Draw ${a} rows with ${b} objects in each row.`,
                `Count all objects — or add ${b} exactly ${a} times.`,
                'What is the total?'
            ];
        }
        return ['Think of multiplication as repeated addition.', 'Draw groups to visualize.', 'Count the total objects.', 'Record your answer.'];
    },

    Division: (nums, q) => {
        const [a, b] = nums;
        if (a && b) {
            return [
                `You need to split ${a} into equal groups of ${b}.`,
                `How many groups of ${b} fit into ${a}?`,
                `Count: ${b}, ${b * 2}, ${b * 3}… until you reach ${a}.`,
                'How many counts did it take?'
            ];
        }
        return ['Find the total being divided.', 'Identify the group size.', 'Count how many groups fit.', 'Record the number of groups.'];
    },

    Fractions: (nums, q) => [
        'Identify the numerator (top number) and denominator (bottom number).',
        'The denominator tells you how many equal parts the whole is divided into.',
        'The numerator tells you how many of those parts you have.',
        'Now use this to work out the answer.'
    ],

    Decimals: (nums, q) => [
        'Look at the decimal point — it separates whole numbers from parts.',
        'The digit right after the decimal is the tenths place.',
        'Line up the decimal points before adding or subtracting.',
        'Now solve the problem step by step.'
    ],

    Percentages: (nums, q) => {
        const [a] = nums;
        return [
            'Remember: percent means "out of 100".',
            `To find a percentage of ${a || 'a number'}, divide by 100 first.`,
            'Then multiply by the percentage value.',
            'Work through the calculation yourself.'
        ];
    },

    Geometry: (nums, q) => {
        const lower = q.toLowerCase();
        if (/area/.test(lower))   return ['Identify the shape.', 'Recall the area formula for that shape.', 'Substitute the given measurements.', 'Calculate step by step.'];
        if (/perimeter/.test(lower)) return ['Identify all the sides.', 'Add the lengths together.', 'Check the units match.', 'Write the total.'];
        if (/angle/.test(lower))  return ['Identify which angles are given.', 'Recall angle rules (triangle = 180°, straight line = 180°).', 'Subtract known angles from the total.', 'Record the missing angle.'];
        return ['Identify the shape and its properties.', 'Choose the correct formula.', 'Substitute the values.', 'Calculate the result.'];
    },

    Algebra: (nums, q) => [
        'Identify the unknown — what are you solving for?',
        'Write the equation using the information given.',
        'Perform the same operation on both sides to isolate the unknown.',
        'Check your answer by substituting back into the original equation.'
    ],

    'Word Problem': (nums, q) => [
        'Read the question carefully and identify what is being asked.',
        'Pick out the key numbers and the relationship between them.',
        'Decide which operation to use: add, subtract, multiply, or divide.',
        'Solve step by step and check that your answer makes sense.'
    ],

    Arithmetic: (nums, q) => [
        'Identify the numbers and the operation in the question.',
        'Break the calculation into smaller, manageable steps.',
        'Work through each step carefully.',
        'Record your final answer.'
    ]
};

// ── Hint templates ─────────────────────────────────────────────
const HINT_TEMPLATES = {
    Addition:       ['What are the two numbers you need to combine?', 'Try breaking the second number into tens and ones.', 'Start from the larger number and count up.', 'Double-check by counting all objects together.'],
    Subtraction:    ['What is the starting value?', 'Think of subtraction as counting backward.', 'Use a number line to help.', 'Check: starting value minus your answer should equal the other number.'],
    Multiplication: ['What does multiplication really mean?', 'Think of it as repeated addition.', 'Try drawing equal groups.', 'Does your answer make sense — is it bigger than both numbers?'],
    Division:       ['What is being shared or split?', 'How many groups are you splitting into?', 'Use multiplication to check your division.', 'Ask: what times the divisor equals the dividend?'],
    Fractions:      ['What does the bottom number (denominator) tell you?', 'What does the top number (numerator) represent?', 'Can you draw a shape divided into equal parts?', 'Make sure denominators match before adding or subtracting.'],
    Decimals:       ['Where is the decimal point?', 'What is the value of the first digit after the decimal?', 'Try using a place value chart.', 'Line up the decimals before calculating.'],
    Percentages:    ['"Percent" means per hundred — can you write it as a fraction?', 'Divide by 100 to find 1%.', 'Multiply 1% by the percentage you need.', 'Check: does your answer seem reasonable?'],
    Geometry:       ['What shape are you working with?', 'What formula applies to this shape?', 'Have you substituted all the measurements correctly?', 'Check your units — are they consistent?'],
    Algebra:        ['What is the unknown value?', 'Can you write an equation?', 'What operation undoes the operation in the equation?', 'Substitute your answer back to verify.'],
    'Word Problem':  ['What is the question actually asking?', 'Which numbers are important?', 'What operation connects those numbers?', 'Does your answer make real-world sense?'],
    Arithmetic:     ['What operation is being used?', 'Break it into smaller steps.', 'Work left to right unless brackets tell you otherwise.', 'Does your answer seem reasonable?']
};

// ── Practice question generator ────────────────────────────────
function generatePracticeQuestion(concept, nums) {
    const [a = 12, b = 7] = nums;
    // Generate different numbers from the original
    const pa = Math.abs(Math.floor(a * 1.5 + 3));
    const pb = Math.abs(Math.floor(b * 1.2 + 2));

    const map = {
        Addition:       `${pa} + ${pb} = ?`,
        Subtraction:    `${pa + pb} - ${pb} = ?`,
        Multiplication: `${Math.min(pa, 12)} × ${Math.min(pb, 9)} = ?`,
        Division:       `${pa * pb} ÷ ${pb} = ?`,
        Fractions:      `What is ${Math.min(pa, 5)}/${Math.min(pb, 8) + 1} of 24?`,
        Decimals:       `${(pa * 0.1).toFixed(1)} + ${(pb * 0.1).toFixed(1)} = ?`,
        Percentages:    `What is ${Math.min(pa, 50)}% of ${pb * 2}?`,
        Geometry:       `Find the area of a rectangle with length ${pa} and width ${pb}.`,
        Algebra:        `If x + ${pb} = ${pa + pb}, what is x?`,
        'Word Problem':  `A shop has ${pa} apples. They sell ${pb} in the morning. How many are left?`,
        Arithmetic:     `${pa} + ${pb} × 2 = ?`
    };
    return map[concept] || `${pa} + ${pb} = ?`;
}

// ── Extract numbers from question text ────────────────────────
function extractNumbers(text) {
    return [...(text || '').matchAll(/\b\d+(?:\.\d+)?\b/g)]
        .map(m => parseFloat(m[0]))
        .filter(n => !isNaN(n));
}

// ── Explanation builder ────────────────────────────────────────
const EXPLANATIONS = {
    Addition:       'Addition means combining two or more quantities together to find the total.',
    Subtraction:    'Subtraction means finding the difference by taking one quantity away from another.',
    Multiplication: 'Multiplication is repeated addition — adding the same number multiple times.',
    Division:       'Division means splitting a quantity into equal groups.',
    Fractions:      'A fraction represents a part of a whole. The denominator shows how many equal parts exist, and the numerator shows how many parts you have.',
    Decimals:       'Decimals extend the place value system to represent parts of a whole number, using a decimal point.',
    Percentages:    'A percentage is a fraction out of 100. It helps compare quantities on a common scale.',
    Geometry:       'Geometry involves measuring and calculating properties of shapes, such as area, perimeter, angles, and volume.',
    Algebra:        'Algebra uses symbols (like x) to represent unknown values, and equations to find those values.',
    'Word Problem':  'Word problems describe real-life situations in words. Your job is to extract the numbers, identify the operation, and solve.',
    Arithmetic:     'Arithmetic is the foundation of mathematics, involving basic operations: addition, subtraction, multiplication, and division.'
};

/**
 * Main engine function.
 * @param {object} params
 * @param {string} params.question
 * @param {string} [params.questionType]
 * @param {string[]} [params.options]
 * @param {string} [params.studentAnswer]
 * @param {object} [params.accessibilityProfile]
 * @returns {object} Structured AI response
 */
function generateMathAssistance({ question, questionType, options, studentAnswer, accessibilityProfile }) {
    const { isMath, concept, difficulty } = detectMathConcept(question);

    if (!isMath) {
        return {
            isMath: false,
            concept: 'Unknown',
            difficulty: 'Easy',
            explanation: '',
            steps: [],
            hints: [],
            visualization: null,
            practiceQuestion: null
        };
    }

    const nums = extractNumbers(question);

    // Get steps — never include the actual answer
    const stepsFn = STEP_TEMPLATES[concept] || STEP_TEMPLATES.Arithmetic;
    const steps   = stepsFn(nums, question);

    // Get hints
    const hints = HINT_TEMPLATES[concept] || HINT_TEMPLATES.Arithmetic;

    // Get visualization type
    const visualization = VISUALIZATION_MAP[concept] || 'number_line';

    // Get explanation
    const explanation = EXPLANATIONS[concept] || EXPLANATIONS.Arithmetic;

    // Generate a similar practice question
    const practiceQuestion = generatePracticeQuestion(concept, nums);

    return {
        isMath: true,
        concept,
        difficulty,
        explanation,
        steps,
        hints,
        visualization,
        practiceQuestion
    };
}

module.exports = { generateMathAssistance };
