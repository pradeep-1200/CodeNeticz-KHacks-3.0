/**
 * numericalSolver.js
 * Rule-based solver for basic numerical reasoning problems.
 * Focuses on arithmetic, unitary method, percentages, and time/distance.
 */

const wordToNumber = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "twenty": 20, "thirty": 30, "fifty": 50, "hundred": 100
};

function normalizeInput(input) {
    let text = input.toLowerCase().trim();
    // Replace number words
    Object.keys(wordToNumber).forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        text = text.replace(regex, wordToNumber[word]);
    });
    return text;
}

function detectType(text) {
    if (text.includes("percent") || text.includes("%")) return "percentage";
    if (text.includes("cost") || text.includes("buy") || text.includes("price")) return "unitary_cost";
    if (text.includes("walk") || text.includes("run") || text.includes("speed") || text.includes("km") || text.includes("miles")) return "distance_speed";
    if ((text.includes("from") && text.includes("to")) && (text.includes("minutes") || text.includes("hours") || text.includes(":"))) return "time_diff";
    if (text.match(/(\d+)\s*[\+\-\*\/]\s*(\d+)/)) return "basic_arithmetic";
    return "unknown";
}

function solveNumerical(question) {
    const normalized = normalizeInput(question);
    const type = detectType(normalized);

    let steps = [];
    let finalAnswer = "";
    let data = {};

    if (type === "percentage") {
        const match = normalized.match(/(\d+)\s*(?:percent|%)\s*of\s*(\d+)/);
        if (match) {
            const pct = parseFloat(match[1]);
            const val = parseFloat(match[2]);
            const result = (pct / 100) * val;
            data = { pct, val, result };
            finalAnswer = `${result}`;
            steps = [
                { scene: 1, text: "Let us understand the information.", visual: `Find ${pct}% of ${val}` },
                { scene: 2, text: "We interpret 'percent' as 'per 100'.", visual: `${pct}% means ${pct}/100` },
                { scene: 3, text: "We set up the multiplication.", visual: `${pct}/100 × ${val}` },
                { scene: 3, text: "First, divide by 100.", visual: `${pct} × (${val} / 100) = ${pct} × ${val / 100}` },
                { scene: 4, text: "Now multiply.", visual: `${pct} × ${val / 100} = ${result}` },
                { scene: 5, text: "This is the final answer.", visual: `Answer: ${result}` }
            ];
        } else {
            throw new Error("I can help with questions like 'What is 20 percent of 50?'");
        }
    } else if (type === "unitary_cost") {
        const nums = normalized.match(/\d+(\.\d+)?/g);
        if (nums && nums.length >= 2) {
            const singleCostMatch = normalized.match(/1\s+([a-z]+)\s+cost[s]?\s+(\d+)/);
            const singleCostMatch2 = normalized.match(/cost\s+of\s+1\s+([a-z]+)\s+is\s+(\d+)/);
            let unitPrice = 0;
            let item = "item";

            if (singleCostMatch) {
                item = singleCostMatch[1];
                unitPrice = parseFloat(singleCostMatch[2]);
            } else if (singleCostMatch2) {
                item = singleCostMatch2[1];
                unitPrice = parseFloat(singleCostMatch2[2]);
            }

            const allNums = nums.map(n => parseFloat(n));
            if (allNums.length === 3 && allNums.includes(1)) {
                const contextRegex = /1\s+([a-z]+)\s+costs?\s+(\d+)/;
                const m1 = normalized.match(contextRegex);
                if (m1) {
                    item = m1[1];
                    unitPrice = parseFloat(m1[2]);
                    const targetRegex = new RegExp(`(\\d+)\\s+${item}s?`, 'g');
                    const matches = [...normalized.matchAll(targetRegex)];
                    for (const m of matches) {
                        const qty = parseFloat(m[1]);
                        if (qty !== 1) {
                            const targetQty = qty;
                            const total = unitPrice * targetQty;
                            data = { unitPrice, targetQty, item, total };
                            steps = [
                                { scene: 1, text: "Let us understand the information.", visual: `1 ${item} = ${unitPrice}` },
                                { scene: 2, text: "We need to find the cost of multiple items.", visual: `Find cost of ${targetQty} ${item}s` },
                                { scene: 3, text: "Since 1 costs ${unitPrice}, we multiply by ${targetQty}.", visual: `${unitPrice} × ${targetQty}` },
                                { scene: 4, text: "Perform the multiplication.", visual: `${unitPrice} × ${targetQty} = ${total}` },
                                { scene: 5, text: "This is the final answer.", visual: `Total: ${total}` }
                            ];
                            break;
                        }
                    }
                }
            }
        }
        if (steps.length === 0) {
            throw new Error("Please ask in the format: 'If 1 pen costs 10, how much do 4 pens cost?'");
        }

    } else if (type === "distance_speed") {
        const speedMatch = normalized.match(/(\d+)\s*(?:km|miles|m)\s*in\s*(\d+)\s*(?:hour|hr|min|minute|sec)/);
        if (speedMatch) {
            const dist = parseFloat(speedMatch[1]);
            const time = parseFloat(speedMatch[2]);
            const targetTimeMatch = normalized.match(/how\s*far\s*in\s*(\d+)\s*(?:hour|hr|min|minute|sec)/);
            if (targetTimeMatch) {
                const targetTime = parseFloat(targetTimeMatch[1]);
                if (time === 1) {
                    const totalDist = dist * targetTime;
                    steps = [
                        { scene: 1, text: "Understand the speed.", visual: `Speed: ${dist} km per ${time} hour` },
                        { scene: 2, text: "Identify the goal.", visual: `Find distance for ${targetTime} hours` },
                        { scene: 3, text: "Multiply speed by time.", visual: `${dist} × ${targetTime}` },
                        { scene: 4, text: "Calculate the result.", visual: `${dist} × ${targetTime} = ${totalDist}` },
                        { scene: 5, text: "Final Answer.", visual: `${totalDist} km` }
                    ];
                }
            }
        } else {
            throw new Error("I can help with questions like 'A car goes 50 km in 1 hour. How far in 3 hours?'");
        }

    } else if (type === "time_diff") {
        const matches = normalized.match(/(\d{1,2}):(\d{2})\s*to\s*(\d{1,2}):(\d{2})/);
        if (matches) {
            const h1 = parseInt(matches[1]);
            const m1 = parseInt(matches[2]);
            const h2 = parseInt(matches[3]);
            const m2 = parseInt(matches[4]);
            let mins1 = h1 * 60 + m1;
            let mins2 = h2 * 60 + m2;
            if (mins2 < mins1) mins2 += 12 * 60;
            const diff = mins2 - mins1;
            steps = [
                { scene: 1, text: "Identify start and end times.", visual: `${h1}:${m1}  →  ${h2}:${m2}` },
                { scene: 2, text: "We interpret this as finding the difference.", visual: "Target - Start" },
                { scene: 3, text: "Subtract hours and minutes.", visual: `Count from ${h1}:${m1} to ${h2}:${m2}` },
                { scene: 4, text: "Calculate total minutes.", visual: `${diff} minutes` },
                { scene: 5, text: "Final Answer.", visual: `${diff} minutes` }
            ];
        } else {
            throw new Error("I can help with time questions like 'How many minutes from 2:30 to 3:15?'");
        }
    } else {
        throw new Error("I can help with numerical reasoning like percentages, costs, distance, and time.");
    }

    return {
        topic: "numerical_reasoning",
        original_question: question,
        steps: steps
    };
}

module.exports = { solveNumerical };
