const { solveNumerical } = require('./numericalSolver');

const questions = [
    "What is 30 percent of 200",
    "What is 5 percent of 80",
    "If 1 apple costs 5 rupees, how much do 10 apples cost?",
    "If 1 book costs 20 rupees, how much do 3 books cost?",
    "A train goes 100 km in 1 hour. How far in 4 hours?",
    "A person walks 3 km in 1 hour. How far in 2 hours?"
];

questions.forEach(q => {
    try {
        const result = solveNumerical(q);
        console.log(`Q: "${q}"`);
        console.log(`TYPE: ${result.steps[0].visual} -> ${result.steps[result.steps.length - 1].visual}`);
        console.log("------------------------------------------------");
    } catch (e) {
        console.log(`Q: "${q}" -> ERROR: ${e.message}`);
    }
});
