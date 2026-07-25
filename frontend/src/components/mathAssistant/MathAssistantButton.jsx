/**
 * MathAssistantButton — Phase 6
 *
 * The entry point for the AI Math Assistant.
 *
 * Visibility rules (both enforced):
 *  1. Student's accessibilityProfile.numberSupport must be true
 *  2. The current question must be detected as mathematical
 *
 * If either condition is false → renders nothing.
 * Students never see labels explaining why the button appears.
 */

import React, { useState, useMemo } from 'react';
import { BrainCircuit } from 'lucide-react';
import { useAccessibilityEngine } from '../accessibility/AccessibilityEngine';
import MathAssistantModal from './MathAssistantModal';

// ── Client-side math detection (mirrors backend detector) ─────
// Kept lightweight — the backend validates on every request anyway.
const MATH_PATTERNS = [
    /\d+\s*[\+\-\*\/×÷]\s*\d+/,
    /\b(add|plus|sum|total|subtract|minus|difference|multiply|times|divide|product|quotient)\b/i,
    /\b(fraction|decimal|percent|ratio|area|perimeter|angle|equation|algebra|geometry)\b/i,
    /\d+\/\d+/,
    /\d+\.\d+/,
    /%/,
    /\b(how many|how much|how far|how long)\b.*\d/i,
    /\b(solve|calculate|compute|find the|what is)\b/i
];

function looksLikeMath(text) {
    if (!text) return false;
    return MATH_PATTERNS.some(p => p.test(text));
}

const MathAssistantButton = ({ question }) => {
    const a11y = useAccessibilityEngine();
    const [open, setOpen] = useState(false);

    // Gate 1: numberSupport must be ON
    if (!a11y.numberSupport) return null;

    // Gate 2: question must be mathematical
    const isMath = useMemo(() => looksLikeMath(question?.question), [question?.question]);
    if (!isMath) return null;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open visual learning assistant"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
                <BrainCircuit size={14} aria-hidden="true" />
                🧠 Explain This
            </button>

            <MathAssistantModal
                isOpen={open}
                onClose={() => setOpen(false)}
                question={question}
                accessibilityProfile={a11y}
            />
        </>
    );
};

export default MathAssistantButton;
