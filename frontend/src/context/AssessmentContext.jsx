/**
 * AssessmentContext — Phase 4
 *
 * Stores the student's Accessibility Profile in React context
 * ONLY during an active assessment attempt.
 *
 * The profile is loaded when the student clicks "Start Assessment"
 * and is returned by the /submissions/:id/start endpoint.
 *
 * IMPORTANT: This profile is NEVER displayed to the student.
 * Labels like "Dyslexia", "Dyscalculia", "Dysgraphia" are NEVER shown.
 * It is loaded here purely to prepare Phase 5 (Adaptive Tools Activation).
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const AssessmentContext = createContext(null);

export const useAssessment = () => useContext(AssessmentContext);

export const AssessmentProvider = ({ children }) => {
    // The accessibility profile received from the server on attempt start
    // Shape: { readingSupport, writingSupport, numberSupport, textToSpeech,
    //          speechToText, simplifiedReading, keywordHighlighting,
    //          visualMathAids, stepByStepHints, largeText, highContrast }
    const [accessibilityProfile, setAccessibilityProfile] = useState(null);

    // Current assessment metadata (questions, title, duration, etc.)
    const [currentAssessment, setCurrentAssessment] = useState(null);

    // Active submission document
    const [submission, setSubmission] = useState(null);

    // In-memory answers map: { [questionId]: answerString }
    const [answers, setAnswers] = useState({});

    /**
     * Called when the student successfully starts an attempt.
     * Stores the profile in context so AccessibilityEngine components
     * automatically activate the correct tools.
     *
     * The spread `{ ...profile }` ensures a new object reference is stored,
     * which guarantees the useMemo in useAccessibilityEngine re-evaluates.
     */
    const startAttempt = useCallback((assessment, submissionDoc, profile) => {
        setCurrentAssessment(assessment);
        setSubmission(submissionDoc);
        // Spread to new object — ensures React sees a reference change and
        // all child components that read accessibilityProfile re-render.
        setAccessibilityProfile(profile && typeof profile === 'object' ? { ...profile } : null);

        // Pre-populate answers from any previously saved data (resume)
        if (submissionDoc?.answers?.length) {
            const map = {};
            submissionDoc.answers.forEach(a => {
                map[a.questionId] = a.answer;
            });
            setAnswers(map);
        } else {
            setAnswers({});
        }
    }, []);

    /**
     * Update a single answer by questionId.
     */
    const updateAnswer = useCallback((questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    }, []);

    /**
     * Clear all assessment state (called on submit or unmount).
     */
    const clearAttempt = useCallback(() => {
        setCurrentAssessment(null);
        setSubmission(null);
        setAccessibilityProfile(null);
        setAnswers({});
    }, []);

    return (
        <AssessmentContext.Provider value={{
            accessibilityProfile,
            currentAssessment,
            submission,
            answers,
            startAttempt,
            updateAnswer,
            clearAttempt
        }}>
            {children}
        </AssessmentContext.Provider>
    );
};

export default AssessmentContext;
