/**
 * solver.js
 * Rule-based logic for parsing natural language math questions
 * and generating animation flows for students with dyscalculia.
 */

const { solveNumerical } = require('./numericalSolver.js');

const wordToNumber = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
};

function normalizeInput(input) {
    let text = input.toLowerCase().trim();
    Object.keys(wordToNumber).forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        text = text.replace(regex, wordToNumber[word]);
    });
    text = text.replace(/\bsquared\b/g, "^2");
    text = text.replace(/\bsquare\b/g, "^2");
    text = text.replace(/\bcubed\b/g, "^3");
    text = text.replace(/\bcube\b/g, "^3");
    text = text.replace(/\bpower of (\d+)/g, "^$1");
    text = text.replace(/\bto the (\d+)/g, "^$1");
    return text;
}

function detectTopic(text) {
    if (text.includes("integral") || text.includes("integrate") || text.includes("integration") || text.includes("area under") || text.includes("antiderivative") || text.includes("∫") || /\bint\b/.test(text)) {
        return "integration";
    }
    return "differentiation";
}

function extractLimits(text) {
    const fromToRegex = /from\s+(\d+)\s+to\s+(\d+)/;
    const match = text.match(fromToRegex);
    if (match) return [parseInt(match[1]), parseInt(match[2])];
    const betweenRegex = /between\s+(\d+)\s+and\s+(\d+)/;
    const match2 = text.match(betweenRegex);
    if (match2) return [parseInt(match2[1]), parseInt(match2[2])];
    return null;
}

function extractExpression(text, topic) {
    let cleaned = text.replace(/find the/g, "").replace(/calculate the/g, "").replace(/what is the/g, "").replace(/solve for/g, "");
    cleaned = cleaned.replace(/y\s*=/g, "").replace(/f\([a-z]\)\s*=/g, "");
    if (topic === "differentiation") {
        cleaned = cleaned.replace(/derivative of/g, "").replace(/differentiate/g, "").replace(/differentiation/g, "");
    } else if (topic === "integration") {
        cleaned = cleaned.replace(/integral of/g, "").replace(/integrate/g, "").replace(/integration/g, "").replace(/antiderivative of/g, "").replace(/area under/g, "").replace(/∫/g, "").replace(/\bint\b/g, "");
    }
    cleaned = cleaned.replace(/from\s+\d+\s+to\s+\d+/g, "");
    cleaned = cleaned.replace(/between\s+\d+\s+and\s+\d+/g, "");
    cleaned = cleaned.replace(/with respect to x/g, "").replace(/dx/g, "");
    return cleaned.trim();
}

function identifyRule(expression) {
    const expr = expression.replace(/\s+/g, "");
    if (/^x\^\d+$/.test(expr)) return "power_rule";
    if (/^x$/.test(expr)) return "linear_rule";
    if (/^\d+x(\^\d+)?$/.test(expr)) return "constant_multiple_rule";
    if (expr.includes("+") || expr.includes("-")) return "sum_rule";
    if (/^\d+$/.test(expr)) return "constant_rule";
    return "power_rule";
}

function getAnimationFlow(topic, rule, hasLimits) {
    const steps = [];
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
    if (hasLimits && topic === "integration") {
        steps.push("show_square_brackets");
        steps.push("apply_upper_limit");
        steps.push("apply_lower_limit");
        steps.push("subtract_limits");
    } else if (topic === "integration") {
        steps.push("add_constant_c");
    }
    steps.push("show_final_answer");
    return steps;
}

function solveMathProblem(question) {
    const normalized = normalizeInput(question);

    // Check for calculus keywords or x variable usage
    const isCalculus = normalized.includes("derivative") ||
        normalized.includes("integral") ||
        normalized.includes("slope") ||
        normalized.includes("area under") ||
        /x\^|dy\/dx/.test(normalized) ||
        (normalized.includes("x") && !normalized.includes("box") && !normalized.includes("cost"));

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

    try {
        return solveNumerical(question);
    } catch (error) {
        return {
            error: true,
            message: error.message || "I can help with basic differentiation and integration."
        };
    }
}

module.exports = { solveMathProblem };
