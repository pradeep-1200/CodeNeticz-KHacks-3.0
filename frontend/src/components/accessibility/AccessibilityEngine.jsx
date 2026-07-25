/**
 * AccessibilityEngine — Phase 5
 *
 * Reads the student's accessibilityProfile from AssessmentContext
 * and provides adapted versions of:
 *   - QuestionRenderer  (question text + TTS + keyword highlighting)
 *   - AnswerInput       (textarea or SpeechToText input)
 *   - SupportTools      (hints + visual math aids)
 *
 * CRITICAL RULES:
 *  - Students NEVER see labels like "Reading Support", "Dyslexia", etc.
 *  - Tools activate automatically — no manual toggle exposed to the student.
 *  - All feature gates are derived solely from the accessibilityProfile.
 *  - largeText / highContrast applied via inline style overrides.
 */

import React, { useMemo } from 'react';
import { useAssessment }     from '../../context/AssessmentContext';
import TextToSpeechButton    from './TextToSpeechButton';
import KeywordHighlighter    from './KeywordHighlighter';
import SpeechToTextInput     from './SpeechToTextInput';
import StepByStepHint        from './StepByStepHint';
import VisualMathAid         from './VisualMathAid';

// ── Default profile (all features off) ────────────────────────
const DEFAULT_PROFILE = {
    readingSupport:      false,
    writingSupport:      false,
    numberSupport:       false,
    textToSpeech:        false,
    speechToText:        false,
    simplifiedReading:   false,
    keywordHighlighting: false,
    visualMathAids:      false,
    stepByStepHints:     false,
    largeText:           false,
    highContrast:        false
};

// ── High-contrast CSS variable overrides ──────────────────────
// Defined as a style object — CSS custom properties are valid in inline
// styles in all modern browsers and Tailwind's var() references pick them up.
const HIGH_CONTRAST_VARS = {
    '--bg-base':       '#000000',
    '--bg-surface':    '#111111',
    '--text-primary':  '#ffffff',
    '--text-secondary':'#d4d4d4',
    '--border-color':  '#4a4a4a',
    background:        '#000000',
    color:             '#ffffff'
};

/**
 * useAccessibilityEngine
 *
 * Hook that merges the loaded profile with defaults and exposes
 * resolved feature flags. Safe to call during loading — returns
 * all-false defaults until startAttempt() populates the context.
 *
 * The spread in AssessmentContext.startAttempt ensures a new object
 * reference is stored, so this useMemo re-evaluates after load.
 */
export function useAccessibilityEngine() {
    const ctx = useAssessment();
    // Guard: context may be null if rendered outside AssessmentProvider
    const accessibilityProfile = ctx?.accessibilityProfile ?? null;

    return useMemo(() => {
        if (!accessibilityProfile) return { ...DEFAULT_PROFILE };
        return {
            ...DEFAULT_PROFILE,
            ...accessibilityProfile
        };
    }, [accessibilityProfile]);
}

// ─────────────────────────────────────────────────────────────
// QuestionRenderer
// Renders question text with optional TTS button and keyword
// highlighting. Used in place of a plain <p> tag.
// ─────────────────────────────────────────────────────────────
export const QuestionRenderer = ({ question, className = '' }) => {
    const p = useAccessibilityEngine();
    const text = question?.question || '';

    // largeText sizing
    const textClass = p.largeText
        ? `text-xl md:text-2xl font-bold leading-relaxed ${className}`
        : `text-base md:text-lg font-bold leading-relaxed ${className}`;

    return (
        <div className="space-y-2">
            {/* TTS button — shown only when textToSpeech is enabled */}
            {p.textToSpeech && (
                <TextToSpeechButton text={text} />
            )}

            {/* Question text with optional keyword highlighting */}
            <p className={textClass} aria-label={text}>
                {p.keywordHighlighting
                    ? <KeywordHighlighter text={text} />
                    : text
                }
            </p>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// AnswerInput
// Wraps the appropriate input component based on the profile.
// writingSupport → SpeechToTextInput (with mic button)
// otherwise      → plain textarea
// ─────────────────────────────────────────────────────────────
export const AnswerInput = ({ question, value, onChange }) => {
    const p    = useAccessibilityEngine();
    const type = question?.type || 'mcq';

    // MCQ / True-False are handled by QuestionInput in the parent (radio/button UI)
    if (type === 'mcq' || type === 'multiple_choice' || type === 'true_false') return null;

    // Also catch True/False expressed as two-option MCQ
    if (
        question?.options?.length === 2 &&
        (question.options).map(o => o.toLowerCase()).join(',') === 'true,false'
    ) return null;

    const isShort  = type === 'text' || type === 'short_answer';
    const rows     = isShort ? (p.largeText ? 4 : 3) : (p.largeText ? 8 : 6);
    const maxLen   = isShort ? 1000 : 5000;
    const placeholder = isShort ? 'Type your short answer...' : 'Type your answer...';

    if (p.speechToText) {
        return (
            <SpeechToTextInput
                value={value}
                onChange={onChange}
                rows={rows}
                placeholder={placeholder}
                maxLength={maxLen}
                largeText={p.largeText}
            />
        );
    }

    const textSizeClass = p.largeText ? 'text-base' : 'text-sm';
    const paddingClass  = p.largeText ? 'p-5'       : 'p-4';

    return (
        <textarea
            className={`w-full ${paddingClass} bg-[var(--bg-base)] border border-[var(--border-color)] rounded-2xl ${textSizeClass} font-medium text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-indigo-500/60 resize-none transition-colors`}
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            maxLength={maxLen}
        />
    );
};

// ─────────────────────────────────────────────────────────────
// SupportTools
// Renders step-by-step hints and visual math aids beneath
// the question, based on the profile.
// ─────────────────────────────────────────────────────────────
export const SupportTools = ({ question }) => {
    const p    = useAccessibilityEngine();
    const hint = question?.hint || '';
    const text = question?.question || '';

    const showHint   = p.stepByStepHints && !!hint;
    const showVisual = p.visualMathAids;

    if (!showHint && !showVisual) return null;

    return (
        <div className="flex flex-wrap gap-2 pt-1">
            {showHint   && <StepByStepHint hint={hint} />}
            {showVisual && <VisualMathAid  questionText={text} />}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// HighContrastWrapper
// Applies high-contrast CSS variable overrides to its subtree.
// Wraps the entire attempt page body when highContrast = true.
// ─────────────────────────────────────────────────────────────
export const HighContrastWrapper = ({ children }) => {
    const p = useAccessibilityEngine();

    if (!p.highContrast) return <>{children}</>;

    return (
        <div style={HIGH_CONTRAST_VARS} className="transition-colors duration-300">
            {children}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// LargeTextWrapper
// Applies a larger base font-size scale to its subtree.
// Used around the question card body when largeText = true.
// ─────────────────────────────────────────────────────────────
export const LargeTextWrapper = ({ children }) => {
    const p = useAccessibilityEngine();
    if (!p.largeText) return <>{children}</>;
    return (
        <div style={{ fontSize: '1.125rem', lineHeight: '1.8' }}>
            {children}
        </div>
    );
};

export default {
    QuestionRenderer,
    AnswerInput,
    SupportTools,
    HighContrastWrapper,
    LargeTextWrapper,
    useAccessibilityEngine
};
