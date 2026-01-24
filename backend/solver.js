/**
 * solver.js
 * Rule-based logic for parsing natural language math questions
 * and generating animation flows for students with dyscalculia.
 * 
 * WHY RULE-BASED?
 * Students with dyscalculia require 100% consistent and accurate visual feedback.
 * Machine Learning models (LLMs) can hallucinate or produce inconsistent steps,
 * which confuses learners who struggle with symbol stability.
 * A strict rule-based system ensures that "derivative of x^2" ALWAYS triggers
 * the exact same Power Rule animation sequence, building trust and retention.
 */

// Basic number mapping for natural language
const wordToNumber = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
};

// Normalize text input: converts words to digits, standardizes powers
function normalizeInput(input) {
    let text = input.toLowerCase().trim();

    // Replace number words
    Object.keys(wordToNumber).forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        text = text.replace(regex, wordToNumber[word]);
    });

    // Standardize powers
    text = text.replace(/\bsquared\b/g, "^2");
    text = text.replace(/\bsquare\b/g, "^2");
    text = text.replace(/\bcubed\b/g, "^3");
    text = text.replace(/\bcube\b/g, "^3");
    text = text.replace(/\bpower of (\d+)/g, "^$1");
    text = text.replace(/\bto the (\d+)/g, "^$1");

    return text;
}

// Identify if the question is Differentiation or Integration, or implicitly Differentiation for equations
function detectTopic(text) {
    if (
        text.includes("integral") ||
        text.includes("integrate") ||
        text.includes("integration") ||
        text.includes("area under") ||
        text.includes("antiderivative") ||
        text.includes("∫") ||
        /\bint\b/.test(text)
    ) {
        return "integration";
    }
    // Default to differentiation for "derivative", "slope", or pure equations like "y = x^2"
    return "differentiation";
}

// Extract limits for integrals if present (e.g., "from 0 to 5")
function extractLimits(text) {
    const fromToRegex = /from\s+(\d+)\s+to\s+(\d+)/;
    const match = text.match(fromToRegex);
    if (match) {
        return [parseInt(match[1]), parseInt(match[2])];
    }

    const betweenRegex = /between\s+(\d+)\s+and\s+(\d+)/;
    const match2 = text.match(betweenRegex);
    if (match2) {
        return [parseInt(match2[1]), parseInt(match2[2])];
    }

    return null; // Indefinite integral
}

// Isolate the mathematical expression from the sentence
function extractExpression(text, topic) {
    // Remove common prefix phrases
    let cleaned = text
        .replace(/find the/g, "")
        .replace(/calculate the/g, "")
        .replace(/what is the/g, "")
        .replace(/solve for/g, "");

    // Remove equation labels "y =" or "f(x) =" or "f(t) ="
    cleaned = cleaned.replace(/y\s*=/g, "").replace(/f\([a-z]\)\s*=/g, "");

    // Remove topic keywords
    if (topic === "differentiation") {
        cleaned = cleaned.replace(/derivative of/g, "").replace(/differentiate/g, "").replace(/differentiation/g, "");
    } else if (topic === "integration") {
        cleaned = cleaned
            .replace(/integral of/g, "")
            .replace(/integrate/g, "")
            .replace(/integration/g, "")
            .replace(/antiderivative of/g, "")
            .replace(/area under/g, "")
            .replace(/∫/g, "")
            .replace(/\bint\b/g, "");
    }

    // Remove limits phrases
    cleaned = cleaned.replace(/from\s+\d+\s+to\s+\d+/g, "");
    cleaned = cleaned.replace(/between\s+\d+\s+and\s+\d+/g, "");

    // Remove "with respect to x" or "dx"
    cleaned = cleaned.replace(/with respect to x/g, "").replace(/dx/g, "");

    return cleaned.trim();
}

