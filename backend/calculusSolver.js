/**
 * calculusSolver.js
 * Core logic engine for Calculus problems (Differentiation & Integration).
 * Performs symbolic step-by-step reasoning for "Parallel" visualization.
 */

// --- PARSING UTILS ---

function parseTerms(expression) {
    if (!expression) return [];

    // Normalize spaces and signs
    // "2x^2 + 2x" -> ["2x^2", "+2x"]
    // "2x^2 - 2x" -> ["2x^2", "-2x"]

    // 1. Remove whitespace
    const clean = expression.replace(/\s+/g, '');

    // 2. Split by +/-, keeping delimiters
    // Lookbehind is not always supported in older node, so use capture group
    // split(/([+\-])/) gives ["2x^2", "+", "2x"]
    let parts = clean.split(/([+\-])/);

    // remove empty strings
    parts = parts.filter(p => p.length > 0);

    const terms = [];
    let currentSign = '+';

    for (let part of parts) {
        if (part === '+' || part === '-') {
            currentSign = part;
        } else {
            terms.push({
                raw: part,
                sign: currentSign
            });
            currentSign = '+'; // Reset (though normally alternating)
        }
    }

    // Parse individual coeff/power
    return terms.map(t => parseTermDetails(t.raw, t.sign));
}

function parseTermDetails(rawTerm, sign) {
    // rawTerm e.g. "2x^2", "x", "5", "3x"

    let coeff = 1;
    let power = 0; // default for constant
    let isConst = true;
    let isLinear = false;

    // Check variable presence
    if (rawTerm.includes('x')) {
        isConst = false;
        power = 1; // default linear

        // Check power
        const pMatch = rawTerm.match(/\^(\d+)/);
        if (pMatch) {
            power = parseInt(pMatch[1]);
        }
    }

    // Check coeff
    // "x" -> 1, "2x" -> 2
    // Remove x and power to see what's left
    const baseMatch = rawTerm.split('x')[0];
    if (baseMatch === '' || baseMatch === '+') {
        coeff = 1;
    } else if (baseMatch === '-') {
        coeff = 1; // Sign is handled separately, but let's be safe
    } else {
        coeff = parseInt(baseMatch);
    }

    if (sign === '-') coeff = coeff * -1;

    if (power === 1 && !isConst) isLinear = true;

    return {
        original: (sign === '-' ? '-' : '') + rawTerm,
        coeff,
        power,
        isConstant: isConst,
        isLinear,
        type: isConst ? "constant" : (isLinear ? "linear" : "power")
    };
}

// --- SOLVER LOGIC ---

function solveDifferentiation(terms) {
    const processedTerms = terms.map((term, index) => {
        const { coeff, power, type } = term;
        let newCoeff = 0;
        let newPower = 0;
        let derivativeStr = "0";

        // Logic
        if (type === 'constant') {
            newCoeff = 0;
            newPower = 0;
            derivativeStr = "0";
        } else {
            newCoeff = coeff * power;
            newPower = power - 1;

            // Build string
            if (newCoeff === 0) derivativeStr = "0";
            else {
                let cStr = newCoeff === 1 && newPower !== 0 ? "" : (newCoeff === -1 && newPower !== 0 ? "-" : newCoeff);
                let pStr = newPower === 0 ? "" : (newPower === 1 ? "x" : `x^${newPower}`);
                if (newPower === 0 && (newCoeff === 1 || newCoeff === -1)) cStr = newCoeff; // explicit 1 if no x
                derivativeStr = `${cStr}${pStr}`;
            }
        }

        return {
            ...term,
            result: {
                coeff: newCoeff,
                power: newPower,
                str: derivativeStr
            }
        };
    });

    return processedTerms;
}

function solveIntegration(terms) {
    const processedTerms = terms.map(term => {
        const { coeff, power } = term;
        const newPower = power + 1;
        const divisor = newPower; // 1/(n+1)

        // String
        let integralStr = "";

        // simplify fraction?
        // raw: (coeff / divisor) x^newPower
        const val = coeff / divisor;
        const isWhole = (coeff % divisor === 0);

        if (isWhole) {
            let cStr = (val === 1 && newPower !== 0) ? "" : val;
            let pStr = newPower === 0 ? "" : (newPower === 1 ? "x" : `x^${newPower}`);
            integralStr = `${cStr}${pStr}`;
        } else {
            integralStr = `(${coeff}/${divisor})x^${newPower}`;
        }

        return {
            ...term,
            result: {
                numerator: coeff,
                denominator: divisor,
                power: newPower,
                str: integralStr
            }
        };
    });

    return processedTerms;
}


// --- MAIN EXPORT ---

function solveCalculusProblem(expression, topic) {
    const terms = parseTerms(expression);

    let solvedTerms = [];
    if (topic === 'differentiation') {
        solvedTerms = solveDifferentiation(terms);
    } else {
        solvedTerms = solveIntegration(terms);
    }

    // Construct Timeline / Reason Steps
    // We Map 'Phases' to specific logic descriptions for the Logic Engine

    return {
        expression,
        topic,
        terms: solvedTerms
    };
}

module.exports = { solveCalculusProblem };
