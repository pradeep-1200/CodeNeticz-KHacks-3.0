'use strict';

/**
 * Assessment Evaluator — Phase 8
 *
 * Evaluates a student's submission against the assessment's correct answers.
 *
 * MCQ / True-False / Fill-in-the-blank → exact match (case-insensitive, trimmed)
 * Text / Short Answer / Long Answer    → Gemini AI semantic similarity scoring
 *
 * Returns a structured result object ready to be saved as AssessmentResult.
 */

const https = require('https');

// ── Grade calculator ───────────────────────────────────────────
function calculateGrade(percentage) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
}

// ── Concept extractor (maps question text to a concept label) ──
function extractConcept(questionText, subject) {
    const t = (questionText || '').toLowerCase();
    if (/add|plus|\+|sum|total/i.test(t))                          return 'Addition';
    if (/subtract|minus|\-|difference/i.test(t))                   return 'Subtraction';
    if (/multipl|times|×|\*|\d\s*[xX]\s*\d/i.test(t))             return 'Multiplication';
    if (/divid|÷|\/|quotient/i.test(t))                            return 'Division';
    if (/fraction|numerator|denominator/i.test(t))                 return 'Fractions';
    if (/decimal|\.(\d+)/i.test(t))                                return 'Decimals';
    if (/percent|%/i.test(t))                                      return 'Percentages';
    if (/area|perimeter|volume|triangle|circle|rectangle|square/i.test(t)) return 'Geometry';
    if (/equation|algebra|variable|solve for/i.test(t))            return 'Algebra';
    if (/grammar|noun|verb|adjective|sentence/i.test(t))           return 'Grammar';
    if (/comprehension|passage|reading/i.test(t))                  return 'Reading';
    if (/science|biology|chemistry|physics/i.test(t))              return 'Science';
    if (/history|geography|social/i.test(t))                       return 'Social Studies';
    return subject || 'General';
}

