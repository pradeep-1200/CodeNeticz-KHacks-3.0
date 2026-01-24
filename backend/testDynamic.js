const { solveMathProblem } = require('./solver');

const questions = [
    "What is 30 percent of 200",
    "If 1 apple costs 5 rupees, how much do 10 apples cost?",
    "A train goes 100 km in 1 hour. How far in 4 hours?",
    "How many minutes from 2:15 to 3:00?",
    "Differentiate 2x square",
    "integral of 2x",
    "find the derivative of 3x squared plus 2x"
];

questions.forEach(q => {
    try {
        const result = solveMathProblem(q);
        console.log(`Q: "${q}"`);
        console.log(`TOPIC: ${result.topic}`);
        if (result.steps) {
            console.log(`STEPS: ${result.steps.length} steps generated.`);
            result.steps.forEach(s => console.log(`  [${s.text}] -> ${s.visual}`));
        } else if (result.animationFlow) {
            console.log(`FLOW: ${JSON.stringify(result.animationFlow)}`);
            if (result.parsedTerms) {
                console.log(`LOGIC ENGINE TERMS:`);
                result.parsedTerms.forEach(t => {
                    console.log(`  Term: ${t.original} -> Type: ${t.type}, Result: ${t.result.str}`);
                });
            }
        }
        console.log("------------------------------------------------");
    } catch (e) {
        console.log(`Q: "${q}" -> ERROR: ${e.message}`);
        console.log("------------------------------------------------");
    }
});
