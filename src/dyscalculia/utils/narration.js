/**
 * Narration text mappings for animation phases.
 * Designed to be short, simple, and calming for students with dyscalculia.
 */
export const getNarrationText = (phaseId, phaseContext = {}) => {
    if (!phaseId) return "";

    // Handle dynamic distinct phases (e.g. solve terms)
    if (phaseId.startsWith('SOLVE_TERM')) {
        // Fallback for non-granular flows
        if (phaseContext.term) {
            return "Let's focus on this part.";
        }
        return "Now we solve this part.";
    }

    const mappings = {
        'INTRO': (ctx) => `Let's solve this ${ctx.topic || 'problem'} together.`,
        'RULE_INTRO': "First, let's remember the rule.",
        'RULE_DEMO': "We use a simple rule for powers.",
        'QUESTION_SHOW': "Now we apply the rule to this expression.",
        'SPLIT': "We split the expression into separate terms.",

        // Granular Term Steps (Explicit Scene Match)
        'TERM_SHOW': "Let's look at this term.",
        'TERM_POWER_RULE': "We bring the power down.",
        'TERM_SUBTRACT': "And reduce the power by one.",
        'TERM_SIMPLIFY': "Simplify to get the result.",

        // Linear Term Specifics (ax -> a)
        'TERM_LINEAR_SETUP': "The power of x is one.",
        'TERM_LINEAR_RULE': "Bring the power down.",
        'TERM_LINEAR_SUBTRACT': "The power reduces by one.",
        'TERM_LINEAR_ZERO': "x power zero equals one.",
        'TERM_LINEAR_FINAL': "So we are left with just the constant.",

        // Default Differentiation specific steps (legacy support)
        'show_formula': "We use the power rule.",
        'bring_power_down': "Bring the power down to the front.",
        'multiply_constant': "Multiply the numbers together.",
        'subtract_one_from_power': "Subtract one from the power.",
        'constant_becomes_zero': "The constant becomes zero.",

        // Integration specific steps
        'add_one_to_power': "Add one to the power.",
        'divide_by_new_power': "Divide by the new power.",
        'add_constant_c': "Don't forget to add C.",

        // General
        'COMBINE': "Now we combine both results.",
        'FINAL_ANSWER': "This is the final answer.",

        // Limits
        'LIMITS_SETUP': "We put brackets around our answer.",
        'LIMITS_UPPER': "First, we plug in the top number.",
        'LIMITS_LOWER': "Then, we plug in the bottom number.",
        'LIMITS_CALC': "Subtract to get the final area.",

        // Parallel Solving keys
        'PARALLEL_STEP_1': "We focus on both parts together.",
        'PARALLEL_STEP_2': "We apply the same steps to both parts at the same time.",
        'PARALLEL_STEP_3': "Reduce the powers step by step.",
        'PARALLEL_STEP_4': "Simplify the results.",
        'PARALLEL_STEP_5': "Here are the answers for each part.",
        'PARALLEL_HOLD': "Now we look at the results from both sides."
    };

    // Check specific animation phase ID
    if (mappings[phaseId]) {
        const entry = mappings[phaseId];
        return typeof entry === 'function' ? entry(phaseContext) : entry;
    }

    return "";
};