// ── Exact match evaluation (MCQ, True/False, fill-in-the-blank) ──
function evaluateExact(studentAnswer, correctAnswer) {
    if (!studentAnswer || !studentAnswer.trim()) return { isCorrect: false, score: 0, feedback: 'No answer provided.' };
    const sa = studentAnswer.trim().toLowerCase();
    const ca = (correctAnswer || '').trim().toLowerCase();
    if (!ca) return { isCorrect: false, score: 0, feedback: 'No correct answer defined for this question.' };
    const isCorrect = sa === ca;
    return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        feedback: isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${correctAnswer}`
    };
}

// ── Gemini API call for open-ended evaluation ──────────────────
async function callGeminiEvaluate(questionText, studentAnswer, correctAnswer) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const prompt = `You are an educational assessment evaluator.

Question: "${questionText}"
Expected Answer: "${correctAnswer}"
Student's Answer: "${studentAnswer}"

Evaluate the student's answer. Return ONLY valid JSON, no markdown:
{
  "isCorrect": true or false,
  "score": 0.0 to 1.0 (partial credit allowed),
  "feedback": "Brief, encouraging feedback for the student. Do not reveal the exact correct answer directly.",
  "suggestion": "One specific improvement suggestion."
}

Rules:
- Score 1.0 = fully correct or equivalent meaning
- Score 0.5 = partially correct
- Score 0.0 = incorrect or blank
- Never reveal the exact correct answer verbatim
- Feedback must be constructive and age-appropriate`;

    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 300,
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
                    reject(new Error('Failed to parse Gemini evaluation: ' + e.message));
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(15000, () => { req.destroy(); reject(new Error('Gemini evaluation timed out')); });
        req.write(body);
        req.end();
    });
}

// ── Text/open-ended evaluation with AI fallback ───────────────
async function evaluateTextAnswer(questionText, studentAnswer, correctAnswer) {
    if (!studentAnswer || !studentAnswer.trim()) {
        return { isCorrect: false, score: 0, feedback: 'No answer provided.' };
    }
    if (!correctAnswer || !correctAnswer.trim()) {
        return { isCorrect: false, score: 0, feedback: 'This question requires teacher review.' };
    }

    try {
        const result = await callGeminiEvaluate(questionText, studentAnswer, correctAnswer);
        return {
            isCorrect: result.score >= 0.5,
            score:     Math.min(1, Math.max(0, parseFloat(result.score) || 0)),
            feedback:  result.feedback || '',
            suggestion: result.suggestion || ''
        };
    } catch {
        // Fallback: keyword overlap
        const keywords = (correctAnswer || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const answerLower = (studentAnswer || '').toLowerCase();
        const matches = keywords.filter(k => answerLower.includes(k)).length;
        const score = keywords.length > 0 ? Math.min(1, matches / keywords.length) : 0;
        return {
            isCorrect: score >= 0.5,
            score,
            feedback: score >= 0.5
                ? 'Your answer captures the key points.'
                : 'Your answer is missing some key concepts. Review the material and try again.'
        };
    }
}

/**
 * Main evaluation function.
 *
 * @param {object} assessment - Assessment document with questions[]
 * @param {object} submission - AssessmentSubmission document with answers[]
 * @param {object} accessibilityProfile - Student's accessibility flags
 * @returns {Promise<object>} Structured result ready for AssessmentResult model
 */
async function evaluateSubmission(assessment, submission, accessibilityProfile) {
    const questions = assessment.questions || [];
    const answers   = submission.answers   || [];

    // Build answer lookup by questionId string
    const answerMap = {};
    for (const a of answers) {
        answerMap[String(a.questionId)] = a;
    }

    let obtainedMarks = 0;
    let totalMarks    = questions.length; // 1 mark per question
    let correct = 0, incorrect = 0, skipped = 0;

    const questionAnalysis = [];
    const strengthTopics   = new Set();
    const weaknessTopics   = new Set();

    // ── Evaluate each question ────────────────────────────────
    for (const q of questions) {
        const qId      = String(q._id);
        const aEntry   = answerMap[qId];
        const concept  = extractConcept(q.question, assessment.subject);

        const isTextType = ['text', 'short_answer', 'voice', 'audio'].includes(q.type);
        let evalResult;

        if (!aEntry || !aEntry.answer?.trim()) {
            // Skipped
            evalResult = { isCorrect: false, score: 0, feedback: 'Not answered.' };
            skipped++;
        } else if (isTextType) {
            evalResult = await evaluateTextAnswer(q.question, aEntry.answer, q.correctAnswer);
        } else {
            evalResult = evaluateExact(aEntry.answer, q.correctAnswer);
        }

        const marksAwarded = Math.round(evalResult.score);
        obtainedMarks += marksAwarded;

        if (evalResult.isCorrect) {
            correct++;
            strengthTopics.add(concept);
        } else if (aEntry?.answer?.trim()) {
            incorrect++;
            weaknessTopics.add(concept);
        }

        questionAnalysis.push({
            questionId:    q._id,
            questionText:  q.question,
            questionType:  q.type,
            difficulty:    q.difficulty || 'easy',
            concept,
            studentAnswer: aEntry?.answer || '',
            correctAnswer: q.correctAnswer || '',
            isCorrect:     evalResult.isCorrect,
            marksAwarded,
            maxMarks:      1,
            aiFeedback:    evalResult.feedback || '',
            timeTaken:     0
        });
    }

    const percentage = totalMarks > 0
        ? Math.round((obtainedMarks / totalMarks) * 100)
        : 0;

    const grade = calculateGrade(percentage);

    // Compute time taken
    const startedAt    = submission.startedAt   ? new Date(submission.startedAt).getTime()   : 0;
    const submittedAt  = submission.submittedAt ? new Date(submission.submittedAt).getTime() : Date.now();
    const timeTakenSeconds = startedAt > 0 ? Math.round((submittedAt - startedAt) / 1000) : 0;

    // ── Build accessibility usage snapshot ────────────────────
    const ap = accessibilityProfile || {};
    const accessibilityUsage = {
        textToSpeech:        !!ap.textToSpeech,
        speechToText:        !!ap.speechToText,
        highContrast:        !!ap.highContrast,
        largeText:           !!ap.largeText,
        keywordHighlighting: !!ap.keywordHighlighting,
        stepByStepHints:     !!ap.stepByStepHints,
        visualMathAids:      !!ap.visualMathAids,
        numberSupport:       !!ap.numberSupport
    };

    return {
        assessmentId:     assessment._id,
        studentId:        submission.studentId,
        classId:          submission.classId,
        submissionId:     submission._id,
        totalMarks,
        obtainedMarks,
        score:            obtainedMarks,
        percentage,
        grade,
        totalQuestions:   questions.length,
        correctAnswers:   correct,
        incorrectAnswers: incorrect,
        skippedAnswers:   skipped,
        timeTakenSeconds,
        completedAt:      submission.submittedAt || new Date(),
        questionAnalysis,
        strengths:        [...strengthTopics],
        weaknesses:       [...weaknessTopics],
        recommendations:  [],
        accessibilityUsage,
        aiTutorUsed:      !!ap.numberSupport,
        hintsUsed:        0,
        evaluationStatus: 'evaluated'
    };
}

module.exports = { evaluateSubmission };
