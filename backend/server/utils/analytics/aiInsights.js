'use strict';

/**
 * AI Insights Generator — Phase 8
 *
 * Calls Gemini to generate a structured learning insights object
 * from the student's evaluated result.
 *
 * Falls back to a deterministic insights builder if Gemini is unavailable.
 */

const https = require('https');

// ── Gemini call ────────────────────────────────────────────────
async function callGemini(prompt) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return reject(new Error('GEMINI_API_KEY not configured'));

        const body = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 600,
                responseMimeType: 'application/json'
            }
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) return reject(new Error(parsed.error.message));
                    const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) return reject(new Error('Empty Gemini response'));
                    const result = JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, ''));
                    resolve(result);
                } catch (e) {
                    reject(new Error('Failed to parse Gemini insights: ' + e.message));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(20000, () => { req.destroy(); reject(new Error('Gemini timed out')); });
        req.write(body);
        req.end();
    });
}

// ── Deterministic fallback insights ───────────────────────────
function buildFallbackInsights(evalResult) {
    const { percentage, strengths = [], weaknesses = [], grade } = evalResult;

    let overallFeedback;
    if (percentage >= 90)      overallFeedback = 'Excellent work! You have a strong understanding of the material.';
    else if (percentage >= 75) overallFeedback = 'Good performance! Keep practising to reinforce your understanding.';
    else if (percentage >= 50) overallFeedback = 'Decent effort. With focused practice, you can improve further.';
    else                       overallFeedback = 'Keep going! Review the topics you found challenging and try again.';

    const recommendations = weaknesses.length > 0
        ? weaknesses.slice(0, 3).map(w => `Review and practise more problems on ${w}.`)
        : ['Keep practising to maintain your strong performance.'];

    const nextDifficulty = percentage >= 80 ? 'Hard' : percentage >= 60 ? 'Medium' : 'Easy';

    return {
        overallFeedback,
        strengths:       strengths.length > 0 ? strengths : ['Participation'],
        weaknesses:      weaknesses.length > 0 ? weaknesses : [],
        recommendations,
        nextDifficulty,
        generatedAt:     new Date()
    };
}

// ── Build prompt ───────────────────────────────────────────────
function buildInsightsPrompt(evalResult) {
    const {
        percentage, grade, correctAnswers, incorrectAnswers, skippedAnswers,
        totalQuestions, strengths = [], weaknesses = [], subject, studentName,
        accessibilityUsage = {}
    } = evalResult;

    const usedTools = Object.entries(accessibilityUsage)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(', ') || 'none';

    return `You are an adaptive learning coach generating personalized feedback for a student.

Student: ${studentName || 'Student'}
Assessment Subject: ${subject || 'General'}
Score: ${percentage}% (Grade: ${grade})
Results: ${correctAnswers} correct, ${incorrectAnswers} incorrect, ${skippedAnswers} skipped out of ${totalQuestions}
Strong Topics: ${strengths.join(', ') || 'none identified'}
Weak Topics: ${weaknesses.join(', ') || 'none identified'}
Accessibility Tools Used: ${usedTools}

Generate personalized learning insights. Rules:
1. Be encouraging and constructive — never discouraging
2. Keep feedback concise and actionable
3. Recommendations should be specific and practical
4. Do NOT mention raw scores or grades in the feedback text
5. Return ONLY valid JSON, no markdown:

{
  "overallFeedback": "2-3 sentence personalized summary of performance",
  "strengths": ["specific concept or skill shown", "..."],
  "weaknesses": ["specific concept or area to improve", "..."],
  "recommendations": ["specific actionable practice suggestion", "..."],
  "nextDifficulty": "Easy|Medium|Hard"
}

Constraints:
- strengths: 1-3 items
- weaknesses: 1-3 items (empty array if score >= 90%)
- recommendations: 2-3 specific items
- nextDifficulty based on score: <50% = Easy, 50-79% = Medium, >=80% = Hard`;
}

/**
 * Generate AI learning insights for a student's result.
 *
 * @param {object} evalResult - The evaluated result (from evaluateSubmission)
 * @param {string} [studentName]
 * @param {string} [subject]
 * @returns {Promise<object>} AI insights object
 */
async function generateInsights(evalResult, studentName, subject) {
    const enriched = { ...evalResult, studentName, subject };

    try {
        const prompt  = buildInsightsPrompt(enriched);
        const result  = await callGemini(prompt);

        // Validate and sanitize
        return {
            overallFeedback: String(result.overallFeedback || '').slice(0, 500),
            strengths:       Array.isArray(result.strengths)       ? result.strengths.slice(0, 5)       : evalResult.strengths || [],
            weaknesses:      Array.isArray(result.weaknesses)      ? result.weaknesses.slice(0, 5)      : evalResult.weaknesses || [],
            recommendations: Array.isArray(result.recommendations) ? result.recommendations.slice(0, 5) : [],
            nextDifficulty:  ['Easy', 'Medium', 'Hard'].includes(result.nextDifficulty) ? result.nextDifficulty : 'Medium',
            generatedAt:     new Date()
        };
    } catch {
        // Silent fallback — never block result creation
        return buildFallbackInsights(evalResult);
    }
}

module.exports = { generateInsights };