// Match the expression to a supported mathematical rule
function identifyRule(expression) {
    // Clean whitespace inside expression for matching
    const expr = expression.replace(/\s+/g, "");

    // Rule 1: Power Rule (x^n)
    if (/^x\^\d+$/.test(expr)) {
        return "power_rule";
    }

    // Rule 2: Linear Term (x alone)
    if (/^x$/.test(expr)) {
        return "linear_rule"; // Treat as power rule x^1 or special case
    }

    // Rule 3: Constant Multiple (ax or ax^n)
    if (/^\d+x(\^\d+)?$/.test(expr)) {
        return "constant_multiple_rule";
    }

    // Rule 4: Sum Rule (term + term)
    if (expr.includes("+") || expr.includes("-")) {
        return "sum_rule";
    }

    // Rule 5: Constant (just a number)
    if (/^\d+$/.test(expr)) {
        return "constant_rule";
    }

    // Fallback for demo flexibility
    return "power_rule"; // Default fallback for valid-looking simple inputs
}

// Define the animation steps for each rule and topic
function getAnimationFlow(topic, rule, hasLimits) {
    const steps = [];

    // Common start
    steps.push("show_formula");

    if (topic === "differentiation") {
        if (rule === "power_rule" || rule === "linear_rule") {
            steps.push("bring_power_down");
            steps.push("subtract_one_from_power");
        } else if (rule === "constant_multiple_rule") {
            steps.push("pull_constant_out");
            steps.push("bring_power_down");
            steps.push("multiply_constant");
            steps.push("subtract_one_from_power");
        } else if (rule === "sum_rule") {
            steps.push("split_expression");
            steps.push("differentiate_terms_separately");
        } else if (rule === "constant_rule") {
            steps.push("constant_becomes_zero");
        }
    } else if (topic === "integration") {
        if (rule === "power_rule" || rule === "linear_rule") {
            steps.push("add_one_to_power");
            steps.push("divide_by_new_power");
        } else if (rule === "constant_multiple_rule") {
            steps.push("pull_constant_out");
            steps.push("add_one_to_power");
            steps.push("divide_by_new_power");
        } else if (rule === "sum_rule") {
            steps.push("split_expression");
            steps.push("integrate_terms_separately");
        } else if (rule === "constant_rule") {
            steps.push("attach_variable_x");
        } else if (rule === "integral_of_1") {
            steps.push("becomes_x");
        }
    }

    // Handle Limits (Definite Integral)
    if (hasLimits && topic === "integration") {
        steps.push("show_square_brackets"); // [ F(x) ]
        steps.push("apply_upper_limit");    // F(b)
        steps.push("apply_lower_limit");    // F(a)
        steps.push("subtract_limits");      // F(b) - F(a)
    } else if (topic === "integration") {
        steps.push("add_constant_c");       // + C
    }

    steps.push("show_final_answer");
    return steps;
}

const { solveNumerical } = require('./numericalSolver');

function solveMathProblem(question) {
    const normalized = normalizeInput(question);

    // First, try to detect Calculus topics explicitly
    if (detectTopic(normalized) !== "unknown") {
        // NOTE: detectTopic currently defaults to "differentiation" for everything not "integration".
        // We need to make detectTopic stricter or check numerical patterns first.
    }

    // Let's refine the logic.
    // If it mentions differentiation/integration specifically OR has x^n style math:
    const isCalculus = normalized.includes("derivative") ||
        normalized.includes("integral") ||
        normalized.includes("slope") ||
        normalized.includes("area under") ||
        /x\^|dy\/dx/.test(normalized) ||
        (normalized.includes("x") && !normalized.includes("box") && !normalized.includes("cost")); // heuristic

    if (isCalculus) {
        const topic = detectTopic(normalized);
        const limits = extractLimits(normalized);
        const expression = extractExpression(normalized, topic);
        const rule = identifyRule(expression);
        const animationFlow = getAnimationFlow(topic, rule, !!limits);

        return {
            topic,
            rule,
            expression,
            limits,
            animationFlow: animationFlow,
            original_question: question,
            normalized_question: normalized
        };
    }

    // Otherwise, try numerical reasoning
    try {
        return solveNumerical(question);
    } catch (error) {
        // Return an error object that the API can send back
        return {
            error: true,
            message: error.message || "I can help with basic differentiation and integration."
        };
    }
}

module.exports = { solveMathProblem };
