const { solveMathProblem } = require('./solver');

const input = "If one pen costs 10 rupees, how much do 4 pens cost?";

try {
    console.log("Testing Input:", input);
    const result = solveMathProblem(input);
    console.log("Result:", JSON.stringify(result, null, 2));
} catch (error) {
    console.error("Caught Error:", error.message);
}
